// src/components/ui/TableActionBudget.tsx

import React from 'react';
import { 
    Eye,
    Pencil, 
    Trash2, 
    CheckCircle,
    FileText,
    ArrowRight,
    XCircle,
    PlayCircle,
    StopCircle
} from 'lucide-react';

interface TableActionBudgetProps {
    row: any;
    onView?: (row: any) => void;
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
    onActivate?: (row: any) => void;
    onPrepareBudget?: (row: any) => void;
    onNext?: (row: any) => void;
    
    // Visibility controls
    showView?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
    showActivate?: boolean;
    showPrepareBudget?: boolean;
    showNext?: boolean;
    
    // Size
    size?: 'sm' | 'md' | 'lg';
    
    // Disable states
    disableView?: boolean;
    disableEdit?: boolean;
    disableDelete?: boolean;
    disableActivate?: boolean;
    disablePrepareBudget?: boolean;
    disableNext?: boolean;
    
    // Status
    is_active?: number | string;
    status?: 'draft' | 'active' | 'archived' | 'completed';
}

// ============ BUTTON STYLES ============

const getIconSize = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizes = {
        sm: 'w-3.5 h-3.5',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };
    return sizes[size];
};

const getButtonSize = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizes = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-2.5',
    };
    return sizes[size];
};

// ============ TOOLTIP COMPONENT ============

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
    return (
        <div className="relative group inline-flex">
            {children}
            <div className="
                absolute bottom-full left-1/2 -translate-x-1/2 mb-1
                px-2 py-1 rounded
                bg-gray-900 text-white text-xs whitespace-nowrap
                opacity-0 group-hover:opacity-100
                transition-opacity duration-200
                pointer-events-none
                z-50
            ">
                {text}
            </div>
        </div>
    );
};

// ============ MAIN COMPONENT ============

