import { CalendarDays, School, Users, Building, BriefcaseBusiness, List, Banknote, ListPlus, Users2Icon, ChurchIcon, UserCog2Icon, LucideBanknote, BriefcaseIcon, MonitorCheck } from "lucide-react";
import ActionDropdown from "../../../components/ActionDropdown.js";
import { admin_setting_term } from "./admin_setting_term.jsx";
import { commonFields, dateFields, sessionFields, termFields } from "./admin_setting_data.jsx";
import { tableActionMap } from "./admin_setting_action.jsx";
import ReusableSelectDefault from "../../../components/ReusableSelectDefault.jsx";
import { userRoles } from "../index.js";
import { accessFunction } from "../../functions/basci.jsx";
import { Input } from "../../../components/form/SimpleInput.js";

// --- Reusable ID fields for table data configuration ---
const levelIdField = { label: 'Level ID', name: 'parent_id', type: 'text', showForm: false, showTable: false, editable: false, element: null };
const codeField = { label: 'Code', name: 'data1', type: 'text', showForm: true, showTable: true, editable: false, element: null };
const roleIdField = { label: 'Role ID', name: 'roleid', type: 'text', showForm: false, showTable: false, editable: false, element: null };
const accessTypeField = { label: 'Access Type', name: 'log_id', type: 'number', showForm: true, showTable: true, editable: false, format: accessFunction,
    element: ReusableSelectDefault,  dropdown:{
            id:'access', 
            data: userRoles,  
            isMulti:false,
            isSearchable:true, 
            param:{} }}

const getTableAction = (id, row, onEdit, onActivate, onDelete, onNext) => {
    const actionComponent = tableActionMap[id];
    return actionComponent ? actionComponent(row, onEdit, onActivate, onDelete, onNext) : null;
};


