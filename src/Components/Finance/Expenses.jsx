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
import Preloader from "../preloader";
import Select from "react-select";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [expenseData, setExpenseData] = useState({
    id: null,
    categoryId: "",
    name: "",
    invoiceNumber: "",
    date: "",
    amount: "",
    attachment: null,
    description: "",
  });
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const filterRef = useRef(null);
  const fileInputRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchExpenses = async () => {
    try {
      const params =
        categoryFilter !== "ALL" ? { categoryId: categoryFilter } : {};
      const res = await axios.get(
        "http://localhost:8080/api/financeExpenses",
        {
          params,
        }
      );
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setExpenses(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to load expenses");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/financeCategories"
      );
      setCategories([
        { value: "ALL", label: "All Categories" },
        ...res.data.map((cat) => ({ value: cat.id, label: cat.name })),
      ]);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [categoryFilter]);

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

  const deleteExpense = async () => {
    if (!deleteId) {
      toast.error("Invalid Expense ID!");
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(
        `http://localhost:8080/api/financeExpenses/${deleteId}`
      );
      setExpenses((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Expense deleted successfully!");
      $("#deleteExpense").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting expense!");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = (expense) => {
    navigate(`/expense/${expense.id}/view`);
  };

  const handleEdit = (expense) => {
    setEditing(true);
    setExpenseData({
      id: expense.id,
      categoryId: expense.categoryId,
      name: expense.name,
      invoiceNumber: expense.invoiceNumber || "",
      date: expense.date.split("T")[0],
      amount: expense.amount,
      attachment: null,
      description: expense.description || "",
    });
    $("#addExpenseModal").modal("show");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setExpenseData((prev) => ({ ...prev, attachment: e.target.files[0] }));
  };

  const validateForm = () => {
    if (
      !expenseData.categoryId ||
      !expenseData.name ||
      !expenseData.date ||
      !expenseData.amount
    ) {
      toast.error("Category, Name, Date, and Amount are required!");
      return false;
    }
    const isDuplicate = expenses.some(
      (item) =>
        item.name.toLowerCase() === expenseData.name.toLowerCase() &&
        (!editing || item.id !== expenseData.id)
    );
    if (isDuplicate) {
      toast.error("The name has already been taken.");
      return false;
    }
    return true;
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    const formData = new FormData();
    formData.append("categoryId", expenseData.categoryId);
    formData.append("name", expenseData.name);
    formData.append("invoiceNumber", expenseData.invoiceNumber);
    formData.append("date", expenseData.date);
    formData.append("amount", parseInt(expenseData.amount));
    if (expenseData.attachment)
      formData.append("attachment", expenseData.attachment);
    formData.append("description", expenseData.description);

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/financeExpenses/${expenseData.id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Expense updated successfully!");
      } else {
        await axios.post(
          "http://localhost:8080/api/financeExpenses",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Expense added successfully!");
      }
      fetchExpenses();
      $("#addExpenseModal").modal("hide");
      resetForm();
    } catch (error) {
      console.error(
        "Error saving expense:",
        error.response?.data || error.message
      );
      toast.error(
        "Error saving expense: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setExpenseData({
      id: null,
      categoryId: "",
      name: "",
      invoiceNumber: "",
      date: "",
      amount: "",
      attachment: null,
      description: "",
    });
    setEditing(false);
  };

  const filterExpenses = (expense) => {
    const matchesSearch = searchQuery
      ? expense.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.invoiceNumber
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        expense.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesSearch;
  };

  const filteredExpenses = expenses.filter(filterExpenses);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredExpenses.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setCategoryFilter("ALL");
    setSearchQuery("");
    setCurrentPage(1);
    setShowFilter(false);
  };

  const toggleFilterDropdown = () => {
    setShowFilter(!showFilter);
  };

  const downloadExcel = () => {
    const dataToExport = filteredExpenses.map((expense, index) => ({
      "S.N": index + 1,
      "Invoice Number": expense.invoiceNumber || "N/A",
      Name: expense.name,
      "Expense Head": expense.categoryName,
      Date: new Date(expense.date).toLocaleString(),
      Amount: expense.amount,
      Description: expense.description || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    XLSX.writeFile(workbook, "Expenses_List.xlsx");
  };

  const downloadAttachment = (filename) => {
    window.open(`http://localhost:8080/Uploads/${filename}`, "_blank");
  };

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

  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link to="/finance-categories" className="doctor-nav-btn">
            <span className="btn-text">Finance Category</span>
          </Link>
          <Link to="/income" className="doctor-nav-btn">
            <span className="btn-text">Income</span>
          </Link>
          <Link to="/expenses" className="doctor-nav-btn active">
            <span className="btn-text">Expenses</span>
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
            placeholder="Search by Name or Invoice"
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
                    Category:
                  </label>
                  <select
                    className="form-control"
                    value={categoryFilter}
                    onChange={handleCategoryFilterChange}
                    style={{ padding: "5px", fontSize: "14px" }}
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
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
            data-toggle="modal"
            data-target="#addExpenseModal"
            onClick={resetForm}
          >
            New Expense
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>S.N</th>
              <th>Invoice Number</th>
              <th>Name</th>
              <th>Expense Head</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Attachment</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((expense, index) => (
                <tr key={expense.id}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>
                    <span className="badges bg-light-success">
                      {expense.invoiceNumber || "N/A"}
                    </span>
                  </td>
                  <td>{expense.name}</td>
                  <td className="text-capitalize">{expense.categoryName}</td>
                  <td>
                    <span className="badges bg-light-info">
                      {formatDate(expense.date)}
                    </span>
                  </td>
                  <td>{expense.amount}</td>
                  <td>
                    {expense.attachment ? (
                      <button
                        className="btn btn-link"
                        onClick={() => downloadAttachment(expense.attachment)}
                      >
                        Download
                      </button>
                    ) : (
                      "N/A"
                    )}
                  </td>

                  <td>
                    <span className="badges bg-light-info">
                      {formatDate(expense.created_at)}
                    </span>
                  </td>
                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                      <button
                        className="btn"
                        onClick={() => handleEdit(expense)}
                      >
                        <i className="text-primary fa fa-edit fa-lg" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deleteExpense"
                        onClick={() => setDeleteId(expense.id)}
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
            {Math.min(indexOfLastItem, filteredExpenses.length)} of{" "}
            {filteredExpenses.length} results
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

      {/* Add/Edit Expense Modal */}
      <div
        className="modal fade document_modal"
        id="addExpenseModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addExpenseModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-center" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Expense" : "New Expense"}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                onClick={resetForm}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveExpense}>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>
                        Expense Head: <span className="text-danger">*</span>
                      </label>
                      <Select
                        name="categoryId"
                        options={categories.filter(
                          (cat) => cat.value !== "ALL"
                        )}
                        value={
                          categories.filter(
                            (cat) => cat.value === expenseData.categoryId
                          )[0]
                        }
                        onChange={(selectedOption) =>
                          setExpenseData({
                            ...expenseData,
                            categoryId: selectedOption.value,
                          })
                        }
                        placeholder="Select Expense Head"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>
                        Name: <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={expenseData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>
                        Date: <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        className="form-control"
                        value={expenseData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>Invoice Number:</label>
                      <input
                        type="text"
                        name="invoiceNumber"
                        className="form-control"
                        value={expenseData.invoiceNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>
                        Amount: <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        name="amount"
                        className="form-control"
                        value={expenseData.amount}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>Attachment:</label>
                      <input
                        type="file"
                        name="attachment"
                        className="form-control-file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label>Description:</label>
                      <textarea
                        name="description"
                        className="form-control"
                        value={expenseData.description}
                        onChange={handleInputChange}
                        rows="3"
                      />
                    </div>
                  </div>
                </div>
                <div className="d-flex align-center justify-center mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary mr-3 px-3"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        <span className="ml-2">
                          {editing ? "Updating..." : "Saving..."}
                        </span>
                      </div>
                    ) : editing ? (
                      "Update"
                    ) : (
                      "Submit"
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

      {/* Delete Expense Modal */}
      <div
        className="modal fade"
        id="deleteExpense"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteExpense"
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
            <p>Are you sure you want to delete this expense?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteExpense}
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

export default Expenses;
