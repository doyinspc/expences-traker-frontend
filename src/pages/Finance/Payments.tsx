import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

const Payments: React.FC = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Payments" />
      <div className="space-y-6">
        <ComponentCard title="Payments">
          <div className="p-4">
            <p className="text-gray-500 dark:text-gray-400">
              Payments page content goes here.
            </p>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default Payments;

