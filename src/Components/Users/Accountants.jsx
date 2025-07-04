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

const Accountants = () => {
  const [accountants, setAccountants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();
  const filterRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAccountants = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/accountants");
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setAccountants(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching accountants:", error);
      toast.error("Failed to load accountants");
    }
  };

  useEffect(() => {
    fetchAccountants();
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

  const deleteAccountant = async () => {
    if (!deleteId) {
      toast.error("Invalid Accountant ID!");
      return;
    }

    setIsDeleting(true);

    try {
      await axios.delete(`http://localhost:8080/api/accountants/${deleteId}`);
      setAccountants((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Accountant deleted successfully!");
      $("#deleteAccountant").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting accountant!");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = (accountant) => {
    navigate(`/accountants/${accountant.id}/view`);
  };

  const handleEdit = (accountant) => {
    navigate(`/accountants/${accountant.id}/edit`);
  };

  const filterAccountants = (accountant) => {
    const matchesSearch = searchQuery
      ? accountant.firstName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        accountant.lastName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        accountant.email?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && accountant.status === "Active") ||
      (statusFilter === "INACTIVE" && accountant.status === "Inactive");

    return matchesSearch && matchesStatus;
  };

  const filteredAccountants = accountants.filter(filterAccountants);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAccountants.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredAccountants.length / itemsPerPage);

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
    const dataToExport = filteredAccountants.map((accountant, index) => ({
      "S.N": index + 1,
      "First Name": accountant.firstName,
      "Last Name": accountant.lastName,
      Email: accountant.email,
      Phone: `${accountant.phoneCountryCode || "+62"} ${
        accountant.phoneNumber
      }`,
      "Blood Group": accountant.bloodGroups,
      Designation: accountant.designation,
      Qualification: accountant.qualification,
      "Date Of Birth": accountant.dateOfBirth,
      Gender: accountant.gender,
      Status: accountant.status,
      Address1: accountant.address1,
      Address2: accountant.address2,
      City: accountant.city,
      Zipcode: accountant.zipcode,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Accountants");
    XLSX.writeFile(workbook, "Accountants_List.xlsx");
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
          <Link to="/accountants" className="doctor-nav-btn active">
            <span className="btn-text">Accountants</span>
          </Link>

          <Link to="/lab-technicians" className="doctor-nav-btn">
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
            onClick={() => navigate("/accountants/create")}
          >
            New Accountant
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>S.N</th>
              <th>Accountants</th>
              <th>Phone</th>
              <th>Designation</th>

              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((accountant, index) => (
                <tr key={accountant.id}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      {accountant.profileImage ? (
                        <img
                          src={accountant.profileImage}
                          alt={`${accountant.firstName} ${accountant.lastName}`}
                          className="rounded-circle-profile"
                        
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
                          {accountant.firstName?.charAt(0)?.toUpperCase() || ""}
                          {accountant.lastName?.charAt(0)?.toUpperCase() || ""}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {accountant.firstName} {accountant.lastName}
                        </p>
                        <p className="mb-0">{accountant.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{`${accountant.phoneCountryCode || "+62"} ${
                    accountant.phoneNumber
                  }`}</td>
                  <td>{accountant.designation}</td>
                  <td>
                    <span
                      className={`badge ${
                        accountant.status === "Active"
                          ? "bg-light-success"
                          : "bg-light-danger"
                      }`}
                    >
                      {accountant.status}
                    </span>
                  </td>
                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                      <button
                        className="btn"
                        onClick={() => handleView(accountant)}
                      >
                        <VisibilityIcon className="text-info" />
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleEdit(accountant)}
                      >
                        <i className="text-primary fa fa-edit fa-lg" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deleteAccountant"
                        onClick={() => setDeleteId(accountant.id)}
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
            {Math.min(indexOfLastItem, filteredAccountants.length)} of{" "}
            {filteredAccountants.length} results
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
        id="deleteAccountant"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteAccountant"
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
            <p>Are you sure you want to delete this accountant?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteAccountant}
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

export default Accountants;
