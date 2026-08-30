import React, { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import CompanyViewPage from "./CompanyViewPage";
import DynamicForm from "../../components/ui/DynamicForm";
import useTanstackQuery from "../../hooks/useTanstackQuery";
import { isArrayWithValue } from "../../actions/common";
import CompanyFileUpload from "./CompanyPhoto";

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

  const handleSave = (formData: Record<string, any>) => {
    if (isEdit) {
      loadUpdate(formData);
    } else {
      // Calls loadAdd (or loadSave) if it's a new company
      if (loadAdd) {
        loadAdd(formData);
      } else {
        loadUpdate({ ...formData, mode: "add" });
      }
    }
    setPage(0); // Return to view mode after save
  };
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