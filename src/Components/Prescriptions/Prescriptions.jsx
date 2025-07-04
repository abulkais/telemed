import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteIcon from "@mui/icons-material/Delete";

import deleteImage from "../../assets/images/remove.png";
import Pagination from "../Pagination";

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);
  const baseUrl = "http://localhost:8080";
  const navigate = useNavigate();
  const filterRef = useRef(null);
  const [showFilter, setShowFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");




  const fetchPrescriptions = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/prescriptions");
      setPrescriptions(res.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      toast.error("Failed to load prescriptions");
    }
  };

  const deletePrescription = async () => {
    if (!deleteId) {
      toast.error("Invalid Prescription ID!");
      return;
    }
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:8080/api/prescriptions/${deleteId}`);
      setPrescriptions((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Prescription deleted successfully!");
      $("#deletePrescription").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting prescription!");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (prescription) => {
    navigate(`/prescriptions/${prescription.id}/edit`);
  };

  const handleView = (prescription) => {
    navigate(`/prescriptions/${prescription.id}/view`);
  };


  const toggleFilterDropdown = () => setShowFilter(!showFilter);
  const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);
  const resetFilters = () => {
    setStatusFilter("ALL");
    setSearchQuery("");
  };
  useEffect(() => {
    fetchPrescriptions();
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


  const filterPrescriptions = (prescription) => {
    const matchesSearch = searchQuery
      ? `${prescription.patientFirstName} ${prescription.patientLastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      `${prescription.doctorFirstName} ${prescription.doctorLastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && prescription.status === "1") ||
      (statusFilter === "INACTIVE" && prescription.status !== "1");
    return matchesSearch && matchesStatus;
    // return matchesSearch;
  };

  const filteredPrescriptions = prescriptions.filter(filterPrescriptions);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPrescriptions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);

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
          <Link to="/prescriptions" className="doctor-nav-btn active">
            <span className="btn-text">Prescriptions</span>
          </Link>
        </div>
      </div>
      <div className="filter-bar-container">
        <div className="filter-search-box">
          <input
            type="text"
            className="form-control"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>


        <div className="d-flex mr-2">
          <div
            className="filter-options"
            style={{ position: "relative" }}
            ref={filterRef} // Assuming filterRef is defined elsewhere or add useRef
          >
            <button
              className="filter-btn filter-btn-icon mr-3 py-2_half"
              onClick={toggleFilterDropdown} // Assuming toggleFilterDropdown is defined
            >
              <i className="fa fa-filter fa-lg" />
            </button>
            {showFilter && ( // Assuming showFilter and filterRef are managed in state
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
                    value={statusFilter} // Assuming statusFilter is in state
                    onChange={handleStatusFilterChange} // Assuming handleStatusFilterChange is defined
                    style={{ padding: "5px", fontSize: "14px" }}
                  >
                    <option value="ALL">ALL</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <button
                  className="btn btn-secondary w-100 mt-2"
                  onClick={resetFilters} // Assuming resetFilters is defined
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
            className="filter-btn filter-btn-primary"
            onClick={() => window.open("/prescriptions/create")}
          >
            New Prescription
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Added At</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((prescription) => (
                <tr key={prescription.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      {prescription.profileImage ? (
                        <img
                          src={`${baseUrl}${prescription.profileImage}`}
                          alt={`${prescription.patientFirstName} ${prescription.patientLastName}`}
                          className="rounded-circle-profile"
                        />
                      ) : (
                        <div className="rounded-circle-bgColor text-white d-flex align-items-center justify-content-center">
                          {prescription.patientFirstName
                            .charAt(0)
                            .toUpperCase()}
                          {prescription.patientLastName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {prescription.patientFirstName}{" "}
                          {prescription.patientLastName}
                        </p>
                        <p className="mb-0">{prescription.patientEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      {prescription.imgUrl ? (
                        <img
                          src={`${baseUrl}${prescription.imgUrl}`}
                          alt={`${prescription.doctorFirstName} ${prescription.doctorLastName}`}
                          className="rounded-circle-profile"
                        />
                      ) : (
                        <div className="rounded-circle-bgColor text-white d-flex align-items-center justify-content-center">
                          {prescription.doctorFirstName.charAt(0).toUpperCase()}
                          {prescription.doctorLastName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {prescription.doctorFirstName}{" "}
                          {prescription.doctorLastName}
                        </p>
                        <p className="mb-0">{prescription.doctorEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badges bg-light-info">
                      {formatDate(prescription.addedT)}
                    </span>
                  </td>
                  <td>
                    <span className={`badges mb-1 ml-2 ${prescription.status === "1"
                      ? "bg-light-success"
                      : "bg-light-danger"
                      }`}
                    >
                      {prescription.status === "1" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center">
                      <button
                        className="btn"
                        onClick={() => handleView(prescription)}
                      >
                        <i className="fa fa-eye fa-lg text-primary" />
                      </button>
                      <button
                        className="btn"
                        onClick={() => {
                          sessionStorage.setItem(
                            "prescription",
                            JSON.stringify(prescription)
                          );
                          window.open(`/prescriptions/${prescription.id}/pdf`);
                        }}
                      >
                        <i className="fa fa-print fa-lg text-warning" />
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleEdit(prescription)}
                      >
                        <i className="text-primary fa fa-edit fa-lg" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deletePrescription"
                        onClick={() => setDeleteId(prescription.id)}
                      >
                        <DeleteIcon className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No prescriptions found
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
        id="deletePrescription"
        tabIndex="-1"
        role="dialog"
      >
        <div
          className="modal-dialog modal-sm modal-dialog-centered"
          role="document"
        >
          <div className="modal-content text-center">
            <span className="modal-icon">
              <img src={deleteImage} alt="Remove Icon" />
            </span>
            <h2>Delete</h2>
            <p>Are you sure you want to delete this prescription?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deletePrescription}
                disabled={isDeleting}
              >
                {isDeleting ? "Wait..." : "Yes, Delete"}
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

export default Prescriptions;
