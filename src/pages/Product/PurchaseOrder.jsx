// src/pages/Procurement/PurchaseOrders/index.tsx
import React from 'react';
import DisplayPage from './Components/DisplayPage';
import PurchasingSetupNotice from '../../components/procurement/PurchasingSetupNotice';


const PurchaseOrdersPage = () => {
    return (
        <><PurchasingSetupNotice/><DisplayPage
            table_name="purchaseorders"
            table_path="purchaseorder"
            page_size={20}
            document_type={2}
            page_code="PO"
        /></>
    );
};

export default PurchaseOrdersPage;
