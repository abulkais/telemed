import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import * as XLSX from "xlsx";
import removeIcon from "../../assets/images/remove.png";
import Preloader from "../preloader";

const PatientAdmissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();
  const filterRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAdmissions = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/patient-admissions"
      );
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setAdmissions(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching admissions:", error);
      toast.error("Failed to load admissions");
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

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

  const deleteAdmission = async () => {
    if (!deleteId) {
      toast.error("Invalid Admission ID!");
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(
        `http://localhost:8080/api/patient-admissions/${deleteId}`
      );
      setAdmissions((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Admission deleted successfully!");
      $("#deleteAdmission").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting admission!");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = (admission) => {
    navigate(`/patient-admissions/${admission.id}/view`);
  };

  const handleEdit = (admission) => {
    navigate(`/patient-admissions/${admission.id}/edit`);
  };

  const filterAdmissions = (admission) => {
    const matchesSearch = searchQuery
      ? admission.admissionID
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        admission.patient?.firstName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        admission.patient?.lastName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        admission.doctor?.firstName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        admission.doctor?.lastName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && admission.status) ||
      (statusFilter === "INACTIVE" && !admission.status);

    return matchesSearch && matchesStatus;
  };

  const filteredAdmissions = admissions.filter(filterAdmissions);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAdmissions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredAdmissions.length / itemsPerPage);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setStatusFilter("ALL");
    setSearchQuery("");
    setCurrentPage(1);
    setShowFilter(false);
  };

  const toggleFilterDropdown = () => {
    setShowFilter(!showFilter);
  };

  const downloadExcel = () => {
    const dataToExport = filteredAdmissions.map((admission, index) => ({
      "S.N": index + 1,
      "Admission ID": admission.admissionID,
      Patient: `${admission.patient?.firstName} ${admission.patient?.lastName}`,
      Doctor: `${admission.doctor?.firstName} ${admission.doctor?.lastName}`,
      "Admission Date": admission.admissionDate,
      "Discharge Date": admission.dischargeDate || "N/A",
      Package: admission.package?.packageName || "N/A",
      Insurance: admission.insurance?.insuranceName || "N/A",
      "Policy No": admission.policyNo || "N/A",
      Status: admission.status ? "Active" : "Inactive",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PatientAdmissions");
    XLSX.writeFile(workbook, "Patient_Admissions_List.xlsx");
  };

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
          <Link to="/patients" className="doctor-nav-btn">
            <span className="btn-text">Patients</span>
          </Link>
          <Link to="/cases" className="doctor-nav-btn">
            <span className="btn-text">Cases</span>
          </Link>
          <Link to="/case-handlers" className="doctor-nav-btn">
            <span className="btn-text">Case Handlers</span>
          </Link>
          <Link to="/patient-admissions" className="doctor-nav-btn active">
            <span className="btn-text">Patient Admissions</span>
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
            placeholder="Search"
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
              className="filter-btn filter-btn-icon mr-3 py-2_half"
              onClick={toggleFilterDropdown}
            >
              <i className="fa fa-filter fa-lg" />
            </button>
            {showFilter && (
              <div className="dropdown-content">
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
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
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
            className="filter-btn filter-btn-primary mr-2 py-2_half"
            onClick={downloadExcel}
          >
            <i className="fa fa-file-excel-o fa-lg"></i>
          </button>
          <button
            className="filter-btn filter-btn-primary"
            onClick={() => navigate("/patient-admissions/create")}
          >
            New Patient Admission
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>Admission ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Admission Date</th>
              <th>Discharge Date</th>
              <th>Package</th>
              <th>Insurance</th>
              <th>Policy No</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((admission) => (
                <tr key={admission.id}>
                  <td>
                    {" "}
                    <span
                      className="badges bg-light-success"
                      style={{ cursor: "pointer" }}
                    >
                      {" "}
                      <strong onClick={() => handleView(admission)}>
                        {" "}
                        {admission.admissionID}{" "}
                        <i className="fa fa-eye ml-1"></i>{" "}
                      </strong>{" "}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      {admission.patient?.profileImage ? (
                        <img
                          src={admission.patient.profileImage}
                          alt={`${admission.patient.firstName} ${admission.patient.lastName}`}
                          className="rounded-circle"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            marginRight: "10px",
                          }}
                        />
                      ) : (
                        <div
                          className="rounded-circle text-white d-flex align-items-center justify-content-center"
                          style={{
                            width: "50px",
                            height: "50px",
                            backgroundColor: "#1976d2",
                            marginRight: "10px",
                            fontSize: "20px",
                          }}
                        >
                          {admission.patient?.firstName
                            ?.charAt(0)
                            ?.toUpperCase() || ""}
                          {admission.patient?.lastName
                            ?.charAt(0)
                            ?.toUpperCase() || ""}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {admission.patient?.firstName}{" "}
                          {admission.patient?.lastName}
                        </p>
                        <p className="mb-0">{admission.patient?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      {admission.doctor?.imgUrl ? (
                        <img
                          src={admission.doctor.imgUrl}
                          alt={`${admission.doctor.firstName} ${admission.doctor.lastName}`}
                          className="rounded-circle"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            marginRight: "10px",
                          }}
                        />
                      ) : (
                        <div
                          className="rounded-circle text-white d-flex align-items-center justify-content-center"
                          style={{
                            width: "50px",
                            height: "50px",
                            backgroundColor: "#1976d2",
                            marginRight: "10px",
                            fontSize: "20px",
                          }}
                        >
                          {admission.doctor?.firstName
                            ?.charAt(0)
                            ?.toUpperCase() || ""}
                          {admission.doctor?.lastName
                            ?.charAt(0)
                            ?.toUpperCase() || ""}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {admission.doctor?.firstName}{" "}
                          {admission.doctor?.lastName}
                        </p>
                        <p className="mb-0">{admission.doctor?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badges bg-light-success">
                      {formatTime(admission.admissionDate)}
                      <br />
                      {formatDate(admission.admissionDate)}
                    </span>
                  </td>
                  <td>
                    {admission.dischargeDate
                      ? new Date(admission.dischargeDate).toLocaleString()
                      : "N/A"}
                  </td>
                  <td>{admission.package?.packageName || "N/A"}</td>
                  <td>{admission.insurance?.insuranceName || "N/A"}</td>
                  <td>{admission.policyNo || "N/A"}</td>
                  <td>
                    <span
                      className={`badge ${
                        admission.status
                          ? "bg-light-success"
                          : "bg-light-danger"
                      }`}
                    >
                      {admission.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                      <button
                        className="btn"
                        onClick={() => handleEdit(admission)}
                      >
                        <i className="text-primary fa fa-edit fa-lg" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deleteAdmission"
                        onClick={() => setDeleteId(admission.id)}
                      >
                        <DeleteIcon className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10">
                  <Preloader />
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="d-flex justify-content-between align-items-center mt-5">
          <div>
            Showing {indexOfLastItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredAdmissions.length)} of{" "}
            {filteredAdmissions.length} results
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
        className="modal fade"
        id="deleteAdmission"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteAdmission"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-sm modal-dialog-centered"
          role="document"
        >
          <div className="modal-content text-center">
            <span className="modal-icon">
              <img src={removeIcon} alt="Remove Icon" />
            </span>
            <h2>Delete</h2>
            <p>Are you sure you want to delete this admission?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteAdmission}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="d-flex align-items-center justify-content-center">
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <span className="ml-2">Wait</span>
                  </div>
                ) : (
                  <span>Yes, Delete</span>
                )}
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

export default PatientAdmissions;