export const TableActionBudget: React.FC<TableActionBudgetProps> = ({
    row,
    onView,
    onEdit,
    onDelete,
    onActivate,
    onPrepareBudget,
    onNext,
    showView = true,
    showEdit = true,
    showDelete = true,
    showActivate = true,
    showPrepareBudget = true,
    showNext = true,
    size = 'md',
    disableView = false,
    disableEdit = false,
    disableDelete = false,
    disableActivate = false,
    disablePrepareBudget = false,
    disableNext = false,
    is_active = 1,
    status = 'draft',
}) => {
    const iconSize = getIconSize(size);
    const buttonSize = getButtonSize(size);

    // Determine if activate should be shown as "Activate" or "Deactivate"
    const isActive = is_active === 1 || is_active === '1';
    const activateLabel = isActive ? 'Deactivate' : 'Activate';
    const activateIcon = isActive ? <StopCircle className={iconSize} /> : <PlayCircle className={iconSize} />;

    // Check if any buttons are visible
    const hasVisibleButtons = showView || showEdit || showDelete || showActivate || showPrepareBudget || showNext;
    if (!hasVisibleButtons) return null;

    return (
        <div className="flex items-center gap-1.5 flex-wrap">
            {/* View Button */}
            {showView && (
                <Tooltip text="View">
                    <button
                        onClick={() => onView && onView(row)}
                        disabled={disableView}
                        className={`
                            inline-flex items-center justify-center rounded-md
                            bg-teal-50 text-teal-700 hover:bg-teal-100
                            dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30
                            transition-colors duration-200
                            ${buttonSize}
                            ${disableView ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
                        `}
                    >
                        <Eye className={iconSize} />
                    </button>
                </Tooltip>
            )}

            {/* Edit Button */}
            {showEdit && (
                <Tooltip text="Edit">
                    <button
                        onClick={() => onEdit && onEdit(row)}
                        disabled={disableEdit}
                        className={`
                            inline-flex items-center justify-center rounded-md
                            bg-blue-50 text-blue-700 hover:bg-blue-100
                            dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30
                            transition-colors duration-200
                            ${buttonSize}
                            ${disableEdit ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
                        `}
                    >
                        <Pencil className={iconSize} />
                    </button>
                </Tooltip>
            )}

            {/* Delete Button */}
            {showDelete && (
                <Tooltip text="Delete">
                    <button
                        onClick={() => onDelete && onDelete(row)}
                        disabled={disableDelete}
                        className={`
                            inline-flex items-center justify-center rounded-md
                            bg-red-50 text-red-700 hover:bg-red-100
                            dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30
                            transition-colors duration-200
                            ${buttonSize}
                            ${disableDelete ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
                        `}
                    >
                        <Trash2 className={iconSize} />
                    </button>
                </Tooltip>
            )}

            {/* Activate/Deactivate Button */}
            {showActivate && (
                <Tooltip text={activateLabel}>
                    <button
                        onClick={() => onActivate && onActivate(row)}
                        disabled={disableActivate}
                        className={`
                            inline-flex items-center justify-center rounded-md
                            ${isActive 
                                ? 'bg-orange-50 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30'
                                : 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                            }
                            transition-colors duration-200
                            ${buttonSize}
                            ${disableActivate ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
                        `}
                    >
                        {activateIcon}
                    </button>
                </Tooltip>
            )}

            {/* Prepare Budget Button */}
            {showPrepareBudget && (
                <Tooltip text={isActive ? 'Cannot prepare - active' : 'Prepare Budget'}>
                    <button
                        onClick={() => onPrepareBudget && onPrepareBudget(row)}
                        disabled={false}
                        className={`
                            inline-flex items-center justify-center rounded-md
                            bg-purple-50 text-purple-700 hover:bg-purple-100
                            dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30
                            transition-colors duration-200
                            ${buttonSize}
                            ${(false) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
                        `}
                    >
                        <FileText className={iconSize} />
                    </button>
                </Tooltip>
            )}

            {/* Next Button */}
            {showNext && (
                <Tooltip text="Next">
                    <button
                        onClick={() => onNext && onNext(row)}
                        disabled={disableNext}
                        className={`
                            inline-flex items-center justify-center rounded-md
                            bg-indigo-50 text-indigo-700 hover:bg-indigo-100
                            dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30
                            transition-colors duration-200
                            ${buttonSize}
                            ${disableNext ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
                        `}
                    >
                        <ArrowRight className={iconSize} />
                    </button>
                </Tooltip>
            )}
        </div>
    );
};

// ============ PRE-CONFIGURED VARIANTS ============

// Full actions (all buttons)
export const FullBudgetActions = (props: TableActionBudgetProps) => (
    <TableActionBudget 
        {...props} 
        showView={true}
        showEdit={true}
        showDelete={true}
        showActivate={true}
        showPrepareBudget={true}
        showNext={true}
    />
);

// Edit & Delete only (basic)
export const BasicBudgetActions = (props: TableActionBudgetProps) => (
    <TableActionBudget 
        {...props} 
        showView={false}
        showEdit={true}
        showDelete={true}
        showActivate={false}
        showPrepareBudget={false}
        showNext={false}
    />
);

// Management actions (no delete)
export const ManagementBudgetActions = (props: TableActionBudgetProps) => (
    <TableActionBudget 
        {...props} 
        showView={true}
        showEdit={true}
        showDelete={false}
        showActivate={true}
        showPrepareBudget={true}
        showNext={true}
    />
);

// Status actions only
export const StatusBudgetActions = (props: TableActionBudgetProps) => (
    <TableActionBudget 
        {...props} 
        showView={false}
        showEdit={false}
        showDelete={false}
        showActivate={true}
        showPrepareBudget={true}
        showNext={true}
    />
);

// Compact version (smaller buttons)
export const CompactBudgetActions = (props: TableActionBudgetProps) => (
    <TableActionBudget {...props} size="sm" />
);

// Large version
export const LargeBudgetActions = (props: TableActionBudgetProps) => (
    <TableActionBudget {...props} size="lg" />
);

// ============ EXPORT ============
export default TableActionBudget;