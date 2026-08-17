// src/components/ui/TableAction.tsx

import React, { useState, useRef, useEffect } from 'react';
import ActionButtons from './ActionButton';
import { MoreVertical, ChevronDown } from 'lucide-react';

interface TableActionProps {
    row: any;
    onNext?: (row: any) => void;
    onView?: (row: any) => void;
    onActivate?: (row: any) => void;
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
    onAdd?: (row: any) => void;
    onDownload?: (row: any) => void;
    onEmail?: (row: any) => void;
    onLock?: (row: any) => void;
    onPrint?: (row: any) => void;
    onApprove?: (row: any) => void;
    onLetter?: (row: any) => void;
    onEdit1?: (row: any) => void;
    onEditPhoto?: (row: any) => void;
    onNext1?: (row: any) => void;
    // Visibility controls
    showView?: boolean;
    showEdit?: boolean;
    showDelete?: boolean;
    showActivate?: boolean;
    showDeactivate?: boolean;
    showNext?: boolean;
    showAdd?: boolean;
    showDownload?: boolean;
    showEmail?: boolean;
    showLock?: boolean;
    showPrint?: boolean;
    showApprove?: boolean;
    showLetter?: boolean;
    showEdit1?: boolean;
    showEditPhoto?: boolean;
    showNext1?: boolean;
    showAll?: boolean;
    // Custom order
    order?: string[];
    // Size control
    size?: 'sm' | 'md' | 'lg';
    // Additional context
    is_active?: number | string;
    lock?: number | string;
    isApprove?: number | string;
    pop?: string | number;
    // 🆕 Responsive options
    responsive?: boolean;
    collapseAt?: number; // Number of actions before collapsing
    dropdownLabel?: string;
    showLabels?: boolean;
    iconOnly?: boolean;
}

// ============ HELPER: Dropdown Menu ============

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

