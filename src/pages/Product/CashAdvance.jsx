// src/pages/Product/Requisition.js
import React from 'react';
import DisplayPage from './Components/DisplayPage';

const CashAdvancesPage = () => {
    return (
        <DisplayPage
            table_name="cashadvances"
            table_path="cashadvance"
            page_size={20}
            document_type={3}
            page_code="CAV"
        />
    );
};

export default CashAdvancesPage;