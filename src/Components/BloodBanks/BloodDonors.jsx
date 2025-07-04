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
import Select from "react-select"; // Import React-Select

const BloodDonors = () => {
  const [bloodDonorsData, setBloodDonorsData] = useState([]);
  const [excelLoading, setExcelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [bloodDonors, setBloodDonors] = useState({
    name: "",
    age: "",
    gender: "",
    bloodGroups: "",
    lastDonations: "",
  });
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("BloodDonors");
  const [dateFilter, setDateFilter] = useState({
    start: null,
    end: null,
  });
  const [filePreview, setFilePreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [bloodGroupsList, setBloodGroupsList] = useState([]); // State to store fetched blood groups

  // Fetch blood groups from the backend
  const fetchBloodGroups = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/BloodBanks/bloodGroups`
      );
      setBloodGroupsList(
        res.data.map((group) => ({ value: group, label: group }))
      ); // Format for React-Select
    } catch (error) {
      console.error("Error fetching blood groups:", error);
      toast.error("Failed to load blood groups");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBloodDonors((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle React-Select change for bloodGroups
  const handleBloodGroupChange = (selectedOption) => {
    setBloodDonors((prev) => ({
      ...prev,
      bloodGroups: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleSubmit = async () => {
    if (
      !bloodDonors.name ||
      !bloodDonors.age ||
      !bloodDonors.gender ||
      !bloodDonors.bloodGroups ||
      !bloodDonors.lastDonations
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    // Validate age (must be a number)
    if (!/^\d+$/.test(bloodDonors.age)) {
      toast.error("Age must be a valid number");
      return;
    }

    // Validate blood group against fetched list
    const validBloodGroups = bloodGroupsList.map((option) => option.value);
    if (!validBloodGroups.includes(bloodDonors.bloodGroups)) {
      toast.error("Invalid blood group.");
      return;
    }

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    const newBloodDonor = {
      ...bloodDonors,
      created_at: currentDate,
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/BloodDonors/${editId}`,
          newBloodDonor
        );
        toast.success("Blood Donor Updated");
      } else {
        await axios.post(
          `http://localhost:8080/api/BloodDonors`,
          newBloodDonor
        );
        toast.success("Blood Donor Added");
      }

      fetchData();
      resetForm();
      $("#addBloodBanks").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving Blood Donor");
    }
  };

  const resetForm = () => {
    setBloodDonors({
      name: "",
      age: "",
      gender: "",
      bloodGroups: "",
      lastDonations: "",
    });
    setEditing(false);
    setEditId(null);
    setFilePreview(null);
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/BloodDonors`);
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setBloodDonorsData(sortedData);
    } catch (error) {
      console.error("Error fetching Blood Donor:", error);
      toast.error("Failed to load Blood Donor");
    }
  };

  const deleteData = async () => {
    if (!deleteId) {
      toast.error("Invalid Blood Donor ID!");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/BloodDonors/${deleteId}`);
      setBloodDonorsData((prev) => prev.filter((doc) => doc.id !== deleteId));
      toast.success("Blood Donor deleted!");
      $("#DeleteBloodBanks").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Blood Donor!");
    }
  };

  const handleEdit = (doc) => {
    setEditing(true);
    setEditId(doc.id);
    setBloodDonors({
      name: doc.name,
      age: doc.age,
      gender: doc.gender,
      bloodGroups: doc.bloodGroups,
      lastDonations: doc.lastDonations
        ? new Date(doc.lastDonations).toISOString().split("T")[0]
        : "",
    });

    setFilePreview(null);
    $("#addBloodBanks").modal("show");
  };

  const downloadCSV = () => {
    setExcelLoading(true);

    let dataToExport;
    let fileName;

    if (dateFilter.start && !dateFilter.end) {
      dataToExport = bloodDonorsData.filter((doc) => {
        const docDate = new Date(doc.created_at);
        const filterDate = new Date(dateFilter.start);

        return (
          docDate.getDate() === filterDate.getDate() &&
          docDate.getMonth() === filterDate.getMonth() &&
          docDate.getFullYear() === filterDate.getFullYear()
        );
      });
      fileName = `Blood_Donors_${new Date(dateFilter.start)
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else if (dateFilter.start || dateFilter.end || searchQuery) {
      dataToExport = bloodDonorsData
        .filter(filterByDate)
        .filter(filterBySearch);
      fileName = `Blood_Donors_Filtered_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else {
      dataToExport = bloodDonorsData;
      fileName = `Blood_Donors_All_Data_${new Date()
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
        Name: "Name",
        Age: "Age",
        Gender: "Gender",
        "Blood Groups": "Blood Groups",
        "Last Donations": "Last Donations",
        "Date & Time": "Date & Time",
      },
      ...dataToExport.map((doc) => ({
        Name: doc.name,
        Age: doc.age,
        Gender: doc.gender,
        "Blood Groups": doc.bloodGroups,
        "Last Donations": formatDate(doc.lastDonations),
        "Date & Time": formatDate(doc.created_at),
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });

    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Blood Donors Report");

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
      (doc.name && doc.name.toLowerCase().includes(searchLower)) ||
      (doc.age && doc.age.toString().includes(searchLower)) ||
      (doc.gender && doc.gender.toLowerCase().includes(searchLower)) ||
      (doc.bloodGroups && doc.bloodGroups.toLowerCase().includes(searchLower))
    );
  };

  const filteredBloodDonors = bloodDonorsData
    .filter(filterByDate)
    .filter(filterBySearch);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBloodDonors.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredBloodDonors.length / itemsPerPage);

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
    fetchData();
    fetchBloodGroups(); // Fetch blood groups on component mount
  }, []);

  const today = new Date().toISOString().split("T")[0];

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
            className={`doctor-nav-btn active`}
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
            New Blood Donor
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
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Blood Groups</th>
              <th>Last Donations Date</th>
              <th>Date&Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((bloodDonorData, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{bloodDonorData.name}</td>
                <td>
                  <span className="badges bg-light-green">
                    {bloodDonorData.age}
                  </span>
                </td>
                <td>
                  <span className="badges bg-light-info">
                    {bloodDonorData.gender}
                  </span>
                </td>
                <td>
                  <span className="badges bg-light-danger">
                    {bloodDonorData.bloodGroups}
                  </span>
                </td>
                <td>
                  <span className="badges bg-light-green">
                    {formatDate(bloodDonorData.lastDonations)}
                  </span>
                </td>
                <td>
                  <div className="badges bg-light-info">
                    {formatDate(bloodDonorData.created_at)}
                  </div>
                </td>
                <td>
                  <div
                    className="d-flex justify-center items-center"
                    style={{ justifyContent: "center" }}
                  >
                    <button
                      className="btn"
                      onClick={() => handleEdit(bloodDonorData)}
                    >
                      <i className="text-primary fa fa-edit fa-lg" />
                    </button>
                    <button
                      className="btn"
                      data-toggle="modal"
                      data-target="#DeleteBloodBanks"
                      onClick={() => setDeleteId(bloodDonorData.id)}
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
            {Math.min(indexOfLastItem, filteredBloodDonors.length)} of{" "}
            {filteredBloodDonors.length} results
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

      <div
        className="modal fade document_modal"
        id="addBloodBanks"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addBloodBanks"
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
                {editing ? "Edit Blood Donor" : "New Blood Donor"}
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
                  Name: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={bloodDonors.name}
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Age: <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={bloodDonors.age}
                  className="form-control"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>
                  Gender: <span className="text-danger">*</span>
                </label>
                <select
                  name="gender"
                  placeholder="Gender"
                  value={bloodDonors.gender}
                  className="form-control"
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  Blood Groups: <span className="text-danger">*</span>
                </label>
                <Select
                  name="bloodGroups"
                  options={bloodGroupsList}
                  value={
                    bloodGroupsList.find(
                      (option) => option.value === bloodDonors.bloodGroups
                    ) || null
                  }
                  onChange={handleBloodGroupChange}
                  placeholder="Select Blood Group"
                  isClearable
                />
              </div>

              <div className="form-group">
                <label>
                  Last Donation Date: <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  min={today}
                  name="lastDonations"
                  placeholder="Last Donation Date"
                  value={bloodDonors.lastDonations}
                  className="form-control"
                  onChange={handleChange}
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
            <p>Are you sure you want to delete this Blood Donor?</p>
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

export default BloodDonors;
