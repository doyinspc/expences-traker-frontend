// src/pages/Product/Income.jsx
import React from 'react';
import DisplayPage from './Components/DisplayPage';

const IncomesPage = () => {
    return (
        <DisplayPage
            table_name="incomes"
            table_path="income"
            page_size={20}
            document_type={7}
            page_code="INC"
        />
    );
};

export default IncomesPage;