import React from 'react';
import { flatNavItems, FlatNavItem } from './../../../config/navigationConfig'; // adjust import

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
interface AccessEntry {
  id: number;
  user_id: number;
  location_id: number;
  parent_path_number: number;
  child_path_number: number;
}

interface Location {
  id: number;
  type: number;
  name: string;
  locationid: number;
  address: string;
  is_active?: number;
  is_admin?: number;
}

interface Role {
  id: number;
  type: number;
  name: string;
  description: string;
  isActive: number;
  location_id?: number | string | null; // may be string or null from API
}

interface UserData {
  id: number;
  first_name: string;
  last_name: string;
  locations: Location[];
  roles: Role[];
  access: AccessEntry[];
}

// ------------------------------------------------------------------
// Component Props
// ------------------------------------------------------------------
interface AccessTableProps {
  user: UserData;
}

// ------------------------------------------------------------------
// Navigation helpers
// ------------------------------------------------------------------
const navMap = new Map<string, FlatNavItem>();
flatNavItems.forEach((item) => {
  const key = `${item.parent_path_number}-${item.child_path_number}`;
  navMap.set(key, item);
});

function getNavDisplayName(parent: number, child: number): string {
  const key = `${parent}-${child}`;
  const item = navMap.get(key);
  if (!item) return `Menu ${parent}-${child}`;
  return item.name;
}

function getParentName(parent: number): string {
  const key = `${parent}-0`;
  const item = navMap.get(key);
  return item ? item.name : `Menu ${parent}`;
}

// ------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------
export const AccessTable: React.FC<AccessTableProps> = ({ user }) => {
  // Group access by location
  const accessByLocation = new Map<number, AccessEntry[]>();
  user.access.forEach((entry) => {
    const locId = entry.location_id;
    if (!accessByLocation.has(locId)) {
      accessByLocation.set(locId, []);
    }
    accessByLocation.get(locId)!.push(entry);
  });

  // Build rows
  const rows = user.locations.map((location) => {
    const locId = location.id;
    const accessEntries = accessByLocation.get(locId) || [];

    // Admin check
    const isAdmin = location.is_admin === 1 || location.is_active === 1;

    // ---- Roles (with numeric conversion + dedupe) ----
    let filteredRoles: Role[];
    if (isAdmin) {
      filteredRoles = user.roles;
    } else {
      filteredRoles = user.roles.filter((role) => {
        // Convert to number, treat null/undefined as global
        const roleLocId = role.location_id != null ? Number(role.location_id) : undefined;
        const locationIdNum = Number(locId);
        // Global roles have no location_id → include
        if (roleLocId === undefined) return true;
        // Strict numeric comparison
        return roleLocId === locationIdNum;
      });
    }
    // Deduplicate by role id
    const uniqueRoles = Array.from(
      new Map(filteredRoles.map((role) => [role.id, role])).values()
    );

    // ---- Access Granted ----
    let accessDisplay: string;
    if (isAdmin) {
      accessDisplay = 'Full Access';
    } else {
      const parentGroups = new Map<number, { parentName: string; childNames: string[] }>();
      accessEntries.forEach((entry) => {
        const parent = entry.parent_path_number;
        const child = entry.child_path_number;

        if (!parentGroups.has(parent)) {
          parentGroups.set(parent, {
            parentName: getParentName(parent),
            childNames: [],
          });
        }

        if (child !== 0) {
          const childName = getNavDisplayName(parent, child);
          if (childName) {
            parentGroups.get(parent)!.childNames.push(childName);
          }
        }
      });

      const accessParts: string[] = [];
      parentGroups.forEach((group) => {
        const { parentName, childNames } = group;
        if (childNames.length > 0) {
          accessParts.push(`${parentName} (${childNames.join(', ')})`);
        } else {
          accessParts.push(parentName);
        }
      });
      accessDisplay = accessParts.length > 0 ? accessParts.join('; ') : 'No access';
    }

    return {
      locationName: `${location.name} (ID: ${location.id})`,
      roles: uniqueRoles,
      access: accessDisplay,
      isAdmin,
    };
  });

  // Stats
  const totalLocations = rows.length;
  const totalRoles = user.roles.length;
  const totalAccessible = rows.filter((r) => r.access !== 'No access').length;

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
        No location data available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Locations</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalLocations}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Roles</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalRoles}</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Locations with Access</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {totalAccessible} / {totalLocations}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Access Granted
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {rows.map((row, idx) => (
              <tr
                key={idx}
                className={`transition-colors hover:bg-blue-50 dark:hover:bg-gray-700/50 ${
                  idx % 2 === 0
                    ? 'bg-white dark:bg-gray-800'
                    : 'bg-gray-50/50 dark:bg-gray-700/30'
                }`}
              >
                <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    {row.isAdmin && (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                        Admin
                      </span>
                    )}
                    {row.locationName}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {row.roles.length > 0 ? (
                      row.roles.map((role) => (
                        <span
                          key={role.id}
                          className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                        >
                          {role.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">No roles</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {row.access}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccessTable;