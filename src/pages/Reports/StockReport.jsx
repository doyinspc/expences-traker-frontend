import React from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import StockLedgerPanel from '../Inventory/StockLedgerPanel';

export default function StockReport() {
  return <><PageBreadcrumb pageTitle="Stock report" /><p className="mb-4 text-sm text-gray-600 dark:text-gray-300">Choose an accounting year and reporting date. Review each item’s opening quantity, receipts, issues and closing balance, then export the report. Movement history provides the supporting records.</p><StockLedgerPanel reportOnly /></>;
}