export const TableAction: React.FC<TableActionProps> = ({
    row,
    onNext,
    onView,
    onActivate,
    onEdit,
    onDelete,
    onAdd,
    onDownload,
    onEmail,
    onLock,
    onPrint,
    onApprove,
    onLetter,
    onEdit1,
    onEditPhoto,
    onNext1,
    showView = true,
    showEdit = true,
    showDelete = true,
    showActivate = true,
    showDeactivate = true,
    showNext = true,
    showAdd = false,
    showDownload = false,
    showEmail = false,
    showLock = false,
    showPrint = false,
    showApprove = false,
    showLetter = false,
    showEdit1 = false,
    showEditPhoto = false,
    showNext1 = false,
    showAll = false,
    order,
    size = 'md',
    is_active,
    lock,
    isApprove,
    pop,
    responsive = true,
    collapseAt = 3,
    dropdownLabel = 'More',
    showLabels = false,
    iconOnly = false,
}) => {
    // Determine if a button should be shown
    const shouldShow = (action: string): boolean => {
        if (showAll) return true;
        
        switch (action) {
            case 'view': return showView;
            case 'edit': return showEdit;
            case 'delete': return showDelete;
            case 'activate': return showActivate;
            case 'deactivate': return showDeactivate;
            case 'next': return showNext;
            case 'add': return showAdd;
            case 'download': return showDownload;
            case 'email': return showEmail;
            case 'lock': return showLock;
            case 'print': return showPrint;
            case 'approve': return showApprove;
            case 'letter': return showLetter;
            case 'edit1': return showEdit1;
            case 'editPhoto': return showEditPhoto;
            case 'next1': return showNext1;
            default: return true;
        }
    };

    // Get the order of buttons
    const getOrder = (): string[] => {
        if (order) return order;
        return ['view', 'edit', 'activate', 'deactivate', 'delete', 'next', 'add', 'download', 'email', 'lock', 'print', 'approve', 'letter', 'edit1', 'editPhoto', 'next1'];
    };

    // Get button size classes
    const getSizeClasses = () => {
        switch (size) {
            case 'sm': return 'p-1 text-xs';
            case 'lg': return 'p-2 text-base';
            default: return 'p-1.5 text-sm';
        }
    };

    // Get icon size
    const getIconSize = () => {
        switch (size) {
            case 'sm': return 'text-xs';
            case 'lg': return 'text-lg';
            default: return 'text-sm';
        }
    };

    // Map action to component
    const renderButton = (action: string, isInDropdown: boolean = false) => {
        const handlers = {
            onView: () => onView && onView(row),
            onEdit: () => onEdit && onEdit(row),
            onDelete: () => onDelete && onDelete(row),
            onActivate: () => onActivate && onActivate(row),
            onNext: () => onNext && onNext(row),
            onAdd: () => onAdd && onAdd(row),
            onDownload: () => onDownload && onDownload(row),
            onEmail: () => onEmail && onEmail(row),
            onLock: () => onLock && onLock(row),
            onPrint: () => onPrint && onPrint(row),
            onApprove: () => onApprove && onApprove(row),
            onLetter: () => onLetter && onLetter(row),
            onEdit1: () => onEdit1 && onEdit1(row),
            onEditPhoto: () => onEditPhoto && onEditPhoto(row),
            onNext1: () => onNext1 && onNext1(row),
        };

        const rowIsActive = row?.is_active !== undefined ? row.is_active : is_active;
        const rowLock = row?.lock !== undefined ? row.lock : lock;
        const rowIsApprove = row?.isApprove !== undefined ? row.isApprove : isApprove;
        const rowPop = row?.pop !== undefined ? row.pop : pop;

        const btnClass = `inline-flex items-center justify-center rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 ${getSizeClasses()}`;
        const ghostDefault = `${btnClass} text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700`;
        const ghostSuccess = `${btnClass} text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-900/30`;
        const ghostDanger = `${btnClass} text-rose-600 hover:text-rose-700 hover:bg-rose-100 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-900/30`;

        // Label map
        const labels: Record<string, string> = {
            view: 'View',
            edit: 'Edit',
            delete: 'Delete',
            activate: 'Activate',
            deactivate: 'Deactivate',
            next: 'Next',
            add: 'Add',
            download: 'Download',
            email: 'Email',
            lock: 'Lock',
            print: 'Print',
            approve: 'Approve',
            letter: 'Letter',
            edit1: 'Edit 1',
            editPhoto: 'Edit Photo',
            next1: 'Next 1',
        };

        const actionComponent = (() => {
            switch (action) {
                case 'view':
                    return onView ? <ActionButtons.View key="view" /> : null;
                case 'edit':
                    return onEdit ? <ActionButtons.Edit key="edit" /> : null;
                case 'delete':
                    return onDelete ? <ActionButtons.Delete key="delete" /> : null;
                case 'activate':
                    if (onActivate && (rowIsActive === 0 || rowIsActive === '0')) {
                        return <ActionButtons.Activate key="activate" is_active={0} />;
                    }
                    return null;
                case 'deactivate':
                    if (onActivate && (rowIsActive === 1 || rowIsActive === '1')) {
                        return <ActionButtons.Deactivate key="deactivate" />;
                    }
                    return null;
                case 'next':
                    return onNext ? <ActionButtons.Next key="next" /> : null;
                case 'add':
                    return onAdd ? <ActionButtons.Add key="add" /> : null;
                case 'download':
                    return onDownload ? <ActionButtons.Download key="download" /> : null;
                case 'email':
                    return onEmail ? <ActionButtons.Email key="email" /> : null;
                case 'lock':
                    if (onLock) {
                        return <ActionButtons.Lock key="lock" lock={rowLock} />;
                    }
                    return null;
                case 'print':
                    return onPrint ? <ActionButtons.Print key="print" /> : null;
                case 'approve':
                    if (onApprove) {
                        return <ActionButtons.Approve key="approve" isApprove={rowIsApprove} />;
                    }
                    return null;
                case 'letter':
                    return onLetter ? <ActionButtons.Letter key="letter" /> : null;
                case 'edit1':
                    return onEdit1 ? <ActionButtons.Edit1 key="edit1" /> : null;
                case 'editPhoto':
                    return onEditPhoto ? <ActionButtons.EditPhoto key="editPhoto" /> : null;
                case 'next1':
                    return onNext1 ? <ActionButtons.Next1 key="next1" /> : null;
                default:
                    return null;
            }
        })();

        // If in dropdown, wrap with label
        if (isInDropdown && actionComponent) {
            return (
                <button
                    key={action}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => {
                        const handler = handlers[action as keyof typeof handlers];
                        if (handler) handler();
                    }}
                >
                    <span className="text-gray-500 dark:text-gray-400">
                        {actionComponent}
                    </span>
                    <span>{labels[action] || action}</span>
                </button>
            );
        }

        return actionComponent;
    };

    // Build all visible actions
    const allActions = getOrder().filter(action => shouldShow(action));
    const actionComponents = allActions.map(action => renderButton(action, false)).filter(Boolean);

    // If no actions to show, return null
    if (actionComponents.length === 0) {
        return null;
    }

    // Wrapper for all handlers
    const allHandlers = {
        onNext: () => onNext && onNext(row),
        onView: () => onView && onView(row),
        onActivate: () => onActivate && onActivate(row),
        onDeactivate: () => onActivate && onActivate(row),
        onEdit: () => onEdit && onEdit(row),
        onDelete: () => onDelete && onDelete(row),
        onAdd: () => onAdd && onAdd(row),
        onDownload: () => onDownload && onDownload(row),
        onEmail: () => onEmail && onEmail(row),
        onLock: () => onLock && onLock(row),
        onPrint: () => onPrint && onPrint(row),
        onApprove: () => onApprove && onApprove(row),
        onLetter: () => onLetter && onLetter(row),
        onEdit1: () => onEdit1 && onEdit1(row),
        onEditPhoto: () => onEditPhoto && onEditPhoto(row),
        onNext1: () => onNext1 && onNext1(row),
    };

    return (
        <div className="inline-flex items-center gap-1">
            {/* MD and above: Show ALL buttons directly (no dropdown) */}
            <div className="hidden md:flex md:items-center md:gap-1">
                <ActionButtons
                    {...allHandlers}
                    is_active={row?.is_active !== undefined ? row.is_active : is_active}
                    lock={row?.lock !== undefined ? row.lock : lock}
                    isApprove={row?.isApprove !== undefined ? row.isApprove : isApprove}
                    pop={row?.pop !== undefined ? row.pop : pop}
                >
                    {actionComponents}
                </ActionButtons>
            </div>

            {/* Below MD: Show dropdown with all actions */}
            <div className="md:hidden">
                <DropdownMenu
                    trigger={
                        <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 rounded transition-colors">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    }
                >
                    {allActions.map(action => renderButton(action, true)).filter(Boolean)}
                </DropdownMenu>
            </div>
        </div>
    );
};

