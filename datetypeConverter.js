const fs = require('fs');
const csv = require('csv-parser');

const column1MX = 'fecha/hora'
const column1US = 'date/time'
const outputRows = [];


let filename = 'csvUS.csv'
let amazonLocation = 'US'
let column1;
let formatDate;

// Read CSV file
fs.createReadStream(filename)
  .pipe(csv())
  .on('data', (row) => {
      //Check if the column exists and is not empty
    if( amazonLocation === 'MX'){
      column1 = column1MX
      formatDate = formatDateMX
    }
    else if ( amazonLocation === 'US'){
      column1 = column1US
      formatDate = formatDateUS
    }
    console.log(row)
    if (row[column1]) {
      // Modify the first column and convert to SQL datetime format
      const modifiedDate = formatDate(row[column1]);
      row[column1] = modifiedDate;
      console.log(row);
      outputRows.push(row);
    }
  })
  .on('end', () => {
    console.log('CSV file processing finished.');
    const csv = convertArrayOfObjectsToCSV(outputRows);

    fs.writeFile('outputUS.csv', csv, (err) => {
        if (err) throw err;
        console.log('CSV file has been saved!');
    });

  });

// Function to format the date to SQL datetime format (MX)
function formatDateMX(dateString) {
  const monthsMap = {
    'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06',
    'jul': '07', 'ago': '08', 'sept': '09', 'oct': '10', 'nov': '11', 'dic': '12'
  };
  const dateParts = dateString.split(' ');
  if (dateParts.length === 5) {
    const [day, month, year, time, timezone] = dateParts;
    const [hour, minute, second] = time.split(':');
    const formattedDate = `${year}-${monthsMap[month.toLowerCase()]}-${day} ${hour}:${minute}:${second}`;
    return formattedDate;
  } else {
    // Handle invalid date format
    console.error('Invalid date format:', dateString);
    return null;
  }
}

function formatDateUS(dateString){
  // Extract date components
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
  const day = date.getDate().toString().padStart(2, '0');

  // Extract time components
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = (hours % 12) || 12; // Convert to 12-hour format
  hours = hours.toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  // Construct SQL datetime string
  const sqlDatetime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${ampm}`;
  return sqlDatetime

}
// Function to forman the date from amazon csv to SQL datetime formal (US)
// Function to save data to CSV file
function convertArrayOfObjectsToCSV(array) {
    const header = Object.keys(array[0]).join(',');
    const rows = array.map(obj => Object.values(obj).map(value => `"${value}"`).join(',')).join('\n');
    return `${header}\n${rows}`;
}