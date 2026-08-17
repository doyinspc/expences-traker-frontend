import { CFormInput, CFormSelect } from "@coreui/react";
//import ActionButtons from "../../components/ActionButtons";
import ReusableSelectTanstack from "../../components/ReusableSelectTanstack";
import { ageFunction, dateFunction, dateTimeFunction, moneyFunction } from "../functions/basci";
import ActionButtons from "../../components/tools/ActionButton";

// export const student_schema = [
//   { label: 'id', name: 'id', type: 'text', showForm: false, showTable: false, editable: true, element: null, category: 'Biodata', format: null, className: '', formItemWidth: 'w-full' },
//   { label: 'School ID', name: 'schoolid', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'School Name', name: 'schoolname', type: 'select', showForm: true, showTable: true, editable: true, element: (e) => CFormSelect(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'Adm. No.', name: 'admission_no', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2', meta:{style:{maxWidth:'100px'}} },
//   { label: 'Full Name', name: 'fullname', type: 'select', showForm: true, showTable: true, editable: true, element: (e) => CFormSelect(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2', meta:{style:{minWidth:'350px'}} },
//   { label: 'Class', name: 'classunitname', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2', meta:{style:{maxWidth:'100px'}} },
//   { label: 'Admission No X', name: 'admission_nox', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'Old Admission No', name: 'oldadmission_no', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'Surname', name: 'surname', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/3' },
//   { label: 'First Name', name: 'firstname', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/3' },
//   { label: 'Middle Name', name: 'middlename', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/3' },
//   { label: 'Gender', name: 'gender', type: 'select', showForm: true, showTable: true, editable: true, element: (e) => CFormSelect(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/3' },
//   { label: 'Date of Birth', name: 'dob', type: 'date', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: dateFunction, className: '', formItemWidth: 'w-full md:w-1/3' },
//   { label: 'Age', name: 'age', type: 'text', showForm: false, showTable: true, editable: false, element: null, category: 'Biodata', format: ageFunction, className: '', formItemWidth: 'w-full md:w-1/3' },
//   { label: 'Date of Admission', name: 'doa', type: 'date', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: dateFunction, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'State of Origin', name: 'soo', type: 'select', showForm: true, showTable: true, editable: true, element: (e) => CFormSelect(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'Religion', name: 'religion', type: 'select', showForm: true, showTable: true, editable: true, element: (e) => CFormSelect(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'LGA', name: 'lga', type: 'select', showForm: true, showTable: true, editable: true, element: (e) => CFormSelect(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'Ward', name: 'ward', type: 'select', showForm: true, showTable: true, editable: true, element: (e) => CFormSelect(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'Nationality', name: 'nationality', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full' },
//   { label: 'National Identity Number', name: 'nin', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full' },
//   { label: 'Learners Identification Number', name: 'lin', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full' },
//   { label: 'Current Class', name: 'cclass', type: 'select', showForm: true, showTable: true, editable: true, element: (e) => CFormSelect(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'Is Active', name: 'is_active', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   // FIXED: Changed full-width colons to regular colons
//   { label: 'Is Deleted', name: 'is_delete', type: 'text', showForm: false, showTable: false, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full' },
//   // FIXED: Changed full-width colons to regular colons
//   { label: 'Date Created', name: 'date_created', type: 'date', showForm: false, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: dateTimeFunction, className: '', formItemWidth: 'w-full' },
//   { label: 'Date Updated', name: 'date_updated', type: 'date', showForm: false, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: dateTimeFunction, className: '', formItemWidth: 'w-full' },
//   { label: 'Photo', name: 'photo', type: 'text', showForm: true, showTable: false, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full' },
//   { label: 'Photo 1', name: 'photo1', type: 'text', showForm: true, showTable: false, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full' },
//   { label: 'Photo 2', name: 'photo2', type: 'text', showForm: true, showTable: false, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full' },
//   { label: 'Photo 3', name: 'photo3', type: 'text', showForm: true, showTable: false, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full' },
//   { label: 'House', name: 'house', type: 'select', showForm: true, showTable: true, editable: true, element: (e) => CFormSelect(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'Place', name: 'place', type: 'select', showForm: true, showTable: true, editable: true, element: (e) => CFormSelect(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'Admit', name: 'admit', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full' },
//   { label: 'Parent ID', name: 'parentid', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Primary Guardian', format: null, className: '', formItemWidth: 'w-full' },
//   { label: 'Primary Guardian Name', name: 'g1_name', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Primary Guardian', format: null, className: '', formItemWidth: 'w-full' },
//   { label: 'Primary Guardian Address', name: 'g1_address', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Primary Guardian', format: null, className: '', formItemWidth: 'w-full' },
//   { label: 'Primary Guardian Relationship', name: 'g1_rel', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Primary Guardian', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'Primary Guardian Phone 1', name: 'g1_phone1', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Primary Guardian', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'Primary Guardian Phone 2', name: 'g1_phone2', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Primary Guardian', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'Primary Guardian Email', name: 'g1_email', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Primary Guardian', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'Secondary Guardian Name', name: 'g2_name', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Secondary Guardian', format: null, className: '', formItemWidth: 'w-full' },
//   { label: 'Secondary Guardian Address', name: 'g2_address', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Secondary Guardian', format: null, className: '', formItemWidth: 'w-full' },
//   { label: 'Secondary Guardian Relationship', name: 'g2_rel', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Secondary Guardian', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'Secondary Guardian Phone 1', name: 'g2_phone1', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Secondary Guardian', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'Secondary Guardian Phone 2', name: 'g2_phone2', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Secondary Guardian', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'Secondary Guardian Email', name: 'g2_email', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Secondary Guardian', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'Primary Guardian Place', name: 'g1_place', type: 'select', showForm: true, showTable: true, editable: true, element: (e) => CFormSelect(e), category: 'Primary Guardian', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'Secondary Guardian Place', name: 'g2_place', type: 'select', showForm: true, showTable: true, editable: true, element: (e) => CFormSelect(e), category: 'Secondary Guardian', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
//   { label: 'Is Email Confirmed', name: 'is_email_confirmed', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full' },
// ];

