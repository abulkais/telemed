import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import DeleteIcon from "@mui/icons-material/Delete";
import Preloader from "../preloader";
import "../../assets/Patients.css";

const InventoriesItems = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [itemName, setItemName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [unit, setUnit] = useState("");
  const [description, setDescription] = useState("");
  const [updateItem, setUpdateItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const baseurl = "http://localhost:8080";

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${baseurl}/api/inventoriesItems`);
      const itemsData = res.data;
      // Fetch quantities for each item
      const itemsWithQuantity = await Promise.all(
        itemsData.map(async (item) => {
          try {
            const stockRes = await axios.get(
              `${baseurl}/api/inventoriesItemStocks`
            );
            const totalQuantity = stockRes.data
              .filter((stock) => stock.itemId === item.id)
              .reduce((sum, stock) => sum + stock.quantity, 0);
            return { ...item, availableQuantity: totalQuantity };
          } catch (error) {
            console.error(`Error fetching quantity for item ${item.id}:`, error);
            return { ...item, availableQuantity: 0 };
          }
        })
      );
      setItems(itemsWithQuantity);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to load items");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${baseurl}/api/inventoriesCategories`);
      const categoryOptions = res.data.map((category) => ({
        value: category.id,
        label: category.name,
      }));
      setCategories(categoryOptions);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const handleCreateOrUpdateItem = async () => {
    if (!itemName.trim() || !selectedCategory || !unit.trim()) {
      toast.error("Name, category, and unit are required");
      return;
    }

    try {
      const itemData = {
        name: itemName.trim(),
        itemCategoryId: selectedCategory.value,
        unit: unit.trim(),
        description: description.trim() || null,
      };

      if (updateItem) {
        // Update existing item
        await axios.put(
          `${baseurl}/api/inventoriesItems/${updateItem.id}`,
          itemData
        );
        toast.success("Item updated successfully");
      } else {
        // Create new item
        await axios.post(`${baseurl}/api/inventoriesItems`, itemData);
        toast.success("Item created successfully");
      }
      fetchItems();
      $("#itemModal").modal("hide");
      setItemName("");
      setSelectedCategory(null);
      setUnit("");
      setDescription("");
      setUpdateItem(null);
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error(error.response?.data?.error || "Failed to save item");
    }
  };

  const handleUpdate = (item) => {
    setUpdateItem(item);
    setItemName(item.name);
    setSelectedCategory(
      categories.find((category) => category.value === item.itemCategoryId) ||
        null
    );
    setUnit(item.unit);
    setDescription(item.description || "");
    $("#itemModal").modal("show");
  };

  const handleDelete = async () => {
    if (!deleteId) {
      toast.error("Invalid Item ID!");
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`${baseurl}/api/inventoriesItems/${deleteId}`);
      setItems((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Item deleted successfully!");
      $("#deleteItem").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.error || "Error deleting item!");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unit?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link to="/inventories-categories" className="doctor-nav-btn ">
            <span className="btn-text">Inventories Categories</span>
          </Link>

          <Link to="/items" className="doctor-nav-btn active">
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
        style={{ display: "flex", alignItems: "center", gap: "10px" }}
      >
        <div className="filter-search-box" style={{ flex: 1 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search items"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          className="filter-btn filter-btn-primary"
          data-toggle="modal"
          data-target="#itemModal"
          onClick={() => {
            setUpdateItem(null);
            setItemName("");
            setSelectedCategory(null);
            setUnit("");
            setDescription("");
          }}
        >
          New Item
        </button>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>S.N</th>
              <th>Name</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Available Quantity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.categoryName}</td>
                  <td><span className="badges bg-light-success">{item.unit}</span></td>

                  <td><span className="badges bg-light-info">{item.availableQuantity}</span></td>

                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                      <button
                        className="btn"
                        onClick={() => handleUpdate(item)}
                      >
                        <i className="fa fa-edit fa-lg text-primary" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deleteItem"
                        onClick={() => setDeleteId(item.id)}
                      >
                        <DeleteIcon className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  <Preloader />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Combined Create/Update Item Modal */}
      <div
        className="modal fade"
        id="itemModal"
        tabIndex="-1"
        role="dialog"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-lg modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {updateItem ? "Update Item" : "Create Item"}
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
                <label>Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Enter item name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <Select
                  options={categories}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="Select a category"
                  required
                />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <input
                  type="text"
                  className="form-control"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Enter unit (e.g., kg, pcs)"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description (optional)"
                  rows="4"
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
                onClick={handleCreateOrUpdateItem}
              >
                {updateItem ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div
        className="modal fade"
        id="deleteItem"
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
            <p>Are you sure you want to delete this item?</p>
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

export default InventoriesItems;
