function organizeGenderData(data) {
  try {
    // Validate input
    if (!data) {
      throw new Error('No data provided to organizeGenderData');
    }

    if (!Array.isArray(data)) {
      console.warn('organizeGenderData: Expected array, received:', typeof data);
      data = Array.isArray(data) ? data : [];
    }

    // Initialize result structure with default values
    const result = {
      students: {
        current: { male: 0, female: 0, unknown: 0, total: 0 },
        previous: { male: 0, female: 0, unknown: 0, total: 0 }
      },
      staff: {
        current: { male: 0, female: 0, unknown: 0, total: 0 },
        previous: { male: 0, female: 0, unknown: 0, total: 0 }
      },
      totals: {
        studentsCurrent: 0,
        studentsPrevious: 0,
        staffCurrent: 0,
        staffPrevious: 0,
        overallCurrent: 0,
        overallPrevious: 0
      },
      percentages: {
        studentsCurrent: {},
        studentsPrevious: {},
        staffCurrent: {},
        staffPrevious: {}
      },
      metadata: {
        hasData: false,
        error: null,
        warnings: [],
        processedCount: 0,
        invalidEntries: 0
      }
    };

    let processedCount = 0;
    let invalidEntries = 0;

    // Process each data item with validation
    data.forEach((item, index) => {
      try {
        // Validate item structure
        if (!item || typeof item !== 'object') {
          invalidEntries++;
          console.warn(`Invalid item at index ${index}:`, item);
          return;
        }

        const type = String(item.analysis_type || '').trim();
        const gender = String(item.category || '').toLowerCase().trim() || 'unknown';
        const count = parseGenderCount(item.counts);

        // Validate count
        if (isNaN(count) || count < 0) {
          invalidEntries++;
          console.warn(`Invalid count at index ${index}:`, item.counts);
          return;
        }

        // Map gender to valid categories
        const validGender = mapGender(gender);
        
        // Process based on type
        switch(type) {
          case 'Student1': // Current term students
            result.students.current[validGender] += count;
            result.students.current.total += count;
            result.totals.studentsCurrent += count;
            processedCount++;
            break;
            
          case 'Student2': // Previous term students
            result.students.previous[validGender] += count;
            result.students.previous.total += count;
            result.totals.studentsPrevious += count;
            processedCount++;
            break;
            
          case 'Staff1': // Current term staff
            result.staff.current[validGender] += count;
            result.staff.current.total += count;
            result.totals.staffCurrent += count;
            processedCount++;
            break;
            
          case 'Staff2': // Previous term staff
            result.staff.previous[validGender] += count;
            result.staff.previous.total += count;
            result.totals.staffPrevious += count;
            processedCount++;
            break;
            
          default:
            // Log unknown analysis type as warning
            result.metadata.warnings.push(`Unknown analysis_type: ${type} at index ${index}`);
            console.warn(`Unknown analysis_type: ${type} at index ${index}`);
            break;
        }
      } catch (itemError) {
        invalidEntries++;
        console.error(`Error processing item at index ${index}:`, itemError.message, item);
      }
    });

    // Calculate overall totals with zero division protection
    result.totals.overallCurrent = safeAdd(
      result.totals.studentsCurrent, 
      result.totals.staffCurrent
    );
    result.totals.overallPrevious = safeAdd(
      result.totals.studentsPrevious, 
      result.totals.staffPrevious
    );

    // Update metadata
    result.metadata.hasData = processedCount > 0;
    result.metadata.processedCount = processedCount;
    result.metadata.invalidEntries = invalidEntries;

    // Calculate percentages with error handling
    calculatePercentages(result);

    return result;

  } catch (error) {
    console.error('Error in organizeGenderData:', error);
    
    // Return safe default structure with error info
    return {
      students: {
        current: { male: 0, female: 0, unknown: 0, total: 0 },
        previous: { male: 0, female: 0, unknown: 0, total: 0 }
      },
      staff: {
        current: { male: 0, female: 0, unknown: 0, total: 0 },
        previous: { male: 0, female: 0, unknown: 0, total: 0 }
      },
      totals: {
        studentsCurrent: 0,
        studentsPrevious: 0,
        staffCurrent: 0,
        staffPrevious: 0,
        overallCurrent: 0,
        overallPrevious: 0
      },
      percentages: {},
      metadata: {
        hasData: false,
        error: error.message,
        warnings: [],
        processedCount: 0,
        invalidEntries: 0
      }
    };
  }
}

