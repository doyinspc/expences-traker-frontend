import React from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import StockLedgerPanel from './StockLedgerPanel';

const StockLevels: React.FC = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Stock Levels" />
      <div className="space-y-6">
        <StockLedgerPanel />
      </div>
    </>
  );
};

export default StockLevels;

