// src/components/ui/UserTableAction.tsx

import React from 'react';
import { 
    Pencil, 
    Trash2, 
    Users, 
    Shield, 
    Building, 
    Key, 
} from 'lucide-react';

interface UserTableActionProps {
    row: any;
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
    onManagers?: (row: any) => void;
    onRoles?: (row: any) => void;
    onDepartment?: (row: any) => void;
    onAccess?: (row: any) => void;
    // Visibility controls
    showEdit?: boolean;
    showDelete?: boolean;
    showManagers?: boolean;
    showRoles?: boolean;
    showDepartment?: boolean;
    showAccess?: boolean;
    // Size
    size?: 'sm' | 'md' | 'lg';
    // Disable states
    disableEdit?: boolean;
    disableDelete?: boolean;
    disableManagers?: boolean;
    disableRoles?: boolean;
    disableDepartment?: boolean;
    disableAccess?: boolean;
    is_active?: number | string;
}

// ============ BUTTON STYLES ============

const getButtonStyles = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizes = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
    };
    return sizes[size];
};

const getIconSize = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };
    return sizes[size];
};

// ============ MAIN COMPONENT ============

export const UserTableAction: React.FC<UserTableActionProps> = ({
    row,
    onEdit,
    onDelete,
    onManagers,
    onRoles,
    onDepartment,
    onAccess,
    showEdit = true,
    showDelete = true,
    showManagers = true,
    showRoles = true,
    showDepartment = true,
    showAccess = true,
    size = 'md',
    disableEdit = false,
    disableDelete = false,
    disableManagers = false,
    disableRoles = false,
    disableDepartment = false,
    disableAccess = false,
}) => {
    const buttonSize = getButtonStyles(size);
    const iconSize = getIconSize(size);

    // Check if any buttons are visible
    const hasVisibleButtons = showEdit || showDelete || showManagers || showRoles || showDepartment || showAccess;
    if (!hasVisibleButtons) return null;

    return (
        <div className="flex items-center gap-1.5 flex-wrap min-w-max">
            {/* Edit Button */}
            {showEdit && (
                <button
                    onClick={() => onEdit && onEdit(row)}
                    disabled={disableEdit}
                    className={`
                        inline-flex items-center gap-1.5 rounded-md
                        bg-blue-50 text-blue-700 hover:bg-blue-100
                        dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30
                        transition-colors duration-200
                        font-medium
                        ${buttonSize}
                        ${disableEdit ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
                    `}
                    title="Edit User"
                >
                    <Pencil className={iconSize} />
                    <span>Edit</span>
                </button>
            )}

            {/* Delete Button */}
            {showDelete && (
                <button
                    onClick={() => onDelete && onDelete(row)}
                    disabled={disableDelete}
                    className={`
                        inline-flex items-center gap-1.5 rounded-md
                        bg-red-50 text-red-700 hover:bg-red-100
                        dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30
                        transition-colors duration-200
                        font-medium
                        ${buttonSize}
                        ${disableDelete ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
                    `}
                    title="Delete User"
                >
                    <Trash2 className={iconSize} />
                    <span>Delete</span>
                </button>
            )}

            {/* Managers Button */}
            {showManagers && (
                <button
                    onClick={() => onManagers && onManagers(row)}
                    disabled={disableManagers}
                    className={`
                        inline-flex items-center gap-1.5 rounded-md
                        bg-purple-50 text-purple-700 hover:bg-purple-100
                        dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30
                        transition-colors duration-200
                        font-medium
                        ${buttonSize}
                        ${disableManagers ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
                    `}
                    title="Manage Managers"
                >
                    <Users className={iconSize} />
                    <span>Managers</span>
                </button>
            )}

            {/* Roles Button */}
            {showRoles && (
                <button
                    onClick={() => onRoles && onRoles(row)}
                    disabled={disableRoles}
                    className={`
                        inline-flex items-center gap-1.5 rounded-md
                        bg-indigo-50 text-indigo-700 hover:bg-indigo-100
                        dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30
                        transition-colors duration-200
                        font-medium
                        ${buttonSize}
                        ${disableRoles ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
                    `}
                    title="Manage Roles"
                >
                    <Shield className={iconSize} />
                    <span>Roles</span>
                </button>
            )}

            {/* Department Button */}
            {showDepartment && (
                <button
                    onClick={() => onDepartment && onDepartment(row)}
                    disabled={disableDepartment}
                    className={`
                        inline-flex items-center gap-1.5 rounded-md
                        bg-emerald-50 text-emerald-700 hover:bg-emerald-100
                        dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30
                        transition-colors duration-200
                        font-medium
                        ${buttonSize}
                        ${disableDepartment ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
                    `}
                    title="Manage Department"
                >
                    <Building className={iconSize} />
                    <span>Department</span>
                </button>
            )}

            {/* Access Button */}
            {showAccess && (
                <button
                    onClick={() => onAccess && onAccess(row)}
                    disabled={disableAccess}
                    className={`
                        inline-flex items-center gap-1.5 rounded-md
                        bg-amber-50 text-amber-700 hover:bg-amber-100
                        dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30
                        transition-colors duration-200
                        font-medium
                        ${buttonSize}
                        ${disableAccess ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
                    `}
                    title="Manage Access"
                >
                    <Key className={iconSize} />
                    <span>Access</span>
                </button>
            )}
        </div>
    );
};

// ============ PRE-CONFIGURED VARIANTS ============

// Full actions (all buttons)
export const FullUserActions = (props: UserTableActionProps) => (
    <UserTableAction 
        {...props} 
        showEdit={true}
        showDelete={true}
        showManagers={true}
        showRoles={true}
        showDepartment={true}
        showAccess={true}
    />
);

// Management only (no Edit/Delete)
export const ManagementUserActions = (props: UserTableActionProps) => (
    <UserTableAction 
        {...props} 
        showEdit={false}
        showDelete={false}
        showManagers={true}
        showRoles={true}
        showDepartment={true}
        showAccess={true}
    />
);

// Edit & Delete only
export const BasicUserActions = (props: UserTableActionProps) => (
    <UserTableAction 
        {...props} 
        showEdit={true}
        showDelete={true}
        showManagers={false}
        showRoles={false}
        showDepartment={false}
        showAccess={false}
    />
);

// Compact version (smaller buttons)
export const CompactUserActions = (props: UserTableActionProps) => (
    <UserTableAction {...props} size="sm" />
);

// Large version
export const LargeUserActions = (props: UserTableActionProps) => (
    <UserTableAction {...props} size="lg" />
);

// ============ EXPORT ============
export default UserTableAction;