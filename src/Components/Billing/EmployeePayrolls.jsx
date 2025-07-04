import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
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

const EmployeePayrolls = () => {
  const navigate = useNavigate();
  const [payrolls, setPayrolls] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState({ status: "" });
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState(null);

  const baseUrl = "http://localhost:8080";

  const fetchPayrolls = async () => {
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      const res = await axios.get("http://localhost:8080/api/empPayrolls", {
        params,
      });
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setPayrolls(sortedData);
      setCurrentPage(1);
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || error.message || "Unknown error";
      console.error("Error fetching payrolls:", errorMsg);
      toast.error(
        `Failed to load payrolls. Check server logs for details. Error: ${errorMsg}`
      );
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [filter.status]);

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

  const handleDeletePayroll = async () => {
    if (!deleteId) {
      toast.error("Invalid payroll ID!");
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/api/empPayrolls/${deleteId}`); // Changed from /api/payrolls to /api/empPayrolls
      setPayrolls((prev) => prev.filter((payroll) => payroll.id !== deleteId));
      toast.success("Payroll deleted successfully!");
      $("#deletePayrollModal").modal("hide");
    } catch (error) {
      console.error("Delete error:", error.response?.data || error.message);
      toast.error("Error deleting payroll!");
    }
  };

  const downloadExcel = () => {
    const dataToExport = payrolls.map((payroll, index) => ({
      "S.N": index + 1,
      "Payroll ID": payroll.payroll_id,
      Employee: payroll.employee_name,
      Month: payroll.month,
      Year: payroll.year,
      "Net Salary": `$${payroll.net_salary}`,
      Status: payroll.status,
      "Created At": new Date(payroll.created_at).toLocaleString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payrolls");
    XLSX.writeFile(workbook, "Payrolls_List.xlsx");
  };

  const filteredPayrolls = payrolls.filter(
    (payroll) =>
      payroll.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payroll.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payroll.year.toString().includes(searchQuery)
  );
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayrolls.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredPayrolls.length / itemsPerPage);

  const resetFilters = () => {
    setFilter({ status: "" });
    setSearchQuery("");
    setShowFilter(false);
  };

  return (
    <div>
      <ToastContainer />

      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link to="/account" className="doctor-nav-btn">
            <span className="btn-text">Account</span>
          </Link>

          <Link to="/employee-payrolls" className="doctor-nav-btn active">
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
                      setFilter((prev) => ({ ...prev, status: e.target.value }))
                    }
                  >
                    <option value="">All</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
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
            onClick={() => navigate("/employee-payrolls/create")}
          >
            New Payroll
          </button>
        </div>
      </div>

      <div className="card p-4 border-0">
        <div className="custom-table-responsive">
          <table className="table custom-table-striped custom-table table-hover text-center">
            <thead className="thead-light">
              <tr>
                <th>S.N</th>
                <th>Payroll ID</th>
                <th>Employee</th>
                <th>Month</th>
                <th>Year</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((payroll, index) => (
                  <tr key={payroll.id}>
                    <td>{indexOfFirstItem + index + 1}</td>

                    <td>
                      <span className="badges bg-light-success">
                        {payroll.payroll_id}
                      </span>
                    </td>
                    <td>
                      {" "}
                      <div className="d-flex align-items-center">
                        {payroll.profile_image ? (
                          <img
                            src={`${baseUrl}${payroll.profile_image}`}
                            alt={`${payroll.employee_name}`}
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
                            {payroll.employee_name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div className="flex-wrap">
                          <p className="mb-0" style={{ textAlign: "start" }}>
                            {payroll.employee_name}
                          </p>
                          <p className="mb-0 text-left text-capitalize">
                            {payroll.role}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{payroll.month}</td>
                    <td>{payroll.year}</td>
                    <td>{payroll.net_salary}</td>
                    <td>
                      <span
                        className={`badges ${
                          payroll.status === "Paid"
                            ? "bg-light-success"
                            : "bg-light-danger"
                        }`}
                      >
                        {payroll.status}
                      </span>
                    </td>
                    <td>
                      <div
                        className="d-flex justify-center items-center"
                        style={{ justifyContent: "center" }}
                      >
                        <button
                          className="btn"
                          onClick={() =>
                            navigate(`/employee-payrolls/view/${payroll.id}`)
                          }
                        >
                          <i className="text-primary fa fa-eye fa-lg" />
                        </button>
                        <button
                          className="btn"
                          onClick={() =>
                            navigate(`/employee-payrolls/edit/${payroll.id}`)
                          }
                        >
                          <i className="text-primary fa fa-edit fa-lg" />
                        </button>
                        <button
                          className="btn"
                          data-toggle="modal"
                          data-target="#deletePayrollModal"
                          onClick={() => setDeleteId(payroll.id)}
                        >
                          <DeleteIcon className="text-danger fa-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    <Preloader />
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="d-flex justify-content-between align-items-center mt-5">
            <div>
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredPayrolls.length)} of{" "}
              {filteredPayrolls.length} results
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

      {/* Delete Confirmation Modal */}
      <div
        className="modal fade"
        id="deletePayrollModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deletePayrollModal"
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
            <p>Are you sure you want to delete this payroll?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={handleDeletePayroll}
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

export default EmployeePayrolls;
