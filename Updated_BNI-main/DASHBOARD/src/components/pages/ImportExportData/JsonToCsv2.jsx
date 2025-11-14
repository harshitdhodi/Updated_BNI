import React from 'react';
import FileSaver from 'file-saver';

class JSONtoCSVConverter extends React.Component {
  convertToCSV = (objArray) => {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    // Add headers
    var headers = Object.keys(array[0]);
    str += headers.join(',') + '\r\n';

    // Add items
    for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var index in array[i]) {
        if (line != '') line += ',';

        // Check if the value is a string before applying replace method
        var value = array[i][index];
        if (typeof value === 'string') {
          line += '"' + value.replace(/"/g, '""') + '"';
        } else {
          line += value; // Handle non-string values directly
        }
      }
      str += line + '\r\n';
    }

    return str;
  };

  handleConvertAndDownload = () => {
    // Sample JSON data (replace this with your actual JSON data or fetch it from an API)
    const jsonData = [
      { id: 1, name: 'John Doe', age: 28 },
      { id: 2, name: 'Jane Smith', age: 32 },
      { id: 3, name: 'Bob Johnson', age: 24 }
    ];

    // Convert JSON to CSV
    const csvData = this.convertToCSV(jsonData);

    // Create a Blob object for the CSV file
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

    // Save the CSV file using FileSaver.js
    FileSaver.saveAs(blob, 'employees.csv');
  };

  render() {
    return (
      <div>
        <button onClick={this.handleConvertAndDownload}>Convert and Download CSV</button>
      </div>
    );
  }
}

export default JSONtoCSVConverter;
