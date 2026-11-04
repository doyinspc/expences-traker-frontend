import React from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import StockLedgerPanel from '../Inventory/StockLedgerPanel';

export default function StocksPage() {
    return <><PageBreadcrumb pageTitle="Stock" /><StockLedgerPanel /></>;
}
