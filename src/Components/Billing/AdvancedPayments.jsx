import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Select from "react-select";
import moment from "moment";

const AdvancedPayments = () => {
  const [advancedPayments, setAdvancedPayments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [modalData, setModalData] = useState({
    patientsId: null,
    receiptNo: "",
    amount: "",
    Date: new Date().toISOString().slice(0, 10),
    description: "",
  });
  const [isEdit, setIsEdit] = useState(false);
  const [viewData, setViewData] = useState(null);
  const baseUrl = "http://localhost:8080";

  const fetchAdvancedPayments = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/advanced-payments"
      );
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setAdvancedPayments(sortedData);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Failed to load advanced payments");
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/getPatientsbyStatus"
      );
      setPatients(
        res.data.map((p) => ({
          value: p.id,
          label: `${p.firstName} ${p.lastName} (${p.email})`,
        }))
      );
    } catch (error) {
      toast.error("Failed to load patients");
    }
  };

  useEffect(() => {
    fetchAdvancedPayments();
    fetchPatients();
  }, []);

  const generateReceiptNo = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let receiptNo = "";
    for (let i = 0; i < 8; i++) {
      receiptNo += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return receiptNo;
  };

  const handleAdd = () => {
    setModalData({
      patientsId: null,
      receiptNo: generateReceiptNo(),
      amount: "",
      Date: new Date().toISOString().slice(0, 10),
      description: "",
    });
    setIsEdit(false);
    $("#paymentModal").modal("show");
  };

  const handleEdit = (payment) => {
    setModalData({
      id: payment.id,
      patientsId: { value: payment.patientsId, label: payment.patientName },
      receiptNo: payment.receiptNo,
      amount: payment.amount,
      Date: new Date(payment.Date).toISOString().slice(0, 10),
      description: payment.description || "",
    });
    setIsEdit(true);
    $("#paymentModal").modal("show");
  };

  const handleView = (payment) => {
    setViewData(payment);
    $("#viewModal").modal("show");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!modalData.patientsId || !modalData.amount || !modalData.Date) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      patientsId: modalData.patientsId.value,
      receiptNo: modalData.receiptNo,
      amount: parseFloat(modalData.amount),
      Date: modalData.Date,
      description: modalData.description,
    };

    try {
      if (isEdit) {
        await axios.put(
          `http://localhost:8080/api/advanced-payments/${modalData.id}`,
          payload
        );
        setAdvancedPayments((prev) =>
          prev.map((p) =>
            p.id === modalData.id
              ? { ...p, ...payload, patientName: modalData.patientsId.label }
              : p
          )
        );
        toast.success("Payment updated successfully!");
      } else {
        const res = await axios.post(
          "http://localhost:8080/api/advanced-payments",
          payload
        );
        setAdvancedPayments((prev) => [
          { ...res.data, patientName: modalData.patientsId.label },
          ...prev,
        ]);
        toast.success("Payment added successfully!");
      }
      $("#paymentModal").modal("hide");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save payment");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(
        `http://localhost:8080/api/advanced-payments/${deleteId}`
      );
      setAdvancedPayments((prev) => prev.filter((p) => p.id !== deleteId));
      toast.success("Payment deleted successfully!");
      $("#deleteModal").modal("hide");
    } catch (error) {
      toast.error("Failed to delete payment");
    } finally {
      setIsDeleting(false);
    }
  };

  const filterPayments = (payment) => {
    const matchesSearch = searchQuery
      ? payment.patientName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        payment.receiptNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.amount.toString().includes(searchQuery.toLowerCase())
      : true;
    return matchesSearch;
  };

  const filteredPayments = advancedPayments.filter(filterPayments);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

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
  const getTimeAgo = (date) => {
    return moment(date).fromNow();
  };

  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link to="/account" className="doctor-nav-btn">
            Account
          </Link>
          <Link to="/employee-payrolls" className="doctor-nav-btn">
            Employee Payrolls
          </Link>
          <Link to="/invoices" className="doctor-nav-btn">
            Invoices
          </Link>
          <Link to="/payments" className="doctor-nav-btn">
            Payments
          </Link>
          <Link to="/payment-reports" className="doctor-nav-btn">
            Payment Reports
          </Link>
          <Link to="/advanced-payments" className="doctor-nav-btn active">
            Advance Payments
          </Link>
          <Link to="/bills" className="doctor-nav-btn">
            Bills
          </Link>
          <Link to="/manual-billing-payments" className="doctor-nav-btn">
            Manual Billing Payments
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
            placeholder="Search by Patient or Receipt"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="filter-btn filter-btn-primary" onClick={handleAdd}>
          New Advanced Payment
        </button>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>Receipt No</th>
              <th>Patient</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((payment, index) => (
                <tr key={payment.id}>
                  <td>
                    <span className="badges bg-light-success">
                      {payment.receiptNo}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      {payment.profileImage ? (
                        <img
                          src={`${baseUrl}${payment.profileImage}`}
                          alt={payment.patientName}
                          className="rounded-circle-profile"
                        />
                      ) : (
                        <div
                          className="rounded-circle text-white d-flex align-items-center justify-content-center"
                          style={{
                            width: "50px",
                            height: "50px",
                            backgroundColor: "#1976d2",
                            marginRight: "10px",
                            fontSize: "20px",
                          }}
                        >
                          {payment.patientName?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {payment.patientName}
                        </p>
                        <p className="mb-0">{payment.patientEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td>${payment.amount}</td>
                  <td>
                    <span className="badges bg-light-info">
                      {formatDate(payment.Date)}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center">
                      <button
                        className="btn"
                        onClick={() => handleView(payment)}
                      >
                        <VisibilityIcon className="text-info" />
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleEdit(payment)}
                      >
                        <i className="text-primary fa fa-edit fa-lg" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deleteModal"
                        onClick={() => setDeleteId(payment.id)}
                      >
                        <DeleteIcon className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No payments found</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="d-flex justify-content-between align-items-center mt-5">
          <div>
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredPayments.length)} of{" "}
            {filteredPayments.length} results
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

      {/* Add/Edit Modal */}
      <div
        className="modal fade"
        id="paymentModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="paymentModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="paymentModalLabel">
                {isEdit ? "Edit Advanced Payment" : "Add Advanced Payment"}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>
                    Patient <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={patients}
                    value={modalData.patientsId}
                    onChange={(selected) =>
                      setModalData((prev) => ({
                        ...prev,
                        patientsId: selected,
                      }))
                    }
                    placeholder="Search patients"
                    isSearchable
                  />
                </div>
                <div className="form-group">
                  <label>
                    Receipt Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={modalData.receiptNo}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>
                    Amount <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={modalData.amount}
                    onChange={(e) =>
                      setModalData((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>
                    Date <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={modalData.Date}
                    onChange={(e) =>
                      setModalData((prev) => ({
                        ...prev,
                        Date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    value={modalData.description}
                    onChange={(e) =>
                      setModalData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter description"
                    rows="4"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary px-4"
                  data-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4">
                  {isEdit ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <div
        className="modal fade"
        id="viewModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="viewModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="viewModalLabel">
                View Advanced Payment
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              {viewData && (
                <>
                  <div className="row">
                    <div className="col-lg-6">
                      <label className="fs-5 text-gray-600">
                        Receipt Number:
                      </label>
                      <p className="fs-5 text-gray-800 showSpan">
                        <span className="badges bg-light-success">
                          {viewData.receiptNo}
                        </span>
                      </p>
                    </div>

                    <div className="col-lg-6">
                      <label className="fs-5 text-gray-600">Patient:</label>
                      <p className="fs-5 text-gray-800 showSpan">
                        {viewData.patientName}
                      </p>
                    </div>

                    <div className="col-lg-6">
                      <label className="fs-5 text-gray-600">Email:</label>
                      <p className="fs-5 text-gray-800 showSpan">
                        {viewData.patientEmail}
                      </p>
                    </div>

                    <div className="col-lg-6">
                      <label className="fs-5 text-gray-600">Amount:</label>
                      <p className="fs-5 text-gray-800 showSpan">
                        {viewData.amount}
                      </p>
                    </div>

                    <div className="col-lg-6">
                      <label className="fs-5 text-gray-600">Date:</label>
                      <p className="fs-5 text-gray-800 showSpan">
                        {formatDate(viewData.Date)}
                      </p>
                    </div>

                    <div className="col-lg-6">
                      <label className="fs-5 text-gray-600">Description:</label>
                      <p className="fs-5 text-gray-800 showSpan">
                        {viewData.description || "N/A"}
                      </p>
                    </div>

                    <div className="col-lg-6">
                      <label className="fs-5 text-gray-600">Created On:</label>
                      <p className="fs-5 text-gray-800 showSpan">
                        {getTimeAgo(viewData.created_at)}
                      </p>
                    </div>

                    <div className="col-lg-6">
                      <label className="fs-5 text-gray-600">Updated On:</label>
                      <p className="fs-5 text-gray-800 showSpan">
                        {getTimeAgo(viewData.updated_at)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary px-4"
                data-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <div
        className="modal fade"
        id="deleteModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteModalLabel"
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
            <p>Are you sure you want to delete this payment?</p>
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

export default AdvancedPayments;
