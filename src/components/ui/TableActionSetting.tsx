// src/components/ui/TableActionSetting.tsx

import React, { useState, useRef, useEffect } from 'react';
import { 
    MoreVertical, 
    Edit, 
    Trash2, 
    Power, 
    PowerOff,
    ChevronRight,
    CheckCircle,
    XCircle,
    DollarSign,
    TrendingUp,
    Package,
    Wrench
} from 'lucide-react';

interface TableActionSettingProps {
    row: any;
    // Required actions
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
    onActivate?: (row: any) => void;
    // Expense/Income/Good-Service actions
    onIncome?: (row: any) => void;
    onExpense?: (row: any) => void;
    onGoodOrService?: (row: any) => void;
    // Optional actions
    onNext?: (row: any) => void;
    // Visibility controls
    showEdit?: boolean;
    showDelete?: boolean;
    showActivate?: boolean;
    showDeactivate?: boolean;
    showNext?: boolean;
    // Expense/Income/Good-Service controls
    showExpense?: boolean;
    showIncome?: boolean;
    showGoodOrService?: boolean;
    // State
    is_active?: number | string;
    text_2?: number | string | null;  // Expense flag (1 = Expense, 0 = Not Expense)
    text_3?: number | string | null;  // Income flag (1 = Income, 0 = Not Income)
    text_4?: number | string | null;  // Good or Service (1 = Service, 2 = Good, 3 = Both, 0 = Not Set)
    // Style
    size?: 'sm' | 'md' | 'lg';
    iconOnly?: boolean;
}

// ============ DROPDOWN MENU ============

interface DropdownMenuProps {
    children: React.ReactNode;
    trigger: React.ReactNode;
    className?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, trigger, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger}
            </div>
            {isOpen && (
                <div className={`
                    absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 
                    rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 
                    py-1 z-50 min-w-[180px]
                    ${className}
                `}>
                    {children}
                </div>
            )}
        </div>
    );
};

// ============ MAIN COMPONENT ============

