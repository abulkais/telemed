import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import * as XLSX from "xlsx";
import "react-datepicker/dist/react-datepicker.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const PaymentReports = () => {
  const [paymentsData, setPaymentsData] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [excelLoading, setExcelLoading] = useState(false);
  // const [filter, setFilter] = useState({ status: "All" });
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);

  const [filter, setFilter] = useState({ status: "" }); // Change "All" to "" to match select option

  useEffect(() => {
    fetchPayments();
  }, [filter.status]);

  const fetchPayments = async () => {
    try {
      const params = filter.status ? { status: filter.status } : {};
      const res = await axios.get("http://localhost:8080/api/payments-report", {
        params,
      });
      const sortedData = res.data.sort(
        (a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)
      );
      setPaymentsData(sortedData);
      setCurrentPage(1);
    } catch (error) {
      toast.error("Failed to load Payments");
    }
  };

  const downloadCSV = () => {
    setExcelLoading(true);

    let dataToExport;
    let fileName;

    
    fileName = `Payments_Filtered_${new Date()
     .toISOString()
     .slice(0, 10)}.xlsx`;

    dataToExport = paymentsData.filter(
      (payment) => payment.status === filter.status
    );



    dataToExport = paymentsData;
    fileName = `Payments_All_Data_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

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
        Account: payment.account,
        "Payment Date": new Date(payment.paymentDate).toLocaleDateString(),
        "Pay To": payment.payTo,
        Amount: payment.amount.toFixed(2),
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
      payment.account.toLowerCase().includes(searchLower) ||
      payment.paymentDate.toLowerCase().includes(searchLower) ||
      payment.payTo.toLowerCase().includes(searchLower) ||
      payment.amount.toString().includes(searchLower)
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
          <Link to="/account" className="doctor-nav-btn ">
            <span className="btn-text">Account</span>
          </Link>

          <Link to="/employee-payrolls" className="doctor-nav-btn">
            <span className="btn-text">Employee Payrolls</span>
          </Link>
          <Link to="/invoices" className="doctor-nav-btn">
            <span className="btn-text">Invoices</span>
          </Link>

          <Link to="/payments" className="doctor-nav-btn ">
            <span className="btn-text">Payments</span>
          </Link>

          <Link to="/payment-reports" className="doctor-nav-btn active">
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
                    onChange={(e) => {
                      setFilter((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }));
                      setShowFilter(false);
                    }}
                  >
                    <option value="">All</option>
                    <option value="Credit">Credit</option>
                    <option value="Debit">Debit</option>
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
              <th>Payment Date</th>
              <th>Account</th>
              <th>Pay To</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((payment, index) => (
              <tr key={payment.id}>
                <td>
                  <div className="badges bg-light-info">
                    {formatDate(payment.paymentDate)}
                  </div>
                </td>
                <td>
                  <span className="badges bg-light-success">
                    {payment.account}
                  </span>
                </td>

                <td>{payment.payTo}</td>
                <td>{payment.type}</td>
                <td>${payment.amount}</td>
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
    </div>
  );
};

export default PaymentReports;
