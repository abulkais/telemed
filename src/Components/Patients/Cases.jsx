import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import * as XLSX from "xlsx";
import removeIcon from "../../assets/images/remove.png";
import Preloader from "../preloader";
import moment from "moment";
import Pagination from "../Pagination";

const Cases = () => {
  const [cases, setCases] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Add pagination state
  const [itemsPerPage, setItemsPerPage] = useState(10); // Add pagination state
  const navigate = useNavigate();
  const filterRef = useRef(null);
  const baseUrl = "http://localhost:8080";

  const fetchCases = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/cases");
      const sortedData = res.data.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB - dateA;
      });
      setCases(sortedData);
    } catch (error) {
      console.error("Error fetching cases:", error);
      toast.error("Failed to load cases");
    }
  };

  useEffect(() => {
    fetchCases();
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

  const deleteCase = async () => {
    if (!deleteId) {
      toast.error("Invalid Case ID!");
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:8080/api/cases/${deleteId}`);
      setCases((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Case deleted successfully!");
      $("#deleteCase").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting case!");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (caseItem) => {
    navigate(`/cases/${caseItem.id}/edit`);
  };

  const handleStatusToggle = async (caseItem) => {
    const updatedStatus = !caseItem.status;
    try {
      await axios.put(
        `http://localhost:8080/api/cases/${caseItem.id}`,
        {
          ...caseItem,
          caseDate: moment(caseItem.caseDate).format("YYYY-MM-DD"), // Format caseDate
          status: updatedStatus ? "1" : "0",
          created_at: moment(caseItem.created_at).format("YYYY-MM-DD HH:mm:ss"),
          updated_at: moment().format("YYYY-MM-DD HH:mm:ss"), // Use current time
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setCases((prev) =>
        prev.map((item) =>
          item.id === caseItem.id ? { ...item, status: updatedStatus } : item
        )
      );
      toast.success("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };
  const filterCases = (caseItem) => {
    const matchesSearch = searchQuery
      ? `${caseItem.patientFirstName} ${caseItem.patientLastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        `${caseItem.doctorFirstName} ${caseItem.doctorLastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        caseItem.patientEmail
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        caseItem.doctorEmail
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        caseItem.caseId.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && caseItem.status) ||
      (statusFilter === "INACTIVE" && !caseItem.status);

    return matchesSearch && matchesStatus;
  };

  const filteredCases = cases.filter(filterCases);

  // Add pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCases.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const resetFilters = () => {
    setStatusFilter("ALL");
    setSearchQuery("");
    setShowFilter(false);
    setCurrentPage(1); // Reset to first page when filters are reset
  };

  const toggleFilterDropdown = () => {
    setShowFilter(!showFilter);
  };

  const downloadExcel = () => {
    const dataToExport = filteredCases.map((caseItem, index) => ({
      "S.N": index + 1,
      "Case ID": caseItem.caseId,
      Patient: `${caseItem.patientFirstName} ${caseItem.patientLastName}`,
      "Patient Email": caseItem.patientEmail,
      Doctor: `${caseItem.doctorFirstName} ${caseItem.doctorLastName}`,
      "Doctor Email": caseItem.doctorEmail,
      "Case Date": moment(caseItem.caseDate).format("Do MMM, YYYY h:mm A"),
      Status: caseItem.status ? "Active" : "Inactive",
      Fee: caseItem.fees,
      Description: caseItem.description || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cases");
    XLSX.writeFile(workbook, "Cases_List.xlsx");
  };

  const formatDate = (date) => {
    return moment(date).format("Do MMM, YYYY");
  };

  const getTimeAgo = (date) => {
    return moment(date).fromNow();
  };

  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link to="/patients" className="doctor-nav-btn">
            <span className="btn-text">Patients</span>
          </Link>
          <Link to="/cases" className="doctor-nav-btn active">
            <span className="btn-text">Cases</span>
          </Link>
          <Link to="/case-handlers" className="doctor-nav-btn">
            <span className="btn-text">Case Handlers</span>
          </Link>
          <Link to="/patient-admissions" className="doctor-nav-btn">
            <span className="btn-text">Patient Admissions</span>
          </Link>
        </div>
      </div>
      <div
        className="filter-bar-container"
        
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
            onClick={() => navigate("/cases/create")}
          >
            New Case
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover">
          <thead className="thead-light">
            <tr>
              <th>Case ID</th>
              <th>Patients</th>
              <th>Doctors</th>
              <th>Case Date</th>
              <th>Fees</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((caseItem) => (
                <tr key={caseItem.id}>
                  <td>
                    <span
                      className="badges bg-light-success"
                      data-toggle="modal"
                      data-target="#caseDetailsModal"
                      onClick={() => setSelectedCase(caseItem)}
                    >
                      {caseItem.caseId} <i className="fa fa-eye ml-1"></i>
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      {caseItem.profileImage ? (
                        <img
                          src={`${baseUrl}${caseItem.profileImage}`}
                          alt={`${caseItem.patientFirstName} ${caseItem.patientLastName}`}
                          className="rounded-circle-profile"
                        />
                      ) : (
                        <div className="rounded-circle-bgColor text-white d-flex align-items-center justify-content-center">
                          {caseItem.patientFirstName
                            ?.charAt(0)
                            ?.toUpperCase() || ""}
                          {caseItem.patientLastName?.charAt(0)?.toUpperCase() ||
                            ""}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {caseItem.patientFirstName} {caseItem.patientLastName}
                        </p>
                        <p className="mb-0 text-muted">
                          {caseItem.patientEmail}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      {caseItem.doctorProfile ? (
                        <img
                          src={`${baseUrl}${caseItem.doctorProfile}`}
                          alt={`${caseItem.doctorFirstName} ${caseItem.doctorLastName}`}
                          className="rounded-circle-profile"
                        />
                      ) : (
                        <div className="rounded-circle-bgColor text-white d-flex align-items-center justify-content-center">
                          {caseItem.doctorFirstName?.charAt(0)?.toUpperCase() ||
                            ""}
                          {caseItem.doctorLastName?.charAt(0)?.toUpperCase() ||
                            ""}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {caseItem.doctorFirstName} {caseItem.doctorLastName}
                        </p>
                        <p className="mb-0 text-muted">
                          {caseItem.doctorEmail}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badges bg-light-info">
                      {formatDate(caseItem.caseDate)}
                    </span>
                  </td>
                  <td>${parseFloat(caseItem.fees).toFixed(2)}</td>
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={caseItem.status}
                        onChange={() => handleStatusToggle(caseItem)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </td>
                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                      <button
                        className="btn"
                        onClick={() => handleEdit(caseItem)}
                      >
                        <i className="fa fa-edit fa-lg text-primary" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deleteCase"
                        onClick={() => setDeleteId(caseItem.id)}
                      >
                        <i className="fa fa-trash fa-lg text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">
                  <Preloader />
                </td>
              </tr>
            )}
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
        className="modal fade"
        id="deleteCase"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteCase"
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
            <p>Are you sure you want to delete this case?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteCase}
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

      <div
        className="modal fade"
        id="caseDetailsModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="caseDetailsModalLabel"
        aria-hidden="true"
      >
        <div
          className="modal-dialog  modal-lg modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="caseDetailsModalLabel">
                Case Details
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              {selectedCase && (
                <div className="row">
                  <div className="col-lg-6">
                    <label for="case_id" class="fs-5 text-gray-600">
                      Case ID:
                    </label>
                    <p className="fs-5 text-gray-800 showSpan">
                      {selectedCase.caseId}
                    </p>
                  </div>
                  <div className="col-lg-6">
                    <label for="Patient" class="fs-5 text-gray-600">
                      Patient:
                    </label>
                    <p className="fs-5 text-gray-800 showSpan">
                      {selectedCase.patientFirstName}
                      {selectedCase.patientLastName}
                    </p>
                  </div>

                  <div className="col-lg-6">
                    <label for="Phone" class="fs-5 text-gray-600">
                      Phone:
                    </label>
                    <p className="fs-5 text-gray-800 showSpan">
                      {selectedCase.phoneNumber}
                    </p>
                  </div>

                  <div className="col-lg-6">
                    <label for="Doctor" class="fs-5 text-gray-600">
                      Doctor:
                    </label>
                    <p className="fs-5 text-gray-800 showSpan">
                      {selectedCase.doctorFirstName}{" "}
                      {selectedCase.doctorLastName}
                    </p>
                  </div>
                  <div className="col-lg-6">
                    <label for="Case_Date" class="fs-5 text-gray-600">
                      Case Date:
                    </label>
                    <p className="fs-5 text-gray-800 showSpan">
                      {formatDate(selectedCase.caseDate)}
                    </p>
                  </div>

                  <div className="col-lg-6">
                    <label for="fee" class="fs-5 text-gray-600">
                      Fees:
                    </label>
                    <p className="fs-5 text-gray-800 showSpan">
                      {parseFloat(selectedCase.fees).toFixed(2)}
                    </p>
                  </div>

                  <div className="col-lg-6">
                    <label for="Created_On" class="fs-5 text-gray-600">
                      Created On:
                    </label>
                    <p className="fs-5 text-gray-800 showSpan">
                      {getTimeAgo(selectedCase.created_at)}
                    </p>
                  </div>

                  <div className="col-lg-6">
                    <label for="Created_On" class="fs-5 text-gray-600">
                      Last Updated:
                    </label>
                    <p className="fs-5 text-gray-800 showSpan">
                      {getTimeAgo(selectedCase.updated_at)}
                    </p>
                  </div>

                  <div className="col-lg-6">
                    <label for="Status" class="fs-5 text-gray-600">
                      Status:
                    </label>
                    <p className="fs-5 text-gray-800 showSpan">
                      <span
                        className={`badge ${
                          selectedCase.status
                            ? "bg-light-success"
                            : "bg-light-danger"
                        }`}
                      >
                        {selectedCase.status ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>
                  <div className="col-lg-6">
                    <label for="Description" class="fs-5 text-gray-600">
                      Description:
                    </label>
                    <p className="fs-5 text-gray-800 showSpan">
                      {selectedCase.description || "N/A"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cases;
