import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import CompanyViewPage from "./CompanyViewPage";
import DynamicForm from "../../components/ui/DynamicForm";
import useTanstackQuery from "../../hooks/useTanstackQuery";
import { isArrayWithValue } from "../../actions/common";
import CompanyFileUpload from "./CompanyPhoto";
import { fiscalYearRange } from "../../utils/functions/reportPeriods";

const CompanyProfile: React.FC = () => {
  const [page, setPage] = useState<number>(0);

  const { data, loadQuery, loadUpdate, loadAdd, isLoading } = useTanstackQuery({
    table: "company",
    uniqueKey: "company",
    queryType: "gets",
    mainParam: {},
    narration: "get all company",
  });
   
    const handleUploadFile = async (formData: FormData) => {
        // POST to your backend endpoint
        formData.cat = "updateFile"
        return await loadUpdate(formData)
    };

    const handleRemoveFile = async (data: { id: number; photo: null; field: string }) => {
        data.cat = "removeFile"
        return await loadUpdate(data)
    };

  // Extract company object safely
  const company = isArrayWithValue(data) ? data[0] : {};

  // Check if company exists (has an ID) to determine Edit vs. Add mode
  const isEdit = Boolean(company?.id);

  const handleSave = async (formData: Record<string, any>) => {
    await loadUpdate(formData);
    await loadQuery();
    setPage(0);
  };
  const accountingYear=fiscalYearRange(company?.fiscal_year_start);
  const fetchCompany = () =>{

  }

  useEffect(() => {
    loadQuery();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-gray-500">Loading company details...</p>
      </div>
    );
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Company Profile" />
      <div className="space-y-6">
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200"><p className="font-semibold">{accountingYear ? `${accountingYear.label}: ${accountingYear.start_date} to ${accountingYear.end_date}` : "Set the accounting year in company details"}</p><ol className="mt-2 list-inside list-decimal space-y-1 leading-6"><li>Choose Edit under Company Details below.</li><li>Find Accounting Year Start. For January–December, choose 1 January; for April–March, choose 1 April.</li><li>Save the company details. Later reporting years follow the same start month and day automatically.</li><li>In Procurement → Stock, select the year and confirm its opening stock, or carry forward the previous year’s closing stock.</li></ol><p className="mt-2 leading-6">Stock carry forward closes the previous stock year. It does not close budgets or lock other financial records. Once stock history exists, changing its accounting calendar requires a reviewed migration.</p></div>
        <ComponentCard title="Company Profile">
          <div className="p-4">
            {page === 0 ? (
              <CompanyViewPage
                companyData={company}
                onEdit={() => setPage(1)}
                onPhoto={() => setPage(2)}
              />
            ) :null}
            {page === 1 ?  (
              <div className="space-y-6">
                <DynamicForm
                  tableName="company"
                  formType={isEdit ? "edit" : "add"}
                  title={isEdit ? "Edit Company Details" : "Add Company Details"}
                  submitLabel={isEdit ? "Update" : "Save"}
                  onSave={handleSave}
                  initialData={company}
                  onCancel={() => setPage(0)}
                  optionData={{}}
                />
              </div>
            ):null}
            {page === 2 ?  (
              <div className="space-y-6">
            <CompanyFileUpload
                companyData={company}
                fieldName="logo_path"
                fieldLabel="Logo"
                onUploadFile={handleUploadFile}
                onRemoveFile={handleRemoveFile}
                onSave={() => fetchCompany()}
                onClose={() => setPage(0)}
            />

            <CompanyFileUpload
                companyData={company}
                fieldName="favicon_path"
                fieldLabel="Favicon"
                onUploadFile={handleUploadFile}
                onRemoveFile={handleRemoveFile}
                onSave={() => fetchCompany()}
                onClose={() => setPage(0)}
            />
        </div>
            ):null}
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default CompanyProfile;
