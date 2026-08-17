import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

const ChartOfAccounts: React.FC = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Chart of Accounts" />
      <div className="space-y-6">
        <ComponentCard title="Chart of Accounts">
          <div className="p-4">
            <p className="text-gray-500 dark:text-gray-400">
              Chart of Accounts page content goes here.
            </p>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default ChartOfAccounts;

