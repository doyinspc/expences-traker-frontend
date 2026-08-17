import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

const Retirements: React.FC = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Retirements" />
      <div className="space-y-6">
        <ComponentCard title="Retirements">
          <div className="p-4">
            <p className="text-gray-500 dark:text-gray-400">
              Retirements page content goes here.
            </p>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default Retirements;

