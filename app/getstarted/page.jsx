'use client';
import { useState } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import EditableTable from '../../components/EditableTable';

function GetStarted() {
  const [tableData, setTableData] = useState();
  const [chartData, setChartData] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const file = e.currentTarget.file.files?.[0];
    // Get data from the form.
    let data = {
      file: ''
    };

    const readFileData = async (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (event) {
          const fileData = event.target?.result;
          resolve(fileData);
        };

        reader.onerror = function (event) {
          reject(reader.error);
        };

        reader.readAsDataURL(file);
      });
    };

    const updateFileData = async () => {
      if (file) {
        const fileData = await readFileData(file);
        data.file = fileData;
      }
    };

    try {
      await updateFileData();
      // Use the updated data object as needed
    } catch (error) {
      console.error('Error reading file data:', error);
    }

    // Send the data to the server in JSON format.
    const JSONdata = JSON.stringify(data);

    // API endpoint where we send form data.
    const endpoint = `${process.env.NEXT_PUBLIC_URL || ''}/api/analyse`;

    // Form the request for sending data to the server.
    const options = {
      // The method is POST because we are sending data.
      method: 'POST',
      // Tell the server we're sending JSON.
      headers: {
        'Content-Type': 'application/json'
      },
      // Body of the request is the JSON data we created above.
      body: JSONdata
    };

    let result;

    console.log(options);

    try {
      // Send the form data to api
      const response = await fetch(endpoint, options);

      // Get the response data from server as JSON.
      result = await response.json();
      console.log(`Data Returned`);
      console.log(result);
      // console.log('result:', result);
      setChartData(result['distplot']);
    } catch (error) {
      // If server returns an error, that means the form failed.
      console.log('error:', error);
      alert(`Error: ${error}`);
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    // Passing file data (event.target.files[0]) to parse using Papa.parse
    Papa.parse(e.currentTarget.file2.files?.[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        // Parsed Data Response in array format
        setTableData(results.data);
      }
    });
  };

  return (
    <div>
      <h1 className="text-4xl font-bold">Get Started Page</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" name="file" id="file" />
        <button type="submit">Submit</button>
      </form>
      <form onSubmit={handleUpload}>
        <input type="file" name="file2" id="file2" />
        <button type="submit">Upload</button>
      </form>
      {tableData && <EditableTable data={tableData} setData={setTableData} />}
      {chartData && <Plot data={chartData.data} layout={chartData.layout} />}
    </div>
  );
}

export default GetStarted;
