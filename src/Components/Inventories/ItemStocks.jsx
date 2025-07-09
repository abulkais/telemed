import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Preloader from "../preloader";
import "../../assets/Patients.css";

const ItemStocks = () => {
  const [stocks, setStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const baseurl = "http://localhost:8080";

  const fetchStocks = async () => {
    try {
      const res = await axios.get(`${baseurl}/api/inventoriesItemStocks`);
      setStocks(res.data);
    } catch (error) {
      console.error("Error fetching item stocks:", error);
      toast.error("Failed to load item stocks");
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) {
      toast.error("Invalid Item Stock ID!");
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(`${baseurl}/api/inventoriesItemStocks/${deleteId}`);
      setStocks((prev) => prev.filter((stock) => stock.id !== deleteId));
      toast.success("Item stock deleted successfully!");
      $("#deleteStock").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.error || "Error deleting item stock!");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredStocks = stocks.filter(
    (stock) =>
      stock.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.storeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link to="/inventories-categories" className="doctor-nav-btn ">
            <span className="btn-text">Inventories Categories</span>
          </Link>

          <Link to="/items" className="doctor-nav-btn">
            <span className="btn-text">Items</span>
          </Link>

          <Link to="/item-stocks" className="doctor-nav-btn active">
            <span className="btn-text">Item Stocks</span>
          </Link>

          <Link to="/issued-items" className="doctor-nav-btn ">
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
            placeholder="Search item stocks"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          className="filter-btn filter-btn-primary"
          onClick={() => navigate("/item-stocks/create")}
        >
          New Item Stock
        </button>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>S.N</th>
              <th>Item Name</th>
              <th>Item Category </th>
              <th>Quantity</th>
              <th>Purchase Price</th>
              <th>Created On </th>
              <th>Attachment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock, index) => (
                <tr key={stock.id}>
                  <td>{index + 1}</td>
                  <td>{stock.itemName}</td>
                  <td>{stock.categoryName}</td>
                  <td>
                    <span className="badges bg-light-success">
                      {stock.quantity}
                    </span>
                  </td>
                  <td>{stock.purchasePrice}</td>
                  <td><span className="badges bg-light-info">{formatDate(stock.created_at)}</span></td>
                  <td>
                    {stock.attachment ? (
                      <a
                        href={stock.attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                      <button
                        className="btn"
                        onClick={() =>
                          navigate(`/item-stocks/${stock.id}/edit`)
                        }
                      >
                        <i className="fa fa-edit fa-lg text-primary" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deleteStock"
                        onClick={() => setDeleteId(stock.id)}
                      >
                        <DeleteIcon className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11">
                  <Preloader />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <div
        className="modal fade"
        id="deleteStock"
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
            <p>Are you sure you want to delete this item stock?</p>
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

export default ItemStocks;