// ============ PRE-CONFIGURED VARIANTS ============

// Full actions (default)
export const FullTableAction = (props: TableActionProps) => (
    <TableAction {...props} showAll={true} responsive={true} />
);

// Minimal actions (view + edit only)
export const MinimalTableAction = (props: TableActionProps) => (
    <TableAction 
        {...props} 
        showView={true}
        showEdit={true}
        showDelete={false}
        showActivate={false}
        showDeactivate={false}
        showNext={false}
        order={['view', 'edit']}
        responsive={true}
        collapseAt={2}
    />
);

// View only
export const ViewOnlyTableAction = (props: TableActionProps) => (
    <TableAction 
        {...props} 
        showView={true}
        showEdit={false}
        showDelete={false}
        showActivate={false}
        showDeactivate={false}
        showNext={false}
        order={['view']}
        responsive={true}
    />
);

// Approver actions
export const ApproverTableAction = (props: TableActionProps) => (
    <TableAction 
        {...props} 
        showView={true}
        showEdit={false}
        showDelete={false}
        showActivate={true}
        showDeactivate={true}
        showNext={true}
        showApprove={true}
        order={['view', 'activate', 'deactivate', 'approve', 'next']}
        responsive={true}
        collapseAt={3}
    />
);

// Manager actions
export const ManagerTableAction = (props: TableActionProps) => (
    <TableAction 
        {...props} 
        showView={true}
        showEdit={true}
        showDelete={false}
        showActivate={true}
        showDeactivate={true}
        showNext={true}
        showApprove={true}
        order={['view', 'edit', 'activate', 'deactivate', 'approve', 'next']}
        responsive={true}
        collapseAt={4}
    />
);

// Admin actions (all except next)
export const AdminTableAction = (props: TableActionProps) => (
    <TableAction 
        {...props} 
        showView={true}
        showEdit={true}
        showDelete={true}
        showActivate={true}
        showDeactivate={true}
        showNext={false}
        showLock={true}
        showPrint={true}
        order={['view', 'edit', 'delete', 'lock', 'activate', 'deactivate', 'print']}
        responsive={true}
        collapseAt={4}
    />
);

// Document actions
export const DocumentTableAction = (props: TableActionProps) => (
    <TableAction 
        {...props} 
        showView={true}
        showPrint={true}
        showDownload={true}
        showEmail={true}
        showEdit={false}
        showDelete={false}
        showActivate={false}
        showDeactivate={false}
        showNext={false}
        order={['view', 'print', 'download', 'email']}
        responsive={true}
        collapseAt={3}
    />
);

// Compact actions
export const CompactTableAction = (props: TableActionProps) => (
    <TableAction 
        {...props} 
        showView={true}
        showEdit={true}
        showDelete={false}
        showActivate={false}
        showDeactivate={false}
        showNext={false}
        size="sm"
        order={['view', 'edit']}
        responsive={true}
        collapseAt={2}
        iconOnly={true}
    />
);

// ============ EXPORT ============
export default TableAction;