export const TableActionSetting: React.FC<TableActionSettingProps> = ({
    row,
    onEdit,
    onDelete,
    onActivate,
    onIncome,
    onExpense,
    onGoodOrService,
    onNext,
    showEdit = true,
    showDelete = true,
    showActivate = true,
    showDeactivate = true,
    showNext = false,
    showExpense = false,
    showIncome = false,
    showGoodOrService = false,
    is_active,
    text_2,
    text_3,
    text_4,
    size = 'md',
    iconOnly = false,
}) => {
    // Get the actual is_active value from row or prop
    const rowIsActive = row?.is_active !== undefined ? row.is_active : is_active;
    const isActive = rowIsActive === 1 || rowIsActive === '1';

    // Get expense/income values
    const rowIsExpense = row?.text_2 !== undefined ? row.text_2 : text_2;
    const isExpense = rowIsExpense === 1 || rowIsExpense === '1';
    const rowIsIncome = row?.text_3 !== undefined ? row.text_3 : text_3;
    const isIncome = rowIsIncome === 1 || rowIsIncome === '1';
    
    // text_4: 1=Service, 2=Good, 3=Both, 0/null=Not Set
    const rowIsGoodOrService = row?.text_4 !== undefined ? row.text_4 : text_4;
    let goodOrServiceType: 'good' | 'service' | 'both' | null = null;
    if (rowIsGoodOrService === 1 || rowIsGoodOrService === '1') {
        goodOrServiceType = 'service';
    } else if (rowIsGoodOrService === 2 || rowIsGoodOrService === '2') {
        goodOrServiceType = 'good';
    } else if (rowIsGoodOrService === 3 || rowIsGoodOrService === '3') {
        goodOrServiceType = 'both';
    }

    // Get Good/Service label
    const getGoodServiceLabel = () => {
        if (!goodOrServiceType) return 'Not Set';
        return goodOrServiceType === 'good' ? 'Good' : goodOrServiceType === 'service' ? 'Service' : 'Both';
    };

    // Size classes
    const getSizeClasses = () => {
        switch (size) {
            case 'sm': return 'p-1 text-xs';
            case 'lg': return 'p-2 text-base';
            default: return 'p-1.5 text-sm';
        }
    };

    const getIconSize = () => {
        switch (size) {
            case 'sm': return 'w-3.5 h-3.5';
            case 'lg': return 'w-5 h-5';
            default: return 'w-4 h-4';
        }
    };

    // Button base classes
    const btnBase = `inline-flex items-center justify-center rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 ${getSizeClasses()}`;
    
    const btnEdit = `${btnBase} text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30`;
    const btnDelete = `${btnBase} text-rose-600 hover:text-rose-700 hover:bg-rose-100 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-900/30`;
    const btnActivate = `${btnBase} text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-900/30`;
    const btnDeactivate = `${btnBase} text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/30`;
    const btnNext = `${btnBase} text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-900/30`;

    // Badge/Button styles for clickable badges
    const badgeBase = `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors cursor-pointer hover:opacity-80`;
    
    const getExpenseBadgeClass = () => {
        if (isExpense) {
            return `${badgeBase} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50`;
        }
        return `${badgeBase} bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600`;
    };

    const getIncomeBadgeClass = () => {
        if (isIncome) {
            return `${badgeBase} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50`;
        }
        return `${badgeBase} bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600`;
    };

    const getGoodServiceBadgeClass = () => {
        if (!goodOrServiceType) {
            return `${badgeBase} bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600`;
        }
        if (goodOrServiceType === 'good') {
            return `${badgeBase} bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50`;
        }
        if (goodOrServiceType === 'service') {
            return `${badgeBase} bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50`;
        }
        return `${badgeBase} bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50`;
    };

    const labels = {
        edit: 'Edit',
        delete: 'Delete',
        activate: 'Activate',
        deactivate: 'Deactivate',
        next: 'Next',
    };

    const renderAction = (
        action: 'edit' | 'delete' | 'activate' | 'deactivate' | 'next',
        onClick?: () => void,
        show: boolean = true
    ) => {
        if (!show || !onClick) return null;

        let icon: React.ReactNode;
        let className: string;
        let label: string;

        switch (action) {
            case 'edit':
                icon = <Edit className={getIconSize()} />;
                className = btnEdit;
                label = labels.edit;
                break;
            case 'delete':
                icon = <Trash2 className={getIconSize()} />;
                className = btnDelete;
                label = labels.delete;
                break;
            case 'activate':
                icon = <Power className={getIconSize()} />;
                className = btnActivate;
                label = labels.activate;
                break;
            case 'deactivate':
                icon = <PowerOff className={getIconSize()} />;
                className = btnDeactivate;
                label = labels.deactivate;
                break;
            case 'next':
                icon = <ChevronRight className={getIconSize()} />;
                className = btnNext;
                label = labels.next;
                break;
            default:
                return null;
        }

        return (
            <button
                key={action}
                className={className}
                onClick={onClick}
                title={iconOnly ? label : undefined}
                aria-label={label}
            >
                {icon}
                {!iconOnly && <span className="ml-1">{label}</span>}
            </button>
        );
    };

    const actions = [];

    if (showEdit && onEdit) {
        actions.push(renderAction('edit', () => onEdit(row)));
    }

    if (showDelete && onDelete) {
        actions.push(renderAction('delete', () => onDelete(row)));
    }

    if (onActivate) {
        if (isActive && showDeactivate) {
            actions.push(renderAction('deactivate', () => onActivate(row)));
        } else if (!isActive && showActivate) {
            actions.push(renderAction('activate', () => onActivate(row)));
        }
    }

    if (showNext && onNext) {
        actions.push(renderAction('next', () => onNext(row)));
    }

    // If no actions and no badges, return null
    if (actions.length === 0 && !showExpense && !showIncome && !showGoodOrService) return null;

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {/* Clickable Badges */}
            {showExpense && onExpense && (
                <button
                    onClick={() => onExpense(row)}
                    className={getExpenseBadgeClass()}
                    title={isExpense ? 'Click to remove Expense' : 'Click to mark as Expense'}
                >
                    <DollarSign className="w-3 h-3" />
                    {isExpense ? 'Expense' : 'Not Expense'}
                </button>
            )}
            
            {showIncome && onIncome && (
                <button
                    onClick={() => onIncome(row)}
                    className={getIncomeBadgeClass()}
                    title={isIncome ? 'Click to remove Income' : 'Click to mark as Income'}
                >
                    <TrendingUp className="w-3 h-3" />
                    {isIncome ? 'Income' : 'Not Income'}
                </button>
            )}
            
            {showGoodOrService && onGoodOrService && (
                <button
                    onClick={() => onGoodOrService(row)}
                    className={getGoodServiceBadgeClass()}
                    title="Click to cycle: Not Set → Service → Good → Both"
                >
                    {goodOrServiceType === 'good' ? <Package className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                    {getGoodServiceLabel()}
                </button>
            )}

            {/* Action Buttons */}
            {actions.length > 0 && (
                <div className="inline-flex items-center gap-1 ml-1">
                    <div className="hidden sm:flex sm:items-center sm:gap-1">
                        {actions}
                    </div>

                    <div className="sm:hidden">
                        <DropdownMenu
                            trigger={
                                <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 rounded transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            }
                        >
                            {actions.map((action, index) => (
                                <div
                                    key={index}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                    onClick={() => {
                                        const button = action?.props?.onClick;
                                        if (button) button();
                                    }}
                                >
                                    <span className="text-gray-500 dark:text-gray-400">
                                        {action}
                                    </span>
                                </div>
                            ))}
                        </DropdownMenu>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============ PRE-CONFIGURED VARIANTS ============

// Original variants - work exactly as before
export const FullSettingAction = (props: TableActionSettingProps) => (
    <TableActionSetting 
        {...props} 
        showEdit={true}
        showDelete={true}
        showActivate={true}
        showDeactivate={true}
        showNext={false}
    />
);

export const NoDeleteNextSettingAction = (props: TableActionSettingProps) => (
    <TableActionSetting 
        {...props} 
        showEdit={true}
        showDelete={false}
        showActivate={true}
        showDeactivate={true}
        showNext={false}
    />
);

export const FullSettingActionNoDelete = (props: TableActionSettingProps) => (
    <TableActionSetting 
        {...props} 
        showEdit={true}
        showDelete={false}
        showActivate={true}
        showDeactivate={true}
        showNext={true}
    />
);

export const MinimalSettingAction = (props: TableActionSettingProps) => (
    <TableActionSetting 
        {...props} 
        showEdit={true}
        showDelete={false}
        showActivate={false}
        showDeactivate={false}
        showNext={false}
    />
);

export const EditDeleteSettingAction = (props: TableActionSettingProps) => (
    <TableActionSetting 
        {...props} 
        showEdit={true}
        showDelete={true}
        showActivate={false}
        showDeactivate={false}
        showNext={false}
    />
);

export const WithNextSettingAction = (props: TableActionSettingProps) => (
    <TableActionSetting 
        {...props} 
        showEdit={true}
        showDelete={true}
        showActivate={true}
        showDeactivate={true}
        showNext={true}
    />
);

// ============ EXPENSE/INCOME VARIANTS ============

// FULL: Show badges + Edit + Delete + Activate/Deactivate
export const ExpenseIncomeFullAction = (props: TableActionSettingProps) => (
    <TableActionSetting 
        {...props} 
        showEdit={true}
        showDelete={true}
        showActivate={true}
        showDeactivate={true}
        showNext={false}
        showExpense={true}
        showIncome={true}
        showGoodOrService={true}
    />
);

// Show badges + Edit + Activate/Deactivate (No Delete)
export const ExpenseIncomeSettingAction = (props: TableActionSettingProps) => (
    <TableActionSetting 
        {...props} 
        showEdit={true}
        showDelete={false}
        showActivate={true}
        showDeactivate={true}
        showNext={false}
        showExpense={true}
        showIncome={true}
        showGoodOrService={true}
    />
);

// Show badges + Edit only
export const ExpenseIncomeMinimal = (props: TableActionSettingProps) => (
    <TableActionSetting 
        {...props} 
        showEdit={true}
        showDelete={false}
        showActivate={false}
        showDeactivate={false}
        showNext={false}
        showExpense={true}
        showIncome={true}
        showGoodOrService={true}
    />
);

// Show badges only (no actions)
export const ExpenseIncomeBadgesOnly = (props: TableActionSettingProps) => (
    <TableActionSetting 
        {...props} 
        showEdit={false}
        showDelete={false}
        showActivate={false}
        showDeactivate={false}
        showNext={false}
        showExpense={true}
        showIncome={true}
        showGoodOrService={true}
    />
);

// Expense only with actions
export const ExpenseOnlyWithActions = (props: TableActionSettingProps) => (
    <TableActionSetting 
        {...props} 
        showEdit={true}
        showDelete={true}
        showActivate={true}
        showDeactivate={true}
        showNext={false}
        showExpense={true}
        showIncome={false}
        showGoodOrService={false}
    />
);

// Income only with actions
export const IncomeOnlyWithActions = (props: TableActionSettingProps) => (
    <TableActionSetting 
        {...props} 
        showEdit={true}
        showDelete={true}
        showActivate={true}
        showDeactivate={true}
        showNext={false}
        showExpense={false}
        showIncome={true}
        showGoodOrService={false}
    />
);

// ============ EXPORT ============
export default TableActionSetting;