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
        loadUpdate(formData)
    };

    const handleRemoveFile = async (data: { id: number; photo: null; field: string }) => {
        data.cat = "removeFile"
        loadUpdate(data)
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
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200"><p className="font-semibold">{accountingYear ? `${accountingYear.label}: ${accountingYear.start_date} to ${accountingYear.end_date}` : "Set the accounting year in company details"}</p><p className="mt-1 leading-6">The start month and day define each annual reporting period. Budget approval, budget closure and accounting-period locking are separate operations.</p></div>
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