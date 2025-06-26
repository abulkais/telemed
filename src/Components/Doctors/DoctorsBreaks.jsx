
// export default DoctorsBreaks;
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
import "react-datepicker/dist/react-datepicker.css";
const DoctorsBreaks = () => {
  const [breaksData, setBreaksData] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [excelLoading, setExcelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [breakItem, setBreakItem] = useState({
    doctorId: "",
    doctorEmail: "",
    doctorName: "",
    breakType: "Every Day",
    date: new Date(),
    fromTime: "00:05:00",
    toTime: "00:05:00",
  });
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("DoctorsBreaks");
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
    email: doc.email,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBreakItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (e) => {
    const dateValue = e.target.value ? new Date(e.target.value) : new Date();
    setBreakItem({
      ...breakItem,
      date: dateValue,
    });
  };

  const handleDoctorSelect = (selectedOption) => {
    setSelectedDoctor(selectedOption);
    setBreakItem({
      ...breakItem,
      doctorId: selectedOption ? selectedOption.value : "",
      doctorEmail: selectedOption ? selectedOption.email : "",
      doctorName: selectedOption ? selectedOption.label : "",
    });
  };

  const validateForm = () => {
    if (!breakItem.doctorId || !breakItem.doctorEmail) {
      toast.error("Please select a doctor");
      return false;
    }
    if (breakItem.breakType === "Single Day" && !breakItem.date) {
      toast.error("Date is required for single day break");
      return false;
    }
    if (!breakItem.fromTime) {
      toast.error("From time is required");
      return false;
    }
    if (!breakItem.toTime) {
      toast.error("To time is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const formattedDate = breakItem.date.toISOString().split("T")[0];
    const currentDateTime = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const newBreak = {
      doctorId: breakItem.doctorId,
      doctorEmail: breakItem.doctorEmail,
      doctorName: breakItem.doctorName,
      breakType: breakItem.breakType,
      date: breakItem.breakType === "Every Day" ? null : formattedDate,
      fromTime: breakItem.fromTime,
      toTime: breakItem.toTime,
      createdDateTime: currentDateTime,
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/doctorBreaks/${editId}`,
          newBreak
        );
        toast.success("Break Updated Successfully");
      } else {
        await axios.post(`http://localhost:8080/api/doctorBreaks`, newBreak);
        toast.success("Break Added Successfully");
      }

      fetchBreaksData();
      resetForm();
      $("#addBreak").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      if (error.response) {
        const errorMessage = error.response.data.error || "Error saving Break";
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error("No response received from server");
      } else {
        toast.error("Error setting up request");
      }
    }
  };

  const resetForm = () => {
    setBreakItem({
      doctorId: "",
      doctorEmail: "",
      doctorName: "",
      breakType: "Every Day",
      date: new Date(),
      fromTime: "00:05:00",
      toTime: "00:05:00",
    });
    setSelectedDoctor(null);
    setEditing(false);
    setEditId(null);
  };

  const fetchBreaksData = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/doctorBreaks`);
      const transformedData = res.data.map((brk) => ({
        id: brk.id,
        doctorId: brk.doctor_id,
        doctorEmail: brk.doctor_email,
        doctorName: brk.doctor_name,
        breakType: brk.break_type,
        date: brk.date,
        fromTime: brk.from_time,
        toTime: brk.to_time,
        createdDateTime: brk.created_date_time,
      }));
      const sortedData = transformedData.sort(
        (a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime)
      );
      setBreaksData(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching Breaks:", error);
      toast.error("Failed to load Breaks");
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

  const deleteBreak = async () => {
    if (!deleteId) {
      toast.error("Invalid Break ID!");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/doctorBreaks/${deleteId}`);
      setBreaksData((prev) => prev.filter((brk) => brk.id !== deleteId));
      toast.success("Break deleted successfully!");
      $("#DeleteBreak").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Break!");
    }
  };

  const handleEdit = (brk) => {
    setEditing(true);
    setEditId(brk.id);
    setBreakItem({
      doctorId: brk.doctorId,
      doctorEmail: brk.doctorEmail,
      doctorName: brk.doctorName,
      breakType: brk.breakType,
      date: brk.date ? new Date(brk.date) : new Date(),
      fromTime: brk.fromTime,
      toTime: brk.toTime,
    });
    setSelectedDoctor({
      value: brk.doctorId,
      email: brk.doctorEmail,
      label: brk.doctorName,
    });
    $("#addBreak").modal("show");
  };

  const downloadCSV = () => {
    setExcelLoading(true);

    let dataToExport;
    let fileName;

    if (dateFilter.start && !dateFilter.end) {
      dataToExport = breaksData.filter((doc) => {
        const docDate = new Date(doc.date || doc.createdDateTime);
        const filterDate = new Date(dateFilter.start);

        return (
          docDate.getDate() === filterDate.getDate() &&
          docDate.getMonth() === filterDate.getMonth() &&
          docDate.getFullYear() === filterDate.getFullYear()
        );
      });
      fileName = `DoctorBreaks_${new Date(dateFilter.start)
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else if (dateFilter.start || dateFilter.end || searchQuery) {
      dataToExport = breaksData.filter(filterByDate).filter(filterBySearch);
      fileName = `DoctorBreaks_Filtered_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else {
      dataToExport = breaksData;
      fileName = `DoctorBreaks_All_Data_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
    }

    if (dataToExport.length === 0) {
      toast.error("No data found for the current filters!");
      setExcelLoading(false);
      return;
    }

    const data = [
      [
        "Doctor Name",
        "Doctor Email",
        "Break Type",
        "Date",
        "From Time",
        "To Time",
        "Created Date",
      ],
      ...dataToExport.map((brk) => [
        brk.doctorName,
        brk.doctorEmail,
        brk.breakType,
        brk.date ? formatDate(brk.date) : "Every Day",
        brk.fromTime,
        brk.toTime,
        formatDateTime(brk.createdDateTime),
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet["!cols"] = [
      { wch: 25 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Breaks Report");
    XLSX.writeFile(workbook, fileName);
    setExcelLoading(false);
    toast.success(`Report downloaded (${dataToExport.length} records)`);
  };

  const filterByDate = (doc) => {
    if (!dateFilter.start && !dateFilter.end) return true;

    const docDate = new Date(doc.date || doc.createdDateTime);
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
      (doc.doctorEmail &&
        doc.doctorEmail.toLowerCase().includes(searchLower)) ||
      (doc.fromTime && doc.fromTime.toLowerCase().includes(searchLower)) ||
      (doc.toTime && doc.toTime.toLowerCase().includes(searchLower))
    );
  };

  const filteredBreaks = breaksData.filter(filterByDate).filter(filterBySearch);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBreaks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBreaks.length / itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return "Every Day";
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

  const formatDateTime = (dateString) => {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleString();
  };

  useEffect(() => {
    fetchBreaksData();
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
       
     
            <div className="filter-date-picker mr-3">
              {" "}
              <DatePicker
                selected={dateFilter.start}
                onChange={(date) =>
                  setDateFilter({ ...dateFilter, start: date })
                }
                selectsStart
                startDate={dateFilter.start}
                endDate={dateFilter.end}
                placeholderText="Start Date"
                className="form-control"
                dateFormat="MMM d, yyyy"
                isClearable
              />
              <i className="filter-date-icon far fa-calendar-alt"></i>
            </div>
            <div className="filter-date-picker mr-3">
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
              <i className="filter-date-icon far fa-calendar-alt"></i>
            </div>
     
          <button
            className="filter-btn filter-btn-primary"
            data-toggle="modal"
            data-target="#addBreak"
            onClick={resetForm}
          >
            New Break
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
              <th>Doctor </th>
              <th>Break Type</th>
              <th>Date</th>
              <th>From Time</th>
              <th>To Time</th>
              <th>Created Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((brk, index) => (
              <tr key={index}>
                <td>{indexOfFirstItem + index + 1}</td>

                <td>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle text-white d-flex align-items-center justify-content-center document_round_circle">
                      {brk.doctorName
                        ?.split(" ")
                        .map((word) => word.charAt(0))
                        .join("")
                        .toUpperCase()}
                    </div>

                    <div className="flex-wrap">
                      <p className="mb-0" style={{ textAlign: "start" }}>
                        {brk.doctorName}
                      </p>
                      <p className="mb-0">{brk.doctorEmail}</p>
                    </div>
                  </div>
                </td>
                <td>{brk.breakType}</td>
                <td>
                  {" "}
                  <span className="badges bg-light-success">
                    {formatDate(brk.date)}
                  </span>
                </td>
                <td>{brk.fromTime}</td>
                <td>{brk.toTime}</td>
                <td>
                  <span className="badges bg-light-info">
                    {formatDate(brk.createdDateTime)}
                  </span>
                </td>
                <td>
                  <div
                    className="d-flex justify-center items-center"
                    style={{ justifyContent: "center" }}
                  >
                    <button className="btn" onClick={() => handleEdit(brk)}>
                      <i className="text-primary fa fa-edit fa-lg" />
                    </button>
                    <button
                      className="btn"
                      data-toggle="modal"
                      data-target="#DeleteBreak"
                      onClick={() => setDeleteId(brk.id)}
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
            {Math.min(indexOfLastItem, filteredBreaks.length)} of{" "}
            {filteredBreaks.length} results
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
        id="addBreak"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addBreak"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg modal-center"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Break" : "New Break"}
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
              <div className="row">
                <div className="col-md-6">
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
                          minHeight: "42px",
                          height: "42px",
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
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>
                      Break Type: <span className="text-danger">*</span>
                    </label>
                    <select
                      name="breakType"
                      value={breakItem.breakType}
                      className="form-control"
                      onChange={handleChange}
                    >
                      <option value="Every Day">Every Day</option>
                      <option value="Single Day">Single Day</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group">
                    <label>
                      From Time: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="time"
                      name="fromTime"
                      value={breakItem.fromTime}
                      className="form-control"
                      onChange={handleChange}
                      step="1"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>
                      To Time: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="time"
                      name="toTime"
                      value={breakItem.toTime}
                      className="form-control"
                      onChange={handleChange}
                      step="1"
                    />
                  </div>
                </div>

                {breakItem.breakType === "Single Day" && (
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>
                        Date: <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={breakItem.date.toISOString().split("T")[0]}
                        onChange={handleDateChange}
                        className="form-control"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                )}
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
        id="DeleteBreak"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="DeleteBreak"
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
            <p>Are you sure want to delete this Break?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteBreak}
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

export default DoctorsBreaks;
