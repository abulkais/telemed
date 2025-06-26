import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const AmbulanceCalls = () => {
  const [ambulanceCalls, setAmbulanceCalls] = useState([]);
  const [patients, setPatients] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ambulanceCall, setAmbulanceCall] = useState({
    patientId: "",
    ambulanceId: "",
    date: new Date(),
    amount: "",
    note: "",
  });
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("AmbulanceCalls");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchAmbulanceCalls();
    fetchPatients();
    fetchAmbulances();
  }, []);

  const fetchAmbulanceCalls = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/ambulanceCalls`);
      const sortedData = res.data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setAmbulanceCalls(sortedData);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Failed to load Ambulance Calls");
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/getPatientsbyStatus`);
      setPatients(res.data);
    } catch (error) {
      toast.error("Failed to load Patients");
    }
  };

  const fetchAmbulances = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/getAmbulancesByStatus`);
      setAmbulances(res.data);
    } catch (error) {
      toast.error("Failed to load Ambulances");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAmbulanceCall((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setAmbulanceCall((prev) => ({
      ...prev,
      date: date,
    }));
  };

  const handlePatientSelect = (patientId) => {
    setAmbulanceCall((prev) => ({
      ...prev,
      patientId: patientId,
    }));
  };

  const handleAmbulanceSelect = (ambulanceId) => {
    const id = parseInt(ambulanceId);
    const selectedAmbulance = ambulances.find((a) => a.id === id);
    setAmbulanceCall((prev) => ({
      ...prev,
      ambulanceId: ambulanceId,
      driverName: selectedAmbulance ? selectedAmbulance.driverName : "",
    }));
  };

  const validateForm = () => {
    if (!ambulanceCall.patientId) {
      toast.error("Patient is required");
      return false;
    }

    if (!ambulanceCall.ambulanceId) {
      toast.error("Vehicle Model is required");
      return false;
    }

    if (!ambulanceCall.date) {
      toast.error("Date is required");
      return false;
    }

    if (!ambulanceCall.amount || isNaN(ambulanceCall.amount)) {
      toast.error("Amount must be a valid number");
      return false;
    }
    const selectedDate = ambulanceCall.date.toISOString().split("T")[0];
    const isDuplicate = ambulanceCalls.some((call) => {
      const callDate = new Date(call.date).toISOString().split("T")[0];
      return (
        call.patientId === ambulanceCall.patientId &&
        call.ambulanceId === ambulanceCall.ambulanceId &&
        callDate === selectedDate &&
        (!editing || call.id !== editId) // Skip current record when editing
      );
    });

    if (isDuplicate) {
      toast.error(
        "This patient already has an ambulance call for the selected vehicle on this date"
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const selectedPatient = patients.find(
      (p) => p.id === parseInt(ambulanceCall.patientId)
    );
    const selectedAmbulance = ambulances.find(
      (a) => a.id === parseInt(ambulanceCall.ambulanceId)
    );
    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    const newAmbulanceCall = {
      ...ambulanceCall,
      id: editing ? editId : String(ambulanceCalls.length + 1).padStart(2, "0"),
      patientName: selectedPatient ? selectedPatient.name : "",
      patientEmail: selectedPatient ? selectedPatient.email : "",
      patientsProfileImg: selectedPatient ? selectedPatient.profileImage : "",
      vehicleModel: selectedAmbulance ? selectedAmbulance.vehicleModel : "",
      driverName: selectedAmbulance ? selectedAmbulance.driverName : "",
      date: currentDate,
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/ambulanceCalls/${editId}`,
          newAmbulanceCall
        );
        toast.success("Ambulance Call Updated Successfully");
      } else {
        await axios.post(
          `http://localhost:8080/api/ambulanceCalls`,
          newAmbulanceCall
        );
        toast.success("Ambulance Call Added Successfully");
      }
      fetchAmbulanceCalls();
      resetForm();
      $("#addAmbulanceCall").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving Ambulance Call");
    }
  };

  const resetForm = () => {
    setAmbulanceCall({
      patientId: "",
      ambulanceId: "",
      date: new Date(),
      amount: "",
      note: "",
      driverName: "",
    });
    setEditing(false);
    setEditId(null);
  };

  const deleteAmbulanceCall = async () => {
    if (!deleteId) {
      toast.error("Invalid Ambulance Call ID!");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8080/api/ambulanceCalls/${deleteId}`
      );
      setAmbulanceCalls((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Ambulance Call deleted successfully!");
      $("#deleteAmbulanceCall").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Ambulance Call!");
    }
  };

  const handleEdit = (item) => {
    setEditing(true);
    setEditId(item.id);
    setAmbulanceCall({
      patientId: item.patientId,
      ambulanceId: item.ambulanceId,
      date: new Date(item.date),
      amount: item.amount,
      note: item.note,
      driverName: item.driverName,
    });
    $("#addAmbulanceCall").modal("show");
  };

  const filterBySearch = (call) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      (call.patientName &&
        call.patientName.toLowerCase().includes(searchLower)) ||
      (call.vehicleModel &&
        call.vehicleModel.toLowerCase().includes(searchLower)) ||
      (call.driverName &&
        call.driverName.toLowerCase().includes(searchLower)) ||
      (call.amount && call.amount.toString().includes(searchQuery)) ||
      (call.patientEmail &&
        call.patientEmail.toLowerCase().includes(searchLower))
    );
  };

  const filteredAmbulanceCalls = ambulanceCalls.filter(filterBySearch);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAmbulanceCalls.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredAmbulanceCalls.length / itemsPerPage);

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
            <span className="btn-text">Ambulance Calls</span>
          </Link>
        </div>
      </div>
      <div className="filter-bar-container">
        <div className="filter-search-box">
          <input
            type="text"
            className="form-control"
            placeholder="Search Ambulance Calls"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <button
            className="filter-btn filter-btn-primary"
            data-toggle="modal"
            data-target="#addAmbulanceCall"
            onClick={resetForm}
          >
            New Ambulance Call
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>S.N</th>
              <th>Patient</th>
              <th>Vehicle Model</th>
              <th>Driver Name</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>
                  <div className="d-flex align-items-center ml-5">
                    {item.profileImage ? (
                      <img
                        src={item.profileImage}
                        alt="Profile"
                        className="rounded-circle"
                        style={{
                          width: "50px",
                          height: "50px",
                          marginRight: "10px",
                        }}
                      />
                    ) : (
                      <div className="rounded-circle text-white d-flex align-items-center justify-content-center document_round_circle">
                        {item.patientName
                          ?.split(" ")
                          .map((word) => word.charAt(0))
                          .join("")
                          .toUpperCase()}
                      </div>
                    )}
                    <div className="flex-wrap">
                      <p className="mb-0" style={{ textAlign: "start" }}>
                        {item.patientName}
                      </p>
                      <p className="mb-0">{item.patientEmail}</p>
                    </div>
                  </div>
                </td>
                <td>{item.vehicleModel}</td>
                <td>{item.driverName}</td>
                <td>
                  <span className="badges bg-light-success">
                    {formatDate(item.date)}
                  </span>{" "}
                </td>
                <td>₹{item.amount}</td>
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
                      data-target="#deleteAmbulanceCall"
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
            {Math.min(indexOfLastItem, filteredAmbulanceCalls.length)} of{" "}
            {filteredAmbulanceCalls.length} results
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

      {/* Add/Edit Ambulance Call Modal */}
      <div
        className="modal fade document_modal"
        id="addAmbulanceCall"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addAmbulanceCall"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-center" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Ambulance Call" : "New Ambulance Call"}
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
                      Patient: <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-control"
                      value={ambulanceCall.patientId}
                      onChange={(e) => handlePatientSelect(e.target.value)}
                    >
                      <option value="">Select Patient</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Vehicle Model: <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-control"
                      value={ambulanceCall.ambulanceId}
                      onChange={(e) => handleAmbulanceSelect(e.target.value)}
                    >
                      <option value="">Select Vehicle Model</option>
                      {ambulances.map((ambulance) => (
                        <option key={ambulance.id} value={ambulance.id}>
                          {ambulance.vehicleModel}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="form-group">
                    <label>
                      Driver Name: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={ambulanceCall.driverName}
                      readOnly
                    />
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="form-group">
                    <label>
                      Date: <span className="text-danger">*</span>
                    </label>{" "}
                    <br />
                    <DatePicker
                      selected={ambulanceCall.date}
                      onChange={handleDateChange}
                      className="form-control w-100"
                      dateFormat="MMM d, yyyy"
                    />
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="form-group">
                    <label>
                      Amount (₹): <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="amount"
                      placeholder="Enter amount"
                      value={ambulanceCall.amount}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col-lg-12">
                  <div className="form-group">
                    <label>Note:</label>
                    <textarea
                      name="note"
                      placeholder="Enter any notes"
                      value={ambulanceCall.note}
                      className="form-control"
                      onChange={handleChange}
                      rows="2"
                    />
                  </div>
                </div>
              </div>
              <div className="d-flex align-center justify-center mt-4">
                <button className="btn btn-primary mr-3 px-3" onClick={handleSubmit}>
                  {editing ? "Update" : "Save"}
                </button>
                <button
                  className="btn btn-secondary px-3"
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
        id="deleteAmbulanceCall"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteAmbulanceCall"
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
            <p>Are you sure want to delete this Ambulance Call?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteAmbulanceCall}
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

export default AmbulanceCalls;
