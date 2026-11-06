// src/pages/Product/Requisition.js
import React from 'react';
import DisplayPage from './Components/DisplayPage';
import CashTransferCreateForm from './CashTransferCreateForm';
import CashTransferRegister from './CashTransferRegister';

const CashTransfersPage = () => {
    return (
        <DisplayPage
            table_name="cashtransfers"
            table_path="cashtransfer"
            page_size={20}
            document_type={6}
            page_code="CTF"
            renderListFooter={() => <CashTransferRegister />}
            renderCreateForm={({ onSave, onCancel, user, locationId }) => (
                <CashTransferCreateForm
                    onSave={onSave}
                    onCancel={onCancel}
                    user={user}
                    locationId={locationId}
                />
            )}
            // Uses default column visibility
        />
    );
};

export default CashTransfersPage;
