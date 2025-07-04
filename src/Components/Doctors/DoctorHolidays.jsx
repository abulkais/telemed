

import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Select from "react-select";
import DatePicker from "react-datepicker";
const DoctorHolidays = () => {
  const [holidaysData, setHolidaysData] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [excelLoading, setExcelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [holiday, setHoliday] = useState({
    doctorId: "",
    doctorName: "",
    date: new Date(),
    reason: "",
  });
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("DoctorsHolidays");
  const [dateFilter, setDateFilter] = useState({
    start: null,
    end: null,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Prepare doctor options for react-select
  const doctorOptions = doctors.map((doc) => ({
    value: doc.id,
    label: `${doc.firstName} ${doc.lastName}`,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHoliday((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (e) => {
    const dateValue = e.target.value ? new Date(e.target.value) : new Date();
    setHoliday({
      ...holiday,
      date: dateValue,
    });
  };

  const handleDoctorSelect = (selectedOption) => {
    setSelectedDoctor(selectedOption);
    setHoliday({
      ...holiday,
      doctorId: selectedOption ? selectedOption.value : "",
      doctorName: selectedOption ? selectedOption.label : "",
    });
  };

  const validateForm = () => {
    if (!holiday.doctorId) {
      toast.error("Please select a doctor");
      return false;
    }
    if (!holiday.date || isNaN(holiday.date.getTime())) {
      toast.error("Please select a valid date");
      return false;
    }
    if (!holiday.reason.trim()) {
      toast.error("Reason is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const formattedDate = holiday.date.toISOString().split("T")[0];
    const currentDateTime = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const newHoliday = {
      doctor_id: holiday.doctorId,
      doctor_name: holiday.doctorName,
      date: formattedDate,
      reason: holiday.reason,
      createdDateTime: currentDateTime,
    };

    try {
      // Check for duplicate holiday (same doctor, same date)
      const checkDuplicate = await axios.get(
        `http://localhost:8080/api/doctorHolidays/checkDuplicate?doctorId=${newHoliday.doctor_id}&date=${formattedDate}`
      );

      if (
        checkDuplicate.data.exists &&
        !(editing && editId === checkDuplicate.data.holidayId)
      ) {
        toast.error("A holiday already exists for this doctor on this date!");
        return;
      }

      if (editing) {
        await axios.put(
          `http://localhost:8080/api/doctorHolidays/${editId}`,
          newHoliday
        );
        toast.success("Holiday Updated Successfully");
      } else {
        await axios.post(
          `http://localhost:8080/api/doctorHolidays`,
          newHoliday
        );
        toast.success("Holiday Added Successfully");
      }

      fetchHolidaysData();
      resetForm();
      $("#addHoliday").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      if (error.response) {
        const errorMessage =
          error.response.data.error || "Error saving Holiday";
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error("No response received from server");
      } else {
        toast.error("Error setting up request");
      }
    }
  };

  const resetForm = () => {
    setHoliday({
      doctorId: "",
      doctorName: "",
      date: new Date(),
      reason: "",
    });
    setSelectedDoctor(null);
    setEditing(false);
    setEditId(null);
  };

  const fetchHolidaysData = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/doctorHolidays`);
      const transformedData = res.data.map((hol) => ({
        id: hol.id,
        doctorId: hol.doctor_id,
        doctorName: hol.doctor_name,
        doctorEmail: hol.doctor_email,
        date: hol.date,
        reason: hol.reason,
        createdDateTime: hol.created_date_time,
      }));
      const sortedData = transformedData.sort(
        (a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime)
      );
      setHolidaysData(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching Holidays:", error);
      toast.error("Failed to load Holidays");
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/doctors`);
      setDoctors(res.data);
    } catch (error) {
      console.error("Error fetching Doctors:", error);
      toast.error("Failed to load Doctors");
    }
  };

  const deleteHoliday = async () => {
    if (!deleteId) {
      toast.error("Invalid Holiday ID!");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8080/api/doctorHolidays/${deleteId}`
      );
      setHolidaysData((prev) => prev.filter((hol) => hol.id !== deleteId));
      toast.success("Holiday deleted successfully!");
      $("#DeleteHoliday").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Holiday!");
    }
  };

  const handleEdit = (hol) => {
    setEditing(true);
    setEditId(hol.id);
    setHoliday({
      doctorId: hol.doctorId,
      doctorName: hol.doctorName,
      date: new Date(hol.date),
      reason: hol.reason,
    });
    setSelectedDoctor({
      value: hol.doctorId,
      label: hol.doctorName,
    });
    $("#addHoliday").modal("show");
  };

  const downloadCSV = () => {
    setExcelLoading(true);

    let dataToExport;
    let fileName;

    if (dateFilter.start && !dateFilter.end) {
      dataToExport = holidaysData.filter((doc) => {
        const docDate = new Date(doc.date);
        const filterDate = new Date(dateFilter.start);

        return (
          docDate.getDate() === filterDate.getDate() &&
          docDate.getMonth() === filterDate.getMonth() &&
          docDate.getFullYear() === filterDate.getFullYear()
        );
      });
      fileName = `DoctorHolidays_${new Date(dateFilter.start)
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else if (dateFilter.start || dateFilter.end || searchQuery) {
      dataToExport = holidaysData.filter(filterByDate).filter(filterBySearch);
      fileName = `DoctorHolidays_Filtered_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else {
      dataToExport = holidaysData;
      fileName = `DoctorHolidays_All_Data_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
    }

    if (dataToExport.length === 0) {
      toast.error("No data found for the current filters!");
      setExcelLoading(false);
      return;
    }

    const data = [
      ["Doctor Name", "Date", "Reason", "Created Date"],
      ...dataToExport.map((hol) => [
        hol.doctorName,
        formatDate(hol.date),
        hol.reason,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 20 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Holidays Report");
    XLSX.writeFile(workbook, fileName);
    setExcelLoading(false);
    toast.success(`Report downloaded (${dataToExport.length} records)`);
  };

  const filterByDate = (doc) => {
    if (!dateFilter.start && !dateFilter.end) return true;

    const docDate = new Date(doc.date);
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
      (doc.doctorName && doc.doctorName.toLowerCase().includes(searchLower)) ||
      (doc.reason && doc.reason.toLowerCase().includes(searchLower)) ||
      (doc.date && formatDate(doc.date).toLowerCase().includes(searchLower))
    );
  };

  const filteredHolidays = holidaysData
    .filter(filterByDate)
    .filter(filterBySearch);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHolidays.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredHolidays.length / itemsPerPage);

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
    fetchHolidaysData();
    fetchDoctors();
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
            data-target="#addHoliday"
            onClick={resetForm}
          >
            New Holiday
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
              <th>Doctor Name</th>
              <th>Date</th>
              <th>Reason</th>
              <th>Created Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((hol, index) => (
              <tr key={index}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>
                <div className="d-flex align-items-center">
                
                  <div className="rounded-circle text-white d-flex align-items-center justify-content-center document_round_circle">
                   {hol.doctorName
                      ?.split(" ")
                      .map((word) => word.charAt(0))
                      .join("")
                      .toUpperCase()}
                 
                  </div>
              
                <div className="flex-wrap">
                  <p className="mb-0" style={{ textAlign: "start" }}>
                  {hol.doctorName} 
                  </p>
                  <p className="mb-0">{hol.doctorEmail}</p>
                </div>
              </div>
                  
                </td>
                <td>
                 
                  <span className="badges bg-light-success">
                    {formatDate(hol.date)}
                  </span>
                </td>
                <td>{hol.reason}</td>
                <td>
                  <div className="badges bg-light-info">
                    {formatDate(hol.createdDateTime)}
                  </div>
                </td>
                <td>
                  <div
                    className="d-flex justify-center items-center"
                    style={{ justifyContent: "center" }}
                  >
                    <button className="btn" onClick={() => handleEdit(hol)}>
                      <i className="text-primary fa fa-edit fa-lg" />
                    </button>
                    <button
                      className="btn"
                      data-toggle="modal"
                      data-target="#DeleteHoliday"
                      onClick={() => setDeleteId(hol.id)}
                    >
                      <DeleteIcon className="text-danger" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination controls */}
        <div className="d-flex justify-content-between align-items-center mt-5">
          <div>
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredHolidays.length)} of{" "}
            {filteredHolidays.length} results
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

      {/* Add/Edit Holiday Modal */}
      <div
        className="modal fade document_modal"
        id="addHoliday"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addHoliday"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-lg modal-center"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Holiday" : "New Holiday"}
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
                  Doctor: <span className="text-danger">*</span>
                </label>
                <Select
                  value={selectedDoctor}
                  onChange={handleDoctorSelect}
                  options={doctorOptions}
                  placeholder="Search doctor..."
                  isSearchable
                  noOptionsMessage={() => "No doctors found"}
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: "45",
                      height: "45",
                    }),
                    option: (provided) => ({
                      ...provided,
                      color: "#333",
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: "#333",
                    }),
                  }}
                />
              </div>

              <div className="form-group">
                <label>
                  Date: <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={holiday.date.toISOString().split("T")[0]}
                  onChange={handleDateChange}
                  className="form-control"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="form-group">
                <label>
                  Reason: <span className="text-danger">*</span>
                </label>
                <textarea
                  name="reason"
                  value={holiday.reason}
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
        id="DeleteHoliday"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="DeleteHoliday"
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
            <p>Are you sure want to delete this Holiday?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteHoliday}
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

export default DoctorHolidays;
