import React from 'react';
import { unparse } from 'papaparse';

const DownloadCSV = ({ jsonData }) => {
  const convertToCSV = (data) => {
    // Ensure data is an array of plain objects with serializable values
    const cleanData = data.map(({ companyName, dept, message }) => ({
      companyName: '"' + companyName.replace(/"/g, '""') + '"', // Quote and handle quotes within fields
      dept: '"' + dept.replace(/"/g, '""') + '"',
      message: '"' + message.replace(/"/g, '""') + '"',
    }));

    // Add spaces after each column
    const spacedData = cleanData.map((row) => ({
      ...row,
      // Add space of 2 empty characters after each column
      companyName: row.companyName + '  ',
      dept: row.dept + '  ',
      message: row.message + '  ',
    }));

    return unparse(spacedData, {
      quotes: true, // Ensure quotes around fields
      header: true, // Include header row
      newline: '\r\n', // Use Windows-style newline
    });
  };

  const downloadCSV = () => {
    const csv = convertToCSV(jsonData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'contactdatas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <button className='lg:w-90%' onClick={downloadCSV}>Download CSV</button>
    </div>
  );
};

export default DownloadCSV;