// --- Main configuration object ---
const admin_setting = [
    {
        id: 3,
        name: 'Session',
        icon: <CalendarDays />,
        path: 'groups/session',
        group: 'academics',
        uid: 'session',
        description: 'Create, Modify Session, Terms, Assessments',
        uniqueKey: 'gets',
        table_param: [{'schoolid':'schoolid'}],
        table_name: 'sessions',
        table_data: [
            ...sessionFields
        ],
        // Now using the reusable function to get the action buttons
        table_action: ({ row, onEdit, onActivate, onDelete, onNext }) => getTableAction(3, row, onEdit, onActivate, onDelete, onNext),
        submenu: [
            {
                id: 1,
                name: 'Terms Manager',
                icon: <Building />,
                path: '1/:subroute',
                uniqueKey: 'gets',
                uid: 'term',
                description: 'Add, Modify Term',
                table_param: [{ name: 'subroute', new_name: 'sessionid', fixed: false }],
                table_name: 'terms',
                table_data: [
                    ...termFields,
                ],
                table_action: ({ row, onNext, onEdit, onDelete }) => {
                    return (
                        <span>
                            {row?.pop && (<span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-100">{row?.pop || 0}</span>)}
                            <ActionDropdown
                                row={row}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onNext={onNext}
                            >
                                <ActionDropdown.Edit />
                                <ActionDropdown.Delete />
                                <div className="py-1" role="none">
                                    <ActionDropdown.Academic />
                                    <ActionDropdown.Behavioral />
                                    <ActionDropdown.Psychomotor />
                                    <ActionDropdown.StudentReport />
                                </div>
                                <div className="py-1" role="none">
                                    <ActionDropdown.ClassTeacher />
                                    <ActionDropdown.ClassFee />
                                    <ActionDropdown.SubjectTeacher />
                                    <ActionDropdown.ClassManager />
                                    <ActionDropdown.StudentClass />
                                </div>
                            </ActionDropdown>
                        </span>
                    );
                },
                submenu: admin_setting_term
            }
        ]
    },
    {
        id: 4,
        name: 'School',
        icon: <School />,
        path: 'school',
        group: 'administration',
        description: 'Add & Modify a school',
        table_param: [],
        table_name: 'datas',
        table_data: [
            ...commonFields,
            ...dateFields,
        ],
        // Now using the reusable function to get the action buttons
        table_action: ({ row, onEdit, onActivate, onDelete, onNext }) => getTableAction(4, row, onEdit, onActivate, onDelete, onNext),
    },
    {
        id: 5,
        name: 'Departments',
        icon: <Building />,
        path: 'groups/department',
        group: 'administration',
        uniqueKey: 'gets',
        description: 'Add & modify departments and units',
        table_param: ['group_id', {'log_id':'schoolid'}],
        table_name: 'datas',
        table_data: [
            ...commonFields,
        ],
        // Now using the reusable function to get the action buttons
        table_action: ({ row, onEdit, onActivate, onDelete, onNext }) => getTableAction(5, row, onEdit, onActivate, onDelete, onNext),
        submenu: [{
            id: 1,
            name: 'Unit',
            icon: <Building />,
            path: ':subroute',
            uniqueKey: 'gets',
            uid: 'unit',
            description: 'Add & Modify units',
            table_param: [{ name: 'subroute', new_name: 'parent_id', fixed: false }],
            table_name: 'datas',
            table_data: [
                ...commonFields,
            ],
            table_action: ({ row, onEdit, onActivate, onDelete }) => getTableAction(6, row, onEdit, onActivate, onDelete, () => {}),
        }]
    },
    {
        id: 6,
        name: 'Subject',
        icon: <List />,
        path: 'groups/subject',
        group: 'academics',
        uniqueKey: 'gets',
        description: 'Add & modify Subjects',
        table_param: ['typeid'],
        table_name: 'subjects',
        table_data: [
            ...commonFields
        ],
        // Now using the reusable function to get the action buttons
        table_action: ({ row, onEdit, onActivate, onDelete }) => getTableAction(6, row, onEdit, onActivate, onDelete, () => {}),
    },
    {
        id: 7,
        name: 'Account',
        icon: <Banknote />,
        path: 'groups/account',
        group: 'accounts',
        uniqueKey: 'gets',
        description: 'Add & Modify Bank Accounts',
        table_param: ['group_id'],
        table_name: 'datas',
        table_data: [
            { label: 'id', name: 'id', type: 'text', showForm: false, showTable: false, editable: true, element: null },
            { label: 'Account or Bank Name', name: 'name', type: 'text', showForm: true, showTable: true, editable: true, element: Input },
            { label: 'Alias/Account Number', name: 'abbrv', type: 'text', showForm: true, showTable: true, editable: true, element: Input },
        ],
        // Now using the reusable function to get the action buttons
        table_action: ({ row, onEdit, onActivate, onDelete }) => getTableAction(7, row, onEdit, onActivate, onDelete, () => {}),
    },
    {
        id: 8,
        name: 'Pension',
        icon: <BriefcaseBusiness />,
        path: 'groups/pension',
        group: 'accounts',
        uniqueKey: 'gets',
        description: 'Add & Modify Pension Managers',
        table_param: ['group_id'],
        table_name: 'datas',
        table_data: [
            ...commonFields
        ],
        // Now using the reusable function to get the action buttons
        table_action: ({ row, onEdit, onActivate, onDelete }) => getTableAction(8, row, onEdit, onActivate, onDelete, () => {}),
    },
    {
        id: 9,
        name: 'Class',
        icon: <Building />,
        path: 'groups/clasz',
        group: 'academics',
        uniqueKey: 'gets',
        description: 'Add & modify class and units',
        table_param: ['typeid'],
        table_name: 'claszs',
        table_data: [
            ...commonFields
        ],
        // Now using the reusable function to get the action buttons
        table_action: ({ row, onEdit, onActivate, onDelete, onNext }) => getTableAction(9, row, onEdit, onActivate, onDelete, onNext),
        submenu: [{
            id: 1,
            name: 'Class Unit',
            icon: <Building />,
            path: ':subroute',
            uniqueKey: 'gets',
            uid: 'claszunit',
            description: 'Add & Modify Class Units',
            table_param: [{ name: 'subroute', new_name: 'claszid', fixed: false }],
            table_name: 'claszunits',
            table_data: [
                ...commonFields
            ],
            table_action: ({ row, onEdit, onActivate, onDelete }) => getTableAction(10, row, onEdit, onActivate, onDelete, () => {}),
        }]
    },
    {
        id: 10,
        name: 'Grades',
        icon: <ListPlus />,
        path: 'groups/grade',
        group: 'academics',
        uniqueKey: 'gets',
        description: 'Add & modify Grades and units',
        table_param: ['group_id', {'log_id':'schoolid'}],
        table_name: 'datas',
        table_data: [
            ...commonFields,
        ],
        // Now using the reusable function to get the action buttons
        table_action: ({ row, onEdit, onActivate, onDelete, onNext }) => getTableAction(10, row, onEdit, onActivate, onDelete, onNext),
        submenu: [{
            id: 1,
            name: 'Grade Unit',
            icon: <ListPlus />,
            path: ':subroute',
            uniqueKey: 'gets',
            uid: 'gradeunit',
            description: 'Add & Modify Grade Units',
            table_param: [{ name: 'subroute', new_name: 'parent_id', fixed: false }],
            table_name: 'datas',
            table_data: [
                ...commonFields,
                { label: 'Grade Maximum', name: 'data1', type: 'number', showForm: true, showTable: true, editable: true, element: Input },
                { label: 'Grade Minimum', name: 'data2', type: 'number', showForm: true, showTable: true, editable: true, element: Input },
                { label: 'Comment', name: 'description', type: 'text', showForm: true, showTable: true, editable: true, element: Input },
            ],
            table_action: ({ row, onEdit, onActivate, onDelete }) => getTableAction(11, row, onEdit, onActivate, onDelete, () => {}),
        }]
    },
    {
        id: 11,
        name: 'Role',
        icon: <Users />,
        path: 'groups/role',
        group: 'administration',
        uid: 'role',
        uniqueKey: 'gets',
        description: 'Add & modify Role and Access',
        table_param: ['group_id',],
        table_name: 'datas',
        table_data: [
            ...commonFields,
            accessTypeField
        ],
        // Now using the reusable function to get the action buttons
        table_action: ({ row, onEdit, onActivate, onDelete, onNext }) => getTableAction(11, row, onEdit, onActivate, onDelete, onNext),
        submenu: [{
            id: 1,
            name: 'Access',
            icon: <Users />,
            path: '1/:subroute',
            uniqueKey: 'gets',
            uid: 'access',
            description: 'Add & Modify Access Level',
            table_param: [{ name: 'subroute', new_name: 'parent_id', fixed: false }],
            table_name: 'datas',
            table_data: [
                ...commonFields,
                roleIdField,
            ],
            table_action: ({ row, onEdit, onActivate, onDelete }) => getTableAction(12, row, onEdit, onActivate, onDelete, () => {}),
        }]
    },
    {
        id: 12,
        name: 'Levels',
        icon: <List />,
        path: 'groups/level',
        group: 'administration',
        uniqueKey: 'gets',
        description: 'Add & modify levels and units',
        table_param: ['group_id'],
        table_name: 'datas',
        table_data: [
            ...commonFields,
        ],
        // Now using the reusable function to get the action buttons
        table_action: ({ row, onEdit, onActivate, onDelete, onNext }) => getTableAction(12, row, onEdit, onActivate, onDelete, onNext),
        submenu: [{
            id: 1,
            name: 'Steps',
            icon: <List />,
            path: ':subroute',
            uniqueKey: 'gets',
            uid: 'step',
            description: 'Add & Modify Steps',
            table_param: [{ name: 'subroute', new_name: 'parent_id', fixed: false }],
            table_name: 'datas',
            table_data: [
                ...commonFields,
                levelIdField,
            ],
            table_action: ({ row, onEdit, onActivate, onDelete }) => getTableAction(13, row, onEdit, onActivate, onDelete, () => {}),
        }]
    },
    {
        id: 13,
        name: 'Nature of Employment',
        icon: <BriefcaseBusiness />,
        path: 'groups/nature',
        group: 'administration',
        uniqueKey: 'gets',
        description: 'Add & Modify Nature of Employment',
        table_param: ['group_id'],
        table_name: 'datas',
        table_data: [
            ...commonFields,
        ],
        // Now using the reusable function to get the action buttons
        table_action: ({ row, onEdit, onActivate, onDelete }) => getTableAction(13, row, onEdit, onActivate, onDelete, () => {}),
    },
    {
        id: 14,
        name: 'Timing',
        icon: <BriefcaseBusiness />,
        path: 'groups/timing',
        group: 'administration',
        uniqueKey: 'gets',
        description: 'Add & Modify Time',
        table_param: ['group_id'],
        table_name: 'datas',
        table_data: [
            ...commonFields, 
        ],
        // Now using the reusable function to get the action buttons
        table_action: ({ row, onEdit, onActivate, onDelete }) => getTableAction(14, row, onEdit, onActivate, onDelete, () => {}),
    },
    {
        id: 15,
        name: 'Banks',
        icon: <Banknote />,
        path: 'groups/bank',
        group: 'accounts',
        uniqueKey: 'gets',
        description: 'Add & Modify Banks',
        table_param: ['group_id'],
        table_name: 'datas',
        table_data: [
            ...commonFields,
        ],
        // Now using the reusable function to get the action buttons
        table_action: ({ row, onEdit, onActivate, onDelete }) => getTableAction(15, row, onEdit, onActivate, onDelete, () => {}),
    },
    {
        id: 16,
        name: 'Reason for Leaving',
        icon: <Users />,
        path: 'groups/reason',
        group: 'administration',
        uniqueKey: 'gets',
        description: 'Add & Modify Reasons for Leaving',
        table_param: ['group_id'],
        table_name: 'datas',
        table_data: [
            ...commonFields,
        ],
        // Now using the reusable function to get the action buttons
        table_action: ({ row, onEdit, onActivate, onDelete }) => getTableAction(16, row, onEdit, onActivate, onDelete, () => {}),
    },
    {
        id: 17,
        name: 'Gender',
        icon: <UserCog2Icon />,
        path: 'groups/gender',
        group: 'administration',
        uniqueKey: 'gets',
        description: 'Add & Modify Gender',
        table_param: ['group_id'],
        table_name: 'datas',
        table_data: [
            ...commonFields,
        ],
        // Now using the reusable function to get the action buttons
        table_action: ({ row, onEdit, onActivate, onDelete }) => getTableAction(13, row, onEdit, onActivate, onDelete, () => {}),
    },
    {
        id: 18,
        name: 'Religion',
        icon: <ChurchIcon />,
        path: 'groups/religion',
        group: 'administration',
        uniqueKey: 'gets',
        description: 'Add & Modify Religion',
        table_param: ['group_id'],
        table_name: 'datas',
        table_data: [
            ...commonFields,
        ],
        // Now using the reusable function to get the action buttons
        table_action: ({ row, onEdit, onActivate, onDelete }) => getTableAction(13, row, onEdit, onActivate, onDelete, () => {}),
    },
    {
        id: 19,
        name: 'Marital Status',
        icon: <Users2Icon />,
        path: 'groups/marital',
        group: 'administration',
        uniqueKey: 'gets',
        description: 'Add & Modify Marital Status',
        table_param: ['group_id'],
        table_name: 'datas',
        table_data: [
            ...commonFields,
        ],
        // Now using the reusable function to get the action buttons
        table_action: ({ row, onEdit, onActivate, onDelete }) => getTableAction(13, row, onEdit, onActivate, onDelete, () => {}),
    },
    {
        id: 20, 
        name: 'Wage',
        icon: <LucideBanknote />,
        path: 'groups/wage',
        group: 'accounts',
        uniqueKey: 'gets',
        description: 'Add & Modify Bank Accounts',
        table_param: ['group_id'],
        table_name: 'datas',
        table_data: [
            { label: 'id', name: 'id', type: 'text', showForm: false, showTable: false, editable: true, element: null },
            { label: 'Wage', name: 'name', type: 'text', showForm: true, showTable: true, editable: true, element: Input },
            { label: 'Alias', name: 'abbrv', type: 'text', showForm: true, showTable: true, editable: true, element: Input },
        ],
        // Now using the reusable function to get the action buttons
        table_action: ({ row, onEdit, onActivate, onDelete }) => getTableAction(7, row, onEdit, onActivate, onDelete, () => {}),
    },
    {
        id: 21,
        name: 'Fee Types',
        icon: <LucideBanknote />,
        path: 'groups/fee',
        group: 'accounts',
        uniqueKey: 'gets',
        description: 'Add & Modify Bank Accounts',
        table_param: ['group_id'],
        table_name: 'datas',
        table_data: [
            { label: 'id', name: 'id', type: 'text', showForm: false, showTable: false, editable: true, element: null },
            { label: 'Fee Name', name: 'name', type: 'text', showForm: true, showTable: true, editable: true, element: Input },
            { label: 'Alias', name: 'abbrv', type: 'text', showForm: true, showTable: true, editable: true, element: Input },
        ],
        // Now using the reusable function to get the action buttons
        table_action: ({ row, onEdit, onActivate, onDelete }) => getTableAction(7, row, onEdit, onActivate, onDelete, () => {}),
    },
     {
        id: 23,
        name: 'Office',
        icon: <BriefcaseIcon />,
        path: 'groups/office',
        group: 'administration',
        uniqueKey: 'gets',
        description: 'Add & Modify Office',
        table_param: ['group_id'],
        table_name: 'datas',
        table_data: [
            ...commonFields,
        ],
        // Now using the reusable function to get the action buttons
        table_action: ({ row, onEdit, onActivate, onDelete }) => getTableAction(13, row, onEdit, onActivate, onDelete, () => {}),
    },
    {
        id: 24,
        name: 'Expenses',
        icon: <MonitorCheck />,
        path: 'groups/expense',
        group: 'accounts',
        uniqueKey: 'gets',
        description: 'Add & Modify Expenses',
        table_param: ['group_id'],
        table_name: 'datas',
        table_data: [
            ...commonFields,
            codeField
        ],
        // Now using the reusable function to get the action buttons
        table_action: ({ row, onEdit, onActivate, onDelete, onNext }) => getTableAction(12, row, onEdit, onActivate, onDelete, onNext),
        submenu: [{
            id: 1,
            name: 'Expenses',
            icon: <List />,
            path: ':subroute',
            uniqueKey: 'gets',
            uid: 'expense',
            description: 'Add & Modify Expense',
            table_param: [{ name: 'subroute', new_name: 'parent_id', fixed: false }],
            table_name: 'datas',
            table_data: [
                ...commonFields,
                 codeField,
            ],
            table_action: ({ row, onEdit, onActivate, onDelete, onNext}) => getTableAction(12, row, onEdit, onActivate, onDelete, onNext),
            submenu: [{
                id: 1,
                name: 'Expenses Unit',
                icon: <List />,
                path: ':subroute1',
                uniqueKey: 'gets',
                uid: 'expenseunit',
                description: 'Add & Modify Expense',
                table_param: [{ name: 'subroute1', new_name: 'parent_id', fixed: false }],
                table_name: 'datas',
                table_data: [
                    ...commonFields,
                     codeField,
                ],
                table_action: ({ row, onEdit, onActivate, onDelete }) => getTableAction(13, row, onEdit, onActivate, onDelete, () => {}),
            }]
        }]
    },
];

export default admin_setting;