// Helper functions with error handling
function parseGenderCount(count) {
  if (count === null || count === undefined) return 0;
  
  const parsed = parseInt(count);
  if (isNaN(parsed)) {
    // Try to extract numbers from string
    const match = String(count).match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }
  
  return Math.max(0, parsed); // Ensure non-negative
}

function mapGender(gender) {
  const genderMap = {
    'male': 'male',
    'm': 'male',
    'female': 'female',
    'f': 'female',
    '': 'unknown',
    'other': 'unknown',
    'unknown': 'unknown',
    'prefer not to say': 'unknown'
  };
  
  return genderMap[gender] || 'unknown';
}

function safeAdd(a, b) {
  const numA = Number(a) || 0;
  const numB = Number(b) || 0;
  return numA + numB;
}

function calculatePercentages(result) {
  try {
    // Calculate student percentages
    ['current', 'previous'].forEach(period => {
      const students = result.students[period];
      const total = students.total || 0;
      
      if (total > 0) {
        result.percentages[`students${capitalize(period)}`] = {
          male: safePercentage(students.male, total),
          female: safePercentage(students.female, total),
          unknown: safePercentage(students.unknown, total)
        };
      } else {
        result.percentages[`students${capitalize(period)}`] = {
          male: 0,
          female: 0,
          unknown: 0
        };
      }
    });

    // Calculate staff percentages
    ['current', 'previous'].forEach(period => {
      const staff = result.staff[period];
      const total = staff.total || 0;
      
      if (total > 0) {
        result.percentages[`staff${capitalize(period)}`] = {
          male: safePercentage(staff.male, total),
          female: safePercentage(staff.female, total),
          unknown: safePercentage(staff.unknown, total)
        };
      } else {
        result.percentages[`staff${capitalize(period)}`] = {
          male: 0,
          female: 0,
          unknown: 0
        };
      }
    });
    
  } catch (error) {
    console.error('Error calculating percentages:', error);
    // Ensure percentages object exists even on error
    result.percentages = result.percentages || {};
  }
}

