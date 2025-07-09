import React, { useState, useEffect, useRef } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import { Link, useNavigate } from "react-router-dom";

import Pagination from "../Pagination";

const Beds = () => {
  const [beds, setBeds] = useState([]);
  const [bedTypes, setBedTypes] = useState([]);
  const [excelLoading, setExcelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bed, setBed] = useState({
    name: "",
    bed_type_id: "",
    charge: "",
    description: "",
  });
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBed((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!bed.name) {
      toast.error("Bed Name is required");
      return false;
    }
    if (!bed.bed_type_id) {
      toast.error("Bed Type is required");
      return false;
    }
    if (!bed.charge || parseFloat(bed.charge) <= 0) {
      toast.error("Charge must be greater than 0");
      return false;
    }
    const isDuplicate = beds.some(
      (item) =>
        item.name.toLowerCase() === bed.name.toLowerCase() &&
        (!editing || item.id !== editId)
    );
    if (isDuplicate) {
      toast.error("The bed name has already been taken.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
    const newBed = {
      ...bed,
      charge: parseFloat(bed.charge),
      created_at: currentDate,
    };

    try {
      if (editing) {
        await axios.put(`http://localhost:8080/api/beds/${editId}`, newBed);
        toast.success("Bed Updated Successfully");
      } else {
        await axios.post(`http://localhost:8080/api/beds`, newBed);
        toast.success("Bed Added Successfully");
      }
      fetchBeds();
      resetForm();
      $("#addBed").modal("hide");
    } catch (error) {
      console.error("Submission error:", error.response?.data || error.message);
      toast.error(
        `Error saving bed: ${error.response?.data?.error || "Unknown error"}`
      );
    }
  };

  const resetForm = () => {
    setBed({
      name: "",
      bed_type_id: "",
      charge: "",
      description: "",
    });
    setEditing(false);
    setEditId(null);
  };

  const fetchBeds = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/beds`);
      setBeds(res.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching beds:", error);
      toast.error("Failed to load beds");
    }
  };

  const fetchBedTypes = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/bedTypes`);
      setBedTypes(res.data);
    } catch (error) {
      console.error("Error fetching bed types:", error);
      toast.error("Failed to load bed types");
    }
  };

  const deleteBed = async () => {
    if (!deleteId) {
      toast.error("Invalid Bed ID!");
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/api/beds/${deleteId}`);
      setBeds((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Bed deleted successfully!");
      $("#deleteBed").modal("hide");
    } catch (error) {
      console.error("Delete error:", error.response?.data || error.message);
      toast.error(
        `Error deleting bed: ${error.response?.data?.error || "Unknown error"}`
      );
    }
  };

  const handleEdit = (item) => {
    setEditing(true);
    setEditId(item.id);
    setBed({
      name: item.name,
      bed_type_id: item.bed_type_id,
      charge: item.charge,
      description: item.description || "",
    });
    $("#addBed").modal("show");
  };

  const downloadCSV = () => {
    setExcelLoading(true);
    let dataToExport = filteredBeds;
    let fileName = `Beds_Filtered_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    if (dataToExport.length === 0) {
      toast.error("No data found for the current filters!");
      setExcelLoading(false);
      return;
    }

    const data = [
      {
        "Bed Name": "Bed Name",
        "Bed Type": "Bed Type",
        Charge: "Charge",
        "Date & Time": "Date & Time",
      },
      ...dataToExport.map((item) => ({
        "Bed Name": item.name,
        "Bed Type": item.bed_type_name,
        Charge: item.charge,
        "Date & Time": formatDate(item.created_at),
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    worksheet["!cols"] = [{ wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 20 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Beds_Report");
    XLSX.writeFile(workbook, fileName);
    setExcelLoading(false);
    toast.success(`Report downloaded (${dataToExport.length} records)`);
  };

  const filterBySearch = (bed) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return bed.name && bed.name.toLowerCase().includes(searchLower);
  };

  const filteredBeds = beds.filter(filterBySearch);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBeds.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBeds.length / itemsPerPage);

  const formatDate = (dateString) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const dateObj = new Date(dateString);
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  useEffect(() => {
    fetchBeds();
    fetchBedTypes();
  }, []);

  const toggleActionsDropdown = () => {
    setShowActions(!showActions);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showActions]);

  const handleViewBedType = (bedType) => {
    if (!bedType?.id) {
      toast.error("Invalid bed type ID");
      return;
    }
    navigate(`/bed-types/${bedType.id}`);
  };

  const getBedTypeById = (id) => {
    return bedTypes.find((type) => type.id === id);
  };
  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link to="/bed-status" className="doctor-nav-btn">
            <span className="btn-text">Bed Status</span>
          </Link>
          <Link to="/bed-assigns" className="doctor-nav-btn">
            <span className="btn-text">Bed Assigns</span>
          </Link>
          <Link to="/beds" className="doctor-nav-btn active">
            <span className="btn-text">Beds</span>
          </Link>
          <Link to="/bed-types" className="doctor-nav-btn">
            <span className="btn-text">Bed Types</span>
          </Link>
        </div>
      </div>

      <div className="filter-bar-container">
        <div className="filter-search-box" style={{ flex: 1 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <div
            className="actions-dropdown"
            style={{ position: "relative" }}
            ref={actionsRef}
          >
            <button
              className="filter-btn filter-btn-primary"
              onClick={toggleActionsDropdown}
            >
              Actions <i className="fa fa-chevron-down ml-2"></i>
            </button>
            {showActions && (
              <div
                className="dropdown-content"
                style={{
                  position: "absolute",
                  backgroundColor: "#fff",
                  minWidth: "150px",
                  boxShadow: "0px 8px 16px 0px rgba(0,0,0,0.2)",
                  zIndex: 1,
                  right: 0,
                  borderRadius: "5px",
                  border: "1px solid #e0e0e0",
                }}
              >
                <button
                  className="dropdown-item w-100 text-left"
                  data-toggle="modal"
                  data-target="#addBed"
                  onClick={() => {
                    resetForm();
                    setShowActions(false);
                  }}
                  style={{
                    padding: "10px",
                    border: "none",
                    background: "none",
                    fontSize: "14px",
                  }}
                >
                  New Bed
                </button>
                <Link
                  to="/bulk-beds"
                  className="dropdown-item w-100 text-left"
                  onClick={() => setShowActions(false)}
                  style={{
                    padding: "10px",
                    display: "block",
                    color: "#000",
                    textDecoration: "none",
                    fontSize: "14px",
                  }}
                >
                  New Bulk Bed
                </Link>
              </div>
            )}
          </div>
          <button
            className="btn btn-success ml-2"
            onClick={downloadCSV}
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
              <th>S.No </th>
              <th>Bed Name</th>
              <th>Bed Type</th>
              <th>Charge</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>

                <td>
                  <span
                    className="text-primary"
                    onClick={() => navigate(`/beds/${item.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    {item.name}
                  </span>
                </td>
                <td>
                  <span
                    className="text-primary"
                    onClick={() => {
                      const bedType = getBedTypeById(item.bed_type_id);
                      if (bedType) {
                        handleViewBedType(bedType);
                      } else {
                        toast.error("Bed type not found");
                      }
                    }}
                  >
                    {item.bed_type_name}
                  </span>
                </td>

                <td>${item.charge}</td>
                <td>
                  <div className="d-flex justify-content-center align-items-center">
                    <button className="btn" onClick={() => handleEdit(item)}>
                      <i className="fa fa-edit fa-lg text-primary"></i>
                    </button>
                    <button
                      className="btn"
                      data-toggle="modal"
                      data-target="#deleteBed"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <DeleteIcon className="text-danger" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
      />
      <div
        className="modal fade document_modal"
        id="addBed"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addBed"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-lg modal-center"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Bed" : "New Bed"}
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
                  Bed Name: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Bed Name"
                  value={bed.name}
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>
                  Bed Type: <span className="text-danger">*</span>
                </label>
                <select
                  name="bed_type_id"
                  value={bed.bed_type_id}
                  className="form-control"
                  onChange={handleChange}
                >
                  <option value="">Select Bed Type</option>
                  {bedTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>
                  Charge: <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="charge"
                  placeholder="Charge"
                  value={bed.charge}
                  className="form-control"
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={bed.description}
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="d-flex align-items-center justify-content-center mt-4">
                <button className="btn btn-primary mr-3" onClick={handleSubmit}>
                  {editing ? "Update" : "Save"}
                </button>
                <button
                  className="btn btn-secondary"
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
        id="deleteBed"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteBed"
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
            <p>Are you sure you want to delete this bed?</p>
            <div className="d-flex">
              <button className="btn btn-danger w-100 mr-1" onClick={deleteBed}>
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

export default Beds;
