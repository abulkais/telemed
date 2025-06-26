import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';

const PurchaseMedicine = () => {
  const [purchases, setPurchases] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/purchaseMedicines`);
      const sortedData = res.data.sort(
        (a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime)
      );
      setPurchases(sortedData);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      toast.error("Failed to load purchases");
    }
  };

  const deletePurchase = async () => {
    if (!deleteId) {
      toast.error("Invalid Purchase ID!");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/purchaseMedicines/${deleteId}`);
      setPurchases((prev) => prev.filter((p) => p.id !== deleteId));
      toast.success("Purchase deleted successfully!");
      $("#DeletePurchase").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting purchase!");
    }
  };

  const handleEdit = (id) => {
    navigate(`/purchase-medicine/edit/${id}`);
  };

  const handleView = (id) => {
    navigate(`/purchase-medicine/view/${id}`);
  };

  const handleNewMedicine = () => {
    navigate("/purchase-medicine/create");
  };

  const filterBySearchAndDate = (purchase) => {
    // Filter by search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = (
        (purchase.medicineName && purchase.medicineName.toLowerCase().includes(searchLower)) ||
        (purchase.batchNumber && purchase.batchNumber.toLowerCase().includes(searchLower)) ||
        (purchase.id && purchase.id.toLowerCase().includes(searchLower))
      );
      if (!matchesSearch) return false;
    }

    // Filter by date range
    if (startDate || endDate) {
      const purchaseDate = new Date(purchase.purchaseDate);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && purchaseDate < start) return false;
      if (end && purchaseDate > end) return false;
    }

    return true;
  };

  const filteredPurchases = purchases.filter(filterBySearchAndDate);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const exportToCSV = () => {
    const dataToExport = filteredPurchases.map(purchase => ({
      "Purchase No.": purchase.id,
      "Medicine": purchase.medicineName,
      "Batch Number": purchase.batchNumber,
      "Expiry Date": formatDate(purchase.expiryDate),
      "Quantity": purchase.quantity,
      "Purchase Price": purchase.purchasePrice,
      "Sale Price": purchase.salePrice,
      "Tax": `${purchase.tax}%`,
      "Amount": purchase.amount,
      "Discount": purchase.discount,
      "Tax Amount": purchase.taxAmount,
      "Net Amount": purchase.netAmount,
      "Payment Mode": purchase.paymentMode,
      "Purchase Date": formatDate(purchase.purchaseDate)
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Purchases");
    
    let fileName = "Purchases";
    if (startDate || endDate) {
      const startStr = startDate ? new Date(startDate).toISOString().split('T')[0] : "";
      const endStr = endDate ? new Date(endDate).toISOString().split('T')[0] : "";
      fileName += `_${startStr}_to_${endStr}`;
    }
    fileName += ".xlsx";
    
    XLSX.writeFile(wb, fileName);
  };

  const clearDateFilters = () => {
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link to="/medicnies-categories" className="doctor-nav-btn">
            <span className="btn-text">Medicine Categories</span>
          </Link>

          <Link to="/medicine-brands" className="doctor-nav-btn">
            <span className="btn-text">Medicine Brands</span>
          </Link>

          <Link to="/medicine" className="doctor-nav-btn">
            <span className="btn-text">Medicine</span>
          </Link>

          <Link to="/purchase-medicine" className="doctor-nav-btn active">
            <span className="btn-text">Purchase Medicine</span>
          </Link>

          <Link to="/used-medicine" className="doctor-nav-btn">
            <span className="btn-text">Used Medicine</span>
          </Link>

          <Link to="/medicine-bills" className="doctor-nav-btn">
            <span className="btn-text">Medicine Bills</span>
          </Link>
        </div>
      </div>
      <div className="filter-bar-container">
        <div className="filter-search-box">
          <input
            type="text"
            className="form-control"
            placeholder="Search purchases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="date-filter-container">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start Date"
              className="form-control date-picker"
              dateFormat="yyyy-MM-dd"
            />
            <span className="mx-2">to</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End Date"
              className="form-control date-picker"
              dateFormat="yyyy-MM-dd"
            />
            {(startDate || endDate) && (
              <button 
                className="btn btn-sm btn-outline-secondary ml-2"
                onClick={clearDateFilters}
              >
                Clear
              </button>
            )}
          </div>

          <button
            className="btn btn-success"
            onClick={exportToCSV}
            disabled={filteredPurchases.length === 0}
          >
            <FileDownloadIcon /> Export
          </button>

          <button
            className="filter-btn filter-btn-primary"
            onClick={handleNewMedicine}
          >
            New Purchase
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>Purchase No.</th>
              <th>Medicine</th>
              <th>Batch Number</th>
              <th>Expiry Date</th>
              <th>Quantity</th>
              <th>Purchase Price</th>
              <th>Sale Price</th>
              <th>Net Amount</th>
              <th>Purchase Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((purchase, index) => (
                <tr key={index}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{purchase.medicineName}</td>
                  <td>{purchase.batchNumber}</td>
                  <td>{formatDate(purchase.expiryDate)}</td>
                  <td>{purchase.quantity}</td>
                  <td>${purchase.purchasePrice}</td>
                  <td>${purchase.salePrice}</td>
                  <td>${purchase.netAmount}</td>
                  <td>{formatDate(purchase.purchaseDate)}</td>
                  <td>
                    <div className="d-flex justify-center items-center" style={{ justifyContent: "center", gap: "10px" }}>
                      <button className="btn" onClick={() => handleView(purchase.id)}>
                        <VisibilityIcon className="text-info" />
                      </button>
                      <button className="btn" onClick={() => handleEdit(purchase.id)}>
                        <EditIcon className="text-primary" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#DeletePurchase"
                        onClick={() => setDeleteId(purchase.id)}
                      >
                        <DeleteIcon className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-4">
                  No purchases found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination controls */}
        {filteredPurchases.length > 0 && (
          <div className="d-flex justify-content-between align-items-center mt-5">
            <div>
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredPurchases.length)} of{" "}
              {filteredPurchases.length} results
            </div>
            <nav>
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ArrowBackIosIcon />
                  </button>
                </li>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(number)}
                    >
                      {number}
                    </button>
                  </li>
                ))}

                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
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
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <div className="modal fade" id="DeletePurchase" tabIndex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog modal-sm modal-dialog-centered" role="document">
          <div className="modal-content text-center">
            <span className="modal-icon">
              <img src="https://hms.infyom.com/assets/images/remove.png" alt="" />
            </span>
            <h2>Delete</h2>
            <p>Are you sure want to delete this Purchase?</p>
            <div className="d-flex">
              <button className="btn btn-danger w-100 mr-1" onClick={deletePurchase}>
                Yes, Delete
              </button>
              <button className="btn btn-secondary w-100 ml-1" data-dismiss="modal">
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseMedicine;