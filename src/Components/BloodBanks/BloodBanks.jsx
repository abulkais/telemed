import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
const BloodBanks = () => {
  const [bloodBanksData, setBloodBanksData] = useState([]);
  const [excelLoading, setExcelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bloodBanks, setBloodBanks] = useState({
    bloodGroups: "",
    remainedBags: "",
  });
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("BloodBanks");
  const [dateFilter, setDateFilter] = useState({
    start: null,
    end: null,
  });
  const [filePreview, setFilePreview] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const bloodBanksHandleChange = (e) => {
    const { name, value } = e.target;
    setBloodBanks((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!bloodBanks.bloodGroups) {
      toast.error("Blood Groups is required");
      return;
    } else if (!bloodBanks.remainedBags) {
      toast.error("Remained Bags is required");
      return;
    }
    if (bloodBanks.remainedBags <=0) {
      toast.error("Remained Bags cannot be 0 and negative");
      return;
    }

    const bloodGroupExists = bloodBanksData.some(
      (item) =>
        item.bloodGroups.toLowerCase() ===
          bloodBanks.bloodGroups.toLowerCase() &&
        (!editing || item.id !== editId)
    );

    if (bloodGroupExists) {
      toast.error(`${bloodBanks.bloodGroups} blood group already exists!`);
      return;
    }

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    const newBloodBanks = {
      ...bloodBanks,
      created_at: currentDate,
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/BloodBanks/${editId}`,
          newBloodBanks
        );
        toast.success("Blood Groups Updated ");
      } else {
        await axios.post(`http://localhost:8080/api/BloodBanks`, newBloodBanks);
        toast.success("Blood Groups Added ");
      }

      fetchBloodBanksData();
      resetForm();
      $("#addBloodBanks").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving Blood Groups");
    }
  };

  const resetForm = () => {
    setBloodBanks({
      bloodGroups: "",
      remainedBags: "",
    });
    setEditing(false);
    setEditId(null);
    setFilePreview(null);
  };

  const fetchBloodBanksData = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/BloodBanks`);
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setBloodBanksData(sortedData);
      setCurrentPage(1); // Reset to first page when data changes
    } catch (error) {
      console.error("Error fetching Blood Groups:", error);
      toast.error("Failed to load Blood Groups");
    }
  };

  const deleteBloodBanksData = async () => {
    if (!deleteId) {
      toast.error("Invalid Blood Groups ID!");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/BloodBanks/${deleteId}`);
      setBloodBanksData((prev) => prev.filter((doc) => doc.id !== deleteId));
      toast.success("Blood Group deleted !");
      $("#DeleteBloodBanks").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Blood Groups!");
    }
  };

  const handleEdit = (doc) => {
    setEditing(true);
    setEditId(doc.id);
    setBloodBanks({
      bloodGroups: doc.bloodGroups,
      remainedBags: doc.remainedBags,
    });
    setFilePreview(null);
    $("#addBloodBanks").modal("show");
  };

  const downloadCSV = () => {
    setExcelLoading(true);

    let dataToExport;
    let fileName;

    if (dateFilter.start && !dateFilter.end) {
      dataToExport = bloodBanksData.filter((doc) => {
        const docDate = new Date(doc.created_at);
        const filterDate = new Date(dateFilter.start);

        return (
          docDate.getDate() === filterDate.getDate() &&
          docDate.getMonth() === filterDate.getMonth() &&
          docDate.getFullYear() === filterDate.getFullYear()
        );
      });
      fileName = `Blood_Banks_${new Date(dateFilter.start)
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else if (dateFilter.start || dateFilter.end || searchQuery) {
      dataToExport = bloodBanksData.filter(filterByDate).filter(filterBySearch);
      fileName = `Blood_Banks_Filtered_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else {
      dataToExport = bloodBanksData;
      fileName = `Blood_Banks_All_Data_${new Date()
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
        "Blood Groups": "Blood Groups",
        "Remained Bags": "Remained Bags",
        "Date & Time": "Date & Time",
      },
      ...dataToExport.map((doc) => ({
        "Blood Groups": doc.bloodGroups,
        "Remained Bags": doc.remainedBags,
        "Date & Time": formatDate(doc.created_at),
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    worksheet["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 20 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Blood Banks Report");
    XLSX.writeFile(workbook, fileName);
    setExcelLoading(false);
    toast.success(`Report downloaded (${dataToExport.length} records)`);
  };

  const filterByDate = (doc) => {
    if (!dateFilter.start && !dateFilter.end) return true;

    const docDate = new Date(doc.created_at);
    const startDate = dateFilter.start
      ? new Date(dateFilter.start)
      : new Date(0);

    let endDate;
    if (dateFilter.end) {
      endDate = new Date(dateFilter.end);
      endDate.setHours(23, 59, 59, 999);
    } else {
      endDate = new Date();
    }

    return docDate >= startDate && docDate <= endDate;
  };

  

  const filterBySearch = (doc) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      (doc.bloodGroups && doc.bloodGroups.toLowerCase().includes(searchLower)) ||
      (doc.remainedBags && doc.remainedBags.toString().includes(searchLower))
    );
  };

  const filteredBloodBanks = bloodBanksData
    .filter(filterByDate)
    .filter(filterBySearch);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBloodBanks.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredBloodBanks.length / itemsPerPage);

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
    fetchBloodBanksData();
  }, []);

  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link
            to="/blood-banks"
            className={`doctor-nav-btn active`}
            onClick={() => {}}
          >
            Blood Banks
          </Link>
          <Link
            to="/blood-donors"
            className={`doctor-nav-btn`}
            onClick={() => {}}
          >
            Blood Donors
          </Link>
          <Link
            to="/blood-donations"
            className={`doctor-nav-btn`}
            onClick={() => {}}
          >
            Blood Donations
          </Link>
          <Link
            to="/blood-issues"
            className={`doctor-nav-btn`}
            onClick={() => {}}
          >
            Blood Issues
          </Link>
        </div>
      </div>
      <div className="filter-bar-container">
        <input
          type="text"
          className="form-control"
          placeholder="Search"
          style={{ width: "250px" }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="d-flex justify-content-between align-items-center">
          <div className="mr-2">
            <DatePicker
              selected={dateFilter.start}
              onChange={(date) => setDateFilter({ ...dateFilter, start: date })}
              selectsStart
              startDate={dateFilter.start}
              endDate={dateFilter.end}
              placeholderText="Start Date"
              className="form-control"
              dateFormat="MMM d, yyyy"
              isClearable
            />
          </div>
          <div className="mr-2">
            <DatePicker
              selected={dateFilter.end}
              onChange={(date) => setDateFilter({ ...dateFilter, end: date })}
              selectsEnd
              startDate={dateFilter.start}
              endDate={dateFilter.end}
              minDate={dateFilter.start}
              placeholderText="End Date"
              className="form-control"
              dateFormat="MMM d, yyyy"
              isClearable
            />
          </div>

          <button
            className="btn btn-primary ml-2"
            data-toggle="modal"
            data-target="#addBloodBanks"
            onClick={resetForm}
          >
            New Blood Group
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
              <th>Blood Groups</th>
              <th>Remained Bags</th>
              <th>Date&Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((Bloodbankdata, index) => (
              <tr key={index}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>
                  <span className="badges bg-light-success">
                    {Bloodbankdata.bloodGroups}
                  </span>
                </td>
                <td>
                  <span className="badges bg-light-green">
                    {Bloodbankdata.remainedBags}
                  </span>
                </td>
                <td>
                  <div className="badges bg-light-info">
                    {formatDate(Bloodbankdata.created_at)}
                  </div>
                </td>
                <td>
                  <div
                    className="d-flex justify-center items-center"
                    style={{ justifyContent: "center" }}
                  >
                    <button
                      className="btn"
                      onClick={() => handleEdit(Bloodbankdata)}
                    >
                      <i className="text-primary fa fa-edit fa-lg" />
                    </button>
                    <button
                      className="btn"
                      data-toggle="modal"
                      data-target="#DeleteBloodBanks"
                      onClick={() => setDeleteId(Bloodbankdata.id)}
                    >
                      <DeleteIcon className="text-danger" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination controls */}
        <div className="d-flex justify-content-between align-items-center mt-5">
          <div>
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredBloodBanks.length)} of{" "}
            {filteredBloodBanks.length} results
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

              {/* Always show first page */}
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

              {/* Show ellipsis if current page is far from start */}
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

              {/* Show pages around current page */}
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

              {/* Show ellipsis if current page is far from end */}
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

              {/* Always show last page if there's more than 1 page */}
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

      {/* Add/Edit Document Modal */}
      <div
        className="modal fade document_modal"
        id="addBloodBanks"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addBloodBanks"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-md modal-center"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <img
                  src="https://png.pngtree.com/png-vector/20221027/ourmid/pngtree-blood-icon-png-image_6389057.png"
                  alt=""
                />{" "}
                {editing ? "Edit Blood Group" : "New Blood Group"}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                onClick={resetForm}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>
                  Blood Group: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="bloodGroups"
                  placeholder="Blood Group"
                  value={bloodBanks.bloodGroups}
                  className="form-control"
                  onChange={bloodBanksHandleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Remained Bags: <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="remainedBags"
                  placeholder="Remained Bags"
                  value={bloodBanks.remainedBags}
                  className="form-control"
                  min="1"
                  onChange={bloodBanksHandleChange}
                />
              </div>

              <div className="d-flex align-center justify-center mt-4">
                <button
                  className="btn btn-primary mr-3"
                  onClick={handleSubmit}
                >
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
        id="DeleteBloodBanks"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="DeleteBloodBanks"
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
            <p>Are you sure want to delete this Blood Bank?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteBloodBanksData}
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

export default BloodBanks;
