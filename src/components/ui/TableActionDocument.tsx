// src/components/ui/TableActionDocument.tsx

import React from 'react';
import { 
    Eye,
    Pencil, 
    Plus,
} from 'lucide-react';

interface TableActionDocumentProps {
    row: any;
    onView?: (row: any) => void;
    onEdit?: (row: any) => void;
    onNext?: (row: any) => void;
    
    // Visibility controls
    showView?: boolean;
    showEdit?: boolean;
    showAdd?: boolean;
    
    // Size
    size?: 'sm' | 'md' | 'lg';
    
    // Status checks
    is_active?: number | string;
    is_complete?: number | string;
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

export const TableActionDocument: React.FC<TableActionDocumentProps> = ({
    row,
    onView,
    onEdit,
    onNext,
    showView = true,
    showEdit = true,
    showAdd = true,
    size = 'md',
    is_active = 0,
    is_complete = 0,
}) => {
    const iconSize = getIconSize(size);
    const buttonSize = getButtonSize(size);

    // Check if item is active or complete - if so, disable edit and add
    const isActiveOrComplete = is_active === 1 || is_active === '1' || is_complete === 1 || is_complete === '1';
    
    // Edit and Add are disabled when active or complete
    const disableEdit = isActiveOrComplete;
    const disableAdd = isActiveOrComplete;
    const disableView = false; // View is always enabled

    // Check if any buttons are visible
    const hasVisibleButtons = showView || showEdit || showAdd;
    if (!hasVisibleButtons) return null;

    return (
        <div className="flex items-center gap-1.5 flex-wrap">
            {/* View Button - Always enabled */}
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

            {/* Edit Button - Disabled when active or complete */}
            {showEdit && (
                <Tooltip text={disableEdit ? 'Cannot edit - active or complete' : 'Edit'}>
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

            {/* Add Button - Disabled when active or complete */}
            {showAdd && (
                <Tooltip text={disableAdd ? 'Cannot add - active or complete' : 'Add Item'}>
                    <button
                        onClick={() => onNext && onNext(row)}
                        disabled={disableAdd}
                        className={`
                            inline-flex items-center justify-center rounded-md
                            bg-green-50 text-green-700 hover:bg-green-100
                            dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30
                            transition-colors duration-200
                            ${buttonSize}
                            ${disableAdd ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
                        `}
                    >
                        <Plus className={iconSize} />
                    </button>
                </Tooltip>
            )}
        </div>
    );
};

// ============ PRE-CONFIGURED VARIANTS ============

// Full actions (all buttons)
export const FullDocumentActions = (props: TableActionDocumentProps) => (
    <TableActionDocument 
        {...props} 
        showView={true}
        showEdit={true}
        showAdd={true}
    />
);

// View only
export const ViewOnlyDocumentActions = (props: TableActionDocumentProps) => (
    <TableActionDocument 
        {...props} 
        showView={true}
        showEdit={false}
        showAdd={false}
    />
);

// Edit & Add only (no view)
export const EditAddDocumentActions = (props: TableActionDocumentProps) => (
    <TableActionDocument 
        {...props} 
        showView={false}
        showEdit={true}
        showAdd={true}
    />
);

// Compact version (smaller buttons)
export const CompactDocumentActions = (props: TableActionDocumentProps) => (
    <TableActionDocument {...props} size="sm" />
);

// Large version
export const LargeDocumentActions = (props: TableActionDocumentProps) => (
    <TableActionDocument {...props} size="lg" />
);

// ============ EXPORT ============
export default TableActionDocument;