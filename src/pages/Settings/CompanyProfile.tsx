import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

const CompanyProfile: React.FC = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Company Profile" />
      <div className="space-y-6">
        <ComponentCard title="Company Profile">
          <div className="p-4">
            <p className="text-gray-500 dark:text-gray-400">
              Company Profile page content goes here.
            </p>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default CompanyProfile;

