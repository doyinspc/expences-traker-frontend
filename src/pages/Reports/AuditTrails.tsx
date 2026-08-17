import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

const AuditTrails: React.FC = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Audit Trails" />
      <div className="space-y-6">
        <ComponentCard title="Audit Trails">
          <div className="p-4">
            <p className="text-gray-500 dark:text-gray-400">
              Audit Trails page content goes here.
            </p>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default AuditTrails;

