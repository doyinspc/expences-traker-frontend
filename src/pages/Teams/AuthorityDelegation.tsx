import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";

const AuthorityDelegation: React.FC = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Authority Delegation" />
      <div className="space-y-6">
        <ComponentCard title="Authority Delegation">
          <div className="p-4">
            <p className="text-gray-500 dark:text-gray-400">
              Authority Delegation page content goes here.
            </p>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default AuthorityDelegation;

