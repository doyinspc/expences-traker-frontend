import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

const Opex: React.FC = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="OPEX" />
      <div className="space-y-6">
        <ComponentCard title="OPEX">
          <div className="p-4">
            <p className="text-gray-500 dark:text-gray-400">
              OPEX page content goes here.
            </p>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default Opex;

