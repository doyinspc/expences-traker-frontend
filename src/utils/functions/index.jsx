import Swal from 'sweetalert'
import xlsx from 'json-as-xlsx';
import { createColumnHelper } from '@tanstack/react-table';

export const htmlRenderer = (htmlString)=> {
   // return <div dangerouslySetInnerHTML={{ __html: trimHtmlString(htmlString) || "" }} />;
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

export const columnBuilder = (page_data, actions = null, showSelect = false) => {
  const { table_data, table_action } = page_data || {};
  const columnHelper = createColumnHelper();

  // 1. Select column
  const sel = columnHelper.display({
    id: 'select-col',
    size: 1,
    header: ({ table }) => {
      return (
        <input
          type="checkbox"
          className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out rounded-sm"
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      );
    },
    cell: ({ row }) => (
      <input
        type="checkbox"
        className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out rounded-sm"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  });

  // 2. Serial Number column
  const nm = columnHelper.display({
    id: 'sn',
    header: 'SN',
    meta: { 
        style: { 
            textAlign: 'center',
            maxWidth: '8px',
            width: '8px'
        } 
    },
    size: tableWidth?.sn ?? 0.8,
    meta: { style: { textAlign: 'center', maxWidth: '8px',
            width: '8px' } },
    size: 1,
    cell: ({ row }) => {
      return row.index + 1;
    },
  });

  let columns = [];

  // Add select column if enabled
  if (showSelect === true) {
    columns.push(sel);
  }

  // Add SN column
  columns.push(nm);

  // 3. Data columns
  if (Array.isArray(table_data)) {
    table_data.forEach((element) => {
      if (element.showTable) {
        let row = columnHelper.accessor(element.name.toString(), {
          id: element.name.toString(),
          header: element.label,
          meta: element?.meta ?? null,
          cell: element.format 
            ? (props) => {
                const { getValue } = props;
                return element.format(getValue());
              }
            : ({ getValue }) => getValue(),
        });
        columns.push(row);
      }
    });
  }

  // 4. Action column
  if (actions && table_action) {
    const actionCol = columnHelper.display({
      id: 'action',
      header: 'Actions',
      cell: ({ row }) => {
        return table_action({ row: row.original, ...actions });
      },
    });
    columns.push(actionCol);
  }

  return columns;
};
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