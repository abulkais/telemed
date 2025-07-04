import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import Select from "react-select";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { Link } from "react-router-dom";
import moment from "moment";
import delteImage from "../../assets/images/remove.png"

const Medicines = () => {
  const [medicinesData, setMedicinesData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [medicine, setMedicine] = useState({
    name: "",
    category: null,
    brand: null,
    saltComposition: "",
    buyingPrice: "",
    sellingPrice: "",
    sideEffects: "",
    description: "",
  });
  const [filter, setFilter] = useState("Medicine");
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchMedicinesData();
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchMedicinesData = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/medicines`);
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setMedicinesData(sortedData);
    } catch (error) {
      console.error("Error fetching Medicines:", error);
      toast.error("Failed to load Medicines");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/medicinesCategoriesStatus`
      );
      const options = res.data.map((cat) => ({
        value: cat.id,
        label: cat.name,
      }));
      setCategories(options);
    } catch (error) {
      console.error("Error fetching Categories:", error);
      toast.error("Failed to load Categories");
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/medicineBrands`);
      const options = res.data.map((brand) => ({
        value: brand.id,
        label: brand.name,
      }));
      setBrands(options);
    } catch (error) {
      console.error("Error fetching Brands:", error);
      toast.error("Failed to load Brands");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedicine((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (selectedOption, { name }) => {
    setMedicine((prev) => ({
      ...prev,
      [name]: selectedOption,
    }));
  };

  const validateForm = () => {
    if (!medicine.name) {
      toast.error("Medicine name is required");
      return false;
    }
    if (!medicine.category) {
      toast.error("Category is required");
      return false;
    }
    if (!medicine.brand) {
      toast.error("Brand is required");
      return false;
    }
    if (!medicine.saltComposition) {
      toast.error("Salt composition is required");
      return false;
    }
    if (!medicine.buyingPrice || isNaN(medicine.buyingPrice)) {
      toast.error("Valid buying price is required");
      return false;
    }
    if (!medicine.sellingPrice || isNaN(medicine.sellingPrice)) {
      toast.error("Valid selling price is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    const isDuplicate = medicinesData.some(
      (med) => med.name.toLowerCase() === medicine.name.toLowerCase()
    );

    if (isDuplicate && !editing) {
      toast.error("This Medicine name already exists!");
      return;
    }
    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    const newId = String(medicinesData.length + 1).padStart(2, "0");
    const medicineId = String(medicinesData.length + 1).padStart(2, "0");

    const newMedicine = {
      ...medicine,
      id: newId,
      medicineId: medicineId,
      category: medicine.category.label,
      categoryId: medicine.category.value,
      brand: medicine.brand.label,
      brandId: medicine.brand.value,
      created_at: currentDate,
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/medicines/${editId}`,
          newMedicine
        );
        toast.success("Medicine Updated Successfully");
      } else {
        await axios.post(`http://localhost:8080/api/medicines`, newMedicine);
        toast.success("Medicine Added Successfully");
      }

      fetchMedicinesData();
      resetForm();
      $("#addMedicine").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving Medicine");
    }
  };

  const resetForm = () => {
    setMedicine({
      name: "",
      category: null,
      brand: null,
      saltComposition: "",
      buyingPrice: "",
      sellingPrice: "",
      sideEffects: "",
      description: "",
    });
    setEditing(false);
    setEditId(null);
  };

  const deleteMedicine = async () => {
    if (!deleteId) {
      toast.error("Invalid Medicine ID!");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/medicines/${deleteId}`);
      setMedicinesData((prev) => prev.filter((med) => med.id !== deleteId));
      toast.success("Medicine deleted successfully!");
      $("#DeleteMedicine").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Medicine!");
    }
  };

  const handleEdit = (med) => {
    setEditing(true);
    setEditId(med.id);
    setMedicine({
      name: med.name,
      category: { value: med.categoryId, label: med.category },
      brand: { value: med.brandId, label: med.brand },
      saltComposition: med.saltComposition,
      buyingPrice: med.buyingPrice,
      sellingPrice: med.sellingPrice,
      sideEffects: med.sideEffects,
      description: med.description,
    });
    $("#addMedicine").modal("show");
  };

  const filterBySearch = (med) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      (med.name && med.name.toLowerCase().includes(searchLower)) ||
      (med.category && med.category.toLowerCase().includes(searchLower)) ||
      (med.brand && med.brand.toLowerCase().includes(searchLower)) ||
      (med.saltComposition &&
        med.saltComposition.toLowerCase().includes(searchLower)) ||
      (med.medicineId && med.medicineId.toLowerCase().includes(searchLower))
    );
  };
  const handleView = (med) => {
    setSelectedMedicine(med);
    $("#viewMedicine").modal("show");
  };
  const filteredMedicines = medicinesData.filter(filterBySearch);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMedicines.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
  const getTimeAgo = (date) => {
    return moment(date).fromNow();
  };

  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link
            to="/medicnies-categories"
            className={`doctor-nav-btn ${
              filter === "MedicineCategories" ? "active" : ""
            }`}
            onClick={() => setFilter("MedicineCategories")}
          >
            <span className="btn-text">Medicine Categories</span>
          </Link>

          <Link
            to="/medicine-brands"
            className={`doctor-nav-btn ${
              filter === "MedicineBrands" ? "active" : ""
            }`}
            onClick={() => setFilter("MedicineBrands")}
          >
            <span className="btn-text">Medicine Brands</span>
          </Link>

          <Link
            to="/medicine"
            className={`doctor-nav-btn ${
              filter === "Medicine" ? "active" : ""
            }`}
            onClick={() => setFilter("Medicine")}
          >
            <span className="btn-text">Medicine</span>
          </Link>

          <Link
            to="/purchase-medicine"
            className={`doctor-nav-btn ${
              filter === "PurchaseMedicine" ? "active" : ""
            }`}
            onClick={() => setFilter("PurchaseMedicine")}
          >
            <span className="btn-text">Purchase Medicine</span>
          </Link>

          <Link
            to="/used-medicine"
            className={`doctor-nav-btn ${
              filter === "UsedMedicine" ? "active" : ""
            }`}
            onClick={() => setFilter("UsedMedicine")}
          >
            <span className="btn-text">Used Medicine</span>
          </Link>

          <Link
            to="/medicine-bills"
            className={`doctor-nav-btn ${
              filter === "MedicineBills" ? "active" : ""
            }`}
            onClick={() => setFilter("MedicineBills")}
          >
            <span className="btn-text">Medicine Bills</span>
          </Link>
        </div>
      </div>
      <div className="filter-bar-container">
        <div className="filter-search-box">
          <input
            type="text"
            className="form-control"
            placeholder="Search medicines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <button
            className="filter-btn filter-btn-primary"
            data-toggle="modal"
            data-target="#addMedicine"
            onClick={resetForm}
          >
            New Medicine
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>S.N</th>
              <th>Medicine Name</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Salt Composition</th>
              <th>Buying Price</th>
              <th>Selling Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((med, index) => (
              <tr key={index}>
                <td>{indexOfFirstItem + index + 1}</td>
                <span
                  className="badges bg-light-success"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleView(med)}
                  data-toggle="modal"
                  data-target="#viewMedicine"
                >
                  {med.name}
                </span>
                <td>{med.category}</td>
                <td>{med.brand}</td>
                <td>{med.saltComposition}</td>
                <td>${med.buyingPrice}</td>
                <td>${med.sellingPrice}</td>
                <td>
                  <div
                    className="d-flex justify-center items-center"
                    style={{ justifyContent: "center" }}
                  >
                    <button className="btn" onClick={() => handleEdit(med)}>
                      <i className="text-primary fa fa-edit fa-lg" />
                    </button>
                    <button
                      className="btn"
                      data-toggle="modal"
                      data-target="#DeleteMedicine"
                      onClick={() => setDeleteId(med.id)}
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
            {Math.min(indexOfLastItem, filteredMedicines.length)} of{" "}
            {filteredMedicines.length} results
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

      {/* Add/Edit Medicine Modal */}
      <div
        className="modal fade document_modal"
        id="addMedicine"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addMedicine"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-center" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Medicine" : "New Medicine"}
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
              <div className="row">
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Medicine Name: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Medicine Name"
                      value={medicine.name}
                      className="form-control"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Category: <span className="text-danger">*</span>
                    </label>
                    <Select
                      name="category"
                      options={categories}
                      value={medicine.category}
                      onChange={handleSelectChange}
                      placeholder="Select Category"
                      isClearable
                      isSearchable
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Brand: <span className="text-danger">*</span>
                    </label>
                    <Select
                      name="brand"
                      options={brands}
                      value={medicine.brand}
                      onChange={handleSelectChange}
                      placeholder="Select Brand"
                      isClearable
                      isSearchable
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Salt Composition: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="saltComposition"
                      placeholder="Salt Composition"
                      value={medicine.saltComposition}
                      className="form-control"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Buying Price ($): <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="buyingPrice"
                      placeholder="Buying Price"
                      value={medicine.buyingPrice}
                      className="form-control"
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Selling Price ($): <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="sellingPrice"
                      placeholder="Selling Price"
                      value={medicine.sellingPrice}
                      className="form-control"
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="form-group">
                    <label>Side Effects:</label>
                    <textarea
                      name="sideEffects"
                      placeholder="Side Effects"
                      value={medicine.sideEffects}
                      className="form-control"
                      onChange={handleChange}
                      rows="2"
                    />
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea
                      name="description"
                      placeholder="Description"
                      value={medicine.description}
                      className="form-control"
                      onChange={handleChange}
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex align-center justify-center mt-4">
                <button className="btn btn-primary mr-3" onClick={handleSubmit}>
                  {editing ? "Update" : "Save"}
                </button>
                <button
                  className="btn btn-secondary"
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

      <div
        className="modal fade document_modal"
        id="viewMedicine"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="viewMedicine"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-center" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Medicine Details</h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              {selectedMedicine && (
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label class="fs-5 text-gray-600">
                        Medicine Name:
                      </label>
                      <p className="fs-5 text-gray-800 showSpan">{selectedMedicine.name}</p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                    <label class="fs-5 text-gray-600">
                        Category:
                      </label>
                      <p>{selectedMedicine.category}</p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                    <label class="fs-5 text-gray-600">
                        Brand:
                      </label>
                      <p>{selectedMedicine.brand}</p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                    <label class="fs-5 text-gray-600">
                        Salt Composition:
                      </label>
                      <p>{selectedMedicine.saltComposition}</p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                    <label class="fs-5 text-gray-600">
                        Buying Price ($):
                      </label>
                      <p>${selectedMedicine.buyingPrice}</p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                    <label class="fs-5 text-gray-600">
                        Selling Price ($):
                      </label>
                      <p>${selectedMedicine.sellingPrice}</p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                    <label class="fs-5 text-gray-600">
                        Side Effects:
                      </label>
                      <p>{selectedMedicine.sideEffects || "N/A"}</p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                    <label class="fs-5 text-gray-600">
                        Description:
                      </label>
                      <p>{selectedMedicine.description || "N/A"}</p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                    <label class="fs-5 text-gray-600">
                    Created On:
                      </label>
                      <p>{getTimeAgo(selectedMedicine.created_at)}</p>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                    <label class="fs-5 text-gray-600">
                    Last Updated:
                      </label>
                      <p>{getTimeAgo(selectedMedicine.updated_at || "N/A")}</p>
                    </div>
                  </div>
                </div>
              )}
             
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="DeleteMedicine"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="DeleteMedicine"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-sm modal-dialog-centered"
          role="document"
        >
          <div className="modal-content text-center">
            <span className="modal-icon">
              <img
                src={delteImage}
                alt="delete image"
              />
            </span>
            <h2>Delete</h2>
            <p>Are you sure want to delete this Medicine?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteMedicine}
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

export default Medicines;
