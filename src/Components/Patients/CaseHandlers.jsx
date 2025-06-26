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
import CommonNav from "../CommonNav";

const CaseHandlers = () => {
  const [caseHandlers, setCaseHandlers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();
  const filterRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCaseHandlers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/case-handlers");
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setCaseHandlers(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching case handlers:", error);
      toast.error("Failed to load case handlers");
    }
  };

  useEffect(() => {
    fetchCaseHandlers();
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

  const deleteCaseHandler = async () => {
    if (!deleteId) {
      toast.error("Invalid Case Handler ID!");
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:8080/api/case-handlers/${deleteId}`);
      setCaseHandlers((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Case handler deleted successfully!");
      $("#deleteCaseHandler").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting case handler!");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = (handler) => {
    navigate(`/case-handlers/${handler.id}/view`);
  };

  const handleEdit = (handler) => {
    navigate(`/case-handlers/${handler.id}/edit`);
  };

  const filterCaseHandlers = (handler) => {
    const matchesSearch = searchQuery
      ? handler.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        handler.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        handler.email?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && handler.status) ||
      (statusFilter === "INACTIVE" && !handler.status);

    return matchesSearch && matchesStatus;
  };

  const filteredCaseHandlers = caseHandlers.filter(filterCaseHandlers);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCaseHandlers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredCaseHandlers.length / itemsPerPage);

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
    const dataToExport = filteredCaseHandlers.map((handler, index) => ({
      "S.N": index + 1,
      "First Name": handler.firstName,
      "Last Name": handler.lastName,
      Email: handler.email,
      Designation: handler.designation,
      Phone: `${handler.phoneCountryCode || "+62"} ${handler.phoneNumber}`,
      Gender: handler.gender,
      Status: handler.status ? "Active" : "Inactive",
      "Blood Group": handler.bloodGroup,
      Qualification: handler.qualification,
      "Date Of Birth": handler.dateOfBirth,
      "Address 1": handler.address1,
      "Address 2": handler.address2,
      City: handler.city,
      Zipcode: handler.zipcode,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CaseHandlers");
    XLSX.writeFile(workbook, "CaseHandlers_List.xlsx");
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
          <Link to="/case-handlers" className="doctor-nav-btn active">
            <span className="btn-text">Case Handlers</span>
          </Link>
          <Link to="/patient-admissions" className="doctor-nav-btn ">
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
            placeholder="Search by Name or Email"
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
            onClick={() => navigate("/case-handlers/create")}
          >
            New Case Handler
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>S.N</th>
              <th>Case Handlers</th>
              <th>Designation</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>Status</th>
              <th>Blood Group</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((handler, index) => (
                <tr key={handler.id}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      {handler.profileImage ? (
                        <img
                          src={handler.profileImage}
                          alt={`${handler.firstName} ${handler.lastName}`}
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
                          {handler.firstName?.charAt(0)?.toUpperCase() || ""}
                          {handler.lastName?.charAt(0)?.toUpperCase() || ""}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {handler.firstName} {handler.lastName}
                        </p>
                        <p className="mb-0">{handler.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{handler.designation || "N/A"}</td>
                  <td>{`${handler.phoneCountryCode || "+62"} ${
                    handler.phoneNumber
                  }`}</td>
                  <td>{handler.gender}</td>
                  <td>
                    <span
                      className={`badge ${
                        handler.status ? "bg-light-success" : "bg-light-danger"
                      }`}
                    >
                      {handler.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{handler.bloodGroup || "N/A"}</td>
                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                      <button
                        className="btn"
                        onClick={() => handleView(handler)}
                      >
                        <VisibilityIcon className="text-info" />
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleEdit(handler)}
                      >
                        <i className="text-primary fa fa-edit fa-lg" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deleteCaseHandler"
                        onClick={() => setDeleteId(handler.id)}
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
            {Math.min(indexOfLastItem, filteredCaseHandlers.length)} of{" "}
            {filteredCaseHandlers.length} results
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
        id="deleteCaseHandler"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteCaseHandler"
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
            <p>Are you sure you want to delete this case handler?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteCaseHandler}
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

export default CaseHandlers;
