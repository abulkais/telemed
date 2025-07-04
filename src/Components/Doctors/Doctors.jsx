import React, { useState, useEffect, useRef } from "react";
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
import CircularProgress from "@mui/material/CircularProgress";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
const Doctors = () => {
  const [doctorsData, setDoctorsData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [excelLoading, setExcelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState({
    firstName: "",
    lastName: "",
    departmentId: "",
    departmentName: "",
    email: "",
    designation: "",
    countryCode: "+91",
    phone: "",
    qualification: "",
    dateOfBirth: "",
    bloodGroup: "",
    gender: "",
    status: "",
    specialist: "",
    password: "",
    confirmPassword: "",
    appointmentCharge: "",
    description: "",
    address1: "",
    address2: "",
    city: "",
    zip: "",
    facebookUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    linkedInUrl: "",
    image: null,
    imageUrl: "",
  });
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("Doctors");
  const [dateFilter, setDateFilter] = useState({
    start: null,
    end: null,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filterRef = useRef(null);
  const [showFilter, setShowFilter] = useState(false);

  const toggleFilterDropdown = () => {
    setShowFilter(!showFilter);
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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilter]);

  const departmentOptions = departments.map((dept) => ({
    value: dept.id,
    label: dept.name,
  }));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctor((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDoctor((prev) => ({
        ...prev,
        image: file,
        imageUrl: URL.createObjectURL(file),
      }));
    }
  };

  const validateForm = () => {
    if (!doctor.firstName) {
      toast.error("First Name is required");
      return false;
    } else if (!doctor.lastName) {
      toast.error("Last Name is required");
      return false;
    } else if (!doctor.departmentId) {
      toast.error("Department is required");
      return false;
    } else if (!doctor.email) {
      toast.error("Email is required");
      return false;
    } else if (!doctor.designation) {
      toast.error("Designation is required");
      return false;
    } else if (!doctor.countryCode) {
      toast.error("Country Code is required");
      return false;
    } else if (!doctor.phone) {
      toast.error("Phone is required");
      return false;
    } else if (!doctor.qualification) {
      toast.error("Qualification is required");
      return false;
    } else if (!doctor.dateOfBirth) {
      toast.error("Date of Birth is required");
      return false;
    } else if (!doctor.bloodGroup) {
      toast.error("Blood Group is required");
      return false;
    } else if (!doctor.gender) {
      toast.error("Gender is required");
      return false;
    } else if (!doctor.status) {
      toast.error("Status is required");
      return false;
    } else if (!doctor.specialist) {
      toast.error("Specialist is required");
      return false;
    } else if (!doctor.password) {
      toast.error("Password is required");
      return false;
    } else if (!doctor.confirmPassword) {
      toast.error("Confirm Password is required");
      return false;
    } else if (!doctor.appointmentCharge) {
      toast.error("Appointment Charge is required");
      return false;
    }

    if (doctor.password !== doctor.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    if (!/^\d+$/.test(doctor.appointmentCharge)) {
      toast.error("Appointment charge must be a valid number");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      let imageUrl = doctor.imageUrl;

      // If a new image is selected, upload it first
      if (doctor.image) {
        const formData = new FormData();
        formData.append("image", doctor.image);
        const uploadResponse = await axios.post(
          "http://localhost:8080/api/doctors/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        imageUrl = uploadResponse.data.imageUrl;
      }

      const formData = new FormData();
      formData.append(
        "id",
        doctor.id || Math.random().toString(36).substring(2, 6)
      );
      formData.append("firstName", doctor.firstName);
      formData.append("lastName", doctor.lastName);
      formData.append("departmentId", doctor.departmentId);
      formData.append(
        "departmentName",
        departments.find((d) => d.id === doctor.departmentId)?.name || ""
      );
      formData.append("email", doctor.email);
      formData.append("designation", doctor.designation);
      formData.append("countryCode", doctor.countryCode); // Add countryCode to the formData
      formData.append("phone", doctor.phone);
      formData.append("qualification", doctor.qualification);
      formData.append("dateOfBirth", doctor.dateOfBirth);
      formData.append("bloodGroup", doctor.bloodGroup);
      formData.append("gender", doctor.gender);
      formData.append("status", doctor.status);
      formData.append("specialist", doctor.specialist);
      formData.append("password", doctor.password);
      formData.append("appointmentCharge", doctor.appointmentCharge);
      formData.append("description", doctor.description);
      formData.append("address1", doctor.address1);
      formData.append("address2", doctor.address2);
      formData.append("city", doctor.city);
      formData.append("zip", doctor.zip);
      formData.append("facebookUrl", doctor.facebookUrl);
      formData.append("twitterUrl", doctor.twitterUrl);
      formData.append("instagramUrl", doctor.instagramUrl);
      formData.append("linkedInUrl", doctor.linkedInUrl);
      formData.append("createdDateTime", new Date().toISOString());
      if (imageUrl) {
        formData.append("imgUrl", imageUrl);
      }

      if (editing) {
        await axios.put(
          `http://localhost:8080/api/doctors/${editId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        toast.success("Doctor updated successfully!");
      } else {
        await axios.post("http://localhost:8080/api/doctors", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Doctor created successfully!");
      }

      await fetchDoctorsData();
      resetForm();
      $("#addDoctor").modal("hide");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.error || "An error occurred");
    }
  };
  const resetForm = () => {
    setDoctor({
      firstName: "",
      lastName: "",
      departmentId: "",
      departmentName: "",
      email: "",
      designation: "",
      countryCode: "+91",
      phone: "",
      qualification: "",
      dateOfBirth: "",
      bloodGroup: "",
      gender: "",
      status: "",
      specialist: "",
      password: "",
      confirmPassword: "",
      appointmentCharge: "",
      description: "",
      address1: "",
      address2: "",
      city: "",
      zip: "",
      facebookUrl: "",
      twitterUrl: "",
      instagramUrl: "",
      linkedInUrl: "",
      image: null,
      imageUrl: "",
    });
    setEditing(false);
    setEditId(null);
  };

  const fetchDoctorsData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8080/api/doctors");

      if (res.data) {
        const sortedData = res.data.sort(
          (a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime)
        );
        setDoctorsData(sortedData);
        setCurrentPage(1);
      } else {
        console.warn("No data received from API");
        setDoctorsData([]);
      }
    } catch (error) {
      console.error("Error fetching Doctors:", error);
      toast.error("Failed to load Doctors");
      setDoctorsData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/doctorsDepartment"
      );
      setDepartments(res.data);
    } catch (error) {
      console.error("Error fetching Departments:", error);
      toast.error("Failed to load Departments");
    }
  };

  const deleteDoctor = async () => {
    if (!deleteId) {
      toast.error("Invalid Doctor ID!");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/doctors/${deleteId}`);
      setDoctorsData((prev) => prev.filter((doc) => doc.id !== deleteId));
      toast.success("Doctor deleted successfully!");
      $("#DeleteDoctor").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Doctor!");
    }
  };

  const handleEdit = (doc) => {
    setEditing(true);
    setEditId(doc.id);
    setDoctor({
      firstName: doc.firstName,
      lastName: doc.lastName,
      departmentId: doc.departmentId,
      departmentName: doc.departmentName,
      email: doc.email,
      designation: doc.designation,
      countryCode: doc.countryCode,
      phone: doc.phone,
      qualification: doc.qualification,
      dateOfBirth: doc.dateOfBirth,
      bloodGroup: doc.bloodGroup,
      gender: doc.gender,
      status: doc.status,
      specialist: doc.specialist,
      password: doc.password,
      confirmPassword: doc.password,
      appointmentCharge: doc.appointmentCharge,
      description: doc.description,
      address1: doc.address1,
      address2: doc.address2,
      city: doc.city,
      zip: doc.zip,
      facebookUrl: doc.facebookUrl,
      twitterUrl: doc.twitterUrl,
      instagramUrl: doc.instagramUrl,
      linkedInUrl: doc.linkedInUrl,
      image: null,
      imageUrl: doc.imgUrl || "",
    });
    $("#addDoctor").modal("show");
  };
  const downloadCSV = () => {
    setExcelLoading(true);

    let dataToExport = doctorsData.filter(filterByDate).filter(filterBySearch);

    if (dataToExport.length === 0) {
      toast.error("No data found for the current filters!");
      setExcelLoading(false);
      return;
    }

    const data = [
      [
        "First Name",
        "Last Name",
        "Department",
        "Email",
        "Phone",
        "Designation",
        "Qualification",
        "Date of Birth",
        "Blood Group",
        "Gender",
        "Status",
        "Appointment Charge",
        "Description",
        "Address 1",
        "Address 2",
        "City",
        "Zip",
        "Facebook URL",
        "Twitter URL",
        "Instagram URL",
        "LinkedIn URL",
        "Specialist",
        "Date & Time",
      ],
      ...dataToExport.map((doc) => [
        doc.firstName,
        doc.lastName,
        doc.departmentName,
        doc.email,
        doc.countryCode+doc.phone,
        doc.designation,
        doc.qualification,
        doc.dateOfBirth,
        doc.bloodGroup,
        doc.gender,
        doc.status,
        doc.appointmentCharge,
        doc.description,
        doc.address1,
        doc.address2,
        doc.city,
        doc.zip,
        doc.facebookUrl,
        doc.twitterUrl,
        doc.instagramUrl,
        doc.linkedInUrl,
        doc.specialist,
        doc.createdDateTime,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 30 },
      { wch: 25 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Doctors Report");

    const fileName =
      dateFilter.start ||
      dateFilter.end ||
      searchQuery ||
      statusFilter !== "ALL"
        ? `Doctors_Filtered_${
            statusFilter !== "ALL" ? statusFilter : ""
          }_${new Date().toISOString().slice(0, 10)}.xlsx`
        : `Doctors_All_Data_${new Date().toISOString().slice(0, 10)}.xlsx`;

    XLSX.writeFile(workbook, fileName);
    setExcelLoading(false);
    toast.success(`Report downloaded (${dataToExport.length} records)`);
  };
  // const downloadCSV = () => {
  //   setExcelLoading(true);

  //   let dataToExport = doctorsData.filter(filterByDate).filter(filterBySearch);

  //   if (dataToExport.length === 0) {
  //     toast.error("No data found for the current filters!");
  //     setExcelLoading(false);
  //     return;
  //   }

  //   const data = [
  //     [
  //       "First Name",
  //       "Last Name",
  //       "Department",
  //       "Email",
  //       "Phone",
  //       "Designation",
  //       "Qualification",
  //       "Date of Birth",
  //       "Blood Group",
  //       "Gender",
  //       "Status",
  //       "Appointment Charge",
  //       "Description",
  //       "Address 1",
  //       "Address 2",
  //       "City",
  //       "Zip",
  //       "Facebook URL",
  //       "Twitter URL",
  //       "Instagram URL",
  //       "LinkedIn URL",
  //       "Specialist",
  //       "Date & Time",
  //     ],
  //     ...dataToExport.map((doc) => [
  //       doc.firstName,
  //       doc.lastName,
  //       doc.departmentName,
  //       doc.email,
  //       doc.phone,
  //       doc.designation,
  //       doc.qualification,
  //       doc.dateOfBirth,
  //       doc.bloodGroup,
  //       doc.gender,
  //       doc.status,
  //       doc.appointmentCharge,
  //       doc.description,
  //       doc.address1,
  //       doc.address2,
  //       doc.city,
  //       doc.zip,
  //       doc.facebookUrl,
  //       doc.twitterUrl,
  //       doc.instagramUrl,
  //       doc.linkedInUrl,
  //       doc.specialist,
  //       doc.createdDateTime,
  //     ]),
  //   ];

  //   const worksheet = XLSX.utils.aoa_to_sheet(data);
  //   worksheet["!cols"] = [
  //     { wch: 15 },
  //     { wch: 15 },
  //     { wch: 20 },
  //     { wch: 30 },
  //     { wch: 25 },
  //     { wch: 20 },
  //     { wch: 20 },
  //     { wch: 15 },
  //     { wch: 20 },
  //     { wch: 20 },
  //     { wch: 15 },
  //     { wch: 20 },
  //     { wch: 20 },
  //     { wch: 15 },
  //     { wch: 20 },
  //     { wch: 25 },
  //     { wch: 15 },
  //     { wch: 30 },
  //     { wch: 30 },
  //     { wch: 30 },
  //     { wch: 30 },
  //     { wch: 20 },
  //     { wch: 20 },
  //   ];

  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Doctors Report");

  //   const fileName =
  //     dateFilter.start || dateFilter.end || searchQuery
  //       ? `Doctors_Filtered_${new Date().toISOString().slice(0, 10)}.xlsx`
  //       : `Doctors_All_Data_${new Date().toISOString().slice(0, 10)}.xlsx`;

  //   XLSX.writeFile(workbook, fileName);
  //   setExcelLoading(false);
  //   toast.success(`Report downloaded (${dataToExport.length} records)`);
  // };

  const filterByDate = (doc) => {
    if (!dateFilter.start && !dateFilter.end) return true;

    const docDate = new Date(doc.createdDateTime);
    const startDate = dateFilter.start
      ? new Date(dateFilter.start)
      : new Date(0);
    let endDate = dateFilter.end ? new Date(dateFilter.end) : new Date();
    endDate.setHours(23, 59, 59, 999);

    return docDate >= startDate && docDate <= endDate;
  };
  const filterBySearch = (doc) => {
    // Apply status filter first
    if (statusFilter !== "ALL" && doc.status !== statusFilter) {
      return false;
    }

    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      (doc.firstName && doc.firstName.toLowerCase().includes(searchLower)) ||
      (doc.lastName && doc.lastName.toLowerCase().includes(searchLower)) ||
      (doc.departmentName &&
        doc.departmentName.toLowerCase().includes(searchLower)) ||
      (doc.email && doc.email.toLowerCase().includes(searchLower)) ||
      (doc.phone && doc.phone.toLowerCase().includes(searchLower)) ||
      (doc.status && doc.status.toLowerCase().includes(searchLower)) ||
      (doc.specialist && doc.specialist.toLowerCase().includes(searchLower))
    );
  };
  // const filterBySearch = (doc) => {
  //   if (!searchQuery) return true;

  //   const searchLower = searchQuery.toLowerCase();
  //   return (
  //     (doc.firstName && doc.firstName.toLowerCase().includes(searchLower)) ||
  //     (doc.lastName && doc.lastName.toLowerCase().includes(searchLower)) ||
  //     (doc.departmentName &&
  //       doc.departmentName.toLowerCase().includes(searchLower)) ||
  //     (doc.email && doc.email.toLowerCase().includes(searchLower)) ||
  //     (doc.phone && doc.phone.toLowerCase().includes(searchLower)) ||
  //     (doc.status && doc.status.toLowerCase().includes(searchLower)) ||
  //     (doc.specialist && doc.specialist.toLowerCase().includes(searchLower))
  //   );
  // };

  const filteredDoctors = doctorsData
    .filter(filterByDate)
    .filter(filterBySearch);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDoctors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

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
    fetchDoctorsData();
    fetchDepartments();
  }, []);

  return (
    <div>
      <ToastContainer />

      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link
            to="/doctors"
            className={`doctor-nav-btn ${filter === "Doctors" ? "active" : ""}`}
            onClick={() => setFilter("Doctors")}
          >
            <span className="btn-text">Doctors</span>
          </Link>

          <Link
            to="/doctor-departments"
            className={`doctor-nav-btn ${
              filter === "DoctorDepartments" ? "active" : ""
            }`}
            onClick={() => setFilter("DoctorDepartments")}
          >
            <span className="btn-text">Departments</span>
          </Link>

          <Link
            to="/schedules"
            className={`doctor-nav-btn ${
              filter === "Schedules" ? "active" : ""
            }`}
            onClick={() => setFilter("Schedules")}
          >
            <span className="btn-text">Schedules</span>
          </Link>

          <Link
            to="/doctors-holidays"
            className={`doctor-nav-btn ${
              filter === "DoctorsHolidays" ? "active" : ""
            }`}
            onClick={() => setFilter("DoctorsHolidays")}
          >
            <span className="btn-text">Holidays</span>
          </Link>

          <Link
            to="/doctors-breaks"
            className={`doctor-nav-btn ${
              filter === "DoctorsBreaks" ? "active" : ""
            }`}
            onClick={() => setFilter("DoctorsBreaks")}
          >
            <span className="btn-text">Breaks</span>
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
          <div
            className="filter-options"
            style={{ position: "relative" }}
            ref={filterRef}
          >
            <button
              className="filter-btn filter-btn-icon mr-3 py-2_half"
              onClick={toggleFilterDropdown}
            >
              <i className="fa fa-filter fa-lg" />
            </button>
            {showFilter && (
              <div className="dropdown-content">
                <div className="form-group">
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      marginBottom: "5px",
                    }}
                  >
                    Status:
                  </label>
                  <select
                    className="form-control"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{ padding: "5px", fontSize: "14px" }}
                  >
                    <option value="ALL">ALL</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
                <button
                  className="btn btn-secondary w-100 mt-2"
                  onClick={() => {
                    setStatusFilter("ALL");
                    setSearchQuery("");
                    setDateFilter({ start: null, end: null });
                    setCurrentPage(1);
                    setShowFilter(false);
                  }}
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
            className="filter-btn filter-btn-primary mr-2"
            onClick={downloadCSV}
            disabled={excelLoading}
          >
            {excelLoading ? (
              <span>Exporting...</span>
            ) : (
              <span>
                <i className="fa fa-file-excel-o fa-lg"></i>
              </span>
            )}
          </button>
          <button
            className="filter-btn filter-btn-primary"
            data-toggle="modal"
            data-target="#addDoctor"
            onClick={resetForm}
          >
            New Doctor
          </button>
        </div>
      </div>
      <div className="custom-table-responsive">
        {loading ? (
          <div className="text-center py-5">
            <CircularProgress />
            <p>Loading doctors data</p>
          </div>
        ) : (
          <>
            <table className="table custom-table-striped custom-table table-hover text-center">
              <thead className="thead-light">
                <tr>
                  <th>S.N</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Specialist</th>
                  <th>Date & Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((doctor, index) => (
                  <tr key={index}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        {doctor.imgUrl ? (
                          <img
                            src={doctor.imgUrl}
                            alt={`${doctor.firstName} ${doctor.lastName}`}
                            className="rounded-circle"
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                              marginRight: "10px",
                            }}
                          />
                        ) : (
                          <div className="rounded-circle text-white d-flex align-items-center justify-content-center document_round_circle">
                            {doctor.firstName
                              ?.split(" ")
                              .map((word) => word.charAt(0))
                              .join("")
                              .toUpperCase()}
                            {doctor.lastName
                              ?.split(" ")
                              .map((word) => word.charAt(0))
                              .join("")
                              .toUpperCase()}
                          </div>
                        )}
                        <div className="flex-wrap">
                          <p className="mb-0" style={{ textAlign: "start" }}>
                            {doctor.firstName} {doctor.lastName}
                          </p>
                          <p className="mb-0">{doctor.email}</p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badges bg-light-success">
                        {doctor.departmentName}
                      </span>
                    </td>

                    <td>
                      {doctor.countryCode} {doctor.phone}
                    </td>
                    <td>
                      <span
                        className={`badges ${
                          doctor.status === "Active"
                            ? "bg-light-success"
                            : "bg-light-danger"
                        }`}
                      >
                        {doctor.status}
                      </span>
                    </td>
                    <td>{doctor.specialist}</td>
                    <td>
                      <div className="badges bg-light-info">
                        {formatDate(doctor.createdDateTime)}
                      </div>
                    </td>
                    <td>
                      <div
                        className="d-flex justify-center items-center"
                        style={{ justifyContent: "center" }}
                      >
                        <button
                          className="btn"
                          onClick={() => handleEdit(doctor)}
                        >
                          <i className="text-primary fa fa-edit fa-lg" />
                        </button>
                        <button
                          className="btn"
                          data-toggle="modal"
                          data-target="#DeleteDoctor"
                          onClick={() => setDeleteId(doctor.id)}
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
                {Math.min(indexOfLastItem, filteredDoctors.length)} of{" "}
                {filteredDoctors.length} results
              </div>
              <nav>
                <ul className="pagination">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
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
          </>
        )}
      </div>

      {/* Add/Edit Doctor Modal */}
      <div
        className="modal fade document_modal"
        id="addDoctor"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addDoctor"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl modal-center" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Doctor" : "New Doctor"}
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
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>
                      First Name: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="First Name"
                      value={doctor.firstName}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>
                      Last Name: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                      value={doctor.lastName}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group">
                    <label>
                      Doctor Department: <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={departmentOptions}
                      value={departmentOptions.find(
                        (option) => option.value === doctor.departmentId
                      )}
                      onChange={(selectedOption) => {
                        setDoctor((prev) => ({
                          ...prev,
                          departmentId: selectedOption.value,
                          departmentName: selectedOption.label,
                        }));
                      }}
                      placeholder="Select Department"
                      isSearchable
                      className="basic-single"
                      classNamePrefix="select"
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>
                      Email: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={doctor.email}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group">
                    <label>
                      Designation: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="designation"
                      placeholder="Designation"
                      value={doctor.designation}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>
                      Phone: <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <PhoneInput
                        country={"in"} // Default country (India)
                        value={doctor.countryCode} // Bind to countryCode
                        onChange={(countryCode) =>
                          setDoctor((prev) => ({
                            ...prev,
                            countryCode: `+${countryCode}`, // Store country code with +
                          }))
                        }
                        inputClass="form-control"
                        containerStyle={{ width: "15%" }}
                        inputStyle={{ width: "100%" }}
                        placeholder=""
                        enableSearch={true}
                        disableDropdown={false}
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone"
                        value={doctor.phone}
                        className="form-control"
                        onChange={(e) => {
                          const phoneNumber = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          ); // Allow only digits
                          setDoctor((prev) => ({
                            ...prev,
                            phone: phoneNumber, // Store only the phone number digits
                          }));
                        }}
                        style={{ width: "81%" }}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>
                      Qualification: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="qualification"
                      placeholder="Qualification"
                      value={doctor.qualification}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>
                      Date Of Birth: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={doctor.dateOfBirth}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group">
                    <label>
                      Blood Group: <span className="text-danger">*</span>
                    </label>
                    <select
                      name="bloodGroup"
                      value={doctor.bloodGroup}
                      className="form-control"
                      onChange={handleChange}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>
                      Gender: <span className="text-danger">*</span>
                    </label>
                    <select
                      name="gender"
                      value={doctor.gender}
                      className="form-control"
                      onChange={handleChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group">
                    <label>
                      Status: <span className="text-danger">*</span>
                    </label>
                    <select
                      name="status"
                      value={doctor.status}
                      className="form-control"
                      onChange={handleChange}
                    >
                      <option value="">Select Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>
                      Specialist: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="specialist"
                      placeholder="Specialist"
                      value={doctor.specialist}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group">
                    <label>
                      Password: <span className="text-danger">*</span>
                    </label>

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={doctor.password}
                      className="form-control"
                      onChange={handleChange}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      class="toggle-password"
                    >
                      {showPassword ? (
                        <i class="fa fa-eye-slash"></i>
                      ) : (
                        <i class="fa fa-eye"></i>
                      )}
                    </span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>
                      Confirm Password: <span className="text-danger">*</span>
                    </label>

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={doctor.confirmPassword}
                      className="form-control"
                      onChange={handleChange}
                    />

                    <span
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      class="toggle-password"
                    >
                      {showConfirmPassword ? (
                        <i class="fa fa-eye-slash"></i>
                      ) : (
                        <i class="fa fa-eye"></i>
                      )}
                    </span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>
                      Appointment Charge: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="appointmentCharge"
                      placeholder="Appointment Charge"
                      value={doctor.appointmentCharge}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="d-block">Profile Picture</label>

                  <div className="profile-picture-upload">
                    <label
                      htmlFor="profile-upload"
                      className="profile-picture-container"
                    >
                      {doctor.imageUrl ? (
                        <>
                          <img
                            src={doctor.imageUrl}
                            alt="Profile"
                            className="profile-picture"
                          />
                          <div className="edit-overlay">
                            <i className="fas fa-pencil-alt"></i>
                          </div>
                        </>
                      ) : (
                        <div className="empty-profile">
                          <i className="fa fa-upload"></i>
                        </div>
                      )}
                    </label>

                    <input
                      id="profile-upload"
                      accept="image/*"
                      type="file"
                      name="profileImage"
                      className="d-none"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea
                      name="description"
                      placeholder="Description"
                      value={doctor.description}
                      className="form-control"
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              <h5 className="mt-4">Address Details</h5>
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Address 1:</label>
                    <input
                      type="text"
                      name="address1"
                      placeholder="Address 1"
                      value={doctor.address1}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Address 2:</label>
                    <input
                      type="text"
                      name="address2"
                      placeholder="Address 2"
                      value={doctor.address2}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group">
                    <label>City:</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="City"
                      value={doctor.city}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Zip:</label>
                    <input
                      type="text"
                      name="zip"
                      placeholder="Zip"
                      value={doctor.zip}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <h5 className="mt-4">Social Details</h5>
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Facebook URL:</label>
                    <input
                      type="url"
                      name="facebookUrl"
                      placeholder="Facebook URL"
                      value={doctor.facebookUrl}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>Twitter URL:</label>
                    <input
                      type="url"
                      name="twitterUrl"
                      placeholder="Twitter URL"
                      value={doctor.twitterUrl}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group">
                    <label>Instagram URL:</label>
                    <input
                      type="url"
                      name="instagramUrl"
                      placeholder="Instagram URL"
                      value={doctor.instagramUrl}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label>LinkedIn URL:</label>
                    <input
                      type="url"
                      name="linkedInUrl"
                      placeholder="LinkedIn URL"
                      value={doctor.linkedInUrl}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>
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
        id="DeleteDoctor"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="DeleteDoctor"
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
            <p>Are you sure want to delete this Doctor?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteDoctor}
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

export default Doctors;
