import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

const Allocations: React.FC = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Allocations" />
      <div className="space-y-6">
        <ComponentCard title="Allocations">
          <div className="p-4">
            <p className="text-gray-500 dark:text-gray-400">
              Allocations page content goes here.
            </p>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default Allocations;

