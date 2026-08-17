import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

const FixedAssets: React.FC = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Fixed Assets" />
      <div className="space-y-6">
        <ComponentCard title="Fixed Assets">
          <div className="p-4">
            <p className="text-gray-500 dark:text-gray-400">
              Fixed Assets page content goes here.
            </p>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default FixedAssets;

