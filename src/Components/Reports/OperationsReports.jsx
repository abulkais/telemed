import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import DeleteIcon from "@mui/icons-material/Delete";
import Preloader from "../Preloader.jsx";
import "../../assets/Patients.css";
import Pagination from "../Pagination.jsx";

const OperationReports = () => {
  const [reports, setReports] = useState([]);
  const [cases, setCases] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [reportData, setReportData] = useState({
    id: null,
    caseId: null,
    doctorId: null,
    reportDate: new Date().toISOString().split("T")[0],
    description: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default to 10
  const [isDeleting, setIsDeleting] = useState(false);
  const baseurl = "http://localhost:8080";

  const fetchReports = async () => {
    try {
      const res = await axios.get(`${baseurl}/api/operationReports`);
      setReports(res.data);
    } catch (error) {
      console.error("Error fetching operation reports:", error);
      toast.error(
        "Failed to load operation reports: " +
        (error.response?.data?.error || error.message)
      );
    }
  };

  const fetchCases = async () => {
    try {
      const res = await axios.get(`${baseurl}/api/operationReports/caseIdWithPatients`);
      const caseOptions = res.data.map((item) => ({
        value: item.id,
        label: `${item.caseId}  ${item.patientName}`,
      }));
      setCases(caseOptions);
    } catch (error) {
      console.error("Error fetching cases with patients:", error);
      toast.error(
        "Failed to load cases with patients: " +
        (error.response?.data?.error || error.message)
      );
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${baseurl}/api/getDoctorsByStatus`);
      const doctorOptions = res.data.map((doctor) => ({
        value: doctor.id,
        label: `${doctor.firstName} ${doctor.lastName}`,
      }));
      setDoctors(doctorOptions);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error(
        "Failed to load doctors: " +
        (error.response?.data?.error || error.message)
      );
    }
  };

  useEffect(() => {
    fetchReports();
    fetchCases();
    fetchDoctors();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setReportData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : null,
    }));
  };

  const validateForm = () => {
    if (!reportData.caseId) {
      toast.error("Case ID with Patient Name is required");
      return false;
    }
    if (!reportData.doctorId) {
      toast.error("Doctor is required");
      return false;
    }
    if (!reportData.reportDate) {
      toast.error("Report Date is required");
      return false;
    }
    return true;
  };

  const handleCreateOrUpdateReport = async () => {
    if (!validateForm()) return;

    try {
      if (reportData.id) {
        // Update existing report
        await axios.put(`${baseurl}/api/operationReports/${reportData.id}`, {
          caseId: reportData.caseId,
          doctorId: reportData.doctorId,
          reportDate: reportData.reportDate,
          description: reportData.description,
        });
        toast.success("Operation report updated successfully");
      } else {
        // Create new report
        await axios.post(`${baseurl}/api/operationReports`, {
          caseId: reportData.caseId,
          doctorId: reportData.doctorId,
          reportDate: reportData.reportDate,
          description: reportData.description,
        });
        toast.success("Operation report created successfully");
      }
      fetchReports();
      $("#reportModal").modal("hide");
      resetForm();
    } catch (error) {
      console.error("Error saving report:", error);
      toast.error(
        error.response?.data?.error || "Failed to save operation report"
      );
    }
  };

  const handleEdit = (report) => {
    let formattedDate = new Date(report.reportDate);
    if (isNaN(formattedDate.getTime())) {
      // Fallback if date is invalid
      formattedDate = new Date(); // Current date and time in local timezone
    }
    // Format as yyyy-mm-ddThh:mm in local timezone
    const reportDate = new Date(
      formattedDate.getTime() - formattedDate.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16)
      .replace("Z", "");
    setReportData({
      id: report.id,
      caseId: report.caseId,
      doctorId: report.doctorId,
      reportDate: reportDate,
      description: report.description || "",
    });
    $("#reportModal").modal("show");
  };

  const handleDelete = async () => {
    if (!deleteId) {
      toast.error("Invalid Report ID!");
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`${baseurl}/api/operationReports/${deleteId}`);
      setReports((prev) => prev.filter((report) => report.id !== deleteId));
      toast.success("Operation report deleted successfully!");
      $("#deleteReport").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error.response?.data?.error || "Error deleting operation report!"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setReportData({
      id: null,
      caseId: null,
      doctorId: null,
      reportDate: new Date().toISOString().split("T")[0],
      description: "",
    });
  };

  const filteredReports = reports.filter((report) =>
    [
      report.patientCaseId?.toString(),
      report.patientName?.toLowerCase(),
      report.patientEmail?.toLowerCase(),
      report.doctorName?.toLowerCase(),
      report.doctorEmail?.toLowerCase(),
      report.description?.toLowerCase(),
      report.reportDate,
    ].some((field) => field?.includes(searchQuery.toLowerCase()))
  );


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReports.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

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
          <Link to="/investigation-reports" className="doctor-nav-btn ">
            <span className="btn-text">Investigation Reports</span>
          </Link>

          <Link to="/operation-reports" className="doctor-nav-btn active">
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
            placeholder="Search operation reports"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          className="filter-btn filter-btn-primary"
          data-toggle="modal"
          data-target="#reportModal"
          onClick={resetForm}
        >
          New Operation Report
        </button>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>S.N</th>
              <th>Case ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Report Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((report, index) => (
                <tr key={report.id}>
                  <td>{index + 1}</td>
                  <td>
                    <span className="badges bg-light-success">
                      {report.patientCaseId}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      {report.patientProfileImage ? (
                        <img
                          src={report.patientProfileImage}
                          alt={report.patientName || "Patient"}
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
                          {report.patientName?.charAt(0)?.toUpperCase() || "P"}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {report.patientName || "Unknown Patient"}
                        </p>
                        <p className="mb-0">{report.patientEmail || "N/A"}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      {report.doctorProfile ? (
                        <img
                          src={report.doctorProfile}
                          alt={report.doctorName || "Doctor"}
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
                          {report.doctorName?.charAt(0)?.toUpperCase() || "D"}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {report.doctorName || "Unknown Doctor"}
                        </p>
                        <p className="mb-0">{report.doctorEmail || "N/A"}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badges bg-light-info">
                      {formatTime(report.reportDate)} <br />
                      {formatDate(report.reportDate)}
                    </span>
                  </td>
                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                      <button
                        className="btn"
                        onClick={() => handleEdit(report)}
                        data-toggle="modal"
                        data-target="#reportModal"
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
                <td colSpan="7">
                  {reports.length === 0 ? <Preloader /> : "No reports found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Update Operation Report Modal */}
      <div
        className="modal fade"
        id="reportModal"
        tabIndex="-1"
        role="dialog"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-lg modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {reportData.id
                  ? "Update Operation Report"
                  : "Create Operation Report"}
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
              <div className="form-group">
                <label>
                  Patient: <span className="text-danger">*</span>
                </label>
                <Select
                  options={cases}
                  value={cases.find((c) => c.value === reportData.caseId)}
                  onChange={(option) => handleSelectChange("caseId", option)}
                  placeholder="Select a case and patient"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  Select Doctor: <span className="text-danger">*</span>
                </label>
                <Select
                  options={doctors}
                  value={doctors.find((d) => d.value === reportData.doctorId)}
                  onChange={(option) => handleSelectChange("doctorId", option)}
                  placeholder="Select a doctor"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  Report Date: <span className="text-danger">*</span>
                </label>
                <input
                  type="datetime-local"
                  className="form-control"
                  name="reportDate"
                  value={reportData.reportDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={reportData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description "
                  rows="4"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary px-3"
                data-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateOrUpdateReport}
              >
                {reportData.id ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
      />

      {/* Delete Confirmation Modal */}
      <div
        className="modal fade"
        id="deleteReport"
        tabIndex="-1"
        role="dialog"
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
                alt="Remove Icon"
              />
            </span>
            <h2>Delete</h2>
            <p>Are you sure you want to delete this operation report?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={handleDelete}
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

export default OperationReports;
