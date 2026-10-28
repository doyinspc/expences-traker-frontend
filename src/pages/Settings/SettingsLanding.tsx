// src/pages/settings/SettingsLanding.tsx

import React, { useState } from 'react';
import { Link } from 'react-router';
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
  Building,
  DollarSign,
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
  detailedDescription: string;
  features: string[];
  benefits: string[];
  isActive?: boolean;
  isNew?: boolean;
  isPro?: boolean;
  setupTime?: string;
  usage?: string;
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
    description: 'Complete control over user access, roles, departments, and organizational structure.',
    items: [
      {
        id: 1,
        name: 'Roles',
        path: '/setting/page/1',
        icon: <UserCog size={20} />,
        description: 'Define role-based permissions and access controls',
        detailedDescription: 'Create and manage user roles with granular permissions. Configure approval limits, escalation paths, and role hierarchies to ensure proper access control across your organization.',
        features: [
          'Create custom roles with specific permissions matrix',
          'Set approval limits and spending thresholds per role',
          'Assign roles to individual users or departments',
          'Define escalation paths for role hierarchies',
          'Clone existing roles for quick setup',
          'Audit role changes and assignments'
        ],
        benefits: [
          'Granular access control reduces security risks',
          'Streamlined approval workflows',
          'Easy role management and scaling',
          'Clear separation of duties'
        ],
        setupTime: '15-30 minutes',
        usage: 'Essential for all organizations'
      },
      {
        id: 2,
        name: 'Departments',
        path: '/setting/page/2',
        icon: <Building2 size={20} />,
        description: 'Manage organizational departments and budgets',
        detailedDescription: 'Configure your organizational structure by creating departments, setting budgets, and defining reporting relationships. Link departments to locations and assign department heads for clear accountability.',
        features: [
          'Create and manage hierarchical departments',
          'Set departmental budgets and cost centers',
          'Assign department heads and managers',
          'Link departments to physical locations',
          'Configure department-specific workflows',
          'Track department performance metrics'
        ],
        benefits: [
          'Clear organizational structure',
          'Better budget management and tracking',
          'Improved departmental accountability',
          'Streamlined reporting lines'
        ],
        setupTime: '20-40 minutes',
        usage: 'Essential for all organizations'
      },
      {
        id: 3,
        name: 'Locations',
        path: '/setting/page/4',
        icon: <MapPin size={20} />,
        description: 'Manage physical locations and branches',
        detailedDescription: 'Set up and manage your organization\'s physical locations, branches, and offices. Configure location-specific settings, assign departments to locations, and track location-based analytics for better operational insights.',
        features: [
          'Add and manage multiple locations',
          'Set location-specific settings and configurations',
          'Link departments and users to locations',
          'Track location-based analytics and metrics',
          'Configure location-specific approval workflows',
          'Manage inventory per location'
        ],
        benefits: [
          'Centralized location management',
          'Better resource allocation',
          'Location-based reporting and analytics',
          'Improved operational efficiency'
        ],
        setupTime: '15-25 minutes',
        usage: 'Recommended for multi-location organizations'
      },
      {
        id: 4,
        name: 'User',
        path: '/setting/user',
        icon: <User size={20} />,
        description: 'Manage user accounts and profiles',
        detailedDescription: 'Comprehensive user management system to create, update, and manage user accounts. Configure user profiles, assign roles, set permissions, and manage user lifecycle from onboarding to offboarding.',
        features: [
          'Create and manage user accounts',
          'Assign roles and permissions',
          'Configure user profiles and preferences',
          'Manage user lifecycle (onboarding/offboarding)',
          'Set up user authentication methods',
          'Track user activity and analytics'
        ],
        benefits: [
          'Centralized user management',
          'Efficient onboarding/offboarding',
          'Enhanced security control',
          'Better user lifecycle management'
        ],
        setupTime: '20-30 minutes',
        usage: 'Essential for all organizations'
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
    description: 'Configure financial rules, expense management, and currency settings.',
    items: [
      {
        id: 5,
        name: 'Expense Types',
        path: '/setting/page/5',
        icon: <CreditCard size={20} />,
        description: 'Define and manage expense categories',
        detailedDescription: 'Create comprehensive expense categories for better financial tracking and control. Configure budget limits, approval rules, and reporting requirements for each expense type to maintain financial discipline.',
        features: [
          'Create unlimited expense categories',
          'Set budget limits per expense type',
          'Configure approval rules and limits',
          'Define required documentation',
          'Set up expense tracking rules',
          'Generate expense analytics and reports'
        ],
        benefits: [
          'Better expense control',
          'Improved budget management',
          'Clear spending categories',
          'Enhanced financial reporting'
        ],
        setupTime: '20-30 minutes',
        usage: 'Essential for all organizations'
      },
      {
        id: 6,
        name: 'Currency',
        path: '/setting/page/6',
        icon: <Globe size={20} />,
        description: 'Manage currencies and exchange rates',
        detailedDescription: 'Configure multi-currency support for your organization. Set up currencies, manage exchange rates, and configure currency formatting for accurate financial transactions and reporting across different regions.',
        features: [
          'Add and manage multiple currencies',
          'Configure real-time exchange rates',
          'Set currency formatting rules',
          'Define default currency settings',
          'Support multi-currency transactions',
          'Generate currency conversion reports'
        ],
        benefits: [
          'Multi-currency support',
          'Accurate financial reporting',
          'International transaction support',
          'Real-time currency conversion'
        ],
        setupTime: '15-25 minutes',
        usage: 'Essential for international organizations'
      },
      {
        id: 7,
        name: 'Chart of Accounts',
        path: '/setting/page/7',
        icon: <Building size={20} />,
        description: 'Maintain the account classifications used by request items and financial reports',
        detailedDescription: 'Configure and manage bank accounts, financial institutions, and payment methods. Set up account details, routing information, and banking preferences for seamless financial operations.',
        features: [
          'Add and manage bank accounts',
          'Configure account details and routing',
          'Set up payment methods',
          'Manage banking preferences',
          'Track account balances',
          'Configure bank integration settings'
        ],
        benefits: [
          'Centralized bank account management',
          'Streamlined payment processing',
          'Better financial oversight',
          'Improved reconciliation'
        ],
        setupTime: '15-20 minutes',
        usage: 'Essential for all organizations'
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
    description: 'Manage all system reference data and lookup configurations.',
    items: [
      {
        id: 8,
        name: 'Document Types',
        path: '/setting/page/10',
        icon: <FileText size={20} />,
        description: 'Define document types for classification',
        detailedDescription: 'Create and manage document types (Requisition, PO, Cash Advance, etc.) for proper classification and workflow management. Configure document-specific rules, numbering schemes, and metadata requirements.',
        features: [
          'Create custom document types',
          'Configure document numbering schemes',
          'Define document-specific workflows',
          'Set document type permissions',
          'Configure metadata requirements',
          'Manage document lifecycles'
        ],
        benefits: [
          'Standardized document classification',
          'Efficient document management',
          'Consistent numbering and tracking',
          'Better workflow automation'
        ],
        setupTime: '20-35 minutes',
        usage: 'Essential for all organizations'
      },
      {
        id: 9,
        name: 'Workflow Status',
        path: '/setting/page/11',
        icon: <Activity size={20} />,
        description: 'Manage workflow status definitions',
        detailedDescription: 'Define and manage workflow statuses (Pending, In Review, Approved, Rejected, etc.) with custom colors, icons, and transition rules. Configure terminal statuses and status-based actions for seamless workflow management.',
        features: [
          'Define custom workflow statuses',
          'Configure status colors and icons',
          'Set status transition rules',
          'Define terminal statuses',
          'Configure status-based notifications',
          'Manage status permissions'
        ],
        benefits: [
          'Clear workflow visibility',
          'Consistent status management',
          'Better workflow tracking',
          'Improved process automation'
        ],
        setupTime: '15-25 minutes',
        usage: 'Essential for all organizations'
      },
      {
        id: 10,
        name: 'Approval Actions',
        path: '/setting/page/12',
        icon: <ThumbsUp size={20} />,
        description: 'Configure approval action types',
        detailedDescription: 'Define and manage approval actions (Approve, Reject, Escalate, Delegate, etc.) with specific requirements, permissions, and transition rules. Configure action-based status changes and notification triggers.',
        features: [
          'Define approval action types',
          'Set action requirements (comments, passwords)',
          'Configure action-based status changes',
          'Define action permissions',
          'Set up action notifications',
          'Configure action history tracking'
        ],
        benefits: [
          'Standardized approval processes',
          'Clear action requirements',
          'Better audit trail',
          'Improved compliance'
        ],
        setupTime: '15-25 minutes',
        usage: 'Essential for all organizations'
      },
      {
        id: 11,
        name: 'Document Status',
        path: '/setting/page/13',
        icon: <ClipboardList size={20} />,
        description: 'Manage document status definitions',
        detailedDescription: 'Configure document-specific statuses for different document types. Define status transitions, lifecycles, and terminal statuses to track document progress effectively across the organization.',
        features: [
          'Define document-specific statuses',
          'Configure status transitions',
          'Set up document lifecycles',
          'Define terminal statuses',
          'Configure status-based permissions',
          'Manage document version tracking'
        ],
        benefits: [
          'Clear document lifecycle visibility',
          'Consistent document tracking',
          'Better document management',
          'Improved compliance'
        ],
        setupTime: '15-25 minutes',
        usage: 'Essential for all organizations'
      },
      {
        id: 12,
        name: 'Priority Levels',
        path: '/setting/page/14',
        icon: <Flag size={20} />,
        description: 'Define priority levels for tasks',
        detailedDescription: 'Create and manage priority levels (Low, Medium, High, Urgent, Critical) with custom colors, weights, and response time expectations. Configure priority-based workflows and notifications.',
        features: [
          'Define priority levels with colors',
          'Set priority weights for sorting',
          'Configure response time expectations',
          'Define priority-based workflows',
          'Set up priority notifications',
          'Track priority-based metrics'
        ],
        benefits: [
          'Clear task prioritization',
          'Better resource allocation',
          'Improved response times',
          'Enhanced workflow management'
        ],
        setupTime: '10-20 minutes',
        usage: 'Recommended for all organizations'
      },
      {
        id: 13,
        name: 'Workflow Types',
        path: '/setting/page/15',
        icon: <GitBranch size={20} />,
        description: 'Define workflow patterns and types',
        detailedDescription: 'Configure different workflow patterns (Serial, Parallel, Hybrid) for various business processes. Define approval chain types, conditional workflows, and routing rules for efficient process automation.',
        features: [
          'Define workflow types (Serial, Parallel, Hybrid)',
          'Configure approval chain types',
          'Set up conditional workflows',
          'Define routing rules',
          'Configure workflow patterns',
          'Manage workflow templates'
        ],
        benefits: [
          'Flexible workflow design',
          'Efficient process automation',
          'Better workflow management',
          'Improved approval processes'
        ],
        setupTime: '20-35 minutes',
        usage: 'Essential for organizations with complex workflows'
      },
      {
        id: 14,
        name: 'Notification Types',
        path: '/setting/page/16',
        icon: <Bell size={20} />,
        description: 'Manage notification configurations',
        detailedDescription: 'Configure comprehensive notification types, delivery methods, and templates. Define notification triggers, recipients, and preferences for effective communication across your organization.',
        features: [
          'Define custom notification types',
          'Configure delivery methods (Email, SMS, Push)',
          'Set up notification templates',
          'Define notification triggers',
          'Configure recipient rules',
          'Manage notification preferences'
        ],
        benefits: [
          'Effective communication',
          'Timely notifications',
          'Customizable alert system',
          'Better user engagement'
        ],
        setupTime: '20-30 minutes',
        usage: 'Essential for all organizations'
      },
      {
        id: 15,
        name: 'Escalation Reasons',
        path: '/setting/page/17',
        icon: <ArrowUpCircle size={20} />,
        description: 'Define escalation reason codes',
        detailedDescription: 'Create and manage escalation reasons for proper handling of workflow escalations. Configure escalation paths, rules, and notifications to ensure timely resolution of escalated issues.',
        features: [
          'Define escalation reasons',
          'Configure escalation paths',
          'Set up escalation rules',
          'Define escalation notifications',
          'Configure escalation conditions',
          'Track escalation analytics'
        ],
        benefits: [
          'Clear escalation handling',
          'Timely issue resolution',
          'Better workflow management',
          'Improved accountability'
        ],
        setupTime: '15-20 minutes',
        usage: 'Recommended for all organizations'
      },
      {
        id: 16,
        name: 'Rejection Reasons',
        path: '/setting/page/18',
        icon: <XCircle size={20} />,
        description: 'Define rejection reason codes',
        detailedDescription: 'Configure comprehensive rejection reasons for workflow items. Track rejection analytics, configure rejection workflows, and manage notifications to understand and reduce rejection rates.',
        features: [
          'Define rejection reasons',
          'Track rejection analytics',
          'Configure rejection workflows',
          'Set rejection notifications',
          'Analyze rejection patterns',
          'Generate rejection reports'
        ],
        benefits: [
          'Better understanding of rejections',
          'Improved quality control',
          'Reduced rejection rates',
          'Enhanced workflow efficiency'
        ],
        setupTime: '10-20 minutes',
        usage: 'Recommended for all organizations'
      },
      {
        id: 17,
        name: 'Document Categories',
        path: '/setting/page/19',
        icon: <Folder size={20} />,
        description: 'Organize documents into categories',
        detailedDescription: 'Create hierarchical document categories for better document classification and retrieval. Configure category-based permissions, hierarchies, and analytics for efficient document management.',
        features: [
          'Define document categories',
          'Configure category hierarchies',
          'Set category-based permissions',
          'Track category analytics',
          'Manage category metadata',
          'Configure category templates'
        ],
        benefits: [
          'Better document organization',
          'Improved document retrieval',
          'Enhanced classification',
          'Efficient document management'
        ],
        setupTime: '15-25 minutes',
        usage: 'Essential for all organizations'
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
    description: 'Configure system-wide settings and administrative controls.',
    items: [
      {
        id: 18,
        name: 'Vendors',
        path: '/setting/page/8',
        icon: <Building2 size={20} />,
        description: 'Manage vendor information and relationships',
        detailedDescription: 'Configure and manage vendor profiles, contact information, and relationships. Track vendor performance, contracts, and payments for efficient procurement and supply chain management.',
        features: [
          'Create and manage vendor profiles',
          'Track vendor contact information',
          'Manage vendor contracts and agreements',
          'Monitor vendor performance metrics',
          'Configure vendor payment terms',
          'Generate vendor reports and analytics'
        ],
        benefits: [
          'Centralized vendor management',
          'Better procurement efficiency',
          'Improved vendor relationships',
          'Enhanced supply chain visibility'
        ],
        setupTime: '20-30 minutes',
        usage: 'Essential for organizations with external suppliers'
      },
      {
        id: 19,
        name: 'Company Profile',
        path: '/setting/company-profile',
        icon: <LayoutGrid size={20} />,
        description: 'Manage company information and branding',
        detailedDescription: 'Configure your organization\'s profile including company details, branding settings, and system-wide configurations. Manage organization information, logo, and default system settings.',
        features: [
          'Update company information and details',
          'Configure branding settings (logo, colors)',
          'Set organizational structure',
          'Manage system-wide configurations',
          'Configure default settings',
          'Set up company-wide policies'
        ],
        benefits: [
          'Consistent branding',
          'Centralized company information',
          'Customized user experience',
          'Standardized system settings'
        ],
        setupTime: '20-30 minutes',
        usage: 'Essential for all organizations'
      },
      {
        id: 20,
        name: 'Approval Workflows',
        path: '/setting/workflow',
        icon: <Activity size={20} />,
        description: 'Design approval workflow processes',
        detailedDescription: 'Create and manage comprehensive approval workflows for different document types. Configure approval steps, conditional branching, escalation rules, and notifications for efficient process automation.',
        features: [
          'Create workflow templates',
          'Define multi-step approval processes',
          'Configure conditional branching',
          'Set escalation rules',
          'Manage workflow versions',
          'Track workflow performance'
        ],
        benefits: [
          'Streamlined approval processes',
          'Reduced approval times',
          'Better workflow automation',
          'Improved process efficiency'
        ],
        setupTime: '30-60 minutes',
        usage: 'Essential for all organizations'
      },
      {
        id: 21,
        name: 'Chart of Accounts',
        path: '/setting/chart-of-accounts',
        icon: <CreditCard size={20} />,
        description: 'Manage accounting structure',
        detailedDescription: 'Configure and manage your Chart of Accounts (COA) for proper financial tracking and reporting. Define account types, hierarchies, and mappings for comprehensive financial management.',
        features: [
          'Define account types and categories',
          'Create account hierarchies',
          'Configure account mappings',
          'Manage financial accounts',
          'Set up account codes',
          'Generate account reports'
        ],
        benefits: [
          'Proper financial tracking',
          'Accurate financial reporting',
          'Better financial management',
          'Standardized accounting'
        ],
        setupTime: '45-90 minutes',
        usage: 'Recommended for organizations with complex financial operations',
        isPro: true
      },
      {
        id: 22,
        name: 'Tax & Deductions',
        path: '/setting/taxes',
        icon: <DollarSign size={20} />,
        description: 'Configure tax rates and deductions',
        detailedDescription: 'Set up and manage tax rates, deduction types, and financial regulations. Configure tax rules, compliance settings, and deduction policies for accurate financial processing.',
        features: [
          'Define tax rates and rules',
          'Configure deduction types',
          'Set tax compliance rules',
          'Manage tax exemptions',
          'Generate tax reports',
          'Configure tax automation'
        ],
        benefits: [
          'Accurate tax calculations',
          'Regulatory compliance',
          'Efficient tax management',
          'Reduced tax errors'
        ],
        setupTime: '30-60 minutes',
        usage: 'Essential for all organizations',
        isPro: true
      },
      {
        id: 23,
        name: 'Audit Trail',
        path: '/setting/audit',
        icon: <Shield size={20} />,
        description: 'Manage system audit logs',
        detailedDescription: 'Comprehensive audit trail management for compliance and monitoring. View, filter, and export audit logs with detailed user activity tracking, action history, and system changes.',
        features: [
          'View comprehensive audit logs',
          'Filter logs by user, action, or module',
          'Export audit reports in multiple formats',
          'Configure audit retention policies',
          'Set up audit alerts and notifications',
          'Monitor user activity in real-time'
        ],
        benefits: [
          'Regulatory compliance',
          'Enhanced security monitoring',
          'Complete audit trail',
          'Better incident investigation'
        ],
        setupTime: '15-25 minutes',
        usage: 'Essential for all organizations'
      },
    ],
  },
];

// ============================================
// SETTINGS LANDING PAGE COMPONENT
// ============================================
export const availableSettings = settingsConfig.map(group => ({ ...group, items: group.items.filter(item => !['/setting/taxes','/setting/audit','/setting/chart-of-accounts'].includes(item.path)) }));
const SettingsLanding: React.FC = () => {
  const [search,setSearch]=useState('');
  const groups=availableSettings.map(group=>({...group,items:group.items.filter(item=>(item.name+' '+item.description).toLowerCase().includes(search.trim().toLowerCase()))})).filter(group=>group.items.length);
  return <div className="space-y-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1><p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Manage people, workflow rules and the reference data used across Prokure.</p></div><label className="w-full sm:w-72"><span className="sr-only">Search settings</span><input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search settings…" className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"/></label></div>
  {groups.map(group=><section key={group.id}><h2 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">{group.name}</h2><div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">{group.items.map(item=><Link key={item.id} to={item.path} className="group flex min-h-24 items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-brand-400 focus-visible:outline-2 focus-visible:outline-brand-500 dark:border-gray-800 dark:bg-gray-900"><span className="shrink-0 rounded-lg bg-gray-50 p-2 text-brand-600 dark:bg-gray-800 dark:text-brand-300" aria-hidden="true">{item.icon}</span><div className="min-w-0 flex-1"><h3 className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</h3><p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{item.description}</p></div><ChevronRight size={16} className="shrink-0 text-gray-400" aria-hidden="true"/></Link>)}</div></section>)}
  {!groups.length&&<div className="rounded-xl border border-gray-200 p-8 text-center dark:border-gray-800"><h2 className="font-semibold text-gray-900 dark:text-white">No matching settings</h2><button type="button" onClick={()=>setSearch('')} className="mt-3 min-h-11 text-sm text-brand-600 underline dark:text-brand-300">Clear search</button></div>}
  </div>;
};
export default SettingsLanding;
