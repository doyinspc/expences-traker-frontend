import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

const Budgets: React.FC = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Budgets" />
      <div className="space-y-6">
        <ComponentCard title="Budgets">
          <div className="p-4">
            <p className="text-gray-500 dark:text-gray-400">
              Budgets page content goes here.
            </p>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default Budgets;

