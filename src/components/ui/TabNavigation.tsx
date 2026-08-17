// src/components/ui/TabNavigation.tsx

import React from 'react';

type TabType = 'table' | 'analysis';

interface TabNavigationProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    hasAnalysis: boolean;
    recordCount: number;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
    activeTab,
    onTabChange,
    hasAnalysis,
    recordCount,
}) => {
    return (
        <div className="mb-4">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => onTabChange('table')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                        activeTab === 'table'
                            ? 'text-brand-600 border-b-2 border-brand-600 dark:text-brand-400 dark:border-brand-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                    Table View
                </button>
                {hasAnalysis && (
                    <button
                        onClick={() => onTabChange('analysis')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === 'analysis'
                                ? 'text-brand-600 border-b-2 border-brand-600 dark:text-brand-400 dark:border-brand-400'
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                        Analysis ({recordCount})
                    </button>
                )}
            </div>
        </div>
    );
};