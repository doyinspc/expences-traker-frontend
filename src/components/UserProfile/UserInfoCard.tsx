// src/components/UserInfoCard.tsx

import React from 'react';
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import PhoneInput from "../form/group-input/PhoneInput";

// ==================== TYPES ====================

interface UserData {
  id?: string | number;
  employee_id?: string;
  photo?: string;
  title?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  date_of_birth?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  employment_type?: string;
  employment_date?: string;
  job_title?: string;
  department_id?: string | number;
  department_name?: string;
  is_active?: boolean;
  last_login_at?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
}

interface UserInfoCardProps {
  user: UserData;
  onSave?: (data: UserData) => void;
  loading?: boolean;
  className?: string;
  showEdit?: boolean;
  fields?: string[]; // Custom fields to show
  labels?: Record<string, string>; // Custom labels
  readOnly?: boolean;
}

// ==================== DEFAULT CONFIG ====================

const DEFAULT_FIELDS = [
  'employee_id',
  'first_name',
  'last_name',
  'email',
  'phone',
  'job_title',
  'department_name',
  'employment_type',
  'date_of_birth',
  'country',
  'city',
  'state',
  'address_line1',
  'address_line2',
  'postal_code',
  'is_active',
  'last_login_at',
  'created_at',
];

const DEFAULT_LABELS: Record<string, string> = {
  employee_id: 'Employee ID',
  first_name: 'First Name',
  middle_name: 'Middle Name',
  last_name: 'Last Name',
  email: 'Email Address',
  phone: 'Phone Number',
  date_of_birth: 'Date of Birth',
  address_line1: 'Address Line 1',
  address_line2: 'Address Line 2',
  city: 'City',
  state: 'State/Province',
  country: 'Country',
  postal_code: 'Postal Code',
  employment_type: 'Employment Type',
  employment_date: 'Employment Date',
  job_title: 'Job Title',
  department_name: 'Department',
  is_active: 'Status',
  last_login_at: 'Last Login',
  created_at: 'Created Date',
  updated_at: 'Updated Date',
  bio: 'Bio',
};

// ==================== COMPONENT ====================

