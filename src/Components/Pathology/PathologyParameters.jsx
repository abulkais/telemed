import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import Select from "react-select";

const PathologyParameters = () => {
  const [pathologyParameters, setPathologyParameters] = useState([]);
  const [pathologyUnits, setPathologyUnits] = useState([]);
  const [pathologyParameter, setPathologyParameter] = useState({
    name: "",
    referenceRange: "",
    unitId: "",
    description: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [excelLoading, setExcelLoading] = useState(false);

  const fetchPathologyUnits = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/pathologyUnits`);
      setPathologyUnits(res.data);
    } catch (error) {
      console.error("Error fetching Pathology Units:", error);
      toast.error("Failed to load Pathology Units");
    }
  };

  const fetchPathologyParameters = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/pathologyParameters`
      );
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setPathologyParameters(sortedData);
    } catch (error) {
      console.error("Error fetching Pathology Parameters:", error);
      toast.error("Failed to load Pathology Parameters");
    }
  };

  useEffect(() => {
    fetchPathologyUnits();
    fetchPathologyParameters();
  }, []);

  const unitOptions = pathologyUnits.map((unit) => ({
    value: unit.id,
    label: unit.name,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPathologyParameter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUnitChange = (selectedOption) => {
    setPathologyParameter((prev) => ({
      ...prev,
      unitId: selectedOption ? selectedOption.value : "",
    }));
  };

  const validateForm = () => {
    if (!pathologyParameter.name) {
      toast.error("Name is required");
      return false;
    }
    if (!pathologyParameter.referenceRange) {
      toast.error("Reference Range is required");
      return false;
    }
    if (!pathologyParameter.unitId) {
      toast.error("Please select a Unit");
      return false;
    }

    // Check for duplicate Pathology Parameter by name
    const isDuplicate = pathologyParameters.some(
      (item) =>
        item.name.toLowerCase() === pathologyParameter.name.toLowerCase() &&
        (!editing || item.id !== editId)
    );
    if (isDuplicate) {
      toast.error("A Pathology Parameter with this name already exists.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    const newPathologyParameter = {
      ...pathologyParameter,
      created_at: currentDate,
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/pathologyParameters/${editId}`,
          newPathologyParameter
        );
        toast.success("Pathology Parameter Updated Successfully");
      } else {
        await axios.post(
          `http://localhost:8080/api/pathologyParameters`,
          newPathologyParameter
        );
        toast.success("Pathology Parameter Added Successfully");
      }
      fetchPathologyParameters();
      resetForm();
      $("#addPathologyParameter").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving Pathology Parameter");
    }
  };

  const resetForm = () => {
    setPathologyParameter({
      name: "",
      referenceRange: "",
      unitId: "",
      description: "",
    });
    setEditing(false);
    setEditId(null);
  };

  const deletePathologyParameter = async () => {
    if (!deleteId) {
      toast.error("Invalid Pathology Parameter ID!");
      return;
    }
    try {
      await axios.delete(
        `http://localhost:8080/api/pathologyParameters/${deleteId}`
      );
      setPathologyParameters((prev) =>
        prev.filter((item) => item.id !== deleteId)
      );
      toast.success("Pathology Parameter deleted successfully!");
      $("#deletePathologyParameter").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Pathology Parameter!");
    }
  };

  const handleEdit = (item) => {
    setEditing(true);
    setEditId(item.id);
    setPathologyParameter({
      name: item.name,
      referenceRange: item.referenceRange,
      unitId: item.unitId,
      description: item.description,
    });
    $("#addPathologyParameter").modal("show");
  };

  const downloadExcel = () => {
    setExcelLoading(true);

    let dataToExport = filteredPathologyParameters;
    let fileName = `PathologyParameters_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    if (dataToExport.length === 0) {
      toast.error("No data found to export!");
      setExcelLoading(false);
      return;
    }

    const data = [
      {
        "S.N": "S.N",
        Name: "Name",
        "Reference Range": "Reference Range",
        Unit: "Unit",
        Description: "Description",
        "Created Date": "Created Date",
      },
      ...dataToExport.map((item, index) => {
        const unit = getUnitById(item.unitId);
        return {
          "S.N": index + 1,
          Name: item.name,
          "Reference Range": item.referenceRange,
          Unit: unit ? unit.name : "N/A",
          Description: item.description,
          "Created Date": formatDate(item.created_at),
        };
      }),
    ];

    const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 40 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pathology_Parameters");
    XLSX.writeFile(workbook, fileName);
    setExcelLoading(false);
    toast.success(`Report downloaded (${dataToExport.length} records)`);
  };

  const getUnitById = (unitId) => {
    return pathologyUnits.find((unit) => unit.id === unitId);
  };

  const filterBySearch = (item) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(searchLower);
  };

  const filteredPathologyParameters =
    pathologyParameters.filter(filterBySearch);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div>
      <ToastContainer />

      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link
            to="/pathology-categories"
            className={`doctor-nav-btn`}
            onClick={() => {}}
          >
            Pathology Categories
          </Link>
          <Link
            to="/pathology-units"
            className={`doctor-nav-btn`}
            onClick={() => {}}
          >
            Pathology Units
          </Link>
          <Link
            to="/pathology-parameters"
            className={`doctor-nav-btn active`}
            onClick={() => {}}
          >
            Pathology Parameters
          </Link>
        </div>
      </div>

      <div className="filter-bar-container">
        <div className="filter-search-box">
          <input
            type="text"
            className="form-control"
            placeholder="Search"
            style={{ width: "250px" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <button
            className="filter-btn filter-btn-primary"
            data-toggle="modal"
            data-target="#addPathologyParameter"
            onClick={resetForm}
          >
            New Pathology Parameter
          </button>

          <button
            className="btn btn-success ml-2"
            onClick={downloadExcel}
            disabled={excelLoading}
          >
            {excelLoading ? (
              <span>Exporting...</span>
            ) : (
              <span>
                <i className="fa fa-file-excel-o fa-md p-1"></i>
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>S.N</th>
              <th>Name</th>
              <th>Reference Range</th>
              <th>Unit</th>
              <th>Description</th>
              <th>Created Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPathologyParameters.map((item, index) => {
              const unit = getUnitById(item.unitId);
              return (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.referenceRange}</td>
                  <td>
                    <span className="badges bg-light-info">
                      {unit ? unit.name : "N/A"}
                    </span>
                  </td>
                  <td>{item.description}</td>
                  <td>
                    <span className="badges bg-light-info">
                      {formatTime(item.created_at)} <br />
                      {formatDate(item.created_at)}
                    </span>
                  </td>
                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                      <button className="btn" onClick={() => handleEdit(item)}>
                        <i className="text-primary fa fa-edit fa-lg" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deletePathologyParameter"
                        onClick={() => setDeleteId(item.id)}
                      >
                        <DeleteIcon className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        className="modal fade document_modal"
        id="addPathologyParameter"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addPathologyParameter"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-lg modal-center"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing
                  ? "Edit Pathology Parameter"
                  : "New Pathology Parameter"}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                onClick={resetForm}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>
                  Name: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Parameter Name"
                  value={pathologyParameter.name}
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Reference Range: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="referenceRange"
                  placeholder="Enter Reference Range"
                  value={pathologyParameter.referenceRange}
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Unit: <span className="text-danger">*</span>
                </label>
                <Select
                  options={unitOptions}
                  value={unitOptions.find(
                    (opt) => opt.value === pathologyParameter.unitId
                  )}
                  onChange={handleUnitChange}
                  className="basic-single"
                  classNamePrefix="select"
                  isClearable
                  placeholder="Select Unit"
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  placeholder="Enter Description"
                  value={pathologyParameter.description}
                  className="form-control"
                  onChange={handleChange}
                  rows="3"
                />
              </div>
              <div className="d-flex align-center justify-center mt-4">
                <button className="btn btn-primary mr-3" onClick={handleSubmit}>
                  {editing ? "Update" : "Save"}
                </button>
                <button
                  className="btn btn-secondary px-4"
                  data-dismiss="modal"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="deletePathologyParameter"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deletePathologyParameter"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-sm modal-dialog-centered"
          role="document"
        >
          <div className="modal-content text-center">
            <span className="modal-icon">
              <img
                src="https://hms.infyom.com/assets/images/remove.png"
                alt=""
              />
            </span>
            <h2>Delete</h2>
            <p>Are you sure want to delete this Pathology Parameter?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deletePathologyParameter}
              >
                Yes, Delete
              </button>
              <button
                className="btn btn-secondary w-100 ml-1"
                data-dismiss="modal"
              >
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathologyParameters;
