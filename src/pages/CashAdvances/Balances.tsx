import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

const Balances: React.FC = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Balances" />
      <div className="space-y-6">
        <ComponentCard title="Balances">
          <div className="p-4">
            <p className="text-gray-500 dark:text-gray-400">
              Balances page content goes here.
            </p>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default Balances;

