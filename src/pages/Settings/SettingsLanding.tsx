// src/pages/settings/SettingsLanding.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Banknote,
  Database,
  Settings,
  UserCog,
  Building2,
  MapPin,
  User,
  Lock,
  CreditCard,
  Globe,
  FileText,
  Activity,
  ThumbsUp,
  ClipboardList,
  Flag,
  GitBranch,
  Bell,
  ArrowUpCircle,
  XCircle,
  Folder,
  ChevronRight,
  LayoutGrid,
  Shield,
  UserCheck,
  UserPlus,
} from 'lucide-react';

// ============================================
// SETTINGS CONFIGURATION OBJECT
// ============================================
interface SettingItem {
  id: number;
  name: string;
  path: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  isActive?: boolean;
  isNew?: boolean;
  isPro?: boolean;
}

interface SettingGroup {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  items: SettingItem[];
}

export const settingsConfig: SettingGroup[] = [
  // ============================================
  // User Management (grp 1-7)
  // ============================================
  {
    id: 'user-management',
    name: 'User Management',
    icon: <Users size={24} />,
    description: 'Manage user roles, departments, locations, and access controls across the organization.',
    items: [
      {
        id: 1,
        name: 'Roles',
        path: '/setting/roles/1',
        icon: <UserCog size={20} />,
        description: 'Define and manage user roles with specific permissions and approval limits.',
        features: [
          'Create custom roles with specific permissions',
          'Set approval limits for each role',
          'Assign roles to users',
          'Define escalation paths for role hierarchies',
        ],
      },
      {
        id: 2,
        name: 'Departments',
        path: '/setting/departments/2',
        icon: <Building2 size={20} />,
        description: 'Manage organizational departments, their budgets, and reporting structures.',
        features: [
          'Create and manage departments',
          'Set department budgets and cost centers',
          'Assign department heads',
          'Link departments to locations',
        ],
      },
      {
        id: 3,
        name: 'Locations',
        path: '/setting/locations/3',
        icon: <MapPin size={20} />,
        description: 'Manage physical locations, branches, and offices across the organization.',
        features: [
          'Add and manage physical locations',
          'Set location-specific settings',
          'Link departments to locations',
          'Track location-based analytics',
        ],
      },
      {
        id: 4,
        name: 'User Locations',
        path: '/setting/userlocations/4',
        icon: <MapPin size={20} />,
        description: 'Assign users to specific locations for access control and reporting.',
        features: [
          'Assign users to locations',
          'Set location-based access controls',
          'Track location-specific user activity',
          'Manage location-based permissions',
        ],
      },
      {
        id: 5,
        name: 'User Departments',
        path: '/setting/userdepartments/5',
        icon: <Building2 size={20} />,
        description: 'Assign users to departments for organizational structure and reporting.',
        features: [
          'Assign users to departments',
          'Set department-based reporting lines',
          'Manage department-specific permissions',
          'Track department-based metrics',
        ],
      },
      {
        id: 6,
        name: 'User Managers',
        path: '/setting/usermanagers/6',
        icon: <UserCheck size={20} />,
        description: 'Define manager relationships and reporting hierarchies.',
        features: [
          'Set manager-employee relationships',
          'Define reporting hierarchies',
          'Configure delegation rules',
          'Manage approval chains',
        ],
      },
      {
        id: 7,
        name: 'User Access',
        path: '/setting/useraccess/7',
        icon: <Lock size={20} />,
        description: 'Configure user access controls, permissions, and security settings.',
        features: [
          'Define access control lists (ACLs)',
          'Set module-specific permissions',
          'Configure role-based access control (RBAC)',
          'Manage session and security policies',
        ],
        isNew: true,
      },
    ],
  },

  // ============================================
  // Financial Settings (grp 8-9)
  // ============================================
  {
    id: 'financial-settings',
    name: 'Financial Settings',
    icon: <Banknote size={24} />,
    description: 'Configure financial settings including expense types, currencies, and accounting rules.',
    items: [
      {
        id: 8,
        name: 'Expense Types',
        path: '/setting/expensetypes/8',
        icon: <CreditCard size={20} />,
        description: 'Define and manage expense categories for financial tracking and reporting.',
        features: [
          'Create expense categories',
          'Set budget limits per expense type',
          'Configure approval rules per expense type',
          'Track expense analytics',
        ],
      },
      {
        id: 9,
        name: 'Currency',
        path: '/setting/currency/9',
        icon: <Globe size={20} />,
        description: 'Manage currencies, exchange rates, and currency formatting for the system.',
        features: [
          'Add and manage currencies',
          'Set exchange rates',
          'Configure currency formatting',
          'Set default currency for the system',
          'Support multi-currency transactions',
        ],
      },
    ],
  },

  // ============================================
  // Reference Data (grp 10-19)
  // ============================================
  {
    id: 'reference-data',
    name: 'Reference Data',
    icon: <Database size={24} />,
    description: 'Manage system reference data including document types, workflow statuses, and approval actions.',
    items: [
      {
        id: 10,
        name: 'Document Types',
        path: '/setting/documenttypes/10',
        icon: <FileText size={20} />,
        description: 'Define document types used across the system for classification and workflows.',
        features: [
          'Create document types (Requisition, PO, Cash Advance, etc.)',
          'Configure document-specific workflows',
          'Set document type permissions',
          'Define document numbering schemes',
        ],
      },
      {
        id: 11,
        name: 'Workflow Status',
        path: '/setting/workflowstatus/11',
        icon: <Activity size={20} />,
        description: 'Manage workflow statuses that track document progress through approval processes.',
        features: [
          'Define workflow statuses (Pending, Approved, Rejected, etc.)',
          'Set status colors and icons for UI',
          'Configure status transitions',
          'Define terminal statuses',
        ],
      },
      {
        id: 12,
        name: 'Approval Actions',
        path: '/setting/approvalactions/12',
        icon: <ThumbsUp size={20} />,
        description: 'Configure actions that can be taken during the approval process.',
        features: [
          'Define approval actions (Approve, Reject, Escalate, etc.)',
          'Set action requirements (comments, passwords)',
          'Configure action-based status changes',
          'Define action permissions',
        ],
      },
      {
        id: 13,
        name: 'Document Status',
        path: '/setting/documentstatus/13',
        icon: <ClipboardList size={20} />,
        description: 'Manage document-specific statuses for different document types.',
        features: [
          'Define document statuses per document type',
          'Set document status transitions',
          'Configure document lifecycles',
          'Define terminal document statuses',
        ],
      },
      {
        id: 14,
        name: 'Priority Levels',
        path: '/setting/prioritylevels/14',
        icon: <Flag size={20} />,
        description: 'Manage priority levels for workflow items and requests.',
        features: [
          'Define priority levels (Low, Medium, High, Urgent, Critical)',
          'Set priority weights for sorting',
          'Configure response time expectations',
          'Define priority-based workflows',
        ],
      },
      {
        id: 15,
        name: 'Workflow Types',
        path: '/setting/workflowtypes/15',
        icon: <GitBranch size={20} />,
        description: 'Define workflow patterns and approval process types.',
        features: [
          'Define workflow types (Serial, Parallel, Hybrid)',
          'Configure workflow patterns',
          'Set approval chain types',
          'Define conditional workflows',
        ],
      },
      {
        id: 16,
        name: 'Notification Types',
        path: '/setting/notificationtypes/16',
        icon: <Bell size={20} />,
        description: 'Manage notification types and their delivery preferences.',
        features: [
          'Define notification types',
          'Configure notification delivery methods',
          'Set notification templates',
          'Define notification triggers',
        ],
        isNew: true,
      },
      {
        id: 17,
        name: 'Escalation Reasons',
        path: '/setting/escalationreasons/17',
        icon: <ArrowUpCircle size={20} />,
        description: 'Define reasons for workflow escalation and their handling.',
        features: [
          'Define escalation reasons',
          'Configure escalation paths',
          'Set escalation rules',
          'Define escalation notifications',
        ],
      },
      {
        id: 18,
        name: 'Rejection Reasons',
        path: '/setting/rejectionreasons/18',
        icon: <XCircle size={20} />,
        description: 'Manage reasons for workflow rejection and their reporting.',
        features: [
          'Define rejection reasons',
          'Track rejection analytics',
          'Configure rejection workflows',
          'Set rejection notifications',
        ],
      },
      {
        id: 19,
        name: 'Document Categories',
        path: '/setting/documentcategories/19',
        icon: <Folder size={20} />,
        description: 'Organize documents into categories for better classification and retrieval.',
        features: [
          'Define document categories',
          'Configure category hierarchies',
          'Set category-based permissions',
          'Track category analytics',
        ],
      },
    ],
  },

  // ============================================
  // System Settings
  // ============================================
  {
    id: 'system-settings',
    name: 'System Settings',
    icon: <Settings size={24} />,
    description: 'Configure system-wide settings, workflows, and administrative controls.',
    items: [
      {
        id: 20,
        name: 'Company Profile',
        path: '/setting/company-profile',
        icon: <LayoutGrid size={20} />,
        description: 'Manage company information, branding, and organizational details.',
        features: [
          'Update company information',
          'Configure branding settings',
          'Set organizational details',
          'Manage system-wide configurations',
        ],
      },
      {
        id: 21,
        name: 'Approval Workflows',
        path: '/setting/workflows',
        icon: <Activity size={20} />,
        description: 'Design and manage approval workflows for different document types.',
        features: [
          'Create workflow templates',
          'Define approval steps',
          'Configure conditional branching',
          'Set workflow escalation rules',
        ],
      },
      {
        id: 22,
        name: 'Chart of Accounts',
        path: '/setting/chart-of-accounts',
        icon: <CreditCard size={20} />,
        description: 'Manage the Chart of Accounts for financial tracking and reporting.',
        features: [
          'Define account types',
          'Create account hierarchies',
          'Configure account mappings',
          'Manage financial accounts',
        ],
        isPro: true,
      },
      {
        id: 23,
        name: 'Tax & Deductions',
        path: '/setting/taxes',
        icon: <CreditCard size={20} />,
        description: 'Configure tax rates, deductions, and financial regulations.',
        features: [
          'Define tax rates',
          'Configure deduction types',
          'Set tax rules',
          'Manage tax compliance',
        ],
        isPro: true,
      },
      {
        id: 24,
        name: 'Audit Trail',
        path: '/setting/audit',
        icon: <Shield size={20} />,
        description: 'View and manage system audit logs for compliance and monitoring.',
        features: [
          'View audit logs',
          'Filter logs by user, action, or module',
          'Export audit reports',
          'Configure audit retention policies',
        ],
      },
    ],
  },
];

// ============================================
// SETTINGS LANDING PAGE COMPONENT
// ============================================
const SettingsLanding: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Configure and manage all system settings, user preferences, and reference data.
        </p>
      </div>

      {/* Settings Groups */}
      <div className="space-y-12">
        {settingsConfig.map((group) => (
          <div key={group.id}>
            {/* Group Header */}
            <div className="flex items-start gap-4 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
                {group.icon}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {group.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {group.description}
                </p>
              </div>
            </div>

            {/* Settings Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className="group block p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.name}
                        </h3>
                        {item.isNew && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            New
                          </span>
                        )}
                        {item.isPro && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                            Pro
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-primary-600 dark:text-primary-400 group-hover:font-medium">
                        Configure <ChevronRight size={14} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {settingsConfig.reduce((acc, group) => acc + group.items.length, 0)} settings available
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              {settingsConfig.filter(g => g.items.some(i => i.isNew)).length} new
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-purple-500"></span>
              {settingsConfig.filter(g => g.items.some(i => i.isPro)).length} pro
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLanding;