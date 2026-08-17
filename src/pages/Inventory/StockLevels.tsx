import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

const StockLevels: React.FC = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Stock Levels" />
      <div className="space-y-6">
        <ComponentCard title="Stock Levels">
          <div className="p-4">
            <p className="text-gray-500 dark:text-gray-400">
              Stock Levels page content goes here.
            </p>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default StockLevels;

