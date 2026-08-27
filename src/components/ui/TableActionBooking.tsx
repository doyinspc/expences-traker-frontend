// src/components/ui/TableActionBooking.tsx

import React, { useState, useRef, useEffect } from 'react';
import { 
    MoreVertical, 
    Bed,
    Home,
    DoorOpen,
    CalendarCheck,
    XCircle
} from 'lucide-react';

interface TableActionBookingProps {
    row: any;
    // Required actions
    onBook?: (row: any) => void;
    onLodge?: (row: any) => void;
    onVacate?: (row: any) => void;
    onUnbook?: (row: any) => void;
    // Visibility controls
    showBook?: boolean;
    showLodge?: boolean;
    showVacate?: boolean;
    showUnbook?: boolean;
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

export const TableActionBooking: React.FC<TableActionBookingProps> = ({
    row,
    onBook,
    onLodge,
    onVacate,
    onUnbook,
    showBook = true,
    showLodge = true,
    showVacate = true,
    showUnbook = false,
    size = 'md',
    iconOnly = false,
}) => {
    // Get values from row
    const isBooked = row?.is_booked === 1 || row?.is_booked === '1';
    const isLodged = row?.is_lodged === 1 || row?.is_lodged === '1';
    const isVacated = row?.is_vacated === 1 || row?.is_vacated === '1';

    // Get status label
    const getStatusLabel = () => {
        if (isVacated) return 'Vacated';
        if (isLodged) return 'Lodged';
        if (isBooked) return 'Booked';
        return 'Not Booked';
    };

    // Get status color
    const getStatusColor = () => {
        if (isVacated) return 'bg-gray-500 text-white dark:bg-gray-600';
        if (isLodged) return 'bg-yellow-500 text-white dark:bg-yellow-600';
        if (isBooked) return 'bg-blue-500 text-white dark:bg-blue-600';
        return 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    };

    // Get status icon
    const getStatusIcon = () => {
        if (isVacated) return '🚪';
        if (isLodged) return '🏠';
        if (isBooked) return '🛏️';
        return '📅';
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
    
    const btnBook = `${btnBase} text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30`;
    const btnLodge = `${btnBase} text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:text-yellow-300 dark:hover:bg-yellow-900/30`;
    const btnVacate = `${btnBase} text-gray-600 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700/50`;
    const btnUnbook = `${btnBase} text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30`;

    // Badge styles
    const badgeBase = `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors`;

    const labels = {
        book: 'Book',
        lodge: 'Lodge',
        vacate: 'Vacate',
        unbook: 'Cancel',
    };

    const renderAction = (
        action: 'book' | 'lodge' | 'vacate' | 'unbook',
        onClick?: () => void,
        show: boolean = true
    ) => {
        if (!show || !onClick) return null;

        let icon: React.ReactNode;
        let className: string;
        let label: string;

        switch (action) {
            case 'book':
                icon = <Bed className={getIconSize()} />;
                className = btnBook;
                label = labels.book;
                break;
            case 'lodge':
                icon = <Home className={getIconSize()} />;
                className = btnLodge;
                label = labels.lodge;
                break;
            case 'vacate':
                icon = <DoorOpen className={getIconSize()} />;
                className = btnVacate;
                label = labels.vacate;
                break;
            case 'unbook':
                icon = <XCircle className={getIconSize()} />;
                className = btnUnbook;
                label = labels.unbook;
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

    // Show based on current status
    if (!isBooked && onBook && showBook) {
        actions.push(renderAction('book', () => onBook(row)));
    }

    if (isBooked && !isLodged && !isVacated && onLodge && showLodge) {
        actions.push(renderAction('lodge', () => onLodge(row)));
    }

    if (isLodged && !isVacated && onVacate && showVacate) {
        actions.push(renderAction('vacate', () => onVacate(row)));
    }

    if (isBooked && !isVacated && onUnbook && showUnbook) {
        actions.push(renderAction('unbook', () => onUnbook(row)));
    }

    // If no actions, return just the status badge
    if (actions.length === 0) {
        return (
            <span className={`${badgeBase} ${getStatusColor()}`}>
                <span>{getStatusIcon()}</span>
                <span className="ml-1">{getStatusLabel()}</span>
            </span>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {/* Status Badge */}
            <span className={`${badgeBase} ${getStatusColor()}`}>
                <span>{getStatusIcon()}</span>
                <span className="ml-1">{getStatusLabel()}</span>
            </span>

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
                            {actions.map((action, index) => {
                                // Safely extract onClick and children
                                const actionProps = action?.props || {};
                                const onClick = actionProps.onClick;
                                const children = actionProps.children;
                                
                                return (
                                    <div
                                        key={index}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                        onClick={() => {
                                            if (onClick) onClick();
                                        }}
                                    >
                                        <span className="text-gray-500 dark:text-gray-400">
                                            {children}
                                        </span>
                                    </div>
                                );
                            })}
                        </DropdownMenu>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============ PRE-CONFIGURED VARIANTS ============

// Full stage actions: Book → Lodge → Vacate
export const FullStageAction = (props: TableActionBookingProps) => (
    <TableActionBooking 
        {...props} 
        showBook={true}
        showLodge={true}
        showVacate={true}
        showUnbook={false}
    />
);

// With Cancel/Unbook option
export const FullStageWithCancelAction = (props: TableActionBookingProps) => (
    <TableActionBooking 
        {...props} 
        showBook={true}
        showLodge={true}
        showVacate={true}
        showUnbook={true}
    />
);

// Lodge & Vacate only (for already booked items)
export const LodgeVacateStageAction = (props: TableActionBookingProps) => (
    <TableActionBooking 
        {...props} 
        showBook={false}
        showLodge={true}
        showVacate={true}
        showUnbook={true}
    />
);

// Book only (for new bookings)
export const BookOnlyStageAction = (props: TableActionBookingProps) => (
    <TableActionBooking 
        {...props} 
        showBook={true}
        showLodge={false}
        showVacate={false}
        showUnbook={false}
    />
);

// Lodge only (for check-in)
export const LodgeOnlyStageAction = (props: TableActionBookingProps) => (
    <TableActionBooking 
        {...props} 
        showBook={false}
        showLodge={true}
        showVacate={false}
        showUnbook={false}
    />
);

// Vacate only (for check-out)
export const VacateOnlyStageAction = (props: TableActionBookingProps) => (
    <TableActionBooking 
        {...props} 
        showBook={false}
        showLodge={false}
        showVacate={true}
        showUnbook={false}
    />
);

// Status only (no actions, just display)
export const StatusOnlyStageAction = (props: TableActionBookingProps) => (
    <TableActionBooking 
        {...props} 
        showBook={false}
        showLodge={false}
        showVacate={false}
        showUnbook={false}
    />
);

// ============ EXPORT ============
export default TableActionBooking;