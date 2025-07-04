import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";

const documentTypes = () => {
  const [documentCategories, setDocumentsCategories] = useState([]);
  const [documentCategory, setDocumentCategory] = useState({
    name: "",
    description: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [excelLoading, setExcelLoading] = useState(false);

  const fetchDocumentsCategories = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/documentTypes`);
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setDocumentsCategories(sortedData);
    } catch (error) {
      console.error("Error fetching Documents Categories:", error);
      toast.error("Failed to load Documents Categories");
    }
  };

  useEffect(() => {
    fetchDocumentsCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDocumentCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!documentCategory.name) {
      toast.error("Name is required");
      return false;
    }

    // Check for duplicate Document Category by name
    const isDuplicate = documentCategories.some(
      (item) =>
        item.name.toLowerCase() === documentCategory.name.toLowerCase() &&
        (!editing || item.id !== editId)
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

    const newDocumentCategory = {
      ...documentCategory,
      created_at: currentDate,
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/documentTypes/${editId}`,
          newDocumentCategory
        );
        toast.success("PatDocumenthology Category Updated");
      } else {
        await axios.post(
          `http://localhost:8080/api/documentTypes`,
          newDocumentCategory
        );
        toast.success("Document Category Added");
      }
      fetchDocumentsCategories();
      resetForm();
      $("#addDocumentsCategory").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving Document Category");
    }
  };

  const resetForm = () => {
    setDocumentCategory({
      name: "",
      description: "",
    });
    setEditing(false);
    setEditId(null);
  };

  const deleteDocumentCategory = async () => {
    if (!deleteId) {
      toast.error("Invalid Document Category ID!");
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/api/documentTypes/${deleteId}`);
      setDocumentsCategories((prev) =>
        prev.filter((item) => item.id !== deleteId)
      );
      toast.success("Document Category deleted successfully!");
      $("#deleteDocumentCategory").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Document Category!");
    }
  };

  const handleEdit = (item) => {
    setEditing(true);
    setEditId(item.id);
    setDocumentCategory({
      name: item.name,
      description: item.description,
    });
    $("#addDocumentsCategory").modal("show");
  };

  const downloadExcel = () => {
    setExcelLoading(true);

    let dataToExport = filteredDocumentsCategories;
    let fileName = `DocumentsCategories_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    if (dataToExport.length === 0) {
      toast.error("No data found to export!");
      setExcelLoading(false);
      return;
    }

    const data = [
      {
        "S.N": "S.N",
        Name: "Name",
        "Created Date": "Created Date",
      },
      ...dataToExport.map((item, index) => ({
        "S.N": index + 1,
        Name: item.name,
        Description: item.description,
        "Created Date": formatDate(item.created_at),
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    worksheet["!cols"] = [{ wch: 5 }, { wch: 20 }, { wch: 40 }, { wch: 20 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Document_Categories");
    XLSX.writeFile(workbook, fileName);
    setExcelLoading(false);
    toast.success(`Report downloaded (${dataToExport.length} records)`);
  };

  const filterBySearch = (item) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(searchLower);
  };

  const filteredDocumentsCategories = documentCategories.filter(filterBySearch);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

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
          <Link to="/documents" className={`doctor-nav-btn`} onClick={() => {}}>
            Documents
          </Link>

          <Link
            to="/documnets-types"
            className={`doctor-nav-btn active`}
            onClick={() => {}}
          >
            Documents Categories
          </Link>
        </div>
      </div>

      <div className="filter-bar-container">
        <div className="filter-search-box">
          <input
            type="text"
            className="form-control"
            placeholder="Search by Category Name"
            style={{ width: "250px" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <button
            className="filter-btn filter-btn-primary mr-2"
            data-toggle="modal"
            data-target="#addDocumentsCategory"
            onClick={resetForm}
          >
            New Document Category
          </button>

          <button
            className="filter-btn filter-btn-primary px-2"
            onClick={downloadExcel}
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
              <th>Name</th>
              {/* <th>Description</th> */}
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocumentsCategories.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                {/* <td>{item.description ? item.description : " NA"}</td> */}
                <td>
                  <span className="badges bg-light-info">
                    {formatTime(item.created_at)} <br />
                    {formatDate(item.created_at)}
                  </span>
                </td>
                <td>
                  <div
                    className="d-flex justify-center items-center"
                    style={{ justifyContent: "center" }}
                  >
                    <button className="btn" onClick={() => handleEdit(item)}>
                      <i className="text-primary fa fa-edit fa-lg" />
                    </button>
                    <button
                      className="btn"
                      data-toggle="modal"
                      data-target="#deleteDocumentCategory"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <DeleteIcon className="text-danger" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="modal fade document_modal"
        id="addDocumentsCategory"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addDocumentsCategory"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-lg modal-center"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Document Category" : "New Document Category"}
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
              <div className="form-group">
                <label>
                  Name: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Category Name"
                  value={documentCategory.name}
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  placeholder="Enter Description"
                  value={documentCategory.description}
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

      <div
        className="modal fade"
        id="deleteDocumentCategory"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteDocumentCategory"
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
            <p>Are you sure want to delete this Document Category?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteDocumentCategory}
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

export default documentTypes;
