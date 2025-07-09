import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Preloader from "../preloader";
import "../../assets/Patients.css"; // Reusing existing CSS for consistency

const InventoriesCategories = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [updateCategory, setUpdateCategory] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const baseurl = "http://localhost:8080";

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${baseurl}/api/inventoriesCategories`);
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateOrUpdateCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      if (updateCategory) {
        // Update existing category
        await axios.put(`${baseurl}/api/inventoriesCategories/${updateCategory.id}`, {
          name: categoryName.trim(),
        });
        toast.success("Category updated successfully");
      } else {
        // Create new category
        await axios.post(`${baseurl}/api/inventoriesCategories`, {
          name: categoryName.trim(),
        });
        toast.success("Category created successfully");
      }
      fetchCategories();
      $("#categoryModal").modal("hide");
      setCategoryName("");
      setUpdateCategory(null);
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(error.response?.data?.error || "Failed to save category");
    }
  };

  const handleUpdate = (category) => {
    setUpdateCategory(category);
    setCategoryName(category.name);
    $("#categoryModal").modal("show");
  };

  const handleDelete = async () => {
    if (!deleteId) {
      toast.error("Invalid Category ID!");
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`${baseurl}/api/inventoriesCategories/${deleteId}`);
      setCategories((prev) => prev.filter((category) => category.id !== deleteId));
      toast.success("Category deleted successfully!");
      $("#deleteCategory").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.error || "Error deleting category!");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          
          <Link to="/inventories-categories" className="doctor-nav-btn active">
            <span className="btn-text">Inventories Categories</span>
          </Link>

          <Link to="/items" className="doctor-nav-btn">
            <span className="btn-text">Items</span>
          </Link>


          <Link to="/item-stocks" className="doctor-nav-btn">
            <span className="btn-text">Item Stocks</span>
          </Link>

          <Link to="/issued-items" className="doctor-nav-btn">
            <span className="btn-text">Issued Items</span>
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
            placeholder="Search categories"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          className="filter-btn filter-btn-primary"
          data-toggle="modal"
          data-target="#categoryModal"
          onClick={() => {
            setUpdateCategory(null);
            setCategoryName("");
          }}
        >
          New Category
        </button>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>S.N</th>
              <th>Category Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category, index) => (
                <tr key={category.id}>
                  <td>{index + 1}</td>
                  <td>{category.name}</td>
                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                      <button
                        className="btn"
                        onClick={() => handleUpdate(category)}
                      >
                        <i className=" fa fa-edit fa-lg text-primary" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deleteCategory"
                        onClick={() => setDeleteId(category.id)}
                      >
                        <DeleteIcon className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">
                  <Preloader />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Combined Create/Update Category Modal */}
      <div
        className="modal fade"
        id="categoryModal"
        tabIndex="-1"
        role="dialog"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-md modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {updateCategory ? "Update Category" : "Create Category"}
              </h5>
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
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary px-3"
                data-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateOrUpdateCategory}
              >
                {updateCategory ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div
        className="modal fade"
        id="deleteCategory"
        tabIndex="-1"
        role="dialog"
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
                alt="Remove Icon"
              />
            </span>
            <h2>Delete</h2>
            <p>Are you sure you want to delete this category?</p>
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

export default InventoriesCategories;