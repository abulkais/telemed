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

const DiagnosisCategories = () => {
  const [diagnosisCategoriesData, setDiagnosisCategoriesData] = useState([]);
  const [excelLoading, setExcelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [diagnosisCategory, setDiagnosisCategory] = useState({
    name: "",
    description: "",
  });
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("DiagnosisCategory");
  const [dateFilter, setDateFilter] = useState({
    start: null,
    end: null,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDiagnosisCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!diagnosisCategory.name) {
      toast.error("Diagnosis Category name is required");
      return false;
    }


     // Check for duplicate department name (case insensitive)
     const isDuplicate = diagnosisCategoriesData.some(
        type => type.name.toLowerCase() === diagnosisCategory.name.toLowerCase() && 
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
    const newId = String(diagnosisCategoriesData.length + 1).padStart(2, "0");
    const diagnosisCategoryId = String(
      diagnosisCategoriesData.length + 1
    ).padStart(2, "0");

    const newDiagnosisCategory = {
      ...diagnosisCategory,
      id: newId,
      diagnosisCategoryId: diagnosisCategoryId,
      created_at: currentDate,
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/diagnosisCategories/${editId}`,
          newDiagnosisCategory
        );
        toast.success("Diagnosis Category Updated Successfully");
      } else {
        await axios.post(
          `http://localhost:8080/api/diagnosisCategories`,
          newDiagnosisCategory
        );
        toast.success("Diagnosis Category Added Successfully");
      }
      fetchDiagnosisCategory();
      resetForm();
      $("#addDiagnosisCategory").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving Diagnosis Category");
    }
  };

  const resetForm = () => {
    setDiagnosisCategory({
      name: "",
      description: "",
    });
    setEditing(false);
    setEditId(null);
  };

  const fetchDiagnosisCategory = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/diagnosisCategories`);
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setDiagnosisCategoriesData(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching Diagnosis Category:", error);
      toast.error("Failed to load Diagnosis Category");
    }
  };

  const deleteDiagnosisCategory = async () => {
    if (!deleteId) {
      toast.error("Invalid Diagnosis Category ID!");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8080/api/diagnosisCategories/${deleteId}`
      );
      setDiagnosisCategoriesData((prev) =>
        prev.filter((type) => type.id !== deleteId)
      );
      toast.success("Diagnosis Category  deleted successfully!");
      $("#deleteDiagnosisCategory").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Diagnosis Category!");
    }
  };

  const handleEdit = (type) => {
    setEditing(true);
    setEditId(type.id);
    setDiagnosisCategory({
      name: type.name,
      description: type.description,
    });
    $("#addDiagnosisCategory").modal("show");
  };

  const downloadCSV = () => {
    setExcelLoading(true);

    let dataToExport;
    let fileName;

    if (dateFilter.start && !dateFilter.end) {
      dataToExport = diagnosisCategoriesData.filter((doc) => {
        const docDate = new Date(doc.created_at);
        const filterDate = new Date(dateFilter.start);

        return (
          docDate.getDate() === filterDate.getDate() &&
          docDate.getMonth() === filterDate.getMonth() &&
          docDate.getFullYear() === filterDate.getFullYear()
        );
      });
      fileName = `Diagnosis_Category_${new Date(dateFilter.start)
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else if (dateFilter.start || dateFilter.end || searchQuery) {
      dataToExport = diagnosisCategoriesData
        
        .filter(filterBySearch);
      fileName = `Diagnosis_Category_Filtered_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else {
      dataToExport = diagnosisCategoriesData;
      fileName = `Diagnosis_Category_All_Data_${new Date()
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
        "Diagnosis Category ID": "Diagnosis Category ID",
        "Diagnosis Category Name": "Diagnosis Category Name",
        Description: "Description",
        "Date & Time": "Date & Time",
      },
      ...dataToExport.map((type) => ({
        "Diagnosis Category ID": type.diagnosisCategoryId,
        "Diagnosis Category Name": type.name,
        Description: type.description,
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
      (doc.description &&
        doc.description.toLowerCase().includes(searchLower)) ||
      (doc.diagnosisCategoryId &&
        doc.diagnosisCategoryId.toLowerCase().includes(searchLower))
    );
  };

  const filteredDiagnosisCategories = diagnosisCategoriesData
    .filter(filterBySearch);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDiagnosisCategories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(
    filteredDiagnosisCategories.length / itemsPerPage
  );

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
    fetchDiagnosisCategory();
  }, []);

  return (
    <div>
      <ToastContainer />

      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link
            to="/diagnosis-categories"
            className={`doctor-nav-btn ${
              filter === "DiagnosisCategory" ? "active" : ""
            }`}
            onClick={() => setFilter("DiagnosisCategory")}
          >
            <span className="btn-text">Diagnosis Category</span>
          </Link>
          <Link
            to="/diagnosis-tests"
            className={`doctor-nav-btn ${
              filter === "DiagnosisTests" ? "active" : ""
            }`}
            onClick={() => setFilter("DiagnosisTests")}
          >
            <span className="btn-text">Diagnosis Tests</span>
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
            data-target="#addDiagnosisCategory"
            onClick={resetForm}
          >
            New Diagnosis Category
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
              <th>Diagnosis Category </th>

              <th>Date & Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((type, index) => (
              <tr key={index}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>
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
                      data-target="#deleteDiagnosisCategory"
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
            {Math.min(indexOfLastItem, filteredDiagnosisCategories.length)} of{" "}
            {filteredDiagnosisCategories.length} results
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

      {/* Add/Edit Diagnosis Category Modal */}
      <div
        className="modal fade document_modal"
        id="addDiagnosisCategory"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addDiagnosisCategory"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-lg modal-center"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Diagnosis Category" : "New Diagnosis Category"}
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
                  Diagnosis Category: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Diagnosis Category"
                  value={diagnosisCategory.name}
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={diagnosisCategory.description}
                  className="form-control"
                  onChange={handleChange}
                  rows="3"
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
        id="deleteDiagnosisCategory"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteDiagnosisCategory"
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
            <p>Are you sure want to delete this Diagnosis Category?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteDiagnosisCategory}
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

export default DiagnosisCategories;
