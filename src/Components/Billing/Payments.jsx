import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const Payments = () => {
  const [paymentsData, setPaymentsData] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState({
    accountId: null,
    paymentDate: new Date(),
    payTo: "",
    amount: "",
    description: "",
  });
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState({
    start: null,
    end: null,
  });
  const [excelLoading, setExcelLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchPayments();
    fetchAccounts();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/payments");
      const sortedData = res.data.sort(
        (a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)
      );
      setPaymentsData(sortedData);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Failed to load Payments");
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/accounts");
      setAccounts(
        res.data.map((account) => ({
          value: account.id,
          label: account.account,
        }))
      );
    } catch (error) {
      toast.error("Failed to load accounts");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e) => {
    const dateValue = e.target.value; // Value from <input type="date"> is always YYYY-MM-DD
    setFormData((prev) => ({
      ...prev,
      paymentDate: dateValue || "", // Store the raw date string or empty string if cleared
    }));
  };

  const handleSelectChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, accountId: selectedOption.value }));
  };

  const validateForm = () => {
    if (!formData.accountId || !formData.payTo || !formData.amount) {
      toast.error("All fields are required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    const payload = {
      ...formData,
      paymentDate: formData.paymentDate
        ? new Date(formData.paymentDate).toISOString().split("T")[0]
        : "",
      amount: parseFloat(formData.amount),
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/payments/${editId}`,
          payload
        );
        toast.success("Payment Updated Successfully");
      } else {
        await axios.post("http://localhost:8080/api/payments", payload);
        toast.success("Payment Added Successfully");
      }
      fetchPayments();
      resetForm();
      $("#paymentModal").modal("hide");
    } catch (error) {
      toast.error("Error saving Payment");
    }
  };

  const resetForm = () => {
    setFormData({
      accountId: null,
      paymentDate: new Date(),
      payTo: "",
      amount: "",
      description: "",
    });
    setEditing(false);
    setEditId(null);
  };

  const handleEdit = (payment) => {
    setEditing(true);
    setEditId(payment.id);
    setFormData({
      accountId: payment.accountId,
      paymentDate: new Date(payment.paymentDate),
      payTo: payment.payTo,
      amount: payment.amount,
      description: payment.description || "",
    });
    $("#paymentModal").modal("show");
  };

  const handleDelete = async () => {
    if (!deleteId) {
      toast.error("Invalid Payment ID!");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/payments/${deleteId}`);
      setPaymentsData((prev) => prev.filter((p) => p.id !== deleteId));
      toast.success("Payment deleted successfully!");
      $("#deleteModal").modal("hide");
    } catch (error) {
      toast.error("Error deleting Payment!");
    }
  };

  const downloadCSV = () => {
    setExcelLoading(true);

    let dataToExport;
    let fileName;

    if (dateFilter.start && !dateFilter.end) {
      dataToExport = paymentsData.filter((doc) => {
        const docDate = new Date(doc.paymentDate);
        const filterDate = new Date(dateFilter.start);
        return (
          docDate.getDate() === filterDate.getDate() &&
          docDate.getMonth() === filterDate.getMonth() &&
          docDate.getFullYear() === filterDate.getFullYear()
        );
      });
      fileName = `Payments_${new Date(dateFilter.start)
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else if (dateFilter.start || dateFilter.end || searchQuery) {
      dataToExport = paymentsData.filter(filterBySearch);
      fileName = `Payments_Filtered_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else {
      dataToExport = paymentsData;
      fileName = `Payments_All_Data_${new Date()
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
        Account: "Account",
        "Payment Date": "Payment Date",
        "Pay To": "Pay To",
        Amount: "Amount",
        Description: "Description",
      },
      ...dataToExport.map((payment) => ({
        Account: accounts.find((a) => a.value === payment.accountId)?.label,
        "Payment Date": new Date(payment.paymentDate).toLocaleDateString(),
        "Pay To": payment.payTo,
        Amount: `$${payment.amount.toFixed(2)}`,
        Description: payment.description || "N/A",
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 30 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments_Report");
    XLSX.writeFile(workbook, fileName);
    setExcelLoading(false);
    toast.success(`Report downloaded (${dataToExport.length} records)`);
  };

  const filterBySearch = (payment) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      accounts
        .find((a) => a.value === payment.accountId)
        ?.label?.toLowerCase()
        .includes(searchLower) ||
      false ||
      (payment.payTo && payment.payTo.toString().includes(searchLower))
    );
  };

  const filteredPayments = paymentsData.filter(filterBySearch);
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

  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link to="/account" className="doctor-nav-btn ">
            <span className="btn-text">Account</span>
          </Link>

          <Link to="/employee-payrolls" className="doctor-nav-btn">
            <span className="btn-text">Employee Payrolls</span>
          </Link>
          <Link to="/invoices" className="doctor-nav-btn">
            <span className="btn-text">Invoices</span>
          </Link>

          <Link to="/payments" className="doctor-nav-btn active">
            <span className="btn-text">Payments</span>
          </Link>

          <Link to="/payment-reports" className="doctor-nav-btn">
            <span className="btn-text">Payment Reports</span>
          </Link>

          <Link to="/advanced-payments" className="doctor-nav-btn">
            <span className="btn-text">Advance Payments</span>
          </Link>

          <Link to="/bills" className="doctor-nav-btn">
            <span className="btn-text">Bills</span>
          </Link>

          <Link to="/manual-billing-payments" className="doctor-nav-btn">
            <span className="btn-text">Manual Billing Payments</span>
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
            data-target="#paymentModal"
            onClick={resetForm}
          >
            New Payment
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
              <th>Account</th>
              <th>Payment Date</th>
              <th>Pay To</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((payment, index) => (
              <tr key={payment.id}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>
                  <span className="badges bg-light-success">
                    {accounts.find((a) => a.value === payment.accountId)?.label}
                  </span>
                </td>
                <td>
                  <div className="badges bg-light-info">
                    {formatDate(payment.paymentDate)}
                  </div>
                </td>
                <td>{payment.payTo}</td>
                <td>${payment.amount.toFixed(2)}</td>
                <td>
                  <div
                    className="d-flex justify-center items-center"
                    style={{ justifyContent: "center" }}
                  >
                    <button className="btn" onClick={() => handleEdit(payment)}>
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
            ))}
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

      {/* Add/Edit Payment Modal */}
      <div
        className="modal fade document_modal"
        id="paymentModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="paymentModal"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-lg modal-center"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Payment" : "New Payment"}
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
                  Account: <span className="text-danger">*</span>
                </label>
                <Select
                  options={accounts}
                  value={accounts.find((a) => a.value === formData.accountId)}
                  onChange={handleSelectChange}
                />
              </div>
              <div className="form-group">
                <label>
                  Payment Date: <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  value={
                    formData.paymentDate
                      ? new Date(formData.paymentDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={handleDateChange}
                  className="form-control"
                  selected={formData.paymentDate}
                />
              </div>
              <div className="form-group">
                <label>
                  Pay To: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="payTo"
                  value={formData.payTo}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>
                  Amount: <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
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
        id="deleteModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteModal"
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
            <p>Are you sure you want to delete this Payment?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={handleDelete}
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

export default Payments;
