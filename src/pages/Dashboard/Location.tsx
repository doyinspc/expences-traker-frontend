// src/pages/Dashboard/Landing.tsx

import React, { useState } from 'react';
import { 
  MapPin, 
  ChevronDown, 
  Building, 
  Store, 
  Warehouse, 
  Factory,
  Users,
  Briefcase,
  Globe,
  Check,
  Settings,
  LogOut,
  Bell,
  User,
  Shield,
  UserCog,
  UserCheck,
  UserMinus,
  UserPlus,
  ArrowRight,
  X,
  ChevronLeft
} from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import { useDispatch, useSelector } from 'react-redux';
import { API_PATHS } from '../../actions/common';
import { authActions } from '../../actions/auth';

// ============ LOCATION DATA ============
interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  isActive?: boolean;
  isDefault?: boolean;
  metrics?: {
    employees: number;
    departments: number;
    activeProjects: number;
  };
}

interface Role {
  id: string;
  name: string;
  location_id: string; // This links to location.id
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

// ============ USER PROFILE CARD ============
const UserProfileCard = () => {
  const { user } = useSelector((state: any) => state.auth);
  const { roles } = useSelector((state: any) => state.auth);
  const { first_name, last_name, email, locations, phone, photo } = user || {};
  const photo_url = photo ? API_PATHS + photo : null;
  const fullname = first_name + " " + last_name;
  
  const [showMenu, setShowMenu] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 text-white shadow-xl">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl animate-pulse delay-500" />
        
        {/* Decorative dots */}
        <div className="absolute top-10 right-20 grid grid-cols-4 gap-2 opacity-20">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="h-1 w-1 rounded-full bg-white" />
          ))}
        </div>
        <div className="absolute bottom-10 left-20 grid grid-cols-5 gap-2 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="h-1 w-1 rounded-full bg-white" />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-4 ring-white/30">
                {photo_url ? (
                  <img
                    src={photo_url}
                    alt={fullname || 'User'}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {getInitials(fullname)}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-400 p-1.5 ring-2 ring-white">
                <div className="h-2.5 w-2.5 rounded-full bg-white" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {fullname || 'Guest User'}
              </h2>
              <p className="text-sm text-white/80 flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {email || 'guest@example.com'}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur-sm">
                  <Users className="h-3 w-3" />
                  Admin
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur-sm">
                  <Globe className="h-3 w-3" />
                  {locations?.length || 0} Locations
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative rounded-full bg-white/20 p-2 backdrop-blur-sm transition hover:bg-white/30">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">
                8
              </span>
            </button>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="relative rounded-full bg-white/20 p-2 backdrop-blur-sm transition hover:bg-white/30"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/20 pt-6">
          <div>
            <p className="text-sm text-white/70">Total Locations</p>
            <p className="text-2xl font-bold">{locations?.length || 0}</p>
          </div>
          <div>
            <p className="text-sm text-white/70">Total Roles</p>
            <p className="text-2xl font-bold">
              {locations?.reduce((total: number, loc: Location) => {
                // Filter roles by location_id matching this location's id
                const locationRoles = roles?.filter((role: Role) => role.location_id === loc.id) || [];
                return total + locationRoles.length;
              }, 0) || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-white/70">Total Employees</p>
            <p className="text-2xl font-bold">567</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ LOCATION CARD ============
interface LocationCardProps {
  location: Location;
  isSelected: boolean;
  onSelect: (location: Location) => void;
  roleCount: number;
}

const LocationCard: React.FC<LocationCardProps> = ({ 
  location, 
  isSelected, 
  onSelect,
  roleCount
}) => {
 
  const Icon = Building;
  const gradientColor = 'from-purple-500 to-pink-500';

  return (
    <div
      onClick={() => onSelect(location)}
      className={`
        group relative cursor-pointer overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300
        ${isSelected 
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-lg shadow-blue-500/20' 
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/50'
        }
      `}
    >
      {/* Gradient background accent */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-0 transition-opacity duration-300
        ${isSelected ? 'opacity-5' : 'group-hover:opacity-5'}
      `} />

      {/* Status indicator */}
      <div className="absolute right-4 top-4 flex items-center gap-1.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active</span>
      </div>

      {location.isDefault && (
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Default
          </span>
        </div>
      )}

      <div className="relative">
        {/* Icon */}
        <div className={`
          mb-4 inline-flex rounded-xl p-3 transition-all duration-300
          ${isSelected 
            ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30' 
            : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-gray-800 dark:text-gray-400'
          }
        `}>
          <Icon className="h-6 w-6" />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {location.name}
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {location.city}
        </p>
        <div className="mt-2 flex items-start gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>
            {location.address}, {location.city}
          </span>
        </div>

        {/* Role count badge */}
        <div className="mt-4 flex items-center gap-2 border-t border-gray-200 pt-4 dark:border-gray-800">
          <Shield className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {roleCount} {roleCount === 1 ? 'Role' : 'Roles'} available
          </span>
        </div>

        {/* Selected checkmark */}
        {isSelected && (
          <div className="absolute bottom-4 right-4 rounded-full bg-blue-600 p-1 text-white shadow-lg">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
};

// ============ ROLE CARD ============
interface RoleCardProps {
  role: Role;
  isSelected: boolean;
  onSelect: (role: Role) => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ 
  role, 
  isSelected, 
  onSelect 
}) => {
  const getRoleIcon = (roleName: string) => {
    const name = roleName?.toLowerCase() || '';
    if (name.includes('admin')) return <Shield className="h-5 w-5" />;
    if (name.includes('manager')) return <UserCog className="h-5 w-5" />;
    if (name.includes('supervisor')) return <UserCheck className="h-5 w-5" />;
    if (name.includes('user')) return <User className="h-5 w-5" />;
    return <UserPlus className="h-5 w-5" />;
  };

  const getRoleColor = (roleName: string) => {
    const name = roleName?.toLowerCase() || '';
    if (name.includes('admin')) return 'from-red-500 to-pink-500';
    if (name.includes('manager')) return 'from-purple-500 to-indigo-500';
    if (name.includes('supervisor')) return 'from-blue-500 to-cyan-500';
    if (name.includes('user')) return 'from-emerald-500 to-teal-500';
    return 'from-gray-500 to-gray-600';
  };

  const gradientColor = getRoleColor(role.name);

  return (
    <div
      onClick={() => onSelect(role)}
      className={`
        group relative cursor-pointer overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300
        ${isSelected 
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-lg shadow-blue-500/20' 
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/50'
        }
      `}
    >
      {/* Gradient background accent */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-0 transition-opacity duration-300
        ${isSelected ? 'opacity-5' : 'group-hover:opacity-5'}
      `} />

      {/* Status indicator */}
      <div className="absolute right-4 top-4 flex items-center gap-1.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active</span>
      </div>

      {role.isDefault && (
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Default
          </span>
        </div>
      )}

      <div className="relative">
        {/* Icon */}
        <div className={`
          mb-4 inline-flex rounded-xl p-3 transition-all duration-300
          ${isSelected 
            ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30' 
            : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-gray-800 dark:text-gray-400'
          }
        `}>
          {getRoleIcon(role.name)}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {role.name}
        </h3>
        {role.description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {role.description}
          </p>
        )}

        {/* Selected checkmark */}
        {isSelected && (
          <div className="absolute bottom-4 right-4 rounded-full bg-blue-600 p-1 text-white shadow-lg">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
};

// ============ CURRENT LOCATION BADGE ============
const CurrentLocationBadge: React.FC<{ location: Location | null }> = ({ location }) => {
  if (!location) {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        <Building className="h-4 w-4" />
        <span className="text-sm font-medium">No Location</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-1.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
      <Building className="h-4 w-4" />
      <span className="text-sm font-medium">{location.name}</span>
    </div>
  );
};

// ============ CURRENT ROLE BADGE ============
const CurrentRoleBadge: React.FC<{ role: Role | null }> = ({ role }) => {
  if (!role) {
    return (
      <div className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        <Shield className="h-4 w-4" />
        <span className="text-sm font-medium">No Role</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-lg bg-purple-100 px-3 py-1.5 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
      <Shield className="h-4 w-4" />
      <span className="text-sm font-medium">{role.name}</span>
    </div>
  );
};

// ============ MAIN LANDING PAGE ============
export default function Landing() {
  const dispatch = useDispatch();
  const { locations, location, roles, role } = useSelector((state: any) => state.auth);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(location);
  const [selectedRole, setSelectedRole] = useState<Role | null>(role);
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  // Filter roles by location_id matching selected location's id
  const getRolesForLocation = (locationId: string) => {
    if (!roles || !Array.isArray(roles)) return [];
    return roles.filter((r: Role) => r.location_id === locationId);
  };

  // Handle location selection - minimizes locations and shows roles
  const handleSelectLocation = (loc: Location) => {
    setSelectedLocation(loc);
    const locationRoles = getRolesForLocation(loc.id);
    setShowRoleSelection(true);
    // Auto-select first role if only one available
    if (locationRoles.length === 1) {
      handleSelectRole(locationRoles[0]);
    }
  };

  // Handle role selection - updates Redux and closes role selection
  const handleSelectRole = (selectedRole: Role) => {
    setSelectedRole(selectedRole);
    dispatch(authActions.tenantSwitchLocation(selectedLocation));
    dispatch(authActions.tenantSwitchRole(selectedRole));
    // Close role selection after a moment
    setTimeout(() => {
      setShowRoleSelection(false);
    }, 500);
  };

  // Handle back to locations
  const handleBackToLocations = () => {
    setShowRoleSelection(false);
  };

  // Calculate total roles across all locations (filtered by location_id)
  const totalRoles = locations?.reduce((total: number, loc: Location) => {
    const locationRoles = getRolesForLocation(loc.id);
    return total + locationRoles.length;
  }, 0) || 0;

  // Get roles for selected location
  const locationRoles = selectedLocation ? getRolesForLocation(selectedLocation.id) : [];

  return (
    <>
      <PageMeta
        title="Welcome | Dashboard"
        description="Select your location and start managing your procurement operations"
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 dark:from-gray-900 dark:to-gray-800">
        <div className="mx-auto max-w-7xl">
          {/* Header with location & role switcher */}
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome Back!
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Manage your procurement operations across all locations
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <CurrentLocationBadge location={selectedLocation || location} />
              <CurrentRoleBadge role={selectedRole || role} />
            </div>
          </div>

          {/* User Profile Card */}
          <div className="mb-8">
            <UserProfileCard />
          </div>

          {/* Location & Role Selection Area */}
          <div className="mb-8">
            {/* Header with back button if showing roles */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {showRoleSelection ? (
                  <span className="flex items-center gap-2">
                    <button
                      onClick={handleBackToLocations}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors dark:hover:bg-gray-800"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-500" />
                    </button>
                    <span>Select Role for <span className="text-blue-600">{selectedLocation?.name}</span></span>
                  </span>
                ) : (
                  'Your Locations'
                )}
              </h2>
              {!showRoleSelection && (
                <button 
                  onClick={() => setShowRoleSelection(false)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  {locations?.length || 0} Locations
                </button>
              )}
            </div>

            {/* Location Cards - Minimized when role selection is shown */}
            <div className={`grid gap-4 transition-all duration-300 ${
              showRoleSelection 
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 opacity-50 scale-95' 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}>
              {locations?.slice(0, showRoleSelection ? 3 : 4).map((loc: Location) => {
                const isSelected = selectedLocation?.id === loc.id;
                const roleCount = getRolesForLocation(loc.id).length;
                const Icon = Building;
                const gradientColor = 'from-purple-500 to-pink-500';

                return (
                  <div
                    key={loc.id}
                    onClick={() => !showRoleSelection && handleSelectLocation(loc)}
                    className={`
                      group relative overflow-hidden rounded-xl border p-4 text-left transition-all
                      ${isSelected && showRoleSelection 
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-lg shadow-blue-500/20' 
                        : showRoleSelection
                          ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30 opacity-60'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/50 cursor-pointer'
                      }
                    `}
                  >
                    <div className={`
                      absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-0 transition-opacity duration-300
                      ${isSelected && showRoleSelection ? 'opacity-5' : 'group-hover:opacity-5'}
                    `} />

                    <div className="relative flex items-center gap-3">
                      <div className={`
                        rounded-lg p-2 transition-colors
                        ${isSelected && showRoleSelection 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white' 
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }
                      `}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {loc.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {loc.city} • {roleCount} {roleCount === 1 ? 'role' : 'roles'}
                        </p>
                      </div>
                      {isSelected && showRoleSelection && (
                        <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      )}
                      {!showRoleSelection && (
                        <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Role Selection - Appears when location is selected */}
            {showRoleSelection && selectedLocation && (
              <div className="mt-6 animate-slideDown">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {locationRoles.length > 0 ? (
                    locationRoles.map((role: Role) => (
                      <RoleCard
                        key={role.id}
                        role={role}
                        isSelected={selectedRole?.id === role.id}
                        onSelect={handleSelectRole}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <Shield className="h-12 w-12 mx-auto mb-3 text-gray-400 opacity-30" />
                      <p className="text-gray-500 dark:text-gray-400">No roles available for this location</p>
                      <button
                        onClick={handleBackToLocations}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        ← Back to locations
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick action buttons */}
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={handleBackToLocations}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ← Change Location
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white shadow-lg shadow-blue-500/30">
              <p className="text-sm opacity-90">Total Locations</p>
              <p className="mt-1 text-2xl font-bold">
                {locations?.length || 0}
              </p>
              <p className="mt-1 text-xs opacity-70">Across all regions</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-4 text-white shadow-lg shadow-purple-500/30">
              <p className="text-sm opacity-90">Total Roles</p>
              <p className="mt-1 text-2xl font-bold">{totalRoles}</p>
              <p className="mt-1 text-xs opacity-70">Across all locations</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-4 text-white shadow-lg shadow-emerald-500/30">
              <p className="text-sm opacity-90">Active Projects</p>
              <p className="mt-1 text-2xl font-bold">45</p>
              <p className="mt-1 text-xs opacity-70">80% completion rate</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-4 text-white shadow-lg shadow-amber-500/30">
              <p className="text-sm opacity-90">Departments</p>
              <p className="mt-1 text-2xl font-bold">33</p>
              <p className="mt-1 text-xs opacity-70">Across all locations</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-8 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-xl">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div>
                <h3 className="text-xl font-bold">Ready to start working?</h3>
                <p className="mt-1 text-white/80">
                  {selectedLocation && selectedRole 
                    ? `Working as ${selectedRole.name} in ${selectedLocation.name}` 
                    : selectedLocation 
                      ? `Select a role for ${selectedLocation.name} to continue`
                      : 'Select a location to begin managing your procurement tasks'}
                </p>
              </div>
              <button
                onClick={() => {
                  if (selectedLocation) {
                    setShowRoleSelection(true);
                  } else {
                    setShowRoleSelection(false);
                  }
                }}
                className="rounded-full bg-white px-6 py-2.5 font-medium text-blue-600 transition hover:shadow-lg hover:scale-105"
              >
                {selectedLocation && selectedRole 
                  ? 'Switch Location/Role' 
                  : selectedLocation 
                    ? 'Select Role' 
                    : 'Select Location'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add slide-down animation */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
}