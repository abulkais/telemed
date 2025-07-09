import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

import * as XLSX from "xlsx";
import removeIcon from "../../assets/images/remove.png";
import Preloader from "../preloader";
import Pagination from "../Pagination";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();
  const filterRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPatients = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/patients");
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setPatients(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    }
  };

  useEffect(() => {
    fetchPatients();
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

  const deletePatient = async () => {
    if (!deleteId) {
      toast.error("Invalid Patient ID!");
      return;
    }

    setIsDeleting(true); // Start loading

    try {
      await axios.delete(`http://localhost:8080/api/patients/${deleteId}`);
      setPatients((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Patient deleted successfully!");
      $("#deletePatient").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting patient!");
    } finally {
      setIsDeleting(false); // End loading
    }
  };

  const handleView = (patient) => {
    navigate(`/patients/${patient.id}/view`);
  };

  const handleEdit = (patient) => {
    navigate(`/patients/${patient.id}/edit`);
  };

  const filterPatients = (patient) => {
    const matchesSearch = searchQuery
      ? patient.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && patient.status) ||
      (statusFilter === "INACTIVE" && !patient.status);

    return matchesSearch && matchesStatus;
  };

  const filteredPatients = patients.filter(filterPatients);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPatients.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

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
    const dataToExport = filteredPatients.map((patient, index) => ({
      "S.N": index + 1,
      "First Name": patient.firstName,
      "Last Name": patient.lastName,
      Email: patient.email,
      Phone: `${patient.phoneCountryCode || "+91"} ${patient.phoneNumber}`,
      Gender: patient.gender,
      Status: patient.status ? "Active" : "Inactive",
      "Blood Group": patient.bloodGroup,
      UHID: patient.uhid,
      "Date Of Birth": patient.dateOfBirth,
      "Address 1": patient.address1,
      "Address 2": patient.address2,
      City: patient.city,
      Zipcode: patient.zipcode,
      "Facebook URL": patient.facebookUrl,
      "Twitter URL": patient.twitterUrl,
      "Instagram URL": patient.instagramUrl,
      "LinkedIn URL": patient.linkedinUrl,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Patients");
    XLSX.writeFile(workbook, "Patients_List.xlsx");
  };

  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link to="/patients" className="doctor-nav-btn active">
            <span className="btn-text">Patients</span>
          </Link>
          <Link to="/cases" className="doctor-nav-btn">
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
            className="filter-btn filter-btn-primary "
            onClick={() => navigate("/patients/create")}
          >
            New Patient
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>S.N</th>
              <th>Patients</th>
              <th>Phone</th>
              <th>Gender</th>

              <th>Blood Group</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((patient, index) => (
                <tr key={patient.id}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      {patient.profileImage ? (
                        <img
                          src={patient.profileImage}
                          alt={`${patient.firstName} ${patient.lastName}`}
                          className="rounded-circle-profile"
                        />
                      ) : (
                        <div className="rounded-circle-bgColor text-white d-flex align-items-center justify-content-center">
                          {patient.firstName?.charAt(0)?.toUpperCase() || ""}
                          {patient.lastName?.charAt(0)?.toUpperCase() || ""}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="mb-0">{patient.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{`${patient.phoneCountryCode || "+91"} ${
                    patient.phoneNumber
                  }`}</td>
                  <td>{patient.gender}</td>

                  <td>{patient.bloodGroup || "N/A"}</td>
                  <td>
                    <span
                      className={`badge ${
                        patient.status ? "bg-light-success" : "bg-light-danger"
                      }`}
                    >
                      {patient.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                      <button
                        className="btn"
                        onClick={() => handleView(patient)}
                      >
                        <VisibilityIcon className="text-info" />
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleEdit(patient)}
                      >
                        <i className="text-primary fa fa-edit fa-lg" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deletePatient"
                        onClick={() => setDeleteId(patient.id)}
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
        id="deletePatient"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deletePatient"
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
            <p>Are you sure you want to delete this patient?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deletePatient}
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

export default Patients;
