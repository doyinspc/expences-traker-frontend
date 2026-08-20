// src/pages/Product/Stock.jsx
import React from 'react';
import DisplayPage from './Components/DisplayPage';

const StocksPage = () => {
    return (
        <DisplayPage
            table_name="stocks"
            table_path="stock"
            page_size={20}
            document_type={8}
            page_code="STK"
        />
    );
};

export default StocksPage;