const UserInfoCard: React.FC<UserInfoCardProps> = ({
  user = {},
  onSave,
  loading = false,
  className = '',
  showEdit = true,
  fields = DEFAULT_FIELDS,
  labels = DEFAULT_LABELS,
  readOnly = false,
}) => {
  const { isOpen, openModal, closeModal } = useModal();
  
  // State for editing
  const [editData, setEditData] = React.useState<UserData>(user);
  const [isSaving, setIsSaving] = React.useState(false);

  // Update edit data when user changes
  React.useEffect(() => {
    setEditData(user);
  }, [user]);

  // ==================== HANDLERS ====================

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(editData);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving user data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  // ==================== HELPERS ====================

  const getFieldValue = (field: string): string => {
    const value = user[field as keyof UserData];
    if (value === undefined || value === null) return '-';
    if (typeof value === 'boolean') return value ? 'Active' : 'Inactive';
    if (field === 'date_of_birth' || field === 'employment_date' || field === 'last_login_at' || field === 'created_at') {
      if (value) {
        const date = new Date(value);
        return date.toLocaleDateString();
      }
      return '-';
    }
    return String(value);
  };

  const getFieldType = (field: string): string => {
    const typeMap: Record<string, string> = {
      email: 'email',
      phone: 'phone',
      date_of_birth: 'date',
      employment_date: 'date',
      is_active: 'toggle',
      address_line1: 'textarea',
      address_line2: 'textarea',
      bio: 'textarea',
    };
    return typeMap[field] || 'text';
  };

  const getFieldLabel = (field: string): string => {
    return labels[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderFieldValue = (field: string): React.ReactNode => {
    const value = user[field as keyof UserData];
    
    if (field === 'is_active') {
      return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      );
    }

    if (field === 'photo' && value) {
      return (
        <img 
          src={String(value)} 
          alt="Profile" 
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
        />
      );
    }

    if (field === 'department_name' && value) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          {String(value)}
        </span>
      );
    }

    return getFieldValue(field);
  };

  // ==================== RENDER EDIT FIELD ====================

  const renderEditField = (field: string): React.ReactNode => {
    const value = editData[field as keyof UserData] || '';
    const type = getFieldType(field);
    const label = getFieldLabel(field);

    if (field === 'is_active') {
      return (
        <div key={field} className="flex items-center gap-3">
          <input
            type="checkbox"
            id={`edit-${field}`}
            checked={!!value}
            onChange={(e) => handleInputChange(field, e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <Label htmlFor={`edit-${field}`}>{label}</Label>
        </div>
      );
    }

    if (field === 'phone') {
      return (
        <div key={field}>
          <Label>{label}</Label>
          <PhoneInput
            value={String(value)}
            onChange={(phoneNumber: string) => handleInputChange(field, phoneNumber)}
            placeholder="Enter phone number"
            className="w-full"
          />
        </div>
      );
    }

    if (field === 'date_of_birth' || field === 'employment_date') {
      return (
        <div key={field}>
          <Label>{label}</Label>
          <Input
            type="date"
            value={String(value || '')}
            onChange={(e) => handleInputChange(field, e.target.value)}
          />
        </div>
      );
    }

    if (field === 'address_line1' || field === 'address_line2' || field === 'bio') {
      return (
        <div key={field}>
          <Label>{label}</Label>
          <textarea
            value={String(value)}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 transition-colors"
            rows={field === 'bio' ? 4 : 2}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        </div>
      );
    }

    return (
      <div key={field}>
        <Label>{label}</Label>
        <Input
          type={type === 'email' ? 'email' : 'text'}
          value={String(value)}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      </div>
    );
  };

  // ==================== RENDER ====================

  // Filter fields that exist on user
  const visibleFields = fields.filter(field => user[field as keyof UserData] !== undefined);

  // Group fields for display
  const identityFields = ['employee_id', 'photo', 'title', 'first_name', 'middle_name', 'last_name'];
  const contactFields = ['email', 'phone'];
  const addressFields = ['address_line1', 'address_line2', 'city', 'state', 'country', 'postal_code'];
  const employmentFields = ['employment_type', 'employment_date', 'job_title', 'department_name'];
  const statusFields = ['is_active', 'last_login_at', 'created_at', 'updated_at'];
  const bioFields = ['bio'];

  const getFieldGroup = (field: string): string => {
    if (identityFields.includes(field)) return 'identity';
    if (contactFields.includes(field)) return 'contact';
    if (addressFields.includes(field)) return 'address';
    if (employmentFields.includes(field)) return 'employment';
    if (statusFields.includes(field)) return 'status';
    if (bioFields.includes(field)) return 'bio';
    return 'other';
  };

  const groupLabels: Record<string, string> = {
    identity: 'Identity',
    contact: 'Contact Information',
    address: 'Address',
    employment: 'Employment Details',
    status: 'Status & Audit',
    bio: 'About',
    other: 'Additional Information',
  };

  // Group visible fields
  const groupedFields: Record<string, string[]> = {};
  visibleFields.forEach(field => {
    const group = getFieldGroup(field);
    if (!groupedFields[group]) groupedFields[group] = [];
    groupedFields[group].push(field);
  });

  // Sort groups
  const groupOrder = ['identity', 'contact', 'address', 'employment', 'bio', 'status', 'other'];
  const sortedGroups = groupOrder.filter(g => groupedFields[g]);

  // ==================== MAIN RENDER ====================

  return (
    <div className={`p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 ${className}`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          {/* User Avatar/Photo */}
          {user.photo && (
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={user.photo} 
                alt={`${user.first_name} ${user.last_name}`}
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
              />
              <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {user.title} {user.first_name} {user.middle_name} {user.last_name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.employee_id || 'No employee ID'}
                </p>
              </div>
            </div>
          )}

          {/* Personal Information Header */}
          {!user.photo && (
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Personal Information
            </h4>
          )}

          {/* Display Fields */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            {visibleFields.map((field) => {
              // Skip photo (displayed above)
              if (field === 'photo') return null;
              
              return (
                <div key={field}>
                  <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                    {getFieldLabel(field)}
                  </p>
                  <div className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {renderFieldValue(field)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Edit Button */}
        {showEdit && !readOnly && (
          <button
            onClick={openModal}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>
        )}
      </div>

      {/* ==================== EDIT MODAL ==================== */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>

          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              {sortedGroups.map((group) => (
                <div key={group} className="mt-7 first:mt-0">
                  <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                    {groupLabels[group] || group}
                  </h5>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    {groupedFields[group].map((field) => (
                      <div 
                        key={field} 
                        className={['address_line1', 'address_line2', 'bio'].includes(field) ? 'col-span-2' : 'col-span-2 lg:col-span-1'}
                      >
                        {renderEditField(field)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} disabled={isSaving}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default UserInfoCard;