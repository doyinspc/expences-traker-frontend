// src/pages/Product/Requisition.js
import React from 'react';
import DisplayPage from './Components/DisplayPage';

const RequisitionsPage = () => {
    return (
        <DisplayPage
            table_name="requisitions"
            table_path="requisition"
            page_size={20}
            document_type={1}
            page_code="REQ"
            // Uses default column visibility
        />
    );
};

export default RequisitionsPage;