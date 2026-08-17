import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

const CashFlow: React.FC = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Cash Flow" />
      <div className="space-y-6">
        <ComponentCard title="Cash Flow">
          <div className="p-4">
            <p className="text-gray-500 dark:text-gray-400">
              Cash Flow page content goes here.
            </p>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default CashFlow;