// ============================================
// FORMAT FUNCTIONS DEFINITION
// ============================================

// Default format function - can be customized based on your needs
const formattype = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

// Define all format functions
const formatFunctions = {
  // Default format
  default: (value) => {
    if (value === null || value === undefined) return '';
    return String(value);
  },
  capitalizeFirst: (value) => {
    if (!value) return '';
    const str = String(value).toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  
  // Capitalize first letter of every word (converts to lowercase first, then capitalizes each word)
  capitalizeWords: (value) => {
    if (!value) return '';
    return String(value)
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  },
  // Uppercase format
  uppercase: (value) => {
    if (!value) return '';
    return String(value).toUpperCase();
  },
  
  // Title case format (capitalizes first letter of each word)
  titleCase: (value) => {
    if (!value) return '';
    return String(value).toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  },
  
  // Lowercase format
  lowercase: (value) => {
    if (!value) return '';
    return String(value).toLowerCase();
  },
  
  // Numbers only (removes all non-digit characters)
  numbersOnly: (value) => {
    if (!value) return '';
    return String(value).replace(/\D/g, '');
  },
  
  // Phone number format (numbers only, max 11 digits)
  phoneNumber: (value) => {
    if (!value) return '';
    return String(value).replace(/\D/g, '').slice(0, 11);
  },
  
  // Email format (lowercase and trimmed)
  email: (value) => {
    if (!value) return '';
    return String(value).toLowerCase().trim();
  },
  
  // Date format (converts to locale date string)
  date: (value) => {
    if (!value) return '';
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return '';
    }
  },
  
  // Date format with custom pattern (YYYY-MM-DD)
  dateISO: (value) => {
    if (!value) return '';
    try {
      const date = new Date(value);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  },
  
  // Datetime format
  datetime: (value) => {
    if (!value) return '';
    try {
      return new Date(value).toLocaleString();
    } catch {
      return '';
    }
  },
  
  // Age format (adds "years" suffix)
  age: (value) => {
    if (!value) return '';
    return `${value} years`;
  },
  
  // Currency format
  currency: (value) => {
    if (!value) return '';
    const num = parseFloat(value);
    if (isNaN(num)) return String(value);
    return `₦${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  },
  
  // Percentage format
  percentage: (value) => {
    if (!value) return '';
    const num = parseFloat(value);
    if (isNaN(num)) return String(value);
    return `${num.toFixed(2)}%`;
  },
  
  // Boolean format with custom labels
  boolean: (value, trueText = 'Yes', falseText = 'No') => {
    if (value === null || value === undefined) return '';
    return value ? trueText : falseText;
  },
  
  // Boolean format for Active/Inactive
  activeStatus: (value) => {
    if (value === null || value === undefined) return '';
    return value ? 'Active' : 'Inactive';
  },
  
  // Boolean format for Deleted status
  deletedStatus: (value) => {
    if (value === null || value === undefined) return '';
    return value ? 'Deleted' : 'Active';
  },
  
  // Boolean format for Confirmed status
  confirmedStatus: (value) => {
    if (value === null || value === undefined) return '';
    return value ? 'Confirmed' : 'Pending';
  },
  
  // Truncate text with max length
  truncate: (value, maxLength = 50) => {
    if (!value) return '';
    const str = String(value);
    return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
  },
  
  // No formatting (return as is)
  none: (value) => value
};

// ============================================
// STUDENT SCHEMA WITH FORMAT FUNCTIONS
// ============================================

export const student_schema = [
  // ID field - no format needed
  { 
    label: 'id', 
    name: 'id', 
    type: 'text', 
    showForm: false, 
    showTable: false, 
    editable: true, 
    element: null, 
    category: 'Biodata', 
    format: null, 
    className: '', 
    formItemWidth: 'w-full' 
  },
  
  // School ID - uppercase
  { 
    label: 'School ID', 
    name: 'schoolid', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.uppercase, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // School Name - default format
  { 
    label: 'School Name', 
    name: 'schoolname', 
    type: 'select', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormSelect(e), 
    category: 'Biodata', 
    format: formatFunctions.capitalizeWords,
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // Admission No - uppercase
  { 
    label: 'Adm. No.', 
    name: 'admission_no', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.uppercase, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2', 
    meta: { style: { maxWidth: '100px' } } 
  },
  
  // Full Name - title case
  { 
    label: 'Full Name', 
    name: 'fullname', 
    type: 'select', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormSelect(e), 
    category: 'Biodata', 
    format: formatFunctions.titleCase, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2', 
    meta: { style: { minWidth: '350px' } } 
  },
  
  // Class - uppercase
  { 
    label: 'Class', 
    name: 'classunitname', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.uppercase, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2', 
    meta: { style: { maxWidth: '100px' } } 
  },
  
  // Admission No X - uppercase
  { 
    label: 'Admission No X', 
    name: 'admission_nox', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.uppercase, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // Old Admission No - uppercase
  { 
    label: 'Old Admission No', 
    name: 'oldadmission_no', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.uppercase, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // Surname - title case
  { 
    label: 'Surname', 
    name: 'surname', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.titleCase, 
    className: '', 
    formItemWidth: 'w-full md:w-1/3' 
  },
  
  // First Name - title case
  { 
    label: 'First Name', 
    name: 'firstname', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.titleCase, 
    className: '', 
    formItemWidth: 'w-full md:w-1/3' 
  },
  
  // Middle Name - title case
  { 
    label: 'Middle Name', 
    name: 'middlename', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.titleCase, 
    className: '', 
    formItemWidth: 'w-full md:w-1/3' 
  },
  
  // Gender - default format
  { 
    label: 'Gender', 
    name: 'gender', 
    type: 'select', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormSelect(e), 
    category: 'Biodata', 
    format: formatFunctions.uppercase, 
    className: '', 
    formItemWidth: 'w-full md:w-1/3' 
  },
  
  // Date of Birth - date format
  { 
    label: 'Date of Birth', 
    name: 'dob', 
    type: 'date', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.date, 
    className: '', 
    formItemWidth: 'w-full md:w-1/3' 
  },
  
  // Age - age format
  { 
    label: 'Age', 
    name: 'age', 
    type: 'text', 
    showForm: false, 
    showTable: true, 
    editable: false, 
    element: null, 
    category: 'Biodata', 
    format: ageFunction, 
    className: '', 
    formItemWidth: 'w-full md:w-1/3' 
  },
  
  // Date of Admission - date format
  { 
    label: 'Date of Admission', 
    name: 'doa', 
    type: 'date', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.date, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // State of Origin - default format
  { 
    label: 'State of Origin', 
    name: 'soo', 
    type: 'select', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormSelect(e), 
    category: 'Biodata', 
    format: formatFunctions.default, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // Religion - default format
  { 
    label: 'Religion', 
    name: 'religion', 
    type: 'select', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormSelect(e), 
    category: 'Biodata', 
    format: formatFunctions.titleCase, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // LGA - default format
  { 
    label: 'LGA', 
    name: 'lga', 
    type: 'select', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormSelect(e), 
    category: 'Biodata', 
    format: formatFunctions.capitalizeWords, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // Ward - default format
  { 
    label: 'Ward', 
    name: 'ward', 
    type: 'select', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormSelect(e), 
    category: 'Biodata', 
    format: formatFunctions.capitalizeWords, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // Nationality - uppercase
  { 
    label: 'Nationality', 
    name: 'nationality', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.uppercase, 
    className: '', 
    formItemWidth: 'w-full' 
  },
  
  // NIN - numbers only
  { 
    label: 'National Identity Number', 
    name: 'nin', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.numbersOnly, 
    className: '', 
    formItemWidth: 'w-full' 
  },
  
  // LIN - numbers only
  { 
    label: 'Learners Identification Number', 
    name: 'lin', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.numbersOnly, 
    className: '', 
    formItemWidth: 'w-full' 
  },
  
  // Current Class - uppercase
  { 
    label: 'Current Class', 
    name: 'cclass', 
    type: 'select', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormSelect(e), 
    category: 'Biodata', 
    format: formatFunctions.uppercase, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // Is Active - active status format
  { 
    label: 'Is Active', 
    name: 'is_active', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.activeStatus, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // Is Deleted - deleted status format
  { 
    label: 'Is Deleted', 
    name: 'is_delete', 
    type: 'text', 
    showForm: false, 
    showTable: false, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.deletedStatus, 
    className: '', 
    formItemWidth: 'w-full' 
  },
  
  // Date Created - datetime format
  { 
    label: 'Date Created', 
    name: 'date_created', 
    type: 'date', 
    showForm: false, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.datetime, 
    className: '', 
    formItemWidth: 'w-full' 
  },
  
  // Date Updated - datetime format
  { 
    label: 'Date Updated', 
    name: 'date_updated', 
    type: 'date', 
    showForm: false, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.datetime, 
    className: '', 
    formItemWidth: 'w-full' 
  },
  
  // Photo - default format
  { 
    label: 'Photo', 
    name: 'photo', 
    type: 'text', 
    showForm: true, 
    showTable: false, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.default, 
    className: '', 
    formItemWidth: 'w-full' 
  },
  
  // Photo 1 - default format
  { 
    label: 'Photo 1', 
    name: 'photo1', 
    type: 'text', 
    showForm: true, 
    showTable: false, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.default, 
    className: '', 
    formItemWidth: 'w-full' 
  },
  
  // Photo 2 - default format
  { 
    label: 'Photo 2', 
    name: 'photo2', 
    type: 'text', 
    showForm: true, 
    showTable: false, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.default, 
    className: '', 
    formItemWidth: 'w-full' 
  },
  
  // Photo 3 - default format
  { 
    label: 'Photo 3', 
    name: 'photo3', 
    type: 'text', 
    showForm: true, 
    showTable: false, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.default, 
    className: '', 
    formItemWidth: 'w-full' 
  },
  
  // House - default format
  { 
    label: 'House', 
    name: 'house', 
    type: 'select', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormSelect(e), 
    category: 'Biodata', 
    format: formatFunctions.default, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // Place - default format
  { 
    label: 'Place', 
    name: 'place', 
    type: 'select', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormSelect(e), 
    category: 'Biodata', 
    format: formatFunctions.default, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // Admit - default format
  { 
    label: 'Admit', 
    name: 'admit', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.default, 
    className: '', 
    formItemWidth: 'w-full' 
  },
  
  // Parent ID - default format
  { 
    label: 'Parent ID', 
    name: 'parentid', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Primary Guardian', 
    format: formatFunctions.default, 
    className: '', 
    formItemWidth: 'w-full' 
  },
  
  // Primary Guardian Name - title case
  { 
    label: 'Primary Guardian Name', 
    name: 'g1_name', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Primary Guardian', 
    format: formatFunctions.titleCase, 
    className: '', 
    formItemWidth: 'w-full' 
  },
  
  // Primary Guardian Address - default format
  { 
    label: 'Primary Guardian Address', 
    name: 'g1_address', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Primary Guardian', 
    format: formatFunctions.default, 
    className: '', 
    formItemWidth: 'w-full' 
  },
  
  // Primary Guardian Relationship - default format
  { 
    label: 'Primary Guardian Relationship', 
    name: 'g1_rel', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Primary Guardian', 
    format: formatFunctions.default, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // Primary Guardian Phone 1 - phone number format
  { 
    label: 'Primary Guardian Phone 1', 
    name: 'g1_phone1', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Primary Guardian', 
    format: formatFunctions.phoneNumber, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // Primary Guardian Phone 2 - phone number format
  { 
    label: 'Primary Guardian Phone 2', 
    name: 'g1_phone2', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Primary Guardian', 
    format: formatFunctions.phoneNumber, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // Primary Guardian Email - email format
  { 
    label: 'Primary Guardian Email', 
    name: 'g1_email', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Primary Guardian', 
    format: formatFunctions.email, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // Secondary Guardian Name - title case
  { 
    label: 'Secondary Guardian Name', 
    name: 'g2_name', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Secondary Guardian', 
    format: formatFunctions.titleCase, 
    className: '', 
    formItemWidth: 'w-full' 
  },
  
  // Secondary Guardian Address - default format
  { 
    label: 'Secondary Guardian Address', 
    name: 'g2_address', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Secondary Guardian', 
    format: formatFunctions.default, 
    className: '', 
    formItemWidth: 'w-full' 
  },
  
  // Secondary Guardian Relationship - default format
  { 
    label: 'Secondary Guardian Relationship', 
    name: 'g2_rel', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Secondary Guardian', 
    format: formatFunctions.default, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // Secondary Guardian Phone 1 - phone number format
  { 
    label: 'Secondary Guardian Phone 1', 
    name: 'g2_phone1', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Secondary Guardian', 
    format: formatFunctions.phoneNumber, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // Secondary Guardian Phone 2 - phone number format
  { 
    label: 'Secondary Guardian Phone 2', 
    name: 'g2_phone2', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Secondary Guardian', 
    format: formatFunctions.phoneNumber, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // Secondary Guardian Email - email format
  { 
    label: 'Secondary Guardian Email', 
    name: 'g2_email', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Secondary Guardian', 
    format: formatFunctions.email, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // Primary Guardian Place - default format
  { 
    label: 'Primary Guardian Place', 
    name: 'g1_place', 
    type: 'select', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormSelect(e), 
    category: 'Primary Guardian', 
    format: formatFunctions.default, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // Secondary Guardian Place - default format
  { 
    label: 'Secondary Guardian Place', 
    name: 'g2_place', 
    type: 'select', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormSelect(e), 
    category: 'Secondary Guardian', 
    format: formatFunctions.default, 
    className: '', 
    formItemWidth: 'w-full md:w-1/2' 
  },
  
  // Is Email Confirmed - confirmed status format
  { 
    label: 'Is Email Confirmed', 
    name: 'is_email_confirmed', 
    type: 'text', 
    showForm: true, 
    showTable: true, 
    editable: true, 
    element: (e) => CFormInput(e), 
    category: 'Biodata', 
    format: formatFunctions.confirmedStatus, 
    className: '', 
    formItemWidth: 'w-full' 
  },
];
export const student_schema_subject = [
  { label: 'id', name: 'id', type: 'text', showForm: false, showTable: false, editable: true, element: null, category: 'Biodata', format: null, className: '', formItemWidth: 'w-full' },
  { label: 'Adm. No.', name: 'admission_no', type: 'text', showForm: false, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2', meta:{style:{maxWidth:'100px'}} },
  { label: 'Full Name', name: 'fullname', type: 'select', showForm: false, showTable: true, editable: true, element: (e) => CFormSelect(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2', meta:{style:{minWidth:'350px'}} },
  { label: 'Class', name: 'classunitname', type: 'text', showForm: false, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2', meta:{style:{minWidth:'100px'}} },
  { label: 'Subject', name: 'subjectname', type: 'text', showForm: false, showTable:true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2', meta:{style:{minWidth:'200px'}} },
  { label: 'Staff', name: 'staffname', type: 'text', showForm: false, showTable:true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2', meta:{style:{alignItems:'100px', minWidth:'300px'}} },
  { label: 'Phone 1', name: 'g1_phone1', type: 'text', showForm: false, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Primary Guardian', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
  { label: 'Primary Guardian Phone 2', name: 'g1_phone2', type: 'text', showForm: false, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Primary Guardian', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
  { label: 'Email', name: 'g1_email', type: 'text', showForm: false, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Primary Guardian', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
  { label: 'Student', name: 'clientid1', type: 'text', showForm: true, showTable: false, editable: true, 
          element: ReusableSelectTanstack, 
          dropdown:{
              id:'student', 
              pth:'student', 
              table:'students', 
              queryType:'getStudentClassDropdown', 
              isMulti:true,
              isSearchable:true, 
              param:[{col:'schoolid', val:'schoolid', type:false}, {col:'classid', val:'itemid1', type:false}, , {col:'termid', val:'termid', type:false}]}
       },
 { label: 'Staff Name', name: 'clientid', type: 'text', showForm: false, showTable:false, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2', meta:{style:{alignItems:'100px'}} },
  { label: 'subjectid', name: 'itemid', type: 'text', showForm: false, showTable:false, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2', meta:{style:{alignItems:'100px'}} },
  { label: 'classid', name: 'itemid1', type: 'text', showForm: false, showTable:false, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2', meta:{style:{alignItems:'100px'}} },

  
];

export const student_cv_schema = {
  id: false,
  admission_no: true,
  fullname: true,
  schoolid: false,
  schoolname: false,
  admission_nox: false,
  oldadmission_no: false,
  surname: false,
  firstname: false,
  middlename: false,
  gender: false,
  dob: false,
  age: false,
  doa: false,
  soo: false,
  religion: false,
  lga: false,
  ward: false,
  nin: false,
  lin: false,
  nationality: false,
  cclass: false,
  is_active: false,
  is_delete: false,
  date_created: false,
  date_updated: false,
  photo: false,
  photo1: false,
  photo2: false,
  photo3: false,
  house: false,
  place: false,
  admit: false,
  parentid: false,
  g1_name: false,
  g1_address: false,
  g1_rel: false,
  g1_phone1: false,
  g1_phone2: false,
  g1_email: false,
  g2_name: false,
  g2_address: false,
  g2_rel: false,
  g2_phone1: false,
  g2_phone2: false,
  g2_email: false,
  g1_place: false,
  g2_place: false,
  is_email_confirmed: false
};

export const table_actions_subject = ({row, onEdit, onEditPhoto, onView}) => {
        return <ActionButtons
            row={row}
            onEdit={() => onEdit(row)}
            onEditPhoto={() => onEditPhoto(row)}
            onView={() => onView(row)}
        >
            <ActionButtons.Edit />
            <ActionButtons.EditPhoto />
            <ActionButtons.View />
        </ActionButtons>
}

export const table_actions_class = ({row, onEdit, onView}) => {
        return <ActionButtons
            row={row}
            onEdit={() => onEdit(row)}
            onView={() => onView(row)}
            onDelete={() => onDelete(row)}
            onApprove={() => onApprove(row)}
        >
            <ActionButtons.Edit />
            <ActionButtons.Delete />
            <ActionButtons.Approve />
            <ActionButtons.View />
        </ActionButtons>
}

  export const table_actions = ({row, onEdit, onEditPhoto, onView}) => {
        return <ActionButtons
            row={row}
            onEdit={() => onEdit(row)}
            onView={() => onView(row)}
            onEditPhoto={() => onEditPhoto(row)}
        >
            <ActionButtons.Edit />
             <ActionButtons.EditPhoto />
            <ActionButtons.View />
        </ActionButtons>
        }
    
    
export const student_schema_fee = [
  { label: 'id', name: 'id', type: 'text', showForm: false, showTable: false, editable: true, element: null, category: 'Biodata', format: null, className: '', formItemWidth: 'w-full' },
  { label: 'Adm. No.', name: 'admission_no', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2', meta:{style:{maxWidth:'100px'}} },
  { label: 'Full Name', name: 'fullname', type: 'select', showForm: true, showTable: true, editable: true, element: (e) => CFormSelect(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2', meta:{style:{minWidth:'350px'}} },
  { label: 'Class', name: 'classunitname', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: null, className: '', formItemWidth: 'w-full md:w-1/2', meta:{style:{maxWidth:'100px'}} },
  { label: 'Fee Name', name: 'item1_name', type: 'text', showForm: false, showTable:false, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: moneyFunction, className: '', formItemWidth: 'w-full md:w-1/2', meta:{style:{maxWidth:'100px'}} },
  { label: 'Fee', name: 'fee', type: 'text', showForm: false, showTable:true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: moneyFunction, className: '', formItemWidth: 'w-full md:w-1/2', meta:{style:{alignItems:'100px'}} },
  { label: 'Paid', name: 'paid', type: 'text', showForm: false, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Biodata', format: moneyFunction, className: '', formItemWidth: 'w-full md:w-1/2', meta:{style:{alignItems:'100px'}} },
  { label: 'Phone 1', name: 'g1_phone1', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Primary Guardian', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
  { label: 'Primary Guardian Phone 2', name: 'g1_phone2', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Primary Guardian', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },
  { label: 'Email', name: 'g1_email', type: 'text', showForm: true, showTable: true, editable: true, element: (e) => CFormInput(e), category: 'Primary Guardian', format: null, className: '', formItemWidth: 'w-full md:w-1/2' },

];

