import { faBookOpen, faClipboardList, faDollar, faDollarSign, faFileCircleCheck, faHeart, faLightbulb, faUserGroup, faUsersViewfinder } from "@fortawesome/free-solid-svg-icons";
import { 
    classManagerTermFields, 
    termCommonFields, 
    commonFields, 
    classFeeManagerTermFields,
    subjectManagerTermFields,
    dateFields,
    MaxScoreFields,
    assessmentScoreManagerTermFields,
    assessmentScoreSummaryManagerTermFields,
    budgetManagerTermFields,
    studentClassManagerTermFields
} from "./admin_setting_data";
import { tableActionMap } from "./admin_setting_action";
import ActionButtons from "../../../components/tools/ActionButton";


const getTableAction = (id, row, onEdit, onActivate, onDelete, onNext, onView) => {
    const actionComponent = tableActionMap[id];
    return actionComponent ? actionComponent(row, onEdit, onActivate, onDelete, onNext, onView) : null;
};

export const assement_setting_term = [
    {
            id: 1,
            name: 'Academic Assessment Items',
            path: 'data/:groupid/:itemid',
            uniqueKey: 'gets',
            uid: 'step',
            description: 'Add & Modify Steps',
            table_param: [{ caid:'itemid'}],
            table_name: 'caunits',
            table_action: ({ row, onEdit, onActivate, onDelete, onNext }) => getTableAction(17, row, onEdit, onActivate, onDelete, onNext ),
            table_data: [
                ...commonFields,
                ...MaxScoreFields
            ],
            submenu: [{
                id: 1,
                name: 'Academic Assessment Scores Summary',
                path: 'data/:groupid/:itemid/:caunitid',
                uniqueKey: 'getAccessSummaryData',
                uid: 'getAccessSummaryData',
                description: 'Add & Modify Assessment Scores',
                table_param: [
                    'termid', 
                    "sessionid", 
                    { name: 'grp', new_name: 'grp', val:8, fixed: true }, 
                    { name: 'unitid', new_name: 'itemid', fixed: false }],
                table_name: 'terms',
                pth:"term",
                controlled:['data1'],
                table_action: ({ row, onView }) =>{
                    return <ActionButtons
                        row={row}
                        onView={()=>onView(row)}
                    >
                        <ActionButtons.View />
                    </ActionButtons>
                    },
                table_data: [
                    ...assessmentScoreSummaryManagerTermFields,
                ],
                submenu: [{
                id: 1,
                name: 'Academic Assessment Scores',
                path: 'data/:groupid/:itemid/:caunitid',
                uniqueKey: 'getAccessData',
                uid: 'getAccessData',
                description: 'Add & Modify Assessment Scores',
                table_param: [
                    'termid', 
                    "sessionid", 
                    "itemid1",
                    "itemid",
                    { name: 'grp', new_name: 'grp', val:8, fixed: true },
                ],
                table_name: 'terms',
                pth:"term",
                controlled:['data1'],
                table_action: ({ row, onNext, onEdit, onActivate, onDelete }) => getTableAction(13, row, onEdit, onActivate, onDelete, onNext ),
                table_data: [
                    ...assessmentScoreManagerTermFields,
                ]
            }]
            }]
}]
export const admin_setting_term = [
    {
        id: 1,
        title: 'Class Manager Allocation',
        icon: faUserGroup,
        description: 'Assign teachers to specific classes. These teachers will be responsible for managing student data and overall class activities.',
        theme: 'indigo',
        path:'classmanager',
        pth:'classteacher',
        table_name:'terms',
        uniqueKey:'TermStaffClass',
        table_param:['sessionid', 'termid'],
        onClick:() =>onNext('classmanager'),
        table_action: ({ row, onEdit, onActivate, onDelete, onNext }) => getTableAction(17, row, onEdit, onActivate, onDelete, onNext),
        table_data: [
            ...classManagerTermFields,
            ...termCommonFields,
        ],
        submenu:[{
            id: 1,
            title: 'Class List',
            icon: faUserGroup,
            description: 'List of Students in each class',
            theme: 'indigo',
            path:'list',
            pth:'term',
            table_name:'terms',
            uniqueKey:'getAccessData',
            table_param:['sessionid', 'termid'],
            onClick:() =>onNext('classmanager'),
            table_action: ({ row, onEdit, onActivate, onDelete, onNext }) => getTableAction(17, row, onEdit, onActivate, onDelete, onNext),
            table_data: [
                ...classManagerTermFields,
                ...termCommonFields,
            ],
        },
    ]
    },
    {
        id: 2,
        title: 'Subject Teacher Allocation',
        icon: faBookOpen,
        description: 'Designate which teacher will instruct a particular subject for each class level.',
        theme: 'green',
        path:'subjectmanager',
        pth:'teachersubject',
        table_name:'terms',
        uniqueKey:'TermStaffSubject',
        table_param:['sessionid', 'termid'],
        onClick:() =>onNext('subjectmanager'),
        table_action: ({ row, onEdit, onActivate, onDelete, onNext }) => getTableAction(17, row, onEdit, onActivate, onDelete, onNext),
        table_data: [
            ...subjectManagerTermFields,
            ...termCommonFields,
        ],
        submenu:[{
            id: 1,
            title: 'Student Subject List',
            icon: faUserGroup,
            description: 'List of Students subject class ',
            theme: 'indigo',
            path:'list',
            pth:'term',
            table_name:'terms',
            uniqueKey:'getAccessData',
            table_param:['sessionid', 'termid'],
            onClick:() =>onNext('subjectmanager'),
            table_action: ({ row, onEdit, onActivate, onDelete, onNext }) => getTableAction(17, row, onEdit, onActivate, onDelete, onNext),
            table_data: [
                ...classManagerTermFields,
                ...termCommonFields,
            ],
        }],
    },{
        id: 3,
        title: 'Student Class Allocation',
        icon: faUserGroup,
        description: 'Assign Students to Class respective class for the term. This will determine which class the student belongs to for the academic term.',
        theme: 'indigo',
        path:'studentmanager',
        pth:'student',
        table_name:'termclassallocation',
        uniqueKey:'getStudents',
        table_param:['sessionid', 'termid'],
        onClick:() =>onNext('studentmanager'),
        table_action: ({ row, onEdit, onActivate, onDelete, onNext }) => getTableAction(4, row, onEdit, onActivate, onDelete, onNext),
        table_data: [
            ...studentClassManagerTermFields,
            ...termCommonFields,
        ],
       
    },
   
    {
        id: 23,
        title: 'Academic Assessment Manager',
        icon: faClipboardList,
        description: 'Create and manage all continuous assessments and term-end examinations that will be used to evaluate student performance.',
        theme: 'rose',
        path:'academicmanager',
        pth:'ca',
        table_name:'cas',
        uniqueKey:'gets',
        table_param:["termid", {name:"typeid", value:1, fixed:true }],
        onClick:() =>onNext('academicmanager'),
        table_action: ({ row, onEdit, onActivate, onDelete, onNext }) => getTableAction(17, row, onEdit, onActivate, onDelete, onNext),
        table_data: [
            ...commonFields,
            ...MaxScoreFields
        ],
         submenu: assement_setting_term,
    },
    {
        id: 24,
        title: 'Behavioral Assessment Manager',
        icon: faHeart,
        description: 'Define and record behavioral attributes and assessments for students.',
        theme: 'indigo',
        path:'behavioralmanager',
        pth:'ca',
        table_name:'cas',
        uniqueKey:'gets',
        table_param:["termid", {name:"typeid", value:2, fixed:true }],
        onClick:() =>onNext('academicmanager'),
        table_action: ({ row, onEdit, onActivate, onDelete, onNext }) => getTableAction(17, row, onEdit, onActivate, onDelete, onNext),
        table_data: [
            ...commonFields,
            ...MaxScoreFields
        ],
         submenu: assement_setting_term,
    },
    {
        id: 25,
        title: 'Skills Assessment Manager',
        icon: faLightbulb,
        description: 'Define and evaluate students\' skills and competencies across different areas.',
        theme: 'green',
        path:'skillmanager',
        pth:'ca',
        table_name:'cas',
        uniqueKey:'gets',
        table_param:["termid", {name:"typeid", value:3, fixed:true }],
        onClick:() =>onNext('academicmanager'),
        table_action: ({ row, onEdit, onActivate, onDelete, onNext }) => getTableAction(17, row, onEdit, onActivate, onDelete, onNext),
        table_data: [
            ...commonFields,
            ...MaxScoreFields
        ],
         submenu: assement_setting_term,
    },
    {
        id: 7,
        title: 'Fees Manager',
        icon: faDollarSign,
        description: 'Establish and manage the various fees that students are required to pay per class.',
        theme: 'rose',
        path:'feemanager',
        pth:'classfee',
        table_name:'terms',
        uniqueKey:'TermClassFee',
        table_param:['sessionid', 'termid'],
        onClick:() =>onNext('feemanager'),
        table_action: ({ row, onEdit, onActivate, onDelete, onNext }) => getTableAction(17, row, onEdit, onActivate, onDelete, onNext),
        table_data: [
            ...classFeeManagerTermFields,
            ...termCommonFields,
        ],
    },
    {
        id: 7,
        title: 'Budget Manager',
        icon: faDollar,
        description: 'Allocate and monitor the total budget and expenditure per each term',
        theme: 'indigo',
        path:'budgetmanager',
        pth:'term',
        table_name:'terms',
        uniqueKey:'getAccessData',
        onClick:() =>onNext('budgetmanager'),
        table_action: ({ row, onEdit, onActivate, onDelete, onNext }) => getTableAction(17, row, onEdit, onActivate, onDelete, onNext),
        table_data: [
            ...budgetManagerTermFields,
        ],
    },
        {
        id: 8,
        title: 'Student Report',
        icon: faFileCircleCheck,
        description: 'Generate, Print, Send and Analysze Students Reports',
        theme: 'green',
        path:'reportmanager',
        pth:'term',
        table_name:'terms',
        uniqueKey:'getAccessData',
        onClick:() =>onNext('reportmanager'),
        table_action: ({ row, onEdit, onActivate, onDelete, onNext }) => getTableAction(17, row, onEdit, onActivate, onDelete, onNext),
    },
    ]