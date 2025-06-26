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
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
const BloodDonations = () => {
  const [bloodDonationsData, setBloodDonationsData] = useState([]);
  const [bloodDonorsList, setBloodDonorsList] = useState([]); // For donor names dropdown
  const [excelLoading, setExcelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bloodDonation, setBloodDonation] = useState({
    donorId: "",
    donorName: "",
    bloodBags: "",
  });
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("BloodDonations"); // Default filter is patient name
  const [dateFilter, setDateFilter] = useState({
    start: null,
    end: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBloodDonation((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDonorSelect = (e) => {
    const donorId = e.target.value;
    const selectedDonor = bloodDonorsList.find((donor) => donor.id === parseInt(donorId));
    setBloodDonation({
      ...bloodDonation,
      donorId: donorId,
      donorName: selectedDonor.name
    });
  };



  const handleSubmit = async () => {
    if (!bloodDonation.donorId) {
      toast.error("Donor name is required");
      return;
    } else if (!bloodDonation.bloodBags) {
      toast.error("Blood bags is required");
      return;
    }

    // Validate blood bags (must be a number)
    if (!/^\d+$/.test(bloodDonation.bloodBags)) {
      toast.error("Blood bags must be a valid number");
      return;
    }

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    const newBloodDonation = {
      ...bloodDonation,
      created_at: currentDate,
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/BloodDonations/${editId}`,
          newBloodDonation
        );
        toast.success("Blood Donation Updated");
      } else {
        await axios.post(
          `http://localhost:8080/api/BloodDonations`,
          newBloodDonation
        );
        toast.success("Blood Donation Added");
      }

      fetchData();
      resetForm();
      $("#addBloodDonations").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving Blood Donation");
    }
  };

  const resetForm = () => {
    setBloodDonation({
      donorId: "",
      donorName: "",
      bloodBags: "",
    });
    setEditing(false);
    setEditId(null);
  };

  const fetchData = async () => {
    try {
      // Fetch blood donations
      const res = await axios.get(`http://localhost:8080/api/BloodDonations`);
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setBloodDonationsData(sortedData);

      // Fetch blood donors for dropdown
      const donorsRes = await axios.get(`http://localhost:8080/api/BloodDonors`);
      setBloodDonorsList(donorsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    }
  };

  const deleteData = async () => {
    if (!deleteId) {
      toast.error("Invalid Blood Donation ID!");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/BloodDonations/${deleteId}`);
      setBloodDonationsData((prev) =>
        prev.filter((doc) => doc.id !== deleteId)
      );
      toast.success("Blood Donation deleted!");
      $("#DeleteData").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Blood Donation!");
    }
  };

  const handleEdit = (doc) => {
    setEditing(true);
    setEditId(doc.id);
    setBloodDonation({
      donorId: doc.donorId,
      donorName: doc.donorName,
      bloodBags: doc.bloodBags,
    });
    $("#addBloodDonations").modal("show");
  };

  const downloadCSV = () => {
    setExcelLoading(true);

    // Determine which data to export based on current filters
    let dataToExport;
    let fileName;

    if (dateFilter.start && !dateFilter.end) {
      // Case 1: Only start date is selected - download just that day's data
      dataToExport = bloodDonationsData.filter((doc) => {
        const docDate = new Date(doc.created_at);
        const filterDate = new Date(dateFilter.start);

        return (
          docDate.getDate() === filterDate.getDate() &&
          docDate.getMonth() === filterDate.getMonth() &&
          docDate.getFullYear() === filterDate.getFullYear()
        );
      });
      fileName = `Blood_Donations_${new Date(dateFilter.start)
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else if (dateFilter.start || dateFilter.end || searchQuery) {
      // Case 2: Any filters applied (date range or search) - download filtered data
      dataToExport = bloodDonationsData
        .filter(filterByDate)
        .filter(filterBySearch);
      fileName = `Blood_Donations_Filtered_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else {
      // Case 3: No filters applied - download all data
      dataToExport = bloodDonationsData;
      fileName = `Blood_Donations_All_Data_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
    }

    if (dataToExport.length === 0) {
      toast.error("No data found for the current filters!");
      setExcelLoading(false);
      return;
    }

    // Prepare data with proper formatting
    const data = [
      // Header row
      {
        "Donor Name": "Donor Name",
        "Blood Bags": "Blood Bags",
        "Date & Time": "Date & Time",
      },
      // Data rows
      ...dataToExport.map((doc) => ({
        "Donor Name": doc.donorName,
        "Blood Bags": doc.bloodBags,
        "Date & Time": formatDate(doc.created_at),
      })),
    ];

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });

    // Set column widths
    worksheet["!cols"] = [
      { wch: 25 }, // Donor Name
      { wch: 15 }, // Blood Bags
      { wch: 20 }, // Date & Time
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Blood Donations Report");

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
      endDate.setHours(23, 59, 59, 999); // Set end date to end of the day
    } else {
      endDate = new Date();
    }

    return docDate >= startDate && docDate <= endDate;
  };

  const filterBySearch = (doc) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      (doc.donorName && doc.donorName.toLowerCase().includes(searchLower)) ||
      (doc.bloodBags && doc.bloodBags.toString().includes(searchLower))
    );
  };

  const filteredBloodDonations = bloodDonationsData
    .filter(filterByDate)
    .filter(filterBySearch);

    // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBloodDonations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredBloodDonations.length / itemsPerPage);

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
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    return `${day} ${month}, ${year} ${hours}:${minutes}`;
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <ToastContainer />

      <div className="doctor-nav-buttons">
        <div className="nav_headings">
        <Link
            to="/blood-banks"
            className={`doctor-nav-btn`}
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
            className={`doctor-nav-btn active`}
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
          placeholder="Search "
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
            data-target="#addBloodDonations"
            onClick={resetForm}
          >
            New Blood Donation
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
              <th>Donor Name</th>
              <th>Blood Bags</th>
              <th>Date & Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((donation, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{donation.donorName}</td>
                <td>
                  <span className="badges bg-light-green">
                    {donation.bloodBags}
                  </span>
                </td>
                <td>
                  <div className="badges bg-light-info">
                    {formatDate(donation.created_at)}
                  </div>
                </td>
                <td>
                  <div
                    className="d-flex justify-center items-center"
                    style={{ justifyContent: "center" }}
                  >
                    <button
                      className="btn"
                      onClick={() => handleEdit(donation)}
                    >
                      <i className="text-primary fa fa-edit fa-lg" />
                    </button>
                    <button
                      className="btn"
                      data-toggle="modal"
                      data-target="#DeleteData"
                      onClick={() => setDeleteId(donation.id)}
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
            {Math.min(indexOfLastItem, filteredBloodDonations.length)} of{" "}
            {filteredBloodDonations.length} results
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
                  <ArrowBackIosIcon/>
                </button>
              </li>

              {/* Always show first page */}
              <li className={`page-item ${currentPage === 1 ? "active" : ""}`}>
                <button className="page-link" onClick={() => setCurrentPage(1)}  style={{height:"42px", borderRadius:'10px',boxShadow:'none',border:"none"}}>
                  1
                </button>
              </li>

              {/* Show ellipsis if current page is far from start */}
              {currentPage > 4 && (
                <li className="page-item disabled">
                  <span className="page-link"  style={{height:"42px", borderRadius:'10px',boxShadow:'none',border:"none"}}>...</span>
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
                      style={{height:"42px", borderRadius:'10px',boxShadow:'none',border:"none"}}>
                      {number}
                    </button>
                  </li>
                ))}

              {/* Show ellipsis if current page is far from end */}
              {currentPage < totalPages - 3 && (
                <li className="page-item disabled">
                  <span className="page-link"  style={{height:"42px", borderRadius:'10px',boxShadow:'none',border:"none"}}>...</span>
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
                    style={{height:"42px", borderRadius:'10px',boxShadow:'none',border:"none"}}>
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
                 <ArrowForwardIosIcon/>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Add/Edit Blood Donation Modal */}
      <div
        className="modal fade document_modal"
        id="addBloodDonations"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addBloodDonations"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-lg modal-center"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <img
                  src="https://png.pngtree.com/png-vector/20221027/ourmid/pngtree-blood-icon-png-image_6389057.png"
                  alt=""
                />{" "}
                {editing ? "Edit Blood Donation" : "New Blood Donation"}
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
                  Blood Donor: <span className="text-danger">*</span>
                </label>
                <select
                  name="donorId"
                  value={bloodDonation.donorId}
                  className="form-control"
                  onChange={handleDonorSelect}
                  required
                >
                  <option value="">Select Donor</option>
                  {bloodDonorsList.map((donor) => (
                    <option key={donor.id} value={donor.id}>
                      {donor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  Blood Bags (Units): <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="bloodBags"
                  placeholder="Number of blood bags donated"
                  value={bloodDonation.bloodBags}
                  className="form-control"
                  onChange={handleChange}
                  min="1"
                  required
                />
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
        id="DeleteData"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="DeleteData"
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
            <p>Are you sure want to delete this Blood Donor?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteData}
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

export default BloodDonations;
