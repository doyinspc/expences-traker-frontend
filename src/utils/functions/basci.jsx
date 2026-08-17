import moment from "moment";
import Swal from "sweetalert2";
import { userRoles } from "../constants";

export const ageFunction = (date )=>{
    try {
        return new Date().getFullYear() - new Date(date).getFullYear()
    } catch (error) {
        return '-';
    }
}
export const dateFunction = (date)=>{
    try {
        return moment(date).toISOString()
    } catch (error) {
        return '-';
    }
}
export const moneyFunction = (amount, currency='NGN', code='en-NG') => {
  const numberValue = parseFloat(amount);

  // Check if the value is not a number, null, or zero
  if (isNaN(numberValue) || numberValue === null || numberValue === 0) {
    return <div style={{ textAlign: "right", color: "#999" }}>-</div>;
  }

  return (
    <div
      style={{
        textAlign: "right",
        width: "100%",
        fontWeight: "bold",
      }}
    >
      {new Intl.NumberFormat(code, {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 2,
      }).format(numberValue)}
    </div>
  );
};
export const dateTimeFunction = (date)=>{
    try {
        return moment(date).toISOString()
    } catch (error) {
        return '-';
    }
}
export const numberFunction = (input) => {
  // Handle null, undefined, and text that is not a number.
  // The Number() constructor will return NaN for non-numeric strings.
  if (input === null || input === undefined || typeof input === 'boolean' || typeof input === 'symbol') {
    return '0';
  }

  // Convert the input to a number
  const numberValue = Number(input);

  // Check if the converted value is a valid number.
  if (isNaN(numberValue)) {
    // If it's not a valid number (e.g., "abc"), return "0".
    return '0';
  }

  // Use toLocaleString to format the number with commas.
  // The 'en-US' locale is used for standard comma separation.
  return numberValue.toLocaleString('en-US');
}
export const accessFunction = (input) => {
try {
    return userRoles.filter(rw => rw.id == input)[0].name;
  } catch (error) {
    return '-';
  }
  
}
export const showConfirmationSwal = (onConfirmCallback, title, text) => {
  Swal.fire({
    title: title || 'Are you sure?',
    text: text || "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, remove it!'
  }).then((result) => {
    if (result.isConfirmed) {
      // Execute the callback function passed as an argument.
      onConfirmCallback();
      
      // Show a success message after the action.
      Swal.fire(
        'Action Confirmed!',
        'The action has been completed.',
        'success'
      );
    }
  });
};

export const Input =(props)=>{
  return null
}

// Function to store a row with a serial number in localStorage
export const storeTitleRow = (row, serialNumber) => {
  // Check if localStorage is available
  if (typeof window === 'undefined' || !window.localStorage) {
    console.error('localStorage is not available.');
    return;
  }

  try {
    // Retrieve existing data from localStorage or initialize an empty object
    const storedData = localStorage.getItem('titlekeep');
    const data = storedData ? JSON.parse(storedData) : {};

    // Add or update the row using the serial number as the key
    data[serialNumber] = row;

    // Save the updated data back to localStorage as a JSON string
    localStorage.setItem('titlekeep', JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
  }
};

// Function to get a row from localStorage using its serial number
export const getTitleRow = (serialNumber) => {
  // Check if localStorage is available
  if (typeof window === 'undefined' || !window.localStorage) {
    console.error('localStorage is not available.');
    return null;
  }

  try {
    // Retrieve the data from localStorage
    const storedData = localStorage.getItem('titlekeep');

    // If no data exists, return null
    if (!storedData) {
      return null;
    }

    // Parse the JSON data and return the specific row
    const data = JSON.parse(storedData);
    return data[serialNumber] || null;
  } catch (error) {
    console.error('Failed to retrieve data from localStorage:', error);
    return null;
  }
};

export const getDatesExcludingWeekends = (startDate, endDate) => {
  const dates = [];
  const currentDate = moment(startDate);

 
  while (currentDate.isSameOrBefore(endDate)) {
    // moment().day() returns 0 for Sunday, 6 for Saturday
    if (currentDate.day() !== 0 && currentDate.day() !== 6) {
      // Use .clone() to get a new Moment object, then .format()
      dates.push(currentDate.clone().format('YYYY-MM-DD'));
    }
    currentDate.add(1, 'days');
  }

  return dates;
}

export const sortObjectByName = (obj) => {
  // 1. Get the object's key-value pairs as an array of arrays: [[1, 'James'], [2, 'lambaert'], ...]
  const entries = Object.entries(obj);

  // 2. Sort the array.
  // The sort function compares the second element of each pair (index 1), which is the name.
  entries.sort((a, b) => {
    const nameA = a[1].toUpperCase(); // Convert names to uppercase for case-insensitive sorting
    const nameB = b[1].toUpperCase();
    
    if (nameA < nameB) {
      return -1; // a comes before b
    }
    if (nameA > nameB) {
      return 1; // a comes after b
    }
    return 0; // names are equal
  });

  return entries;
}

