import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Switch from "@mui/material/Switch";

const medicinesCategories = () => {
  const [categoriesData, setCategoriesData] = useState([]);
  const [excelLoading, setExcelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("MedicineCategories");

  const [category, setCategory] = useState({
    name: "",
    status: true, // true for Active, false for Deactive
  });
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All"); // All, Active, Deactive
  const [dateFilter, setDateFilter] = useState({
    start: null,
    end: null,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (e) => {
    setCategory((prev) => ({
      ...prev,
      status: e.target.checked,
    }));
  };

  const validateForm = () => {
    if (!category.name) {
      toast.error("Category name is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    // Check for duplicate category name (case insensitive)
    const isDuplicate = categoriesData.some(
      (cat) => cat.name.toLowerCase() === category.name.toLowerCase()
    );

    if (isDuplicate && !editing) {
      toast.error("This category name already exists!");
      return;
    }
    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    const newId = String(categoriesData.length + 1).padStart(2, "0");
    const categoryId = String(categoriesData.length + 1).padStart(2, "0");

    const newCategory = {
      ...category,
      id: newId,
      categoryId: categoryId,
      created_at: currentDate,
      status: category.status ? "Active" : "Deactive",
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/medicinesCategories/${editId}`,
          newCategory
        );
        toast.success("Category Updated Successfully");
      } else {
        await axios.post(
          `http://localhost:8080/api/medicinesCategories`,
          newCategory
        );
        toast.success("Category Added Successfully");
      }

      fetchCategoriesData();
      resetForm();
      $("#addCategory").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving Category");
    }
  };

  const resetForm = () => {
    setCategory({
      name: "",
      status: true,
    });
    setEditing(false);
    setEditId(null);
  };

  const fetchCategoriesData = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/medicinesCategories`);
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setCategoriesData(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching Categories:", error);
      toast.error("Failed to load Categories");
    }
  };

  const deleteCategory = async () => {
    if (!deleteId) {
      toast.error("Invalid Category ID!");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8080/api/medicinesCategories/${deleteId}`
      );
      setCategoriesData((prev) => prev.filter((cat) => cat.id !== deleteId));
      toast.success("Category deleted successfully!");
      $("#DeleteCategory").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Category!");
    }
  };

  const handleEdit = (cat) => {
    setEditing(true);
    setEditId(cat.id);
    setCategory({
      name: cat.name,
      status: cat.status === "Active",
    });
    $("#addCategory").modal("show");
  };

  const downloadCSV = () => {
    setExcelLoading(true);

    let dataToExport;
    let fileName;

    if (dateFilter.start && !dateFilter.end) {
      dataToExport = categoriesData.filter((doc) => {
        const docDate = new Date(doc.created_at);
        const filterDate = new Date(dateFilter.start);

        return (
          docDate.getDate() === filterDate.getDate() &&
          docDate.getMonth() === filterDate.getMonth() &&
          docDate.getFullYear() === filterDate.getFullYear()
        );
      });
      fileName = `Medicine_Categories_${new Date(dateFilter.start)
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else if (
      dateFilter.start ||
      dateFilter.end ||
      searchQuery ||
      statusFilter !== "All"
    ) {
      dataToExport = categoriesData
       
        .filter(filterBySearch)
        .filter(filterByStatus);
      fileName = `Medicine_Categories_Filtered_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else {
      dataToExport = categoriesData;
      fileName = `Medicine_Categories_All_Data_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
    }

    if (dataToExport.length === 0) {
      toast.error("No data found for the current filters!");
      setExcelLoading(false);
      return;
    }

    const data = [
      {
        "Category ID": "Category ID",
        "Category Name": "Category Name",
        Status: "Status",
        "Date & Time": "Date & Time",
      },
      ...dataToExport.map((cat) => ({
        "Category ID": cat.categoryId,
        "Category Name": cat.name,
        Status: cat.status,
        "Date & Time": formatDate(cat.created_at),
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    worksheet["!cols"] = [{ wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 20 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories Report");
    XLSX.writeFile(workbook, fileName);
    setExcelLoading(false);
    toast.success(`Report downloaded (${dataToExport.length} records)`);
  };


  const filterBySearch = (doc) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      (doc.name && doc.name.toLowerCase().includes(searchLower)) ||
      (doc.categoryId && doc.categoryId.toLowerCase().includes(searchLower))
    );
  };

  const filterByStatus = (doc) => {
    if (statusFilter === "All") return true;
    return doc.status === statusFilter;
  };

  const filteredCategories = categoriesData

    .filter(filterBySearch)
    .filter(filterByStatus);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCategories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

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
    fetchCategoriesData();
  }, []);

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
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="d-flex justify-content-between align-items-center">
        

          {/* Status Filter Dropdown */}
          <div className="mr-2">
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Deactive">Deactive</option>
            </select>
          </div>

          <button
            className="filter-btn filter-btn-primary"
            data-toggle="modal"
            data-target="#addCategory"
            onClick={resetForm}
          >
            New Medicine Category
          </button>

          <button
            className="btn btn-success ml-2"
            onClick={downloadCSV}
            disabled={excelLoading}
          >
            {excelLoading ? (
              <span>Exporting...</span>
            ) : (
              <span>
                <i className="fa fa-file-excel-o fa-md p-1"></i>
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>S.N</th>
              <th>Category Name</th>
              <th>Status</th>
              <th>Date & Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((cat, index) => (
              <tr key={index}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>
                  <span className="badges bg-light-success">{cat.name}</span>
                </td>
                <td>
                  <span
                    className={`badge ${
                      cat.status === "Active"
                        ? "bg-light-success"
                        : "bg-light-danger"
                    }`}
                  >
                    {cat.status}
                  </span>
                </td>
                <td>
                  <div className="badges bg-light-info">
                    {formatDate(cat.created_at)}
                  </div>
                </td>
                <td>
                  <div
                    className="d-flex justify-center items-center"
                    style={{ justifyContent: "center" }}
                  >
                    <button className="btn" onClick={() => handleEdit(cat)}>
                      <i className="text-primary fa fa-edit fa-lg" />
                    </button>
                    <button
                      className="btn"
                      data-toggle="modal"
                      data-target="#DeleteCategory"
                      onClick={() => setDeleteId(cat.id)}
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
            {Math.min(indexOfLastItem, filteredCategories.length)} of{" "}
            {filteredCategories.length} results
          </div>
          <div className="d-flex align-items-center">
            <span className="mr-2">Per page</span>
            <select
              className="form-control form-control-sm"
              style={{ width: "70px" }}
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
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

      {/* Add/Edit Category Modal */}
      <div
        className="modal fade document_modal"
        id="addCategory"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addCategory"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-lg modal-center"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Medicine Category" : "New Medicine Category"}
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
                  Category Name: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Category Name"
                  value={category.name}
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Status:</label>
                <div className="d-flex align-items-center">
                  <Switch
                    checked={category.status}
                    onChange={handleStatusChange}
                    color="primary"
                    inputProps={{ "aria-label": "status switch" }}
                  />
                  <span className="ml-2">
                    {category.status ? "Active" : "Deactive"}
                  </span>
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

      {/* Delete Confirmation Modal */}
      <div
        className="modal fade"
        id="DeleteCategory"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="DeleteCategory"
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
            <p>Are you sure want to delete this Category?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteCategory}
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

export default medicinesCategories;
