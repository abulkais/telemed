import React, { useState, useEffect, useRef } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import Switch from "@mui/material/Switch";
import { Link } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
const Vaccinations = () => {
  const [vaccinations, setVaccinations] = useState([]);
  const [excelLoading, setExcelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [vaccination, setVaccination] = useState({
    name: "",
    manufacturedBy: "",
    brand: "",
    isAvailable: true,
  });
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const filterRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVaccination((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (e) => {
    setVaccination((prev) => ({
      ...prev,
      isAvailable: e.target.checked,
    }));
  };

  const validateForm = () => {
    if (!vaccination.name) {
      toast.error("Name is required");
      return false;
    }
    if (!vaccination.manufacturedBy) {
      toast.error("Manufactured By is required");
      return false;
    }
    if (!vaccination.brand) {
      toast.error("Brand is required");
      return false;
    }

    const isDuplicate = vaccinations.some(
      (item) =>
        item.name.toLowerCase() === vaccination.name.toLowerCase() &&
        (!editing || item.id !== editId)
    );
    if (isDuplicate) {
      toast.error("The vaccination name has already been taken.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    const newVaccination = {
      ...vaccination,
      created_at: currentDate,
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/vaccinations/${editId}`,
          newVaccination
        );
        toast.success("Vaccination Updated Successfully");
      } else {
        await axios.post(
          `http://localhost:8080/api/vaccinations`,
          newVaccination
        );
        toast.success("Vaccination Added Successfully");
      }
      fetchVaccinations();
      resetForm();
      $("#addVaccination").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving Vaccination");
    }
  };

  const resetForm = () => {
    setVaccination({
      name: "",
      manufacturedBy: "",
      brand: "",
      isAvailable: true,
    });
    setEditing(false);
    setEditId(null);
  };

  const fetchVaccinations = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/vaccinations`);
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setVaccinations(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching Vaccinations:", error);
      toast.error("Failed to load Vaccinations");
    }
  };

  const deleteVaccination = async () => {
    if (!deleteId) {
      toast.error("Invalid Vaccination ID!");
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/api/vaccinations/${deleteId}`);
      setVaccinations((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Vaccination deleted successfully!");
      $("#deleteVaccination").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Vaccination!");
    }
  };

  const handleEdit = (item) => {
    setEditing(true);
    setEditId(item.id);
    setVaccination({
      name: item.name,
      manufacturedBy: item.manufacturedBy,
      brand: item.brand,
      isAvailable: item.isAvailable,
    });
    $("#addVaccination").modal("show");
  };

  const downloadCSV = () => {
    setExcelLoading(true);

    let dataToExport = filteredVaccinations;
    let fileName = `Vaccinations_Filtered_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    if (dataToExport.length === 0) {
      toast.error("No data found for the current filters!");
      setExcelLoading(false);
      return;
    }

    const data = [
      {
        Name: "Name",
        "Manufactured By": "Manufactured By",
        Brand: "Brand",
        "Is Available": "Is Available",
        "Date & Time": "Date & Time",
      },
      ...dataToExport.map((item) => ({
        Name: item.name,
        "Manufactured By": item.manufacturedBy,
        Brand: item.brand,
        "Is Available": item.isAvailable ? "Yes" : "No",
        "Date & Time": formatDate(item.created_at),
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 12 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vaccinations_Report");
    XLSX.writeFile(workbook, fileName);
    setExcelLoading(false);
    toast.success(`Report downloaded (${dataToExport.length} records)`);
  };

  const filterBySearch = (vaccination) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      vaccination.name && vaccination.name.toLowerCase().includes(searchLower)
    );
  };

  const filterByStatus = (vaccination) => {
    if (statusFilter === "ALL") return true;
    return statusFilter === "Active"
      ? vaccination.isAvailable
      : !vaccination.isAvailable;
  };

  const filteredVaccinations = vaccinations
    .filter(filterBySearch)
    .filter(filterByStatus);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVaccinations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredVaccinations.length / itemsPerPage);

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
    fetchVaccinations();
  }, []);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
    setShowFilter(false); // Close dropdown on selection
  };

  const resetFilters = () => {
    setStatusFilter("ALL");
    setSearchQuery("");
    setCurrentPage(1);
    setShowFilter(false); // Close dropdown on reset
  };

  const toggleFilterDropdown = () => {
    setShowFilter(!showFilter);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };

    if (showFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilter]);

  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link
            to="/vaccinated-patients"
            className={`doctor-nav-btn`}
            onClick={() => {}}
          >
            <span className="btn-text">Vaccinated Patients</span>
          </Link>
          <Link
            to="/vaccinations"
            className={`doctor-nav-btn active`}
            onClick={() => {}}
          >
            <span className="btn-text">Vaccinations</span>
          </Link>
        </div>
      </div>

      <div
        className="filter-bar-container"
        style={{ display: "flex", alignItems: "center", gap: "10px" }}
      >
        <div className="filter-search-box" style={{ flex: 1 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search Vaccinations by Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <div
            className="filter-options"
            style={{ position: "relative" }}
            ref={filterRef}
          >
            <button
              className="filter-btn filter-btn-icon mr-3"
              onClick={toggleFilterDropdown}
              style={{
                backgroundColor: "#e3f2fd",
                color: "#fff",
                border: "none",
              }}
            >
              <FilterAltIcon/>
            </button>
            {showFilter && (
              <div
                className="dropdown-content"
                style={{
                  position: "absolute",
                  backgroundColor: "#fff",
                  minWidth: "200px",
                  boxShadow: "0px 8px 16px 0px rgba(0,0,0,0.2)",
                  zIndex: 1,
                  right: 0,
                  borderRadius: "5px",
                  padding: "15px",
                  border: "1px solid #e0e0e0",
                }}
              >
                <div className="form-group">
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      marginBottom: "5px",
                    }}
                  >
                    Status:
                  </label>
                  <select
                    className="form-control"
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    style={{ padding: "5px", fontSize: "14px" }}
                  >
                    <option value="ALL">ALL</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <button
                  className="btn btn-secondary w-100 mt-2"
                  onClick={resetFilters}
                  style={{
                    backgroundColor: "#bdbdbd",
                    border: "none",
                    padding: "8px",
                    fontSize: "14px",
                  }}
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          <button
            className="filter-btn filter-btn-primary"
            data-toggle="modal"
            data-target="#addVaccination"
            onClick={resetForm}
          >
            New Vaccination
          </button>

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
              <th>S.N</th>
              <th>Name</th>
              <th>Manufactured By</th>
              <th>Brand</th>
              <th>Is Available</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>
                  <span className="badges bg-light-success">{item.name}</span>
                </td>
                <td>{item.manufacturedBy}</td>
                <td>{item.brand}</td>
                <td>
                  <span
                    className={`badge ${
                      item.isAvailable ? "bg-light-success" : "bg-light-danger"
                    }`}
                  >
                    {item.isAvailable ? "Yes" : "No"}
                  </span>
                </td>
                <td>
                  <div
                    className="d-flex justify-center items-center"
                    style={{ justifyContent: "center" }}
                  >
                    <button className="btn" onClick={() => handleEdit(item)}>
                      <i className="fa fa-edit fa-lg text-primary"></i>
                    </button>
                    <button
                      className="btn"
                      data-toggle="modal"
                      data-target="#deleteVaccination"
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

        <div className="d-flex justify-content-between align-items-center mt-5">
          <div>
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredVaccinations.length)} of{" "}
            {filteredVaccinations.length} results
          </div>
          <nav>
            <ul className="pagination">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ArrowBackIosIcon />
                </button>
              </li>

              <li className={`page-item ${currentPage === 1 ? "active" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(1)}
                  style={{
                    height: "42px",
                    borderRadius: "10px",
                    boxShadow: "none",
                    border: "none",
                  }}
                >
                  1
                </button>
              </li>

              {currentPage > 4 && (
                <li className="page-item disabled">
                  <span
                    className="page-link"
                    style={{
                      height: "42px",
                      borderRadius: "10px",
                      boxShadow: "none",
                      border: "none",
                    }}
                  >
                    ...
                  </span>
                </li>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (number) =>
                    number > 1 &&
                    number < totalPages &&
                    Math.abs(number - currentPage) <= 2
                )
                .map((number) => (
                  <li
                    key={number}
                    className={`page-item ${
                      currentPage === number ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(number)}
                      style={{
                        height: "42px",
                        borderRadius: "10px",
                        boxShadow: "none",
                        border: "none",
                      }}
                    >
                      {number}
                    </button>
                  </li>
                ))}

              {currentPage < totalPages - 3 && (
                <li className="page-item disabled">
                  <span
                    className="page-link"
                    style={{
                      height: "42px",
                      borderRadius: "10px",
                      boxShadow: "none",
                      border: "none",
                    }}
                  >
                    ...
                  </span>
                </li>
              )}

              {totalPages > 1 && (
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(totalPages)}
                    style={{
                      height: "42px",
                      borderRadius: "10px",
                      boxShadow: "none",
                      border: "none",
                    }}
                  >
                    {totalPages}
                  </button>
                </li>
              )}

              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <ArrowForwardIosIcon />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div
        className="modal fade document_modal"
        id="addVaccination"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addVaccination"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-lg modal-center"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Vaccination" : "New Vaccination"}
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
                  placeholder="Enter vaccination name"
                  value={vaccination.name}
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Manufactured By: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="manufacturedBy"
                  placeholder="Enter manufacturer"
                  value={vaccination.manufacturedBy}
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Brand: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="brand"
                  placeholder="Enter brand"
                  value={vaccination.brand}
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Is Available:</label>
                <div className="d-flex align-items-center">
                  <Switch
                    checked={vaccination.isAvailable}
                    onChange={handleStatusChange}
                    color="primary"
                    inputProps={{ "aria-label": "availability status" }}
                  />
                  <span className="ml-2">
                    {vaccination.isAvailable ? "Available" : "Not Available"}
                  </span>
                </div>
              </div>
              <div className="d-flex align-center justify-center mt-4">
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
        id="deleteVaccination"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteVaccination"
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
            <p>Are you sure want to delete this Vaccination?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteVaccination}
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

export default Vaccinations;
