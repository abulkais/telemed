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
import Preloader from "../Preloader.jsx";

const DiagnosisTests = () => {
  const [diagnosisTests, setDiagnosisTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();

  const [filter, setFilter] = useState("DiagnosisTests");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isDeleting, setIsDeleting] = useState(false);
  const baseUrl = "http://localhost:8080";
  const fetchDiagnosisTests = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/diagnosis-tests");
      setDiagnosisTests(res.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching diagnosis tests:", error);
      toast.error("Failed to load diagnosis tests");
    }
  };

  useEffect(() => {
    fetchDiagnosisTests();
  }, []);

  const deleteDiagnosisTest = async () => {
    if (!deleteId) {
      toast.error("Invalid Diagnosis Test ID!");
      return;
    }

    setIsDeleting(true);

    try {
      await axios.delete(
        `http://localhost:8080/api/diagnosis-tests/${deleteId}`
      );
      setDiagnosisTests((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Diagnosis test deleted successfully!");
      $("#deleteDiagnosisTest").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting diagnosis test!");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (diagnosisTest) => {
    navigate(`/diagnosis-tests/${diagnosisTest.id}/edit`);
  };

  const filterDiagnosisTests = (diagnosisTest) => {
    const matchesSearch = searchQuery
      ? `${diagnosisTest.patientFirstName} ${diagnosisTest.patientLastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        `${diagnosisTest.doctorFirstName} ${diagnosisTest.doctorLastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        diagnosisTest.reportNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      : true;

    return matchesSearch;
  };

  const filteredDiagnosisTests = diagnosisTests.filter(filterDiagnosisTests);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDiagnosisTests.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredDiagnosisTests.length / itemsPerPage);

  const downloadExcel = () => {
    const dataToExport = filteredDiagnosisTests.map((diagnosisTest, index) => {
      const properties = diagnosisTest.properties.reduce((acc, prop, idx) => {
        acc[`Property ${idx + 1} Name`] = prop.propertyName;
        acc[`Property ${idx + 1} Value`] = prop.propertyValue;
        return acc;
      }, {});

      return {
        "S.N": index + 1,
        Patient: `${diagnosisTest.patientFirstName} ${diagnosisTest.patientLastName}`,
        Doctor: `${diagnosisTest.doctorFirstName} ${diagnosisTest.doctorLastName}`,
        "Diagnosis Category": diagnosisTest.diagnosisCategoryName,
        "Report Number": diagnosisTest.reportNumber,
        Age: diagnosisTest.age || "N/A",
        Height: diagnosisTest.height || "N/A",
        Weight: diagnosisTest.weight || "N/A",
        "Average Glucose": diagnosisTest.averageGlucose || "N/A",
        "Fasting Blood Sugar": diagnosisTest.fastingBloodSugar || "N/A",
        "Urine Sugar": diagnosisTest.urineSugar || "N/A",
        "Blood Pressure": diagnosisTest.bloodPressure || "N/A",
        Diabetes: diagnosisTest.diabetes || "N/A",
        Cholesterol: diagnosisTest.cholesterol || "N/A",
        Created_At: new Date(diagnosisTest.created_at).toLocaleString(),
        Updated_At: new Date(diagnosisTest.updated_at).toLocaleString(),
        ...properties,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DiagnosisTests");
    XLSX.writeFile(workbook, "Diagnosis_Tests_List.xlsx");
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
          <Link
            to="/diagnosis-categories"
            className={`doctor-nav-btn ${
              filter === "DiagnosisCategory" ? "active" : ""
            }`}
            onClick={() => setFilter("DiagnosisCategory")}
          >
            <span className="btn-text">Diagnosis Category</span>
          </Link>
          <Link
            to="/diagnosis-tests"
            className={`doctor-nav-btn ${
              filter === "DiagnosisTests" ? "active" : ""
            }`}
            onClick={() => setFilter("DiagnosisTests")}
          >
            <span className="btn-text">Diagnosis Tests</span>
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
            onClick={() => navigate("/diagnosis-tests/create")}
          >
            New Diagnosis Test
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>Report Number</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Diagnosis Category</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {diagnosisTests.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <Preloader />
                </td>
              </tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((diagnosisTest) => (
                <tr key={diagnosisTest.id}>
                  <td>
                  
                      <Link
                        to={`/diagnosis-tests/${diagnosisTest.id}/details`}
                        state={{ diagnosisTest }}
                       className="badges bg-light-success"
                        style={{ textDecoration: "none",fontSize:"11px" }}
                      >
                        {diagnosisTest.reportNumber} <i className="fa fa-eye ml-1"></i>
                      </Link>
                   
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      {diagnosisTest.profileImage ? (
                        <img
                          src={`${baseUrl}${diagnosisTest.profileImage}`}
                          alt={`${diagnosisTest.patientFirstName} ${diagnosisTest.patientLastName}`}
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
                          {diagnosisTest.patientFirstName
                            ?.charAt(0)
                            ?.toUpperCase() || ""}
                          {diagnosisTest.patientLastName
                            ?.charAt(0)
                            ?.toUpperCase() || ""}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {diagnosisTest.patientFirstName}{" "}
                          {diagnosisTest.patientLastName}
                        </p>
                        <p className="mb-0">{diagnosisTest.patientEmail}</p>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="d-flex align-items-center">
                      {diagnosisTest.doctorProfileImage ? (
                        <img
                          src={`${baseUrl}${diagnosisTest.doctorProfileImage}`}
                          alt={`${diagnosisTest.doctorFirstName} ${diagnosisTest.doctorLastName}`}
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
                          {diagnosisTest.doctorFirstName
                            ?.charAt(0)
                            ?.toUpperCase() || ""}
                          {diagnosisTest.doctorLastName
                            ?.charAt(0)
                            ?.toUpperCase() || ""}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {diagnosisTest.doctorFirstName}{" "}
                          {diagnosisTest.doctorLastName}
                        </p>
                        <p className="mb-0">{diagnosisTest.doctorEmail}</p>
                      </div>
                    </div>
                  </td>

                  <td>{diagnosisTest.diagnosisCategoryName}</td>

                  <td>
                    <span className="badges bg-light-success">
                      {formatTime(diagnosisTest.created_at)} <br />
                      {formatDate(diagnosisTest.created_at)}
                    </span>
                  </td>
                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                      <button
                        className="btn"
                        onClick={() => {
                          // Store the diagnosisTest data in sessionStorage to pass it to the new tab
                          sessionStorage.setItem(
                            "diagnosisTest",
                            JSON.stringify(diagnosisTest)
                          );
                          // Open the PDF viewer route in a new tab
                          window.open(
                            `/diagnosis-tests/${diagnosisTest.id}/pdf`,
                            "_blank"
                          );
                        }}
                      >
                        <i
                          className="fa fa-print fa-lg"
                          style={{ color: "rgb(255 184 33)" }}
                        />
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleEdit(diagnosisTest)}
                      >
                        <i className="text-primary fa fa-edit fa-lg" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deleteDiagnosisTest"
                        onClick={() => setDeleteId(diagnosisTest.id)}
                      >
                        <DeleteIcon className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  Data not found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="d-flex justify-content-between align-items-center mt-5">
          <div>
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredDiagnosisTests.length)} of{" "}
            {filteredDiagnosisTests.length} results
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
        id="deleteDiagnosisTest"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteDiagnosisTest"
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
            <p>Are you sure you want to delete this diagnosis test?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteDiagnosisTest}
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

export default DiagnosisTests;
