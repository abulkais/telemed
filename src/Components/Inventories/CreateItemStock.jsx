import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import "../../assets/Documents.css";

const CreateItemStock = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [stockData, setStockData] = useState({
    itemCategoryId: null,
    itemId: null,
    supplierName: "",
    storeName: "",
    quantity: "",
    purchasePrice: "",
    description: "",
    attachment: null,
  });
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const baseurl = "http://localhost:8080";

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

  const fetchItemsByCategory = async (categoryId) => {
    try {
      const res = await axios.get(`${baseurl}/api/inventoriesItems/byCategory/${categoryId}`);
      const itemOptions = res.data.map((item) => ({
        value: item.id,
        label: item.name,
      }));
      setItems(itemOptions);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to load items");
      setItems([]);
    }
  };

  const fetchStock = async () => {
    try {
      const res = await axios.get(`${baseurl}/api/inventoriesItemStocks`);
      const stock = res.data.find((s) => s.id === parseInt(id));
      if (!stock) {
        toast.error("Item stock not found");
        return;
      }
      setStockData({
        itemCategoryId: stock.itemCategoryId,
        itemId: stock.itemId,
        supplierName: stock.supplierName,
        storeName: stock.storeName,
        quantity: stock.quantity,
        purchasePrice: stock.purchasePrice,
        description: stock.description || "",
        attachment: stock.attachment || null,
      });
      if (stock.itemCategoryId) {
        await fetchItemsByCategory(stock.itemCategoryId);
      }
    } catch (error) {
      console.error("Error fetching stock:", error);
      toast.error("Failed to load stock");
    }
  };

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchStock();
    }
  }, [isEditMode, id]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setStockData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleCategoryChange = async (selectedOption) => {
    setStockData((prev) => ({
      ...prev,
      itemCategoryId: selectedOption ? selectedOption.value : null,
      itemId: null, // Reset item selection
    }));
    setItems([]); // Clear items
    if (selectedOption) {
      await fetchItemsByCategory(selectedOption.value);
    }
  };

  const handleItemChange = (selectedOption) => {
    setStockData((prev) => ({
      ...prev,
      itemId: selectedOption ? selectedOption.value : null,
    }));
  };

  const validateForm = () => {
    if (!stockData.itemCategoryId) {
      toast.error("Item category is required");
      return false;
    }
    if (!stockData.itemId) {
      toast.error("Item name is required");
      return false;
    }
    if (!stockData.supplierName.trim()) {
      toast.error("Supplier name is required");
      return false;
    }
    if (!stockData.storeName.trim()) {
      toast.error("Store name is required");
      return false;
    }
    if (!stockData.quantity || stockData.quantity <= 0) {
      toast.error("Valid quantity is required");
      return false;
    }
    if (!stockData.purchasePrice || stockData.purchasePrice <= 0) {
      toast.error("Valid purchase price is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("itemCategoryId", stockData.itemCategoryId);
    formData.append("itemId", stockData.itemId);
    formData.append("supplierName", stockData.supplierName.trim());
    formData.append("storeName", stockData.storeName.trim());
    formData.append("quantity", stockData.quantity);
    formData.append("purchasePrice", stockData.purchasePrice);
    formData.append("description", stockData.description.trim() || "");
    if (stockData.attachment && typeof stockData.attachment !== "string") {
      formData.append("attachment", stockData.attachment);
    } else if (stockData.attachment) {
      formData.append("existingAttachment", stockData.attachment);
    }

    try {
      if (isEditMode) {
        await axios.put(`${baseurl}/api/inventoriesItemStocks/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Item stock updated successfully");
      } else {
        await axios.post(`${baseurl}/api/inventoriesItemStocks`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Item stock created successfully");
      }
      setTimeout(() => navigate("/item-stocks"), 2000);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.error || "Error saving item stock");
    }
  };

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">{isEditMode ? "Edit Item Stock" : "New Item Stock"}</h1>
            <button
              className="btn btn-outline-primary px-4"
              onClick={() => navigate("/item-stocks")}
            >
              Back
            </button>
          </div>

          <div className="card p-4 border-0">
            <div className="row">
             
              <div className="form-group col-md-4">
                <label>Item Category: <span className="text-danger">*</span></label>
                <Select
                  options={categories}
                  value={categories.find((c) => c.value === stockData.itemCategoryId)}
                  onChange={handleCategoryChange}
                  placeholder="Select a category"
                />
              </div>
              <div className="form-group col-md-4">
                <label>Item Name: <span className="text-danger">*</span></label>
                <Select
                  options={items}
                  value={items.find((i) => i.value === stockData.itemId)}
                  onChange={handleItemChange}
                  placeholder="Select an item"
                  isDisabled={!stockData.itemCategoryId || items.length === 0}
                />
                {!stockData.itemCategoryId && (
                  <small className="text-muted">Select a category first</small>
                )}
                {stockData.itemCategoryId && items.length === 0 && (
                  <small className="text-danger">No items available for this category</small>
                )}
              </div>
              <div className="form-group col-md-4">
                <label>Supplier Name: <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="supplierName"
                  placeholder="Supplier Name"
                  value={stockData.supplierName}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Store Name: <span className="text-danger">*</span></label>
                <input
                  type="text"
                  name="storeName"
                  placeholder="Store Name"
                  value={stockData.storeName}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Quantity: <span className="text-danger">*</span></label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  value={stockData.quantity}
                  className="form-control"
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
              <div className="form-group col-md-4">
                <label>Purchase Price: <span className="text-danger">*</span></label>
                <input
                  type="number"
                  name="purchasePrice"
                  placeholder="Purchase Price"
                  value={stockData.purchasePrice}
                  className="form-control"
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="form-group col-md-12">
                <label>Description:</label>
                <textarea
                  type="text"
                  name="description"
                  placeholder="Description (optional)"
                  value={stockData.description}
                  className="form-control"
                  onChange={handleInputChange}
                  rows="5"
                />
              </div>
              <div className="form-group col-md-6">
                <label>Attachment:</label> <br />
                <div className="profile-picture-upload">
                  <label
                    htmlFor="attachment-upload"
                    className="profile-picture-container"
                  >
                    {stockData.attachment ? (
                      <>
                        <span className="attachment-preview">
                          {typeof stockData.attachment === "string"
                            ? stockData.attachment.split('/').pop()
                            : stockData.attachment.name}
                        </span>
                        <div className="edit-overlay">
                          <i className="fas fa-pencil-alt"></i>
                        </div>
                      </>
                    ) : (
                      <div className="empty-profile">
                        <i className="fa fa-upload"></i>
                      </div>
                    )}
                  </label>
                  <input
                    id="attachment-upload"
                    accept="image/*,.pdf"
                    type="file"
                    name="attachment"
                    className="d-none"
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-primary mr-2 px-4"
                onClick={handleSubmit}
              >
                {isEditMode ? "Update" : "Save"}
              </button>
              <button
                type="button"
                className="btn btn-secondary px-4"
                onClick={() => navigate("/item-stocks")}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateItemStock;