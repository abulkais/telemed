import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import * as XLSX from "xlsx";
import removeIcon from "../../assets/images/remove.png";
import Preloader from "../preloader";

const IpdPatients = () => {
  const [ipdPatients, setIpdPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchIpdPatients = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/ipd-patients");
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setIpdPatients(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching IPD patients:", error);
      toast.error("Failed to load IPD patients");
    }
  };

  useEffect(() => {
    fetchIpdPatients();
  }, []);

  const deleteIpdPatient = async () => {
    if (!deleteId) {
      toast.error("Invalid IPD Patient ID!");
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:8080/api/ipd-patients/${deleteId}`);
      setIpdPatients((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("IPD Patient deleted successfully!");
      $("#deleteIpdPatient").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting IPD patient!");
    } finally {
      setIsDeleting(false);
    }
  };



  const handleEdit = (ipd) => {
    navigate(`/ipd-patients/${ipd.id}/edit`);
  };

  const filterIpdPatients = (ipd) => {
    const matchesSearch = searchQuery
      ? ipd.ipdNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ipd.patient?.firstName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        ipd.patient?.lastName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        ipd.doctor?.firstName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        ipd.doctor?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesSearch;
  };

  const filteredIpdPatients = ipdPatients.filter(filterIpdPatients);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredIpdPatients.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredIpdPatients.length / itemsPerPage);

  const downloadExcel = () => {
    const dataToExport = filteredIpdPatients.map((ipd, index) => ({
      "S.N": index + 1,
      "IPD No": ipd.ipdNo,
      Patient: `${ipd.patient?.firstName} ${ipd.patient?.lastName}`,
      Doctor: `${ipd.doctor?.firstName} ${ipd.doctor?.lastName}`,
      "Admission Date": new Date(ipd.admissionDate).toLocaleString(),
      "Bed Type": ipd.bedType?.name || "N/A",
      Bed: ipd.bed?.name || "N/A",
      "ID Card Number": ipd.idCardNumber || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "IpdPatients");
    XLSX.writeFile(workbook, "IPD_Patients_List.xlsx");
  };

  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link to="/ipd-patients" className="doctor-nav-btn active">
            <span className="btn-text">IPD Patients</span>
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
            onClick={() => navigate("/ipd-patients/create")}
          >
            New IPD Patient
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>IPD No</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Admission Date</th>

              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((ipd) => (
                <tr key={ipd.id}>
                  <td>
                    <Link
                      to={`/ipd-patients/${ipd.id}/view`}
                      className="badges bg-light-success"
                    >
                      {ipd.ipdNo} <i className="fa fa-eye ml-1"></i>{" "}
                    </Link>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      {ipd.patient?.profileImage ? (
                        <img
                          src={ipd.patient.profileImage}
                          alt={`${ipd.patient.firstName} ${ipd.patient.lastName}`}
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
                          {ipd.patient?.firstName?.charAt(0)?.toUpperCase() ||
                            ""}
                          {ipd.patient?.lastName?.charAt(0)?.toUpperCase() ||
                            ""}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {ipd.patient?.firstName} {ipd.patient?.lastName}
                        </p>
                        <p className="mb-0">{ipd.patient?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      {ipd.doctor?.imgUrl ? (
                        <img
                          src={ipd.doctor.imgUrl}
                          alt={`${ipd.doctor.firstName} ${ipd.doctor.lastName}`}
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
                          {ipd.doctor?.firstName?.charAt(0)?.toUpperCase() ||
                            ""}
                          {ipd.doctor?.lastName?.charAt(0)?.toUpperCase() || ""}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {ipd.doctor?.firstName} {ipd.doctor?.lastName}
                        </p>
                        <p className="mb-0">{ipd.doctor?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badges bg-light-info">
                      {new Date(ipd.admissionDate).toLocaleString()}
                    </span>
                  </td>

                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                    
                      <button className="btn" onClick={() => handleEdit(ipd)}>
                        <i className="text-primary fa fa-edit fa-lg" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deleteIpdPatient"
                        onClick={() => setDeleteId(ipd.id)}
                      >
                        <DeleteIcon className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">
                  <Preloader />
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="d-flex justify-content-between align-items-center mt-5">
          <div>
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredIpdPatients.length)} of{" "}
            {filteredIpdPatients.length} results
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
        id="deleteIpdPatient"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteIpdPatient"
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
            <p>Are you sure you want to delete this IPD patient?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteIpdPatient}
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

export default IpdPatients;
