import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const Currencies = () => {
  const [currenciesData, setCurrenciesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currencies, setCurrencies] = useState({
    name: "",
    icon: "",
    code: "",
  });
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("Currencies");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrencies((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!currencies.name) {
      toast.error("Currency name is required");
      return false;
    }

    if (!currencies.icon) {
      toast.error("Currency icon is required");
      return false;
    }

    if (!currencies.code) {
      toast.error("Currency code  is required");
      return false;
    }

    // Check for duplicate department name (case insensitive)
    const isDuplicate = currenciesData.some(
      (type) =>
        type.name.toLowerCase() === currencies.name.toLowerCase() &&
        (!editing || type.id !== editId)
    );

    if (isDuplicate) {
      toast.error("The name has already been taken.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Generate a simple ID
    const newId = String(currenciesData.length + 1).padStart(2, "0");
    const currencySettingsId = String(currenciesData.length + 1).padStart(
      2,
      "0"
    );

    const newCurrenciesSettings = {
      ...currencies,
      id: newId,
      currencySettingsId: currencySettingsId,
      created_at: currentDate,
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/currenciesSettings/${editId}`,
          newCurrenciesSettings
        );
        toast.success("Currency Updated Successfully");
      } else {
        await axios.post(
          `http://localhost:8080/api/currenciesSettings`,
          newCurrenciesSettings
        );
        toast.success("Currency Added Successfully");
      }
      fetchCurrencies();
      resetForm();
      $("#addCurrencies").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving Currency");
    }
  };

  const resetForm = () => {
    setCurrencies({
      name: "",
      icon: "",
      code: "",
    });
    setEditing(false);
    setEditId(null);
  };

  const fetchCurrencies = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/currenciesSettings`
      );
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setCurrenciesData(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching Currency:", error);
      toast.error("Failed to load Currency");
    }
  };

  const deleteCurrency = async () => {
    if (!deleteId) {
      toast.error("Invalid Currency ID!");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8080/api/currenciesSettings/${deleteId}`
      );
      setCurrenciesData((prev) => prev.filter((type) => type.id !== deleteId));
      toast.success("Currency  deleted successfully!");
      $("#deleteCurrency").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Currency!");
    }
  };

  const handleEdit = (type) => {
    setEditing(true);
    setEditId(type.id);
    setCurrencies({
      name: type.name,
      icon: type.icon,
      code: type.code,
    });
    $("#addCurrencies").modal("show");
  };

  const filterBySearch = (doc) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      (doc.name && doc.name.toLowerCase().includes(searchLower)) ||
      (doc.icon && doc.icon.toLowerCase().includes(searchLower))
    );
  };

  const filteredCurrencies = currenciesData.filter(filterBySearch);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCurrencies.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredCurrencies.length / itemsPerPage);

  const formatDate = (dateString) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const dateObj = new Date(dateString);
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  return (
    <div>
      <ToastContainer />

      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link
            to="/settings"
            className={`doctor-nav-btn ${filter === "General" ? "active" : ""}`}
            onClick={() => setFilter("General")}
          >
            <span className="btn-text">General</span>
          </Link>
          <Link
            to="/currencies-settings"
            className={`doctor-nav-btn ${
              filter === "Currencies" ? "active" : ""
            }`}
            onClick={() => setFilter("Currencies")}
          >
            <span className="btn-text">Currencies</span>
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
        <div className="d-flex justify-content-between align-items-center">
          <button
            className="filter-btn filter-btn-primary"
            data-toggle="modal"
            data-target="#addCurrencies"
            onClick={resetForm}
          >
            New Currency
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>S.N</th>
              <th>Currency Name </th>
              <th>Currency Icon</th>
              <th>Currency Code</th>
              <th>Created On</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((type, index) => (
              <tr key={index}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>{type.name}</td>
                <td>{type.icon}</td>
                <td>{type.code}</td>
                <td>
                  <div className="badges bg-light-info">
                    {formatDate(type.created_at)}
                  </div>
                </td>
                <td>
                  <div
                    className="d-flex justify-center items-center"
                    style={{ justifyContent: "center" }}
                  >
                    <button className="btn" onClick={() => handleEdit(type)}>
                      <i className="text-primary fa fa-edit fa-lg" />
                    </button>
                    <button
                      className="btn"
                      data-toggle="modal"
                      data-target="#deleteCurrency"
                      onClick={() => setDeleteId(type.id)}
                    >
                      <DeleteIcon className="text-danger" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination controls */}
        <div className="d-flex justify-content-between align-items-center mt-5">
          <div>
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredCurrencies.length)} of{" "}
            {filteredCurrencies.length} results
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

              {/* Always show first page */}
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

              {/* Show ellipsis if current page is far from start */}
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

              {/* Show pages around current page */}
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

              {/* Show ellipsis if current page is far from end */}
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

              {/* Always show last page if there's more than 1 page */}
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

      {/* Add/Edit Currency Modal */}
      <div
        className="modal fade document_modal"
        id="addCurrencies"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addCurrencies"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-md modal-center"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Currency" : "New Currency"}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                onClick={resetForm}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>
                  Currency Name: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Currency Name"
                  value={currencies.name}
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Currency Icon: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="icon"
                  placeholder="Currency Icon"
                  value={currencies.icon}
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>
                  Currency Code: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  placeholder="Currency Code"
                  value={currencies.code}
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              <div className="d-flex align-center justify-center mt-4">
                <button className="btn btn-primary mr-3" onClick={handleSubmit}>
                  {editing ? "Update" : "Save"}
                </button>
                <button
                  className="btn btn-secondary px-3"
                  data-dismiss="modal"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div
        className="modal fade"
        id="deleteCurrency"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteCurrency"
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
                alt=""
              />
            </span>
            <h2>Delete</h2>
            <p>Are you sure want to delete this Currency?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteCurrency}
              >
                Yes, Delete
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

export default Currencies;
