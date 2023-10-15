'use client';
import { useState, useEffect, useRef } from 'react';

// Handsontable
import 'handsontable/dist/handsontable.full.min.css';
import Handsontable from 'handsontable/base';
import { registerAllModules } from 'handsontable/registry';
import { HotTable } from '@handsontable/react';

// Toastify
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Popup
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

registerAllModules();

function EditableTable({ data, setData }) {
  const hotRef = useRef(null);
  //State to store table Column name
  const [tableRows, setTableRows] = useState([]);
  //State to store the values
  const [values, setValues] = useState([]);
  // types
  const [types, setTypes] = useState([]);
  const [typeSelected, setTypeSelected] = useState([]);
  // Popup state
  const [open, setOpen] = useState(false);
  // Loaded state
  const [loaded, setLoaded] = useState(false);

  // useEffect(() => {
  //   const cols = Object.keys(data[0]);
  //   const valuesArray = [];

  //   // // Iterating data to get column name and their values
  //   data.map((d, index) => {
  //     valuesArray.push({ ...d, id: index });
  //   });

  //   // Filtered Column Names
  //   setTableRows(cols.map((col) => ({ key: col, name: col })));

  //   // Filtered Values
  //   setValues(valuesArray);
  // }, [data]);

  useEffect(() => {
    const hotInstance = hotRef.current?.hotInstance;
    // const cols = hotInstance?.getColHeader();
    // console.log(cols);
    let types = {};

    Object.keys(data[0]).forEach((col, index) => {
      console.log(hotInstance.getDataAtCol(index));
      types[col] = checkColumnType(
        hotInstance.getDataAtCol(index).filter((value) => value !== '' && value !== null)
      );
    });
    setTypes(types);
    setLoaded(true);
  }, [data]);

  const isNumeric = (value) => {
    // Add your custom numeric validation logic here
    return !isNaN(parseFloat(value)) && isFinite(value);
  };

  const isDateTime = (value) => {
    // Add your custom numeric validation logic here
    const date = new Date(parseFloat(value));
    const date2 = new Date(value);
    return (
      !isNaN(Date.parse(value)) |
      !isNaN(Date.parse(parseFloat(value))) |
      !isNaN(Date.parse(date)) |
      !isNaN(Date.parse(date2))
    );
  };

  function checkColumnType(columnData) {
    let isNumericBool = true;
    let isDateTimeConvertible = true;
    let isText = true;

    for (const value of columnData) {
      if (!isNumericBool && !isDateTimeConvertible) {
        return { isNumeric: isNumericBool, isDateTimeConvertible, isText };
      } else if (!isNumeric(value) && isNumericBool) {
        // Value is not a number
        isNumericBool = false;
      } else if (!isDateTime(value) && isDateTimeConvertible) {
        // Value can be converted to a date
        isDateTimeConvertible = false;
      }
    }

    let types = [];
    if (isNumericBool) {
      types.push('numeric');
    }
    if (isDateTimeConvertible) {
      types.push('date');
    }
    if (isText) {
      types.push('text');
    }

    return types;
  }

  const handleTypesSave = (e) => {
    e.preventDefault();
    let typesSelection = {};
    Object.keys(types).forEach((col, index) => {
      typesSelection[col] = e.target[col].value;
    });
    setTypeSelected(typesSelection);
    setOpen(false);
  };
  console.log(typeSelected);

  const afterLoadData = (data, initialLoad, source) => {
    console.log(data);
    console.log(source);
    const hotInstance = hotRef.current?.hotInstance;
    console.log(hotInstance);
  };

  const handleEdit = (changes, source) => {
    if (source === 'loadData') {
      return;
    }
    const hotInstance = hotRef.current?.hotInstance;
    console.log(hotInstance.getColHeader());
    console.log(hotInstance.getDataAtCol(0).filter((x) => x !== '' && x !== null));
    if (source === 'edit') {
      const hotInstance = hotRef.current.hotInstance;

      changes.forEach(([row, prop, oldValue, newValue]) => {
        if (prop === 'value' && !isNumeric(newValue)) {
          alert('Invalid value entered. Please enter a numeric value.');
          hotInstance.setDataAtCell(row, hotInstance.propToCol(prop), oldValue);
        }
      });
    }
  };

  const handleBeforeChange = (changes) => {
    changes.forEach(([row, prop, oldValue, newValue]) => {
      if (!isNumeric(newValue)) {
        toast.error('Invalid value entered. Please enter a numeric value.', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored'
        });
        console.log('Invalid');
        // Prevent the change by returning false
        changes[0] = null;
        return false;
      }
    });
  };

  return (
    <div className="h-96 w-full">
      {/* Handsontable */}
      {data && (
        <>
          <button onClick={() => setOpen((o) => !o)} className="text-cyan-800 font-bold">
            Settings
          </button>
          <HotTable
            ref={hotRef}
            data={data}
            rowHeaders={true}
            colHeaders={true}
            height="100%"
            width="100%"
            licenseKey={process.env.NEXT_PUBLIC_HOT_LICENCE_KEY}
            afterChange={handleEdit}
            // beforeChange={handleBeforeChange}
            afterLoadData={afterLoadData}
            allowInsertColumn={true}
            dropdownMenu={true}
            hiddenColumns={{ indicators: true }}
            contextMenu={true}
            multiColumnSorting={true}
            filters={true}
            manualRowMove={true}
            columns={[...Object.keys(data[0]), ...new Array(15).fill(null)].map((col, index) => ({
              data: col || index,
              type: 'numeric',
              title: col || index
              // allowInvalid: false // This would not warn the user if the input is invalid, used beforeChange instead
            }))}
            minSpareRows={10}
            validator={isNumeric}
            allowEmpty={false}
          />
        </>
      )}
      <ToastContainer />
      {loaded && (
        <Popup open={open} position="center" closeOnDocumentClick={false}>
          <div className="flex flex-col gap-3 w-full items-center justify-center">
            <div>
              <h1 className="text-xl font-bold">Select Column Data Types</h1>
              <p className="font-light italic">This is essential for data analysis</p>
            </div>

            <form onSubmit={handleTypesSave}>
              {Object.keys(types).map((col, index) => (
                <div
                  key={index}
                  className="flex w-64 justify-between border-2 border-slate-500 p-2"
                >
                  <h2 className="font-bold">{col}</h2>
                  {/* Dropdown */}
                  <select
                    className="border-2 border-black rounded-md w-24"
                    id={col}
                    defaultValue={typeSelected[col] || types[col][0]}
                    // onChange={(e) => {
                    //   const hotInstance = hotRef.current?.hotInstance;
                    //   hotInstance.updateSettings({
                    //     columns: [
                    //       ...hotInstance.getSettings().columns.slice(0, index),
                    //       {
                    //         ...hotInstance.getSettings().columns[index],
                    //         type: e.target.value
                    //       },
                    //       ...hotInstance.getSettings().columns.slice(index + 1)
                    //     ]
                    //   });
                    //   setTypes((t) => ({ ...t, [col]: e.target.value }));
                    // }}
                  >
                    {types[col].map((type, index) => (
                      <option key={index} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <div>
                <button type="submit">Save</button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Popup>
      )}
    </div>
  );
}

export default EditableTable;
