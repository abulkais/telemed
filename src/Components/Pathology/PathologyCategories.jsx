import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";

const PathologyCategories = () => {
  const [pathologyCategories, setPathologyCategories] = useState([]);
  const [pathologyCategory, setPathologyCategory] = useState({
    name: "",
    description: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [excelLoading, setExcelLoading] = useState(false);

  const fetchPathologyCategories = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/pathologyCategories`);
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setPathologyCategories(sortedData);
    } catch (error) {
      console.error("Error fetching Pathology Categories:", error);
      toast.error("Failed to load Pathology Categories");
    }
  };

  useEffect(() => {
    fetchPathologyCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPathologyCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!pathologyCategory.name) {
      toast.error("Name is required");
      return false;
    }


     // Check for duplicate Pathology Category by name
  const isDuplicate = pathologyCategories.some(
    (item) =>
      item.name.toLowerCase() === pathologyCategory.name.toLowerCase() &&
      (!editing || item.id !== editId)
  );
  if (isDuplicate) {
    toast.error("A Pathology Category with this name already exists.");
    return false;
  }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    const newPathologyCategory = {
      ...pathologyCategory,
      created_at: currentDate,
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/pathologyCategories/${editId}`,
          newPathologyCategory
        );
        toast.success("Pathology Category Updated");
      } else {
        await axios.post(
          `http://localhost:8080/api/pathologyCategories`,
          newPathologyCategory
        );
        toast.success("Pathology Category Added");
      }
      fetchPathologyCategories();
      resetForm();
      $("#addPathologyCategory").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving Pathology Category");
    }
  };

  const resetForm = () => {
    setPathologyCategory({
      name: "",
      description: "",
    });
    setEditing(false);
    setEditId(null);
  };

  const deletePathologyCategory = async () => {
    if (!deleteId) {
      toast.error("Invalid Pathology Category ID!");
      return;
    }
    try {
      await axios.delete(
        `http://localhost:8080/api/pathologyCategories/${deleteId}`
      );
      setPathologyCategories((prev) =>
        prev.filter((item) => item.id !== deleteId)
      );
      toast.success("Pathology Category deleted successfully!");
      $("#deletePathologyCategory").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Pathology Category!");
    }
  };

  const handleEdit = (item) => {
    setEditing(true);
    setEditId(item.id);
    setPathologyCategory({
      name: item.name,
      description: item.description,
    });
    $("#addPathologyCategory").modal("show");
  };

  const downloadExcel = () => {
    setExcelLoading(true);

    let dataToExport = filteredPathologyCategories;
    let fileName = `PathologyCategories_${new Date()
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
        Description: "Description",
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pathology_Categories");
    XLSX.writeFile(workbook, fileName);
    setExcelLoading(false);
    toast.success(`Report downloaded (${dataToExport.length} records)`);
  };

  const filterBySearch = (item) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(searchLower);
  };

  const filteredPathologyCategories =
    pathologyCategories.filter(filterBySearch);

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
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    return `${day} ${month}, ${year} ${hours}:${minutes}`;
  };

  return (
    <div>
      <ToastContainer />

      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link
            to="/pathology-categories"
            className={`doctor-nav-btn active`}
            onClick={() => {}}
          >
            Pathology Categories
          </Link>
          <Link
            to="/pathology-units"
            className={`doctor-nav-btn`}
            onClick={() => {}}
          >
            Pathology Units
          </Link>
          <Link
            to="/pathology-parameters"
            className={`doctor-nav-btn `}
            onClick={() => {}}
          >
            Pathology Parameters
          </Link>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by Category Name"
          style={{ width: "250px" }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="d-flex justify-content-between align-items-center">
          <button
            className="btn btn-primary ml-2"
            data-toggle="modal"
            data-target="#addPathologyCategory"
            onClick={resetForm}
          >
            New Pathology Category
          </button>

          <button
            className="btn btn-success ml-2"
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
              <th>Description</th>
              <th>Created Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPathologyCategories.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.description ? item.description : " NA"}</td>
                <td>
                  <span className="badges bg-light-info">
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
                      data-target="#deletePathologyCategory"
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
        id="addPathologyCategory"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addPathologyCategory"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-lg modal-center"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Pathology Category" : "New Pathology Category"}
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
                  value={pathologyCategory.name}
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  placeholder="Enter Description"
                  value={pathologyCategory.description}
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
        id="deletePathologyCategory"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deletePathologyCategory"
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
            <p>Are you sure want to delete this Pathology Category?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deletePathologyCategory}
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

export default PathologyCategories;
