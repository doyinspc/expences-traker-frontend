// src/pages/Product/Requisition.js
import React from 'react';
import DisplayPage from './Components/DisplayPage';

const CashTransfersPage = () => {
    return (
        <DisplayPage
            table_name="cashtransfers"
            table_path="cashtransfer"
            page_size={20}
            document_type={6}
            page_code="CTF"
            // Uses default column visibility
        />
    );
};

export default CashTransfersPage;