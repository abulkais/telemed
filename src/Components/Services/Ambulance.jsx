import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
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
import Switch from "@mui/material/Switch";
import Select from "react-select";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

const Ambulance = () => {
  const [ambulances, setAmbulances] = useState([]);
  const [excelLoading, setExcelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [ambulance, setAmbulance] = useState({
    vehicleNumber: "",
    vehicleModel: "",
    yearMade: "",
    driverName: "",
    driverContact: "",
    driverLicense: "",
    note: "",
    vehicleType: "Contractual",
    isAvailable: true,
  });
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    start: null,
    end: null,
  });
  const [filter, setFilter] = useState("Ambulance");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const vehicleTypeOptions = [
    { value: "Contractual", label: "Contractual" },
    { value: "Owned", label: "Owned" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAmbulance((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (e) => {
    setAmbulance((prev) => ({
      ...prev,
      isAvailable: e.target.checked,
    }));
  };

  const handleVehicleTypeChange = (selectedOption) => {
    setAmbulance((prev) => ({
      ...prev,
      vehicleType: selectedOption.value,
    }));
  };

  const handleContactChange = (value) => {
    setAmbulance((prev) => ({
      ...prev,
      driverContact: value,
    }));
  };

  const validateForm = () => {
    if (!ambulance.vehicleNumber) {
      toast.error("Vehicle Number is required");
      return false;
    }

    if (!ambulance.vehicleModel) {
      toast.error("Vehicle Model is required");
      return false;
    }

    if (!ambulance.yearMade || isNaN(ambulance.yearMade)) {
      toast.error("Year Made must be a valid number");
      return false;
    }

    if (!ambulance.driverName) {
      toast.error("Driver Name is required");
      return false;
    }

    if (!ambulance.driverLicense) {
      toast.error("Driver License is required");
      return false;
    }

    if (!ambulance.driverContact) {
      toast.error("Driver Contact is required");
      return false;
    }

    // Check for duplicate vehicle number
    const isDuplicate = ambulances.some(
      (item) =>
        item.vehicleNumber.toLowerCase() ===
          ambulance.vehicleNumber.toLowerCase() &&
        (!editing || item.id !== editId)
    );

    if (isDuplicate) {
      toast.error("The name has already been taken.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    if (!validateForm()) return;

    const newId = String(ambulances.length + 1).padStart(2, "0");
    const ambulanceId = String(ambulances.length + 1).padStart(2, "0");

    const newAmbulance = {
      ...ambulance,
      id: newId,
      ambulanceId: ambulanceId,
      createdDateTime: currentDate,
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/ambulances/${editId}`,
          newAmbulance
        );
        toast.success("Ambulance Updated Successfully");
      } else {
        await axios.post(`http://localhost:8080/api/ambulances`, newAmbulance);
        toast.success("Ambulance Added Successfully");
      }
      fetchAmbulances();
      resetForm();
      $("#addAmbulance").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving Ambulance");
    }
  };

  const resetForm = () => {
    setAmbulance({
      vehicleNumber: "",
      vehicleModel: "",
      yearMade: "",
      driverName: "",
      driverContact: "",
      driverLicense: "",
      note: "",
      vehicleType: "Contractual",
      isAvailable: true,
    });
    setEditing(false);
    setEditId(null);
  };

  const fetchAmbulances = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/ambulances`);
      const sortedData = res.data.sort(
        (a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime)
      );
      setAmbulances(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching Ambulances:", error);
      toast.error("Failed to load Ambulances");
    }
  };

  const deleteAmbulance = async () => {
    if (!deleteId) {
      toast.error("Invalid Ambulance ID!");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/ambulances/${deleteId}`);
      setAmbulances((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Ambulance deleted successfully!");
      $("#deleteAmbulance").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Ambulance!");
    }
  };

  const handleEdit = (item) => {
    setEditing(true);
    setEditId(item.id);
    setAmbulance({
      vehicleNumber: item.vehicleNumber,
      vehicleModel: item.vehicleModel,
      yearMade: item.yearMade,
      driverName: item.driverName,
      driverContact: item.driverContact,
      driverLicense: item.driverLicense,
      note: item.note,
      vehicleType: item.vehicleType,
      isAvailable: item.isAvailable,
    });
    $("#addAmbulance").modal("show");
  };

  const downloadCSV = () => {
    setExcelLoading(true);

    let dataToExport;
    let fileName;

    if (dateFilter.start && !dateFilter.end) {
      dataToExport = ambulances.filter((doc) => {
        const docDate = new Date(doc.createdDateTime);
        const filterDate = new Date(dateFilter.start);

        return (
          docDate.getDate() === filterDate.getDate() &&
          docDate.getMonth() === filterDate.getMonth() &&
          docDate.getFullYear() === filterDate.getFullYear()
        );
      });
      fileName = `Ambulances_${new Date(dateFilter.start)
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else if (dateFilter.start || dateFilter.end || searchQuery) {
      dataToExport = ambulances.filter(filterByDate).filter(filterBySearch);
      fileName = `Ambulances_Filtered_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else {
      dataToExport = ambulances;
      fileName = `Ambulances_All_Data_${new Date()
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
        "Vehicle Number": "Vehicle Number",
        "Vehicle Model": "Vehicle Model",
        "Year Made": "Year Made",
        "Driver Name": "Driver Name",
        "Driver License": "Driver License",
        "Driver Contact": "Driver Contact",
        "Vehicle Type": "Vehicle Type",
        "Is Available": "Is Available",
        Note: "Note",
        "Date & Time": "Date & Time",
      },
      ...dataToExport.map((item) => ({
        "Vehicle Number": item.vehicleNumber,
        "Vehicle Model": item.vehicleModel,
        "Year Made": item.yearMade,
        "Driver Name": item.driverName,
        "Driver License": item.driverLicense,
        "Driver Contact": item.driverContact,
        "Vehicle Type": item.vehicleType,
        "Is Available": item.isAvailable ? "Yes" : "No",
        Note: item.note,
        "Date & Time": formatDate(item.createdDateTime),
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ambulances_Report");
    XLSX.writeFile(workbook, fileName);
    setExcelLoading(false);
    toast.success(`Report downloaded (${dataToExport.length} records)`);
  };

  const filterByDate = (doc) => {
    if (!dateFilter.start && !dateFilter.end) return true;

    const docDate = new Date(doc.createdDateTime);
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
      (doc.vehicleNumber &&
        doc.vehicleNumber.toLowerCase().includes(searchLower)) ||
      (doc.vehicleModel &&
        doc.vehicleModel.toLowerCase().includes(searchLower)) ||
      (doc.driverName && doc.driverName.toLowerCase().includes(searchLower)) ||
      (doc.driverLicense &&
        doc.driverLicense.toLowerCase().includes(searchLower)) ||
      (doc.driverContact &&
        doc.driverContact.toLowerCase().includes(searchLower)) ||
      (doc.vehicleType &&
        doc.vehicleType.toLowerCase().includes(searchLower)) ||
      (doc.note && doc.note.toLowerCase().includes(searchLower))
    );
  };

  const filteredAmbulances = ambulances
    .filter(filterByDate)
    .filter(filterBySearch);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAmbulances.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredAmbulances.length / itemsPerPage);

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
    fetchAmbulances();
  }, []);

  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link
            to="/insurances"
            className={`doctor-nav-btn ${
              filter === "Insurances" ? "active" : ""
            }`}
            onClick={() => setFilter("Insurances")}
          >
            <span className="btn-text">Insurances</span>
          </Link>
          <Link
            to="/packages"
            className={`doctor-nav-btn ${
              filter === "Packages" ? "active" : ""
            }`}
            onClick={() => setFilter("Packages")}
          >
            <span className="btn-text">Packages</span>
          </Link>

         
          <Link
            to="/services"
            className={`doctor-nav-btn ${
              filter === "Services" ? "active" : ""
            }`}
            onClick={() => setFilter("Services")}
          >
            <span className="btn-text">Services</span>
          </Link>

          <Link
            to="/ambulances"
            className={`doctor-nav-btn ${
              filter === "Ambulance" ? "active" : ""
            }`}
            onClick={() => setFilter("Ambulance")}
          >
            <span className="btn-text">Ambulance</span>
          </Link>

          <Link
            to="/ambulance-calls"
            className={`doctor-nav-btn ${
              filter === "AmbulanceCalls" ? "active" : ""
            }`}
            onClick={() => setFilter("AmbulanceCalls")}
          >
            <span className="btn-text">AmbulanceCalls</span>
          </Link>
        </div>
      </div>
      <div className="filter-bar-container">
        <div className="filter-search-box">
          <input
            type="text"
            className="form-control"
            placeholder="Search Ambulances"
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
            data-target="#addAmbulance"
            onClick={resetForm}
          >
            New Ambulance
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
              <th>Vehicle Number</th>
              <th>Vehicle Model</th>
              <th>Year Made</th>
              <th>Driver Name</th>
              <th>Driver License</th>
              <th>Driver Contact</th>
              <th>Vehicle Type</th>
              <th>Is Available</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>
                  <span className="badges bg-light-success">
                    {item.vehicleNumber}
                  </span>
                </td>
                <td> {item.vehicleModel}</td>
                <td><span className="badges bg-light-info">{item.yearMade}</span></td>
                <td>{item.driverName}</td>
                <td>{item.driverLicense}</td>
                <td>{item.driverContact}</td>
                <td>
                  <span
                    className={`badge ${
                      item.vehicleType === "Owned"
                        ? "bg-light-success"
                        : "bg-light-info"
                    }`}
                  >
                    {item.vehicleType}
                  </span>
                </td>
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
                      data-target="#deleteAmbulance"
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

        {/* Pagination controls */}
        <div className="d-flex justify-content-between align-items-center mt-5">
          <div>
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredAmbulances.length)} of{" "}
            {filteredAmbulances.length} results
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

      {/* Add/Edit Ambulance Modal */}
      <div
        className="modal fade document_modal"
        id="addAmbulance"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addAmbulance"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-center" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Ambulance" : "New Ambulance"}
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
              <div className="row">
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Vehicle Number: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="vehicleNumber"
                      placeholder="Enter vehicle number"
                      value={ambulance.vehicleNumber}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>

               

                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Driver Name: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="driverName"
                      placeholder="Enter driver name"
                      value={ambulance.driverName}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Vehicle Model: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="vehicleModel"
                      placeholder="Enter vehicle model"
                      value={ambulance.vehicleModel}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Year Made: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="yearMade"
                      placeholder="Enter year made"
                      value={ambulance.yearMade}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Driver License: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="driverLicense"
                      placeholder="Enter driver license"
                      value={ambulance.driverLicense}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Driver Contact: <span className="text-danger">*</span>
                    </label>
                    <PhoneInput
                      international
                      defaultCountry="IN"
                      value={ambulance.driverContact}
                      onChange={handleContactChange}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Vehicle Type: <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={vehicleTypeOptions}
                      value={vehicleTypeOptions.find(
                        (opt) => opt.value === ambulance.vehicleType
                      )}
                      onChange={handleVehicleTypeChange}
                      className="basic-single"
                      classNamePrefix="select"
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="form-group">
                    <label>Is Available:</label>
                    <div className="d-flex align-items-center">
                      <Switch
                        checked={ambulance.isAvailable}
                        onChange={handleStatusChange}
                        color="primary"
                        inputProps={{ "aria-label": "availability status" }}
                      />
                      <span className="ml-2">
                        {ambulance.isAvailable ? "Available" : "Not Available"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-lg-12">
                  <div className="form-group">
                    <label>Note:</label>
                    <textarea
                      name="note"
                      placeholder="Enter any notes"
                      value={ambulance.note}
                      className="form-control"
                      onChange={handleChange}
                      rows="2"
                    />
                  </div>
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

      {/* Delete Confirmation Modal */}
      <div
        className="modal fade"
        id="deleteAmbulance"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteAmbulance"
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
            <p>Are you sure want to delete this Ambulance?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteAmbulance}
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

export default Ambulance;
