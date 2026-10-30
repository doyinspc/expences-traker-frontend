// src/pages/Product/Stock.jsx
import React from 'react';
import DisplayPage from './Components/DisplayPage';
import StockLedgerPanel from '../Inventory/StockLedgerPanel';

const StocksPage = () => {
    return (
        <>
        <StockLedgerPanel />
        <p className="mb-4 rounded-lg border border-gray-200 p-3 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">Existing stock documents are retained below for reference. Use Stock balances & movements above for confirmed opening quantities, procurement receipts and issues to requisitions.</p>
        <DisplayPage
            table_name="stocks"
            table_path="stock"
            page_size={20}
            document_type={8}
            page_code="STK"
        />
        </>
    );
};

export default StocksPage;
