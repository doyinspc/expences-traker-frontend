import React from 'react';
import DisplayPage from './Components/DisplayPage';
import PurchasingSetupNotice from '../../components/procurement/PurchasingSetupNotice';

export default function ProcurementPage() {
  return (
    <>
      <PurchasingSetupNotice />
      <DisplayPage
        table_name="procurements"
        table_path="procurement"
        page_size={20}
        document_type={9}
        page_code="PRC"
      />
    </>
  );
}
