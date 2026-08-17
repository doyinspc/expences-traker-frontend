import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

const ExpenseAsset: React.FC = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Expense vs Asset" />
      <div className="space-y-6">
        <ComponentCard title="Expense vs Asset">
          <div className="p-4">
            <p className="text-gray-500 dark:text-gray-400">
              Expense vs Asset page content goes here.
            </p>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default ExpenseAsset;

