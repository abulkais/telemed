import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import removeIcon from "../../assets/images/remove.png";
import Preloader from "../preloader";
import Select from "react-select";

const DoctorOpdCharges = () => {
  const [doctorOpdCharges, setDoctorOpdCharges] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    doctorId: "",
    standardCharge: "",
    description: "",
  });

  const fetchDoctorOpdCharges = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/doctorOpdCharges");
      setDoctorOpdCharges(res.data);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching doctor OPD charges:", error);
      toast.error("Failed to load doctor OPD charges");
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/getDoctorsByStatus");
      setDoctors(
        res.data.map((doctor) => ({
          value: doctor.id,
          label: `${doctor.firstName} ${doctor.lastName}`,
        }))
      );
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors");
    }
  };

  useEffect(() => {
    fetchDoctorOpdCharges();
    fetchDoctors();
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDoctorChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      doctorId: selectedOption ? selectedOption.value : "",
    }));
  };
  const validateForm = () => {
    if (!formData.doctorId) {
      toast.error("Doctor is required!");
      return false;
    }
    if (!formData.standardCharge) {
      toast.error("Standard Charge is required!");
      return false;
    }
    if (isNaN(formData.standardCharge)) {
      toast.error("Standard Charge is number!");
      return false;
    }
    if (formData.standardCharge <= 0) {
      toast.error("Standard Charge greater than 0!");
      return false;
    }

    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (editData) {
        // Update existing doctor OPD charge
        await axios.put(
          `http://localhost:8080/api/doctorOpdCharges/${editData.id}`,
          formData
        );
        toast.success("Doctor OPD charge updated successfully!");
      } else {
        // Create new doctor OPD charge
        await axios.post(
          "http://localhost:8080/api/doctorOpdCharges",
          formData
        );
        toast.success("Doctor OPD charge created successfully!");
      }
      fetchDoctorOpdCharges();
      $("#addEditDoctorOpdChargeModal").modal("hide");
      resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        `Failed to ${editData ? "update" : "create"} doctor OPD charge`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (doctorOpdCharge) => {
    setEditData(doctorOpdCharge);
    setFormData({
      doctorId: doctorOpdCharge.doctorId,
      standardCharge: doctorOpdCharge.standardCharge,
      description: doctorOpdCharge.description || "",
    });
    $("#addEditDoctorOpdChargeModal").modal("show");
  };

  const handleDelete = async () => {
    if (!deleteId) {
      toast.error("Invalid Doctor OPD Charge ID!");
      return;
    }

    setIsDeleting(true);

    try {
      await axios.delete(
        `http://localhost:8080/api/doctorOpdCharges/${deleteId}`
      );
      setDoctorOpdCharges((prev) =>
        prev.filter((item) => item.id !== deleteId)
      );
      toast.success("Doctor OPD charge deleted successfully!");
      $("#deleteDoctorOpdChargeModal").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting doctor OPD charge!");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setEditData(null);
    setFormData({
      doctorId: "",
      standardCharge: "",
      description: "",
    });
  };

  const filterDoctorOpdCharges = (doctorOpdCharge) => {
    const matchesSearch = searchQuery
      ? `${doctorOpdCharge.doctorFirstName} ${doctorOpdCharge.doctorLastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        doctorOpdCharge.standardCharge
          .toString()
          .includes(searchQuery.toLowerCase())
      : true;

    return matchesSearch;
  };

  const filteredDoctorOpdCharges = doctorOpdCharges.filter(
    filterDoctorOpdCharges
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDoctorOpdCharges.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredDoctorOpdCharges.length / itemsPerPage);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <ToastContainer />
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
            className="filter-btn filter-btn-primary"
            data-toggle="modal"
            data-target="#addEditDoctorOpdChargeModal"
            onClick={resetForm}
          >
            New Doctor OPD Charge
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>S.N</th>
              <th>Doctors</th>
              <th>Standard Charges</th>
              <th>Description</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {doctorOpdCharges.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <Preloader />
                </td>
              </tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((doctorOpdCharge, index) => (
                <tr key={doctorOpdCharge.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      {doctorOpdCharge.doctorImgUrl ? (
                        <img
                          src={`http://localhost:8080${doctorOpdCharge.doctorImgUrl}`}
                          alt={`${doctorOpdCharge.doctorFirstName} ${doctorOpdCharge.doctorLastName}`}
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
                          {doctorOpdCharge.doctorFirstName
                            ?.charAt(0)
                            ?.toUpperCase() || ""}
                          {doctorOpdCharge.doctorLastName
                            ?.charAt(0)
                            ?.toUpperCase() || ""}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {doctorOpdCharge.doctorFirstName}{" "}
                          {doctorOpdCharge.doctorLastName}
                        </p>
                        <p className="mb-0">{doctorOpdCharge.doctorEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badges bg-light-success">
                      {doctorOpdCharge.standardCharge}
                    </span>
                  </td>
                  <td>{doctorOpdCharge.description || "N/A"}</td>
                  <td>
                    <span className="badges bg-light-success">
                      {formatDateTime(doctorOpdCharge.created_at)}
                    </span>
                  </td>
                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#addEditDoctorOpdChargeModal"
                        onClick={() => handleEdit(doctorOpdCharge)}
                      >
                        <i className="fa fa-edit text-primary fa-lg"></i>
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deleteDoctorOpdChargeModal"
                        onClick={() => setDeleteId(doctorOpdCharge.id)}
                      >
                        <DeleteIcon className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  Data not found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="d-flex justify-content-between align-items-center mt-5">
          <div>
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredDoctorOpdCharges.length)} of{" "}
            {filteredDoctorOpdCharges.length} results
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

      {/* Add/Edit Modal */}
      <div
        className="modal fade"
        id="addEditDoctorOpdChargeModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addEditDoctorOpdChargeModalLabel"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-md modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addEditDoctorOpdChargeModalLabel">
                {editData ? "Edit Doctor OPD Charge" : "Add Doctor OPD Charge"}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="doctorId">
                    Doctor <span className="text-danger">*</span>{" "}
                  </label>
                  <Select
                    id="doctorId"
                    options={doctors}
                    value={
                      doctors.find(
                        (option) => option.value === formData.doctorId
                      ) || null
                    }
                    onChange={handleDoctorChange}
                    placeholder="Select Doctor"
                    isClearable
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="standardCharge">
                    Standard Charge <span className="text-danger">*</span>
                  </label>
                  <input
                    placeholder="Standard Charge"
                    type="number"
                    id="standardCharge"
                    name="standardCharge"
                    className="form-control"
                    value={formData.standardCharge}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    placeholder="Description"
                    id="description"
                    name="description"
                    className="form-control"
                    value={formData.description}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="d-flex  mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary mr-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>{" "}
                        Saving...
                      </span>
                    ) : editData ? (
                      "Update"
                    ) : (
                      "Save"
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary px-3"
                    data-dismiss="modal"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <div
        className="modal fade"
        id="deleteDoctorOpdChargeModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteDoctorOpdChargeModalLabel"
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
            <p>Are you sure you want to delete this doctor OPD charge?</p>
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

export default DoctorOpdCharges;
