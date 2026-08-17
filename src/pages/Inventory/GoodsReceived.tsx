import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

const GoodsReceived: React.FC = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Goods Received (GRN)" />
      <div className="space-y-6">
        <ComponentCard title="Goods Received (GRN)">
          <div className="p-4">
            <p className="text-gray-500 dark:text-gray-400">
              Goods Received (GRN) page content goes here.
            </p>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default GoodsReceived;

