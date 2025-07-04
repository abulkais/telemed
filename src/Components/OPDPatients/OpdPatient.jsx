import React, { useState, useEffect } from "react";
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

const OpdPatients = () => {
  const [opdPatients, setOpdPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  const fetchOpdPatients = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/opd-patients");
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setOpdPatients(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching OPD patients:", error);
      toast.error("Failed to load OPD patients");
    }
  };

  useEffect(() => {
    fetchOpdPatients();
  }, []);

  const deleteOpdPatient = async () => {
    if (!deleteId) {
      toast.error("Invalid OPD Patient ID!");
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:8080/api/opd-patients/${deleteId}`);
      setOpdPatients((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("OPD Patient deleted successfully!");
      $("#deleteOpdPatient").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting OPD patient!");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (opd) => {
    navigate(`/opd-patients/${opd.id}/edit`);
  };

  const filterOpdPatients = (opd) => {
    const matchesSearch = searchQuery
      ? opd.opdNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opd.patient?.firstName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        opd.patient?.lastName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        opd.doctor?.firstName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        opd.doctor?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesSearch;
  };

  const filteredOpdPatients = opdPatients.filter(filterOpdPatients);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOpdPatients.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredOpdPatients.length / itemsPerPage);

  const downloadExcel = () => {
    const dataToExport = filteredOpdPatients.map((opd, index) => ({
      "S.N": index + 1,
      "OPD No": opd.opdNo,
      Patient: `${opd.patient?.firstName} ${opd.patient?.lastName}`,
      Doctor: `${opd.doctor?.firstName} ${opd.doctor?.lastName}`,
      "Visit Date": new Date(opd.visitDate).toLocaleString(),
      "Standard Charge": opd.standardCharge || "N/A",
      "Payment Mode": opd.paymentMode || "N/A",
      Symptoms: opd.symptoms || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "OpdPatients");
    XLSX.writeFile(workbook, "OPD_Patients_List.xlsx");
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
          <Link to="/opd-patients" className="doctor-nav-btn active">
            <span className="btn-text">OPD Patients</span>
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
          <button
            className="filter-btn filter-btn-primary mr-2 py-2_half"
            onClick={downloadExcel}
          >
            <i className="fa fa-file-excel-o fa-lg"></i>
          </button>
          <button
            className="filter-btn filter-btn-primary"
            onClick={() => navigate("/opd-patients/create")}
          >
            New OPD Patient
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>OPD No</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Appointment Date</th>
              <th>Standard Charge </th>
              <th>Payment Mode</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((opd) => (
                <tr key={opd.id}>
                  <td>
                    <Link
                      to={`/opd-patients/${opd.id}/view`}
                      className="badges bg-light-success"
                    >
                      {opd.opdNo} <i className="fa fa-eye ml-1"></i>
                    </Link>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      {opd.patient?.profileImage ? (
                        <img
                          src={opd.patient.profileImage}
                          alt={`${opd.patient.firstName} ${opd.patient.lastName}`}
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
                          {opd.patient?.firstName?.charAt(0)?.toUpperCase() ||
                            ""}
                          {opd.patient?.lastName?.charAt(0)?.toUpperCase() ||
                            ""}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {opd.patient?.firstName} {opd.patient?.lastName}
                        </p>
                        <p className="mb-0">{opd.patient?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      {opd.doctor?.imgUrl ? (
                        <img
                          src={opd.doctor.imgUrl}
                          alt={`${opd.doctor.firstName} ${opd.doctor.lastName}`}
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
                          {opd.doctor?.firstName?.charAt(0)?.toUpperCase() ||
                            ""}
                          {opd.doctor?.lastName?.charAt(0)?.toUpperCase() || ""}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {opd.doctor?.firstName} {opd.doctor?.lastName}
                        </p>
                        <p className="mb-0">{opd.doctor?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    
                    <span className="badges bg-light-info">
                      {formatTime(opd.visitDate)} <br />
                      {formatDate(opd.visitDate)}
                    </span>
                 
                  </td>

                  <td>
                    <span className="badges bg-light-success">
                      {opd.standardCharge}
                    </span>
                  </td>
                  <td>
                    <span className="badges bg-light-info">
                      {opd.paymentMode}
                    </span>
                  </td>
                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                      <button className="btn" onClick={() => handleEdit(opd)}>
                        <i className="text-primary fa fa-edit fa-lg" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deleteOpdPatient"
                        onClick={() => setDeleteId(opd.id)}
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

        <div className="d-flex justify-content-between align-items-center mt-5">
          <div>
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredOpdPatients.length)} of{" "}
            {filteredOpdPatients.length} results
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
        id="deleteOpdPatient"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteOpdPatient"
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
            <p>Are you sure you want to delete this OPD patient?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteOpdPatient}
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

export default OpdPatients;
