// src/components/ui/FilterSection.tsx

import React from 'react';

interface FilterSectionProps {
    show: boolean;
    filterConfig: any;
    filters: Record<string, any>;
    searchTerm: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFilterChange: (name: string, value: any) => void;
    onClearFilters: () => void;
    OPTION_DATA: Record<string, Array<{ value: any; label: string }>>;
}

// Helper to get options from the option key - DEFENSIVE
const getFilterOptions = (
    optionKey: string, 
    OPTION_DATA: Record<string, Array<{ value: any; label: string }>>
): Array<{ value: any; label: string }> => {
    // If no option key, return empty array
    if (!optionKey) return [];
    
    // If OPTION_DATA is not provided or doesn't have the key, return empty array
    if (!OPTION_DATA || typeof OPTION_DATA !== 'object') return [];
    
    // Return the options array or empty array if not found
    return OPTION_DATA[optionKey] || [];
};

export const FilterSection: React.FC<FilterSectionProps> = ({
    show,
    filterConfig,
    filters,
    searchTerm,
    onSearchChange,
    onFilterChange,
    onClearFilters,
    OPTION_DATA,
}) => {
    if (!filterConfig) return null;

    return (
        <div className={`mb-4 overflow-hidden transition-all duration-300 ease-in-out ${
            show ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search Input */}
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={onSearchChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>

                    {/* Filter Fields */}
                    {filterConfig.filterableFields.map((filterField: any) => {
                        // Get the actual options array from OPTION_DATA using the string key
                        const options = getFilterOptions(filterField.options, OPTION_DATA);
                        
                        return (
                            <div key={filterField.name} className="min-w-[150px]">
                                {filterField.type === 'select' ? (
                                    <select
                                        value={filters[filterField.name] || ''}
                                        onChange={(e) => onFilterChange(filterField.name, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    >
                                        <option value="">All {filterField.label}</option>
                                        {options.length > 0 ? (
                                            options.map((opt: any) => (
                                                <option key={String(opt.value)} value={String(opt.value)}>
                                                    {opt.label}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No options available</option>
                                        )}
                                    </select>
                                ) : filterField.type === 'boolean' ? (
                                    <select
                                        value={filters[filterField.name] !== undefined ? String(filters[filterField.name]) : ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            onFilterChange(filterField.name, val === '' ? undefined : val === 'true');
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    >
                                        <option value="">All {filterField.label}</option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                ) : filterField.type === 'date' ? (
                                    <input
                                        type="date"
                                        placeholder={`Filter by ${filterField.label}`}
                                        value={filters[filterField.name] || ''}
                                        onChange={(e) => onFilterChange(filterField.name, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                ) : filterField.type === 'range' ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filters[filterField.name]?.min || ''}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                onFilterChange(filterField.name, {
                                                    ...filters[filterField.name],
                                                    min: isNaN(val) ? undefined : val
                                                });
                                            }}
                                            className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters[filterField.name]?.max || ''}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                onFilterChange(filterField.name, {
                                                    ...filters[filterField.name],
                                                    max: isNaN(val) ? undefined : val
                                                });
                                            }}
                                            className="w-1/2 px-2 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        />
                                    </div>
                                ) : (
                                    <input
                                        type={filterField.type === 'number' ? 'number' : 'text'}
                                        placeholder={`Filter by ${filterField.label}`}
                                        value={filters[filterField.name] || ''}
                                        onChange={(e) => {
                                            const val = filterField.type === 'number' 
                                                ? (e.target.value ? parseFloat(e.target.value) : '')
                                                : e.target.value;
                                            onFilterChange(filterField.name, val);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    />
                                )}
                            </div>
                        );
                    })}

                    {/* Clear Filters Button */}
                    <button
                        onClick={onClearFilters}
                        className="px-4 py-2 text-sm text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        Clear All
                    </button>
                </div>
            </div>
        </div>
    );
};