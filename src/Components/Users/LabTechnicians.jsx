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

const LabTechnicians = () => {
  const [labTechnicians, setLabTechnicians] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();
  const filterRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLabTechnicians = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/lab-technicians");
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setLabTechnicians(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching lab technicians:", error);
      toast.error("Failed to load lab technicians");
    }
  };

  useEffect(() => {
    fetchLabTechnicians();
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

  const deleteLabTechnician = async () => {
    if (!deleteId) {
      toast.error("Invalid Lab Technician ID!");
      return;
    }

    setIsDeleting(true);

    try {
      await axios.delete(
        `http://localhost:8080/api/lab-technicians/${deleteId}`
      );
      setLabTechnicians((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Lab Technician deleted successfully!");
      $("#deleteLabTechnician").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting lab technician!");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = (technician) => {
    navigate(`/lab-technicians/${technician.id}/view`);
  };

  const handleEdit = (technician) => {
    navigate(`/lab-technicians/${technician.id}/edit`);
  };

  const filterLabTechnicians = (technician) => {
    const matchesSearch = searchQuery
      ? technician.firstName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        technician.lastName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        technician.email?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && technician.status === "Active") ||
      (statusFilter === "INACTIVE" && technician.status === "Inactive");

    return matchesSearch && matchesStatus;
  };

  const filteredLabTechnicians = labTechnicians.filter(filterLabTechnicians);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLabTechnicians.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredLabTechnicians.length / itemsPerPage);

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
    const dataToExport = filteredLabTechnicians.map((technician, index) => ({
      "S.N": index + 1,
      "First Name": technician.firstName,
      "Last Name": technician.lastName,
      Email: technician.email,
      Phone: `${technician.phoneCountryCode || "+62"} ${
        technician.phoneNumber
      }`,
      "Blood Group": technician.bloodGroup,
      Designation: technician.designation,
      Qualification: technician.qualification,
      "Date Of Birth": technician.dateOfBirth,
      Gender: technician.gender,
      Status: technician.status,
      Address1: technician.address1,
      Address2: technician.address2,
      City: technician.city,
      Zipcode: technician.zipcode,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LabTechnicians");
    XLSX.writeFile(workbook, "LabTechnicians_List.xlsx");
  };

  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
      <div className="nav_headings">
          <Link to="/admin" className="doctor-nav-btn">
            <span className="btn-text">Admin</span>
          </Link>
          <Link to="/nurses" className="doctor-nav-btn ">
            <span className="btn-text">Nurses</span>
          </Link>
          <Link to="/pharmacists" className="doctor-nav-btn">
            <span className="btn-text">Pharmacists</span>
          </Link>
          <Link to="/accountants" className="doctor-nav-btn">
            <span className="btn-text">Accountants</span>
          </Link>
          <Link to="/lab-technicians" className="doctor-nav-btn active">
            <span className="btn-text">Lab Technicians</span>
          </Link>
          <Link to="/receptionists" className="doctor-nav-btn">
            <span className="btn-text">Receptionists</span>
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
            onClick={() => navigate("/lab-technicians/create")}
          >
            New Lab Technician
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>S.N</th>
              <th>Lab Technicians</th>
              <th>Phone</th>
              <th>Designation</th>

              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((technician, index) => (
                <tr key={technician.id}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      {technician.profileImage ? (
                        <img
                          src={technician.profileImage}
                          alt={`${technician.firstName} ${technician.lastName}`}
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
                          {technician.firstName?.charAt(0)?.toUpperCase() || ""}
                          {technician.lastName?.charAt(0)?.toUpperCase() || ""}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {technician.firstName} {technician.lastName}
                        </p>
                        <p className="mb-0">{technician.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{`${technician.phoneCountryCode || "+62"} ${
                    technician.phoneNumber
                  }`}</td>
                  <td>{technician.designation || "N/A"}</td>

                  <td>
                    <span
                      className={`badge ${
                        technician.status === "Active"
                          ? "bg-light-success"
                          : "bg-light-danger"
                      }`}
                    >
                      {technician.status}
                    </span>
                  </td>
                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                      <button
                        className="btn"
                        onClick={() => handleView(technician)}
                      >
                        <VisibilityIcon className="text-info" />
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleEdit(technician)}
                      >
                        <i className="text-primary fa fa-edit fa-lg" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deleteLabTechnician"
                        onClick={() => setDeleteId(technician.id)}
                      >
                        <DeleteIcon className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">
                  <Preloader />
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="d-flex justify-content-between align-items-center mt-5">
          <div>
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredLabTechnicians.length)} of{" "}
            {filteredLabTechnicians.length} results
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
        id="deleteLabTechnician"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteLabTechnician"
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
            <p>Are you sure you want to delete this lab technician?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteLabTechnician}
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

export default LabTechnicians;
