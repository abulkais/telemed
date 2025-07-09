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

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [incomeData, setIncomeData] = useState({
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

  const fetchIncomes = async () => {
    try {
      const params =
        categoryFilter !== "ALL" ? { categoryId: categoryFilter } : {};
      const res = await axios.get("http://localhost:8080/api/financeIncome", {
        params,
      });
      // Assuming the API now returns joined data with categoryName
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setIncomes(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error(
        "Error fetching incomes:",
        error.response?.data || error.message
      );
      toast.error("Failed to load incomes");
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
    fetchIncomes();
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

  const deleteIncome = async () => {
    if (!deleteId) {
      toast.error("Invalid Income ID!");
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:8080/api/financeIncome/${deleteId}`);
      setIncomes((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Income deleted successfully!");
      $("#deleteIncome").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting income!");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = (income) => {
    navigate(`/income/${income.id}/view`);
  };

  const handleEdit = (income) => {
    setEditing(true);
    setIncomeData({
      id: income.id,
      categoryId: income.categoryId,
      name: income.name,
      invoiceNumber: income.invoiceNumber || "",
      date: income.date.split("T")[0], // Convert to YYYY-MM-DD format
      amount: income.amount,
      attachment: null,
      description: income.description || "",
    });
    $("#addIncomeModal").modal("show");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setIncomeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setIncomeData((prev) => ({ ...prev, attachment: e.target.files[0] }));
  };

  const validateForm = () => {
    if (
      !incomeData.categoryId ||
      !incomeData.name ||
      !incomeData.date ||
      !incomeData.amount
    ) {
      toast.error("Category, Name, Date, and Amount are required!");
      return false;
    }
    const isDuplicate = incomes.some(
      (item) =>
        item.name.toLowerCase() === incomeData.name.toLowerCase() &&
        (!editing || item.id !== incomeData.id)
    );
    if (isDuplicate) {
      toast.error("The name has already been taken.");
      return false;
    }
    return true;
  };

  const handleSaveIncome = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    const formData = new FormData();
    formData.append("categoryId", incomeData.categoryId);
    formData.append("name", incomeData.name);
    formData.append("invoiceNumber", incomeData.invoiceNumber);
    formData.append("date", incomeData.date);
    formData.append("amount", parseInt(incomeData.amount));
    if (incomeData.attachment)
      formData.append("attachment", incomeData.attachment);
    formData.append("description", incomeData.description);

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/financeIncome/${incomeData.id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Income updated successfully!");
      } else {
        await axios.post("http://localhost:8080/api/financeIncome", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Income added successfully!");
      }
      fetchIncomes();
      $("#addIncomeModal").modal("hide");
      resetForm();
    } catch (error) {
      console.error(
        "Error saving income:",
        error.response?.data || error.message
      );
      toast.error(
        "Error saving income: " + (error.response?.data?.error || error.message)
      );
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setIncomeData({
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

  const filterIncomes = (income) => {
    const matchesSearch = searchQuery
      ? income.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        income.invoiceNumber
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        income.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesSearch;
  };

  const filteredIncomes = incomes.filter(filterIncomes);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredIncomes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredIncomes.length / itemsPerPage);

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
    const dataToExport = filteredIncomes.map((income, index) => ({
      "S.N": index + 1,
      "Invoice Number": income.invoiceNumber || "N/A",
      Name: income.name,
      "Income Head": income.categoryName,
      Date: new Date(income.date).toLocaleString(),
      Amount: income.amount,
      Description: income.description || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Income");
    XLSX.writeFile(workbook, "Income_List.xlsx");
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
          <Link to="/income" className="doctor-nav-btn active">
            <span className="btn-text">Income</span>
          </Link>
          <Link to="/expenses" className="doctor-nav-btn">
            <span className="btn-text">Expenses</span>
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
            data-target="#addIncomeModal"
            onClick={resetForm}
          >
            New Income
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
              <th>Income Head</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Attachment</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((income, index) => (
                <tr key={income.id}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>
                    <span className="badges bg-light-success">
                      {income.invoiceNumber || "N/A"}
                    </span>
                  </td>
                  <td>{income.name}</td>
                  <td className="text-capitalize">{income.categoryName}</td>
                  <td>
                    <span className="badges bg-light-info">
                      {formatDate(income.date)}
                    </span>
                  </td>
                  <td>{income.amount}</td>
                  <td>
                    {income.attachment ? (
                      <button
                        className="btn btn-link"
                        onClick={() => downloadAttachment(income.attachment)}
                      >
                        Download
                      </button>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    <span className="badges bg-light-info">
                      {formatDate(income.created_at)}
                    </span>
                  </td>
                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                      <button
                        className="btn"
                        onClick={() => handleEdit(income)}
                      >
                        <i className="text-primary fa fa-edit fa-lg" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deleteIncome"
                        onClick={() => setDeleteId(income.id)}
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
            {Math.min(indexOfLastItem, filteredIncomes.length)} of{" "}
            {filteredIncomes.length} results
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

      {/* Add/Edit Income Modal */}
      <div
        className="modal fade document_modal"
        id="addIncomeModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addIncomeModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-center" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Income" : "New Income"}
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
              <form onSubmit={handleSaveIncome}>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>
                        Income Head: <span className="text-danger">*</span>
                      </label>
                      <Select
                        name="categoryId"
                        options={categories.filter(
                          (cat) => cat.value !== "ALL"
                        )}
                        value={
                          categories.filter(
                            (cat) => cat.value === incomeData.categoryId
                          )[0]
                        }
                        onChange={(selectedOption) =>
                          setIncomeData({
                            ...incomeData,
                            categoryId: selectedOption.value,
                          })
                        }
                        placeholder="Select Income Head"
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
                        value={incomeData.name}
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
                        value={incomeData.date}
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
                        value={incomeData.invoiceNumber}
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
                        value={incomeData.amount}
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
                        value={incomeData.description}
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

      {/* Delete Income Modal */}
      <div
        className="modal fade"
        id="deleteIncome"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteIncome"
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
            <p>Are you sure you want to delete this income?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteIncome}
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

export default Income;
