import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import * as XLSX from "xlsx";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const FinanceCategories = () => {
  const [FinanceCategoriesData, setFinanceCategoriesData] = useState([]);
  const [excelLoading, setExcelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [FinanceCategory, setFinanceCategory] = useState({
    name: "",
  });
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    start: null,
    end: null,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFinanceCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!FinanceCategory.name) {
      toast.error("Finance Category name is required");
      return false;
    }

    // Check for duplicate department name (case insensitive)
    const isDuplicate = FinanceCategoriesData.some(
      (type) =>
        type.name.toLowerCase() === FinanceCategory.name.toLowerCase() &&
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
    const newId = String(FinanceCategoriesData.length + 1).padStart(2, "0");
    const FinanceCategoryId = String(FinanceCategoriesData.length + 1).padStart(
      2,
      "0"
    );

    const newFinanceCategory = {
      ...FinanceCategory,
      id: newId,
      FinanceCategoryId: FinanceCategoryId,
      created_at: currentDate,
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/financeCategories/${editId}`,
          newFinanceCategory
        );
        toast.success("Finance Category Updated Successfully");
      } else {
        await axios.post(
          `http://localhost:8080/api/financeCategories`,
          newFinanceCategory
        );
        toast.success("Finance Category Added Successfully");
      }
      fetchFinanceCategory();
      resetForm();
      $("#addFinanceCategory").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving Finance Category");
    }
  };

  const resetForm = () => {
    setFinanceCategory({
      name: "",
    });
    setEditing(false);
    setEditId(null);
  };

  const fetchFinanceCategory = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/financeCategories`
      );
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setFinanceCategoriesData(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching Finance Category:", error);
      toast.error("Failed to load Finance Category");
    }
  };

  const deleteFinanceCategory = async () => {
    if (!deleteId) {
      toast.error("Invalid Finance Category ID!");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8080/api/financeCategories/${deleteId}`
      );
      setFinanceCategoriesData((prev) =>
        prev.filter((type) => type.id !== deleteId)
      );
      toast.success("Finance Category  deleted successfully!");
      $("#deleteFinanceCategory").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Finance Category!");
    }
  };

  const handleEdit = (type) => {
    setEditing(true);
    setEditId(type.id);
    setFinanceCategory({
      name: type.name,
    });
    $("#addFinanceCategory").modal("show");
  };

  const downloadCSV = () => {
    setExcelLoading(true);

    let dataToExport;
    let fileName;

    if (dateFilter.start && !dateFilter.end) {
      dataToExport = FinanceCategoriesData.filter((doc) => {
        const docDate = new Date(doc.created_at);
        const filterDate = new Date(dateFilter.start);

        return (
          docDate.getDate() === filterDate.getDate() &&
          docDate.getMonth() === filterDate.getMonth() &&
          docDate.getFullYear() === filterDate.getFullYear()
        );
      });
      fileName = `Finance_Category_${new Date(dateFilter.start)
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else if (dateFilter.start || dateFilter.end || searchQuery) {
      dataToExport = FinanceCategoriesData.filter(filterBySearch);
      fileName = `Finance_Category_Filtered_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else {
      dataToExport = FinanceCategoriesData;
      fileName = `Finance_Category_All_Data_${new Date()
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
        "Finance Category ID": "Finance Category ID",
        "Finance Category Name": "Finance Category Name",
        "Date & Time": "Date & Time",
      },
      ...dataToExport.map((type) => ({
        "Finance Category ID": type.FinanceCategoryId,
        "Finance Category Name": type.name,
        "Date & Time": formatDate(type.created_at),
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    worksheet["!cols"] = [{ wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 20 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Bed_Types_Filtered_ Report"
    );
    XLSX.writeFile(workbook, fileName);
    setExcelLoading(false);
    toast.success(`Report downloaded (${dataToExport.length} records)`);
  };

  const filterBySearch = (doc) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      (doc.name && doc.name.toLowerCase().includes(searchLower)) ||
      (doc.FinanceCategoryId &&
        doc.FinanceCategoryId.toLowerCase().includes(searchLower))
    );
  };

  const filteredFinanceCategories =
    FinanceCategoriesData.filter(filterBySearch);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFinanceCategories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredFinanceCategories.length / itemsPerPage);

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
    fetchFinanceCategory();
  }, []);

  return (
    <div>
      <ToastContainer />

      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link to="/finance-categories" className="doctor-nav-btn active">
            <span className="btn-text">Finance Category</span>
          </Link>

          <Link to="/income" className="doctor-nav-btn">
            <span className="btn-text">Income</span>
          </Link>
          <Link to="/expenses" className="doctor-nav-btn">
            <span className="btn-text">Expenses</span>
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
            data-target="#addFinanceCategory"
            onClick={resetForm}
          >
            New Finance Category
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
              <th>Finance Category </th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((type, index) => (
              <tr key={index}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td className="text-capitalize">
                  <span className="badges bg-light-success">{type.name}</span>
                </td>

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
                      data-target="#deleteFinanceCategory"
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
            {Math.min(indexOfLastItem, filteredFinanceCategories.length)} of{" "}
            {filteredFinanceCategories.length} results
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

      {/* Add/Edit finance Category Modal */}
      <div
        className="modal fade document_modal"
        id="addFinanceCategory"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addFinanceCategory"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-lg modal-center"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Finance Category" : "New Finance Category"}
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
                  Finance Category: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Finance Category"
                  value={FinanceCategory.name}
                  className="form-control"
                  onChange={handleChange}
                />
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
        id="deleteFinanceCategory"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteFinanceCategory"
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
            <p>Are you sure want to delete this Finance Category?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteFinanceCategory}
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

export default FinanceCategories;