function safePercentage(part, total) {
  if (!total || total <= 0) return 0;
  const percentage = (Number(part) / Number(total)) * 100;
  return Math.round(Math.max(0, Math.min(100, percentage))); // Clamp between 0-100
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function processAttendanceData(sqlData) {
  // Validate input
  if (!Array.isArray(sqlData)) {
    console.error('processAttendanceData: Expected array, received:', typeof sqlData);
    return getDefaultAttendanceStructure();
  }

  const result = {
    staff: {
      current: null,   // Last week
      previous: null,  // Previous week
      trend: null,
      hasData: false
    },
    students: {
      current: null,   // Last week
      previous: null,  // Previous week
      trend: null,
      hasData: false
    },
    overall: {
      current: null,
      previous: null,
      trend: null
    },
    metadata: {
      totalRecords: 0,
      processedCount: 0,
      errors: []
    }
  };

  // Helper function to parse numeric values
  const parseNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  try {
    // Process each row
    sqlData.forEach((row, index) => {
      try {
        if (!row || typeof row !== 'object') {
          result.metadata.errors.push(`Invalid row at index ${index}`);
          return;
        }

        const period = row.period;
        const isCurrent = period.endsWith('1'); // Staff1 or Student1
        const isStaff = period.startsWith('Staff');
        const isStudent = period.startsWith('Student');

        const item = {
          period: period,
          weekNumber: row.week_number,
          weekStart: row.week_start,
          weekEnd: row.week_end,
          totalRecords: parseNumber(row.total_records),
          onTime: parseNumber(row.on_time),
          absent: parseNumber(row.absent),
          uniqueCount: parseNumber(row.unique_staff),
          onTimeRate: parseNumber(row.on_time_rate),
          absentRate: parseNumber(row.absent_rate),
          raw: row // Keep raw data for reference
        };

        // Calculate derived values
        item.present = item.onTime + item.absent; // Actually should be onTime only, but keeping your naming
        item.attendanceRate = item.onTimeRate; // Alias for clarity

        // Store in appropriate location
        if (isStaff) {
          if (isCurrent) {
            result.staff.current = item;
          } else {
            result.staff.previous = item;
          }
          result.staff.hasData = true;
        } else if (isStudent) {
          if (isCurrent) {
            result.students.current = item;
          } else {
            result.students.previous = item;
          }
          result.students.hasData = true;
        }

        result.metadata.processedCount++;
        result.metadata.totalRecords += item.totalRecords;

      } catch (rowError) {
        result.metadata.errors.push(`Error processing row ${index}: ${rowError.message}`);
      }
    });

    // Calculate trends
    calculateTrends(result);

    // Calculate overall attendance
    calculateOverallAttendance(result);

    return result;

  } catch (error) {
    console.error('Error in processAttendanceData:', error);
    result.metadata.errors.push(`Processing error: ${error.message}`);
    return result;
  }
}

// Helper function to calculate trends
function calculateTrends(result) {
  // Staff trend
  if (result.staff.current && result.staff.previous) {
    const change = result.staff.current.onTimeRate - result.staff.previous.onTimeRate;
    result.staff.trend = {
      value: change,
      percentage: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      text: formatTrendText(change, 'staff'),
      isImprovement: change > 0
    };
  }

  // Student trend
  if (result.students.current && result.students.previous) {
    const change = result.students.current.onTimeRate - result.students.previous.onTimeRate;
    result.students.trend = {
      value: change,
      percentage: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      text: formatTrendText(change, 'students'),
      isImprovement: change > 0
    };
  }
}

// Helper function to calculate overall attendance
function calculateOverallAttendance(result) {
  const staffCurrent = result.staff.current;
  const staffPrevious = result.staff.previous;
  const studentCurrent = result.students.current;
  const studentPrevious = result.students.previous;

  if (staffCurrent && studentCurrent) {
    const totalOnTime = staffCurrent.onTime + studentCurrent.onTime;
    const totalRecords = staffCurrent.totalRecords + studentCurrent.totalRecords;
    const overallRate = totalRecords > 0 ? (totalOnTime / totalRecords * 100) : 0;

    result.overall.current = {
      onTime: totalOnTime,
      total: totalRecords,
      rate: Math.round(overallRate * 10) / 10,
      staffCount: staffCurrent.uniqueCount,
      studentCount: studentCurrent.uniqueCount
    };
  }

  if (staffPrevious && studentPrevious) {
    const totalOnTime = staffPrevious.onTime + studentPrevious.onTime;
    const totalRecords = staffPrevious.totalRecords + studentPrevious.totalRecords;
    const overallRate = totalRecords > 0 ? (totalOnTime / totalRecords * 100) : 0;

    result.overall.previous = {
      onTime: totalOnTime,
      total: totalRecords,
      rate: Math.round(overallRate * 10) / 10,
      staffCount: staffPrevious.uniqueCount,
      studentCount: studentPrevious.uniqueCount
    };
  }

  // Calculate overall trend
  if (result.overall.current && result.overall.previous) {
    const change = result.overall.current.rate - result.overall.previous.rate;
    result.overall.trend = {
      value: change,
      percentage: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      text: formatTrendText(change, 'overall'),
      isImprovement: change > 0
    };
  }
}

// Helper function to format trend text
function formatTrendText(change, type) {
  const absChange = Math.abs(change).toFixed(1);
  const typeText = type === 'staff' ? 'staff' : 
                   type === 'students' ? 'student' : 'overall';
  
  if (change > 0) {
    return `↑ ${absChange}% increase from last week`;
  } else if (change < 0) {
    return `↓ ${absChange}% decrease from last week`;
  } else {
    return `→ No change from last week`;
  }
}

// Default structure for error cases
function getDefaultAttendanceStructure() {
  return {
    staff: {
      current: null,
      previous: null,
      trend: null,
      hasData: false
    },
    students: {
      current: null,
      previous: null,
      trend: null,
      hasData: false
    },
    overall: {
      current: null,
      previous: null,
      trend: null
    },
    metadata: {
      totalRecords: 0,
      processedCount: 0,
      errors: ['No data available']
    }
  };
}

function convertReportDataToKeyValue(reportData) {
  if (!Array.isArray(reportData) || reportData.length === 0) {
    return { labels: [], data: [] };
  }

  const labels = [];
  const data = [];

  reportData.forEach(item => {
    // Get all keys except standard ones
    Object.keys(item).forEach(key => {
      if (key === 'reportname' || key === 'report_name') {
        labels.push(item[key]);
      } else if (key.includes('average') || key.includes('score')) {
        data.push(parseFloat(item[key]) || 0);
      }
    });
  });

  return { labels, data };
}



export {processAttendanceData, organizeGenderData, getDefaultAttendanceStructure, convertReportDataToKeyValue}
