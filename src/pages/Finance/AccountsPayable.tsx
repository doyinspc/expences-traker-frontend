import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

const AccountsPayable: React.FC = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Accounts Payable" />
      <div className="space-y-6">
        <ComponentCard title="Accounts Payable">
          <div className="p-4">
            <p className="text-gray-500 dark:text-gray-400">
              Accounts Payable page content goes here.
            </p>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default AccountsPayable;

