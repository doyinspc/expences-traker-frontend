// src/components/ui/InfoPanel.tsx

import React from 'react';
import { CloseIcon } from './TableIcons';

interface InfoPanelProps {
    show: boolean;
    tableMapping: any;
    filterableFields: string[];
    analyzableFields: string[];
    analysisConfig: any;
    onClose: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
    show,
    tableMapping,
    filterableFields,
    analyzableFields,
    analysisConfig,
    onClose,
}) => {
    if (!show || !tableMapping) return null;

    return (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                        {tableMapping.displayName || tableMapping.tableName}
                    </h3>
                    <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                        {tableMapping.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-4">
                        <div>
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Routes:</span>
                            <span className="ml-1 text-sm text-blue-700 dark:text-blue-300">
                                {tableMapping.frontendRoutes?.join(', ') || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Total Fields:</span>
                            <span className="ml-1 text-sm text-blue-700 dark:text-blue-300">
                                {Object.keys(tableMapping.fields || {}).length}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Filterable:</span>
                            <span className="ml-1 text-sm text-blue-700 dark:text-blue-300">
                                {filterableFields.length}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Analyzable:</span>
                            <span className="ml-1 text-sm text-blue-700 dark:text-blue-300">
                                {analyzableFields.length}
                            </span>
                        </div>
                        {analysisConfig?.enabled && (
                            <div>
                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Analysis:</span>
                                <span className="ml-1 text-sm text-green-600 dark:text-green-400">Enabled</span>
                            </div>
                        )}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    <CloseIcon />
                </button>
            </div>
        </div>
    );
};