import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import * as XLSX from "xlsx";
import Preloader from "../preloader";

const Accounts = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [accounts, setAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState({ status: "", type: "" });
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [accountData, setAccountData] = useState({
    account: "",
    description: "",
    type: "Debit",
    status: true,
  });
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchAccounts = async () => {
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.type) params.type = filter.type;
      const res = await axios.get("http://localhost:8080/api/accounts", {
        params,
      });
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setAccounts(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to load accounts");
    }
  };

  const fetchAccount = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/accounts/${id}`);
      const account = res.data;
      setAccountData({
        account: account.account || "",
        description: account.description || "",
        type: account.type || "Debit",
        status: account.status === "Active",
      });
      setEditId(id);
      setEditing(true);
    } catch (error) {
      console.error("Error fetching account:", error);
      toast.error("Failed to load account");
    }
  };

  useEffect(() => {
    fetchAccounts();
    if (isEditMode) fetchAccount();
  }, [filter.status, filter.type, isEditMode, id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };
    if (showFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilter]);

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      await axios.put(`http://localhost:8080/api/accounts/${id}`, {
        status: newStatus ? "Active" : "Inactive",
        account: accounts.find((a) => a.id === id).account,
        description: accounts.find((a) => a.id === id).description,
        type: accounts.find((a) => a.id === id).type,
      });
      setAccounts((prev) =>
        prev.map((account) =>
          account.id === id
            ? { ...account, status: newStatus ? "Active" : "Inactive" }
            : account
        )
      );
      toast.success(`status updated Successfully`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update account status");
    }
  };

  const handleAccountChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAccountData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!accountData.account) {
      toast.error("Account is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
    const accountToSave = {
      ...accountData,
      status: accountData.status ? "Active" : "Inactive",
      created_at: currentDate,
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/accounts/${editId}`,
          accountToSave
        );
        toast.success("Account updated successfully");
      } else {
        await axios.post(`http://localhost:8080/api/accounts`, accountToSave);
        toast.success("Account added successfully");
      }
      fetchAccounts();
      resetForm();
      $("#addAccountModal").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving account");
    }
  };

  const resetForm = () => {
    setAccountData({
      account: "",
      description: "",
      type: "Debit",
      status: true,
    });
    setEditing(false);
    setEditId(null);
  };

  const handleEdit = (account) => {
    setEditing(true);
    setEditId(account.id);
    setAccountData({
      account: account.account,
      description: account.description || "",
      type: account.type,
      status: account.status === "Active",
    });
    $("#addAccountModal").modal("show");
  };

  const handleDeleteAccount = async () => {
    if (!deleteId) {
      toast.error("Invalid account ID!");
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/api/accounts/${deleteId}`);
      setAccounts((prev) => prev.filter((account) => account.id !== deleteId));
      toast.success("Account deleted successfully!");
      $("#deleteAccountModal").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting account!");
    }
  };

  const downloadExcel = () => {
    const dataToExport = accounts.map((account, index) => ({
      "S.N": index + 1,
      Account: account.account,
      Description: account.description || "N/A",
      Type: account.type,
      Status: account.status,
      "Created At": new Date(account.created_at).toLocaleString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Accounts");
    XLSX.writeFile(workbook, "Accounts_List.xlsx");
  };

  const filteredAccounts = accounts.filter(
    (account) =>
      account.account.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (account.description &&
        account.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAccounts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  const resetFilters = () => {
    setFilter({ status: "", type: "" });
    setSearchQuery("");
    setShowFilter(false);
  };

  return (
    <div>
      <ToastContainer />

      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link to="/account" className="doctor-nav-btn active">
            <span className="btn-text">Account</span>
          </Link>

          <Link to="/employee-payrolls" className="doctor-nav-btn">
            <span className="btn-text">Employee Payrolls</span>
          </Link>
          <Link to="/invoices" className="doctor-nav-btn">
            <span className="btn-text">Invoices</span>
          </Link>

          <Link to="/payments" className="doctor-nav-btn">
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
        <div className="d-flex">
          <div
            className="filter-options"
            style={{ position: "relative" }}
            ref={filterRef}
          >
            <button
              className="filter-btn filter-btn-icon mr-3 py-2_half"
              onClick={() => setShowFilter(!showFilter)}
            >
              <i className="fa fa-filter fa-lg" />
            </button>
            {showFilter && (
              <div className="dropdown-content">
                <div className="form-group">
                  <label>Status:</label>
                  <select
                    className="form-control"
                    value={filter.status}
                    onChange={(e) =>
                      setFilter((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="">All</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group mt-2">
                  <label>Type:</label>
                  <select
                    className="form-control"
                    value={filter.type}
                    onChange={(e) =>
                      setFilter((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                  >
                    <option value="">All</option>
                    <option value="Debit">Debit</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
                <button
                  className="btn btn-secondary w-100 mt-2"
                  onClick={resetFilters}
                  style={{
                    backgroundColor: "#bdbdbd",
                    border: "none",
                    padding: "8px",
                    fontSize: "14px",
                  }}
                >
                  Reset
                </button>
              </div>
            )}
          </div>
          <button
            className="filter-btn filter-btn-primary mr-2 py-2_half"
            onClick={downloadExcel}
          >
            <i className="fa fa-file-excel-o fa-lg"></i>
          </button>

          <button
            className="filter-btn filter-btn-primary"
            data-toggle="modal"
            data-target="#addAccountModal"
            onClick={resetForm}
          >
            New Account
          </button>
        </div>
      </div>

      <div className="card p-4 border-0">
        <div className="custom-table-responsive">
          <table className="table custom-table-striped custom-table table-hover text-center">
            <thead className="thead-light">
              <tr>
                <th>S.N</th>
                <th>Account</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((account, index) => (
                  <tr key={account.id}>
                    <td>{indexOfFirstItem + index + 1}</td>

                    <td>{account.account}</td>
                    <td>
                      <span
                        className={`badges ${
                          account.type === "Credit"
                            ? "bg-light-success"
                            : "bg-light-danger"
                        }`}
                      >
                        {account.type}
                      </span>
                    </td>
                    <td>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={account.status === "Active"}
                            onChange={() =>
                              handleStatusToggle(
                                account.id,
                                account.status === "Active"
                              )
                            }
                            color="primary"
                          />
                        }
                      />
                    </td>
                    <td>
                      <div
                        className="d-flex justify-center items-center"
                        style={{ justifyContent: "center" }}
                      >
                        <button
                          className="btn"
                          onClick={() => handleEdit(account)}
                        >
                          <i className="text-primary fa fa-edit fa-lg" />
                        </button>
                        <button
                          className="btn"
                          data-toggle="modal"
                          data-target="#deleteAccountModal"
                          onClick={() => setDeleteId(account.id)}
                        >
                          <DeleteIcon className="text-danger fa-lg" />
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

          <div className="d-flex justify-content-between align-items-center mt-5">
            <div>
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredAccounts.length)} of{" "}
              {filteredAccounts.length} results
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <li
                      key={number}
                      className={`page-item ${
                        currentPage === number ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(number)}
                      >
                        {number}
                      </button>
                    </li>
                  )
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
      </div>

      {/* Add/Edit Account Modal */}
      <div
        className="modal fade document_modal"
        id="addAccountModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addAccountModal"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-lg modal-center"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Account" : "New Account"}
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
                <input
                  type="text"
                  name="account"
                  value={accountData.account}
                  className="form-control"
                  onChange={handleAccountChange}
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={accountData.description}
                  className="form-control"
                  onChange={handleAccountChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Status:</label> <br />
                <FormControlLabel
                  control={
                    <Switch
                      checked={accountData.status}
                      onChange={(e) =>
                        setAccountData((prev) => ({
                          ...prev,
                          status: e.target.checked,
                        }))
                      }
                      color="primary"
                    />
                  }
                />
              </div>

              <div className="form-group">
                <label>
                  Type: <span className="text-danger">*</span>
                </label>
                <div>
                  <label className="mr-3">
                    <input
                      type="radio"
                      name="type"
                      value="Debit"
                      checked={accountData.type === "Debit"}
                      onChange={handleAccountChange}
                    />{" "}
                    Debit
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="type"
                      value="Credit"
                      checked={accountData.type === "Credit"}
                      onChange={handleAccountChange}
                    />{" "}
                    Credit
                  </label>
                </div>
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

      {/* Delete Confirmation Modal */}
      <div
        className="modal fade"
        id="deleteAccountModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteAccountModal"
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
            <p>Are you sure you want to delete this account?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={handleDeleteAccount}
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

export default Accounts;
