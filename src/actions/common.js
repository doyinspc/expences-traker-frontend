import { faAngry, faAtlas, faBlackboard, faBookAtlas, faBookBookmark, faBookOpenReader, faCertificate, faChalkboardTeacher, faChild, faChildren, faCogs, faDemocrat, faFeed, faGlobeAfrica, faGolfBallTee, faHandsBubbles, faPlaneCircleExclamation, faUserCheck, faWeight } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'
import xlsx from 'json-as-xlsx';
import { createColumnHelper } from '@tanstack/react-table';
export const API_PATHS = import.meta.env.VITE_API_URL;
export const API_PATH_SETTING = import.meta.env.VITE_API_URL;
export const SERVER_PATHS = import.meta.env.VITE_API_URL;
export const SERVER_URL = import.meta.env.VITE_API_FOLDER;
export const WEBPAGE = import.meta.env.VITE_REACT_APP_WEBPAGE;

export const PICS = import.meta.env.VITE_REACT_APP_PHOTO;
export const imgx = import.meta.env.VITE_REACT_APP_PHOTO;
export const imgb = import.meta.env.VITE_REACT_APP_BG;
export const gradesjson = 'json/grades.json'
export const pensionjson = 'json/pension.json'
export const termsObj = [
   {id: 1, name: 'First'},
   {id: 2, name: 'Second'},
   {id: 3, name: 'Third'}
]

// src/actions/common.js

// Get token from sessionStorage
const getToken = () => {
    try {
        const token = sessionStorage.getItem('token');
        const jwt = sessionStorage.getItem('jwt');
        return jwt || token || '';
    } catch (error) {
        console.error('Error getting token from sessionStorage:', error);
        return '';
    }
};

// Get user type from sessionStorage
const getUserType = () => {
    try {
        return sessionStorage.getItem('userType') || 'tenant';
    } catch (error) {
        console.error('Error getting userType from sessionStorage:', error);
        return 'tenant';
    }
};

// Get tenant DB from sessionStorage
const getTenantDb = () => {
    try {
        return sessionStorage.getItem('tenantDb') || import.meta.env.VITE_APP_TENANT_DB || 'expences1';
    } catch (error) {
        console.error('Error getting tenantDb from sessionStorage:', error);
        return import.meta.env.VITE_APP_TENANT_DB || 'expences1';
    }
};

// ============================================
// AXIOS CONFIG - For JSON requests (GET, POST, PUT, DELETE)
// ============================================
export const axiosConfig = {
    headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
    }
};

// Use a getter to dynamically get values from sessionStorage
Object.defineProperty(axiosConfig.headers, 'Authorization', {
    get: function() {
        const token = getToken();
        return token ? `Bearer ${token}` : '';
    },
    enumerable: true,
    configurable: true
});

Object.defineProperty(axiosConfig.headers, 'X-Tenant-DB', {
    get: function() {
        return getTenantDb();
    },
    enumerable: true,
    configurable: true
});

Object.defineProperty(axiosConfig.headers, 'X-User-Type', {
    get: function() {
        return getUserType();
    },
    enumerable: true,
    configurable: true
});

// ============================================
// AXIOS CONFIG 1 - For FormData (multipart/form-data)
// ============================================
export const axiosConfig1 = {
    headers: {
        "Content-Type": "multipart/form-data",
    }
};

// Use a getter to dynamically get values from sessionStorage
Object.defineProperty(axiosConfig1.headers, 'Authorization', {
    get: function() {
        const token = getToken();
        return token ? `Bearer ${token}` : '';
    },
    enumerable: true,
    configurable: true
});

Object.defineProperty(axiosConfig1.headers, 'X-Tenant-DB', {
    get: function() {
        return getTenantDb();
    },
    enumerable: true,
    configurable: true
});

Object.defineProperty(axiosConfig1.headers, 'X-User-Type', {
    get: function() {
        return getUserType();
    },
    enumerable: true,
    configurable: true
});


// MAIN_TOKEN (backward compatibility)
export const MAIN_TOKEN = getToken();

// Export helpers
export const tokenHelpers = {
    getToken,
    getUserType,
    getTenantDb,
    clearSession: () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('jwt');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('userType');
        sessionStorage.removeItem('tenantDb');
        sessionStorage.removeItem('accountId');
        sessionStorage.removeItem('remember');
        sessionStorage.removeItem('refreshToken');
    },
    isAuthenticated: () => {
        return !!getToken();
    },
    setTenantDb: (tenantDb) => {
        if (tenantDb) {
            sessionStorage.setItem('tenantDb', tenantDb);
        }
    },
    setTokens: (token, jwt, refreshToken) => {
        if (token) sessionStorage.setItem('token', token);
        if (jwt) sessionStorage.setItem('jwt', jwt);
        if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
    }
};
export const testGroup = {
  0:"School",
  1:"Admission",
  2:"Career",
  3:"Staff",
  4: "Competition"
}

export const DownloadExcel = async (table, rows) =>{
 
  let topics = []
  table.getAllLeafColumns().forEach(column =>{
    
    if(column.getIsVisible()){
      let row = {}
        row.label = column.columnDef.header
        row.value = column.id
        
        topics.push(row)
    }
    
  })
  let data = [
    {
      sheet: "Staffs",
      columns : topics,
      content : rows,
    }
  ]
  


  let settings = {
    fileName: "Staff List",
    extraLength :3,
    writeMode : "writeFile",
    writeOptions:{},
    LTR: true,
  }

  await xlsx(data,settings);

}

export const validateDate = (date) =>{
    return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}
export const callReg = () =>{
    return Swal("Done!", "Update saved!", "success");
}

export const callMsg = async (email) => {
  await Swal({
    title: "Submitted Successfully!",
    text: `Your token has been sent to ${email}. Please check your inbox (and spam folder) for details.`,
    icon: "success",
    button: "OK",
  });
};
export const callError = (err) =>{
    return Swal("Failed!", err, "danger");
}
export const callSuccess = (err) =>{
    return Swal("Saved!", "Update saved!", "success");
}
export const nairaformat = (item)=>{
  let f = new Intl.NumberFormat(undefined,{style:'currency', currency:'NGR'})
  return f.format(item)
}
export const getRouteName = (pathname, routes) => {
  const currentRoute = routes.find((route) => route.path === pathname)
  return currentRoute ? currentRoute.name : false
}
export const getRoutePath = (pathname, routes) => {
  const currentRoute = routes.find((route) => route.path === pathname)
  return currentRoute ? currentRoute.path : false
}
export const secondsToDhms= (seconds)=> {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600*24));
  var h = Math.floor(seconds % (3600*24) / 3600);
  var m = Math.floor(seconds % 3600 / 60);
  var s = Math.floor(seconds % 60);
  
  var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " hr, " : " hrs, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " min, " : " mins, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " sec" : " secs") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
  }
export const numberformat = (item)=>{
  if(item > 0){
  let f = nairaformat(item);
  return f.replace("NGR", "")
  }
}
//validation
export const valdateString = (str) =>{
  if(str !== undefined && str !== null && str.length > 0)
  {
    return true
  }else{
    return false
  }
  
}

export const columnBuilder = (page_data, actions) =>{
  console.log(page_data)
  const {table_data, table_action} = page_data || {}
  const columnHelper = createColumnHelper()
  const snWidth = 20;
  let columns = [
     columnHelper.display({
         accessorKey: 'SN',
         id: 'sn',
         header:'SN',
          meta: {
              style: {
                  textAlign: 'center',
                  width: `${snWidth}px`,
                  minWidth: `${snWidth}px`,
                  maxWidth: `${snWidth}px`,
              }
          },
          size: snWidth,
          minSize: snWidth,
          maxSize: snWidth,
         cell:({row})=>{
             return row.index + 1
             //return row.index  
         }
     }),
  ]
 if(Array.isArray(table_data)){
     table_data.map(element =>{
      if(element.showTable){
        let  row = columnHelper.accessor(element.name.toString(), {
                 id: element.name.toString(),
                 header: element.label,
                 cell:element.format ? ({getValue})=>{
                     return element.format(getValue())
                 } : ({getValue})=>getValue()
             })
         columns.push(row)
      }
     })
 }
 //ADD ACTION FOR EACH ROW
 let action = columnHelper.display({
     id: 'action',
     header:'Actions',
     cell:({row})=>{ 
         return table_action({row:row.original, ...actions})
      }
 });
 columns.push(action)
 return columns
 
}
export const valdateEmail = (str) =>{
  let val = "/^[a-zA-Z0-9.!#$%^&*+_{|}-]+@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9-]+)*$/";
  if(str !== undefined && str !== null && str.length > 0)
  {
    return true
  }else{
    return false
  }
  
}
const trimHtmlString = (htmlString)=> {
  if (typeof htmlString !== 'string') {
    // Handle non-string input gracefully, e.g., convert to string or return as is.
    // For dangerouslySetInnerHTML, you'll likely want a string.
    return String(htmlString || ''); // Convert to string, default to empty if null/undefined
  }
  return htmlString.trim();
}
export const valdateNumber = (str) =>{
  if(str !== undefined && str !== null && str.length > 0)
  {
    return true
  }else{
    return false
  }
}
export const valdateDate = (str) =>{
  return true
}
export const valdateJson = (str) =>{
  try {
    JSON.parse(str)
  } catch (error) {
    return false
  }
  return true
}
export const valdateAmount = (str) =>{
  if(parseInt(str) > 0 || parseInt(str) < 0){
    return true
  }else{
    return false
  }
}
export const leaveTypes = {
  6: 'Casual Leave (Max. 2 days)',
  7: 'Sick Leave',
  12: 'Maternity Leave',
  8: 'Extended Sick Leave',
  9: 'Compassionate Leave',
  10: 'Offsite Duty',
  13: 'Study Leave',
  11: 'Annual Leave',
};
export const departmentstate = {
  1:'Academics',
  2:'Adminstration',
  3:'Management',
}
export const maintenancestate = [
  {
      id:1,
      name:'High',
      description:'Send the items to the store',
      color:'Red'
  },
  {
      id:2,
      name:'Normal',
      description:'Consumables',
      color:'Yellow'
  },
  {
      id:3,
      name:'Low',
      description:'move from store to a unit, department. ',
      color:'blue'
  }
]
export const maintenancestateObj = [
  {'1':'High'},
  {'2':'Normal'},
  {'3':'low'}
]
export const maintenancestateType = [
  {1:'Pending'},
  {2:'Completed'},
  {3:'Canceled'}
]
export const inventorystate = [ 
  {
      id:1,
      name:'Acquired',
      description:'Send the items to the store',
      color:'green',
      source:'Supplier',
      cost:'Total Price'
  },
  {
      id:2,
      name:'Used',
      description:'Consumables',
      color:'grey',
      source:'Location/Destination',
      cost:'Extimated Price'
  },
  {
      id:3,
      name:'Deployed',
      description:'move from store to a unit, department. ',
      color:'blue',
      source:'Location/Destination',
      cost:'Extimated Price'
  },
  {
      id:4,
      name:'Damaged',
      description:'Item can nolonger be used ',
      color:'red',
      source:'Damaged by/Reason',
      cost:'Estimated Price'
  }
]
export const htmlRenderer = (htmlString)=> {
    //return <div dangerouslySetInnerHTML={{ __html: trimHtmlString(htmlString) || "" }} />;
}
export const shuffleArray = (array) => {
    // Create a shallow copy of the array to avoid modifying the original
    const newArray = [...array]; 
    let currentIndex = newArray.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [newArray[currentIndex], newArray[randomIndex]] = [
            newArray[randomIndex], newArray[currentIndex]
        ];
    }

    return newArray; // Return the new, shuffled array
}
export const createMarkingScheme = (keysArrayMap)=> {
    if (!Array.isArray(Object.keys(keysArrayMap))) {
        throw new Error("Input 'keysArray' must be an array of numbers or keys.");
    }
    
    const markingScheme = {};

    // Helper function to shuffle an array (Fisher-Yates algorithm)
    const shuffleArray = (array) => {
        // Create a copy to avoid modifying the original array passed to the shuffle (e.g., possibleAnswers)
        const newArray = [...array]; 
        let currentIndex = newArray.length, randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex !== 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [newArray[currentIndex], newArray[randomIndex]] = [
                newArray[randomIndex], newArray[currentIndex]
            ];
        }
        return newArray; // Return the shuffled copy
    };
    let keysArray = Object.keys(keysArrayMap);
    for (const key of keysArray) {
      // Dynamically create the array of possible answers from 1 to maxPossibleAnswers
      let maxPossibleAnswers = keysArrayMap[key];
      const possibleAnswers = Array.from({ length: maxPossibleAnswers }, (_, i) => i + 1);
        // Ensure there are enough possible answers to pick a correct and at least one wrong
        if (possibleAnswers.length < 1) {
            console.warn(`Skipping key '${key}': Not enough possible answers to generate a scheme.`);
            markingScheme[key] = { correct: null, wrong: [] };
            continue;
        }

        // 1. Choose a random 'correct' value from the possible answers
        const correctValue = possibleAnswers[Math.floor(Math.random() * possibleAnswers.length)];

        // 2. Determine 'wrong' values by filtering out the correct one
        const wrongValues = possibleAnswers.filter(value => value !== correctValue);

        // 3. Shuffle the 'wrong' values
        const shuffledWrongValues = shuffleArray(wrongValues); 

        // 4. Add to the marking scheme object
        markingScheme[key] = {
            correct: correctValue,
            wrong: shuffledWrongValues
        };
    }

    return markingScheme;
}

export const convertMinutesToHourMinutes =(totalMinutes)=> {
    // Ensure the input is a non-negative number
    if (typeof totalMinutes !== 'number' || totalMinutes < 0) {
        return "Invalid input";
    }

    if (totalMinutes === 0) {
        return "0 min"; // Minimized for zero minutes
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const parts = [];

    if (hours > 0) {
        parts.push(`${hours} hr`); // Abbreviated "hr"
    }

    if (minutes > 0) {
        parts.push(`${minutes} min`); // Abbreviated "min"
    }

    // Join the parts with a space.
    return parts.join(' ');
}


export const generateNumberSuffixObject =()=> {
    const result = {};
    const suffixes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

    // This loop explicitly runs from i = 1 up to and including i = 25
    for (let i = 1; i <= 25; i++) { 
        const row = [i];
        suffixes.forEach(suffix => {
            row.push(`${i}${suffix}`);
        });
        result[i] = row; // Only keys 1 through 25 are added to 'result'
    }
    return result;
}

export const questionNumberOptions = generateNumberSuffixObject();
export const inventorytypez = [
  {
      id:1,
      name:'Consumable/Perishable',
      extra:'Duration of value (Years)'
  },
  {
      id:2,
      name:'Depreciable',
      extra:'Maximum years from date instore/inuse'
  },
  {
      id:3,
      name:'Expires',
      extra:'Number of Years'
  },
  {
      id:4,
      name:'Appreciable',
      extra:'Percentage per annum (%)'
  },
  
]
export const expensestate = [
  {
      id:1,
      name:'Debit',
      description:'Send the items to the store',
      color:'red'
  },
  {
      id:2,
      name:'Credit',
      description:'Consumables',
      color:'green'
  }
]
export const expensetypez = [
  {
    id:1,
    name:'Debit',
    description:'Send the items to the store',
    color:'red'
},
{
    id:2,
    name:'Credit',
    description:'Consumables',
    color:'green'
}
  
]
export const leaves_obj = {
  6:'Casual Leave (Max. 2 days)',
  7:'Sick Leave',
  12:'Maternity Leave',
  8:'Extended Sick Leave',
  9:'Compassionate Leave',
  10:'Offsite Duty',
  13:'Study Leave',
  11:'Annual Leave'
}
export const ordinal_suffix_of = (i)=> {
  if(i !== undefined && 1 !== null && parseInt(i) > 0){
  var j = i % 10,
      k = i % 100;
  if (j == 1 && k != 11) {
      return i + "st";
  }
  if (j == 2 && k != 12) {
      return i + "nd";
  }
  if (j == 3 && k != 13) {
      return i + "rd";
  }
  return i + "th";
}
}
export const imageExist  = (imageSrc, callback) =>{
  fetch(imageSrc, {method:'HEAD'})
  .then(res=>{
    if(res.ok){
      callback(true)
    }else{
      callback(false)
    }  
  })
  .catch(err=>{
      callback(false)
  })

  }
export function convertMinutesToHoursAndMinutes(totalMinute) {
    let totalMinutes = parseInt(totalMinute)
    if (typeof totalMinutes !== 'number' || isNaN(totalMinutes) || totalMinutes < 0) {
      return 0;
    }
  
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
  
    if (hours === 0) {
      return `${minutes}m`; 
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h:${minutes}m`;
    }
  }
export function isJsonParsable(value) {
  try {
    JSON.parse(value);
    return true; // Value is parsable JSON
  } catch (error) {
    return false; // Value is not parsable JSON
  }
}

export function isObjectWithValue(value) {
  try {
    if(value && Array.isArray(Object.keys(value)) &&  Object.keys(value).length > 0 ){
      return true; // Value is parsable JSON
    }else{
      return false; // Value is parsable JSON
    };
  } catch (error) {
    return false; // Value is not parsable JSON
  }
}

export function isArrayWithValue(value) {
  try {
    if(value && Array.isArray(value) &&  value.length > 0 ){
      return true; // Value is parsable JSON
    }else{
      return false; // Value is parsable JSON
    };
  } catch (error) {
    return false; // Value is not parsable JSON
  }
}

export const checkImage = imageSrc =>{
  var img = new Image();
      try{
        img.src = imageSrc;
        return true;
      }catch(err){
        return false;
      }

  }
export const timeConvert = date =>{
    return '';
}
export const setElement=(id, valueToSet)=>{
  document.getElementById(id).value = valueToSet;
}
export const gradetype = [
  "ND",
  "OND",
  "HND",
  "NCE",
  "B.Sc.",
  "BA.",
  "B.Eng.",
  "B.Tech.",
  "B.Tech. (Ed)",
  "B.Ed.",
  "M.Sc.",
  "MA.",
  "M.Eng.",
  "M.Tech.",
  "M.Ed.",
  "Phd"
]
export const gradetypes = [
  "First Class",
  "Second Class Upper",
  "Second Class Lower",
  "Third Class",
  "Upper Credit",
  "Lower Credit",
  "Passed",
  "Certificate of Attencdance"
]
export const allgender = {
   'male':'male',
   'Female':'Female'
};

export const all_employment_approval_store = [
  {label:'Ignore', value:0},
  {label:'Approved', value:1},
  {label:'Not Approved', value:2}
];

export const all_employment_passed_store = [
  {label:'Passed: Meet the required score', value:1},
  {label:'Failed: Did not meet up with the required score', value:2}
];

export const gender_store = [
  {label:'Male', value:'male'},
  {label:'Female', value:'female'}
];
export const marital_store = [
  {label:'Single', value:'Single'},
  {label:'Married', value:'Married'},
  {label:'Widow', value:'Widow'}
];
export const allrelations = {
    'Father':'Father',
    'Mother':'Mother',
    'Aunt':'Aunt',
    'Uncle':'Uncle',
    'Grandparent':'Grandparent',
    'Sponsor':'Sponsor',
   };
const allplacex = {
   'MESL':'MAINSTREAM ENERGY SOLUTIONS LIMITED',
    'Transmission Company':'Transmission Company',
    'StreSERT Integrated Limited':'StreSERT Integrated Limited',
    'Kombat Securities':'Kombat Securities',
    'Door2Door':'Door2Door',
    'Cedacrest':'Cedacrest',
    'Hermes':'Hermes',
    'Hydro polis':'Hydro Polis',
    'Nigerian Army':'Nigeria Army',
    'Nigerian Police':'Nigerian Police',
    'Federal Civil Servant':'Federal Civil Servant',
    'State Civil Service':'State Civil Service',
    'Business Man/Woman':'Business Man/Woman',
    'Clergy':'Clergy'

   };
allplacex[import.meta.env.REACT_APP_HOSTNAME] = import.meta.env.REACT_APP_HOSTNAME;
export const allplaces = allplacex
export const allhousess = {
    'Blue':'Blue',
    'Green':'Green',
    'Red':'Red',
    'Yellow':'Yellow',
    'White':'White',
    'Orange':'Orange',
    'Gold':'Gold',
    'Silver':'Silver',
    'Brown':'Brown'

   };
export const allrelationsx = {
    'Father':'Father',
    'Mother':'Mother',
    'Spouse':'Spouse',
    'Child':'Child',
    'Sibling':'Sibling',
    'Aunt':'Aunt',
    'Uncle':'Uncle',
    'Grandparent':'Grandparent'
   };
export const allpensions= ["Pensions Alliance Limited",
"Apt Pension Fund Managers",
"ARM Pension Managers",
"Crusader Pensions Limited",
"Fidelity Pensions Managers Limited",
"First Guarantee Pension Limited",
"First Pension Custodian Nigeria Limited",
"Leadway Pensure PFA Limited",
"National Pension Commission",
"NLPC Pension Fund Administrators",
"Oak Pensions Limited",
"Premium Pension Limited",
"Trustfund Pensions Plc",
"AXA Mansard Pensions Limited",
"Fug Pensions Limited",
"Legacy Pension Managers Limited",
"Sigma Pensions",
"AIICO Pensions",
"Stanbic IBTC Pension Managers Limited"];
export const alllocationsObj = [
{'value':1, 'label':'Kainji'},
{'value':2, 'label':'Jebba'}
];
export const statuss = {
    1 :'Low',
    2 :'Normal',
    3 :'High',
    4 :'Emergency'
  };
export const statussobj = [
    {'value':1, 'label':'Low'},
    {'value':2, 'label':'Normal'},
    {'value':3, 'label':'High'},
    {'value':4, 'label':'Emergency'}
  ];
export const leavestd =[
    // {
    //     "id":1,
    //     "name":'Default',
    //     color:'#ccc',
    //     colors:'secondary',
    // },
    // {
    //     "id":2,
    //     "name":'Present',
    //     color:'#cfc',
    //     colors:'success',
    // },
    {
        "id":3,
        "name":'Absent with prermission',
        "abbrv":"Absent1",
        color:'blue',
        colors:'info',
    },
    {
        "id":4,
        "name":'Late',
        "abbrv":"Late",
        color:'yellow',
        colors:'warning'
    },
    {
        "id":5,
        "name":'Absent no reason',
        "abbrv":"Absent2",
        color:'red',
        colors:'danger'
    },
    {
        "id":6,
        "name":'Half-day Present in the Morning',
        "abbrv":"HalfDay",
        color:'yellow',
        colors:'warning'
    }
  ]
export const leaves =[
  {
    "id":0,
    "name":'At work',
    color:'purple',
    colors:'info',
},
  {
      "id":3,
      "name":'Sick Leave',
      color:'purple',
      colors:'info',
  },
  {
      "id":4,
      "name":'Maternity Leave',
      colors:'blue',
  },
  {
      "id":5,
      "name":'Annual Leave',
      color:'#000',
      colors:'light'
  },
  {
    "id":6,
    name:'Unpaid Leave',
    color:'yellow',
    colors:'dark',
  },
]
export const timings = {
      0:'Group Default',
      1:'Group 1',
      2:'Group 2',
      3:'Group 3',
      4:'Group 4',
      5:'Group 5',
}
export const controls = {
    0: {
      name:'Staff',
      data:[
        {id:1, name:'List', icon:'cil-list'},
        {id:2, name:'Add Staff', icon:'cil-user-plus'},
        {id:3, name:'Chart', icon:'cil-chart-pie'},
        {id:4, name:'Biodata', icon:'cil-people'},
        {id:5, name:'Contact', icon:'cil-contact'},
        {id:6, name:'Employment', icon:'cil-paint'},
        {id:7, name:'Education', icon:'cil-book'},
        {id:8, name:'Professional', icon:'cil-badge'},
        {id:9, name:'Experience', icon:'cil-mug-tea'},
        {id:10, name:'Leave', icon:'cil-flight-takeoff'},
        {id:18, name:'Leave Details', icon:'cil-flight-takeoff'},
        {id:11, name:'Behavior', icon:'cil-mood-very-good'},
        {id:12, name:'Office', icon:'cil-star'},
        {id:13, name:'Level', icon:'cil-arrow-top'},
        {id:14, name:'Attendance', icon:'cil-wc'},
        {id:15, name:'Logs', icon:'cil-list'},
        {id:16, name:'Access', icon:'cil-lock-locked'},
        {id:17, name:'Subject', icon:'cil-book'},
        {id:19, name:'Appriasal', icon:'cil-book'},
        {id:20, name:'Exit', icon:'cil-lock-locked'},
      ]
    },
    1: {
      name:'Students',
      data:[
        {id:1, name:'List', icon:'cil-list'},
        {id:2, name:'Chart', icon:'cil-user'},
        {id:3, name:'Admission', icon:'cil-user'},
        {id:4, name:'Biodata', icon:'cil-book'},
        {id:9, name:'Contact', icon:'cil-envelope'},
        {id:5, name:'Fees', icon:'cil-money'},
        {id:6, name:'Class Analysis', icon:'cil-money'},
        {id:7, name:'Attendance ', icon:'cil-wc'},
        {id:8, name:'Academics ', icon:'cil-wc'},
      ]
    },
    2: {
      name:'Setting',
      data:[
        {
          id:1,
          name:'STAFF',
          icon:'/icons/staff.png',
          links:'/calendar',
          description:'Add, Manage Staff Data',
          submenu:[
            {
              id:1,
              name:'ADD STAFF',
              icon:'/icons/adduser.png',
              links:'/staffa',
              description:'Add a new staff to the database'
            },{
              id:2,
              name:'CURRENT STAFF',
              icon:'/icons/usergood.png',
              links:'/staffs',
              description:'All staff currently in employment'
            },{
              id:3,
              name:'EX STAFF',
              icon:'/icons/userbad.png',
              links:'/staffso',
              description:'All staff no longer in company service'
            }
          ]
        },
        {
          id:2,
          name:'STUDENT',
          icon:'/icons/student.png',
          links:'/calendar',
          description:'Add & Manage Student data',
          submenu:[
              {
                id:1,
                name:'ADD STUDENT',
                icon:'/icons/adduser.png',
                links:'/studenta',
                description:'Add a new student to the database'
              },{
                id:2,
                name:'CURRENT STUDENT',
                icon:'/icons/usergood.png',
                links:'/students',
                description:'All students in school base on active term'
              },{
                id:3,
                name:'EX STUDENT',
                icon:'/icons/userbad.png',
                links:'/studentso',
                description:'All students no longer in the school'
              }
            ]
        },
        {
          id:3,
          name:'CALENDAR',
          icon:'/icons/calendar.png',
          links:'/setting/3/',
          description:'Create, Modify Session, Terms, Assessments',
          submenu:[
            {
            id:1,
            name:'TERMS',
            icon:'/icons/calendar.png',
            links:'/setting/3/',
            description:'Add, modify term',
            submenu:[
              {
                id:1,
                name:'TERMLY ASSESSMENTS',
                icon:'/icons/term_assessment.png',
                links:'/setting/3/',
                description:'Prepare academic assessment parameters for the term'
              },
              {
                id:2,
                name:'BEHAVIOR',
                icon:'/icons/term_behavior.png',
                links:'/setting/3/',
                description:'Prepare behavioral assessment parameters for the term'
              },
              {
                id:3,
                name:'SKILLS',
                icon:'/icons/term_skill.png',
                links:'/setting/3/',
                description:'Prepare psychomoto assessment parameters for the term'
              },{
                id:4,
                name:'CLASS ALLOCATION',
                icon:'/icons/term_class_allocation.png',
                links:'/setting/3/',
                description:'Allocate classes to teachers for management and supervision'
              },{
                id:5,
                name:'SUBJECT ALLOCATION',
                icon:'/icons/term_subject_allocation.png',
                links:'/setting/3/',
                description:'Allocate subjects to teachers to teach and evaluate'
              },{
                id:6,
                name:'TIMETABLE',
                icon:'/icons/term_timetable.png',
                links:'/setting/3/',
                description:'Prepare class timetable for the term'
              },
              {
                id:10,
                name:'ACADEMIC WEEKS',
                icon:'/icons/week.png',
                links:'/setting/3/',
                description:'Week set for teaching. Facilitates lesson plan & Attendance management'
              },
              {
                id:7,
                name:'CLASS FEES',
                icon:'/icons/term_fee.png',
                links:'/setting/3/',
                description:'Prepare school fees to be paid by students for the term'
              },
              {
                id:8,
                name:'Quick Setup',
                icon:'/icons/term_fee.png',
                links:'/setting/3/',
                description:'Use a previos records to update this terms data'
              },
            ]

          }
        ]
        },
        {
          id:4,
          name:'SCHOOL',
          icon:'/icons/school.png',
          links:'/school',
          description:'Add & modify a school'
        },
        {
          id:5,
          name:'DEPARTMENT',
          icon:'/icons/department.png',
          links:'/department',
          description:'Add & modify departments and units',
          submenu:[{
            id:1,
            name:'Unit',
            icon:'/icons/department.png',
            links:'/theme',
            description:'Add & modify units',
            submenu:[]
          },]
        },
        {
          id:6,
          name:'SUBJECTS',
          icon:'/icons/subject.png',
          links:'/subject',
          description:'Add & modify subjects, Scheme of work & Question bank',
          submenu:[{
            id:1,
            name:'SHEME OF WORK',
            icon:'/icons/department.png',
            links:'/theme',
            description:'Add & modify subjects',
            submenu:[]
          },]
        },{
          id:7,
          name:'ADMISSION',
          icon:'/icons/admission.png',
          links:'/admission',
          description:'Add & Modify Admission session & Candidates',
          submenu:[{
            id:3,
            name:'ADMISSIONS',
            icon:'/icons/calendar.png',
            links:'/calendar',
            submenu:[]
          }]
        },
        {id:8,
          name:'TIMING',
          icon:'/icons/timetable.png',
          links:'/timetable',
          description:'Set or modify class timing',
          submenu:[]
        },       
        {
          id:9,
          name:'CLASS',
          icon:'/icons/class.png',
          links:'/clasz',
          description:'Add & modify Classes and Class units',
          submenu:[
            {
            id:3,
            name:'CLASS UNIT',
            icon:'/icons/class.png',
            links:'/calendar',
            submenu:[]
          }]
        },
        {
          id:10,
          name:'ACCOUNTS',
          icon:'/icons/account.png',
          links:'/account',
          description:'Add & Modify bank accounts for fee payments and expenses management',
          submenu:[]
        },
        {
          id:11,
          name:'EXPENSES',
          icon:'/icons/expense.png',
          links:'/expense',
          description:'Create & Modify expenses category and sub categories',
          submenu:[{
            id:11,
            name:'EXPENSES UNITS',
            icon:'/icons/expenses.png',
            links:'/expenses',
            submenu:[]
          }]
        },
        {
          id:12,
          name:'CBT',
          icon:'/icons/exam.png',
          links:'/cbt',
          description:'Set up CBT test',
          submenu:[{
            id:12,
            name:'Test Parameters',
            icon:'/icons/exam.png',
            links:'/expenses',
            submenu:[]
          }]
        },
        {
          id:13,
          name:'GRADES',
          icon:'/icons/grade.png',
          links:'/grade',
          description:'Setup grading system for report',
          submenu:[
            {
            id:1,
            name:'GRADE',
            icon:'/icons/grade.png',
            links:'/gradeunit',
            description:'Add & modify grades',
            submenu:[]
          },]
        },
        {
          id:14,
          name:'REPORT CARD',
          icon:'/icons/report.png',
          links:'/report',
          description:'Create & Modify report cards template',
          submenu:[]
        },
        {
          id:15,
          name:'FEES',
          icon:'/icons/fee.png',
          links:'/fee',
          description:'Add and modify types of fees',
          submenu:[]
        },
        {
          id:16,
          name:'INVENTORY',
          icon:'/icons/inventory.png',
          links:'/inventory',
          description:'Add & modify inventory categories and Sub categories',
          submenu:[{
            id:3,
            name:'TERMS',
            icon:'/icons/calendar.png',
            links:'/calendar',
          }]
        },
        {
          id:17,
          name:'MAINTENANCE',
          icon:'/icons/maintenance.png',
          links:'/maintenance',
          description:'Add & modify maintenance categories and Sub categories',
          submenu:[{
            id:3,
            name:'TERMS',
            icon:'/icons/calendar.png',
            links:'/calendar',
          }]
        },{
          id:18,
          name:'OFFICE',
          icon:'/icons/office.png',
          links:'/office',
          description:'Setup offices and state job roles for each',
          submenu:[{
            id:1,
            name:'JOB ROLES',
            icon:'/icons/office.png',
            links:'/setting',
          }]
        },{
          id:19,
          name:'RANK/LEVEL',
          icon:'/icons/rank.png',
          links:'/rank',
          description:'Add & modify ranks/level',
          submenu:[]
        },{
          id:20,
          name:'NOTIFICATION',
          icon:'/icons/notification.png',
          links:'/notification',
          description:'Pass informations on notification bar',
          submenu:[{
            id:3,
            name:'MESSAGE',
            icon:'/icons/notification.png',
            links:'/calendar',
          }]
        },
        
      ]
    },
    3:{
      name:'Fees',
      data:[
        {
          id:1,
          name:'FeeChart',
          icon:'/icons/chart.png',
          links:'/fee_chart'
        },
        {
          id:2,
          name:'Fees Approval',
          icon:'/icons/staff.png',
          links:'/expenses_fee'
        },
        {
          id:3,
          name:'Report',
          icon:'/icons/staff.png',
          links:'/fee_report'
        },
        {
          id:4,
          name:'Fees Setting',
          icon:'/icons/staff.png',
          links:'/fee_setting'
        }
      ]
    },
    4:{
      name:'Expenses',
      data:[
        {
          id:1,
          name:'Daily Expenses',
          icon:'/icons/expenses/capital.png',
          links:'/expenses_daily'
        }, 
        {
          id:3,
          name:'Capital Expenses',
          icon:'/icons/expenses/impress.png',
          links:'/expenses_capital'
        },
        {
          id:2,
          name:'Cash Transfers',
          icon:'/icons/expenses/impress.png',
          links:'/expenses_transfer'
        }, {
          id:4,
          name:'Fees',
          icon:'/icons/expenses/report.png',
          links:'/fee_home'
        }, {
          id:5,
          name:'Account Reports',
          icon:'/icons/expenses/report.png',
          links:'/expenses_report'
        },{
          id:6,
          name:'Inventory',
          icon:'/icons/inventory/assets.png',
          links:'/inventory'
        },{
          id:7,
          name:'Maintenance',
          icon:'/icons/inventory/inventory.png',
          links:'/maintenance'
        }
      ]
    },
    5:{
      name:'Inventory',
      data:[
        {
          id:1,
          name:'Assets',
          icon:'/icons/inventory/assets.png',
          links:'/inventory_assets'
        }, 
        {
          id:2,
          name:'Office Supplies',
          icon:'/icons/inventory/supplies.png',
          links:'/inventory_supplies'
        },
        {
          id:3,
          name:'Deployed and Damaged',
          icon:'/icons/inventory/consumer.png',
          links:'/inventory_deployed'
        },
          {
          id:4,
          name:'Reports',
          icon:'/icons/inventory/inventory.png',
          links:'/inventory_report'
        }
      ]
    },
    6:{
      name:'Maintenance',
      data:[
        {
          id:1,
          name:'STAFF',
          icon:'/icons/staff.png',
          links:'/calendar'
        }
      ]
    },
    'admin': {
      name:'Admin',
      submenu:[
        {id:0, name:'Admission', icon: faHandsBubbles, links:'admission', color:'orange'},
        {id:1, name:'Compliant', icon: faAngry, links:'complaint', color:'orange'},
        {id:2, name:'Feed Back', icon: faFeed, links:'feedback' , color:'orange' },
        {id:3, name:'Duty Report', icon: faWeight, links:'dairys', color:'orange'},
        {id:4, name:'Leave', icon: faPlaneCircleExclamation, links:'leave', color:'orange'},
        {id:5, name:'Employees', icon: faChalkboardTeacher, links:'staffs', color:'orange'},
        {id:6, name:'Students', icon: faChildren, links:'studentmenus' , color:'orange'},
        {id:7, name:'Settings', icon: faCogs, links:'settings' , color:'orange',
        submenu:[
            {
              id:1,
              name:'Staff',
              icon:'/icons/staff.png',
              links:'staff',
              description:'Add, Manage Staff Data',
              submenu:[
                {
                  id:1,
                  name:'ADD STAFF',
                  icon:'/icons/adduser.png',
                  links:'/staffa',
                  description:'Add a new staff to the database'
                },{
                  id:2,
                  name:'CURRENT STAFF',
                  icon:'/icons/usergood.png',
                  links:'/staffs',
                  description:'All staff currently in employment'
                },{
                  id:3,
                  name:'EX STAFF',
                  icon:'/icons/userbad.png',
                  links:'/staffso',
                  description:'All staff no longer in company service'
                }
              ]
            },
            {
              id:2,
              name:'STUDENT',
              icon:'/icons/student.png',
              links:'/calendar',
              description:'Add & Manage Student data',
              submenu:[
                  {
                    id:1,
                    name:'ADD STUDENT',
                    icon:'/icons/adduser.png',
                    links:'/studenta',
                    description:'Add a new student to the database'
                  },{
                    id:2,
                    name:'CURRENT STUDENT',
                    icon:'/icons/usergood.png',
                    links:'/students',
                    description:'All students in school base on active term'
                  },{
                    id:3,
                    name:'EX STUDENT',
                    icon:'/icons/userbad.png',
                    links:'/studentso',
                    description:'All students no longer in the school'
                  }
                ]
            },
            {
              id:3,
              name:'CALENDAR',
              icon:'/icons/calendar.png',
              links:'/setting/3/',
              description:'Create, Modify Session, Terms, Assessments',
              submenu:[
                {
                id:1,
                name:'TERMS',
                icon:'/icons/calendar.png',
                links:'/setting/3/',
                description:'Add, modify term',
                submenu:[
                  {
                    id:1,
                    name:'TERMLY ASSESSMENTS',
                    icon:'/icons/term_assessment.png',
                    links:'/setting/3/',
                    description:'Prepare academic assessment parameters for the term'
                  },
                  {
                    id:2,
                    name:'BEHAVIOR',
                    icon:'/icons/term_behavior.png',
                    links:'/setting/3/',
                    description:'Prepare behavioral assessment parameters for the term'
                  },
                  {
                    id:3,
                    name:'SKILLS',
                    icon:'/icons/term_skill.png',
                    links:'/setting/3/',
                    description:'Prepare psychomoto assessment parameters for the term'
                  },{
                    id:4,
                    name:'CLASS ALLOCATION',
                    icon:'/icons/term_class_allocation.png',
                    links:'/setting/3/',
                    description:'Allocate classes to teachers for management and supervision'
                  },{
                    id:5,
                    name:'SUBJECT ALLOCATION',
                    icon:'/icons/term_subject_allocation.png',
                    links:'/setting/3/',
                    description:'Allocate subjects to teachers to teach and evaluate'
                  },{
                    id:6,
                    name:'TIMETABLE',
                    icon:'/icons/term_timetable.png',
                    links:'/setting/3/',
                    description:'Prepare class timetable for the term'
                  },
                  {
                    id:10,
                    name:'ACADEMIC WEEKS',
                    icon:'/icons/week.png',
                    links:'/setting/3/',
                    description:'Week set for teaching. Facilitates lesson plan & Attendance management'
                  },
                  {
                    id:7,
                    name:'CLASS FEES',
                    icon:'/icons/term_fee.png',
                    links:'/setting/3/',
                    description:'Prepare school fees to be paid by students for the term'
                  },
                  {
                    id:8,
                    name:'Quick Setup',
                    icon:'/icons/term_fee.png',
                    links:'/setting/3/',
                    description:'Use a previos records to update this terms data'
                  },
                ]
    
              }
            ]
            },
            {
              id:4,
              name:'SCHOOL',
              icon:'/icons/school.png',
              links:'/school',
              description:'Add & modify a school'
            },
            {
              id:5,
              name:'DEPARTMENT',
              icon:'/icons/department.png',
              links:'/department',
              description:'Add & modify departments and units',
              submenu:[{
                id:1,
                name:'Unit',
                icon:'/icons/department.png',
                links:'/theme',
                description:'Add & modify units',
                submenu:[]
              },]
            },
            {
              id:6,
              name:'SUBJECTS',
              icon:'/icons/subject.png',
              links:'/subject',
              description:'Add & modify subjects, Scheme of work & Question bank',
              submenu:[{
                id:1,
                name:'SHEME OF WORK',
                icon:'/icons/department.png',
                links:'/theme',
                description:'Add & modify subjects',
                submenu:[]
              },]
            },{
              id:7,
              name:'ADMISSION',
              icon:'/icons/admission.png',
              links:'/admission',
              description:'Add & Modify Admission session & Candidates',
              submenu:[{
                id:3,
                name:'ADMISSIONS',
                icon:'/icons/calendar.png',
                links:'/calendar',
                submenu:[]
              }]
            },
            {id:8,
              name:'TIMING',
              icon:'/icons/timetable.png',
              links:'/timetable',
              description:'Set or modify class timing',
              submenu:[]
            },       
            {
              id:9,
              name:'CLASS',
              icon:'/icons/class.png',
              links:'/clasz',
              description:'Add & modify Classes and Class units',
              submenu:[
                {
                id:3,
                name:'CLASS UNIT',
                icon:'/icons/class.png',
                links:'/calendar',
                submenu:[]
              }]
            },
            {
              id:10,
              name:'ACCOUNTS',
              icon:'/icons/account.png',
              links:'/account',
              description:'Add & Modify bank accounts for fee payments and expenses management',
              submenu:[]
            },
            {
              id:11,
              name:'EXPENSES',
              icon:'/icons/expense.png',
              links:'/expense',
              description:'Create & Modify expenses category and sub categories',
              submenu:[{
                id:11,
                name:'EXPENSES UNITS',
                icon:'/icons/expenses.png',
                links:'/expenses',
                submenu:[]
              }]
            },
            {
              id:12,
              name:'CBT',
              icon:'/icons/exam.png',
              links:'/cbt',
              description:'Set up CBT test',
              submenu:[{
                id:12,
                name:'Test Parameters',
                icon:'/icons/exam.png',
                links:'/expenses',
                submenu:[]
              }]
            },
            {
              id:13,
              name:'GRADES',
              icon:'/icons/grade.png',
              links:'/grade',
              description:'Setup grading system for report',
              submenu:[
                {
                id:1,
                name:'GRADE',
                icon:'/icons/grade.png',
                links:'/gradeunit',
                description:'Add & modify grades',
                submenu:[]
              },]
            },
            {
              id:14,
              name:'REPORT CARD',
              icon:'/icons/report.png',
              links:'/report',
              description:'Create & Modify report cards template',
              submenu:[]
            },
            {
              id:15,
              name:'FEES',
              icon:'/icons/fee.png',
              links:'/fee',
              description:'Add and modify types of fees',
              submenu:[]
            },
            {
              id:16,
              name:'INVENTORY',
              icon:'/icons/inventory.png',
              links:'/inventory',
              description:'Add & modify inventory categories and Sub categories',
              submenu:[{
                id:3,
                name:'TERMS',
                icon:'/icons/calendar.png',
                links:'/calendar',
              }]
            },
            {
              id:17,
              name:'MAINTENANCE',
              icon:'/icons/maintenance.png',
              links:'/maintenance',
              description:'Add & modify maintenance categories and Sub categories',
              submenu:[{
                id:3,
                name:'TERMS',
                icon:'/icons/calendar.png',
                links:'/calendar',
              }]
            },{
              id:18,
              name:'OFFICE',
              icon:'/icons/office.png',
              links:'/office',
              description:'Setup offices and state job roles for each',
              submenu:[{
                id:1,
                name:'JOB ROLES',
                icon:'/icons/office.png',
                links:'/setting',
              }]
            },{
              id:19,
              name:'RANK/LEVEL',
              icon:'/icons/rank.png',
              links:'/rank',
              description:'Add & modify ranks/level',
              submenu:[]
            },{
              id:20,
              name:'NOTIFICATION',
              icon:'/icons/notification.png',
              links:'/notification',
              description:'Pass informations on notification bar',
              submenu:[{
                id:3,
                name:'MESSAGE',
                icon:'/icons/notification.png',
                links:'/calendar',
              }]
            },
            
        ]
        },
        {id:8, name:'Appraisals', 
        icon: faUserCheck, links:'appriasal' , color:'orange'},
        {id:9, name:'Career', 
        icon: faChild, links:'career_page' , color:'orange'},
      ]
    },
    'academic': {
      name:'Academics',
      submenu:[
        {id:0, name:'Class', 
        icon: faBlackboard, links:'/classes', color:'teal'},
        {id:1, name:'My Subjects', 
        icon: faBookAtlas, links:'/myclass', color:'teal'},
        {id:7, name:'Test', 
        icon: faBookOpenReader, links:'/cbttest', color:'teal'},
        {id:2, name:'Assessments', 
        icon: faBookBookmark, links:'/assessment' , color:'teal' },
        {id:3, name:'Report Card', 
        icon: faCertificate, links:'/results', color:'teal'},
        {id:4, name:'Syllabus', 
        icon: faAtlas, links:'/schemeofwork', color:'teal'},
        {id:6, name:'Lesson Scheme', 
        icon: faGolfBallTee, links:'/lesson_plan_class', color:'teal'},
        {id:5, name:'Lesson Plan', 
        icon: faGlobeAfrica, links:'/lesson_plan_week', color:'teal',
        // children:[
        //     {id:0, name:'Weekly', 
        //     icon:'Lesson Plan', links:'/lesson_plan_week', color:'grey'},
        //     {id:1, name:'Department', 
        //     icon:'Lesson Plan', links:'/lesson_plan', color:'grey'},
        //     {id:2, name:'Class', 
        //     icon:'Lesson Plan', links:'/lesson_plan_class' , color:'grey' },
        //     {id:3, name:'Staff', 
        //     icon:'Lesson Plan', links:'/lesson_plan_staff', color:'grey'},
        // ]
      }
      ]
    },
}
export const access = {
  0: {
        name:'Location/Dashboard',
        data:{
          0:'All locations',
          1:'Kainji',
          2:'Jebba',
          3:'Veiw HouseKeeping Dashboard',
          4:'Veiw Maintenance Dashboard',
          5:'Veiw Employee Dashboard',
        }
      },
  1: {
        name:'Guest',
        data: {
              0:'All',
              1:'Veiw Guest Information',
              2:'Veiw Guest Complaints',
              3:'Send request for guest feedback'
              }
      },
  2: {
        name:'Booking',
        data : {
            0:'All',
            1:'Log booking activities',
            2:'Veiw reports',
            3:'Manage Houses',
            4:'Manage Rooms'
          }
      },
  3: {
      name:'Inventory',
      data : {
          0:'All',
          1:'Make inventory Request',
          2:'Veiw Reports',
          3:'Approve Inventory request',
          4:'Manage Inventory Categories',
          5:'Manage Inventories List'
        }
    },
  4: {
    name:'Maintenance',
    data : {
      0:'All',
      1:'Apply for Maintenance',
      2:'Veiw Reports',
      3:'Approve Maintenance request',
      4:'Manage Maintenance Categories',
      5:'Manage Maintenance Issues'
    }
  },
  5: {
    name:'Employee',
    data : {
      0:'All',
      1:'Add Employee',
      2:'Assign Job Role',
      3:'Approve Leave',
      4:'Veiw All Staff Data',
      5:'Change Staff Data',
      6:'Audit Log'
      }
  },
}
export const states = [
  {
    "state": "Adamawa",
    "alias": "adamawa",
    "lgas": [
      "Demsa",
      "Fufure",
      "Ganye",
      "Gayuk",
      "Gombi",
      "Grie",
      "Hong",
      "Jada",
      "Larmurde",
      "Madagali",
      "Maiha",
      "Mayo Belwa",
      "Michika",
      "Mubi North",
      "Mubi South",
      "Numan",
      "Shelleng",
      "Song",
      "Toungo",
      "Yola North",
      "Yola South"
    ]
  },
  {
    "state": "Akwa Ibom",
    "alias": "akwa_ibom",
    "lgas": [
      "Abak",
      "Eastern Obolo",
      "Eket",
      "Esit Eket",
      "Essien Udim",
      "Etim Ekpo",
      "Etinan",
      "Ibeno",
      "Ibesikpo Asutan",
      "Ibiono-Ibom",
      "Ikot Abasi",
      "Ika",
      "Ikono",
      "Ikot Ekpene",
      "Ini",
      "Mkpat-Enin",
      "Itu",
      "Mbo",
      "Nsit-Atai",
      "Nsit-Ibom",
      "Nsit-Ubium",
      "Obot Akara",
      "Okobo",
      "Onna",
      "Oron",
      "Udung-Uko",
      "Ukanafun",
      "Oruk Anam",
      "Uruan",
      "Urue-Offong/Oruko",
      "Uyo"
    ]
  },
  {
    "state": "Anambra",
    "alias": "anambra",
    "lgas": [
      "Aguata",
      "Anambra East",
      "Anaocha",
      "Awka North",
      "Anambra West",
      "Awka South",
      "Ayamelum",
      "Dunukofia",
      "Ekwusigo",
      "Idemili North",
      "Idemili South",
      "Ihiala",
      "Njikoka",
      "Nnewi North",
      "Nnewi South",
      "Ogbaru",
      "Onitsha North",
      "Onitsha South",
      "Orumba North",
      "Orumba South",
      "Oyi"
    ]
  },
  {
    "state": "Ogun",
    "alias": "ogun",
    "lgas": [
      "Abeokuta North",
      "Abeokuta South",
      "Ado-Odo/Ota",
      "Egbado North",
      "Ewekoro",
      "Egbado South",
      "Ijebu North",
      "Ijebu East",
      "Ifo",
      "Ijebu Ode",
      "Ijebu North East",
      "Imeko Afon",
      "Ikenne",
      "Ipokia",
      "Odeda",
      "Obafemi Owode",
      "Odogbolu",
      "Remo North",
      "Ogun Waterside",
      "Shagamu"
    ]
  },
  {
    "state": "Ondo",
    "alias": "ondo",
    "lgas": [
      "Akoko North-East",
      "Akoko North-West",
      "Akoko South-West",
      "Akoko South-East",
      "Akure North",
      "Akure South",
      "Ese Odo",
      "Idanre",
      "Ifedore",
      "Ilaje",
      "Irele",
      "Ile Oluji/Okeigbo",
      "Odigbo",
      "Okitipupa",
      "Ondo West",
      "Ose",
      "Ondo East",
      "Owo"
    ]
  },
  {
    "state": "Rivers",
    "alias": "rivers",
    "lgas": [
      "Abua/Odual",
      "Ahoada East",
      "Ahoada West",
      "Andoni",
      "Akuku-Toru",
      "Asari-Toru",
      "Bonny",
      "Degema",
      "Emuoha",
      "Eleme",
      "Ikwerre",
      "Etche",
      "Gokana",
      "Khana",
      "Obio/Akpor",
      "Ogba/Egbema/Ndoni",
      "Ogu/Bolo",
      "Okrika",
      "Omuma",
      "Opobo/Nkoro",
      "Oyigbo",
      "Port Harcourt",
      "Tai"
    ]
  },
  {
    "state": "Bauchi",
    "alias": "bauchi",
    "lgas": [
      "Alkaleri",
      "Bauchi",
      "Bogoro",
      "Damban",
      "Darazo",
      "Dass",
      "Gamawa",
      "Ganjuwa",
      "Giade",
      "Itas/Gadau",
      "Jama'are",
      "Katagum",
      "Kirfi",
      "Misau",
      "Ningi",
      "Shira",
      "Tafawa Balewa",
      "Toro",
      "Warji",
      "Zaki"
    ]
  },
  {
    "state": "Benue",
    "alias": "benue",
    "lgas": [
      "Agatu",
      "Apa",
      "Ado",
      "Buruku",
      "Gboko",
      "Guma",
      "Gwer East",
      "Gwer West",
      "Katsina-Ala",
      "Konshisha",
      "Kwande",
      "Logo",
      "Makurdi",
      "Obi",
      "Ogbadibo",
      "Ohimini",
      "Oju",
      "Okpokwu",
      "Oturkpo",
      "Tarka",
      "Ukum",
      "Ushongo",
      "Vandeikya"
    ]
  },
  {
    "state": "Borno",
    "alias": "borno",
    "lgas": [
      "Abadam",
      "Askira/Uba",
      "Bama",
      "Bayo",
      "Biu",
      "Chibok",
      "Damboa",
      "Dikwa",
      "Guzamala",
      "Gubio",
      "Hawul",
      "Gwoza",
      "Jere",
      "Kaga",
      "Kala/Balge",
      "Konduga",
      "Kukawa",
      "Kwaya Kusar",
      "Mafa",
      "Magumeri",
      "Maiduguri",
      "Mobbar",
      "Marte",
      "Monguno",
      "Ngala",
      "Nganzai",
      "Shani"
    ]
  },
  {
    "state": "Bayelsa",
    "alias": "bayelsa",
    "lgas": [
      "Brass",
      "Ekeremor",
      "Kolokuma/Opokuma",
      "Nembe",
      "Ogbia",
      "Sagbama",
      "Southern Ijaw",
      "Yenagoa"
    ]
  },
  {
    "state": "Cross River",
    "alias": "cross_river",
    "lgas": [
      "Abi",
      "Akamkpa",
      "Akpabuyo",
      "Bakassi",
      "Bekwarra",
      "Biase",
      "Boki",
      "Calabar Municipal",
      "Calabar South",
      "Etung",
      "Ikom",
      "Obanliku",
      "Obubra",
      "Obudu",
      "Odukpani",
      "Ogoja",
      "Yakuur",
      "Yala"
    ]
  },
  {
    "state": "Delta",
    "alias": "delta",
    "lgas": [
      "Aniocha North",
      "Aniocha South",
      "Bomadi",
      "Burutu",
      "Ethiope West",
      "Ethiope East",
      "Ika North East",
      "Ika South",
      "Isoko North",
      "Isoko South",
      "Ndokwa East",
      "Ndokwa West",
      "Okpe",
      "Oshimili North",
      "Oshimili South",
      "Patani",
      "Sapele",
      "Udu",
      "Ughelli North",
      "Ukwuani",
      "Ughelli South",
      "Uvwie",
      "Warri North",
      "Warri South",
      "Warri South West"
    ]
  },
  {
    "state": "Ebonyi",
    "alias": "ebonyi",
    "lgas": [
      "Abakaliki",
      "Afikpo North",
      "Ebonyi",
      "Afikpo South",
      "Ezza North",
      "Ikwo",
      "Ezza South",
      "Ivo",
      "Ishielu",
      "Izzi",
      "Ohaozara",
      "Ohaukwu",
      "Onicha"
    ]
  },
  {
    "state": "Edo",
    "alias": "edo",
    "lgas": [
      "Akoko-Edo",
      "Egor",
      "Esan Central",
      "Esan North-East",
      "Esan South-East",
      "Esan West",
      "Etsako Central",
      "Etsako East",
      "Etsako West",
      "Igueben",
      "Ikpoba Okha",
      "Orhionmwon",
      "Oredo",
      "Ovia North-East",
      "Ovia South-West",
      "Owan East",
      "Owan West",
      "Uhunmwonde"
    ]
  },
  {
    "state": "Ekiti",
    "alias": "ekiti",
    "lgas": [
      "Ado Ekiti",
      "Efon",
      "Ekiti East",
      "Ekiti South-West",
      "Ekiti West",
      "Emure",
      "Gbonyin",
      "Ido Osi",
      "Ijero",
      "Ikere",
      "Ilejemeje",
      "Irepodun/Ifelodun",
      "Ikole",
      "Ise/Orun",
      "Moba",
      "Oye"
    ]
  },
  {
    "state": "Enugu",
    "alias": "enugu",
    "lgas": [
      "Awgu",
      "Aninri",
      "Enugu East",
      "Enugu North",
      "Ezeagu",
      "Enugu South",
      "Igbo Etiti",
      "Igbo Eze North",
      "Igbo Eze South",
      "Isi Uzo",
      "Nkanu East",
      "Nkanu West",
      "Nsukka",
      "Udenu",
      "Oji River",
      "Uzo Uwani",
      "Udi"
    ]
  },
  {
    "state": "Federal Capital Territory",
    "alias": "abuja",
    "lgas": [
      "Abaji",
      "Bwari",
      "Gwagwalada",
      "Kuje",
      "Kwali",
      "Municipal Area Council"
    ]
  },
  {
    "state": "Gombe",
    "alias": "gombe",
    "lgas": [
      "Akko",
      "Balanga",
      "Billiri",
      "Dukku",
      "Funakaye",
      "Gombe",
      "Kaltungo",
      "Kwami",
      "Nafada",
      "Shongom",
      "Yamaltu/Deba"
    ]
  },
  {
    "state": "Jigawa",
    "alias": "jigawa",
    "lgas": [
      "Auyo",
      "Babura",
      "Buji",
      "Biriniwa",
      "Birnin Kudu",
      "Dutse",
      "Gagarawa",
      "Garki",
      "Gumel",
      "Guri",
      "Gwaram",
      "Gwiwa",
      "Hadejia",
      "Jahun",
      "Kafin Hausa",
      "Kazaure",
      "Kiri Kasama",
      "Kiyawa",
      "Kaugama",
      "Maigatari",
      "Malam Madori",
      "Miga",
      "Sule Tankarkar",
      "Roni",
      "Ringim",
      "Yankwashi",
      "Taura"
    ]
  },
  {
    "state": "Oyo",
    "alias": "oyo",
    "lgas": [
      "Afijio",
      "Akinyele",
      "Atiba",
      "Atisbo",
      "Egbeda",
      "Ibadan North",
      "Ibadan North-East",
      "Ibadan North-West",
      "Ibadan South-East",
      "Ibarapa Central",
      "Ibadan South-West",
      "Ibarapa East",
      "Ido",
      "Ibarapa North",
      "Irepo",
      "Iseyin",
      "Itesiwaju",
      "Iwajowa",
      "Kajola",
      "Lagelu",
      "Ogbomosho North",
      "Ogbomosho South",
      "Ogo Oluwa",
      "Olorunsogo",
      "Oluyole",
      "Ona Ara",
      "Orelope",
      "Ori Ire",
      "Oyo",
      "Oyo East",
      "Saki East",
      "Saki West",
      "Surulere Oyo State"
    ]
  },
  {
    "state": "Imo",
    "alias": "imo",
    "lgas": [
      "Aboh Mbaise",
      "Ahiazu Mbaise",
      "Ehime Mbano",
      "Ezinihitte",
      "Ideato North",
      "Ideato South",
      "Ihitte/Uboma",
      "Ikeduru",
      "Isiala Mbano",
      "Mbaitoli",
      "Isu",
      "Ngor Okpala",
      "Njaba",
      "Nkwerre",
      "Nwangele",
      "Obowo",
      "Oguta",
      "Ohaji/Egbema",
      "Okigwe",
      "Orlu",
      "Orsu",
      "Oru East",
      "Oru West",
      "Owerri Municipal",
      "Owerri North",
      "Unuimo",
      "Owerri West"
    ]
  },
  {
    "state": "Kaduna",
    "alias": "kaduna",
    "lgas": [
      "Birnin Gwari",
      "Chikun",
      "Giwa",
      "Ikara",
      "Igabi",
      "Jaba",
      "Jema'a",
      "Kachia",
      "Kaduna North",
      "Kaduna South",
      "Kagarko",
      "Kajuru",
      "Kaura",
      "Kauru",
      "Kubau",
      "Kudan",
      "Lere",
      "Makarfi",
      "Sabon Gari",
      "Sanga",
      "Soba",
      "Zangon Kataf",
      "Zaria"
    ]
  },
  {
    "state": "Kebbi",
    "alias": "kebbi",
    "lgas": [
      "Aleiro",
      "Argungu",
      "Arewa Dandi",
      "Augie",
      "Bagudo",
      "Birnin Kebbi",
      "Bunza",
      "Dandi",
      "Fakai",
      "Gwandu",
      "Jega",
      "Kalgo",
      "Koko/Besse",
      "Maiyama",
      "Ngaski",
      "Shanga",
      "Suru",
      "Sakaba",
      "Wasagu/Danko",
      "Yauri",
      "Zuru"
    ]
  },
  {
    "state": "Kano",
    "alias": "kano",
    "lgas": [
      "Ajingi",
      "Albasu",
      "Bagwai",
      "Bebeji",
      "Bichi",
      "Bunkure",
      "Dala",
      "Dambatta",
      "Dawakin Kudu",
      "Dawakin Tofa",
      "Doguwa",
      "Fagge",
      "Gabasawa",
      "Garko",
      "Garun Mallam",
      "Gezawa",
      "Gaya",
      "Gwale",
      "Gwarzo",
      "Kabo",
      "Kano Municipal",
      "Karaye",
      "Kibiya",
      "Kiru",
      "Kumbotso",
      "Kunchi",
      "Kura",
      "Madobi",
      "Makoda",
      "Minjibir",
      "Nasarawa",
      "Rano",
      "Rimin Gado",
      "Rogo",
      "Shanono",
      "Takai",
      "Sumaila",
      "Tarauni",
      "Tofa",
      "Tsanyawa",
      "Tudun Wada",
      "Ungogo",
      "Warawa",
      "Wudil"
    ]
  },
  {
    "state": "Kogi",
    "alias": "kogi",
    "lgas": [
      "Ajaokuta",
      "Adavi",
      "Ankpa",
      "Bassa",
      "Dekina",
      "Ibaji",
      "Idah",
      "Igalamela Odolu",
      "Ijumu",
      "Kogi",
      "Kabba/Bunu",
      "Lokoja",
      "Ofu",
      "Mopa Muro",
      "Ogori/Magongo",
      "Okehi",
      "Okene",
      "Olamaboro",
      "Omala",
      "Yagba East",
      "Yagba West"
    ]
  },
  {
    "state": "Osun",
    "alias": "osun",
    "lgas": [
      "Aiyedire",
      "Atakunmosa West",
      "Atakunmosa East",
      "Aiyedaade",
      "Boluwaduro",
      "Boripe",
      "Ife East",
      "Ede South",
      "Ife North",
      "Ede North",
      "Ife South",
      "Ejigbo",
      "Ife Central",
      "Ifedayo",
      "Egbedore",
      "Ila",
      "Ifelodun",
      "Ilesa East",
      "Ilesa West",
      "Irepodun",
      "Irewole",
      "Isokan",
      "Iwo",
      "Obokun",
      "Odo Otin",
      "Ola Oluwa",
      "Olorunda",
      "Oriade",
      "Orolu",
      "Osogbo"
    ]
  },
  {
    "state": "Sokoto",
    "alias": "sokoto",
    "lgas": [
      "Gudu",
      "Gwadabawa",
      "Illela",
      "Isa",
      "Kebbe",
      "Kware",
      "Rabah",
      "Sabon Birni",
      "Shagari",
      "Silame",
      "Sokoto North",
      "Sokoto South",
      "Tambuwal",
      "Tangaza",
      "Tureta",
      "Wamako",
      "Wurno",
      "Yabo",
      "Binji",
      "Bodinga",
      "Dange Shuni",
      "Goronyo",
      "Gada"
    ]
  },
  {
    "state": "Plateau",
    "alias": "plateau",
    "lgas": [
      "Bokkos",
      "Barkin Ladi",
      "Bassa",
      "Jos East",
      "Jos North",
      "Jos South",
      "Kanam",
      "Kanke",
      "Langtang South",
      "Langtang North",
      "Mangu",
      "Mikang",
      "Pankshin",
      "Qua'an Pan",
      "Riyom",
      "Shendam",
      "Wase"
    ]
  },
  {
    "state": "Taraba",
    "alias": "taraba",
    "lgas": [
      "Ardo Kola",
      "Bali",
      "Donga",
      "Gashaka",
      "Gassol",
      "Ibi",
      "Jalingo",
      "Karim Lamido",
      "Kumi",
      "Lau",
      "Sardauna",
      "Takum",
      "Ussa",
      "Wukari",
      "Yorro",
      "Zing"
    ]
  },
  {
    "state": "Yobe",
    "alias": "yobe",
    "lgas": [
      "Bade",
      "Bursari",
      "Damaturu",
      "Fika",
      "Fune",
      "Geidam",
      "Gujba",
      "Gulani",
      "Jakusko",
      "Karasuwa",
      "Machina",
      "Nangere",
      "Nguru",
      "Potiskum",
      "Tarmuwa",
      "Yunusari",
      "Yusufari"
    ]
  },
  {
    "state": "Zamfara",
    "alias": "zamfara",
    "lgas": [
      "Anka",
      "Birnin Magaji/Kiyaw",
      "Bakura",
      "Bukkuyum",
      "Bungudu",
      "Gummi",
      "Gusau",
      "Kaura Namoda",
      "Maradun",
      "Shinkafi",
      "Maru",
      "Talata Mafara",
      "Tsafe",
      "Zurmi"
    ]
  },
  {
    "state": "Lagos",
    "alias": "lagos",
    "lgas": [
      "Agege",
      "Ajeromi-Ifelodun",
      "Alimosho",
      "Amuwo-Odofin",
      "Badagry",
      "Apapa",
      "Epe",
      "Eti Osa",
      "Ibeju-Lekki",
      "Ifako-Ijaiye",
      "Ikeja",
      "Ikorodu",
      "Kosofe",
      "Lagos Island",
      "Mushin",
      "Lagos Mainland",
      "Ojo",
      "Oshodi-Isolo",
      "Shomolu",
      "Surulere Lagos State"
    ]
  },
  {
    "state": "Katsina",
    "alias": "katsina",
    "lgas": [
      "Bakori",
      "Batagarawa",
      "Batsari",
      "Baure",
      "Bindawa",
      "Charanchi",
      "Danja",
      "Dandume",
      "Dan Musa",
      "Daura",
      "Dutsi",
      "Dutsin Ma",
      "Faskari",
      "Funtua",
      "Ingawa",
      "Jibia",
      "Kafur",
      "Kaita",
      "Kankara",
      "Kankia",
      "Katsina",
      "Kurfi",
      "Kusada",
      "Mai'Adua",
      "Malumfashi",
      "Mani",
      "Mashi",
      "Matazu",
      "Musawa",
      "Rimi",
      "Sabuwa",
      "Safana",
      "Sandamu",
      "Zango"
    ]
  },
  {
    "state": "Kwara",
    "alias": "kwara",
    "lgas": [
      "Asa",
      "Baruten",
      "Edu",
      "Ilorin East",
      "Ifelodun",
      "Ilorin South",
      "Ekiti Kwara State",
      "Ilorin West",
      "Irepodun",
      "Isin",
      "Kaiama",
      "Moro",
      "Offa",
      "Oke Ero",
      "Oyun",
      "Pategi"
    ]
  },
  {
    "state": "Nasarawa",
    "alias": "nasarawa",
    "lgas": [
      "Akwanga",
      "Awe",
      "Doma",
      "Karu",
      "Keana",
      "Keffi",
      "Lafia",
      "Kokona",
      "Nasarawa Egon",
      "Nasarawa",
      "Obi",
      "Toto",
      "Wamba"
    ]
  },
  {
    "state": "Niger",
    "alias": "niger",
    "lgas": [
      "Agaie",
      "Agwara",
      "Bida",
      "Borgu",
      "Bosso",
      "Chanchaga",
      "Edati",
      "Gbako",
      "Gurara",
      "Katcha",
      "Kontagora",
      "Lapai",
      "Lavun",
      "Mariga",
      "Magama",
      "Mokwa",
      "Mashegu",
      "Moya",
      "Paikoro",
      "Rafi",
      "Rijau",
      "Shiroro",
      "Suleja",
      "Tafa",
      "Wushishi"
    ]
  },
  {
    "state": "Abia",
    "alias": "abia",
    "lgas": [
      "Aba North",
      "Arochukwu",
      "Aba South",
      "Bende",
      "Isiala Ngwa North",
      "Ikwuano",
      "Isiala Ngwa South",
      "Isuikwuato",
      "Obi Ngwa",
      "Ohafia",
      "Osisioma",
      "Ugwunagbo",
      "Ukwa East",
      "Ukwa West",
      "Umuahia North",
      "Umuahia South",
      "Umu Nneochi"
    ]
  }
]

export const nigeria_data = [
  {
    "state": "abia",
    "lgas": [
      {
        "lga": "aba-north",
        "wards": [
          "ariaria-market",
          "eziama",
          "industrial-area",
          "ogbor-i",
          "ogbor-ii",
          "old-aba-gra",
          "osusu-i",
          "osusu-ii",
          "st-eugenes-by-okigwe-rd",
          "umuogor",
          "umuola",
          "uratta"
        ]
      },
      {
        "lga": "aba-south",
        "wards": [
          "aba-river",
          "aba-town-hall",
          "asa",
          "ekeoha",
          "enyimba",
          "eziukwu",
          "gloucester",
          "igwebuike",
          "mosque",
          "ngwa",
          "ohazu-i",
          "ohazu-ii"
        ]
      },
      {
        "lga": "arochukwu",
        "wards": [
          "arochukwu-i",
          "arochukwu-ii",
          "arochukwu-iii",
          "eleoha-ihechiowa",
          "ikwun-ihechiowa",
          "isu",
          "ohaeke",
          "ohafor-i",
          "ohafor-ii",
          "ovukwu",
          "ututu"
        ]
      },
      {
        "lga": "bende",
        "wards": [
          "amankalu-akoliufu",
          "bende",
          "igbere-a",
          "igbere-b",
          "item-a",
          "item-b",
          "item-c",
          "itumbauzo",
          "ozuitem",
          "ugwueke-ezeukwu",
          "umu-imenyi",
          "umuhu-ezechi",
          "uzuakoli"
        ]
      },
      {
        "lga": "ikwuano",
        "wards": [
          "ariam",
          "ibere-i",
          "ibere-ii",
          "oboro-i",
          "oboro-ii",
          "oboro-iii",
          "oboro-iv",
          "oloko-i",
          "oloko-ii",
          "usaka"
        ]
      },
      {
        "lga": "isiala-ngwa-north",
        "wards": [
          "amapu-ntigha",
          "amasaa-nsulu",
          "amasaa-ntigha",
          "ihie",
          "isiala-nsulu",
          "mbawsi-umuomainta",
          "ngwa-ukwu-i",
          "ngwa-ukwu-ii",
          "umunna-nsulu",
          "umuoha"
        ]
      },
      {
        "lga": "isiala-ngwa-south",
        "wards": [
          "akunekpu-eziama-na-obuba",
          "amaise-amaise-anaba",
          "ehina-guru-osokwa",
          "mbutu-ngwa",
          "mbutu-ukwu",
          "ngwaobi",
          "okporo-ahaba",
          "omoba",
          "ovungwu",
          "ovuokwu"
        ]
      },
      {
        "lga": "isuikwuato",
        "wards": [
          "achara-mgbugwu",
          "ezere",
          "ikeagha-i",
          "ikeagha-ii",
          "imenyi",
          "isiala-amawu",
          "isu-amawu",
          "ogunduasa",
          "umuanyi-absu",
          "umunnekwu"
        ]
      },
      {
        "lga": "obingwa",
        "wards": [
          "abayi-i",
          "abayi-ii",
          "ahiaba",
          "akumaimo",
          "alaukwu-ohanze",
          "ibeme",
          "maboko-amairi",
          "mgboko-itungwa",
          "mgboko-umuanunu",
          "ndiarata-amairinabua",
          "ntighauzo-amairi"
        ]
      },
      {
        "lga": "ohafia",
        "wards": [
          "agboji-abiriba",
          "amaeke-abiriba",
          "amaogudu-abiriba",
          "ania-ohoafia",
          "ebem-ohafia",
          "isiama-ohafia",
          "ndi-agbo-nkporo",
          "ndi-elu-nkporo",
          "ndi-etiti-nkporo",
          "ohafor-ohoafia",
          "okanu-ohoafia"
        ]
      },
      {
        "lga": "osisioma",
        "wards": [
          "ama-asaa",
          "amaitolu-mbutu-umuojima",
          "amasator",
          "amator",
          "amavo",
          "aro-ngwa",
          "okpor-umuobo",
          "oso-okwa",
          "umunneise",
          "urtta"
        ]
      },
      {
        "lga": "ugwunagbo",
        "wards": [
          "ward-eight",
          "ward-five",
          "ward-four",
          "ward-nine",
          "ward-one",
          "ward-seven",
          "ward-six",
          "ward-ten",
          "ward-three",
          "ward-two"
        ]
      },
      {
        "lga": "ukwa-west",
        "wards": [
          "asa-north",
          "asa-south",
          "ipu-south",
          "ipu-east",
          "ipu-west",
          "obokwe",
          "obuzor",
          "ogwe",
          "ozaa-west",
          "ozaa-ukwu"
        ]
      },
      {
        "lga": "ukwa-east",
        "wards": [
          "akwete",
          "azumini",
          "ikwueke-west",
          "ikwueke-east",
          "ikwuorie",
          "ikwuriator-east",
          "ikwuriator-west",
          "nkporobe-ohuru",
          "obohia",
          "umuigube-achara"
        ]
      },
      {
        "lga": "umu-nneochi",
        "wards": [
          "amuda",
          "eziama-agbo",
          "eziama-ugwu",
          "ezingodo",
          "mbala-achara",
          "ndiawa-umuelem-i",
          "obinolu-obiagu-la",
          "ubahu-akawa-arokpa",
          "umuaku",
          "umuchieze-i",
          "umuchieze-ii",
          "umuchieze-iii"
        ]
      },
      {
        "lga": "umuahia-south",
        "wards": [
          "ahiaukwu-i",
          "ahiaukwu-ii",
          "amakama",
          "ezeleke-ogbodiukwu",
          "nsirimo",
          "ohiaocha",
          "old-umuahia",
          "omaegwu",
          "ubakala-a",
          "ubakala-b"
        ]
      },
      {
        "lga": "umuahia-north",
        "wards": [
          "afugiri",
          "ibeku-east-i",
          "ibeku-east-ii",
          "ibeku-west",
          "isingwu",
          "ndume",
          "nkwoachara",
          "nkwoegwu",
          "umuahia-urban-i",
          "umuahia-urban-ii",
          "umuahia-urban-iii",
          "umuhu"
        ]
      }
    ]
  },
  {
    "state": "adamawa",
    "lgas": [
      {
        "lga": "demsa",
        "wards": [
          "bille",
          "borrong",
          "demsa",
          "dilli",
          "dong",
          "dwam",
          "gwamba",
          "kpasham",
          "mbula-kuli",
          "nassarawo-demsa"
        ]
      },
      {
        "lga": "fufore",
        "wards": [
          "beti",
          "farang",
          "fufore",
          "gurin",
          "karlahi",
          "mayo-ine",
          "pariya",
          "ribadu",
          "uki-tuki",
          "wuro-bokki",
          "yadim"
        ]
      },
      {
        "lga": "ganye",
        "wards": [
          "bakari-guso",
          "gamu",
          "ganye-i",
          "ganye-ii",
          "gurum",
          "jaggu",
          "sangasumi",
          "sugu",
          "timdore",
          "yebbi"
        ]
      },
      {
        "lga": "girei",
        "wards": [
          "dakri",
          "damare",
          "gerei-i",
          "gereng",
          "girei-ii",
          "jera-bakari",
          "jera-bonyo",
          "modire-vinikilang",
          "tambo",
          "wuro-dole"
        ]
      },
      {
        "lga": "gombi",
        "wards": [
          "boga-dingai",
          "duwa",
          "ga-anda",
          "gabun",
          "garkida",
          "gombi-north",
          "gombi-south",
          "guyaku",
          "tawa",
          "yang"
        ]
      },
      {
        "lga": "guyuk",
        "wards": [
          "banjiram",
          "bobini",
          "bodeno",
          "chikila",
          "dukul",
          "dumna",
          "guyuk",
          "kola",
          "lokoro",
          "purokayo"
        ]
      },
      {
        "lga": "hong",
        "wards": [
          "bangshika",
          "daksiri",
          "garaha",
          "gaya",
          "hildi",
          "hong",
          "hushere-zum",
          "kwarhi",
          "mayo-lope",
          "shangui",
          "thilbang",
          "uba"
        ]
      },
      {
        "lga": "jada",
        "wards": [
          "danaba",
          "jada-i",
          "jada-ii",
          "koma-i",
          "koma-ii",
          "leko",
          "mapeo",
          "mayokalaye",
          "mbulo",
          "nyibango",
          "yelli"
        ]
      },
      {
        "lga": "lamurde",
        "wards": [
          "dubwangun",
          "gyawana",
          "lafiya",
          "lamurde",
          "mgbebongun",
          "ngbakowo",
          "opalo",
          "rigange",
          "suwa",
          "waduku"
        ]
      },
      {
        "lga": "madagali",
        "wards": [
          "babel",
          "duhu-shuwa",
          "gulak",
          "hyambula",
          "k-wuro-ngayandi",
          "madagali",
          "pallam",
          "shelmi-sukur-vapura",
          "wagga",
          "wula"
        ]
      },
      {
        "lga": "maiha",
        "wards": [
          "belel",
          "humbutudi",
          "konkol",
          "maiha-gari",
          "manjekin",
          "mayonguli",
          "pakka",
          "sorau-a",
          "sorau-b",
          "tambajam"
        ]
      },
      {
        "lga": "mayo-belwa",
        "wards": [
          "bajama",
          "binyeri",
          "gangfada",
          "gengle",
          "gorobi",
          "mayo-farang",
          "mayo-belwa",
          "nassarawo-jereng",
          "ndikong",
          "ribadu",
          "tola",
          "yoffo"
        ]
      },
      {
        "lga": "michika",
        "wards": [
          "bazza-margi",
          "futudou-futules",
          "garta-ghunchi",
          "jigalambu",
          "madzi",
          "michika-i",
          "michika-ii",
          "minkisi-wuro-ngiki",
          "moda-dlaka-ghenjuwa",
          "munkavicita",
          "sina-kamale-kwande",
          "sukumu-tillijo",
          "thukudou-sufuku-zah",
          "tumbara-ngabili",
          "vi-boka",
          "wamblimi-tilli"
        ]
      },
      {
        "lga": "mubi-north",
        "wards": [
          "bahuli",
          "betso",
          "digil",
          "kolere",
          "lokuwa",
          "mayo-bani",
          "mijilu",
          "muchalla",
          "sabon-layi",
          "vimtim",
          "yelwa"
        ]
      },
      {
        "lga": "mubi-south",
        "wards": [
          "dirbishi-gandira",
          "duvu-chaba-girburum",
          "gella",
          "gude",
          "kwaja",
          "lamorde",
          "mugulbu-yadafa",
          "mujara",
          "nassarawo",
          "nduku"
        ]
      },
      {
        "lga": "numan",
        "wards": [
          "bare",
          "bolki",
          "gamadio",
          "imburu",
          "kodomti",
          "numan-i",
          "numan-ii",
          "numan-iii",
          "sabon-pegi",
          "vulpi"
        ]
      },
      {
        "lga": "shelleng",
        "wards": [
          "bakta",
          "bodwai",
          "gundo",
          "gwapopolok",
          "jumbul",
          "ketembere",
          "kiri",
          "libbo",
          "shelleng",
          "tallum"
        ]
      },
      {
        "lga": "song",
        "wards": [
          "dirma",
          "dumne",
          "gudu-mboi",
          "kilange-funa",
          "kilange-hirna",
          "sigire",
          "song-gari",
          "song-waje",
          "suktu",
          "waltandi",
          "zumo"
        ]
      },
      {
        "lga": "toungo",
        "wards": [
          "dawo-i",
          "dawo-ii",
          "gumti",
          "kiri-i",
          "kiri-ii",
          "kongin-baba-i",
          "kongin-baba-ii",
          "toungo-i",
          "toungo-ii",
          "toungo-iii"
        ]
      },
      {
        "lga": "yola-north",
        "wards": [
          "ajiya",
          "alkalawa",
          "doubeli",
          "gwadabawa",
          "jambutu",
          "karena",
          "limawa",
          "luggere",
          "nassarawo",
          "rumde",
          "yelwa"
        ]
      },
      {
        "lga": "yola-south",
        "wards": [
          "adarawo",
          "bako",
          "bole-yolde-pate",
          "makama-a",
          "makama-b",
          "mbamba",
          "mbamoi",
          "namtari",
          "ngurore",
          "toungo",
          "yolde-kohi"
        ]
      }
    ]
  },
  {
    "state": "akwa-ibom",
    "lgas": [
      {
        "lga": "abak",
        "wards": [
          "abak-urban-1",
          "abak-urban-11",
          "abak-urban-111",
          "abak-urban-1v",
          "afaha-obong-1",
          "afaha-obong-11",
          "midim-1",
          "midim-11",
          "otoro-1",
          "otoro-11",
          "otoro-111"
        ]
      },
      {
        "lga": "eastern-obolo",
        "wards": [
          "eastern-obolo-1",
          "eastern-obolo-11",
          "eastern-obolo-111",
          "eastern-obolo-1v",
          "eastern-obolo-ix",
          "eastern-obolo-v",
          "eastern-obolo-v1",
          "eastern-obolo-v11",
          "eastern-obolo-v111",
          "eastern-obolo-x"
        ]
      },
      {
        "lga": "eket",
        "wards": [
          "central-1",
          "central-11",
          "central-111",
          "central-1v",
          "central-v",
          "okon-1",
          "okon-11",
          "urban-1",
          "urban-11",
          "urban-111",
          "urban-1v"
        ]
      },
      {
        "lga": "esit-eket",
        "wards": [
          "akpautong",
          "ebe-ekpi",
          "ebighi-okpono",
          "edor",
          "ekpene-obo",
          "etebi-akwata",
          "etebi-idung-assan",
          "ikpa",
          "ntak-inyang",
          "uquo"
        ]
      },
      {
        "lga": "essien-udim",
        "wards": [
          "adiasim",
          "afaha",
          "ekpeyong-1",
          "ekpeyong-11",
          "ikpe-annang",
          "odoro-ikot-1",
          "odoro-ikot-11",
          "okon",
          "ukana-east",
          "ukana-west-1",
          "ukana-west-11"
        ]
      },
      {
        "lga": "etim-ekpo",
        "wards": [
          "etim-ekpo-1",
          "etim-ekpo-11",
          "etim-ekpo-111",
          "etim-ekpo-1v",
          "etim-ekpo-ix",
          "etim-ekpo-v",
          "etim-ekpo-v1",
          "etim-ekpo-v11",
          "etim-ekpo-v111",
          "etim-ekpo-x"
        ]
      },
      {
        "lga": "etinan",
        "wards": [
          "etinan-urban-1",
          "etinan-urban-11",
          "etinan-urban-111",
          "etinan-urban-1v",
          "etinan-urban-v",
          "northern-iman-1",
          "northern-iman-11",
          "southern-iman-1",
          "southern-iman-11",
          "southern-iman-111",
          "southern-iman-1v"
        ]
      },
      {
        "lga": "ibeno",
        "wards": [
          "ibeno-1",
          "ibeno-11",
          "ibeno-111",
          "ibeno-1v",
          "ibeno-ix",
          "ibeno-v",
          "ibeno-v11",
          "ibeno-v111",
          "ibeno-vi",
          "ibeno-x"
        ]
      },
      {
        "lga": "ibesikpo-asutan",
        "wards": [
          "asutan-1",
          "asutan-11",
          "asutan-111",
          "asutan-1v",
          "asutan-v",
          "ibesikpo-1",
          "ibesikpo-11",
          "ibesikpo-111",
          "ibesikpo-1v",
          "ibesikpo-v"
        ]
      },
      {
        "lga": "ibiono-ibom",
        "wards": [
          "ibiono-central-1",
          "ibiono-central-11",
          "ibiono-eastern-1",
          "ibiono-eastern-11",
          "ibiono-northern-1",
          "ibiono-northern-11",
          "ibiono-southern-1",
          "ibiono-southern-11",
          "ibiono-western-1",
          "ibiono-western-11",
          "ikpanya"
        ]
      },
      {
        "lga": "ika",
        "wards": [
          "achan-11",
          "achan-111",
          "achan-ika",
          "ito-1",
          "ito-11",
          "ito-111",
          "odoro-1",
          "odoro-11",
          "urban-1",
          "urban-11"
        ]
      },
      {
        "lga": "ikono",
        "wards": [
          "1tak",
          "ediene-1",
          "ediene-11",
          "ikono-middle-1",
          "ikono-middle-11",
          "ikono-middle-111",
          "ikono-middle-1v",
          "ikono-south",
          "ndiya-ikot-idana",
          "nkwot-1",
          "nkwot-11"
        ]
      },
      {
        "lga": "ikot-abasi",
        "wards": [
          "edemaya-1",
          "edemaya-11",
          "edemaya-111",
          "ikpa-ibekwe-1",
          "ikpa-ibekwe-11",
          "ikpa-nung-asang-1",
          "ikpa-nung-asang-11",
          "ukpum-ete-1",
          "ukpum-ete-11",
          "ukpum-okon"
        ]
      },
      {
        "lga": "ikot-ekpene",
        "wards": [
          "ikot-ekpene-1",
          "ikot-ekpene-11",
          "ikot-ekpene-111",
          "ikot-ekpene-1v",
          "ikot-ekpene-ix",
          "ikot-ekpene-v",
          "ikot-ekpene-v1",
          "ikot-ekpene-v11",
          "ikot-ekpene-v111",
          "ikot-ekpene-x",
          "ikot-ekpene-x1"
        ]
      },
      {
        "lga": "ini",
        "wards": [
          "ikono-north-1",
          "ikono-north-11",
          "ikono-north-111",
          "ikpe-1",
          "ikpe-11",
          "itu-mbonuso",
          "iwerre",
          "nkari",
          "odoro-ukwok",
          "usuk-ukwok"
        ]
      },
      {
        "lga": "itu",
        "wards": [
          "east-itam-1",
          "east-itam-11",
          "east-itam-111",
          "east-itam-1v",
          "east-itam-v",
          "mbiase-ayadehe",
          "oku-iboku",
          "west-itam-1",
          "west-itam-11",
          "west-itam-111"
        ]
      },
      {
        "lga": "mbo",
        "wards": [
          "ebughu-1",
          "ebughu-11",
          "efiat-1",
          "efiat-11",
          "enwang-1",
          "enwang-11",
          "ibaka",
          "uda-1",
          "uda-11",
          "udesi"
        ]
      },
      {
        "lga": "mkpat-enin",
        "wards": [
          "ibiaku-1",
          "ibiaku-11",
          "ibiaku-111",
          "ikpa-ibom-1",
          "ikpa-ibom-11",
          "ikpa-ibom-111",
          "ikpa-ibom-1v",
          "ikpa-ikono-1",
          "ikpa-ikono-11",
          "ikpa-ikono-111",
          "ukpum-minya-1",
          "ukpum-minya-11",
          "ukpum-minya-111",
          "ukpum-minya-1v"
        ]
      },
      {
        "lga": "nsit-atai",
        "wards": [
          "eastern-nsit-1",
          "eastern-nsit-11",
          "eastern-nsit-111",
          "eastern-nsit-1v",
          "eastern-nsit-ix",
          "eastern-nsit-v",
          "eastern-nsit-v1",
          "eastern-nsit-v11",
          "eastern-nsit-v111",
          "eastern-nsit-x"
        ]
      },
      {
        "lga": "nsit-ibom",
        "wards": [
          "asang-1",
          "asang-11",
          "asang-111",
          "asang-1v",
          "asang-v",
          "mbaiso-1",
          "mbaiso-11",
          "mbaiso-111",
          "mbaiso-1v",
          "mbaiso-v"
        ]
      },
      {
        "lga": "nsit-ubium",
        "wards": [
          "ibiakpan-obotim-1",
          "ibiakpan-obotim-11",
          "itreto",
          "ndiya",
          "ubium-north-1",
          "ubium-north-11",
          "ubium-north-111",
          "ubium-south-1",
          "ubium-south-11",
          "ubium-south-111"
        ]
      },
      {
        "lga": "obot-akara",
        "wards": [
          "ikot-abia-1",
          "ikot-abia-11",
          "ikot-abia-111",
          "nto-edino-1",
          "nto-edino-11",
          "nto-edino-111",
          "nto-edino-1v",
          "obot-akara-1",
          "obot-akara-11",
          "obot-akara-111"
        ]
      },
      {
        "lga": "okobo",
        "wards": [
          "akai-mbukpo-udung",
          "ekeya",
          "eweme-1",
          "eweme-11",
          "nung-atai-ube-1",
          "nung-atai-ube-11",
          "offi-1",
          "offi-11",
          "okopedi-1",
          "okopedi-11"
        ]
      },
      {
        "lga": "onna",
        "wards": [
          "awa-1",
          "awa-11",
          "awa-111",
          "awa-1v",
          "nung-idem-1",
          "nung-idem-11",
          "oniong-east-1",
          "oniong-east-11",
          "oniong-east-111",
          "oniong-west-1",
          "oniong-west-11",
          "oniong-west-111"
        ]
      },
      {
        "lga": "oron",
        "wards": [
          "oron-urban-ix",
          "oron-urban-x",
          "oron-urban-1",
          "oron-urban-11",
          "oron-urban-111",
          "oron-urban-1v",
          "oron-urban-v",
          "oron-urban-v1",
          "oron-urban-v11",
          "oron-urban-v111"
        ]
      },
      {
        "lga": "oruk-anam",
        "wards": [
          "abak-midim-1",
          "abak-midim-11",
          "abak-midim-111",
          "abak-midim-1v",
          "ekparakwa",
          "ibesit-nung-ikot-1",
          "ibesit-nung-ikot-11",
          "ikot-ibritam-1",
          "ikot-ibritam-11",
          "ndot-ikot-okoro-1",
          "ndot-ikot-okoro-11",
          "ndot-ikot-okoro-111",
          "ndot-ikot-okoro-v1"
        ]
      },
      {
        "lga": "udung-uko",
        "wards": [
          "udung-uko-1",
          "udung-uko-11",
          "udung-uko-111",
          "udung-uko-1v",
          "udung-uko-ix",
          "udung-uko-v",
          "udung-uko-v1",
          "udung-uko-v11",
          "udung-uko-v111",
          "udung-uko-x"
        ]
      },
      {
        "lga": "ukanafun",
        "wards": [
          "northern-afaha-1",
          "northern-afaha-11",
          "northern-ukanafun-1",
          "northern-ukanafun-11",
          "southern-afaha-adat-ifang-1",
          "southern-afaha-adat-ifang-11",
          "southern-afaha-adat-ifang-111",
          "southern-afaha-adat-ifang-1v",
          "southern-ukanafun-1",
          "southern-ukanafun-11",
          "ukanafun-urban"
        ]
      },
      {
        "lga": "uruan",
        "wards": [
          "central-uruan-11",
          "centyral-uruan-1",
          "centyral-uruan-111",
          "northern-uruan-1",
          "northern-uruan-11",
          "southern-uruan-1",
          "southern-uruan-11",
          "southern-uruan-111",
          "southern-uruan-iv",
          "southern-uruan-v",
          "southern-uruan-v1"
        ]
      },
      {
        "lga": "urue-offong-oruko",
        "wards": [
          "oruko-1",
          "oruko-11",
          "oruko-111",
          "oruko-1v",
          "oruko-v",
          "urue-offong-1",
          "urue-offong-11",
          "urue-offong-111",
          "urue-offong-1v",
          "urue-offong-v"
        ]
      },
      {
        "lga": "uyo",
        "wards": [
          "etoi-1",
          "etoi-11",
          "ikono-1",
          "ikono-11",
          "offot-1",
          "offot-11",
          "oku-1",
          "oku-11",
          "uyo-urban-1",
          "uyo-urban-11",
          "uyo-urban-111"
        ]
      }
    ]
  },
  {
    "state": "anambra",
    "lgas": [
      {
        "lga": "aguata",
        "wards": [
          "achina-i",
          "achina-ii",
          "agulueze-chukwu",
          "akpo",
          "amesi",
          "ekwulobia-i",
          "ekwulobia-ii",
          "ezinifite-i",
          "ezinifite-ii",
          "igbo-ukwu-ii",
          "igbo-ukwu-i",
          "ikenga",
          "isuofia",
          "nkpologwu",
          "oreri",
          "uga-i",
          "uga-ii",
          "umuchu-i",
          "umuchu-ii",
          "umuona"
        ]
      },
      {
        "lga": "anambra-east",
        "wards": [
          "aguleri",
          "aguleri-ii",
          "enugwu-otu",
          "eziagulu-otu",
          "igbariam",
          "nando-i",
          "nando-ii",
          "nando-iii",
          "nsugbe-i",
          "nsugbe-ii",
          "otuocha-i",
          "otuocha-ii",
          "umuleri-ii",
          "umuoba-anam",
          "umureli-i"
        ]
      },
      {
        "lga": "anambra-west",
        "wards": [
          "ezi-anam",
          "ifite-anam",
          "nzam",
          "olumbanasa-ode",
          "olumbanasa-inoma",
          "oroma-etiti-anam",
          "umuenwelum-anam",
          "umueze-anam-i",
          "umueze-anam-ii",
          "umuoba-anam"
        ]
      },
      {
        "lga": "anaocha",
        "wards": [
          "adazi-ani-i",
          "adazi-ani-ii",
          "adazi-enu-i",
          "adazi-enu-ii",
          "adazi-nnukwu-i",
          "adazi-nnukwu-ii",
          "agulu-iv",
          "agulu-i",
          "agulu-ii",
          "agulu-iii",
          "agulu-uzoigbo",
          "akwaeze",
          "ichida-i",
          "ichida-ii",
          "neni-i",
          "neni-ii",
          "nri-i",
          "nri-ii",
          "obeledu"
        ]
      },
      {
        "lga": "awka-north",
        "wards": [
          "achalla-i",
          "achalla-i1",
          "achalla-i1i",
          "amansea",
          "amanuke",
          "awba-ofemmili",
          "ebenebe-i",
          "ebenebe-ii",
          "ebenebe-iii",
          "isu-aniocha",
          "mabakwu-i-anezike",
          "ugbene",
          "ugbenu",
          "urum"
        ]
      },
      {
        "lga": "awka-south",
        "wards": [
          "agu-oka",
          "amawbia-i",
          "amawbia-ii",
          "amawbia-iii",
          "awka-i",
          "awka-ii",
          "awka-iii",
          "awka-iv",
          "awka-v",
          "awka-vi",
          "awka-vii",
          "ezinato-isiagu",
          "mba-ukwu",
          "nibo-i",
          "nibo-ii",
          "nibo-iii",
          "nise-i",
          "nise-ii",
          "okpuno",
          "umuawulu"
        ]
      },
      {
        "lga": "ayamelum",
        "wards": [
          "anaku",
          "ifite-ogwari-i",
          "ifite-ogwari-ii",
          "igbakwu",
          "omasi",
          "omor-i",
          "omor-ii",
          "omor-iii",
          "ume-rum",
          "umueje-umueje",
          "umumbo"
        ]
      },
      {
        "lga": "dunukofia",
        "wards": [
          "akwa",
          "ifitedunu-i",
          "ifitedunu-ii",
          "nawgu-i",
          "nawgu-ii",
          "ukpo-i",
          "ukpo-ii",
          "ukpo-iii",
          "ukwulu-i",
          "ukwulu-ii",
          "umudioka-i",
          "umudioka-ii",
          "umunnachi-i",
          "umunnachi-ii"
        ]
      },
      {
        "lga": "ekwusigo",
        "wards": [
          "amakwa-ii",
          "ichi",
          "ihembosi-anaubahu",
          "ihiteoha",
          "oraifite-i",
          "oraifite-ii",
          "oraifite-iii",
          "ozubulu-i",
          "ozubulu-ii",
          "ozubulu-iii",
          "ozubulu-iv",
          "ozubulu-v"
        ]
      },
      {
        "lga": "idemili-north",
        "wards": [
          "abacha",
          "abatete",
          "eziowele",
          "ideani",
          "nkpor-i",
          "nkpor-ii",
          "obosi",
          "ogidi-i",
          "ogidi-ii",
          "oraukwu",
          "uke",
          "umuoji"
        ]
      },
      {
        "lga": "idemili-south",
        "wards": [
          "akwukwu",
          "alor-i",
          "alor-ii",
          "awka-etiti-i",
          "awka-etiti-ii",
          "nnobi-iii",
          "nnobi-i",
          "nnobi-ii",
          "nnokwa",
          "oba-i",
          "oba-ii",
          "ojoto"
        ]
      },
      {
        "lga": "ihiala",
        "wards": [
          "amamu-i",
          "amamu-ii",
          "amorka",
          "azia",
          "ihite",
          "isseke",
          "lilu",
          "mbosi",
          "ogbolo",
          "okija-i",
          "okija-ii",
          "okija-iii",
          "okija-iv",
          "okija-v",
          "orsumoghu",
          "ubuluisiuzo",
          "uli-i",
          "uli-ii",
          "uli-iii",
          "uzoakwa"
        ]
      },
      {
        "lga": "njikoka",
        "wards": [
          "abagana-i",
          "abagana-ii",
          "abagana-iii",
          "abagana-iv",
          "abba-i",
          "abba-ii",
          "enugwu-ukwu-i",
          "enugwu-ukwu-ii",
          "enugwu-ukwu-iii",
          "enugwu-ukwu-iv",
          "enugwu-agidi-i",
          "enugwu-agidi-ii",
          "nawfia-i",
          "nawfia-ii",
          "nimo-i",
          "nimo-ii",
          "nimo-iii",
          "nimo-iv"
        ]
      },
      {
        "lga": "nnewi-north",
        "wards": [
          "nnewi-ichi-i",
          "nnewi-ichi-ii",
          "otolo-i",
          "otolo-iii",
          "otolo-ii",
          "umudim-i",
          "umudim-ii",
          "uruagu-i",
          "uruagu-ii",
          "uruagu-iii"
        ]
      },
      {
        "lga": "nnewi-south",
        "wards": [
          "akwa-ihedi",
          "amichi-i",
          "amichi-ii",
          "amichi-iii",
          "azuigbo",
          "ebenator",
          "ekwulumili",
          "ezinifite",
          "ezinifite-i",
          "ezinifite-ii",
          "ezinifite-iii",
          "osumenyi-i",
          "osumenyi-ii",
          "ukpor-i",
          "ukpor-ii",
          "ukpor-iii",
          "ukpor-iv",
          "ukpor-v",
          "ukpor-vi",
          "unubi",
          "utuh"
        ]
      },
      {
        "lga": "ogbaru",
        "wards": [
          "akili-ozizor",
          "akili-ogidi-obeagwe",
          "atani-i",
          "atani-ii",
          "iyiowa-odekpe-ohita",
          "ochuche-umuodu-ogbakuba-amiyi",
          "ogwu-ikpele",
          "ogwuaniocha",
          "okpoko-i",
          "okpoko-ii",
          "okpoko-iii",
          "okpoko-iv",
          "okpoko-v",
          "okpoko-vi",
          "ossomala",
          "umunankwo-mputu"
        ]
      },
      {
        "lga": "onitsha-north",
        "wards": [
          "american-quarters",
          "g-r-a",
          "inland-town-i",
          "inland-town-ii",
          "inland-town-iii",
          "inland-town-iv",
          "inland-town-v",
          "inland-town-vi",
          "inland-town-vii",
          "inland-town-viii",
          "ogbe-umuonicha",
          "trans-nkisi",
          "water-side-central-1",
          "water-side-central-ii",
          "woluwo-layout"
        ]
      },
      {
        "lga": "onitsha-south",
        "wards": [
          "bridge-head-i",
          "bridge-head-ii",
          "bridge-head-iii",
          "fegge-1",
          "fegge-1v",
          "fegge-ii",
          "fegge-iii",
          "fegge-v",
          "fegge-vi",
          "fegge-vii",
          "odoakpu-i",
          "odoakpu-ii",
          "odoakpu-iii",
          "odoakpu-iv",
          "odoakpu-v",
          "odoakpu-vi",
          "odoakpu-vii"
        ]
      },
      {
        "lga": "orumba-south",
        "wards": [
          "agbudu",
          "akpu",
          "enugu-umonyia",
          "eziagu",
          "ezira",
          "ihite",
          "isulo",
          "nawfija",
          "nkerehi",
          "ogboji",
          "ogbunka-i",
          "ogbunka-ii",
          "owerre-ezukala-i",
          "owerre-ezukala-ii",
          "umunze-i",
          "umunze-ii",
          "umunze-iii",
          "umuomaku"
        ]
      },
      {
        "lga": "orumba-north",
        "wards": [
          "ajalli-i-obinikpa-and-umueve",
          "ajalli-ii-umuabiama-and-amaga",
          "amaetiti",
          "amaokpala-omogho",
          "awa",
          "awgbu-i",
          "awgbu-ii",
          "nanka-i",
          "nanka-ii",
          "ndi-okpalaeze",
          "ndikelionwu",
          "ndiokolo-ndiokpaleke",
          "ndiowu",
          "ndiukwuenu-okpeze",
          "oko-ii",
          "oko-i",
          "ufuma-i",
          "ufuma-ii"
        ]
      },
      {
        "lga": "oyi",
        "wards": [
          "awkuzu-i",
          "awkuzu-ii",
          "awkuzu-iii",
          "awkuzu-iv",
          "nkwelle-ezunaka-i",
          "nkwelle-ezunaka-ii",
          "nteje-i",
          "nteje-ii",
          "nteje-iii",
          "nteje-iv",
          "nteje-v",
          "ogbunike-i",
          "ogbunike-ii",
          "umunya-i",
          "umunya-ii"
        ]
      }
    ]
  },
  {
    "state": "abuja",
    "lgas": [
      {
        "lga": "abaji",
        "wards": [
          "abaji-central",
          "abaji-north-east",
          "abaji-south-east",
          "agyana-pandagi",
          "alu-mamagi",
          "gawu",
          "gurdi",
          "nuku",
          "rimba-ebagi",
          "yaba"
        ]
      },
      {
        "lga": "abuja-municipal",
        "wards": [
          "city-centre",
          "garki",
          "gui",
          "gwagwa",
          "gwarinpa",
          "jiwa",
          "kabusa",
          "karshi",
          "karu",
          "nyanya",
          "orozo",
          "wuse"
        ]
      },
      {
        "lga": "bwari",
        "wards": [
          "bwari-central",
          "byazhin",
          "dutse-alhaji",
          "igu",
          "kawu",
          "kubwa",
          "kuduru",
          "shere",
          "ushafa",
          "usuma"
        ]
      },
      {
        "lga": "gwagwalada",
        "wards": [
          "dobi",
          "gwagwalada-centre",
          "gwako",
          "ibwa",
          "ikwa",
          "kutunku",
          "paiko",
          "staff-quarters",
          "tungan-maje",
          "zuba"
        ]
      },
      {
        "lga": "kuje",
        "wards": [
          "chibiri",
          "gaube",
          "gudun-karya",
          "gwargwada",
          "kabi",
          "kuje",
          "kujekwa",
          "kwaku",
          "rubochi",
          "yenche"
        ]
      },
      {
        "lga": "kwali",
        "wards": [
          "ashara",
          "dafa",
          "gumbo",
          "kilankwa",
          "kundu",
          "kwali-ward",
          "pai",
          "wako",
          "yangoji",
          "yebu"
        ]
      }
    ]
  },
  {
    "state": "bauchi",
    "lgas": [
      {
        "lga": "alkaleri",
        "wards": [
          "alkaleri",
          "birin-gigara-yankari",
          "dan-kungibar",
          "futuk",
          "gar",
          "gwana-mansur",
          "gwaram",
          "maimadi",
          "pali",
          "yalo",
          "yuli-lim"
        ]
      },
      {
        "lga": "bauchi",
        "wards": [
          "birshi-miri",
          "dan-iya-hardo",
          "dandango-yamrat",
          "dawaki",
          "galambi-gwaskwaram",
          "kangyare-turwun",
          "kundum-durum",
          "majidadi-a",
          "majidadi-b",
          "makama-sarki-baki",
          "mun-munsal",
          "zungur-liman-katagum"
        ]
      },
      {
        "lga": "bogoro",
        "wards": [
          "b-o-i-a",
          "b-o-i-b",
          "b-o-i-c",
          "bogoro-a",
          "bogoro-b",
          "bogoro-c",
          "bogoro-d",
          "lusa-a",
          "lusa-b",
          "lusa-c"
        ]
      },
      {
        "lga": "dambam",
        "wards": [
          "dagauda",
          "dambam",
          "gargawa",
          "garuza",
          "gurbana",
          "jalam-central",
          "jalam-east",
          "yame",
          "yanda",
          "zaura"
        ]
      },
      {
        "lga": "darazo",
        "wards": [
          "darazo",
          "gabarin",
          "gabciyari",
          "konkiyal",
          "lago",
          "lanzai",
          "papa",
          "sade",
          "tauya",
          "wahu",
          "yautare"
        ]
      },
      {
        "lga": "dass",
        "wards": [
          "bagel-bajar",
          "baraza",
          "bundot",
          "bununu-central",
          "bununu-south",
          "dott",
          "durr",
          "polchi",
          "wandi",
          "zumbul-lukshi"
        ]
      },
      {
        "lga": "gamawa",
        "wards": [
          "alagarno-jadori",
          "gadiya",
          "gamawa",
          "gololo",
          "kafin-romi",
          "kubdiya",
          "raga",
          "tarmasuwa",
          "tumbi",
          "udubo",
          "zindi"
        ]
      },
      {
        "lga": "ganjuwa",
        "wards": [
          "ganjuwa",
          "gungura",
          "kafin-madaki",
          "kariya",
          "kubi-east",
          "kubi-west",
          "miya-east",
          "miya-west",
          "nasarawa-south",
          "nasarawa-north",
          "yali"
        ]
      },
      {
        "lga": "giade",
        "wards": [
          "chinkani",
          "doguwa-south",
          "doguwa-central",
          "giade",
          "isawa",
          "sabon-sara",
          "u-zum-a",
          "uzum-b",
          "zabi",
          "zirrami"
        ]
      },
      {
        "lga": "itas-gadau",
        "wards": [
          "abdallawa-magarya",
          "bambal",
          "bilkicheri",
          "buzawa",
          "gadau",
          "gwarai",
          "itas",
          "kashuri",
          "mashema",
          "zubuki"
        ]
      },
      {
        "lga": "jama'are",
        "wards": [
          "dogon-jeji-a",
          "dogon-jeji-b",
          "dogon-jeji-c",
          "galdimari",
          "hanafari",
          "jama-are-a",
          "jama-are-b",
          "jama-are-c",
          "jama-are-d",
          "jurara"
        ]
      },
      {
        "lga": "katagum",
        "wards": [
          "bulkachuwa-dagaro",
          "buskuri",
          "chinade",
          "gambaki-bidir",
          "madachi-gangai",
          "madangala",
          "madara",
          "nasarawa-bakin-kasuwa",
          "ragwam-magonshi",
          "tsakuwa-kofar-gabas-kofar-kuka",
          "yayu"
        ]
      },
      {
        "lga": "kirfi",
        "wards": [
          "badara",
          "bara",
          "beni-a",
          "beni-b",
          "dewu-central",
          "dewu-east",
          "kirfi",
          "shango",
          "tubule",
          "wanka"
        ]
      },
      {
        "lga": "misau",
        "wards": [
          "ajilin-gugulin",
          "beti",
          "gwaram",
          "hardawa",
          "jarkasa",
          "kukadi-gundari",
          "sarma-akuyam",
          "sirko",
          "tofu",
          "zadawa"
        ]
      },
      {
        "lga": "ningi",
        "wards": [
          "balma",
          "bashe",
          "burra-kyata",
          "dingis",
          "jangu",
          "kudu-yamma",
          "kurmi",
          "nasaru",
          "ningi",
          "sama",
          "tiffi-guda"
        ]
      },
      {
        "lga": "shira",
        "wards": [
          "andubun",
          "beli-gagidaba",
          "bukul-bangire",
          "disina",
          "faggo",
          "kilbori",
          "sambuwal",
          "shira",
          "tsafi",
          "tumfafi",
          "zubo"
        ]
      },
      {
        "lga": "tafawa-balewa",
        "wards": [
          "ball",
          "bula",
          "bununu",
          "dajin",
          "dull",
          "kardam-a",
          "kardam-b",
          "lere-south",
          "lere-north",
          "tapshin",
          "wai"
        ]
      },
      {
        "lga": "toro",
        "wards": [
          "jama-a-zaranda",
          "lame",
          "mara-palama",
          "rahama",
          "rauta-geji",
          "ribina",
          "tama",
          "tilden-fulani",
          "toro-tulai",
          "wonu",
          "zalau-rishi"
        ]
      },
      {
        "lga": "warji",
        "wards": [
          "baima-south-east",
          "baima-north-west",
          "dagu-east",
          "dagu-west",
          "gabanga",
          "katanga",
          "kilbori",
          "rangan",
          "tiyin",
          "tudun-wada-west"
        ]
      },
      {
        "lga": "zaki",
        "wards": [
          "alangawari-kafin-larabawa",
          "bursali",
          "gumai",
          "katagum",
          "mainako",
          "maiwa",
          "makawa",
          "murmur-south",
          "murmur-north",
          "sakwa",
          "tashena-gadai"
        ]
      }
    ]
  },
  {
    "state": "bayelsa",
    "lgas": [
      {
        "lga": "brass",
        "wards": [
          "brass-1",
          "brass-ward-ii",
          "cape-farmosa",
          "ewoama-fantuo",
          "konsho",
          "minibie",
          "odioma-diema",
          "okpoama",
          "os-inibiri",
          "sangana"
        ]
      },
      {
        "lga": "ekeremor",
        "wards": [
          "eduwini-i",
          "eduwini-ii",
          "oporomor-i",
          "oporomor-ii",
          "oporomor-iii",
          "oporomor-iv",
          "oporomor-v",
          "oyiakiri-i",
          "oyiakiri-ii",
          "oyiakiri-iii",
          "oyiakiri-iv",
          "tarakiri"
        ]
      },
      {
        "lga": "kolokuma-opokuma",
        "wards": [
          "igbedi",
          "kaiama",
          "kaiama-olobiri",
          "odi-central-ii",
          "odi-north-i",
          "odi-south-iii",
          "okoloba-sabagreia-ii",
          "opokuma-north",
          "opokumasouth",
          "sampou-kalama",
          "seibokorogha-sabagreia-1"
        ]
      },
      {
        "lga": "nembe",
        "wards": [
          "bassambiri-1",
          "bassambiri-11",
          "bassambiri-111",
          "bassambiri-1v",
          "igbeta-ewoama-fantuo",
          "ikensi",
          "mini",
          "ogbolomabiri-1",
          "ogbolomabiri-11",
          "ogbolomabiri-111",
          "okoroma-1",
          "okoroma-11",
          "oluasiri"
        ]
      },
      {
        "lga": "ogbia",
        "wards": [
          "anyama",
          "emeyal",
          "imiringi",
          "kolo",
          "ogbia",
          "okodi",
          "ologi",
          "oloibiri",
          "opume",
          "otakeme",
          "otuabula",
          "otuasega",
          "otuokpoti"
        ]
      },
      {
        "lga": "sagbama",
        "wards": [
          "adagbabiri",
          "adoni",
          "agbere",
          "agoro",
          "angalabiri",
          "asamabiri",
          "ebedebiri",
          "ofoni-i",
          "ofoni-ii",
          "osekwenike",
          "ossiama",
          "sagbama",
          "toru-ebeni",
          "trofani"
        ]
      },
      {
        "lga": "southern-ijaw",
        "wards": [
          "amassoma-i",
          "amassoma-ii",
          "amassoma-iii",
          "apoi",
          "central-boma-i",
          "central-boma-ii",
          "east-boma-i",
          "east-boma-ii",
          "foropa",
          "koluama",
          "olodiama-i",
          "olodiama-ii",
          "oporoma-ii",
          "oporoma-1",
          "otuan",
          "ukubie",
          "west-boma"
        ]
      },
      {
        "lga": "yenagoa",
        "wards": [
          "attissa-i",
          "attissa-ii",
          "attissa-iii",
          "biseni-1",
          "biseni-11",
          "ekpetiama-11",
          "ekpetiama-i",
          "epie-11",
          "epie-i",
          "epie-iii",
          "gbarain-i",
          "gbarain-ii",
          "gbarain-iii",
          "okordia",
          "zarama"
        ]
      }
    ]
  },
  {
    "state": "benue",
    "lgas": [
      {
        "lga": "ado",
        "wards": [
          "akoge-ogbilolo",
          "apa",
          "ekile",
          "igumale-i",
          "igumale-ii",
          "ijigban",
          "ogege",
          "royongo",
          "ukwonyo",
          "ulayi"
        ]
      },
      {
        "lga": "agatu",
        "wards": [
          "egba",
          "enungba",
          "obagaji",
          "odugbeho",
          "ogbaulu",
          "ogwule-ogbaulu",
          "ogwule-kaduna",
          "okokolo",
          "oshigbudu",
          "usha"
        ]
      },
      {
        "lga": "apa",
        "wards": [
          "akpete-ojantelle",
          "auke",
          "edikwu-i",
          "edikwu-ii",
          "igah-okpaya",
          "igoro",
          "ikobi",
          "oba",
          "ofoke",
          "oiji",
          "ugbokpo"
        ]
      },
      {
        "lga": "buruku",
        "wards": [
          "binev",
          "etulo",
          "mbaade",
          "mbaakura",
          "mbaapen",
          "mbaatirkyaa",
          "mbaazagee",
          "mbaikyongo-nyifon",
          "mbaityough",
          "mbakyaan",
          "mbaya",
          "mbayaka",
          "shorov"
        ]
      },
      {
        "lga": "gboko",
        "wards": [
          "gbk-central-market",
          "gboko-east",
          "gboko-north-west",
          "gboko-south",
          "igyorov",
          "mbaa-varakaa",
          "mbaanku",
          "mbadam",
          "mbadim",
          "mbakper",
          "mbakwen",
          "mbatan",
          "mbatser",
          "mbatyu",
          "ukpekpe",
          "yandev-north",
          "yandev-south"
        ]
      },
      {
        "lga": "guma",
        "wards": [
          "abinsi",
          "kaambe",
          "mbabai",
          "mbadwem",
          "mbawa",
          "mbayer-yandev",
          "nyiev",
          "nzorov",
          "saghev",
          "uvir"
        ]
      },
      {
        "lga": "gwer-east",
        "wards": [
          "akpach-ayi",
          "aliade-town",
          "gbemacha",
          "ikyogbajir",
          "ikyonov",
          "mbabur",
          "mbaiase",
          "mbaikyaan",
          "mbaikyu",
          "mbalom",
          "mbasombo",
          "mbayom",
          "shough",
          "ugee"
        ]
      },
      {
        "lga": "gwer-west",
        "wards": [
          "avihijime",
          "gaambe-ushin",
          "gbaange-tongov",
          "ikyaghev",
          "isambe-mbasev",
          "ityoughatee-injaha",
          "mbabuande",
          "mbachohon",
          "mbanyamshi",
          "mbapa",
          "merkyen",
          "sagher-ukusu",
          "sengev",
          "sengev-yengev",
          "tijime"
        ]
      },
      {
        "lga": "katsina-ala",
        "wards": [
          "ikurav-tiev-i",
          "ikurav-tiev-ii",
          "iwar-tongov-i",
          "katsina-ala-town",
          "mbacher",
          "mbajir",
          "mbatula-mberev",
          "mbayongo",
          "michihe",
          "tiir-tongov-ii",
          "utange",
          "yooyo"
        ]
      },
      {
        "lga": "konshisha",
        "wards": [
          "ikyurav-mbatwer",
          "mbagusa-mbatser",
          "mbaikyase",
          "mbaiwarnyam",
          "mbake",
          "mbanor",
          "mbatsen",
          "mbavoa",
          "mbawar",
          "mbayegh-mbaikyer",
          "tse-agberagba"
        ]
      },
      {
        "lga": "kwande",
        "wards": [
          "adikpo-metropolis",
          "kumakwagh",
          "liev-i",
          "liev-ii",
          "mbadura",
          "mbagba-mbaikyan",
          "mbaikyor",
          "mbaketsa",
          "mbayoo",
          "menev",
          "moon",
          "tondov-i",
          "tondov-ii",
          "usar",
          "yaav"
        ]
      },
      {
        "lga": "logo",
        "wards": [
          "mbadyul",
          "mbagber",
          "mbater",
          "mbavuur",
          "mbayam",
          "nenzev",
          "tombo",
          "turan",
          "ukembergya-iswarev",
          "yonov"
        ]
      },
      {
        "lga": "makurdi",
        "wards": [
          "agan",
          "ankpa-wadata",
          "bar",
          "central-south-mission",
          "clerks-market",
          "fildi",
          "mbalagh",
          "modern-market",
          "north-bank-i",
          "north-bank-ii",
          "wailomayo"
        ]
      },
      {
        "lga": "obi",
        "wards": [
          "adiko",
          "adum-west",
          "ikwokwu",
          "irabi",
          "itogo",
          "obarike",
          "obeko",
          "odiapa",
          "ogore",
          "okpokwu",
          "okwutungbe",
          "orihi"
        ]
      },
      {
        "lga": "ogbadibo",
        "wards": [
          "ai-oodo-i",
          "ai-oodo-ii",
          "ai-oono-i",
          "ai-oono-ii",
          "ai-oono-iii",
          "ehaje-i",
          "ehaje-ii",
          "itabono-i",
          "itabono-ii",
          "olachagbaha",
          "orokam-i",
          "orokam-ii",
          "orokam-iii"
        ]
      },
      {
        "lga": "ohimini",
        "wards": [
          "agadagba",
          "awume-ehaje",
          "awume-icho",
          "ehatokpe",
          "idekpa",
          "ochobo",
          "oglewu-ehaje",
          "oglewu-icho",
          "onyagede-icho-ogoli",
          "onyagede-ehaje-alle"
        ]
      },
      {
        "lga": "oju",
        "wards": [
          "adokpa",
          "ainu",
          "ibilla",
          "idelle",
          "iyeche",
          "oboru-oye",
          "oju",
          "okpokpo",
          "okwudu",
          "owo",
          "ukpa-ainu-ette"
        ]
      },
      {
        "lga": "okpokwu",
        "wards": [
          "amejo",
          "eke",
          "ichama-ii",
          "ojigo",
          "ojoga",
          "okonobo",
          "okpaile-ingle",
          "okpoga-central",
          "okpoga-north",
          "okpoga-south",
          "okpoga-west",
          "ugbokolo"
        ]
      },
      {
        "lga": "otukpo",
        "wards": [
          "adoka-haje",
          "adoka-icho",
          "allan",
          "entekpa",
          "ewulo",
          "okete",
          "otobi",
          "otukpo-town-central",
          "otukpo-town-east",
          "otukpo-town-west",
          "ugboju-ehaje",
          "ugboju-icho",
          "ugboju-otahe"
        ]
      },
      {
        "lga": "tarka",
        "wards": [
          "mbaajir-akaa",
          "mbaayo",
          "mbachaver-ikyondo",
          "mbaigba",
          "mbaikyaa",
          "mbaikyo-mbayia",
          "mbakwakem",
          "mbanyagber",
          "shitile",
          "tongov"
        ]
      },
      {
        "lga": "ukum",
        "wards": [
          "aterayange",
          "azendeshi",
          "borikyo",
          "ityuluv",
          "kendev",
          "kundav",
          "lumbuv",
          "mbatian",
          "mbayenge",
          "mbazun",
          "tsaav",
          "ugbaam",
          "uyam"
        ]
      },
      {
        "lga": "ushongo",
        "wards": [
          "atikyese",
          "ikyov",
          "lessel",
          "mbaaka",
          "mbaanyam",
          "mbagba",
          "mbagwaza",
          "mbagwe",
          "mbakuha",
          "mbayegh",
          "utange"
        ]
      },
      {
        "lga": "vandeikya",
        "wards": [
          "mbadede",
          "mbagbam",
          "mbagbera",
          "mbajor",
          "mbakaange",
          "mbakyaha",
          "mbanyumangbagh",
          "mbatyough",
          "mbayongo",
          "ningev",
          "tsambe",
          "vandeikya-township"
        ]
      }
    ]
  },
  {
    "state": "borno",
    "lgas": [
      {
        "lga": "abadam",
        "wards": [
          "arege",
          "banowa",
          "fuguwa",
          "jabullam",
          "kudokurgu",
          "malam-kaunari",
          "mallamfatori-kessa",
          "yau",
          "yawa-kura",
          "yituwa"
        ]
      },
      {
        "lga": "askira-uba",
        "wards": [
          "askira-east",
          "chul-rumirgo",
          "dille-huyum",
          "husara-tampul",
          "kopa-multhafu",
          "lassa",
          "mussa",
          "ngohi",
          "ngulde",
          "uba",
          "uda-uvu",
          "wamdeo-giwi",
          "zadawa-hausari"
        ]
      },
      {
        "lga": "bama",
        "wards": [
          "andara-ajiri-wulba",
          "buduwa-bula-chirabe",
          "dipchari-jere-dar-jamal-kotembe",
          "gulumba-jukkuri-batra",
          "kasugula",
          "kumshe-nduguno",
          "lawanti-malam-mastari-abbaram",
          "marka-malge-amchaka",
          "mbuliya-goniri-siraja",
          "sabsabwa-soye-bulongu",
          "shehuri-hausari-mairi",
          "wulbari-ndine-chachile",
          "yabiri-kura-yabiri-gana-chongolo",
          "zangeri-kash-kash"
        ]
      },
      {
        "lga": "bayo",
        "wards": [
          "balbaya",
          "briyel",
          "fikayel",
          "gamadadi",
          "jara-dali",
          "jara-gol",
          "limanti",
          "teli",
          "wuyo",
          "zara"
        ]
      },
      {
        "lga": "biu",
        "wards": [
          "buratai",
          "dadin-kowa",
          "dugja",
          "garubula",
          "gur",
          "kenken",
          "mandara-girau",
          "miringa",
          "sulumthla",
          "yawi",
          "zarawuyaku"
        ]
      },
      {
        "lga": "chibok",
        "wards": [
          "chibok-garu",
          "chibok-likama",
          "chibok-wuntaku",
          "gatamarwa",
          "kautikari",
          "korongilim",
          "kuburmbula",
          "mbalala",
          "mboa-kura",
          "pemi",
          "shikarkir"
        ]
      },
      {
        "lga": "damboa",
        "wards": [
          "ajign-a",
          "ajign-b",
          "azur-multe-forfor",
          "bego-yerwa-ngurna",
          "damboa",
          "gumsuri-misakurbudu",
          "kafa-mafi",
          "mulgwai-kopchi",
          "nguda-wuyaram",
          "wawa-korede"
        ]
      },
      {
        "lga": "dikwa",
        "wards": [
          "boboshe",
          "dikwa",
          "gajibo",
          "magarta-sheffri",
          "mallam-maja",
          "mudu-kaza",
          "muliye-jemuri",
          "ngudoram",
          "sogoma-afuye",
          "ufaye-gujile"
        ]
      },
      {
        "lga": "gubio",
        "wards": [
          "ardimini",
          "dabira",
          "felo",
          "gamowo",
          "gazabure",
          "gubio-town-i",
          "gubio-town-ii",
          "kingowa",
          "ngetra",
          "zowo"
        ]
      },
      {
        "lga": "guzamala",
        "wards": [
          "aduwa",
          "gudumbali-east",
          "gudumbali-west",
          "guworam",
          "guzamala-east",
          "guzamala-west",
          "kingarwa",
          "mairari",
          "moduri",
          "wamiri"
        ]
      },
      {
        "lga": "gwoza",
        "wards": [
          "ashigashiya",
          "bita-izge",
          "dure-wala-warabe",
          "gavva-agapalwa",
          "guduf-nagadiyo",
          "gwoza-town-gadamayo",
          "gwoza-wakane-bulabulin",
          "hambagda-liman-kara-new-settlement",
          "johode-chikide-kughum",
          "kirawa-jimini",
          "kurana-bassa-ngoshe-sama-a",
          "ngoshe",
          "pulka-bokko"
        ]
      },
      {
        "lga": "hawul",
        "wards": [
          "bilingwi",
          "dzar-vinadum-birni-dlandi",
          "gwanzang-pusda",
          "hizhi",
          "kida",
          "kwajaffa-hang",
          "kwaya-bur-tanga-rumta",
          "marama-kidang",
          "pama-whitambaya",
          "puba-vidau-lokoja",
          "sakwa-hema",
          "shaffa"
        ]
      },
      {
        "lga": "jere",
        "wards": [
          "alau",
          "bale-galtimari",
          "dala-lawanti",
          "dusuman",
          "gomari",
          "gongulong",
          "maimusari",
          "mairi",
          "mashamari",
          "ngudaa-addamari",
          "old-maiduguri",
          "tuba"
        ]
      },
      {
        "lga": "kaga",
        "wards": [
          "afa-dig-maudori",
          "benisheikh",
          "borgozo",
          "dogoma-jalori",
          "dongo",
          "galangi",
          "guwo",
          "karagawaru",
          "mainok",
          "marguba",
          "ngamdu",
          "shettimari",
          "tobolo",
          "wajiro-burgumma",
          "wassaram"
        ]
      },
      {
        "lga": "kala-balge",
        "wards": [
          "jarawa-sangaya",
          "jilbe-a",
          "jilbe-b-koma-kaudi",
          "kala",
          "kumaga",
          "mada",
          "moholo",
          "rann-a",
          "rann-b-daima",
          "sigal-karche"
        ]
      },
      {
        "lga": "konduga",
        "wards": [
          "auno-chabbol",
          "dalori-wanori",
          "dawa-east-malari-kangamari",
          "jewu-lamboa",
          "kawuri",
          "kelumiri-ngalbi-amari-yale",
          "konduga",
          "mairamri-yeleri-bazamri",
          "masba-dalwa-west",
          "nyaleri-sandia-yejiwa",
          "sojiri-nguro-nguro"
        ]
      },
      {
        "lga": "kukawa",
        "wards": [
          "alagarno",
          "baga",
          "bundur",
          "dogoshi",
          "doro-duguri",
          "kauwa",
          "kekeno",
          "kukawa",
          "moduari-barwari",
          "yoyo"
        ]
      },
      {
        "lga": "kwaya-kusar",
        "wards": [
          "gondi",
          "gusi-billa",
          "guwal",
          "kubuku",
          "kurba",
          "kwaya-kusar",
          "peta",
          "wada",
          "wawa",
          "yimirthalang"
        ]
      },
      {
        "lga": "mafa",
        "wards": [
          "abbari",
          "anadua",
          "gawa",
          "koshebe",
          "laje",
          "limanti",
          "loskuri",
          "ma-afa",
          "mafa",
          "masu",
          "mujigine",
          "tamsu-ngamdua"
        ]
      },
      {
        "lga": "magumeri",
        "wards": [
          "ardo-ram",
          "ayi-yasku",
          "borno-yesu",
          "furram",
          "gaji-ganna-i",
          "gaji-ganna-ii",
          "hoyo-chin-gowa",
          "kalizoram-banoram",
          "kareram",
          "kubti",
          "magumeri",
          "ngamma",
          "ngubala"
        ]
      },
      {
        "lga": "maiduguri",
        "wards": [
          "bolori-i",
          "bolori-ii",
          "bulablin",
          "fezzan",
          "gamboru-liberty",
          "gwange-i",
          "gwange-ii",
          "gwange-iii",
          "hausari-zango",
          "lamisula-jabba-mari",
          "limanti",
          "mafoni",
          "maisandari",
          "shehuri-north",
          "shehuri-south"
        ]
      },
      {
        "lga": "marte",
        "wards": [
          "ala",
          "alla-lawanti",
          "borsori",
          "gumna",
          "kabulawa",
          "kirenowa",
          "kulli",
          "marte",
          "mawulli",
          "musune",
          "ngeleiwa",
          "njine",
          "zaga"
        ]
      },
      {
        "lga": "mobbar",
        "wards": [
          "asaga",
          "bogum",
          "chamba",
          "damasak",
          "duji",
          "gashagar",
          "kareto",
          "layi",
          "zanna-umorti",
          "zari"
        ]
      },
      {
        "lga": "monguno",
        "wards": [
          "damakuli",
          "kaguram",
          "kumalia",
          "mandala",
          "mintar",
          "mofio",
          "monguno",
          "ngurno",
          "sure",
          "wulo",
          "yele",
          "zulum"
        ]
      },
      {
        "lga": "ngala",
        "wards": [
          "fuye",
          "gamboru-b",
          "gamboru-c",
          "logumane",
          "ndufu",
          "ngala-ward",
          "old-gamboru-a",
          "sagir",
          "tunokalia",
          "warshele",
          "wulgo",
          "wurge"
        ]
      },
      {
        "lga": "nganzai",
        "wards": [
          "alarge",
          "badu",
          "damaram",
          "gadai",
          "gajiram",
          "jigalta",
          "kuda",
          "kurnawa",
          "maiwa",
          "miye",
          "sabsabuwa",
          "sugundure"
        ]
      },
      {
        "lga": "shani",
        "wards": [
          "bargu-burashika",
          "buma",
          "gasi-salifawa",
          "gora",
          "gwalasho",
          "gwaskara",
          "kombo",
          "kubo",
          "kwaba",
          "shani",
          "walama"
        ]
      }
    ]
  },
  {
    "state": "cross-river",
    "lgas": [
      {
        "lga": "abi",
        "wards": [
          "adadama",
          "afafanyi-igonigoni",
          "ebom",
          "ediba",
          "ekureku-i",
          "ekureku-ii",
          "imabana-i",
          "imabana-ii",
          "itigidi",
          "usumutong"
        ]
      },
      {
        "lga": "akamkpa",
        "wards": [
          "akamkpa-urban",
          "awi",
          "eku",
          "iko",
          "ikpai",
          "mbarakom",
          "oban",
          "ojuk-north",
          "ojuk-south",
          "uyanga"
        ]
      },
      {
        "lga": "akpabuyo",
        "wards": [
          "atimbo-east",
          "atimbo-west",
          "eneyo",
          "idundu-anyanganse",
          "ikang-central",
          "ikang-north",
          "ikang-south",
          "ikot-edem-odo",
          "ikot-eyo",
          "ikot-nakanda"
        ]
      },
      {
        "lga": "bakassi",
        "wards": [
          "abana",
          "akpankanya",
          "akwa",
          "ambai-ekpa",
          "amoto",
          "archibong",
          "atai-ema",
          "efut-inwang",
          "ekpot-abia",
          "odiong"
        ]
      },
      {
        "lga": "bekwarra",
        "wards": [
          "abuochiche",
          "afrike-ochagbe",
          "afrike-okpeche",
          "beten",
          "gakem",
          "ibiaragidi",
          "nyanya",
          "otukpuru",
          "ugboro",
          "ukpah"
        ]
      },
      {
        "lga": "biase",
        "wards": [
          "abayong",
          "adim",
          "agwagune-okurike",
          "akpet-abini",
          "biakpan",
          "ehom",
          "erei-north",
          "erei-south",
          "ikun-etono",
          "umon-north",
          "umon-south"
        ]
      },
      {
        "lga": "boki",
        "wards": [
          "abo",
          "alankwe",
          "beebo-bumaji",
          "boje",
          "buda",
          "buentsebe",
          "bunyia-okubuchi",
          "ekpashi",
          "kakwagom-bawop",
          "ogep-osokom",
          "oku-borum-njua"
        ]
      },
      {
        "lga": "calabar-municipality",
        "wards": ["i", "ii", "iii", "iv", "ix", "v", "vi", "vii", "viii", "x"]
      },
      {
        "lga": "calabar-south",
        "wards": [
          "eight-8",
          "eleven-11",
          "five-5",
          "four-4",
          "nine-9",
          "one-1",
          "seven-7",
          "six-6",
          "ten-10",
          "three-3",
          "twelve-12",
          "two-2"
        ]
      },
      {
        "lga": "etung",
        "wards": [
          "abia",
          "abijang",
          "agbokim",
          "ajassor",
          "bendeghe-ekiem",
          "effraya",
          "etomi",
          "itaka",
          "mkpot-ayuk-aba",
          "nsofang"
        ]
      },
      {
        "lga": "ikom",
        "wards": [
          "abanyum",
          "akparabong",
          "ikom-urban-i",
          "ikom-urban-ii",
          "nde",
          "nnam",
          "nta-nselle",
          "ofutop-i",
          "ofutop-ii",
          "olulumo",
          "yala-nkum"
        ]
      },
      {
        "lga": "obanliku",
        "wards": [
          "basang",
          "bebi",
          "becheve",
          "bendi-i",
          "bendi-ii",
          "bishiri-north",
          "bishiri-south",
          "bisu",
          "busi",
          "utanga"
        ]
      },
      {
        "lga": "obubra",
        "wards": [
          "ababene",
          "apiapum",
          "iyamoyong",
          "obubra-urban",
          "ochon",
          "ofat",
          "ofodua",
          "ofumbongha-yala",
          "osopong-i",
          "osopong-ii",
          "ovonum"
        ]
      },
      {
        "lga": "obudu",
        "wards": [
          "alege-ubang",
          "angiaba-begiaka",
          "begiading",
          "ipong",
          "obudu-urban-i",
          "obudu-urban-ii",
          "ukpe",
          "utugwang-central",
          "utugwang-north",
          "utugwang-south"
        ]
      },
      {
        "lga": "odukpani",
        "wards": [
          "adiabo-efut",
          "akamkpa",
          "creek-town-i",
          "creek-town-ii",
          "eki",
          "ekori-anaku",
          "eniong",
          "ikoneto",
          "ito-idere-ukwa",
          "obomitiat-mbiabo-ediong",
          "odot",
          "odukpani-central",
          "oniman-kiong"
        ]
      },
      {
        "lga": "ogoja",
        "wards": [
          "ekajuk-i",
          "ekajuk-ii",
          "mbube-east-i",
          "mbube-east-ii",
          "mbube-west-i",
          "mbube-west-ii",
          "nkum-iborr",
          "nkum-irede",
          "ogoja-urban-i",
          "ogoja-urban-ii"
        ]
      },
      {
        "lga": "yakurr",
        "wards": [
          "abanakpai",
          "afrekpe-ekpenti",
          "ajere",
          "assiga",
          "biko-biko",
          "idomi",
          "ijiman",
          "ijom",
          "ikpakapit",
          "inyima",
          "mkpani-agoi",
          "nkpolo-ukpawen",
          "ntan"
        ]
      },
      {
        "lga": "yala",
        "wards": [
          "echumofana",
          "gabu",
          "ijiraga",
          "njrigom-mfuma",
          "okpoma",
          "okuku",
          "wanakom",
          "wanihem",
          "wanikade",
          "yache",
          "yahe"
        ]
      }
    ]
  },
  {
    "state": "delta",
    "lgas": [
      {
        "lga": "aniocha-north",
        "wards": [
          "ezi",
          "idumuje-unor",
          "issele-azagba",
          "issele-uku-i",
          "issele-uku-ii",
          "obior",
          "obomkpa",
          "onicha-olona",
          "onicha-ugbo",
          "ukwu-nzu"
        ]
      },
      {
        "lga": "aniocha-south",
        "wards": [
          "aba-unor",
          "ejeme",
          "isheagu-ewulu",
          "nsukwa",
          "ogwashi-uku-i",
          "ogwashi-uku-ii",
          "ogwashi-uku-village",
          "ubulu-uku-i",
          "ubulu-uku-ii",
          "ubulu-unor",
          "ubulu-okiti"
        ]
      },
      {
        "lga": "bomadi",
        "wards": [
          "akugbene-i",
          "akugbene-ii",
          "akugbene-iii",
          "bomadi",
          "kolafiogbene-ekametagbene",
          "kpakiama",
          "ogbeinama-okoloba",
          "ogo-eze",
          "ogriagbene",
          "syama"
        ]
      },
      {
        "lga": "burutu",
        "wards": [
          "bulou-ndoro",
          "ngbilebiri-i",
          "ngbilebiri-ii",
          "obotebe",
          "ogbolubiri",
          "ogulagha",
          "ojobo",
          "seimbiri",
          "tamigbe",
          "torugbene",
          "tuomo"
        ]
      },
      {
        "lga": "ethiope-west",
        "wards": [
          "jesse-i",
          "jesse-ii",
          "jesse-iii",
          "jesse-iv",
          "mosogar-i",
          "mosogar-ii",
          "oghara-i",
          "oghara-ii",
          "oghara-iii",
          "oghara-iv",
          "oghara-v"
        ]
      },
      {
        "lga": "ethiope-east",
        "wards": [
          "abraka-i",
          "abraka-ii",
          "abraka-iii",
          "agbon-i",
          "agbon-ii",
          "agbon-iii",
          "agbon-iv",
          "agbon-v",
          "agbon-vi",
          "agbon-vii",
          "agbon-viii"
        ]
      },
      {
        "lga": "ika-north-east",
        "wards": [
          "akumazi",
          "idumuesah",
          "igbodo",
          "mbiri",
          "otolokpo",
          "owa-v",
          "owa-vi",
          "owa-i",
          "owa-ii",
          "owa-iii",
          "owa-iv",
          "umunede",
          "ute-ogbeje",
          "ute-okpu"
        ]
      },
      {
        "lga": "ika-south",
        "wards": [
          "abavo-i",
          "abavo-ii",
          "abavo-iii",
          "agbor-town-i",
          "agbor-town-ii",
          "boji-boji-i",
          "boji-boji-ii",
          "boji-boji-iii",
          "ekuku-agbor",
          "ihiuiyase-i",
          "ihuiyase-ii",
          "ihuozomor-ozanogogo-alisimie"
        ]
      },
      {
        "lga": "isoko-north",
        "wards": [
          "ellu",
          "emevor",
          "iluelogbo",
          "iyede-i",
          "iyede-ii",
          "okpe-isoko",
          "otibio",
          "ovrode",
          "owhe-akiehwe",
          "oyede",
          "ozoro-i",
          "ozoro-ii",
          "ozoro-iii"
        ]
      },
      {
        "lga": "isoko-south",
        "wards": [
          "aviara",
          "emede",
          "enhwe-okpolo",
          "erowa-umeh",
          "igbide",
          "irri-ii",
          "irri-i",
          "oleh-i",
          "oleh-ii",
          "olomoro",
          "uzere"
        ]
      },
      {
        "lga": "ndokwa-east",
        "wards": [
          "abarra-inyi-onuaboh",
          "aboh-akarrai",
          "afor-obikwele",
          "ase",
          "ashaka",
          "ibedeni",
          "ibrede-igbuku-onogbokor",
          "okpai-utchi-beneku",
          "onyia-adiai-otuoku-umuolu",
          "ossissa"
        ]
      },
      {
        "lga": "ndokwa-west",
        "wards": [
          "abbi-ii",
          "abbi-i",
          "emu",
          "ogume-i",
          "ogume-ii",
          "onicha-ukwani",
          "utagba-ogbe",
          "utagba-uno-i",
          "utagba-uno-ii",
          "utagba-uno-iii"
        ]
      },
      {
        "lga": "okpe",
        "wards": [
          "aghalokpe",
          "aragba-town",
          "mereje-i",
          "mereje-ii",
          "mereje-iii",
          "oha-i",
          "oha-ii",
          "orerokpe",
          "oviri-okpe",
          "ughoton"
        ]
      },
      {
        "lga": "oshimili-north",
        "wards": [
          "akwukwu",
          "ebu",
          "ibusa-i",
          "ibusa-ii",
          "ibusa-iii",
          "ibusa-iv",
          "ibusa-v",
          "illah",
          "okpanam",
          "ukala"
        ]
      },
      {
        "lga": "oshimili-south",
        "wards": [
          "agu",
          "anala-amakom",
          "cable-point-i",
          "cable-point-ii",
          "ogbele-akpako",
          "okwe",
          "ugbomanta-quarters",
          "umuaji",
          "umuezei",
          "umuonaje",
          "west-end"
        ]
      },
      {
        "lga": "patani",
        "wards": [
          "abari",
          "agoloma",
          "bolou-angiama",
          "odorubu-adobu-bolou-apelebri",
          "patani-ii",
          "patani-iii",
          "patani-i",
          "taware-kolowara-aven",
          "toru-angiama",
          "uduophori"
        ]
      },
      {
        "lga": "sapele",
        "wards": [
          "amuokpe",
          "elume",
          "okokporo-ugborhen",
          "sapele-urban-iii",
          "sapele-urban-iv",
          "sapele-urban-v",
          "sapele-urban-vi",
          "sapele-urban-vii",
          "sapele-urban-viii",
          "sapele-urban-i",
          "sapele-urban-ii"
        ]
      },
      {
        "lga": "udu",
        "wards": [
          "aladja",
          "ekete",
          "opete-assagba-edjophe",
          "orhuwerun",
          "ovwian-i",
          "ovwian-ii",
          "udu-i",
          "udu-ii",
          "udu-iii",
          "udu-iv"
        ]
      },
      {
        "lga": "ughelli-north",
        "wards": [
          "agbarha",
          "agbarho-i",
          "agbarho-ii",
          "evwreni",
          "ogor",
          "orogun-i",
          "orogun-ii",
          "ughelli-i",
          "ughelli-ii",
          "ughelli-iii",
          "uwheru"
        ]
      },
      {
        "lga": "ughelli-south",
        "wards": [
          "effurun-otor",
          "ekakpamre",
          "ewu-i",
          "ewu-ii",
          "ewu-iii",
          "jeremi-i",
          "jeremi-ii",
          "jeremi-iii",
          "jeremi-iv",
          "olomu-i",
          "olomu-ii"
        ]
      },
      {
        "lga": "ukwuani",
        "wards": [
          "akoku",
          "amai",
          "ebedei",
          "eziokpor",
          "ezionum",
          "obiaruku-i",
          "obiaruku-ii",
          "umuebu",
          "umukwata",
          "umutu"
        ]
      },
      {
        "lga": "uvwie",
        "wards": [
          "army-barracks-area",
          "effurun-i",
          "effurun-ii",
          "ekpan-i",
          "ekpan-ii",
          "enerhen-i",
          "enerhen-ii",
          "ugbomro-ugbolokposo",
          "ugborikoko",
          "ugboroke"
        ]
      },
      {
        "lga": "warri-north",
        "wards": [
          "ebrohimi",
          "eghoro",
          "gbokoda",
          "isekelewu-egbema-ii",
          "koko-i",
          "koko-ii",
          "ogbinbiri-egbema-iii",
          "ogbudugbudu-egbema-iv",
          "ogheye",
          "opuama-egbema-i"
        ]
      },
      {
        "lga": "warri-south",
        "wards": [
          "bowen",
          "edjeba",
          "g-r-a",
          "igbudu",
          "obodo-omadino",
          "ode-itsekiri",
          "ogunu-ekurede-urhobo",
          "okere",
          "okumagba-i",
          "okumagba-ii",
          "pessu",
          "ugbuwangue-ekurede-itsekiri"
        ]
      },
      {
        "lga": "warri-south-west",
        "wards": [
          "aja-udaibo",
          "akpikpa",
          "gbaramatu",
          "isaba",
          "madangho",
          "ogbe-ijoh",
          "ogidigben",
          "oporoza",
          "orere",
          "ugborodo"
        ]
      }
    ]
  },
  {
    "state": "ebonyi",
    "lgas": [
      {
        "lga": "abakaliki",
        "wards": [
          "abakpa",
          "amachi-ndebo",
          "amachi-ndegu",
          "amagu-enyieba",
          "amagu-unuhu",
          "azuii-udene",
          "azuiyiokwu-layout",
          "azumili-azugwu",
          "edda",
          "izzi-unuhu",
          "ndiagu",
          "okpoitumo-ndebor",
          "okpoitumo-ndiegu",
          "timber-shed"
        ]
      },
      {
        "lga": "afikpo-south",
        "wards": [
          "amaeke",
          "amangwu-edda",
          "amaoso",
          "amato",
          "amigbo-etiti-edda",
          "amiri",
          "ebunwana",
          "ndioke-ekoli-edda",
          "nguzu",
          "oso",
          "owutu"
        ]
      },
      {
        "lga": "afikpo-north",
        "wards": [
          "amata-akpoha",
          "amogu-akpoha",
          "ezeke-amasiri",
          "ibii-oziza-afikpo",
          "itim-afikpo",
          "nkpoghoro-afikpo",
          "ohaisu-afikpo-a",
          "ohaisu-afikpo-b",
          "poperi-amasiri",
          "ugwuegu-afikpo",
          "uwana-afikpo-1",
          "uwana-afikpo-ii"
        ]
      },
      {
        "lga": "ebonyi",
        "wards": [
          "abakpa",
          "abofia",
          "agalegu",
          "echiaba",
          "egwudinagu",
          "enyibichiri-i",
          "enyibichiri-ii",
          "kpirikpiri",
          "mbeke",
          "ndiebo",
          "ndiegu",
          "onuenyim",
          "urban-new-layout"
        ]
      },
      {
        "lga": "ezza-north",
        "wards": [
          "amuda-ama-wula",
          "ekka",
          "inyere",
          "ndieguazu-umuoghara",
          "nkomoro",
          "ogboji",
          "okposi-umuoghara",
          "omege-umuezeokoha",
          "oriuzor",
          "oshiegbe-umuez-eokoha",
          "umuezeoka"
        ]
      },
      {
        "lga": "ezza-south",
        "wards": [
          "amaeka",
          "amaezekwe",
          "amagu-nsokara",
          "amana",
          "amudo-okoffia",
          "amuzu",
          "echare",
          "ezzama",
          "ikwuator-idembia",
          "onueke",
          "umunwagu-idembia"
        ]
      },
      {
        "lga": "ikwo",
        "wards": [
          "ama-inyima",
          "echialike",
          "eka-awoke",
          "ekpanwudele",
          "ekpelu",
          "enyibichiri",
          "etam",
          "igbudu-i",
          "igbudu-ii",
          "inyimagu-i",
          "inyimagu-ii",
          "ndiagu-amagu-i",
          "ndiagu-amagu-ii",
          "ndiagu-echara-i",
          "ndiagu-echara-ii",
          "ndufu-amagu",
          "ndufu-amagu-i",
          "ndufu-awke",
          "ndufu-echara",
          "noye-alike"
        ]
      },
      {
        "lga": "ishielu",
        "wards": [
          "agba",
          "amaezu",
          "azuinyaba-a",
          "azuinyaba-b",
          "ezillo-i",
          "ezillo-ii",
          "ezzagu-nkomor",
          "ezzagu-ogboji",
          "iyionu",
          "nkalagu",
          "nkalaha",
          "ntezi",
          "obeagu",
          "ohofia",
          "okpoto",
          "umuhuali"
        ]
      },
      {
        "lga": "ivo",
        "wards": [
          "akaeze-ishiagu",
          "akaeze-ukwu",
          "amagu",
          "amonye",
          "ihenta-ogidi",
          "iyioji-akaeze",
          "ndiokoro-ukwu",
          "ngwogwo",
          "obinagu",
          "okue",
          "umobo"
        ]
      },
      {
        "lga": "izzi",
        "wards": [
          "agbaja-anyanwuigwe",
          "agbaja-offia-onwe",
          "agbaja-mgbo",
          "ezza-inyimagu-igweled-oha",
          "ezza-inyimagu-iziogo",
          "ezza-inyimagu-igbuhu",
          "ezza-inyimagu-ndiagu",
          "igbeagu-iii",
          "igbeagu-ndi-ettah",
          "igbeagu-nduogbu",
          "mgbalaku-inyimagu-i",
          "mgbalaku-inyimagu-ii",
          "ndieze-inyimagu-11-ndiabor-ishiagu",
          "ndieze-inyimagu-mgbabeluzor"
        ]
      },
      {
        "lga": "ohaozara",
        "wards": [
          "amaechi-okposi",
          "enena-ezeraku",
          "mgbom-okposi",
          "obiozara",
          "okposi-achara",
          "okposi-okwu",
          "ugbogologo-ugwulangwu",
          "uhuo-taru-ugwu-langwu",
          "umic-hima",
          "umunaga",
          "umuobuna"
        ]
      },
      {
        "lga": "ohaukwu",
        "wards": [
          "effium-ii",
          "effium-i",
          "ezzamgbo",
          "ishi-ngbo-i",
          "ishi-ngbo-ii",
          "ngbo",
          "okposhi-i",
          "okposhi-ii",
          "umu-ogudu-akpu-i",
          "umu-ogudu-akpu-ii",
          "umu-ogudu-oshia",
          "umuagara-amechi",
          "wigbeke-i",
          "wigbeke-ii",
          "wigbeke-iii"
        ]
      },
      {
        "lga": "onicha",
        "wards": [
          "abaomege",
          "agbabor-isu",
          "amanator-isu",
          "ebia-oshiri",
          "enuagu-onicha",
          "isi-onicha",
          "isinkwo-ukamu",
          "obeagu-isu",
          "oguduukwor-oshiri",
          "okuzu-ukawu",
          "ugwu-oshiri",
          "umudomi-onicha"
        ]
      }
    ]
  },
  {
    "state": "edo",
    "lgas": [
      {
        "lga": "akoko-edo",
        "wards": [
          "enwan-atte-ikpeshi-egbigele",
          "ibillo-ekpesa-ekor-ikiran-ile-oke",
          "igarra-i",
          "igarra-ii",
          "imoga-lampese-bekuma-ekpe",
          "makeke-ojah-dangbala-ojirami-anyawoza",
          "oloma-okpe-ijaja-kakuma-anyara",
          "ososo",
          "somorika-ogbe-sasaro-onumu-eshawa-ogugu-igboshi-afe-igboshi-ele-aiyegunle",
          "uneme-nekhua-akpama-aiyetoro-ekpedo-erhurun-uneme-osu"
        ]
      },
      {
        "lga": "egor",
        "wards": [
          "egor",
          "evbareke",
          "ogida-use",
          "okhoro",
          "oliha",
          "otubu",
          "ugbowo",
          "uselu-i",
          "uselu-ii",
          "uwelu"
        ]
      },
      {
        "lga": "esan-central",
        "wards": [
          "ewu-i",
          "ewu-ii",
          "ikekato",
          "opoji",
          "otoruwo-i",
          "otoruwo-ii",
          "ugbegun",
          "uneah",
          "uwessan-i",
          "uwessan-ii"
        ]
      },
      {
        "lga": "esan-north-east",
        "wards": [
          "amedokhian",
          "arue",
          "efandion",
          "egbele",
          "ewoyi",
          "idumu-okojie",
          "obeidu",
          "ubierumu",
          "uelen-okugbe",
          "uwalor",
          "uzea"
        ]
      },
      {
        "lga": "esan-south-east",
        "wards": [
          "emu",
          "ewatto",
          "ewohimi-i",
          "ewohimi-ii",
          "illushi-i",
          "illushi-ii",
          "ohordua",
          "ubiaja-i",
          "ubiaja-ii",
          "ugboha"
        ]
      },
      {
        "lga": "esan-west",
        "wards": [
          "egoro-idoa-ukhun",
          "emaudo-eguare-ekpoma",
          "emuhi-ukpenu-ujoelen",
          "ihunmudumu-idumebo-uke-ujemen",
          "illeh-eko-ine",
          "iruekpen",
          "ogwa",
          "uhiele",
          "ujiogba",
          "urohi"
        ]
      },
      {
        "lga": "etsako-west",
        "wards": [
          "anwain",
          "auchi",
          "auchi-iii",
          "auchi-i",
          "auchi-ii",
          "aviele",
          "jagbe",
          "south-ibie",
          "uzairue-north-east",
          "uzairue-north-west",
          "uzairue-south-east",
          "uzairue-south-west"
        ]
      },
      {
        "lga": "etsako-central",
        "wards": [
          "ekperi-i",
          "ekperi-ii",
          "ekperi-iii",
          "fugar-i",
          "fugar-ii",
          "fugar-iii",
          "iraokhor",
          "ogbona",
          "south-uneme-i",
          "south-uneme-ii"
        ]
      },
      {
        "lga": "etsako-east",
        "wards": [
          "agenebode",
          "okpekpe",
          "okpella-i",
          "okpella-ii",
          "okpella-iii",
          "okpella-iv",
          "three-ibies",
          "wanno-i",
          "wanno-ii",
          "weppa"
        ]
      },
      {
        "lga": "igueben",
        "wards": [
          "afuda-idumuoka",
          "amahor-ugun",
          "ekekhen-idumu-ogo-egbike",
          "ekpon",
          "ewossa",
          "idigun-idumedo",
          "okalo-okpujie",
          "owu-okuta-eguare-ebelle",
          "udo",
          "uhe-idumuogbo-idumueke"
        ]
      },
      {
        "lga": "ikpoba-okha",
        "wards": [
          "aduwawa-evbo-modu",
          "gorretti",
          "idogbo",
          "iwogban-uteh",
          "obayantor",
          "ogbeson",
          "ologbo",
          "oregbeni",
          "st-saviour",
          "ugbekun"
        ]
      },
      {
        "lga": "oredo",
        "wards": [
          "gra-etete",
          "ibiwe-iwegie-ugbague",
          "ihogbe-isekhere-oreoghene-ibiwe-ice-road",
          "ikpema-eguadase",
          "new-benin-i",
          "new-benin-ii",
          "ogbe",
          "ogbelaka-nekpenekpen",
          "oredo",
          "unueru-ogboka",
          "urubi-evbiemwen-iwehen",
          "uzebu"
        ]
      },
      {
        "lga": "orhionmwon",
        "wards": [
          "aibiokula-i",
          "aibiokula-i",
          "aibiokula-ii",
          "evboesi",
          "igbanke-east",
          "igbanke-west",
          "iyoba",
          "ugbeka",
          "ugboko",
          "ugu",
          "ukpato",
          "urhonigbe-north",
          "urhonigbe-south"
        ]
      },
      {
        "lga": "ovia-north-east",
        "wards": [
          "adolor",
          "iguoshodin",
          "isiuwa",
          "oduna",
          "ofunmwegbe",
          "oghede",
          "okada-east",
          "okada-west",
          "okokhuo",
          "oluku",
          "uhen",
          "uhiere",
          "utoka"
        ]
      },
      {
        "lga": "ovia-south-west",
        "wards": [
          "iguobazuwa-east",
          "iguobazuwa-west",
          "nikorogha",
          "ofunama",
          "ora",
          "siluko",
          "udo",
          "ugbogui",
          "umaza",
          "usen"
        ]
      },
      {
        "lga": "owan-east",
        "wards": [
          "emai-i",
          "emai-ii",
          "igue-ikao",
          "ihievbe-i",
          "ihievbe-ii",
          "ivbiadaobi",
          "ivbianion",
          "otuo-i",
          "otuo-ii",
          "uokha-ake",
          "warrake"
        ]
      },
      {
        "lga": "owan-west",
        "wards": [
          "avbiosi",
          "eme-ora-oke",
          "eruere",
          "okpuje",
          "ozalla",
          "sabongida-ora-ogbeturu",
          "sobe",
          "uhonmora",
          "ukhuse-osi",
          "uzebba-i",
          "uzebba-ii"
        ]
      },
      {
        "lga": "uhunmwode",
        "wards": [
          "egbede",
          "ehor",
          "igieduma",
          "irhue",
          "isi-north",
          "isi-south",
          "ohuan",
          "uhi",
          "umagbae-north",
          "umagbae-south"
        ]
      }
    ]
  },
  {
    "state": "ekiti",
    "lgas": [
      {
        "lga": "ado-ekiti",
        "wards": [
          "ado-a-idofin",
          "ado-b-inisa",
          "ado-c-idolofin",
          "ado-d-ijigbo",
          "ado-e-ijoka-orereowu",
          "ado-f-okeyinmi",
          "ado-g-oke-ila",
          "ado-h-ereguru",
          "ado-i-dallimore",
          "ado-j-okesa",
          "ado-k-irona",
          "ado-l-igbehin",
          "ado-m-farm-settlement"
        ]
      },
      {
        "lga": "efon",
        "wards": [
          "efon-iii",
          "efon-i",
          "efon-ii",
          "efon-v",
          "efon-vi",
          "efon-vii",
          "efon-viii",
          "efon-x",
          "efon-iv",
          "efon-ix"
        ]
      },
      {
        "lga": "ekiti-east",
        "wards": [
          "araromi",
          "ilasa-i",
          "ilasa-ii-ikun-araromi-eda-ile",
          "isinbode",
          "kota-i",
          "kota-ii",
          "obadore-i",
          "obadore-ii",
          "obadore-iii",
          "obadore-iv",
          "omuo-oke-i",
          "omuo-oke-ii"
        ]
      },
      {
        "lga": "ekiti-south-west",
        "wards": [
          "igbara-odo-i",
          "igbara-odo-ii",
          "ilawe-iii",
          "ilawe-iv",
          "ilawe-v",
          "ilawe-i",
          "ilawe-ii",
          "ilawe-vi",
          "ilawe-vii",
          "ogotun-i",
          "ogotun-ii"
        ]
      },
      {
        "lga": "ekiti-west",
        "wards": [
          "aramoko-i",
          "aramoko-ii",
          "aramoko-iii-erio",
          "erijiyan-i",
          "erijiyan-ii",
          "ido-ajinare",
          "ikogosi",
          "ipole-iloro",
          "okemesi-i",
          "okemesi-ii",
          "okemesi-iii"
        ]
      },
      {
        "lga": "emure",
        "wards": [
          "ida-mudu-ii",
          "idamudu-i",
          "odo-emure-i",
          "odo-emure-ii",
          "odo-emure-iii",
          "odo-emure-iv",
          "ogbontioro-i",
          "ogbontioro-ii",
          "oke-emure-i",
          "oke-emure-ii"
        ]
      },
      {
        "lga": "gbonyin",
        "wards": [
          "adegba-i",
          "adegba-ii",
          "agbado",
          "egbe-iro",
          "ijan",
          "iluomoba",
          "imesi",
          "ode-i",
          "ode-ii",
          "ode-iii"
        ]
      },
      {
        "lga": "ido-osi",
        "wards": [
          "ayetoro-i",
          "ayetoro-ii",
          "ido-i",
          "ido-ii",
          "ifaki-i",
          "ifaki-ii",
          "igbole-ifisin-aaye",
          "ilogbo",
          "orin-ora",
          "osi",
          "usi"
        ]
      },
      {
        "lga": "ijero",
        "wards": [
          "ekamarun-ward-a",
          "ekamarun-ward-b",
          "ijero-ward-a",
          "ijero-ward-b",
          "ijero-ward-c",
          "ijero-ward-d",
          "ikoro-ward-a",
          "iloro-ijunrin-ward-b",
          "iloro-ward-a",
          "ipoti-odo-owa-ward-c",
          "ipoti-ward-a",
          "ipoti-ward-b"
        ]
      },
      {
        "lga": "ikere",
        "wards": [
          "afao-kajola-ayetoro",
          "agbado-oyo",
          "are-araromi",
          "atiba-aafin",
          "idemo",
          "ilapetu-ijao",
          "odose",
          "ogbonjana",
          "oke-osun",
          "okeruku",
          "ugele-aroku"
        ]
      },
      {
        "lga": "ikole",
        "wards": [
          "araromi-bolorunduro",
          "ijesa-isu",
          "ikole-east",
          "ikole-north",
          "ikole-south",
          "ikole-west-i",
          "ikole-west-ii",
          "ipao-oke-ako-irele",
          "itapaji-iyemero",
          "odo-ayedun-i",
          "odo-ayedun-ayebode",
          "oke-ayedun"
        ]
      },
      {
        "lga": "ilejemeje",
        "wards": [
          "eda-oniyo",
          "ewu",
          "ijesamodu",
          "iludun-i",
          "iludun-ii",
          "ipere",
          "iye-i",
          "iye-ii",
          "iye-iii",
          "obada"
        ]
      },
      {
        "lga": "irepodun-ifelodun",
        "wards": [
          "afao",
          "are",
          "awo",
          "igbemo",
          "igede-i",
          "igede-ii",
          "igede-iii",
          "iropora-esure-eyio",
          "iworoko",
          "iyin-i",
          "iyin-ii"
        ]
      },
      {
        "lga": "ise-orun",
        "wards": [
          "erinwa-i",
          "erinwa-ii",
          "odo-ise-i",
          "odo-ise-ii",
          "odo-ise-iii",
          "oraye-iii",
          "oraye-i",
          "oraye-ii",
          "orun-i",
          "orun-ii"
        ]
      },
      {
        "lga": "moba",
        "wards": [
          "erinmope-i",
          "erinmope-ii",
          "igogo-i",
          "igogo-ii",
          "ikun-i",
          "ikun-ii",
          "osan",
          "osun",
          "otun-i",
          "otun-ii",
          "otun-iii"
        ]
      },
      {
        "lga": "oye",
        "wards": [
          "ayede-north",
          "ayede-south-itaji",
          "ayegbaju",
          "ilupeju-i",
          "ilupeju-ii",
          "ire-i",
          "ire-ii",
          "isan-ilafon-ilemeso",
          "itapa-osin",
          "omu-oke-omu-odo-ijelu",
          "oye-i",
          "oye-ii"
        ]
      }
    ]
  },
  {
    "state": "enugu",
    "lgas": [
      {
        "lga": "aninri",
        "wards": [
          "mpu",
          "ndeabo",
          "nnenwe-i",
          "nnenwe-ii",
          "nnenwe-iii",
          "oduma-i",
          "oduma-ii",
          "oduma-iii",
          "oduma-iv",
          "okpanku"
        ]
      },
      {
        "lga": "awgu",
        "wards": [
          "agbogugu",
          "anikenano-ugwueme",
          "awgu-i",
          "awgu-ii",
          "ihe",
          "isu-awa-ogugu-agbudu-ituku",
          "mgbidi-mmaku",
          "mgbowo",
          "obeagu",
          "ogbaku",
          "owelli-amoli-ugbo-ogugu"
        ]
      },
      {
        "lga": "enugu-east",
        "wards": [
          "abakpa-i",
          "abakpa-ii",
          "amorji",
          "ibagwa-nike-edem",
          "mbulu-njodo-east",
          "mbulu-njodo-west",
          "mbuluiyiukwu",
          "mbuluowehe",
          "trans-ekulu",
          "ugwugo-nike",
          "umuchigbo",
          "umuenwene"
        ]
      },
      {
        "lga": "enugu-north",
        "wards": [
          "asata-township",
          "china-town",
          "g-r-a",
          "gui-newlayout",
          "ihewuzi",
          "independence-layout",
          "new-haven",
          "ogbette-east",
          "ogbette-west",
          "ogui-township",
          "onu-asata",
          "udi-siding-iva-valley",
          "umunevo"
        ]
      },
      {
        "lga": "enugu-south",
        "wards": [
          "achara-layout-east",
          "achara-layout-west",
          "akwuke",
          "amechi-i",
          "amechi-ii",
          "awkunanaw-east",
          "awkunanaw-west",
          "maryland",
          "obeagu-i",
          "obeagu-ii",
          "ugwuaji",
          "uwani-east",
          "uwani-west"
        ]
      },
      {
        "lga": "ezeagu",
        "wards": [
          "agba-umana",
          "aguobu-umumba",
          "aguobu-owa-1",
          "aguobu-owa-11",
          "awha",
          "imezi-owa-i",
          "imezi-owa-ii",
          "iwollo",
          "mgbagbu-owa-i",
          "mgbagbu-owa-iii",
          "mgbagbu-owa-ii",
          "obe-agu-umana",
          "obinofia",
          "oghe-i",
          "oghe-ii",
          "okpogho",
          "olo-amagu-umulokpa-i",
          "ulo-amagu-umulokpa-ii",
          "umana-ndiagu",
          "umumba-ndiumo"
        ]
      },
      {
        "lga": "igbo-etiti",
        "wards": [
          "aku-i",
          "aku-ii",
          "aku-iii",
          "aku-iv",
          "aku-v-idueme",
          "diogbe-umunko",
          "ejuoha-udeme",
          "ekwegbe-i",
          "ekwegbe-ii",
          "ikolo-ohebe",
          "ohaodo-i",
          "ohaodo-ii",
          "onyohor-ochima-idoha",
          "ozalla-i",
          "ozalla-ii",
          "ukehe-i",
          "ukehe-ii",
          "ukehe-iii",
          "ukehe-iv",
          "ukehe-v"
        ]
      },
      {
        "lga": "igbo-eze-north",
        "wards": [
          "essodo-1",
          "essodo-11",
          "essodo-111",
          "ette-1",
          "ette-11",
          "ette-central",
          "ezzodo",
          "umuitodo-i",
          "umuitodo-ii",
          "umuitodo-iii",
          "umuozzi-i",
          "umuozzi-ii",
          "umuozzi-iii",
          "umuozzi-iv",
          "umuozzi-ix",
          "umuozzi-v",
          "umuozzi-vi",
          "umuozzi-vii",
          "umuozzi-viii",
          "umuozzi-x"
        ]
      },
      {
        "lga": "igbo-eze-south",
        "wards": [
          "alor-agu",
          "amabo-hausa-yoruba",
          "echara",
          "ezema-ward",
          "iheaka-likki-akutara-ward",
          "iheaka-ugo-akohi-ward",
          "iheakpu-ajuona-ogbagu-ward",
          "iheakpu-ezzi-ngwu-ward",
          "itchi-uwani-i",
          "itchi-uwani-ii",
          "nkalagu-obukpa",
          "ovoko-ajuona-ward",
          "ovoko-umuelo-ovoko-agu-ward",
          "ovoko-umulolo-ward",
          "uhunowerre",
          "unadu"
        ]
      },
      {
        "lga": "isi-uzo",
        "wards": [
          "ehamufu-i",
          "ehamufu-ii",
          "ehamufu-iii",
          "ehamufu-iv",
          "ikem-i",
          "ikem-ii",
          "mbu-i",
          "mbu-ii",
          "neke-i",
          "neke-ii",
          "umualor"
        ]
      },
      {
        "lga": "nkanu-east",
        "wards": [
          "akpawfu-isienu-amangunze",
          "amagunze",
          "amankanu-ogbahu",
          "amechi-idodo-oruku",
          "ihuokpara",
          "mburubu",
          "nara-i",
          "nara-ii",
          "nkerefi-i",
          "nkerefi-ii",
          "nomeh",
          "owo",
          "ugbawka-i",
          "ugbawka-ii"
        ]
      },
      {
        "lga": "nkanu-west",
        "wards": [
          "agbani",
          "akegbe-ugwu-okwuo",
          "akpugo-ii",
          "akpugo-iii",
          "akpugo-iv",
          "akugbo-iv",
          "amodu",
          "amurri",
          "ibite-akegbe-ugwu",
          "ndiuno-uwani-akpugo-i",
          "obe",
          "obinagu-uwani-akpugo-i",
          "obuoffia",
          "ozalla",
          "umueze"
        ]
      },
      {
        "lga": "nsukka",
        "wards": [
          "agbemebe-umabor",
          "akalite",
          "akpa-ozzi",
          "alor-uno",
          "ede-nta",
          "ede-ukwu",
          "edem-ani",
          "eha-ndiagu",
          "eha-uno",
          "ejuona-uwani",
          "ibagwani-ibagwaga-okpaligbo",
          "ibeku",
          "ihe",
          "mkpunano",
          "nnu",
          "obimo-ikwoka",
          "obukpa",
          "ogbozalla-idi",
          "okpuje-okutu-anuka",
          "owerre-umuoyo"
        ]
      },
      {
        "lga": "oji-river",
        "wards": [
          "achiagu-i",
          "achiagu-ii",
          "achiagu-iii",
          "achiuno-i",
          "achiuno-ii",
          "achiuno-iii",
          "achiuno-iv",
          "akpugoeze",
          "awlaw",
          "inyi-i",
          "inyi-ii",
          "inyi-iii",
          "inyi-iv",
          "oji-river-i",
          "oji-river-ii",
          "oji-river-iii",
          "oji-river-iv",
          "ugwuoba-i",
          "ugwuoba-ii",
          "ugwuoba-iii"
        ]
      },
      {
        "lga": "udenu",
        "wards": [
          "amala",
          "ezimo",
          "imilike",
          "obollo-afor",
          "obollo-eke",
          "obollo-etiti",
          "ogbodu-aba",
          "orba-i",
          "orba-ii",
          "udunedem"
        ]
      },
      {
        "lga": "udi",
        "wards": [
          "abia",
          "abor",
          "affa-oghu-ikono",
          "akpa-kwume-nze",
          "amokwe",
          "awhum-ukana",
          "ebe",
          "egede-umuoka",
          "eke",
          "nachi",
          "ngwo-asa",
          "ngwo-uno",
          "nsude",
          "obinagu",
          "obioma",
          "okpatu",
          "udi-agbudu",
          "umuabi",
          "umuaga",
          "umulumgbe"
        ]
      },
      {
        "lga": "uzo-uwani",
        "wards": [
          "abbi",
          "adaba-nkume",
          "adani",
          "akpogu",
          "igga-asaba",
          "nimbo-i",
          "nimbo-ii",
          "nkpologu",
          "nrobo",
          "ogurugu",
          "ojo",
          "ugbene-i",
          "ugbene-ii",
          "ukpata",
          "umulokpa",
          "uvuru"
        ]
      }
    ]
  },
  {
    "state": "gombe",
    "lgas": [
      {
        "lga": "akko",
        "wards": [
          "akko",
          "garko",
          "kalshingi",
          "kashere",
          "kumo-central",
          "kumo-east",
          "kumo-north",
          "kumo-west",
          "pindiga",
          "tukulma",
          "tumu"
        ]
      },
      {
        "lga": "balanga",
        "wards": [
          "bambam",
          "bangu",
          "dadiya",
          "gelengu-balanga",
          "kindiyo",
          "kulani-degre-sikkam",
          "mwona",
          "nyuwar-jessu",
          "swa-ref-w-waja",
          "talasse-dong-reme"
        ]
      },
      {
        "lga": "billiri",
        "wards": [
          "baganje-north",
          "baganje-south",
          "bare",
          "billiri-north",
          "billiri-south",
          "kalmai",
          "tal",
          "tanglang",
          "todi",
          "tudu-kwaya"
        ]
      },
      {
        "lga": "dukku",
        "wards": [
          "gombe-abba",
          "hashidu",
          "jamari",
          "kunde",
          "lafiya",
          "malala",
          "waziri-north",
          "waziri-south-central",
          "wuro-tale",
          "zange",
          "zaune"
        ]
      },
      {
        "lga": "funakaye",
        "wards": [
          "ashaka-magaba",
          "bage",
          "bajoga-west",
          "bajoga-east",
          "bodor-tilde",
          "jillahi",
          "kupto",
          "ribadu",
          "tongo",
          "wawa-wakkulutu"
        ]
      },
      {
        "lga": "gombe",
        "wards": [
          "ajiya",
          "bajoga",
          "bolari-east",
          "bolari-west",
          "dawaki",
          "herwagana",
          "jeka-dafari",
          "kumbiya-kumbiya",
          "nasarawa",
          "pantami",
          "shamaki"
        ]
      },
      {
        "lga": "kaltungo",
        "wards": [
          "awak",
          "bule-kaltin",
          "kaltungo-east",
          "kaltungo-west",
          "kamo",
          "tula-yiri",
          "tula-baule",
          "tula-wange",
          "tungo",
          "ture"
        ]
      },
      {
        "lga": "kwami",
        "wards": [
          "bojude",
          "daban-fulani",
          "doho",
          "dukul",
          "gadam",
          "jurara",
          "komfulata",
          "kwami",
          "malam-sidi",
          "malleri"
        ]
      },
      {
        "lga": "nafada",
        "wards": [
          "barwo-nasarawo",
          "barwo-winde",
          "birin-bolewa",
          "birin-fulani-east",
          "birin-fulani-west",
          "gudukku",
          "jigawa",
          "nafada-central",
          "nafada-east",
          "nafada-west"
        ]
      },
      {
        "lga": "shongom",
        "wards": [
          "bangunji",
          "boh",
          "burak",
          "filiya",
          "gundale",
          "gwandum",
          "kulishin",
          "kushi",
          "lalaipido",
          "lapan"
        ]
      },
      {
        "lga": "yalmaltu-deba",
        "wards": [
          "deba",
          "difa-lubo-kinafa",
          "gwani-shinga-wade",
          "hinna",
          "jagali-north",
          "jagali-south",
          "kanawa-wajari",
          "kuri-lano-lambam",
          "kwadon-liji-kurba",
          "nono-kunwal-w-birdeka",
          "zambul-kwali"
        ]
      }
    ]
  },
  {
    "state": "imo",
    "lgas": [
      {
        "lga": "aboh-mbaise",
        "wards": [
          "amuzu",
          "enyiogugu",
          "ibeku",
          "lagwa",
          "lorji",
          "mbutu",
          "nguru-ahiato",
          "nguru-nweke",
          "nguru-nwenkwo",
          "umuhu",
          "uvuru-1",
          "uvuru-ii"
        ]
      },
      {
        "lga": "ahiazu-mbaise",
        "wards": [
          "amuzi-ihenworie",
          "mpam",
          "nnarambia",
          "obohia-ekwereazu",
          "ogbe",
          "ogbor-umueze",
          "okirika-nweke",
          "okirika-nwenkwo",
          "oparanadim",
          "oru-na-lude",
          "otulu-aguneze",
          "umunumo-umuchieze"
        ]
      },
      {
        "lga": "ehime-mbano",
        "wards": [
          "agbaja",
          "nsu-a-ikpe",
          "nsu-b-ihitte",
          "nzerem-ikpem",
          "umualumaku-umuihim",
          "umueze-i",
          "umueze-ii-umueleke",
          "umuezeala",
          "umukabia",
          "umunakanu",
          "umunumo"
        ]
      },
      {
        "lga": "ezinihitte-mbaise",
        "wards": [
          "amumara",
          "chokoneze-akpodim-ife",
          "eziudo",
          "ihitte",
          "itu",
          "oboama-umunama",
          "okpofe-ezeagbogu",
          "onicha-i",
          "onicha-ii",
          "onicha-iii",
          "onicha-iv",
          "udo-na-obizi"
        ]
      },
      {
        "lga": "ideato-north",
        "wards": [
          "akpulu",
          "akwu-owerre",
          "ezemazu-ozu",
          "isiokpo",
          "izuogu-i",
          "izuogu-ii",
          "ndi-iheme-arondizuogu",
          "ndimoko",
          "obodoukwu",
          "osina",
          "ozuakoki-umuago",
          "umuokwara-umuezeaga",
          "umuopia-umukegwu",
          "uzii-umualoma"
        ]
      },
      {
        "lga": "ideato-south",
        "wards": [
          "amanator-umueshi",
          "dikenafai",
          "isiekenesi-i",
          "isiekenesi-ii",
          "ntueke",
          "obiohia",
          "ogboko-i",
          "ogboko-ii",
          "ugbelle",
          "umuakam-umuago",
          "umuchima",
          "umuma-isiaku",
          "umuobom"
        ]
      },
      {
        "lga": "ihitte-uboma",
        "wards": [
          "abueke",
          "amainyi",
          "amakohia",
          "atonerim",
          "awuchinumo",
          "dimneze",
          "ikperejere",
          "okata",
          "umuezegwu",
          "umuihi"
        ]
      },
      {
        "lga": "ikeduru",
        "wards": [
          "akabo",
          "amaimo",
          "amakohia",
          "amatta",
          "atta-i",
          "atta-ii",
          "avuvu",
          "iho",
          "inyishi-umudim",
          "ngugo-ikembara",
          "ugirike-okwu-eziama",
          "uzoagba"
        ]
      },
      {
        "lga": "isiala-mbano",
        "wards": [
          "amaraku",
          "amauzari",
          "ibeme",
          "obollo",
          "ogbor",
          "osu-achara",
          "osu-owerre-i",
          "osu-owerre-ii",
          "osuama-anara",
          "ugiri-oka",
          "umunkwo",
          "umuozu"
        ]
      },
      {
        "lga": "isu",
        "wards": [
          "amandugba-i",
          "amandugba-ii",
          "amurie-omanze-i",
          "amurie-omanze-ii",
          "ekwe-i",
          "ekwe-ii",
          "isu-njaba-iii",
          "isu-njaba-i",
          "isu-njaba-ii",
          "umundugba-i",
          "umundugba-ii"
        ]
      },
      {
        "lga": "mbaitoli",
        "wards": [
          "afara-eziama",
          "amaike-mbieri",
          "ezinihitie-mbieri",
          "ifakala",
          "ogbaku",
          "ogwa-i",
          "ogwa-ii",
          "orodo-a",
          "orodo-b",
          "ubomiri",
          "umunoha-azara",
          "umunwoha-mbieri-umuawu"
        ]
      },
      {
        "lga": "ngor-okpala",
        "wards": [
          "amala-alulu-oburu-obokwe-ntu",
          "elelem-obike",
          "eziama-okpala",
          "imerienwe",
          "logara-umuohiagu",
          "ngor-ihitte-umukabia",
          "nguru-umuowa",
          "obiangwu",
          "ohekelem-nnorie",
          "ozuzu",
          "umuhu"
        ]
      },
      {
        "lga": "njaba",
        "wards": [
          "amucha-i",
          "amucha-ii",
          "atta-i",
          "atta-ii",
          "atta-iii",
          "nkume",
          "okwudor",
          "umuaka-i",
          "umuaka-ii",
          "umuaka-iii",
          "umuaka-iv"
        ]
      },
      {
        "lga": "nkwerre",
        "wards": [
          "amaokpara",
          "eziama-obaire",
          "nkwerre-iv-umunubo-umunachi",
          "nkwerre-v",
          "nnanano-nkwerre-ii",
          "onusa",
          "owerre-nkworji-i",
          "owerre-nkworji-ii",
          "umudi-umuwala",
          "umukor-nkwerre-iii"
        ]
      },
      {
        "lga": "nwangele",
        "wards": [
          "abajah-ward-i",
          "abajah-ward-ii",
          "abba-ward",
          "amaju-community-ward-amaigbo-iii",
          "amamnaisi-amaigbo-iv",
          "amano-umudurumba-ward-amaigbo-i",
          "dim-na-nume",
          "ezeobolo-ofeahia-duruoha-umukabia-amaigbo-ward-v",
          "kara-na-orlu",
          "umuanu-community-ward-amaigbo-ii",
          "umuozu-ward"
        ]
      },
      {
        "lga": "obowo",
        "wards": [
          "alike",
          "amanze-umungwa",
          "amuzi",
          "avutu",
          "ehume",
          "odenkume-umuosochie",
          "okenalogho",
          "okwuohia",
          "umuariam-achara",
          "umunachi"
        ]
      },
      {
        "lga": "oguta",
        "wards": [
          "awa",
          "egwe-egbuoma",
          "izombe",
          "mbala-uba",
          "ndeuloukwu-umuowere",
          "obudi-aro",
          "oguta-a",
          "oguta-b",
          "oru",
          "ossemotor-enuigbo",
          "uwaorie"
        ]
      },
      {
        "lga": "ohaji-egbema",
        "wards": [
          "assa-obile",
          "awara-ikwerede",
          "egbema-a",
          "egbema-b",
          "egbema-c",
          "egbema-d",
          "egbema-e",
          "ekwuato",
          "obitti-mgbishi",
          "ohoba",
          "umuagwo",
          "umuapu"
        ]
      },
      {
        "lga": "okigwe",
        "wards": [
          "agbobu",
          "aku",
          "amuro",
          "ezinachi",
          "ihube",
          "ndimoko-ofeimo-ibinta-okanachi-umuowa-ibu",
          "ogii",
          "okigwe-i",
          "okigwe-ii",
          "umualumuoke",
          "umulolo"
        ]
      },
      {
        "lga": "onuimo",
        "wards": [
          "aboh-okohia",
          "ezelu",
          "eziama",
          "ofeahia-umuanumeze",
          "okwelle-i",
          "okwelle-ii",
          "owerre-okwe",
          "ozimo-umuneze",
          "umucheke",
          "umuna"
        ]
      },
      {
        "lga": "orlu",
        "wards": [
          "amaifeke",
          "ebenese-umueze-nnachi-ihioma",
          "eziachi-amike",
          "ihite-owerre",
          "ogberuru-obibi",
          "ohafor-okporo-umutanze",
          "okaeke-okporo",
          "okwua-bala-ihioma",
          "orlu-mgbee-orlu-govt-station",
          "owerri-ebeiri",
          "umudioka",
          "umuna",
          "umuzike-umuowa"
        ]
      },
      {
        "lga": "orsu",
        "wards": [
          "amaruru",
          "assah-ubiri-elem",
          "ebenator",
          "eziawa",
          "ihitenansa",
          "okwuamaraihie-i",
          "okwuamaraihie-ii",
          "okwuetiti",
          "okwufuruaku",
          "orsu-ihiteukwa",
          "umuhu-okabia"
        ]
      },
      {
        "lga": "oru-east",
        "wards": [
          "akata",
          "akuma",
          "amagu",
          "amiri-i",
          "amiri-ii",
          "awo-omamma-i",
          "awo-omamma-ii",
          "awo-omamma-iii",
          "awo-omamma-iv",
          "omuma"
        ]
      },
      {
        "lga": "oru-west",
        "wards": [
          "aji",
          "amafuo",
          "ibiaso-egbe",
          "mgbidi-i",
          "mgbidi-ii",
          "nempi-elem",
          "ohakpu",
          "otulu",
          "ozara",
          "ubulu"
        ]
      },
      {
        "lga": "owerri-north",
        "wards": [
          "agbala-obube-ulakwo",
          "awaka-ihitte-ogada",
          "egbu",
          "emekuku-i",
          "emekuku-ii",
          "emii",
          "ihitta-oha",
          "naze",
          "obibi-uratta-i",
          "obibi-uratta-ii",
          "obibiezena",
          "orji"
        ]
      },
      {
        "lga": "owerri-urban",
        "wards": [
          "aladinma-i",
          "aladinma-ii",
          "azuzi-i",
          "azuzi-ii",
          "azuzi-iii",
          "azuzi-iv",
          "gra",
          "ikenegbu-i",
          "ikenegbu-ii",
          "new-owerri-i",
          "new-owerri-ii"
        ]
      },
      {
        "lga": "owerri-west",
        "wards": [
          "amakohia-ubi-ndegwu-ohii",
          "avu-oforola",
          "emeabiam-okolochi",
          "eziobodo",
          "ihiagwa",
          "irete-orogwe",
          "nekede",
          "obinze",
          "okuku",
          "umuguma"
        ]
      }
    ]
  },
  {
    "state": "jigawa",
    "lgas": [
      {
        "lga": "auyo",
        "wards": [
          "auyakayi",
          "auyo",
          "ayama",
          "ayan",
          "gamafoi",
          "gamsarka",
          "gatafa",
          "kafur",
          "tsidir",
          "unik"
        ]
      },
      {
        "lga": "babura",
        "wards": [
          "babura",
          "batali",
          "dorawa",
          "garu",
          "gasakoli",
          "insharuwa",
          "jigawa",
          "kanya",
          "kuzunzumi",
          "kyambo",
          "takwasa"
        ]
      },
      {
        "lga": "birnin-kudu",
        "wards": [
          "birnin-kudu",
          "kangire",
          "kantoga",
          "kiyako",
          "kwangwara",
          "lafiya",
          "sundimina",
          "surko",
          "unguwar-ya",
          "wurno",
          "yalwan-damai"
        ]
      },
      {
        "lga": "birniwa",
        "wards": [
          "batu",
          "birniwa",
          "dangwaleri",
          "diginsa",
          "fagi",
          "kachallari",
          "karanka",
          "kazura",
          "machinamari",
          "matamu",
          "nguwa"
        ]
      },
      {
        "lga": "buji",
        "wards": [
          "ahoto",
          "buji",
          "churbun",
          "falageri",
          "gantsa",
          "k-lelen-kudu",
          "kawaya",
          "kukuma",
          "madabe",
          "y-tukur"
        ]
      },
      {
        "lga": "dutse",
        "wards": [
          "abaya",
          "chamo",
          "dundubus",
          "duru",
          "jigawar-tsada",
          "kachi",
          "karnaya",
          "kudai",
          "limawa",
          "madobi",
          "sakwaya"
        ]
      },
      {
        "lga": "gagarawa",
        "wards": [
          "gagarawa-gari",
          "gagarawa-tasha",
          "garin-chiroma",
          "kore-balatu",
          "madaka",
          "maiaduwa",
          "maikilili",
          "medu",
          "yalawa",
          "zarada"
        ]
      },
      {
        "lga": "garki",
        "wards": [
          "buduru",
          "doko",
          "garki",
          "gwarzon-garki",
          "jirma",
          "kanya",
          "kargo",
          "kore",
          "muku",
          "rafin-marke",
          "siyori"
        ]
      },
      {
        "lga": "gumel",
        "wards": [
          "baikarya",
          "danama",
          "dantanoma",
          "galagamma",
          "garin-alhaji-barka",
          "garin-gambo",
          "gusau",
          "hammado",
          "kofar-arewa",
          "kofar-yamma",
          "zango"
        ]
      },
      {
        "lga": "guri",
        "wards": [
          "abunabo",
          "adiyani",
          "dawa",
          "garbagal",
          "guri",
          "kadira",
          "lafiya",
          "margadu",
          "matara-baba",
          "musari"
        ]
      },
      {
        "lga": "gwaram",
        "wards": [
          "basirka",
          "dingaya",
          "fagam",
          "farin-dutse",
          "gwaram-tsohuwa",
          "kila",
          "kwandiko",
          "maruta",
          "sara",
          "tsangarwa",
          "zandan-nagogo"
        ]
      },
      {
        "lga": "gwiwa",
        "wards": [
          "buntusu",
          "dabi",
          "darina",
          "f-yamma",
          "guntai",
          "gwiwa",
          "korayel",
          "rorau",
          "shafe",
          "yola",
          "zaumar-sainawa"
        ]
      },
      {
        "lga": "hadejia",
        "wards": [
          "atafi",
          "dubantu",
          "gagulmari",
          "kasuwar-kofa",
          "kasuwar-kuda",
          "majema",
          "matsaro",
          "rumfa",
          "sabon-garu",
          "yankoli",
          "yayari"
        ]
      },
      {
        "lga": "jahun",
        "wards": [
          "aujara",
          "gangawa",
          "gauza-tazara",
          "gunka",
          "harbo-sabuwa",
          "harbo-tsohuwa",
          "idanuna",
          "jabarna",
          "jahun",
          "kale",
          "kanwa"
        ]
      },
      {
        "lga": "kafin-hausa",
        "wards": [
          "balangu",
          "dumadumin-toka",
          "gafaya",
          "jabo",
          "kafin-hausa",
          "kazalewa",
          "majawa",
          "mezan",
          "ruba",
          "sarawa",
          "zago"
        ]
      },
      {
        "lga": "kaugama",
        "wards": [
          "arbus",
          "askandu",
          "dabuwaran",
          "dakaiyawa",
          "hadin",
          "ja-e",
          "jarkasa",
          "kaugama",
          "marke",
          "unguwar-jibrin",
          "yalo"
        ]
      },
      {
        "lga": "kazaure",
        "wards": [
          "ba-auzini",
          "daba",
          "dabaza",
          "dandi",
          "gada",
          "kanti",
          "maradawa",
          "sabaru",
          "unguwar-arewa",
          "unguwar-gabas",
          "unguwar-yamma"
        ]
      },
      {
        "lga": "kirika-samma",
        "wards": [
          "baturiya",
          "bulunchai",
          "doleri",
          "fandum",
          "gayin",
          "kirika-samma",
          "madachi",
          "marma",
          "tarabu",
          "tsheguwa"
        ]
      },
      {
        "lga": "kiyawa",
        "wards": [
          "abalago",
          "andaza",
          "fake",
          "garko",
          "guruduba",
          "katanga",
          "katuka",
          "kiyawa",
          "kwanda",
          "maje",
          "tsurma"
        ]
      },
      {
        "lga": "maigatari",
        "wards": [
          "balarabe",
          "dankumbo",
          "fulata",
          "galadi",
          "jajeri",
          "kukayasku",
          "madana",
          "maigatari-arewa",
          "maigatari-kudu",
          "matoya",
          "turbus"
        ]
      },
      {
        "lga": "malam-madori",
        "wards": [
          "arki",
          "dunari",
          "fateka-akurya",
          "garin-gabas",
          "maira-kumi-bara-musa",
          "maka-ddari",
          "malam-madori",
          "shaiya",
          "tagwaro",
          "tashena",
          "tonikutara"
        ]
      },
      {
        "lga": "miga",
        "wards": [
          "dangyatin",
          "hantsu",
          "harbo",
          "koya",
          "miga",
          "sabon-gari-takanebu",
          "sansani",
          "tsakuwawa",
          "yanduna",
          "zareku"
        ]
      },
      {
        "lga": "ringim",
        "wards": [
          "chai-chai",
          "dabi",
          "kafin-babushe",
          "karshi",
          "kyarama",
          "ringim",
          "sankara",
          "sintilmawa",
          "tofa",
          "yandutse"
        ]
      },
      {
        "lga": "roni",
        "wards": [
          "amaryawa",
          "baragumi",
          "dansure",
          "fara",
          "gora",
          "kwaita",
          "roni",
          "sankau",
          "tunas",
          "yanzaki",
          "zugai"
        ]
      },
      {
        "lga": "sule-tankarkar",
        "wards": [
          "albasu",
          "amanga",
          "dangwanki",
          "danladi",
          "danzomo",
          "jeke",
          "shabaru",
          "sule-tankarkar",
          "takatsaba",
          "yandamo"
        ]
      },
      {
        "lga": "taura",
        "wards": [
          "ajaura",
          "chakwaikwaiwa",
          "chukuto",
          "gujungu",
          "kiri",
          "kwalam",
          "maje",
          "majiya",
          "s-garin-yaya",
          "taura"
        ]
      },
      {
        "lga": "yankwashi",
        "wards": [
          "achilafiya",
          "belas",
          "dawan-gawo",
          "gurjiya",
          "gwarta",
          "karkarna",
          "kuda",
          "ringim",
          "yankwashi",
          "zunbumba"
        ]
      }
    ]
  },
  {
    "state": "kaduna",
    "lgas": [
      {
        "lga": "birnin-gwari",
        "wards": [
          "dogon-dawa",
          "gayam",
          "kakangi",
          "kazage",
          "kutemesi",
          "kuyelo",
          "magajin-gari-i",
          "magajin-gari-ii",
          "magajin-gari-iii",
          "randagi",
          "tabanni"
        ]
      },
      {
        "lga": "chikun",
        "wards": [
          "chikun",
          "gwagwada",
          "kakau",
          "kujama",
          "kunai",
          "kuriga",
          "narayi",
          "nasarawa",
          "rido",
          "s-ggarin-arewa-tirkaniya",
          "sabon-tasha",
          "ung-yelwa"
        ]
      },
      {
        "lga": "giwa",
        "wards": [
          "danmahawayi",
          "galadimawa",
          "gangara",
          "giwa",
          "idasu",
          "kadage",
          "kakangi",
          "kidandan",
          "pan-hauya",
          "shika",
          "yakawada"
        ]
      },
      {
        "lga": "igabi",
        "wards": [
          "afaka",
          "birnin-yero",
          "gadan-gayan",
          "gwaraji",
          "igabi",
          "kerawa",
          "kwarau",
          "rigachikun",
          "rigasa",
          "sabon-birnin-daji",
          "turunku",
          "zangon-aya"
        ]
      },
      {
        "lga": "ikara",
        "wards": [
          "auchan",
          "ikara",
          "janfala",
          "k-kogi",
          "kuya",
          "paki",
          "pala",
          "rumi",
          "saulawa",
          "saya-saya"
        ]
      },
      {
        "lga": "jaba",
        "wards": [
          "chori",
          "daddu",
          "dura-bitaro",
          "fada",
          "fai",
          "nduyah",
          "nok",
          "sabchem",
          "sabzuro",
          "sambam"
        ]
      },
      {
        "lga": "jema'a",
        "wards": [
          "asso",
          "atuku",
          "bedde",
          "gidan-waya",
          "godogodo",
          "jagindi",
          "kafanchan-a",
          "kafanchan-b",
          "kagoma",
          "kaninkon",
          "maigizo-a",
          "takau-b"
        ]
      },
      {
        "lga": "kachia",
        "wards": [
          "agunu",
          "ankwa",
          "awon",
          "bishini",
          "doka",
          "gidan-tagwai",
          "gumel",
          "kachia-urban",
          "katari",
          "kurmin-musa",
          "kwaturu",
          "sabon-sarki"
        ]
      },
      {
        "lga": "kaduna-north",
        "wards": [
          "badarawa",
          "gabasawa",
          "gaji",
          "hayin-banki",
          "kabala-costain-doki",
          "kawo",
          "maiburji",
          "shaba",
          "unguwan-dosa",
          "unguwan-liman",
          "unguwan-sarki",
          "unguwan-shanu"
        ]
      },
      {
        "lga": "kaduna-south",
        "wards": [
          "badiko",
          "barnawa",
          "kakuri-gwari",
          "kakuri-hausa",
          "makera",
          "sabon-gari-north",
          "sabon-gari-south",
          "television",
          "tudun-nuwapa",
          "tudun-wada-north",
          "tudun-wada-south",
          "tudun-wada-west",
          "ung-sanusi"
        ]
      },
      {
        "lga": "kagarko",
        "wards": [
          "aribi",
          "iddah",
          "jere-north",
          "jere-south",
          "kagarko-north",
          "kagarko-south",
          "katugal",
          "kukui",
          "kurmin-jibrin",
          "kushe"
        ]
      },
      {
        "lga": "kajuru",
        "wards": [
          "afogo",
          "buda",
          "idon",
          "kajuru",
          "kallah",
          "kasuwan-magani",
          "kufana",
          "maro",
          "rimau",
          "tantatu"
        ]
      },
      {
        "lga": "kaura",
        "wards": [
          "agban",
          "bondon",
          "fada",
          "kadarko",
          "kaura",
          "kpak",
          "kukum",
          "mallagum",
          "manchok",
          "zankan"
        ]
      },
      {
        "lga": "kauru",
        "wards": [
          "badurum-sama",
          "bital",
          "damakasuwa",
          "dawaki",
          "geshere",
          "kamaru",
          "kauru-east",
          "kauru-west",
          "kwassam",
          "makami",
          "pari"
        ]
      },
      {
        "lga": "kubau",
        "wards": [
          "anchau",
          "damau",
          "dutsen-wai",
          "haskiya",
          "kargi",
          "karreh",
          "kubau",
          "mah",
          "pambegua",
          "zabi",
          "zuntu"
        ]
      },
      {
        "lga": "kudan",
        "wards": [
          "doka",
          "garu",
          "hunkuyi",
          "kauran-wali-north",
          "kauran-wali-south",
          "kudan",
          "likoro",
          "sabon-gari-hunkuyi",
          "taban-sani",
          "zabi"
        ]
      },
      {
        "lga": "lere",
        "wards": [
          "abadawa",
          "dan-alhaji",
          "garu",
          "gure-kahugu",
          "kayarda",
          "lazuru",
          "lere",
          "ramin-kura",
          "sabon-birnin",
          "saminaka",
          "yar-kasuwa"
        ]
      },
      {
        "lga": "makarfi",
        "wards": [
          "dandamisa",
          "danguziri",
          "gazara",
          "gimi",
          "gubuchi",
          "gwanki",
          "makarfi",
          "mayere",
          "nassarwan-doya",
          "tudun-wada"
        ]
      },
      {
        "lga": "sabon-gari",
        "wards": [
          "basawa",
          "bomo",
          "chikaji",
          "dogarawa",
          "hanwa",
          "jama-a",
          "jushin-waje",
          "muchia",
          "samaru",
          "unguwan-gabas",
          "zabi"
        ]
      },
      {
        "lga": "sanga",
        "wards": [
          "aboro",
          "arak",
          "ayu",
          "bokana",
          "fadan-karshi",
          "gwantu",
          "nandu",
          "ninzam-north",
          "ninzam-south",
          "ninzam-west",
          "wasa-station"
        ]
      },
      {
        "lga": "soba",
        "wards": [
          "dan-wata",
          "gamagira",
          "garun-gwanki",
          "gimba",
          "kinkiba",
          "kwassallo",
          "maigana",
          "rahama",
          "richifa",
          "soba",
          "turawa"
        ]
      },
      {
        "lga": "zangon-kataf",
        "wards": [
          "gidan-jatau",
          "gora",
          "kamantan",
          "kamuru-ikulu-north",
          "madakiya",
          "unguwar-gaiya",
          "unguwar-rimi",
          "zaman-dabo",
          "zango-urban",
          "zonkwa",
          "zonzon"
        ]
      },
      {
        "lga": "zaria",
        "wards": [
          "dambo",
          "dutsen-abba",
          "gyallesu",
          "kaura",
          "kufena",
          "kwarbai-a",
          "kwarbai-b",
          "limancin-kona",
          "tudun-wada",
          "tukur-tukur",
          "ung-fatika",
          "ung-juma",
          "wucicciri"
        ]
      }
    ]
  },
  {
    "state": "kano",
    "lgas": [
      {
        "lga": "ajingi",
        "wards": [
          "ajingi",
          "balare",
          "chula",
          "dabin-kanawa",
          "dundun",
          "gafasa",
          "gurduba",
          "kunkurawa",
          "toranke",
          "ungawar-bai"
        ]
      },
      {
        "lga": "albasu",
        "wards": [
          "albasu-central",
          "bataiya",
          "chamarana",
          "daho",
          "fanda",
          "faragai",
          "gagarame",
          "hungu",
          "saya-saya",
          "tsangaya"
        ]
      },
      {
        "lga": "bagwai",
        "wards": [
          "bagwai",
          "dangada",
          "gadanya",
          "gogori",
          "kiyawa",
          "kwajali",
          "rimin-dako",
          "romo",
          "sare-sare",
          "wuro-bagga"
        ]
      },
      {
        "lga": "bebeji",
        "wards": [
          "anadariya",
          "baguda",
          "bebeji",
          "damau",
          "durmawa",
          "gargai",
          "gwarmai",
          "kofa",
          "kuki",
          "rahama",
          "ranka",
          "rantan",
          "tariwa",
          "wak"
        ]
      },
      {
        "lga": "bichi",
        "wards": [
          "badume",
          "bichi",
          "danzabuwa",
          "fagolo",
          "kaukau",
          "kwamarawa",
          "kyalli",
          "muntsira",
          "saye",
          "waire",
          "yallami"
        ]
      },
      {
        "lga": "bunkure",
        "wards": [
          "barkum",
          "bono",
          "bunkure",
          "chirin",
          "gafan",
          "gurjiya",
          "gwamma",
          "kulluwa",
          "kumurya",
          "sanda"
        ]
      },
      {
        "lga": "dala",
        "wards": [
          "adakawa",
          "bakin-ruwa",
          "dala",
          "dogon-nama",
          "gobirawa",
          "gwammaja",
          "kabuwaya",
          "kantudu",
          "kofar-mazugal",
          "kofar-ruwa",
          "madigawa",
          "yalwa"
        ]
      },
      {
        "lga": "danbata",
        "wards": [
          "ajumawa",
          "danbatta-east",
          "danbatta-west",
          "fagwalawa",
          "goron-maje",
          "gwanda",
          "gwarabjawa",
          "kore",
          "saidawa",
          "sansan"
        ]
      },
      {
        "lga": "dawaki-kudu",
        "wards": [
          "dabar-kwari",
          "danbagiwa",
          "dawaki",
          "dawakiji",
          "dosan",
          "gano",
          "gurjiya",
          "jido",
          "tamburawa",
          "tsakuwa",
          "unguwar-duniya",
          "yanbarau",
          "yankatsari",
          "yargaya",
          "zogarawa"
        ]
      },
      {
        "lga": "dawaki-tofa",
        "wards": [
          "dan-guguwa",
          "dawaki-east",
          "dawaki-west",
          "dawanau",
          "ganduje",
          "gargari",
          "jalli",
          "kwa",
          "marke",
          "tattarawa",
          "tumfafi"
        ]
      },
      {
        "lga": "doguwa",
        "wards": [
          "dariya",
          "dogon-kawo",
          "duguwa",
          "falgore",
          "maraku",
          "ragada",
          "ririwai",
          "tagwaye",
          "unguwar-natsohuwa",
          "zainabi"
        ]
      },
      {
        "lga": "fagge",
        "wards": [
          "fagge-a",
          "fagge-b",
          "fagge-c",
          "fagge-d",
          "fagge-e",
          "kwachiri",
          "rijiyar-lemo",
          "sabongari-east",
          "sabongari-west",
          "yammata"
        ]
      },
      {
        "lga": "gabasawa",
        "wards": [
          "gabasawa",
          "garun-danga",
          "joda",
          "karmaki",
          "mekiya",
          "tarauni",
          "yantar-arewwa",
          "yautar-kudu",
          "yumbu",
          "zakirai",
          "zugachi"
        ]
      },
      {
        "lga": "garko",
        "wards": [
          "dal",
          "garin-ali",
          "garko",
          "gurjiya",
          "kafin-malamai",
          "katumari",
          "kwas",
          "raba",
          "sarina",
          "zakarawa"
        ]
      },
      {
        "lga": "garun-malam",
        "wards": [
          "chiromawa",
          "dorawar-sallau",
          "fankurun",
          "garun-babba",
          "garun-malam",
          "jobawa",
          "kadawa",
          "makwaro",
          "yad-akwari",
          "yalwan-yadakwari"
        ]
      },
      {
        "lga": "gaya",
        "wards": [
          "balan",
          "gamarya",
          "gamoji",
          "gaya-arewa",
          "gaya-kudu",
          "kademi",
          "kazurawa",
          "maimakawa",
          "shagogo",
          "wudilawa"
        ]
      },
      {
        "lga": "gezawa",
        "wards": [
          "babawa",
          "gawo",
          "gezawa",
          "jogana",
          "ketawa",
          "mesar-tudu",
          "sararin-gezawa",
          "tsamiya-babba",
          "tumbau",
          "wangara",
          "zango"
        ]
      },
      {
        "lga": "gwale",
        "wards": [
          "dandago",
          "diso",
          "dorayi",
          "galadanchi",
          "goron-dutse",
          "gwale",
          "gyaranya",
          "kabuga",
          "mandawari",
          "sani-mai-magge"
        ]
      },
      {
        "lga": "gwarzo",
        "wards": [
          "getso",
          "gwarzo",
          "jama-a",
          "kara",
          "kutama",
          "lakwaya",
          "madadi",
          "mainika",
          "sabon-birni",
          "unguwar-tudu"
        ]
      },
      {
        "lga": "kabo",
        "wards": [
          "dugabau",
          "durun",
          "gammo",
          "garo",
          "godiya",
          "gude",
          "hauwade",
          "kabo",
          "kanwa",
          "masanawa"
        ]
      },
      {
        "lga": "kano-municipal",
        "wards": [
          "chedi",
          "dan-agundi",
          "gandun-albasa",
          "jakara",
          "kankarofi",
          "shahuchi",
          "sharada",
          "sheshe",
          "tudun-nufawa",
          "tudun-wazirchi",
          "yakasai",
          "zaitawa",
          "zango"
        ]
      },
      {
        "lga": "karaye",
        "wards": [
          "daura",
          "kafin-dafga",
          "karaye",
          "kurugu",
          "kwanyawa",
          "tudun-kaya",
          "turawa",
          "unguwar-hajji",
          "yammedi",
          "yola"
        ]
      },
      {
        "lga": "kibiya",
        "wards": [
          "durba",
          "fammar",
          "fassi",
          "kadigawa",
          "kahu",
          "kibiya-i",
          "kibiya-ii",
          "nariya",
          "tarai",
          "unguwar-gai"
        ]
      },
      {
        "lga": "kiru",
        "wards": [
          "ba-awa",
          "badafi",
          "bargoni",
          "bauda",
          "dangora",
          "dansohiya",
          "dashi",
          "galadimawa",
          "kiru",
          "kogo",
          "maraku",
          "tsaudawa",
          "yako",
          "yalwa",
          "zuwo"
        ]
      },
      {
        "lga": "kumbotso",
        "wards": [
          "challawa",
          "chiranchi",
          "danbare",
          "danmaliki",
          "guringawa",
          "kumbotso",
          "kureken-sani",
          "mariri",
          "na-ibawa",
          "panshekara",
          "unguwar-rimi"
        ]
      },
      {
        "lga": "kunchi",
        "wards": [
          "bumai",
          "garin-sheme",
          "gwarmai",
          "kasuwar-kuka",
          "kunchi",
          "matan-fada",
          "ridawa",
          "shamakawa",
          "shuwaki",
          "yandadi"
        ]
      },
      {
        "lga": "kura",
        "wards": [
          "dalili",
          "dan-hassan",
          "dukawa",
          "gundutse",
          "karfi",
          "kosawa",
          "kura",
          "kurunsumau",
          "rigar-duka",
          "tanawa"
        ]
      },
      {
        "lga": "madobi",
        "wards": [
          "burji",
          "cinkoso",
          "galinja",
          "gora",
          "kafin-agur",
          "kanwa",
          "kaura-mata",
          "kubaraci",
          "kwankwaso",
          "madobi",
          "rikadawa",
          "yakun"
        ]
      },
      {
        "lga": "makoda",
        "wards": [
          "babbar-riga",
          "durma",
          "jibga",
          "kadandani",
          "koguna",
          "koren-tatso",
          "maitsidau",
          "makoda",
          "satame",
          "tangaji",
          "wailare"
        ]
      },
      {
        "lga": "minjibir",
        "wards": [
          "azore",
          "gandurwawa",
          "kantama",
          "kunya",
          "kuru",
          "kwarkiya",
          "minjibir",
          "sarbi",
          "tsakiya",
          "tsakuwa",
          "wasai"
        ]
      },
      {
        "lga": "nasarawa",
        "wards": [
          "dakata",
          "gama",
          "gawuna",
          "giginyu",
          "gwagwarwa",
          "hotoro-north",
          "hotoro-south",
          "kaura-goje",
          "kawaji",
          "tudun-murtala",
          "tudun-wada"
        ]
      },
      {
        "lga": "rano",
        "wards": [
          "dawaki",
          "lausu",
          "madachi",
          "rano",
          "rurum-sabon-gari",
          "rurum-tsohon-gari",
          "saji",
          "yalwa",
          "zinyau",
          "zurgu"
        ]
      },
      {
        "lga": "rimin-gado",
        "wards": [
          "butu-butu",
          "dawaki-gulu",
          "doka-dawa",
          "dugurawa",
          "gulu",
          "jili",
          "karofin-yashi",
          "rimin-gado",
          "sakaratsa",
          "tamawa",
          "yalwan-danziyal",
          "zango-dan-abdu"
        ]
      },
      {
        "lga": "rogo",
        "wards": [
          "beli",
          "falgore",
          "fulatan",
          "gwangwan",
          "jajaye",
          "rogo-ruma",
          "rogo-sabon-gari",
          "ruwan-bago",
          "zarewa",
          "zoza"
        ]
      },
      {
        "lga": "shanono",
        "wards": [
          "alajawa",
          "dutsen-bakoshi",
          "faruruwa",
          "goron-dutse",
          "kadamu",
          "kokiya",
          "leni",
          "shakogi",
          "shanono",
          "tsaure"
        ]
      },
      {
        "lga": "sumaila",
        "wards": [
          "gala",
          "gani",
          "garfa",
          "gediya",
          "kanawa",
          "magami",
          "masu",
          "rimi",
          "rumo",
          "sitti",
          "sumaila"
        ]
      },
      {
        "lga": "takai",
        "wards": [
          "bagwaro",
          "durbunde",
          "fajewa",
          "falali",
          "faruruwa",
          "kachako",
          "karfi",
          "kuka",
          "takai",
          "zuga"
        ]
      },
      {
        "lga": "tarauni",
        "wards": [
          "babban-giji",
          "darmanawa",
          "daurawa",
          "gyadi-gyadi-arewa",
          "gyadi-gyadi-kudu",
          "hotoro-nnpc",
          "kauyen-alu",
          "tarauni",
          "unguwa-uku",
          "unguwar-gano"
        ]
      },
      {
        "lga": "tofa",
        "wards": [
          "dindere",
          "doka",
          "gajida",
          "ginsawa",
          "janguza",
          "jauben-kudu",
          "kwami",
          "lambu",
          "langel",
          "tofa",
          "unguwar-rimi",
          "wangara",
          "yalwa-karama",
          "yanoko",
          "yarimawa"
        ]
      },
      {
        "lga": "tsanyawa",
        "wards": [
          "daddarawa",
          "dunbulun",
          "gozaki",
          "gurun",
          "kabagiwa",
          "tatsan",
          "tsanyawa",
          "yanganau",
          "yankamaye",
          "zarogi"
        ]
      },
      {
        "lga": "tudun-wada",
        "wards": [
          "baburi",
          "burumburum",
          "dalawa",
          "jandutse",
          "jita",
          "karefa",
          "nata-ala",
          "sabon-gari",
          "shuwaki",
          "tsohogari",
          "yaryasa"
        ]
      },
      {
        "lga": "ungogo",
        "wards": [
          "bachirawa",
          "gayawa",
          "kadawa",
          "karo",
          "panisau",
          "rangaza",
          "rijiyar-zaki",
          "tudun-fulani",
          "ungogo",
          "yadakunya",
          "zango"
        ]
      },
      {
        "lga": "warawa",
        "wards": [
          "amarawa",
          "danlasan",
          "garin-dau",
          "gogel",
          "imawa",
          "j-galadima",
          "jemagu",
          "jigawa",
          "katarkawa",
          "madari-mata",
          "tamburawar-gabas",
          "tangar",
          "warawa",
          "yan-dalla",
          "yangizo"
        ]
      },
      {
        "lga": "wudil",
        "wards": [
          "achika",
          "dagumawa",
          "dankaza",
          "darki",
          "indabo",
          "kausani",
          "lajawa",
          "sabon-gari",
          "utai",
          "wudil"
        ]
      }
    ]
  },
  {
    "state": "katsina",
    "lgas": [
      {
        "lga": "bakori",
        "wards": [
          "bakori-a",
          "bakori-b",
          "barde-kwantakwaran",
          "dawan-musa",
          "guga",
          "jargaba",
          "kabomo",
          "kakumi",
          "kandarawa",
          "kurami-yankwani",
          "tsiga"
        ]
      },
      {
        "lga": "batagarawa",
        "wards": [
          "ajiwa",
          "bakiyawa",
          "barawa",
          "batagarawa-a",
          "batagarawa-b",
          "dandagoro",
          "jino",
          "kayauki",
          "tsanni",
          "yargamji"
        ]
      },
      {
        "lga": "batsari",
        "wards": [
          "abadau-kagara",
          "batsari",
          "dan-alh-yangaiya",
          "darini-magaji-abu",
          "kandawa",
          "karare",
          "madogara",
          "manawa",
          "ruma",
          "wagini",
          "yauyau-mallamawa"
        ]
      },
      {
        "lga": "baure",
        "wards": [
          "agala",
          "babban-mutum",
          "baure",
          "garki",
          "hui",
          "kagara-faski",
          "mai-bara",
          "muduri",
          "taramnawa-bare",
          "unguwar-rai",
          "yanduna",
          "yanmaulu"
        ]
      },
      {
        "lga": "bindawa",
        "wards": [
          "baure",
          "bindawa",
          "doro",
          "faru-dallaji",
          "gaiwa",
          "giremawa",
          "jibawa-r-bade",
          "kamri",
          "shibdawa",
          "tama-daye",
          "yangora"
        ]
      },
      {
        "lga": "charanchi",
        "wards": [
          "banye",
          "charanchi",
          "doka",
          "ganuwa",
          "koda",
          "kuraye",
          "majen-wayya",
          "radda",
          "safana",
          "tsakatsa"
        ]
      },
      {
        "lga": "dan-musa",
        "wards": [
          "dan-ali",
          "dan-alkima",
          "dan-musa-a",
          "dan-musa-b",
          "dandire-b",
          "dandire-a",
          "mai-dabino-a",
          "mai-dabino-b",
          "mara",
          "yan-tumaki-a",
          "yan-tumaki-b"
        ]
      },
      {
        "lga": "dandume",
        "wards": [
          "dandume-a",
          "dandume-b",
          "dantankari",
          "magaji-wando-a",
          "magaji-wando-b",
          "mahuta-a",
          "mahuta-b",
          "mahuta-c",
          "nasarawa",
          "tumburkai-a",
          "tumburkai-b"
        ]
      },
      {
        "lga": "danja",
        "wards": [
          "dabai",
          "danja-a",
          "danja-b",
          "jiba",
          "kahutu-a",
          "kahutu-b",
          "tandama",
          "tsangamawa",
          "yakaji-a",
          "yakaji-b"
        ]
      },
      {
        "lga": "daura",
        "wards": [
          "kusugu",
          "madobi-a",
          "madobi-b",
          "mazoji-a",
          "mazoji-b",
          "sabon-gari",
          "sarkin-yara-a",
          "sarkin-yara-b",
          "tudun-wada",
          "ubandawaki-a",
          "unbadawaki-b"
        ]
      },
      {
        "lga": "dutsi",
        "wards": [
          "dan-aunai",
          "dutsi-a",
          "dutsi-b",
          "kayawa",
          "ruwankaya-a",
          "ruwankaya-b",
          "sirika-a",
          "sirika-b",
          "yamel-a",
          "yamel-b"
        ]
      },
      {
        "lga": "dutsin-ma",
        "wards": [
          "bagagadi",
          "dabawa",
          "dutsin-ma-a",
          "dutsin-ma-b",
          "karofi-a",
          "karofi-b",
          "kuki-a",
          "kuki-b",
          "kutawa",
          "makera",
          "shema"
        ]
      },
      {
        "lga": "faskari",
        "wards": [
          "daudawa",
          "faskari",
          "maigora",
          "mairuwa",
          "ruwan-godiya",
          "sabonlayi-galadima",
          "sheme",
          "tafoki",
          "yankara",
          "yarmalamai"
        ]
      },
      {
        "lga": "funtua",
        "wards": [
          "dandutse",
          "dukke",
          "goya",
          "mai-gamji",
          "makera",
          "maska",
          "sabon-gari",
          "tudun-iya",
          "ung-ibrahim",
          "unguwar-musa",
          "unguwar-rabiu"
        ]
      },
      {
        "lga": "ingawa",
        "wards": [
          "agayawa",
          "bareruwa-ruruma",
          "bidore-yaya",
          "dara",
          "daunaka-b-kwari",
          "dugul",
          "ingawa",
          "jobe-kandawa",
          "kurfeji-yankaura",
          "manomawa-kafi",
          "yandoma"
        ]
      },
      {
        "lga": "jibia",
        "wards": [
          "bugaje",
          "farfaru",
          "faru",
          "g-baure-mallamawa",
          "gangara",
          "jibia-a",
          "jibia-b",
          "kusa",
          "mazanya-magama",
          "riko",
          "yangaiya"
        ]
      },
      {
        "lga": "kafur",
        "wards": [
          "dantutture",
          "dutsin-kura-kanya",
          "gamzago",
          "gozaki",
          "kafur",
          "mahuta",
          "masari",
          "sabuwar-kasa",
          "yari-bori",
          "yartalata-rigoji"
        ]
      },
      {
        "lga": "kaita",
        "wards": [
          "abdallawa",
          "baawa",
          "dankaba",
          "dankama",
          "gafiya",
          "girka",
          "kaita",
          "matsai",
          "yandaki",
          "yanhoho"
        ]
      },
      {
        "lga": "kankara",
        "wards": [
          "burdugau",
          "dan-murabu",
          "dan-maidaki",
          "garagi",
          "gatakawa-s-gari-mabai",
          "hurya",
          "kankara-a-b",
          "kukasheka",
          "pauwa-a-b",
          "wawar-kaza",
          "zango-zabaro"
        ]
      },
      {
        "lga": "kankia",
        "wards": [
          "gachi",
          "galadima-a",
          "galadima-b",
          "kafin-dangi-fakuwa",
          "kafinsoli",
          "kunduru-gyaza",
          "magam-tsa",
          "rimaye",
          "sukuntuni",
          "tafashiya-nasarawa"
        ]
      },
      {
        "lga": "katsina",
        "wards": [
          "kangiwa",
          "shinkafi-a",
          "shinkafi-b",
          "wakili-kudu-iii",
          "wakilin-arewa-a",
          "wakilin-arewa-b",
          "wakilin-gabas-i",
          "wakilin-gabas-ii",
          "wakilin-kudu-i",
          "wakilin-kudu-ii",
          "wakilin-yamma-1",
          "wakilin-yamma-1i"
        ]
      },
      {
        "lga": "kurfi",
        "wards": [
          "barkiyya",
          "birchi",
          "kurfi-a",
          "kurfi-b",
          "rawayau-a",
          "rawayau-b",
          "tsauri-a",
          "tsauri-b",
          "wurma-a",
          "wurma-b"
        ]
      },
      {
        "lga": "kusada",
        "wards": [
          "bauranya-a",
          "bauranya-b",
          "boko",
          "dudunni",
          "kaikai",
          "kofa",
          "kusada",
          "mawashi",
          "yashe-a",
          "yashe-b"
        ]
      },
      {
        "lga": "mai'adua",
        "wards": [
          "bumbum-a",
          "bumbum-b",
          "danyashe",
          "koza",
          "mai-koni-a",
          "mai-koni-b",
          "mai-adua-a",
          "mai-adua-b",
          "mai-adua-c",
          "natsalle"
        ]
      },
      {
        "lga": "malumfashi",
        "wards": [
          "borin-dawa",
          "dansarai",
          "dayi",
          "gorar-dansaka",
          "karfi",
          "makaurachi",
          "malum-fashi-a",
          "malum-fashi-b",
          "na-alma",
          "rawan-sanyi",
          "yaba",
          "yarmama"
        ]
      },
      {
        "lga": "mani",
        "wards": [
          "bagiwa",
          "bujawa-gewayau",
          "duwan-makau",
          "hamcheta",
          "jani",
          "kwatta",
          "machika",
          "magami",
          "mani",
          "muduru",
          "tsagem-takusheyi"
        ]
      },
      {
        "lga": "mashi",
        "wards": [
          "bamble",
          "doguru-a",
          "doguru-b",
          "gallu",
          "jigawa",
          "karau",
          "mashi",
          "s-rijiya",
          "sonkaya",
          "tamilo-a",
          "tamilo-b"
        ]
      },
      {
        "lga": "matazu",
        "wards": [
          "dissi",
          "gwarjo",
          "karaduwa",
          "kogari",
          "matazu-a",
          "matazu-b",
          "mazoji-a",
          "mazoji-b",
          "rinjin-idi",
          "sayaya"
        ]
      },
      {
        "lga": "musawa",
        "wards": [
          "dangani",
          "danjanku-karachi",
          "garu",
          "gingin",
          "jikamshi",
          "kira",
          "kurkujan-a",
          "kurkujan-b",
          "musawa",
          "tuge",
          "yaradau-tabanni"
        ]
      },
      {
        "lga": "rimi",
        "wards": [
          "abukur",
          "fardami",
          "kadandani",
          "majengobir",
          "makurda",
          "masabo-kurabau",
          "remawa-iyatawa",
          "rimi",
          "sabon-garin-alarain",
          "tsagero"
        ]
      },
      {
        "lga": "sabuwa",
        "wards": [
          "damari",
          "dugun-mu-azu",
          "gamji",
          "gazari",
          "machika",
          "maibakko",
          "rafin-iwa",
          "sabuwa-a",
          "sabuwa-b",
          "sayau"
        ]
      },
      {
        "lga": "safana",
        "wards": [
          "babban-duhu-a",
          "babban-duhu-b",
          "baure-a",
          "baure-b",
          "runka-a",
          "runka-b",
          "safana",
          "tsaskiya",
          "zakka-a",
          "zakka-b"
        ]
      },
      {
        "lga": "sandamu",
        "wards": [
          "daneji-a",
          "daneji-b",
          "fago-a",
          "fago-b",
          "kagare",
          "karkarku",
          "katsayal",
          "kwasarawa",
          "rade-a",
          "rade-b",
          "sandamu"
        ]
      },
      {
        "lga": "zango",
        "wards": [
          "dargage",
          "garni",
          "gwamba",
          "kanda",
          "kawarin-kudi",
          "kawarin-malawamai",
          "rogogo-cidari",
          "sara",
          "yardaje",
          "zango"
        ]
      }
    ]
  },
  {
    "state": "kebbi",
    "lgas": [
      {
        "lga": "aliero",
        "wards": [
          "aliero-dangaladima-i",
          "aliero-dangaladima-ii",
          "aliero-s-fada-i",
          "aliero-s-fada-ii",
          "danwarai",
          "jiga-birni",
          "jiga-makera",
          "kashin-zama",
          "rafin-bauna",
          "sabiyal"
        ]
      },
      {
        "lga": "arewa",
        "wards": [
          "biu",
          "chibike",
          "daura-sakkwabe-jarkuka",
          "falde",
          "feske-jaffeji",
          "gorun-dikko",
          "gumumdai-rafin-tsaka",
          "kangiwa",
          "laima-jantullu",
          "sarka-dantsoho",
          "yeldu"
        ]
      },
      {
        "lga": "argungu",
        "wards": [
          "alwasa-gotomo",
          "dikko",
          "felande",
          "galadima",
          "gulma",
          "gwazange-kisawa-u-gyaga",
          "kokani-north",
          "kokani-south",
          "lailaba",
          "sauwa-kaurar-sani",
          "tungar-zazzagawa-rumbuki-sarkawa"
        ]
      },
      {
        "lga": "augie",
        "wards": [
          "augie-north",
          "augie-south",
          "bagaye-mera",
          "bayawa-north",
          "bayawa-south",
          "birnin-tudu-gudale",
          "bubuce",
          "dundaye-kwaido-zagi-illela",
          "tiggi-awade",
          "yola"
        ]
      },
      {
        "lga": "bagudo",
        "wards": [
          "bagudo-tuga",
          "bahindi-boki-doma",
          "bani-tsamiya-kali",
          "illo-sabon-gari-yantau",
          "kaoje-gwamba",
          "kende-kurgu",
          "lafagu-gante",
          "lolo-giris",
          "matsinka-geza",
          "sharabi-kwanguwai",
          "zagga-kwasara"
        ]
      },
      {
        "lga": "birnin-kebbi",
        "wards": [
          "ambursa",
          "birnin-kebbi-dangaladima",
          "birnin-kebbi-mafara",
          "gawasu",
          "godongaji",
          "gulumbe",
          "kardi-yamama",
          "kola-tarasa",
          "laga",
          "makera",
          "maurida-karyo-ung-mijin-nana",
          "nassarawa-i",
          "nassarawa-ii",
          "ujariyo",
          "zauro"
        ]
      },
      {
        "lga": "bunza",
        "wards": [
          "bunza-dangaladima",
          "bunza-marafa",
          "gwade",
          "maidahini",
          "raha",
          "sabon-birni",
          "salwai",
          "tilli-hilema",
          "tunga",
          "zogrima"
        ]
      },
      {
        "lga": "dandi",
        "wards": [
          "bani-zumbu",
          "buma",
          "dolekaina",
          "fana",
          "geza",
          "kamba-kamba",
          "kwakkwaba",
          "kyangakwai",
          "maigwaza",
          "maihausawa",
          "shiko"
        ]
      },
      {
        "lga": "fakai",
        "wards": [
          "bajida",
          "bangu-garinisa",
          "birnin-tudu",
          "fakai-zussun",
          "gulbin-kuka-maijarhula",
          "inga-bulu-maikende",
          "kangi",
          "mahuta",
          "marafa",
          "penin-amana-penin-gaba"
        ]
      },
      {
        "lga": "gwandu",
        "wards": [
          "cheberu-bada",
          "dalijan",
          "dodoru",
          "gulmare",
          "gwandu-marafa",
          "gwandu-sarkin-fawa",
          "kambaza",
          "malisa",
          "maruda",
          "masama-kwasgara"
        ]
      },
      {
        "lga": "jega",
        "wards": [
          "alelu-gehuru",
          "dangamaji",
          "dunbegu-bausara",
          "gindi-nassarawa-kyarmi-galbi",
          "jandutsi-birnin-malam",
          "jega-firchin",
          "jega-kokani",
          "jega-magaji-a",
          "jega-magaji-b",
          "katanga-fagada",
          "kimba"
        ]
      },
      {
        "lga": "kalgo",
        "wards": [
          "badariya-magarza",
          "dangoma-gayi",
          "diggi",
          "etene",
          "kalgo",
          "kuka",
          "mutubari",
          "nayilwa",
          "wurogauri",
          "zuguru"
        ]
      },
      {
        "lga": "koko-besse",
        "wards": [
          "besse",
          "dada-alelu",
          "dutsin-mari-dulmeru",
          "illela-s-gari",
          "jadadi",
          "koko-fircin",
          "koko-magaji",
          "lani-manyan-tafukka-shiba",
          "madacci-firini",
          "maikwari-karamar-damba-bakoshi",
          "takware",
          "zariya-kalakala-amiru"
        ]
      },
      {
        "lga": "maiyama",
        "wards": [
          "andarai-kurunkwu-zongun-liba",
          "giwa-tazo-zara",
          "gumbin-kure",
          "karaye-dogondaji",
          "kawara-s-sara-yarkamba",
          "kuben-rigidiga",
          "liba-danwa-kuka-kogo",
          "maiyama",
          "mungadi-botoro",
          "sambawa-mayalo",
          "sarandosa-gubba"
        ]
      },
      {
        "lga": "ngaski",
        "wards": [
          "birnin-yauri",
          "gafara-machupa",
          "garin-baka-makarin",
          "kambuwa-danmaraya",
          "kwakwaran",
          "libata-kwangia",
          "makawa-uleira",
          "ngaski",
          "utono-hoge",
          "wara"
        ]
      },
      {
        "lga": "sakaba",
        "wards": [
          "adai",
          "dankolo",
          "doka-bere",
          "fada",
          "gelwasa",
          "janbirni",
          "makuku",
          "maza-maza",
          "sakaba",
          "tudun-kuka"
        ]
      },
      {
        "lga": "shanga",
        "wards": [
          "atuwo",
          "binuwa-gebe-bunkuji",
          "dugu-tsoho-dugu-raha",
          "kawara-ingu-sargo",
          "rafin-kirya-tefki-tara",
          "sawashi",
          "shanga",
          "sokage-golongo-hundeji",
          "takware",
          "yarbesse"
        ]
      },
      {
        "lga": "suru",
        "wards": [
          "aljannare",
          "bakuwai",
          "bandan",
          "barbarejo",
          "dakingari",
          "daniya-shema",
          "dendane",
          "ginga",
          "giro",
          "kwaifa",
          "suru"
        ]
      },
      {
        "lga": "wasagu-danko",
        "wards": [
          "ayu",
          "bena",
          "dan-umaru-mairairai",
          "danko-maga",
          "gwanfi-kele",
          "kanya",
          "kyabu-kandu",
          "ribah-machika",
          "waje",
          "wasagu",
          "yalmo-shindi"
        ]
      },
      {
        "lga": "yauri",
        "wards": [
          "chulu-koma",
          "gungun-sarki",
          "jijima",
          "tondi",
          "yelwa-central",
          "yelwa-east",
          "yelwa-north",
          "yelwa-south",
          "yelwa-west",
          "zamare"
        ]
      },
      {
        "lga": "zuru",
        "wards": [
          "bedi",
          "ciroman-dabai",
          "isgogo-dago",
          "manga-ushe",
          "rafin-zuru",
          "rikoto",
          "rumu-daben-seme",
          "senchi",
          "tadurga",
          "zodi"
        ]
      }
    ]
  },
  {
    "state": "kogi",
    "lgas": [
      {
        "lga": "adavi",
        "wards": [
          "adavi-eba",
          "ege-iruvochinomi",
          "idanuhua",
          "ikaraworo-idobanyere",
          "ino-ziomi-ipaku-osisi",
          "iruvucheba",
          "kuroko-i",
          "kuroko-ii",
          "nagazi-farm-centre",
          "ogaminana",
          "okunchi-ozuri-onieka"
        ]
      },
      {
        "lga": "ajaokuta",
        "wards": [
          "abodi-patesi",
          "achagana",
          "adogo",
          "adogu-apamira-ogodo-uhuovene",
          "badoko",
          "ebiya-north",
          "ebiya-south",
          "ganaga-township",
          "ichuwa-upaja",
          "obangede-ohunene-ukoko-inye-re",
          "odonu-unosi",
          "ogigiri",
          "old-ajaokuta",
          "omgbo"
        ]
      },
      {
        "lga": "ankpa",
        "wards": [
          "ankpa-i",
          "ankpa-ii",
          "ankpa-suburb-i",
          "ankpa-suburb-ii",
          "ankpa-township",
          "enjema-i",
          "enjema-iii",
          "enjema-iv",
          "enjema-ii",
          "ojoku-i",
          "ojoku-iii",
          "ojoku-ii",
          "ojoku-iv"
        ]
      },
      {
        "lga": "bassa",
        "wards": [
          "akuba-i",
          "akuba-ii",
          "ayede-akakana",
          "eforo",
          "gboloko",
          "ikende",
          "kpata",
          "mozum",
          "ozongulo-kpanche",
          "ozugbe"
        ]
      },
      {
        "lga": "dekina",
        "wards": [
          "abocho",
          "adumu-egume",
          "anyigba",
          "dekina-town",
          "emewe",
          "iyale",
          "odu-i",
          "odu-ii",
          "ogane-inigu",
          "ogbabede",
          "ojikpadala",
          "okura-olafia"
        ]
      },
      {
        "lga": "ibaji",
        "wards": [
          "akpanyo",
          "analo",
          "ayah",
          "ejule",
          "iyano",
          "odeke",
          "ojila",
          "onyedega",
          "ujeh",
          "unale"
        ]
      },
      {
        "lga": "idah",
        "wards": [
          "ede",
          "ega",
          "ichala",
          "igalaogba",
          "igecheba",
          "ogegele",
          "owoli-apa",
          "sabon-gari",
          "ugwoda",
          "ukwaja"
        ]
      },
      {
        "lga": "igalamela-odolu",
        "wards": [
          "ajaka-i",
          "ajaka-ii",
          "akpanya",
          "avrugo",
          "ekwuloko",
          "odolu",
          "oforachi-i",
          "oforachi-ii",
          "oji-aji",
          "ubele"
        ]
      },
      {
        "lga": "ijumu",
        "wards": [
          "aiyegunle",
          "aiyere-arimah",
          "aiyetoro-i",
          "aiyetoro-ii",
          "egbeda-egga-okedayo",
          "ekinrin-ade",
          "ibgolayere-ilaere",
          "iffe-ikoyi-okejumu",
          "ileteju-origa",
          "iyah-ayeh",
          "iyamoye",
          "iyara",
          "odokoro",
          "ogale-aduge",
          "ogidi"
        ]
      },
      {
        "lga": "kabba-bunu",
        "wards": [
          "aiyeteju",
          "aiyetoro-kiri",
          "aiyewa",
          "akutupa-kiri",
          "asuta",
          "egbeda",
          "iluke",
          "odo-akete",
          "odo-ape",
          "odolu",
          "okebukun",
          "okedayo",
          "okekoko",
          "olle-oke-ofin",
          "otu"
        ]
      },
      {
        "lga": "koton-karfe",
        "wards": [
          "akpasu",
          "chikara-north",
          "chikara-south",
          "gegu-beki-north",
          "gegu-beki-south",
          "girinya",
          "irenodu",
          "kotonkarfe-south-east",
          "odaki-koton-karfe",
          "tawari",
          "ukwo-koton-karfe"
        ]
      },
      {
        "lga": "lokoja",
        "wards": [
          "eggan",
          "kakanda",
          "kupa-north-east",
          "kupa-south-west",
          "lokoja-a",
          "lokoja-b",
          "lokoja-c",
          "lokoja-d",
          "lokoja-e",
          "oworo"
        ]
      },
      {
        "lga": "mopa-muro",
        "wards": [
          "agbafogun",
          "aiyedayo-aiyedaro",
          "aiyede-okagi",
          "ileteju-1",
          "illeteju-2",
          "odole-1",
          "odole-2",
          "okeagi-ilai",
          "orokere",
          "takete-idde-otafun"
        ]
      },
      {
        "lga": "ofu",
        "wards": [
          "aloji",
          "aloma",
          "ejule-allah",
          "iboko-efakwu",
          "igo",
          "itobe-okokenyi",
          "ochadamu",
          "ofoke",
          "ogbonicha",
          "ugwolawo-2",
          "ugwolawo-i"
        ]
      },
      {
        "lga": "ogori-magongo",
        "wards": [
          "aiyeromi",
          "eni",
          "ileteju",
          "obatgben",
          "obinoyin",
          "okesi",
          "okibo",
          "oshobane",
          "oturu-opowuroye",
          "ugugu"
        ]
      },
      {
        "lga": "okehi",
        "wards": [
          "eika-ohizenyi",
          "obaiba-i",
          "obaiba-ii",
          "obangede-uhuodo",
          "obaroke-uvete",
          "oboroke-eba",
          "oboroke-uvete-ii",
          "ohuepe-omavi-uboro",
          "ohueta",
          "okaito-usungwen",
          "okuehu"
        ]
      },
      {
        "lga": "okene",
        "wards": [
          "abuga-ozuja",
          "bariki",
          "idoji",
          "obehira-eba",
          "obehira-uvetta",
          "obessa",
          "okene-eba-agassa-ahache",
          "onyukoko",
          "orietesu",
          "otutu",
          "upogoro-odenku"
        ]
      },
      {
        "lga": "olamaboro",
        "wards": [
          "imane-i",
          "imane-ii",
          "ogugu-i",
          "ogugu-ii",
          "ogugu-iii",
          "olamaboro-i",
          "olamaboro-ii",
          "olamaboro-iii",
          "olamaboro-iv",
          "olamaboro-v"
        ]
      },
      {
        "lga": "omala",
        "wards": [
          "abejukolo-i",
          "abejukolo-ii",
          "akpacha",
          "bagaji",
          "bagana",
          "icheke-ajopachi",
          "ogodu",
          "oji-aji",
          "okpatala",
          "olla",
          "opoda-ofejiji"
        ]
      },
      {
        "lga": "yagba-east",
        "wards": [
          "alu-igbagun-oranre",
          "ejuku",
          "ife-olukotun-i",
          "ife-olukotun-ii",
          "ilafin-idofin-odo-ogba",
          "itedo",
          "jege-oke-agi-ogbom-isao",
          "makutu-i",
          "makutu-ii",
          "ponyan"
        ]
      },
      {
        "lga": "yagba-west",
        "wards": [
          "ejiba",
          "isaulu-esa-okoloke-okunran",
          "iyamerin-igbaruku",
          "odo-egbe",
          "odo-ara-omi-ogga",
          "odo-egbe-i",
          "odo-egbe-ii",
          "odo-ere-oke-ere",
          "odo-eri-okoto",
          "ogbe",
          "oke-egbe-i",
          "oke-egbe-ii",
          "oke-egbe-iii",
          "oke-egbe-iv"
        ]
      }
    ]
  },
  {
    "state": "kwara",
    "lgas": [
      {
        "lga": "asa",
        "wards": [
          "adigbongbo-awe-orimaro",
          "afon",
          "ago-oja-oshin-sapati-laduba",
          "ballah-otte",
          "budo-egba",
          "efue-berikodo",
          "elebue-agbona-fata",
          "gambari-aiyekale",
          "ila-oja",
          "odo-ode-aboto",
          "ogbondoroko-reke",
          "ogele",
          "okesho",
          "onire-odegiwa-alapa",
          "owode-gbogun",
          "yowere-11-okeweru",
          "yowere-sosoki"
        ]
      },
      {
        "lga": "baruten",
        "wards": [
          "boriya-shiya",
          "gure-gwasoro",
          "gwanara",
          "gwedebereru-babane",
          "ilesha",
          "kenu-taberu",
          "kiyoru-bwen",
          "kpaura-yakiru",
          "okuta",
          "shinawu-tunbuyan",
          "yashikira"
        ]
      },
      {
        "lga": "edu",
        "wards": [
          "lafiagi-1",
          "lafiagi-11",
          "lafiagi-111",
          "lafiagi-1v",
          "tsaragi-1",
          "tsaragi-11",
          "tsaragi-111",
          "tsonga-1",
          "tsonga-11",
          "tsonga-111"
        ]
      },
      {
        "lga": "ekiti",
        "wards": [
          "eruku",
          "isapa",
          "koro",
          "obbo-aiyeggunle-1",
          "obbo-aiyeggunle-11",
          "obbo-ile",
          "oke-opin-etan",
          "opin",
          "osi-1",
          "osi-11"
        ]
      },
      {
        "lga": "ifelodun",
        "wards": [
          "agunjin",
          "idofian-1",
          "idofian-11",
          "igbaja-1",
          "igbaja-11",
          "igbaja-111",
          "ile-ire",
          "oke-ode-1",
          "oke-ode-11",
          "oke-ode-111",
          "omupo",
          "ora",
          "oro-ago",
          "share-1",
          "share-11",
          "share-111",
          "share-1v",
          "share-v"
        ]
      },
      {
        "lga": "ilorin-east",
        "wards": [
          "agbeyangi-gbadamu-osin",
          "apado",
          "bologun-gambari-11",
          "gambari-1",
          "ibagun",
          "iponrin",
          "magaji-are-1",
          "magaji-are-11",
          "marafa-pepele",
          "maya-ile-apa",
          "oke-oyi-oke-ose-alalubosa",
          "zango"
        ]
      },
      {
        "lga": "ilorin-south",
        "wards": [
          "akanbi-1",
          "akanbi-11",
          "akanbi-111",
          "akanbi-1v",
          "akanbi-v",
          "balogun-fulani-11",
          "balogun-fulani-111",
          "balogun-fulani-i",
          "okaka-1",
          "okaka-11",
          "oke-ogun"
        ]
      },
      {
        "lga": "ilorin-west",
        "wards": [
          "adewole",
          "ajikobi",
          "baboko",
          "badari",
          "balogun-alanamu-central",
          "magaji-ngeri",
          "ogidi",
          "ojuekun-zarumi",
          "oko-erin",
          "oloje",
          "ubandawaki",
          "warrah-egbe-jila-oshin"
        ]
      },
      {
        "lga": "irepodun",
        "wards": [
          "ajase-ipo-1",
          "ajase-ipo-11",
          "arandun",
          "esie-ijan",
          "ipetu-rore-aran-orin",
          "oko",
          "omu-aran-1-aran",
          "omu-aran-11-ihaye",
          "omu-aran-111-ifaja",
          "oro-1",
          "oro-11"
        ]
      },
      {
        "lga": "isin",
        "wards": [
          "alla",
          "edidi",
          "ijara-isin",
          "isanlu-1",
          "isanlu-11",
          "iwo",
          "oke-aba",
          "oke-onigbin",
          "olla",
          "owu-isin",
          "sabaja-pamo"
        ]
      },
      {
        "lga": "kaiama",
        "wards": [
          "adena",
          "bani",
          "gwanabe-1",
          "gwanabe-11",
          "gwari-a-gwaria",
          "kaiama-1",
          "kaiama-11",
          "kaiama-111",
          "kemanji",
          "wajibe"
        ]
      },
      {
        "lga": "moro",
        "wards": [
          "abati-alara",
          "ajanaku",
          "arobadi",
          "babadudu",
          "bode-saadu",
          "ejidongari",
          "jebba",
          "lanwa",
          "logun-jehunkunnu",
          "malete-gbugudu",
          "megida",
          "okemi",
          "okutala",
          "oloru",
          "pakunmo",
          "shao",
          "womi-ayaki"
        ]
      },
      {
        "lga": "offa",
        "wards": [
          "balogun",
          "essa-a",
          "essa-b",
          "essa-c",
          "igboidun",
          "ojomu-central-1",
          "ojomu-central-11",
          "ojomu-south-east",
          "ojomu-north-north-west",
          "shawo-central",
          "shawo-south-east",
          "shawo-south-west"
        ]
      },
      {
        "lga": "oke-ero",
        "wards": [
          "aiyedun",
          "ekan",
          "idofin-odo-ashe",
          "idofin-igbana-1",
          "idofin-igbana-11",
          "iloffa",
          "imode-egosi",
          "imoji-ilale-erinmope",
          "odo-owa-1",
          "odo-owa-11"
        ]
      },
      {
        "lga": "oyun",
        "wards": [
          "erin-ile-north",
          "erin-ile-south",
          "igbona",
          "igosun",
          "ijagbo",
          "ikotun",
          "ilemona",
          "inaja-ahogbada",
          "ipee",
          "irra",
          "ojoku"
        ]
      },
      {
        "lga": "patigi",
        "wards": [
          "kpada-1",
          "kpada-11",
          "kpada-111",
          "lade-1",
          "lade-11",
          "lade-111",
          "patigi-1",
          "patigi-11",
          "patigi-111",
          "patigi-1v"
        ]
      }
    ]
  },
  {
    "state": "lagos",
    "lgas": [
      {
        "lga": "agege",
        "wards": [
          "agbotikuyo-dopemu",
          "darocha",
          "iloro-onipetesi",
          "isale-odo",
          "isale-idimangoro",
          "keke",
          "okekoto",
          "oniwaya-papa-uku",
          "orile-agege-oko-oba",
          "oyewole-papa-ashafa",
          "tabon-tabon-oko-oba"
        ]
      },
      {
        "lga": "ajeromi-ifelodun",
        "wards": [
          "ago-hausa",
          "alaba-oro",
          "awodi-ora",
          "layeni",
          "mosafejo",
          "ojo-road",
          "olodi",
          "temidire-i",
          "temidire-ii",
          "tolu",
          "wilmer"
        ]
      },
      {
        "lga": "alimosho",
        "wards": [
          "abule-egba-aboru-meiran-alagbado",
          "ayobo-ijon-village-camp-david",
          "egbe-agodo",
          "egbeda-alimosho",
          "idimu-isheri-olofin",
          "igando-egan",
          "ikotun-ijegun",
          "ipaja-north",
          "ipaja-south",
          "pleasure-oke-odo",
          "shasha-akowonjo"
        ]
      },
      {
        "lga": "amuwo-odofin",
        "wards": [
          "amuwo",
          "amuwo-odofin-housing-estate-mile-2",
          "festac-1",
          "festac-ii",
          "festac-iii",
          "ibeshe",
          "igbologun",
          "ijegun",
          "irede",
          "kirikiri",
          "kirikiri",
          "satellite"
        ]
      },
      {
        "lga": "apapa",
        "wards": [
          "afolabi-alasia-str-and-environs",
          "apapa-i-marine-rd-environs",
          "apapa-ii-liverpool-rd-and-environs",
          "apapa-iii-creek-rd-tincan-snake-island",
          "apapa-iv-pelewura-crescent-and-environs",
          "gaskiya-environs",
          "ijora-oloye",
          "malu-road-and-environs",
          "olodan-st-olojowou-st-alh-dogo-olatokunbo-st-iganmu",
          "sari-and-environs"
        ]
      },
      {
        "lga": "badagry",
        "wards": [
          "ajara",
          "ajido",
          "apa",
          "awhanjigoh",
          "ibereko",
          "ikoga",
          "ilogbo-araromi",
          "iworo-gbanko",
          "iya-afin",
          "keta-east",
          "posukoh"
        ]
      },
      {
        "lga": "epe",
        "wards": [
          "abomiti",
          "agbowa",
          "agbowa-ikosi",
          "ago-owu",
          "ajaganabe",
          "ejirin",
          "etita-ebode",
          "ibonwon",
          "ilara",
          "ise-igbogun",
          "itoikin",
          "lagbade",
          "odomola",
          "odoragunsin",
          "oke-balogun",
          "oriba-ladaba",
          "orugbo",
          "poka",
          "popo-oba"
        ]
      },
      {
        "lga": "eti-osa",
        "wards": [
          "ado-langbasa-badore",
          "ajah-sangotedo",
          "ikoyi-i",
          "ikoyi-ii",
          "ilado-eti-osa-and-environs",
          "ilasan-housing-estate",
          "lekki-ikate-and-environs",
          "obalende",
          "victoria-island-i",
          "victoria-island-ii"
        ]
      },
      {
        "lga": "ibeju-lekki",
        "wards": [
          "02-orimedu-ii",
          "03-orimedu-iii",
          "ibeju-i",
          "iwerekun-ii",
          "lekki-ii",
          "n2-ibeju-ii",
          "orimedu-i",
          "p1-iwerekun-i",
          "s-2a-siriwon-igbekodo-ii",
          "s1-lekki-i",
          "s2-siriwon-igbekodo-i"
        ]
      },
      {
        "lga": "ifako-ijaye",
        "wards": [
          "ajegunle-akinde-animashaun",
          "alakuko-kollington",
          "fagba-akute-road",
          "ijaiye-agbado-kollington",
          "ijaiye-ojokoro",
          "ijaye",
          "iju-isaga",
          "iju-obawole",
          "new-ifako-oyemekun",
          "old-ifako-karaole",
          "pamada-abule-egba"
        ]
      },
      {
        "lga": "ikeja",
        "wards": [
          "adekunle-vill-adeniyi-jones-ogba",
          "airport-onipetesi-inilekere",
          "alausa-oregun-olusosun",
          "anifowoshe-ikeja",
          "gra-police-barracks",
          "ipodo-seriki-aro",
          "ojodu-agidingbi-omole",
          "oke-ira-aguda",
          "onigbongbon",
          "wasimi-opebi-allen"
        ]
      },
      {
        "lga": "ikorodu",
        "wards": [
          "aga-ijimu",
          "agbala",
          "agura-iponmi",
          "baiyeku-oreta",
          "erikorodu",
          "ibeshe",
          "igbogbo-i",
          "igbogbo-ii",
          "ijede-ii",
          "ijede-j",
          "imota-1",
          "imota-ii",
          "ipakodo",
          "isele-i",
          "isele-ii",
          "isele-iii",
          "isiu",
          "odogunyan",
          "olorunda-igbaga"
        ]
      },
      {
        "lga": "kosofe",
        "wards": [
          "agboyi-i",
          "agboyi-ii",
          "anthony-ajao-estate-mende-maryland",
          "ifako-soluyi",
          "ikosi-ketu-mile-12-agiliti-maidan",
          "isheri-olowo-ira-shangisha-magodo-phase-i-ii",
          "ketu-alapere-agidi-orisigun-kosofe-ajelogo-akanimodo",
          "ojota-ogudu",
          "owode-onirin-ajegunle-odo-ogun",
          "oworonshoki"
        ]
      },
      {
        "lga": "lagos-island",
        "wards": [
          "agarawu-obadina",
          "anikantamo",
          "eiyekole",
          "epetedo",
          "idumota-oke",
          "iduntafa",
          "ilupesi",
          "isale-agbede",
          "lafiaji-ebute",
          "oju-oto",
          "oko-awo",
          "oko-faji",
          "olosun",
          "olowogbowo-elegbata",
          "olushi-kakawa",
          "oluwole",
          "onikan",
          "popo-aguda",
          "sandgrouse"
        ]
      },
      {
        "lga": "lagos-mainland",
        "wards": [
          "alagomeji",
          "epetedo",
          "glover-ebute-metta",
          "iwaya",
          "maroko-ebute-metta",
          "oko-baba",
          "olaleye-village",
          "otto-iddo",
          "oyadiran-estate-abule-oja",
          "oyingbo-market-ebute-metta",
          "yaba-igbobi"
        ]
      },
      {
        "lga": "mushin",
        "wards": [
          "alakara",
          "babalosa",
          "babalosa-idi-araba",
          "idi-araba",
          "idi-oro-odi-olowu",
          "ilasamaja",
          "ilupeju",
          "ilupeju-industrial-estate",
          "itire",
          "kayode-fadeyi",
          "mushin-atewolara",
          "ojuwoye",
          "olateju",
          "papa-ajao"
        ]
      },
      {
        "lga": "ojo",
        "wards": [
          "ajangbadi",
          "etegbin",
          "iba",
          "idoluwo",
          "ijanikin",
          "ilogbo",
          "irewe",
          "ojo-town",
          "okokomaiko",
          "sabo",
          "tafi"
        ]
      },
      {
        "lga": "oshodi-isolo",
        "wards": [
          "ajao-estate",
          "ilasamaja",
          "ishagatedo",
          "isolo",
          "mafoluku",
          "oke-afa-ejigbo",
          "okota",
          "orile-oshodi",
          "oshodi-bolade",
          "sogunle",
          "sogunle-alasia"
        ]
      },
      {
        "lga": "somolu",
        "wards": [
          "abule-okuta-ilaje-bariga",
          "alade",
          "bajulaiye",
          "fola-agoro-bajulaiye-igbari-akoka",
          "gbagada-phase-i-obanikoro-pedro",
          "gbagada-phase-ii-bariga-apelehin",
          "igbobi-fadeyi",
          "ilaje-akoka",
          "lad-lak-bariga",
          "mafowoku-pedro",
          "onipanu",
          "palmgrove-ijebutedo"
        ]
      },
      {
        "lga": "surulere",
        "wards": [
          "adeniran-ogunsanya",
          "aguda",
          "akinhanmi-cole",
          "coker",
          "igbaja-stadium",
          "ijeshatedo",
          "ikate",
          "iponri-housing-estate-eric-moore",
          "itire",
          "orile",
          "shitta-ogunlana-drive",
          "yaba-ojuelegba"
        ]
      }
    ]
  },
  {
    "state": "nasarawa",
    "lgas": [
      {
        "lga": "akwanga",
        "wards": [
          "agyaga",
          "akwanga-east",
          "akwanga-west",
          "ancho-nighaan",
          "anchobaba",
          "andaha",
          "gudi",
          "gwanje-gwanje",
          "moroa",
          "ningo-bohar",
          "nunku"
        ]
      },
      {
        "lga": "awe",
        "wards": [
          "akiri",
          "azara",
          "galadima",
          "jangaru",
          "kanje-abuni",
          "madaki",
          "makwangiji",
          "ribi",
          "tunga",
          "wuse"
        ]
      },
      {
        "lga": "doma",
        "wards": [
          "agbashi",
          "akpanaja",
          "alagye-i",
          "alagye-ii",
          "doka-i",
          "doka-ii",
          "rukubi-i",
          "rukubi-ii",
          "sarkin-dawaki",
          "ungwan-madaki"
        ]
      },
      {
        "lga": "karu",
        "wards": [
          "agada-bagaji",
          "aso-kodape",
          "gitata",
          "gurku-kabusu",
          "kafin-shanu-betti",
          "karshi-i",
          "karshi-ii",
          "karu",
          "panda-kare",
          "tattara-kondoro",
          "uke"
        ]
      },
      {
        "lga": "keana",
        "wards": [
          "agaza",
          "aloshi",
          "amiri",
          "giza-galadima",
          "giza-madaki",
          "iwagu",
          "kadarko",
          "kwara",
          "obene",
          "oki"
        ]
      },
      {
        "lga": "keffi",
        "wards": [
          "ang-rimi",
          "angwan-iya-i",
          "angwan-iya-ii",
          "gangare-tudu",
          "jigwada",
          "keffi-town-east-kofar-goriya",
          "liman-abaji",
          "sabon-gari",
          "tudun-kofa-t-v",
          "yara"
        ]
      },
      {
        "lga": "kokona",
        "wards": [
          "agwada",
          "amba",
          "bassa",
          "dari",
          "garaku",
          "hadari",
          "kofar-gwari",
          "kokona",
          "koya-kana",
          "ninkoro",
          "yelwa"
        ]
      },
      {
        "lga": "lafia",
        "wards": [
          "adogi",
          "agyaragun-tofa",
          "arikya",
          "ashigie",
          "assakio",
          "bakin-rijiya-akurba-sarkin-pada",
          "chiroma",
          "gayam",
          "keffin-wambai",
          "makama",
          "shabu-kwandere",
          "wakwa",
          "zanwa"
        ]
      },
      {
        "lga": "nasarawa",
        "wards": [
          "akum",
          "ara-i",
          "ara-ii",
          "guto-aisa",
          "kanah-ondo-apawu",
          "laminga",
          "loko",
          "nasarawa-central",
          "nasarawa-east",
          "nasarawa-main-town",
          "nasarawa-north",
          "odu",
          "tunga-bakono",
          "udenin",
          "udenin-gida"
        ]
      },
      {
        "lga": "nasarawa-eggon",
        "wards": [
          "agunji",
          "aloce-ginda",
          "alogani",
          "ende",
          "igga-burumburum",
          "ikka-wangibi",
          "kagbu-wana",
          "lambaga-arikpa",
          "lizzin-keffi-ezzen",
          "mada-station",
          "nasarawa-eggon",
          "ubbe",
          "umme",
          "wakama"
        ]
      },
      {
        "lga": "obi",
        "wards": [
          "adudu",
          "agwatashi",
          "deddere-riri",
          "duduguru",
          "gidan-ausa-i",
          "gidan-ausa-ii",
          "gwadenye",
          "kyakale",
          "obi",
          "tudun-adabu"
        ]
      },
      {
        "lga": "toto",
        "wards": [
          "bugakarmo",
          "dausu",
          "gadagwa",
          "gwargwada",
          "kanyehu",
          "katakpa-i",
          "shafan-abakpa-i",
          "shafan-kwatto-i",
          "shege-i",
          "toto",
          "ugya",
          "umaisha"
        ]
      },
      {
        "lga": "wamba",
        "wards": [
          "arum",
          "gitta",
          "jimiya",
          "konvah",
          "kwara",
          "mangar",
          "nakere",
          "wamba-east",
          "wamba-west",
          "wayo"
        ]
      }
    ]
  },
  {
    "state": "niger",
    "lgas": [
      {
        "lga": "agaie",
        "wards": [
          "baro",
          "boku",
          "dauaci",
          "ekobadeggi",
          "ekossa",
          "ekowugi",
          "ekowuna",
          "etsugaie",
          "kutiriko",
          "magaji",
          "tagagi"
        ]
      },
      {
        "lga": "agwara",
        "wards": [
          "adehe",
          "agwata",
          "busuru",
          "gallah",
          "kashini",
          "kokoli",
          "mago",
          "papiri",
          "rofia",
          "suteku"
        ]
      },
      {
        "lga": "bida",
        "wards": [
          "bariki",
          "ceniyan",
          "dokodza",
          "kyari",
          "landzun",
          "masaba-ii",
          "masaba-i",
          "masaga-i",
          "masaga-ii",
          "mayaki-ndajiya",
          "nassarafu",
          "umaru-majigi-ii",
          "umaru-majigi-i",
          "wadata"
        ]
      },
      {
        "lga": "borgu",
        "wards": [
          "babanna",
          "dugga",
          "kabe-pissa",
          "karabonde",
          "konkoso",
          "malale",
          "new-bussa",
          "riverine",
          "shagunu",
          "wawa"
        ]
      },
      {
        "lga": "bosso",
        "wards": [
          "beji",
          "bosso-central-i",
          "bosso-central-ii",
          "chanchaga",
          "garatu",
          "kampala",
          "kodo",
          "maikunkele",
          "maitumbi",
          "shata"
        ]
      },
      {
        "lga": "chanchaga",
        "wards": [
          "limawa-a",
          "limawa-b",
          "makera",
          "minna-central",
          "minna-south",
          "nassarawa-a",
          "nassarawa-b",
          "nassarawa-c",
          "sabon-gari",
          "tudun-wada-north",
          "tudun-wada-south"
        ]
      },
      {
        "lga": "edatti",
        "wards": [
          "enagi",
          "etsu-tasha",
          "fazhi",
          "gazhe-i",
          "gazhe-ii",
          "gbangban",
          "gonagi",
          "guzan",
          "rokota",
          "sakpe"
        ]
      },
      {
        "lga": "gbako",
        "wards": [
          "batagi",
          "batako",
          "edokota",
          "edozhigi",
          "etsu-audu",
          "gbadafu",
          "gogata",
          "lemu",
          "nuwankota",
          "sammajiko"
        ]
      },
      {
        "lga": "gurara",
        "wards": [
          "bonu",
          "diko",
          "gawu",
          "izom",
          "kabo",
          "kwaka",
          "lambata",
          "lefu",
          "shako",
          "tufa"
        ]
      },
      {
        "lga": "katcha",
        "wards": [
          "badeggi",
          "bakeko",
          "bisanti",
          "dzwafu",
          "edotsu",
          "essa",
          "gbakogi",
          "kataregi",
          "katcha",
          "sidi-saba"
        ]
      },
      {
        "lga": "kontagora",
        "wards": [
          "arewa",
          "central",
          "gabas",
          "kudu",
          "madara",
          "magajiya",
          "masuga",
          "nagwamatse",
          "rafin-gora",
          "tungan-kawo",
          "tunganwawa",
          "usalle",
          "yamma"
        ]
      },
      {
        "lga": "lapai",
        "wards": [
          "arewa-yamma",
          "birnin-maza-tashibo",
          "ebbo-gbacinku",
          "evuti-kpada",
          "gulu-anguwa-vatsa",
          "gupa-abugi",
          "gurdi-zago",
          "kudu-gabas",
          "muye-egba",
          "takuti-shaku"
        ]
      },
      {
        "lga": "lavun",
        "wards": [
          "batati",
          "busu-kuchi",
          "dabban",
          "dassun",
          "doko",
          "egbako",
          "gaba",
          "jima",
          "kusotachi",
          "kutigi",
          "lagun",
          "mambe"
        ]
      },
      {
        "lga": "magama",
        "wards": [
          "auna-central",
          "auna-east",
          "auna-east-central",
          "auna-south",
          "auna-south-east",
          "ibelu-central",
          "ibelu-east",
          "ibelu-north",
          "ibelu-west",
          "nasko",
          "nassarawa"
        ]
      },
      {
        "lga": "mariga",
        "wards": [
          "bangi",
          "beri",
          "bobi",
          "galma-wamba",
          "gulbin-boka",
          "igwama",
          "inkwai",
          "kakihum",
          "kontokoro",
          "kumbashi",
          "maburya"
        ]
      },
      {
        "lga": "mashegu",
        "wards": [
          "babban-rami",
          "dapangi-makera",
          "ibbi",
          "kaboji",
          "kasanga",
          "kulho",
          "kwatachi",
          "mashegu",
          "mazakuka-likoro",
          "saho-rami"
        ]
      },
      {
        "lga": "mokwa",
        "wards": [
          "bokani",
          "gbajibo-muwo",
          "gbara",
          "ja-agi",
          "jebba-north",
          "kpaki-takuma",
          "kudu",
          "labozhi",
          "mokwa",
          "muregi",
          "rabba-ndayako"
        ]
      },
      {
        "lga": "munya",
        "wards": [
          "beni",
          "dandaudu",
          "dangunu",
          "daza",
          "fuka",
          "gini",
          "guni",
          "kabula",
          "kazai",
          "kuchi",
          "sarkin-pawa"
        ]
      },
      {
        "lga": "paikoro",
        "wards": [
          "adunu",
          "chimbi",
          "gwam",
          "ishau",
          "jere",
          "kafin-koro",
          "kwagana",
          "kwakuti",
          "nikuchi-t-mallam",
          "paiko-central",
          "tutungo-jedna"
        ]
      },
      {
        "lga": "rafi",
        "wards": [
          "kagara-gari",
          "kakuri",
          "kongoma-central",
          "kongoma-west",
          "kundu",
          "kusherki-north",
          "kushirki-south",
          "sabon-gari",
          "tegina-gari",
          "tegina-west",
          "yakila"
        ]
      },
      {
        "lga": "rijau",
        "wards": [
          "danrangi",
          "dugge",
          "dukku",
          "genu",
          "jama-are",
          "rijau",
          "shambo",
          "t-bunu",
          "t-magajiya",
          "ushe",
          "warari"
        ]
      },
      {
        "lga": "shiroro",
        "wards": [
          "allawa",
          "bangajiya",
          "bassa-kukoki",
          "egwa-gwada",
          "erana",
          "galkogo",
          "gurmana",
          "gussoro",
          "kato",
          "kushaka-kurebe",
          "kwaki-chukwuba",
          "manta",
          "pina",
          "she",
          "ubandoma"
        ]
      },
      {
        "lga": "suleja",
        "wards": [
          "bagama-b",
          "bagmama-a",
          "hashimi-a",
          "hashimi-b",
          "iku-south-i",
          "iku-south-ii",
          "kurmin-sarki",
          "magajiya",
          "maje-north",
          "wambai"
        ]
      },
      {
        "lga": "tafa",
        "wards": [
          "dogon-kurmi",
          "garam",
          "ija-gwari",
          "ija-koro",
          "iku",
          "new-bwari",
          "wuse-east",
          "wuse-west",
          "zuma-east",
          "zuma-west"
        ]
      },
      {
        "lga": "wushishi",
        "wards": [
          "akare",
          "barwa",
          "gwarjiko",
          "kanwuri",
          "kodo",
          "kwata",
          "lokogoma",
          "maito",
          "sabon-gari",
          "tukunji-yamigi",
          "zungeru"
        ]
      }
    ]
  },
  {
    "state": "ogun",
    "lgas": [
      {
        "lga": "abeokuta-north",
        "wards": [
          "ago-oko",
          "elega",
          "gbagura",
          "ibara-orile-onisasa",
          "ika",
          "ikereku",
          "ikija-ikereku",
          "ilugun-iberekodo",
          "imala-idiemi",
          "isaga-ilewo",
          "ita-osin-olomore",
          "lafenwa",
          "oke-ago-owu",
          "olorunda-ijale",
          "sabo",
          "totoro-sokori"
        ]
      },
      {
        "lga": "abeokuta-south",
        "wards": [
          "ago-egun-ijesa",
          "ake-i",
          "ake-iii",
          "ake-ii",
          "erunbe-oke-ijeun",
          "ibara-i",
          "ibara-ii",
          "igbore-ago-oba",
          "ijaye-idi-aba",
          "ijemo",
          "imo-isabo",
          "itoko",
          "keesi-emere",
          "sodeke-sale-ijeun-i",
          "sodeke-sale-ijeun-ii"
        ]
      },
      {
        "lga": "ado-odo-ota",
        "wards": [
          "ado-odo-i",
          "ado-odo-ii",
          "agbara-i",
          "agbara-ejila-awori",
          "alapoti",
          "atan",
          "ere",
          "igbesa",
          "ijoko",
          "iju",
          "ilogbo",
          "ketu-adie-owe",
          "ota-i",
          "ota-ii",
          "ota-iii",
          "sango"
        ]
      },
      {
        "lga": "ewekoro",
        "wards": [
          "abalabi",
          "arigbajo",
          "asa-yobo",
          "elere-onigbedu",
          "itori",
          "mosan",
          "obada-oko",
          "owowo",
          "papalanto",
          "wasimi"
        ]
      },
      {
        "lga": "ifo",
        "wards": [
          "agbado",
          "ajuwon-akute",
          "coker",
          "ibogun",
          "ifo-i",
          "ifo-ii",
          "ifo-iii",
          "iseri",
          "oke-aro-ibaragun-robiyan",
          "ososun",
          "sunren"
        ]
      },
      {
        "lga": "ijebu-east",
        "wards": [
          "ajebandele",
          "ijebu-ife-i",
          "ijebu-ife-ii",
          "ijebu-mushin-i",
          "ijebu-mushin-ii",
          "ikija",
          "imobi-i",
          "imobi-ii",
          "itele",
          "ogbere",
          "owu"
        ]
      },
      {
        "lga": "ijebu-north",
        "wards": [
          "ago-iwoye-i",
          "ago-iwoye-ii",
          "ako-onigbagbo-gelete",
          "atikori",
          "japara-ojowo",
          "mamu-etiri",
          "oke-agbo",
          "oke-sopin",
          "omen",
          "oru-awa-ilaporu",
          "osun"
        ]
      },
      {
        "lga": "ijebu-north-east",
        "wards": [
          "atan-imuku",
          "erunwon",
          "igede-itamarun",
          "ilese",
          "imewiro-ododeyo-imomo",
          "isoyin",
          "odesenlu",
          "odosimadegun-odosebora",
          "oju-ona",
          "oke-eri-ogbogbo"
        ]
      },
      {
        "lga": "ijebu-ode",
        "wards": [
          "ijade-imepe-i",
          "ijade-imepe-ii",
          "ijasi-idepo",
          "isiwo",
          "isoku-ososa",
          "itamapako",
          "itantebo",
          "odo-egbo-oliworo",
          "odo-esa",
          "porogun-i",
          "porogun-ii"
        ]
      },
      {
        "lga": "ikenne",
        "wards": [
          "ikenne-i",
          "ikenne-ii",
          "ilisan-i",
          "ilisan-ii",
          "ilisan-irolu",
          "iperu-i",
          "iperu-ii",
          "iperu-iii",
          "ogere-i",
          "ogere-ii"
        ]
      },
      {
        "lga": "imeko-afon",
        "wards": [
          "afon",
          "idi-ayin",
          "idofa",
          "ilara-alagbe",
          "imeko",
          "iwoye-jabata",
          "kajola-agberiodo",
          "oke-agbede-moriwi-matale",
          "olorunda-gbomo",
          "otapele"
        ]
      },
      {
        "lga": "ipokia",
        "wards": [
          "agada",
          "agosasa",
          "ajegunle",
          "idiroko",
          "ifonyintedo",
          "ihunbo-ilase",
          "ijofin-idosa",
          "ipokia-i",
          "ipokia-ii",
          "mauni-i",
          "mauni-ii",
          "tube"
        ]
      },
      {
        "lga": "obafemi-owode",
        "wards": [
          "ajebo",
          "ajura",
          "alapako-oni",
          "egbeda",
          "kajola",
          "mokoloki",
          "moloko-asipa",
          "oba",
          "obafemi",
          "ofada",
          "onidundu",
          "owode"
        ]
      },
      {
        "lga": "odeda",
        "wards": [
          "alabata",
          "alagbagba",
          "balogun-itesi",
          "ilugun",
          "obantoko",
          "obete",
          "odeda",
          "olodo",
          "opeji",
          "osiele"
        ]
      },
      {
        "lga": "odogbolu",
        "wards": [
          "aiyepe",
          "ala-igbile",
          "ibefun",
          "idowa",
          "ilado",
          "imodi",
          "imosan",
          "jobore-ibido-ikise",
          "odogbolu-i",
          "odogbolu-ii",
          "ogbo-moraika-ita-epo-ii",
          "ogbo-moraika-ita-epo-i",
          "okun-owa",
          "omu",
          "ososa"
        ]
      },
      {
        "lga": "ogun-water-side",
        "wards": [
          "abigi",
          "ayede-lomiro",
          "ayila-itebu",
          "efire",
          "ibiade",
          "iwopin",
          "lukogbe-ilusin",
          "makun-irokun",
          "ode-omi",
          "oni"
        ]
      },
      {
        "lga": "remo-north",
        "wards": [
          "akaka",
          "ayegbami",
          "igan-ajina",
          "ilara",
          "ipara",
          "moborode-oke-ola",
          "ode-i",
          "ode-ii",
          "odofin-imagbo-petekun-dawara",
          "orile-oko"
        ]
      },
      {
        "lga": "sagamu",
        "wards": [
          "agbowa",
          "ayegbami-ijokun",
          "ibido-ituwa-alara",
          "ijagba",
          "isokun-oyebajo",
          "isote",
          "latawa",
          "ode-lemo",
          "ogijo-likosi",
          "oko-epe-itula-i",
          "oko-epe-itula-ii",
          "sabo-1",
          "sabo-ii",
          "simawa-iwelepe",
          "surulere"
        ]
      },
      {
        "lga": "yewa-egbado-north",
        "wards": [
          "aye-toro-i",
          "aye-toro-ii",
          "ebute-igbooro",
          "ibese",
          "iboro-joga",
          "ido-foi",
          "igua",
          "ijoun",
          "imasai",
          "ohunbe",
          "sunwa"
        ]
      },
      {
        "lga": "yewa-egbado-south",
        "wards": [
          "ajilete",
          "idogo",
          "ilaro-i",
          "ilaro-ii",
          "ilaro-iii",
          "ilobi-erinja",
          "iwoye",
          "oke-odan",
          "owode-i",
          "owode-ii"
        ]
      }
    ]
  },
  {
    "state": "ondo",
    "lgas": [
      {
        "lga": "akoko-north-east",
        "wards": [
          "edo",
          "ekan",
          "ikado-i",
          "ikado-ii",
          "ilepa-i",
          "ilepa-ii",
          "isowopo-i",
          "isowopo-ii",
          "iyometa-i",
          "iyometa-ii",
          "oorun-i",
          "oorun-ii",
          "oyinmo"
        ]
      },
      {
        "lga": "akoko-north-west",
        "wards": [
          "ajowa-igasi-eriti-gedegede",
          "arigidi-ii",
          "arigidi-iye-i",
          "erusu-karamu-ibaramu",
          "ese-afin",
          "odo-irun-oyinmo",
          "ogbagi",
          "oke-irun-surulere",
          "okeagbe",
          "oyin-oge"
        ]
      },
      {
        "lga": "akoko-south-east",
        "wards": [
          "epinmi-i",
          "epinmi-ii",
          "ifira",
          "ipe-i",
          "ipe-ii",
          "ipesi",
          "isua-i",
          "isua-ii",
          "isua-iii",
          "isua-iv",
          "sosan"
        ]
      },
      {
        "lga": "akoko-south-west",
        "wards": [
          "akungba-i",
          "akungba-ii",
          "ikun",
          "oba-i",
          "oba-ii",
          "oka-i-ibaka-sabo",
          "oka-ii-a-ikanmu",
          "oka-ii-b-okia-korowa-simerin-uba",
          "oka-iii-a-agba",
          "oka-iii-b-owase-ikese-iwonrin-ebinrin-idorin",
          "oka-iv-owake-ebo-ayegunle",
          "oka-v-a-owalusin-ayepe",
          "oka-v-b-oka-odo-okela-bolorunduro",
          "supare-i",
          "supare-ii"
        ]
      },
      {
        "lga": "akure-north",
        "wards": [
          "agamo-oke-oore-akomowa",
          "ayede-ogbese",
          "ayetoro",
          "igbatoro",
          "igoba-isinigbo",
          "iluabo-eleyewo-bolorunduro",
          "isimija-irado",
          "moferere",
          "oba-ile",
          "odo-oja-ijigbo",
          "oke-iju",
          "oke-afa-owode"
        ]
      },
      {
        "lga": "akure-south",
        "wards": [
          "aponmu",
          "gbogi-isikan-i",
          "gbogi-isikan-ii",
          "ijomu-obanla",
          "lisa",
          "oda",
          "odopetu",
          "oke-aro-uro-i",
          "oke-aro-uro-ii",
          "oshodi-isolo",
          "owode-imuagun"
        ]
      },
      {
        "lga": "ese-odo",
        "wards": [
          "apoi-i",
          "apoi-ii",
          "apoi-iii",
          "apoi-iv",
          "apoi-v",
          "arogbo-i",
          "arogbo-ii",
          "arogbo-iii",
          "ukparama-i",
          "ukparama-ii"
        ]
      },
      {
        "lga": "idanre",
        "wards": [
          "ala-elefosan",
          "alade-atosin",
          "idale-lemikan",
          "idale-logbosere",
          "ijomu-isurin",
          "irowo",
          "isalu-ehinpeti",
          "isalu-jigbokin",
          "ofosu-onisere",
          "owena-aponmulona"
        ]
      },
      {
        "lga": "ifedore",
        "wards": [
          "ero-ibuji-mariwo",
          "igbaka-oke-i",
          "igbaka-oke-ii",
          "ijare-1",
          "ijare-11",
          "ilara-1",
          "ilara-11",
          "ipogun-ibule",
          "isarun-erigi",
          "obo-ikota-olo-gbo"
        ]
      },
      {
        "lga": "ilaje",
        "wards": [
          "aheri",
          "etikan",
          "mahin-1",
          "mahin-11",
          "mahin-111",
          "mahin-1v",
          "ugbo-1",
          "ugbo-11",
          "ugbo-111",
          "ugbo-1v",
          "ugbo-v",
          "ugbo-v1"
        ]
      },
      {
        "lga": "ileoluji-okeigbo",
        "wards": [
          "ileoluji-1",
          "ileoluji-11",
          "ileoluji-1v",
          "ileoluji-iii",
          "ileoluji-v",
          "ileoluji-vi",
          "oke-igbo-1",
          "oke-igbo-11",
          "oke-igbo-111",
          "oke-igbo-1v"
        ]
      },
      {
        "lga": "irele",
        "wards": [
          "ajagba-1",
          "ajagba-11",
          "akotogbo-1",
          "akotogbo-11",
          "irele-1",
          "irele-11",
          "irele-1v",
          "irele-iii",
          "irele-v",
          "iyansan-omi"
        ]
      },
      {
        "lga": "odigbo",
        "wards": [
          "agbabu",
          "ago-alaye",
          "ajue",
          "araromi-obu",
          "ayesan",
          "ebijan",
          "koseru",
          "odigbo",
          "oniparaga",
          "ore-1",
          "ore-11"
        ]
      },
      {
        "lga": "okitipupa",
        "wards": [
          "aye-11",
          "ayeka-igbodigo",
          "erinje",
          "igbotako-1",
          "igbotako-11",
          "iju-odo-erekiti",
          "ikoya-oloto",
          "ilutitun-1",
          "ilutitun-111",
          "ilutitun-ii",
          "ode-aye-1",
          "okitipupa-1",
          "okitipupa-11"
        ]
      },
      {
        "lga": "ondo-east",
        "wards": [
          "asantan-oja",
          "ateru-otasan-igba",
          "bolorunduro-1",
          "epe",
          "fagbo",
          "obada",
          "oboto",
          "orisunmibare",
          "owena-bridge",
          "tepo"
        ]
      },
      {
        "lga": "ondo-west",
        "wards": [
          "enuowa-obalalu",
          "gbaghengha-gbongbo-ajagba-alafia",
          "ifore-odosida-loro",
          "ilunla-bagbe-odowo-i",
          "ilunla-bagbe-odowo-ii",
          "litaye-obunkekere-igbindo",
          "lodasa-iparuku-lijoka",
          "odojomu-erinketa-legiri",
          "oke-otunba-oke-diba-sokoti",
          "okeagunla-okerowo-okekuta",
          "okelisa-okedoko-ogbodu",
          "orisunmibare-araromi"
        ]
      },
      {
        "lga": "ose",
        "wards": [
          "afo",
          "idoani-1",
          "idoani-11",
          "idogun",
          "ifon-1",
          "ifon-11",
          "ijagba",
          "ikaro-elegbeka",
          "imeri",
          "imoru-arimogija",
          "okeluse",
          "ute"
        ]
      },
      {
        "lga": "owo",
        "wards": [
          "ehinogbe",
          "igboroko-1",
          "igboroko-11",
          "ijebu-1",
          "ijebu-11",
          "iloro",
          "ipele",
          "isaipen",
          "isuada-ipenmen-idasan-obasooto",
          "iyare",
          "uso-emure-ile"
        ]
      }
    ]
  },
  {
    "state": "osun",
    "lgas": [
      {
        "lga": "atakumosa-east",
        "wards": [
          "ajebandele",
          "ayegunle",
          "eti-oni",
          "faforiji",
          "forest-reserve-1",
          "forest-reserve-ii",
          "igangan",
          "iperindo",
          "ipole",
          "iwara"
        ]
      },
      {
        "lga": "atakumosa-west",
        "wards": [
          "ibodi",
          "ifelodun",
          "ifewara-i",
          "ifewara-ii",
          "isa-obi",
          "ita-gunmodi",
          "muroko",
          "oke-bode",
          "osu-iii",
          "osu-i",
          "osu-ii"
        ]
      },
      {
        "lga": "ayedaade",
        "wards": [
          "anlugbua",
          "araromi-owu",
          "balogun",
          "gbongan-rural",
          "ijegbe-oke-eso-oke-owu-ijugbe",
          "lagere-amola",
          "obalufon",
          "ode-omu-rural",
          "olufi",
          "otun-balogun",
          "otun-olufi"
        ]
      },
      {
        "lga": "ayedire",
        "wards": [
          "ileogbo-i",
          "ileogbo-ii",
          "ileogbo-iii",
          "ileogbo-iv",
          "kuta-i",
          "kuta-ii",
          "oke-osun",
          "oluponna-1",
          "oluponna-1i",
          "oluponna-1ii"
        ]
      },
      {
        "lga": "boluwaduro",
        "wards": [
          "eripa",
          "gbeleru-obaala-i",
          "gbeleru-obaala-ii",
          "iresi-i",
          "iresi-ii",
          "obala-iloro",
          "oke-ode-otan",
          "oke-irun",
          "oke-omi-otan",
          "oke-otan"
        ]
      },
      {
        "lga": "boripe",
        "wards": [
          "ada-i",
          "ada-ii",
          "agba",
          "college-egbada-road",
          "isale-asa-iree",
          "isale-oyo",
          "oja-oba",
          "oke-aree",
          "oke-esa-oke-ogi",
          "oloti-iragbiji",
          "ororuwo"
        ]
      },
      {
        "lga": "ede-north",
        "wards": [
          "abogunde-sagba",
          "alusekere",
          "apaso",
          "bara-ejemu",
          "isibo-buari-isola",
          "jagun-jagun-ede",
          "olaba-atapara",
          "ologun-agbaakin",
          "olusokun",
          "sabo-agbongbe-i",
          "sabo-agbongbe-ii"
        ]
      },
      {
        "lga": "ede-south",
        "wards": [
          "alajue-i",
          "alajue-ii",
          "asunmo",
          "babanla-agate",
          "babasanya",
          "kuye",
          "loogun",
          "olodan",
          "oloki-akoda",
          "sekona"
        ]
      },
      {
        "lga": "egbedore",
        "wards": [
          "ara-i",
          "ara-ii",
          "awo-abudo",
          "ido-osun",
          "ikotun",
          "ira-gberi-i",
          "ira-gberi-ii",
          "iwoye-idoo-origo",
          "ojo-aro",
          "okin-ni-olorunsogo-ofatedo"
        ]
      },
      {
        "lga": "ejigbo",
        "wards": [
          "elejigbo-a",
          "elejigbo-b-osolo",
          "elejigbo-c-mapo",
          "elejigbo-d-ejemu",
          "elejigbo-ayegbogbo",
          "ifeodan-a-owu-ile",
          "ifeodan-b-masifa",
          "ilawo-isoko-isundunrin",
          "inisa-i-aato-igbon",
          "inisa-ii-afaake-ayegunle",
          "ola-aye-agurodo"
        ]
      },
      {
        "lga": "ife-central",
        "wards": [
          "akarabata",
          "ilare-1",
          "ilare-1i",
          "ilare-iii",
          "ilare-iv",
          "iremo-ii-eleyele",
          "iremo-iii",
          "iremo-iv",
          "iremo-v",
          "iremo-ajebandele",
          "more-ojaja"
        ]
      },
      {
        "lga": "ife-east",
        "wards": [
          "ilode-i",
          "ilode-ii",
          "modakeke-ii",
          "modakeke-iii",
          "modakeke-i",
          "more",
          "okerewe-i",
          "okerewe-ii",
          "okerewe-iii",
          "yekemi"
        ]
      },
      {
        "lga": "ife-north",
        "wards": [
          "asipa-akinlalu",
          "edunabon-i",
          "edunabon-ii",
          "famia",
          "ipetumodu-i",
          "ipetumodu-ii",
          "moro",
          "oyere-ii",
          "oyere-i",
          "yakoyo"
        ]
      },
      {
        "lga": "ife-south",
        "wards": [
          "aare",
          "abiri-ogudu",
          "aye",
          "ayesan",
          "ikija-i",
          "ikija-ii",
          "kere",
          "mefoworade",
          "oke-owena",
          "olode",
          "osi"
        ]
      },
      {
        "lga": "ifedayo",
        "wards": [
          "akesin",
          "asaoni",
          "aworo-oke-ila-rural",
          "ayetoro",
          "balogun",
          "co-operative",
          "isinmi",
          "obaale",
          "oyi",
          "temidire"
        ]
      },
      {
        "lga": "ifelodun",
        "wards": [
          "amola-ikirun",
          "eesa-ikirun",
          "ekoende-eko-ajala",
          "iba-i",
          "iba-ii",
          "ikirun-rural",
          "isale-oke-afo",
          "obagun",
          "okeba-ikirun",
          "olonde-ikirun",
          "owode-ikirun",
          "station-road-ikirun"
        ]
      },
      {
        "lga": "ila",
        "wards": [
          "ajaba-edemosi-aba-orangun",
          "ejigbo-i",
          "ejigbo-ii",
          "ejigbo-iii",
          "eyindi",
          "eyindi-iperin",
          "iperin",
          "isedo-i",
          "isedo-ii",
          "oke-ede",
          "oke-ola"
        ]
      },
      {
        "lga": "ilesa-east",
        "wards": [
          "biladu",
          "bolorunduro",
          "ifosan-oke-eso",
          "ijamo",
          "ilerin",
          "iloro-roye",
          "imo",
          "isare",
          "itisin-ogudu",
          "okesa",
          "upper-lower-ijoka"
        ]
      },
      {
        "lga": "ilesa-west",
        "wards": [
          "ayeso",
          "ereja",
          "ikoti-araromi",
          "ilaje",
          "isida-adeti",
          "isokun",
          "itakogun",
          "lower-egbedi",
          "omofe-idasa",
          "upper-and-lower-igbogi"
        ]
      },
      {
        "lga": "irepodun",
        "wards": [
          "bara-a",
          "bara-b",
          "elerin-a",
          "elerin-b",
          "elerin-c",
          "elerin-d",
          "elerin-e",
          "olobu-a",
          "olobu-c",
          "olobu-d",
          "olubu-b"
        ]
      },
      {
        "lga": "irewole",
        "wards": [
          "ikire-a",
          "ikire-b",
          "ikire-c",
          "ikire-d",
          "ikire-e",
          "ikire-f",
          "ikire-g",
          "ikire-h",
          "ikire-i",
          "ikire-j",
          "ikire-k"
        ]
      },
      {
        "lga": "isokan",
        "wards": [
          "alapomu-i-odo-osun",
          "alapomu-ii",
          "asalu-mogimogi",
          "asalu-ikoyi",
          "awala-i",
          "awala-ii",
          "idogun-ward",
          "olukoyi-oja-osun",
          "oosa-adifa",
          "oranran-ward",
          "osa-ikoyi-oloke"
        ]
      },
      {
        "lga": "iwo",
        "wards": [
          "gidigbo-i",
          "gidigbo-ii",
          "gidigbo-iii",
          "isale-oba-i",
          "isale-oba-ii",
          "isale-oba-iii",
          "isale-oba-iv",
          "molete-i",
          "molete-ii",
          "molete-iii",
          "oke-adan-i",
          "oke-adan-ii",
          "oke-adan-iii",
          "oke-oba-i",
          "oke-oba-ii"
        ]
      },
      {
        "lga": "obokun",
        "wards": [
          "eesun-ido-oko",
          "esa-odo",
          "esa-oke",
          "ibokun-township",
          "ilahun-ikinyinwa",
          "ilare",
          "ilase-idominasi",
          "imesi-ile",
          "ipetu-ile-adaowode",
          "otan-ile"
        ]
      },
      {
        "lga": "odo-otin",
        "wards": [
          "asi-asaba",
          "baale",
          "ekosin-iyeku",
          "esa-otun-baale-ode",
          "faji-opete",
          "igbaye",
          "ijabe-ila-odo",
          "jagun-osi-bale-ode",
          "oba-ojomu",
          "okua-ekusa",
          "oloyan-elemosho-esa",
          "olukotun",
          "olunisa",
          "ore-agbeye",
          "osolo-oparin-ola"
        ]
      },
      {
        "lga": "ola-oluwa",
        "wards": [
          "ajagba-iwo-oke",
          "asa-ajagunlase",
          "asamu-ilemowu",
          "bode-osi",
          "ikire-ile-iwara",
          "isero-ikonifin",
          "obamoro-ile-ogo",
          "ogbaagba-i",
          "ogbaagba-ii",
          "telemu"
        ]
      },
      {
        "lga": "olorunda",
        "wards": [
          "agowande",
          "akogun",
          "atelewo",
          "ayetoro",
          "balogun",
          "ilie",
          "oba-oke",
          "oba-ile",
          "owode-i",
          "owode-ii",
          "owoope"
        ]
      },
      {
        "lga": "oriade",
        "wards": [
          "apoti-dagbaja",
          "erin-ijesa",
          "erin-oke",
          "erinmo-iwaraja",
          "ijebu-jesa",
          "ijeda-iloko",
          "ijeji-arakeji-owena",
          "ikeji-ile",
          "ipetu-ijesa-i",
          "ipetu-ijesa-ii",
          "ira",
          "iwoye"
        ]
      },
      {
        "lga": "orolu",
        "wards": [
          "olufon-orolu-j",
          "olufon-orolu-a",
          "olufon-orolu-b",
          "olufon-orolu-i",
          "olufon-orolu-c",
          "olufon-orolu-d",
          "olufon-orolu-e",
          "olufon-orolu-f",
          "olufon-orolu-g",
          "olufon-orolu-h"
        ]
      },
      {
        "lga": "osogbo",
        "wards": [
          "alagba",
          "are-ago",
          "ataoja-a",
          "ataoja-b",
          "ataoja-c",
          "ataoja-d",
          "ataoja-e",
          "baba-kekere",
          "ekerin",
          "eketa",
          "jagun-a",
          "jagun-b",
          "otun-balogun-a",
          "otun-hagun-b",
          "otun-jagun-a"
        ]
      }
    ]
  },
  {
    "state": "oyo",
    "lgas": [
      {
        "lga": "afijio",
        "wards": [
          "akinmorin-jobele",
          "awe-i",
          "awe-ii",
          "fiditi-i",
          "fiditi-ii",
          "ilora-i",
          "ilora-ii",
          "ilora-iii",
          "imini",
          "iware"
        ]
      },
      {
        "lga": "akinyele",
        "wards": [
          "ajibade-alabata-elekuru",
          "akinyele-isabiyi-irepodun",
          "arulogun-eniosa-aroro",
          "ijaye-ojedeji",
          "ikereku",
          "iroko",
          "iwokoto-talontan-idi-oro",
          "ojo-emo-moniya",
          "ojoo-ajibode-laniba",
          "olanla-oboda-labode",
          "olode-amosun-onidundu",
          "olorisa-oko-okegbemi-mele"
        ]
      },
      {
        "lga": "atiba",
        "wards": [
          "agunpopo-i",
          "agunpopo-ii",
          "agunpopo-iii",
          "aremo",
          "ashipa-i",
          "ashipa-ii",
          "ashipa-iii",
          "bashorun",
          "oke-afin-1",
          "oke-afin-ii"
        ]
      },
      {
        "lga": "atisbo",
        "wards": [
          "ago-are-i",
          "ago-are-ii",
          "alaga",
          "basi",
          "irawo-ile",
          "irawo-owode",
          "ofiki",
          "owo-agunrege-sabe",
          "tede-i",
          "tede-ii"
        ]
      },
      {
        "lga": "egbeda",
        "wards": [
          "ayede-alugbo-koloko",
          "egbeda",
          "erunmu",
          "olodan-ajinogbo",
          "olode-alakia",
          "olodo-ii",
          "olodo-iii",
          "olodo-kumapayi-i",
          "olubadan-estate",
          "osegere-awaye",
          "owobaale-kasumu"
        ]
      },
      {
        "lga": "ibadan-north",
        "wards": [
          "ward-i-n2",
          "ward-ii-n3",
          "ward-iii-n4",
          "ward-iv-n5a",
          "ward-ix-n6b-part-i",
          "ward-v-n5b",
          "ward-vi-n6a-part-i",
          "ward-vii-n6a-part-ii",
          "ward-viii-n6a-part-iii",
          "ward-x-n6b-part-ii",
          "ward-xi-nw8",
          "ward-xii-nw8"
        ]
      },
      {
        "lga": "ibadan-north-east",
        "wards": [
          "iii-e3",
          "ward-2-ni-part-ii",
          "ward-i-ei",
          "ward-iv-e4",
          "ward-ix-e7ii",
          "ward-v-e5a",
          "ward-vi-e5b",
          "ward-vii-e6",
          "ward-viii-e7-i",
          "ward-x-e8",
          "ward-xi-e9-i",
          "ward-xii-e9-ii"
        ]
      },
      {
        "lga": "ibadan-north-west",
        "wards": [
          "ward-10-nw7",
          "ward-11-nw7",
          "ward-2-ni-part-ii",
          "ward-3-nw1",
          "ward-4-nw2",
          "ward-5-nw3-part-i",
          "ward-6-nw3-part-i",
          "ward-7-nw4",
          "ward-8-nw5",
          "ward-9-nw6",
          "ward-i-ni-part-i"
        ]
      },
      {
        "lga": "ibadan-south-west",
        "wards": [
          "ward-08-sw7",
          "ward-1-c2",
          "ward-10-sw8-ii",
          "ward-11-sw9-1",
          "ward-12-sw9-ii",
          "ward-2-sw1",
          "ward-3-sw2",
          "ward-4-sw3a-3b",
          "ward-5-sw4",
          "ward-6-sw5",
          "ward-7-sw6",
          "ward-9-sw8-1"
        ]
      },
      {
        "lga": "ibadan-south-east",
        "wards": [
          "c1",
          "s-s5",
          "s-1",
          "s-2a",
          "s-3",
          "s-4a",
          "s-4b",
          "s-6a",
          "s-7a",
          "s-7b",
          "s-2b",
          "s-6b"
        ]
      },
      {
        "lga": "ibarapa-central",
        "wards": [
          "iberekodo-i-pataoju",
          "iberekodo-agbooro-ita-baale",
          "idere-i-molete",
          "idere-ii-ominigbo-oke-oba",
          "idere-iii-koso-apa",
          "idofin-isaganun",
          "igbole-pako",
          "isale-oba",
          "oke-odo",
          "okeserin-i-ii"
        ]
      },
      {
        "lga": "ibarapa-east",
        "wards": [
          "aborerin",
          "anko",
          "isaba",
          "isale-togun",
          "itabo",
          "new-eruwa",
          "oke-oba",
          "oke-otun",
          "oke-imale",
          "sango"
        ]
      },
      {
        "lga": "ibarapa-north",
        "wards": [
          "ayete-i",
          "ayete-ii",
          "igangan-i",
          "igangan-ii",
          "igangan-iii",
          "igangan-iv",
          "ofiki-i",
          "ofiki-ii",
          "tapa-i",
          "tapa-ii"
        ]
      },
      {
        "lga": "ido",
        "wards": [
          "aba-emo-ilaju-alako",
          "akinware-akindele",
          "akufo-idigba-araromi",
          "apete-ayegun-awotan",
          "batake-idi-iya",
          "erinwusi-koguo-odetola",
          "fenwa-oganla-elenusonso",
          "ido-onikede-okuna-awo",
          "ogundele-alaho-siba-idi-ahun",
          "omi-adio-omi-onigbagbo-bakatari"
        ]
      },
      {
        "lga": "irepo",
        "wards": [
          "agoro",
          "ajagunna",
          "atipa",
          "iba-i",
          "iba-ii",
          "iba-iii",
          "iba-iv",
          "iba-v",
          "ikolaba",
          "laha-ajana"
        ]
      },
      {
        "lga": "iseyin",
        "wards": [
          "ado-awaye",
          "akinwumi-osoogun",
          "ekunle-i",
          "ekunle-ii",
          "faramora",
          "ijemba-oke-ola-oke-oja",
          "isalu-i",
          "isalu-ii",
          "koso-i",
          "koso-ii",
          "ladogan-oke-eyin"
        ]
      },
      {
        "lga": "itesiwaju",
        "wards": [
          "babaode",
          "igbojaiye",
          "ipapo",
          "komu",
          "okaka-i",
          "okaka-ii",
          "oke-amu",
          "otu-1",
          "otu-ii",
          "owode-ipapo"
        ]
      },
      {
        "lga": "iwajowa",
        "wards": [
          "agbaakin-i",
          "agbaakin-ii",
          "iwere-ile-i",
          "iwere-ile-ii",
          "iwere-ile-iii",
          "iwere-ile-iv",
          "sabi-gana-i",
          "sabi-gana-ii",
          "sabi-gana-iii",
          "sabi-gana-iv"
        ]
      },
      {
        "lga": "kajola",
        "wards": [
          "ayetoro-oke-i",
          "elero",
          "gbelekale-i-ii",
          "iba-ogan",
          "ijo",
          "ilaji-oke-iwere-oke",
          "imoba-oke-ogun",
          "isemi-ile-imia-ilua",
          "isia",
          "kajola",
          "olele"
        ]
      },
      {
        "lga": "lagelu",
        "wards": [
          "ajara-opeodu",
          "apatere-kuffi-ogunbode-ogo",
          "arulogun-ehin-kelebe",
          "ejioku-igbon-ariku",
          "lagelu-market-kajola-gbena",
          "lagun",
          "lalupon-i",
          "lalupon-ii",
          "lalupon-iii",
          "ofa-igbo",
          "ogunjana-olowode-ogburo",
          "ogunremi-ogunsina",
          "oyedeji-olode-kutayi",
          "sagbe-pabiekun"
        ]
      },
      {
        "lga": "ogbomoso-north",
        "wards": [
          "aaje-ogunbado-oke-agbede",
          "abogunde",
          "aguodo-masifa",
          "isale-afon",
          "isale-alaasa",
          "isale-ora-saja",
          "jagun",
          "okelerin",
          "osupa",
          "sabo-tara"
        ]
      },
      {
        "lga": "ogbomoso-south",
        "wards": [
          "akata",
          "alapata",
          "arowomole",
          "ibapon",
          "ijeru-i",
          "ijeru-ii",
          "ilogbo",
          "isoko",
          "lagbedu",
          "oke-ola-farm-settlement"
        ]
      },
      {
        "lga": "ogo-oluwa",
        "wards": [
          "ajaawa-i",
          "ajaawa-ii",
          "ayede",
          "ayetoro",
          "idewure",
          "lagbedu",
          "mowolowo-iwo-ate",
          "odo-oba",
          "opete",
          "otamokun"
        ]
      },
      {
        "lga": "olorunsogo",
        "wards": [
          "aboke-aboyun-ogun",
          "elerugba-elehinke-sagbo-aperu",
          "ikolaba-obadimo",
          "onigbeti-i-iyamopo",
          "onigbeti-ii-saagbon-agoro-santo",
          "onigbeti-iii-iv-agbeni",
          "opa-ogunniyi",
          "seriki-i-abosino-okin",
          "seriki-ii-agbele",
          "waro-apata-alaje"
        ]
      },
      {
        "lga": "oluyole",
        "wards": [
          "ayegun",
          "idi-iroko-ikereku",
          "idi-osan-egbeda-atuba",
          "muslim-ogbere",
          "odo-ona-nla",
          "okanhinde-latunde",
          "olomi-olunde",
          "olonde-aba-nla",
          "onipe",
          "orisunbare-ojo-ekun"
        ]
      },
      {
        "lga": "ona-ara",
        "wards": [
          "akanran-olorunda",
          "araromi-aperin",
          "badeku",
          "gbada-efon",
          "odi-odeyale-odi-aperin",
          "ogbere",
          "ogbere-tioya",
          "ojoku-ajia",
          "olode-gbedun-ojebode",
          "olorunsogo",
          "oremeji-agugu"
        ]
      },
      {
        "lga": "orelope",
        "wards": [
          "aare",
          "alepata",
          "bonni",
          "igbope-iyeye-i",
          "igbope-iyeye-ii",
          "igi-isubu",
          "onibode-i",
          "onibode-ii",
          "onibode-iii",
          "onigboho-alomo-okere"
        ]
      },
      {
        "lga": "ori-ire",
        "wards": [
          "ori-ire-i",
          "ori-ire-ii",
          "ori-ire-iii",
          "ori-ire-iv",
          "ori-ire-ix",
          "ori-ire-v",
          "ori-ire-vi",
          "ori-ire-vii",
          "ori-ire-viii",
          "ori-ire-x"
        ]
      },
      {
        "lga": "oyo-east",
        "wards": [
          "agboye-molete",
          "ajagba",
          "alaodi-modeke",
          "apaara",
          "apinni",
          "balogun",
          "jabata",
          "oke-apo",
          "oluajo",
          "owode-araromi"
        ]
      },
      {
        "lga": "oyo-west",
        "wards": [
          "ajokidero-akewugberu",
          "akeetan",
          "fasola-soku",
          "iseke",
          "isokun",
          "iyaji",
          "ojongbodu",
          "opapa",
          "owode",
          "pakoyi-idode"
        ]
      },
      {
        "lga": "saki-east",
        "wards": [
          "agbonle",
          "ago-amodu-i",
          "ago-amodu-ii",
          "ogbooro-i",
          "ogbooro-ii",
          "oje-owode-i",
          "oje-owode-ii",
          "sepeteri-i",
          "sepeteri-ii",
          "sepeteri-iii",
          "sepeteri-iv"
        ]
      },
      {
        "lga": "saki-west",
        "wards": [
          "aganmu-kooko",
          "ajegunle",
          "bagii",
          "ekokan-mua",
          "iya",
          "ogidigbo-kinnikinni",
          "oke-oro",
          "okere-i",
          "okere-ii",
          "sangote-booda-baabo-ilus",
          "sepeteri-bapon"
        ]
      },
      {
        "lga": "surulere",
        "wards": [
          "baya-oje",
          "igbon-gambari",
          "iresaadu-i-iresaapa",
          "iresaadu-ii-arolu",
          "iresaadu-iii-iresaadu",
          "iresaadu-iv-iregba",
          "iwofin",
          "oko-i-oko",
          "oko-ii-ilajue",
          "oko-iii-mayin"
        ]
      }
    ]
  },
  {
    "state": "plateau",
    "lgas": [
      {
        "lga": "barikin-ladi",
        "wards": [
          "barakin-ladi",
          "gassa-sho",
          "gindin-akwati",
          "heipang",
          "kapwis",
          "kurra-falls",
          "lobiring",
          "marit-mazat",
          "rafan",
          "tafan",
          "zabot"
        ]
      },
      {
        "lga": "bassa",
        "wards": [
          "buhit",
          "buji",
          "gabia",
          "gurum",
          "jengre",
          "kadamo",
          "kakkek",
          "kasuru",
          "kimakpa",
          "kishika",
          "mafara",
          "rimi",
          "ta-agbe",
          "tahu",
          "zabolo",
          "zobwo"
        ]
      },
      {
        "lga": "bokkos",
        "wards": [
          "bokkos",
          "butura",
          "daffo",
          "damwai",
          "kwatas",
          "mangor",
          "manguna",
          "mbar-mangar",
          "mushere-west",
          "mushere-central",
          "richa",
          "sha",
          "tangur",
          "toff"
        ]
      },
      {
        "lga": "jos-east",
        "wards": [
          "federe",
          "fobur-b",
          "fobur-a",
          "fursum",
          "jarawan-kogi",
          "mai-gemu",
          "maijuju",
          "shere-east",
          "shere-west",
          "zandi"
        ]
      },
      {
        "lga": "jos-north",
        "wards": [
          "abba-na-shehu",
          "ali-kazaure",
          "gangare",
          "garba-daho",
          "ibrahim-katsina",
          "jenta-adamu",
          "jenta-apata",
          "jos-jarawa",
          "naraguta-a",
          "naraguta-b",
          "sarkin-arab",
          "tafawa-balewa",
          "tudun-wada-kabong",
          "vanderpuye"
        ]
      },
      {
        "lga": "jos-south",
        "wards": [
          "bukuru",
          "du",
          "giring",
          "gyel-a",
          "gyel-b",
          "kuru-a",
          "kuru-b",
          "shen",
          "turu",
          "vwang",
          "zawan-a",
          "zawan-b"
        ]
      },
      {
        "lga": "kanam",
        "wards": [
          "birbyang",
          "dengi",
          "dugub",
          "gagdib",
          "garga",
          "gumsher",
          "gwamlar",
          "jarmai",
          "jom",
          "kanam",
          "kantana",
          "kunkyam",
          "munbutbo",
          "namaran"
        ]
      },
      {
        "lga": "kanke",
        "wards": [
          "ampang-east",
          "amper-chika-a",
          "amper-chika-b",
          "amper-seri",
          "dawaki",
          "garram",
          "kabwir-pada",
          "kabwir-gyangyang",
          "langshi",
          "nemel"
        ]
      },
      {
        "lga": "langtang-north",
        "wards": [
          "funyalang",
          "jat",
          "keller",
          "kuffen",
          "kwallak",
          "kwande",
          "lipchok",
          "mban-zamko",
          "nyer",
          "pajat",
          "pil-gani",
          "pishe-yashi",
          "reak",
          "waroh"
        ]
      },
      {
        "lga": "langtang-south",
        "wards": [
          "dadin-kowa",
          "fajul",
          "gamakai",
          "lashel",
          "mabudi",
          "magama",
          "sabon-gida",
          "talgwang",
          "timbol",
          "turaki"
        ]
      },
      {
        "lga": "mangu",
        "wards": [
          "ampang-west",
          "chanso",
          "gindiri-1",
          "gindiri-11",
          "jannaret",
          "jipal-chakfem",
          "kadunu",
          "kerang",
          "kombun",
          "langai",
          "mangu-1",
          "mangu-11",
          "mangu-halle",
          "mangun",
          "pan-yam",
          "pushit"
        ]
      },
      {
        "lga": "mikang",
        "wards": [
          "baltep",
          "garkawa-central",
          "garkawa-north",
          "garkawa-north-east",
          "koenoem-a",
          "koenoem-b",
          "lalin",
          "piapung-a",
          "piapung-b",
          "tunkus"
        ]
      },
      {
        "lga": "pankshin",
        "wards": [
          "chip",
          "dok-pai",
          "fier",
          "jiblik",
          "kadung",
          "kangshu",
          "lankang",
          "pankshin-chigwong",
          "pankshin-south-belning",
          "pankshin-central",
          "tal",
          "wokkos"
        ]
      },
      {
        "lga": "qua'an-pan",
        "wards": [
          "bwall",
          "doemak-goechim",
          "doemak-koplong",
          "dokan-kasuwa",
          "kurgwi",
          "kwa",
          "kwalla-moeda",
          "kwalla-yitla-ar",
          "kwande",
          "kwang",
          "namu"
        ]
      },
      {
        "lga": "riyom",
        "wards": [
          "attakar",
          "bum",
          "danto",
          "jol-kwi",
          "ra-hoss",
          "rim",
          "riyom",
          "sharubutu",
          "sopp",
          "ta-hoss"
        ]
      },
      {
        "lga": "shendam",
        "wards": [
          "derteng",
          "kalong",
          "kurungbau-a",
          "kurungbau-b",
          "moekat",
          "pangshom",
          "poeship",
          "shendam-central-a",
          "shendam-central-b",
          "shimankar",
          "yelwa"
        ]
      },
      {
        "lga": "wase",
        "wards": [
          "bashar",
          "danbiram",
          "gudus",
          "kadarko",
          "kumbong",
          "kumbur",
          "kuyambana",
          "mavo",
          "nyalum-kampani",
          "saluwe",
          "wase-tofa",
          "yola-wakat"
        ]
      }
    ]
  },
  {
    "state": "rivers",
    "lgas": [
      {
        "lga": "abua-odual",
        "wards": [
          "abua-iv",
          "abua-i",
          "abua-ii",
          "abua-iii",
          "agada",
          "akani",
          "anyu",
          "emago-kugbo",
          "emelego",
          "emughan-i",
          "emughan-ii",
          "okpeden",
          "otapha"
        ]
      },
      {
        "lga": "ahoada-east",
        "wards": [
          "ahoada-iv",
          "ahoada-i",
          "ahoada-ii",
          "ahoada-iii",
          "akoh-i",
          "akoh-ii",
          "akoh-iii",
          "uppata-iii",
          "uppata-iv",
          "uppata-v",
          "uppata-vi",
          "uppata-i",
          "uppata-ii"
        ]
      },
      {
        "lga": "ahoada-west",
        "wards": [
          "ediro-i",
          "ediro-ii",
          "igbuduya-i",
          "igbuduya-ii",
          "igbuduya-iii",
          "igbuduya-iv",
          "joinkrama",
          "okarki",
          "ubie-i",
          "ubie-ii",
          "ubie-iii",
          "ubie-iv"
        ]
      },
      {
        "lga": "akuku-toru",
        "wards": [
          "alise-group",
          "briggs-i",
          "briggs-ii",
          "briggs-iii",
          "georgewill-ii",
          "georgewill-iii",
          "georgwill-iii",
          "jack-i",
          "jack-ii",
          "jack-iii",
          "kula-i",
          "kula-ii",
          "manuel-i",
          "manuel-ii",
          "manuel-iii",
          "north-south-group",
          "obonoma"
        ]
      },
      {
        "lga": "andoni",
        "wards": [
          "agwut-obolo",
          "asarama",
          "ataba-i",
          "ataba-ii",
          "ekede",
          "ikuru-town",
          "ngo-town",
          "samanga",
          "unyeada-i",
          "unyeada-ii",
          "unyen-gala"
        ]
      },
      {
        "lga": "asari-toru",
        "wards": [
          "buguma-east-i",
          "buguma-east-ii",
          "buguma-north-east",
          "buguma-south-west",
          "buguma-east-west",
          "buguma-north-west-ii",
          "buguma-north-west-i",
          "buguma-south",
          "buguma-south-east",
          "buguma-west",
          "isia-group-i",
          "isia-group-ii",
          "west-cental-group"
        ]
      },
      {
        "lga": "bonny",
        "wards": [
          "ward-i-oro-igwe",
          "ward-ii-court-ada-allison",
          "ward-iii-dan-jumbo-beresiri",
          "ward-iii-orosiriri",
          "ward-iv-new-layout",
          "ward-ix-nanabie",
          "ward-v-finima",
          "ward-vi-abalamabie",
          "ward-vii-dema-abbey",
          "ward-x-oloma-ayaminima",
          "ward-xi-peterside",
          "ward-xii-kalaibiama"
        ]
      },
      {
        "lga": "degema",
        "wards": [
          "bakana-vi",
          "bakana-i",
          "bakana-ii",
          "bakana-iii",
          "bakana-iv",
          "bakana-v",
          "bille",
          "bukuma",
          "degema-i",
          "degema-ii",
          "degema-iii",
          "ke-old-bakana",
          "obuama",
          "tomble-i",
          "tomble-ii",
          "tomble-iii",
          "tomble-iv"
        ]
      },
      {
        "lga": "eleme",
        "wards": [
          "agbonchia",
          "akpajo",
          "alesa",
          "aleto",
          "alode",
          "ebubu",
          "ekporo",
          "eteo",
          "ogale",
          "onne"
        ]
      },
      {
        "lga": "emohua",
        "wards": [
          "egbeda",
          "elele-alimini",
          "emohua-ii",
          "emohua-i",
          "ibaa",
          "obelle",
          "odegu-i",
          "odegu-ii",
          "ogbakiri-i",
          "ogbakiri-ii",
          "omudioga-akpadu",
          "rumuekpe",
          "rundele",
          "ubimini"
        ]
      },
      {
        "lga": "etche",
        "wards": [
          "afara",
          "akpoku-umuoye",
          "akwa-odogwa",
          "egbu",
          "egwi-opiro",
          "igbo-i",
          "igbo-ii",
          "igbo-iii",
          "igbodo",
          "mba",
          "ndashi",
          "nihi",
          "obibi-akwukabi",
          "obite",
          "odufor",
          "okehi",
          "owu",
          "ozuzu",
          "ulakwo"
        ]
      },
      {
        "lga": "gokana",
        "wards": [
          "b-dere",
          "bera",
          "biara-i",
          "biara-ii",
          "bodo-i",
          "bodo-ii",
          "bodo-iii",
          "bomu-i",
          "bomu-ii",
          "derken-deeyor-nweribiara",
          "k-dere-i",
          "k-dere-ii",
          "kpor-lewe-gbe",
          "mogho",
          "nweol-gioko-barako",
          "yeghe-i",
          "yeghe-ii"
        ]
      },
      {
        "lga": "ikwerre",
        "wards": [
          "aluu",
          "apani",
          "elele-i",
          "elele-ii",
          "igwuruta",
          "isiokpo-i",
          "isiokpo-ii",
          "omademe-ipo",
          "omagwa",
          "omerelu",
          "ozuaha",
          "ubima",
          "umuanwa"
        ]
      },
      {
        "lga": "khana",
        "wards": [
          "baen-kpean-duburo",
          "bane",
          "bargha",
          "beeri",
          "bori",
          "boue",
          "gwara-kaa-eeken",
          "kaani",
          "kono-kwawa",
          "llueku-nyokuru",
          "lorre-luebe-kpaa",
          "okwali",
          "opuoko-kalaoko",
          "sii-betem-kbaabbe",
          "sogho",
          "taabaa",
          "uegwere",
          "wiiyaa-kara",
          "zaakpori"
        ]
      },
      {
        "lga": "obio-akpor",
        "wards": [
          "choba",
          "elelenwo-3b",
          "oro-igwe",
          "ozuoba-ogbogoro",
          "rukpoku",
          "rumueme-7a",
          "rumueme-7b",
          "rumueme-7c",
          "rumuigbo-8a",
          "rumukwuta-8b",
          "rumuodara",
          "rumuodomaya-3a",
          "rumuokoro",
          "rumuokwu-2b",
          "rumuolumeni",
          "rumuomasi",
          "worji"
        ]
      },
      {
        "lga": "ogba-egbema-ndoni",
        "wards": [
          "egbema-i",
          "egbema-ii",
          "egi-i",
          "egi-ii",
          "egi-iii",
          "egi-iv",
          "igburu",
          "ndoni-i",
          "ndoni-ii",
          "ndoni-iii",
          "omoku-town-i",
          "omoku-town-ii",
          "omoku-town-iv-usomini",
          "omoku-town-v",
          "omuku-town-obieti",
          "usomini-i-north",
          "usomini-ii-south"
        ]
      },
      {
        "lga": "ogu-bolo",
        "wards": [
          "bolo-iv",
          "bolo-i",
          "bolo-ii",
          "bolo-iii",
          "ele",
          "ogu-i",
          "ogu-ii",
          "ogu-iii",
          "ogu-iv",
          "ogu-v",
          "ogu-vi",
          "wakama"
        ]
      },
      {
        "lga": "okrika",
        "wards": [
          "kalio",
          "ogan",
          "ogoloma-i",
          "ogoloma-ii",
          "ogoloma-iii",
          "okrika-i",
          "okrika-ii",
          "okrika-iii",
          "okrika-iv",
          "okrika-v",
          "okrika-vi",
          "okrika-vii"
        ]
      },
      {
        "lga": "omuma",
        "wards": [
          "ariraniiri-owu-ahia-community",
          "eberi-dikeomuuo-community",
          "obibi-ajuloke-community",
          "obiohia-community",
          "ofeh-community",
          "ohimogho-community",
          "oyoro",
          "umuajuloke-community",
          "umuogba-i-community",
          "umuogba-ii-community"
        ]
      },
      {
        "lga": "opobo-nkoro",
        "wards": [
          "dappaye-ama-kiri-i",
          "dappaye-ama-kiri-ii",
          "diepiri",
          "jaja",
          "kalaibiama-i",
          "kalaibiama-ii",
          "nkoro-i",
          "nkoro-ii",
          "nkoro-iii",
          "queens-town-kalama",
          "ukonu"
        ]
      },
      {
        "lga": "oyigbo",
        "wards": [
          "asa",
          "azuogu",
          "komkom",
          "obeakpu",
          "obete",
          "ogberu",
          "okoloma",
          "oyigba-west",
          "oyigbo-central",
          "umuagbai"
        ]
      },
      {
        "lga": "port-harcourt",
        "wards": [
          "abuloma-amadi-ama",
          "diobu",
          "elekahia",
          "mgbundukwu-one",
          "mgbundukwu-two",
          "nkpolu-oroworukwo",
          "nkpolu-oroworukwo-two",
          "ochiri-rumukalagbor",
          "ogbunabali",
          "oroabali",
          "orogbum",
          "oromineke-ezimgbu",
          "oroworukwo",
          "port-harcourt-township",
          "port-harcourt-township-vi",
          "port-harcourt-vii",
          "rumuobiekwe-ward",
          "rumuwoji-one",
          "rumuwoji-three",
          "rumuwoji-two"
        ]
      },
      {
        "lga": "tai",
        "wards": [
          "ward-i-botem-gbeneo",
          "ward-ii-kpite",
          "ward-iii-korokoro",
          "ward-iv-koroma-horo",
          "ward-ix-nanabie",
          "ward-v-kira-borobara",
          "ward-vi-gio-kporghor-gbam",
          "ward-vii-nonwa",
          "ward-viii-barryira-bara-ale-sime",
          "ward-x-ban-ogoi"
        ]
      }
    ]
  },
  {
    "state": "sokoto",
    "lgas": [
      {
        "lga": "binji",
        "wards": [
          "binji",
          "bunkari",
          "gawazzai",
          "inname",
          "jammali",
          "maikulki",
          "samama",
          "soro-gabas",
          "soro-yamma",
          "t-kose"
        ]
      },
      {
        "lga": "bodinga",
        "wards": [
          "badau-darhela",
          "bagarawa",
          "bangi-dabaga",
          "bodinga-tauma",
          "danchadi",
          "dingyadi-badawa",
          "kwacciyar-lalle",
          "mazan-gari-jirga-miyo",
          "sifawa-lukuyawa",
          "takatuku-madorawa",
          "tulluwa-kulafasa"
        ]
      },
      {
        "lga": "dange-shuni",
        "wards": [
          "bodai-jurga",
          "dange",
          "fajaldu",
          "giere-gajara",
          "rikina",
          "rudu-amanawa",
          "ruggar-gidado",
          "shuni",
          "tsafanade",
          "tuntube-tsehe",
          "wababe-salau"
        ]
      },
      {
        "lga": "gada",
        "wards": [
          "dukamaje-ilah",
          "gada",
          "gilbadi",
          "kadadin-buda-kaddi",
          "kadassaka",
          "kaddi",
          "kaffe",
          "kiri",
          "kwarma",
          "kyadawa-holai",
          "tsitse"
        ]
      },
      {
        "lga": "goronyo",
        "wards": [
          "birjingo",
          "boyekai",
          "giyawa",
          "goronyo",
          "kagara",
          "kojiyo",
          "kwakwazo",
          "rimawa",
          "s-gari-dole-dan-tasakko",
          "shinaka",
          "takakume"
        ]
      },
      {
        "lga": "gudu",
        "wards": [
          "awulkiti",
          "bachaka",
          "balle",
          "chilas-makuya",
          "gwazange-boto",
          "karfen-chana",
          "karfen-sarki",
          "kurdula",
          "maraken-bori",
          "tulun-doya"
        ]
      },
      {
        "lga": "gwadabawa",
        "wards": [
          "asara-arewa",
          "asara-kudu",
          "atakwanyo",
          "chimmola-kudu",
          "chimola-arewa",
          "gidan-kaya",
          "gigane",
          "gwadabawa",
          "huchi",
          "mammande",
          "salame"
        ]
      },
      {
        "lga": "illela",
        "wards": [
          "araba",
          "damba",
          "darna-sabon-gari",
          "darne-tsolawo",
          "g-hamma",
          "g-katta",
          "garu",
          "illela",
          "kalmalo",
          "r-gati",
          "tozai"
        ]
      },
      {
        "lga": "isa",
        "wards": [
          "bargaja",
          "gebe-a",
          "gebe-b",
          "isa-north",
          "isa-south",
          "tidibale",
          "tozai",
          "tsabren-sarkin-darai",
          "turba",
          "yanfako"
        ]
      },
      {
        "lga": "kebbe",
        "wards": [
          "fakku",
          "girkau",
          "kebbe-east",
          "kebbe-west",
          "kuchi",
          "margai-a",
          "margai-b",
          "nasagudu",
          "sangi",
          "ungushi"
        ]
      },
      {
        "lga": "kware",
        "wards": [
          "bankanu-r-kade",
          "basansan",
          "durbawa",
          "g-rugga",
          "g-modibbo-g-akwara",
          "h-ali-marabawa",
          "kabanga",
          "kware",
          "s-birni-g-karma",
          "tsaki-walake-e",
          "tunga-mallamawa"
        ]
      },
      {
        "lga": "rabah",
        "wards": [
          "gandi-a",
          "gandi-b",
          "gawakuke",
          "gwaddodi-gidan-bu-wai",
          "kurya",
          "rabah",
          "rara",
          "riji-maikujera",
          "tsamiya",
          "tursa",
          "yar-tsakuwa"
        ]
      },
      {
        "lga": "sabon-birni",
        "wards": [
          "gangara",
          "gatawa",
          "kalgo",
          "kuruwa",
          "lajinge",
          "makuwana",
          "s-birni-east",
          "s-birni-west",
          "tara",
          "tsamaye",
          "unguwar-lalle"
        ]
      },
      {
        "lga": "shagari",
        "wards": [
          "dandin-mahe",
          "gangam",
          "horo-birni",
          "jaredi",
          "kajiji",
          "kambama",
          "lambara",
          "mandera",
          "sanyinnawal",
          "shagari"
        ]
      },
      {
        "lga": "silame",
        "wards": [
          "gande-east",
          "gande-west",
          "katami-north",
          "katami-south",
          "kubodu-north",
          "kubodu-south",
          "labani",
          "marafa-east",
          "marafa-west",
          "silame"
        ]
      },
      {
        "lga": "sokoto-north",
        "wards": [
          "magajin-gari-a",
          "magajin-gari-b",
          "magajin-rafi-a",
          "magajin-rafi-b",
          "s-adar-gandu",
          "s-adar-g-igwai",
          "s-musulmi-a",
          "s-musulmi-b",
          "waziri-a",
          "waziri-b",
          "waziri-c"
        ]
      },
      {
        "lga": "sokoto-south",
        "wards": [
          "gagi-a",
          "gagi-b",
          "gagi-c",
          "r-dorowa-a",
          "r-dorowa-b",
          "s-a-k-atiku",
          "s-zamfara-a",
          "s-zamfara-b",
          "sarkin-adar-kwanni",
          "t-wada-a",
          "t-wada-b"
        ]
      },
      {
        "lga": "tambuwal",
        "wards": [
          "bagida-lukkingo",
          "bakaya-sabon-birni",
          "barkeji-nabaguda",
          "bashire-maikada",
          "dogondaji-sala",
          "faga-alasan",
          "jabo-kagara",
          "romon-sarki",
          "saida-goshe",
          "sanyinna",
          "tambuwal-shinfiri"
        ]
      },
      {
        "lga": "tangaza",
        "wards": [
          "gidan-madi",
          "kalanjeni",
          "kwacce-huru",
          "magonho",
          "raka",
          "ruwa-wuri",
          "sakkwai",
          "salewa",
          "sutti",
          "tangaza"
        ]
      },
      {
        "lga": "tureta",
        "wards": [
          "barayar-giwa",
          "duma",
          "fura-girke",
          "gidan-kare-bimasa",
          "kuruwa",
          "kwarare",
          "lambar-tureta",
          "lofa",
          "tsamiya",
          "tureta-gari"
        ]
      },
      {
        "lga": "wamakko",
        "wards": [
          "arkilla",
          "bado-kasarawa",
          "dundaye-gumburawa",
          "g-bubu-g-yaro",
          "g-hamidu-g-kaya",
          "gumbi-wajake",
          "gwamatse",
          "k-kimba-gedewa",
          "kalambaina-girabshi",
          "kammata",
          "wamakko"
        ]
      },
      {
        "lga": "wurno",
        "wards": [
          "achida",
          "alkammu-gyelgyel",
          "chacho-marnona",
          "dankemu",
          "dimbiso",
          "dinawa",
          "kwargaba",
          "kwasare-sisawa",
          "lahodu-g-bango",
          "magarya",
          "marafa"
        ]
      },
      {
        "lga": "yabo",
        "wards": [
          "bakale",
          "bingaje",
          "binji",
          "birniruwa",
          "fakka",
          "kilgori",
          "ruggar-iya",
          "torankawa",
          "yabo-a",
          "yabo-b"
        ]
      }
    ]
  },
  {
    "state": "taraba",
    "lgas": [
      {
        "lga": "ardo-kola",
        "wards": [
          "alim-gora",
          "ardo-kola",
          "iware",
          "jauro-yinu",
          "lamido-borno",
          "mayo-ranewo",
          "sarkin-dutse",
          "sunkani",
          "tau",
          "zongon-kombi"
        ]
      },
      {
        "lga": "bali",
        "wards": [
          "badakoshi",
          "bali-a",
          "bali-b",
          "gang-dole",
          "gang-mata",
          "ganglari",
          "gangtiba",
          "kaigama",
          "maihula",
          "suntai",
          "takalafiya"
        ]
      },
      {
        "lga": "donga",
        "wards": [
          "akate",
          "asibiti",
          "bikadarko",
          "fada",
          "gayama",
          "gindin-dutse",
          "gyatta-aure",
          "mararraba",
          "nyita",
          "suntai"
        ]
      },
      {
        "lga": "gashaka",
        "wards": [
          "galumjina",
          "gangumi",
          "garbabi",
          "gashaka",
          "gayam",
          "jamtari",
          "mai-idanu",
          "mayo-selbe",
          "serti-a",
          "serti-b"
        ]
      },
      {
        "lga": "gassol",
        "wards": [
          "gassol",
          "gunduma",
          "mutum-biyu-i",
          "mutum-biyu-ii",
          "nam-nai",
          "sabon-gida",
          "sarkin-shira",
          "sendirde",
          "tutare",
          "wurojam",
          "wuryo",
          "yarima"
        ]
      },
      {
        "lga": "ibi",
        "wards": [
          "dampar-i",
          "dampar-ii",
          "dampar-iii",
          "ibi-nwonyo-i",
          "ibi-nwonyo-ii",
          "ibi-rimi-uku-i",
          "ibi-rimi-uku-ii",
          "sarkin-kudu-i",
          "sarkin-kudu-ii",
          "sarkin-kudu-iii"
        ]
      },
      {
        "lga": "jalingo",
        "wards": [
          "abbare-yelwa",
          "barade",
          "kachalla-sembe",
          "kona",
          "majidadi",
          "mayo-goi",
          "sarkin-dawaki",
          "sintali",
          "turaki-a",
          "turaki-b"
        ]
      },
      {
        "lga": "karim-lamido",
        "wards": [
          "amar",
          "andamin",
          "bachama",
          "bikwin",
          "darofai",
          "didango",
          "jen-ardido",
          "jen-kaigama",
          "karim-a",
          "karim-b",
          "kwanchi"
        ]
      },
      {
        "lga": "kurmi",
        "wards": [
          "abong",
          "akwento-boko",
          "ashuku-eneme",
          "baissa",
          "bente-galea",
          "bissaula",
          "didan",
          "ndaforo-geanda",
          "njuwande",
          "nyido-tosso"
        ]
      },
      {
        "lga": "lau",
        "wards": [
          "abbare-i",
          "abbere-ii",
          "donadda",
          "garin-dogo",
          "garin-magaji",
          "jimlari",
          "kunini",
          "lau-i",
          "lau-ii",
          "mayo-lope"
        ]
      },
      {
        "lga": "sardauna",
        "wards": [
          "gembu-a",
          "gembu-b",
          "kabri",
          "kakara",
          "magu",
          "mayo-ndaga",
          "mbamnga",
          "ndum-yaji",
          "nguroje",
          "titong",
          "warwar"
        ]
      },
      {
        "lga": "takum",
        "wards": [
          "bete",
          "bikashibila",
          "chanchanji",
          "dutse",
          "fete",
          "gahweton",
          "manya",
          "rogo",
          "shibong",
          "tikari",
          "yukuben"
        ]
      },
      {
        "lga": "ussa",
        "wards": [
          "bika",
          "fikyu",
          "jenuwa",
          "kpambo",
          "kpambo-puri",
          "kwambai",
          "kwesati",
          "lissam-i",
          "lissam-ii",
          "lumbu",
          "rufu"
        ]
      },
      {
        "lga": "wukari",
        "wards": [
          "akwana",
          "avyi",
          "bantaje",
          "chonku",
          "hospital",
          "jibu",
          "kente",
          "puje",
          "rafin-kada",
          "tsokundi"
        ]
      },
      {
        "lga": "yorro",
        "wards": [
          "bikassa-i",
          "bikassa-ii",
          "nyaja-i",
          "nyaja-ii",
          "pantisawa-i",
          "pantisawa-ii",
          "pupule-i",
          "pupule-ii",
          "pupule-iii",
          "sumbu-i",
          "sumbu-ii"
        ]
      },
      {
        "lga": "zing",
        "wards": [
          "bitako",
          "bubong",
          "dinding",
          "lamma",
          "monkin-a",
          "monkin-b",
          "yakoko",
          "zing-ai",
          "zing-aii",
          "zing-b"
        ]
      }
    ]
  },
  {
    "state": "yobe",
    "lgas": [
      {
        "lga": "bade",
        "wards": [
          "dagona",
          "gwio-kura",
          "katuzu",
          "lawan-audu-lawan-al-wali",
          "lawan-fannami",
          "lawan-musa",
          "sarkin-hausawa",
          "tagali-sugum",
          "usur-dawayo",
          "zangon-musa-zango-umaru"
        ]
      },
      {
        "lga": "bursari",
        "wards": [
          "bayamari",
          "damnawa-juluri",
          "danani",
          "dapchi",
          "garun-dole-garin-alkali",
          "guba",
          "guji-metalari",
          "kaliyari",
          "kurnawa",
          "masaba"
        ]
      },
      {
        "lga": "damaturu",
        "wards": [
          "bindigari-fawari",
          "damakasu",
          "damaturu-central",
          "gabir-maduri",
          "kalallawa-gabai",
          "kukareta-warsala",
          "maisandari-waziri-ibrahim-estate",
          "murfa-kalam",
          "nayinawa",
          "njiwaji-gwange",
          "sasawa-kabaru"
        ]
      },
      {
        "lga": "fika",
        "wards": [
          "daya-chana",
          "fika-anze",
          "gadaka-shembire",
          "gudi-dozi-godo-woli",
          "janga-boza-fa-sawa-t-nanai",
          "mubi-fusami-garin-wayo",
          "ngalda-dumbulwa",
          "shoye-garin-aba",
          "turmi-maluri",
          "zangaya-mazawaun"
        ]
      },
      {
        "lga": "fune",
        "wards": [
          "abakire-ngenlshengele-shamka",
          "alagarno",
          "borno-kiji-ngarho-bebbende",
          "damagum-town",
          "daura-bulanyiwa-dubbul-bauwa",
          "dogon-kuka-gishiwari-gununu",
          "fune-ngelzarma-milbiyar-lawan-kalam",
          "gaba-tasha-aigada-dumbulwa",
          "gudugurka-marmar-i",
          "jajere-banellewa-babbare",
          "kayeri",
          "kollere-kafaje",
          "mashio"
        ]
      },
      {
        "lga": "geidam",
        "wards": [
          "asheikri",
          "balle-gallaba-meleri",
          "damakarwa-kusur",
          "dejina-fukurti",
          "futchimiram",
          "gumsa",
          "hausari",
          "kawuri",
          "ma-anna-dagambi",
          "shame-kura-dilawa",
          "zurgu-ngilewa-borko"
        ]
      },
      {
        "lga": "gujba",
        "wards": [
          "bunigari-lawanti",
          "buniyadi-north-south",
          "dadingel",
          "goniri",
          "gotala-gotumba",
          "gujba",
          "mallam-dunari",
          "mutai",
          "ngurbuwa",
          "wagir"
        ]
      },
      {
        "lga": "gulani",
        "wards": [
          "bara",
          "borno-kiji-tetteba",
          "bularafa",
          "bumsa",
          "dokshi",
          "gabai",
          "gagure",
          "garin-tuwo",
          "gulani",
          "kushimaga",
          "njibulwa",
          "ruhu"
        ]
      },
      {
        "lga": "jakusko",
        "wards": [
          "buduwa-saminaka",
          "dumbari",
          "gidgid-bayam",
          "gorgoram",
          "jaba",
          "jakusko",
          "jawur-katamma",
          "lafiya-loi-loi",
          "muguram",
          "zabudum-dachia"
        ]
      },
      {
        "lga": "karasuwa",
        "wards": [
          "bukarti",
          "fajiganari",
          "garin-gawo",
          "gasma",
          "jaji-maji",
          "karasuwa-galu",
          "karauswa-garu-guna",
          "wachakal",
          "waro",
          "yajiri"
        ]
      },
      {
        "lga": "machina",
        "wards": [
          "bogo",
          "damai",
          "dole",
          "falimaram",
          "kom-komma",
          "kuka-yasku",
          "lamisu",
          "machina-kwari",
          "maskandare",
          "taganama"
        ]
      },
      {
        "lga": "nangere",
        "wards": [
          "chilariye",
          "dadiso-chukuriwa",
          "dawasa-g-baba",
          "dazigau",
          "degubi",
          "kukuri-chiromari",
          "langawa-darin",
          "nangere",
          "pakarau-kare-kare-pakarau-fulani",
          "tikau",
          "watinani"
        ]
      },
      {
        "lga": "nguru",
        "wards": [
          "bulabulin",
          "bulanguwa",
          "dabule",
          "dumsai-dogon-kuka",
          "garbi-bambori",
          "hausari",
          "kanuri",
          "maja-kura",
          "mirba-kabir-mirba-sagir",
          "nglaiwa"
        ]
      },
      {
        "lga": "potiskum",
        "wards": [
          "bare-bare-bauya-lalai-dumbulwa",
          "bolewa-a",
          "bolewa-b",
          "danchuwa-bula",
          "dogo-nini",
          "dogo-tebo",
          "hausawa",
          "mamudo",
          "ngojin-alaraba",
          "yerimaram-garin-daye-badejo-nahuta"
        ]
      },
      {
        "lga": "tarmuwa",
        "wards": [
          "babangida",
          "barkami-bulturi",
          "biriri-churokusko",
          "jumbam",
          "koka-sungul",
          "koriyel",
          "lantaiwa",
          "mafa",
          "mandadawa",
          "shekau"
        ]
      },
      {
        "lga": "yunusari",
        "wards": [
          "bultuwa-mar-yaro",
          "daratoshia",
          "degaltura-ngamzai",
          "dekwa",
          "dilala-kalgi",
          "mairari",
          "mozogun-kujari",
          "ngirabo",
          "wadi-kafiya",
          "zajibiri-dumbal"
        ]
      },
      {
        "lga": "yusufari",
        "wards": [
          "alanjirori",
          "gumshi",
          "guya",
          "jebuwa",
          "kajimaram-sumbar",
          "kaska-tulotulowa",
          "kumagannam",
          "mai-malari",
          "mayori",
          "yusufari"
        ]
      }
    ]
  },
  {
    "state": "zamfara",
    "lgas": [
      {
        "lga": "anka",
        "wards": [
          "bagega",
          "barayar-zaki",
          "dan-galadima",
          "galadima",
          "magaji",
          "matseri",
          "sabon-birini",
          "waramu",
          "wuya",
          "yar-sabaya"
        ]
      },
      {
        "lga": "bakura",
        "wards": [
          "bakura",
          "birnin-tudu",
          "dakko",
          "damri",
          "dan-manau",
          "dankadu",
          "nasarawa",
          "rini",
          "yar-geda",
          "yar-kufoji"
        ]
      },
      {
        "lga": "birnin-magaji",
        "wards": [
          "birnin-magaji",
          "danfami-sabon-birini",
          "gora",
          "gusami-gari",
          "gusami-hayi",
          "kiyawa",
          "modomawa-east",
          "modomawa-west",
          "nasarawa-godal-east",
          "nasarawa-godal-west"
        ]
      },
      {
        "lga": "bukkuyum",
        "wards": [
          "adabka",
          "bukkuyum",
          "gwashi",
          "kyaram",
          "masama",
          "nasarawa",
          "ruwan-jema",
          "yashi",
          "zarummai",
          "zauma"
        ]
      },
      {
        "lga": "bungudu",
        "wards": [
          "bingi-north",
          "bingi-south",
          "bungudu",
          "furfuri-kwai-kwai",
          "gada-karakkai",
          "kwatarkwashi",
          "nahuce",
          "rawayya-bela",
          "samawa",
          "sankalawa",
          "tofa"
        ]
      },
      {
        "lga": "gummi",
        "wards": [
          "bardoki",
          "birnin-magaji",
          "birnin-tudu",
          "falale",
          "felfeldu-gamo",
          "gayari",
          "gyalange",
          "illelar-awal",
          "magajin-gari",
          "shiyar-rafi",
          "ubandawaki"
        ]
      },
      {
        "lga": "gusau",
        "wards": [
          "galadima",
          "mada",
          "madawaki",
          "magami",
          "mayana",
          "rijiya",
          "ruwan-bore",
          "sabon-gari",
          "tudun-wada",
          "wanke",
          "wonaka"
        ]
      },
      {
        "lga": "kaura-namoda",
        "wards": [
          "banga",
          "dan-isa",
          "gabake",
          "galadima-dan-galadima",
          "kagara",
          "kungurki",
          "kurya-madaro",
          "kyam-barawa",
          "s-baura-s-mafara",
          "sakajiki",
          "yankaba"
        ]
      },
      {
        "lga": "maradun",
        "wards": [
          "birnin-kaya-dosara",
          "damaga-damagiwa",
          "faru-magami",
          "gidan-goga",
          "gora",
          "janbako",
          "kaya",
          "maradun-north",
          "maradun-south",
          "tsibiri"
        ]
      },
      {
        "lga": "maru",
        "wards": [
          "bindin",
          "bingi",
          "dan-gulbi",
          "dan-kurmi",
          "dan-sadau",
          "kanoma",
          "kuyan-bana",
          "maru",
          "mayanchi",
          "ruwan-dorawa"
        ]
      },
      {
        "lga": "shinkafi",
        "wards": [
          "badarawa",
          "chiki",
          "galadi",
          "jangeru",
          "katuru",
          "kurya",
          "kware",
          "shanawa",
          "shinkafi-north",
          "shinkafi-south"
        ]
      },
      {
        "lga": "talata-mafara",
        "wards": [
          "garbadu",
          "gwaram",
          "jangebe",
          "kagara",
          "morai",
          "ruwan-bore",
          "ruwan-gizo",
          "sauna-r-gora",
          "shiyar-galadima",
          "shiyar-kayaye-matusgi",
          "take-tsaba-makera"
        ]
      },
      {
        "lga": "tsafe",
        "wards": [
          "bilbis",
          "chediya",
          "danjibga-kunchin-kalgo",
          "dauki",
          "keta-kizara",
          "kwaren-ganuwa",
          "tsafe",
          "yan-kuzo-b",
          "yan-waren-daji",
          "yandoton-daji",
          "yankuzo-a"
        ]
      },
      {
        "lga": "zurmi",
        "wards": [
          "boko",
          "dauran-birnin-tsaba",
          "dole",
          "galadima-yanruwa",
          "kanwa",
          "kuturu-mayasa",
          "kwashbawa",
          "mashem",
          "rukudawa",
          "yan-buki-dutsi",
          "zurmi"
        ]
      }
    ]
  }
]
