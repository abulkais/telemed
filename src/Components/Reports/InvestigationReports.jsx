import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import DeleteIcon from "@mui/icons-material/Delete";

import * as XLSX from "xlsx";
import removeIcon from "../../assets/images/remove.png";
import Preloader from "../preloader";
import Pagination from "../Pagination";

const InvestigationReports = () => {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();
  const filterRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default to 10
  const [isDeleting, setIsDeleting] = useState(false);
  const baseUrl = "http://localhost:8080";

  const fetchReports = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/investigation-reports"
      );
      setReports(res.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    }
  };

  useEffect(() => {
    fetchReports();
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

  const deleteReport = async () => {
    if (!deleteId) {
      toast.error("Invalid Report ID!");
      return;
    }

    setIsDeleting(true);

    try {
      await axios.delete(
        `http://localhost:8080/api/investigation-reports/${deleteId}`
      );
      setReports((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Investigation report deleted successfully!");
      $("#deleteReport").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting report!");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (report) => {
    navigate(`/investigation-reports/${report.id}/edit`);
  };

  const filterReports = (report) => {
    const matchesSearch = searchQuery
      ? report.title?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "SOLVED" && report.status) ||
      (statusFilter === "NOT_SOLVED" && !report.status);

    return matchesSearch && matchesStatus;
  };

  const filteredReports = reports.filter(filterReports);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

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
    const dataToExport = filteredReports.map((report, index) => ({
      "S.N": index + 1,
      Title: report.title,
      Patient: `${report.patientFirstName} ${report.patientLastName}`,
      Doctor: `${report.doctorFirstName} ${report.doctorLastName}`,
      Date: new Date(report.date).toLocaleString(),
      Status: report.status ? "Solved" : "Not Solved",
      Attachment: report.attachment || "N/A",
      Created_At: new Date(report.created_at).toLocaleString(),
      Updated_At: new Date(report.updated_at).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "InvestigationReports");
    XLSX.writeFile(workbook, "Investigation_Reports_List.xlsx");
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
          <Link to="/birth-reports" className="doctor-nav-btn">
            <span className="btn-text">Birth Reports</span>
          </Link>
          <Link to="/death-reports" className="doctor-nav-btn">
            <span className="btn-text">Death Reports</span>
          </Link>
          <Link to="/investigation-reports" className="doctor-nav-btn active">
            <span className="btn-text">Investigation Reports</span>
          </Link>
          <Link to="/operation-reports" className="doctor-nav-btn">
            <span className="btn-text">Operation Reports</span>
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
            placeholder="Search by Title"
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
                    <option value="SOLVED">Solved</option>
                    <option value="NOT_SOLVED">Not Solved</option>
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
            onClick={() => navigate("/investigation-reports/create")}
          >
            New Investigation Report
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>Users</th>
              <th>Date</th>
              <th>Title</th>
              <th>Status</th>
              <th>Attachment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((report) => (
                <tr key={report.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      {report.patientProfile ? (
                        <img
                          src={`${baseUrl}${report.patientProfile}`}
                          alt={`${report.patientFirstName} ${report.patientLastName}`}
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
                          {report.patientFirstName?.charAt(0)?.toUpperCase() ||
                            ""}
                          {report.patientLastName?.charAt(0)?.toUpperCase() ||
                            ""}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {report.patientFirstName} {report.patientLastName}
                        </p>
                        <p className="mb-0">{report.patientEmail || "N/A"}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badges bg-light-info">
                      {formatTime(report.date)} <br />
                      {formatDate(report.date)}
                    </span>
                  </td>
                  <td>{report.title}</td>
                  <td>
                    <span
                      className={`badges ${report.status ? "bg-light-success" : "bg-light-danger"
                        }`}
                    >
                      {report.status ? "Solved" : "Not Solved"}
                    </span>
                  </td>
                  <td>
                    {report.attachment ? (
                      <a
                        href={report.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="badges bg-light-info"
                      >
                        Download
                      </a>
                    ) : (
                      <span className="badges bg-light-danger">N/A</span>
                    )}
                  </td>
                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                      <button
                        className="btn"
                        onClick={() => handleEdit(report)}
                      >
                        <i className="text-primary fa fa-edit fa-lg" />
                      </button>

                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deleteReport"
                        onClick={() => setDeleteId(report.id)}
                      >
                        <DeleteIcon className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">
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
        id="deleteReport"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteReport"
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
            <p>Are you sure you want to delete this investigation report?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteReport}
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

export default InvestigationReports;
