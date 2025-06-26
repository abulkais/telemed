import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import dayjs from "dayjs";
import CircularProgress from "@mui/material/CircularProgress";

const DoctorsDepartments = () => {
  const [departmentsData, setDepartmentsData] = useState([]);
  const [excelLoading, setExcelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState({
    name: "",
    description: "",
  });
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("DoctorDepartments");
  const [dateFilter, setDateFilter] = useState({
    start: null,
    end: null,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDepartment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!department.name) {
      toast.error("Department name is required");
      return false;
    }
    
    // Check for duplicate department name (case insensitive)
    
    const isDuplicate = departmentsData.some(
      dept => dept.name.toLowerCase() === department.name.toLowerCase() && 
              (!editing || dept.id !== editId)
    );
    
    if (isDuplicate) {
      toast.error("Department name already exists");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const currentDate = new Date().toISOString();
    const departmentId = String(departmentsData.length + 1).padStart(2, "0");

    const newDepartment = {
      ...department,
      departmentId: editing ? departmentsData.find(d => d.id === editId).departmentId : departmentId,
      created_at: currentDate,
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/doctorsDepartment/${editId}`,
          newDepartment
        );
        toast.success("Department Updated Successfully");
      } else {
        const res = await axios.post(
          `http://localhost:8080/api/doctorsDepartment`,
          {
            ...newDepartment,
            id: departmentId // Ensure ID is included for new departments
          }
        );
        toast.success("Department Added Successfully");
      }

      fetchDepartmentsData();
      resetForm();
      $("#addDepartment").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving Department");
    }
  };

  const resetForm = () => {
    setDepartment({
      name: "",
      description: "",
    });
    setEditing(false);
    setEditId(null);
  };

  const fetchDepartmentsData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:8080/api/doctorsDepartment`
      );
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setDepartmentsData(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching Departments:", error);
      toast.error("Failed to load Departments");
    } finally {
      setLoading(false);
    }
  };

  const deleteDepartment = async () => {
    if (!deleteId) {
      toast.error("Invalid Department ID!");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8080/api/doctorsDepartment/${deleteId}`
      );
      setDepartmentsData((prev) => prev.filter((dept) => dept.id !== deleteId));
      toast.success("Department deleted successfully!");
      $("#DeleteDepartment").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Department!");
    }
  };

  const handleEdit = (dept) => {
    setEditing(true);
    setEditId(dept.id);
    setDepartment({
      name: dept.name,
      description: dept.description,
    });
    $("#addDepartment").modal("show");
  };

  const downloadCSV = () => {
    setExcelLoading(true);

    let dataToExport;
    let fileName;

    if (dateFilter.start && !dateFilter.end) {
      dataToExport = departmentsData.filter((doc) => {
        const docDate = new Date(doc.created_at);
        const filterDate = new Date(dateFilter.start);

        return (
          docDate.getDate() === filterDate.getDate() &&
          docDate.getMonth() === filterDate.getMonth() &&
          docDate.getFullYear() === filterDate.getFullYear()
        );
      });
      fileName = `Doctor_Departments_${new Date(dateFilter.start)
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else if (dateFilter.start || dateFilter.end || searchQuery) {
      dataToExport = departmentsData
        .filter(filterByDate)
        .filter(filterBySearch);
      fileName = `Doctor_Departments_Filtered_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else {
      dataToExport = departmentsData;
      fileName = `Doctor_Departments_All_Data_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
    }

    if (dataToExport.length === 0) {
      toast.error("No data found for the current filters!");
      setExcelLoading(false);
      return;
    }

    const data = [
      {
        "Department ID": "Department ID",
        "Department Name": "Department Name",
        Description: "Description",
        "Date & Time": "Date & Time",
      },
      ...dataToExport.map((dept) => ({
        "Department ID": dept.departmentId,
        "Department Name": dept.name,
        Description: dept.description,
        "Date & Time": formatDate(dept.created_at),
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    worksheet["!cols"] = [{ wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 20 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Departments Report");
    XLSX.writeFile(workbook, fileName);
    setExcelLoading(false);
    toast.success(`Report downloaded (${dataToExport.length} records)`);
  };

  const filterByDate = (doc) => {
    if (!dateFilter.start && !dateFilter.end) return true;

    const docDate = new Date(doc.created_at);
    const startDate = dateFilter.start
      ? new Date(dateFilter.start)
      : new Date(0);

    let endDate;
    if (dateFilter.end) {
      endDate = new Date(dateFilter.end);
      endDate.setHours(23, 59, 59, 999);
    } else {
      endDate = new Date();
    }

    return docDate >= startDate && docDate <= endDate;
  };

  const filterBySearch = (doc) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      (doc.name && doc.name.toLowerCase().includes(searchLower)) ||
      (doc.description &&
        doc.description.toLowerCase().includes(searchLower)) ||
      (doc.departmentId && doc.departmentId.toLowerCase().includes(searchLower))
    );
  };

  const filteredDepartments = departmentsData
    .filter(filterByDate)
    .filter(filterBySearch);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDepartments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

  const formatDate = (input) => {
    if (!input) return "Invalid Date";
    return dayjs(input).format("DD MMMM YYYY"); // e.g., 12 April 2025
  };

  useEffect(() => {
    fetchDepartmentsData();
  }, []);

  return (
    <div>
      <ToastContainer />

      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link
            to="/doctors"
            className={`doctor-nav-btn ${filter === "Doctors" ? "active" : ""}`}
            onClick={() => setFilter("Doctors")}
          >
            <span className="btn-text">Doctors</span>
          </Link>

          <Link
            to="/doctor-departments"
            className={`doctor-nav-btn ${
              filter === "DoctorDepartments" ? "active" : ""
            }`}
            onClick={() => setFilter("DoctorDepartments")}
          >
            <span className="btn-text">Departments</span>
          </Link>

          <Link
            to="/schedules"
            className={`doctor-nav-btn ${
              filter === "Schedules" ? "active" : ""
            }`}
            onClick={() => setFilter("Schedules")}
          >
            <span className="btn-text">Schedules</span>
          </Link>

          <Link
            to="/doctors-holidays"
            className={`doctor-nav-btn ${
              filter === "DoctorsHolidays" ? "active" : ""
            }`}
            onClick={() => setFilter("DoctorsHolidays")}
          >
            <span className="btn-text">Holidays</span>
          </Link>

          <Link
            to="/doctors-breaks"
            className={`doctor-nav-btn ${
              filter === "DoctorsBreaks" ? "active" : ""
            }`}
            onClick={() => setFilter("DoctorsBreaks")}
          >
            <span className="btn-text">Breaks</span>
          </Link>
        </div>
      </div>
      <div className="filter-bar-container">
        <div className="filter-search-box">
          <input
            type="text"
            className="form-control"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <div className="mr-2">
            {/* <label>From:</label> */}
            <DatePicker
              selected={dateFilter.start}
              onChange={(date) => setDateFilter({ ...dateFilter, start: date })}
              selectsStart
              startDate={dateFilter.start}
              endDate={dateFilter.end}
              placeholderText="Start Date"
              className="form-control"
              dateFormat="MMM d, yyyy"
              isClearable
            />
          </div>
          <div className="mr-2">
            {/* <label>To:</label> */}
            <DatePicker
              selected={dateFilter.end}
              onChange={(date) => setDateFilter({ ...dateFilter, end: date })}
              selectsEnd
              startDate={dateFilter.start}
              endDate={dateFilter.end}
              minDate={dateFilter.start}
              placeholderText="End Date"
              className="form-control"
              dateFormat="MMM d, yyyy"
              isClearable
            />
          </div>

          <button
            className="filter-btn filter-btn-primary"
            data-toggle="modal"
            data-target="#addDepartment"
            onClick={resetForm}
          >
            New Department
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
        {loading ? (
          <div className="text-center py-5">
            <CircularProgress />
            <p>Loading Doctors Department data</p>
          </div>
        ) : (
          <>
          
            <table className="table custom-table-striped custom-table table-hover text-center">
              <thead className="thead-light">
                <tr>
                  <th>S.N</th>
                  <th>Department Name</th>
                  <th>Description</th>
                  <th>Date & Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <div className="text-center py-5">
                    <CircularProgress />
                    <p>Loading Doctors Department data...</p>
                  </div>
                ) : (
                  currentItems.map((dept, index) => (
                    <tr key={index}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>
                        <span className="badges bg-light-success">
                          {dept.name}
                        </span>
                      </td>
                      <td>{dept.description}</td>
                      <td>
                        <div className="badges bg-light-info">
                          {formatDate(dept.created_at)}
                        </div>
                      </td>
                      <td>
                        <div
                          className="d-flex justify-center items-center"
                          style={{ justifyContent: "center" }}
                        >
                          <button
                            className="btn"
                            onClick={() => handleEdit(dept)}
                          >
                            <i className="text-primary fa fa-edit fa-lg" />
                          </button>
                          <button
                            className="btn"
                            data-toggle="modal"
                            data-target="#DeleteDepartment"
                            onClick={() => setDeleteId(dept.id)}
                          >
                            <DeleteIcon className="text-danger" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        )}

        {/* Pagination controls */}
        <div className="d-flex justify-content-between align-items-center mt-5">
          <div>
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredDepartments.length)} of{" "}
            {filteredDepartments.length} results
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

              {/* Always show first page */}
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

              {/* Show ellipsis if current page is far from start */}
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

              {/* Show pages around current page */}
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

              {/* Show ellipsis if current page is far from end */}
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

              {/* Always show last page if there's more than 1 page */}
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

      {/* Add/Edit Department Modal */}
      <div
        className="modal fade document_modal"
        id="addDepartment"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addDepartment"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-lg modal-center"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Department" : "New Department"}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                onClick={resetForm}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>
                  Doctor Department: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Doctor Department"
                  value={department.name}
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={department.description}
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

      {/* Delete Confirmation Modal */}
      <div
        className="modal fade"
        id="DeleteDepartment"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="DeleteDepartment"
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
            <p>Are you sure want to delete this Department?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteDepartment}
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

export default DoctorsDepartments;
