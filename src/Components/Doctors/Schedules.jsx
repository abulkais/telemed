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
import VisibilityIcon from "@mui/icons-material/Visibility";
import Select from "react-select";

const Schedules = () => {
  const [schedulesData, setSchedulesData] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [excelLoading, setExcelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [schedule, setSchedule] = useState({
    doctorId: "",
    doctorName: "",
    perPatientTime: "00:12:00",
    days: [
      { day: "Monday", availableFrom: "10:00:00", availableTo: "18:00:00" },
      { day: "Tuesday", availableFrom: "08:00:00", availableTo: "17:00:00" },
      { day: "Wednesday", availableFrom: "09:00:00", availableTo: "17:00:00" },
      { day: "Thursday", availableFrom: "00:00:00", availableTo: "00:00:00" },
      { day: "Friday", availableFrom: "00:00:00", availableTo: "00:00:00" },
      { day: "Saturday", availableFrom: "00:00:00", availableTo: "00:00:00" },
      { day: "Sunday", availableFrom: "00:00:00", availableTo: "00:00:00" },
    ],
  });
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("Schedules");
  const [viewSchedule, setViewSchedule] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    start: null,
    end: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [doctorOptions1, setDoctorOptions1] = useState([]);

  const handleChange = (e) => {
    if (e && e.target) {
      const { name, value } = e.target;
      setSchedule((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (e && e.value) {
      const selectedDoctor = doctorOptions1.find(
        (doc) => doc.value === e.value
      );
      setSchedule((prev) => ({
        ...prev,
        doctorId: e.value,
        doctorName: selectedDoctor.label,
      }));
    }
  };

  const handleDayChange = (index, field, value) => {
    const updatedDays = [...schedule.days];

    if (field === "availableFrom" || field === "availableTo") {
      if (value && value.length === 5) {
        value = value + ":00";
      }
    }

    updatedDays[index][field] = value;
    setSchedule({
      ...schedule,
      days: updatedDays,
    });
  };

  const validateForm = () => {
    if (!schedule.doctorId || !schedule.doctorName) {
      toast.error("Please select a doctor");
      return false;
    }

    if (
      !schedule.perPatientTime ||
      !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(
        schedule.perPatientTime
      )
    ) {
      toast.error("Please enter valid per patient time in HH:mm:ss format");
      return false;
    }

    for (const day of schedule.days) {
      if (
        ((day.availableFrom !== "00:00:00" || day.availableTo !== "00:00:00") &&
          !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(
            day.availableFrom
          )) ||
        !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(day.availableTo)
      ) {
        toast.error(`Please enter valid time for ${day.day}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const currentDate = new Date().toISOString();

    const daysFields = schedule.days.reduce((acc, day) => {
      const dayLower = day.day.toLowerCase();
      acc[`${dayLower}_from`] = day.availableFrom;
      acc[`${dayLower}_to`] = day.availableTo;
      return acc;
    }, {});

    const payload = {
      doctor_id: schedule.doctorId,
      doctor_name: schedule.doctorName,
      per_patient_time: schedule.perPatientTime,
      ...daysFields,
      created_date_time: currentDate,
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/doctorSchedules/${editId}`,
          payload
        );
        toast.success("Schedule Updated Successfully");
      } else {
        await axios.post(`http://localhost:8080/api/doctorSchedules`, payload);
        toast.success("Schedule Added Successfully");
      }

      fetchSchedulesData();
      resetForm();
      $("#addSchedule").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      if (error.response) {
        const errorMessage =
          error.response.data.error || error.response.data.message;
        if (
          errorMessage === "The doctor's name has already been taken." ||
          errorMessage ===
            "Another schedule already exists for a doctor with this email"
        ) {
          toast.error("A schedule already exists for this doctor's email!");
        } else if (error.response.status === 422) {
          const errors = error.response.data.errors;
          Object.values(errors).forEach((errorMessages) => {
            errorMessages.forEach((message) => toast.error(message));
          });
        } else {
          toast.error(errorMessage || "Error saving Schedule");
        }
      } else if (error.request) {
        toast.error("No response received from server");
      } else {
        toast.error("Error setting up request");
      }
    }
  };
  const resetForm = () => {
    setSchedule({
      doctorId: "",
      doctorName: "",
      perPatientTime: "00:12:00",
      days: [
        { day: "Monday", availableFrom: "10:00:00", availableTo: "18:00:00" },
        { day: "Tuesday", availableFrom: "08:00:00", availableTo: "17:00:00" },
        {
          day: "Wednesday",
          availableFrom: "09:00:00",
          availableTo: "17:00:00",
        },
        { day: "Thursday", availableFrom: "00:00:00", availableTo: "00:00:00" },
        { day: "Friday", availableFrom: "00:00:00", availableTo: "00:00:00" },
        { day: "Saturday", availableFrom: "00:00:00", availableTo: "00:00:00" },
        { day: "Sunday", availableFrom: "00:00:00", availableTo: "00:00:00" },
      ],
    });
    setEditing(false);
    setEditId(null);
  };

  const fetchSchedulesData = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/doctorSchedules`);

      const transformedData = res.data.map((sched) => {
        // Ensure days are correctly mapped with proper field names
        const days = [
          {
            day: "Monday",
            availableFrom: sched.monday_from,
            availableTo: sched.monday_to,
          },
          {
            day: "Tuesday",
            availableFrom: sched.tuesday_from,
            availableTo: sched.tuesday_to,
          },
          {
            day: "Wednesday",
            availableFrom: sched.wednesday_from,
            availableTo: sched.wednesday_to,
          },
          {
            day: "Thursday",
            availableFrom: sched.thursday_from,
            availableTo: sched.thursday_to,
          },
          {
            day: "Friday",
            availableFrom: sched.friday_from,
            availableTo: sched.friday_to,
          },
          {
            day: "Saturday",
            availableFrom: sched.saturday_from,
            availableTo: sched.saturday_to,
          },
          {
            day: "Sunday",
            availableFrom: sched.sunday_from,
            availableTo: sched.sunday_to,
          },
        ];

        return {
          id: sched.id,
          doctorId: sched.doctor_id,
          doctorName: sched.doctor_name,
          doctorEmail: sched.doctor_email,
          perPatientTime: sched.per_patient_time,
          days: days.map((day) => ({
            day: day.day,
            availableFrom: day.availableFrom || "00:00:00",
            availableTo: day.availableTo || "00:00:00",
          })),
          createdDateTime: sched.created_date_time,
        };
      });

      const sortedData = transformedData.sort(
        (a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime)
      );
      setSchedulesData(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching Schedules:", error);
      toast.error("Failed to load Schedules");
    }
  };
  const fetchDoctors = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/doctors");

      let doctorsData = [];
      if (
        response.data.status === "success" &&
        Array.isArray(response.data.data)
      ) {
        doctorsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        doctorsData = response.data;
      }

      const options = doctorsData.map((doctor) => ({
        value: doctor.id, // Adjusted to match screenshot
        label: `${doctor.firstName} ${doctor.lastName}`,
      }));

      setDoctorOptions1(options);
      setDoctors(doctorsData);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors");
    }
  };

  useEffect(() => {
    fetchSchedulesData();
    fetchDoctors();
  }, []);

  const deleteSchedule = async () => {
    if (!deleteId) {
      toast.error("Invalid Schedule ID!");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8080/api/doctorSchedules/${deleteId}`
      );
      setSchedulesData((prev) => prev.filter((sched) => sched.id !== deleteId));
      toast.success("Schedule deleted successfully!");
      $("#DeleteSchedule").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Schedule!");
    }
  };

  const handleEdit = (sched) => {
    setEditing(true);
    setEditId(sched.id);

    // Use the days directly from the schedule, ensuring they match the expected structure
    const formattedDays = sched.days.map((day) => ({
      day: day.day,
      availableFrom: day.availableFrom || "00:00:00",
      availableTo: day.availableTo || "00:00:00",
    }));

    setSchedule({
      doctorId: sched.doctorId,
      doctorName: sched.doctorName,
      perPatientTime: sched.perPatientTime,
      days: formattedDays,
    });
    $("#addSchedule").modal("show");
  };

  const downloadCSV = () => {
    setExcelLoading(true);

    let dataToExport;
    let fileName;

    if (dateFilter.start && !dateFilter.end) {
      dataToExport = schedulesData.filter((doc) => {
        const docDate = new Date(doc.createdDateTime);
        const filterDate = new Date(dateFilter.start);

        return (
          docDate.getDate() === filterDate.getDate() &&
          docDate.getMonth() === filterDate.getMonth() &&
          docDate.getFullYear() === filterDate.getFullYear()
        );
      });
      fileName = `Schedules_${new Date(dateFilter.start)
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else if (dateFilter.start || dateFilter.end || searchQuery) {
      dataToExport = schedulesData.filter(filterByDate).filter(filterBySearch);
      fileName = `Schedules_Filtered_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else {
      dataToExport = schedulesData;
      fileName = `Schedules_All_Data_${new Date()
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
        "Doctor Name": "Doctor Name",
        Email: "Email", // Added email
        "Per Patient Time": "Per Patient Time",
        "Monday From": "Monday From",
        "Monday To": "Monday To",
        "Tuesday From": "Tuesday From",
        "Tuesday To": "Tuesday To",
        "Wednesday From": "Wednesday From",
        "Wednesday To": "Wednesday To",
        "Thursday From": "Thursday From",
        "Thursday To": "Thursday To",
        "Friday From": "Friday From",
        "Friday To": "Friday To",
        "Saturday From": "Saturday From",
        "Saturday To": "Saturday To",
        "Sunday From": "Sunday From",
        "Sunday To": "Sunday To",
        "Date & Time": "Date & Time",
      },
      ...dataToExport.map((sched) => ({
        "Doctor Name": sched.doctorName,
        Email: sched.doctorEmail, // Added email
        "Per Patient Time": sched.perPatientTime,
        "Monday From": sched.days[0].availableFrom,
        "Monday To": sched.days[0].availableTo,
        "Tuesday From": sched.days[1].availableFrom,
        "Tuesday To": sched.days[1].availableTo,
        "Wednesday From": sched.days[2].availableFrom,
        "Wednesday To": sched.days[2].availableTo,
        "Thursday From": sched.days[3].availableFrom,
        "Thursday To": sched.days[3].availableTo,
        "Friday From": sched.days[4].availableFrom,
        "Friday To": sched.days[4].availableTo,
        "Saturday From": sched.days[5].availableFrom,
        "Saturday To": sched.days[5].availableTo,
        "Sunday From": sched.days[6].availableFrom,
        "Sunday To": sched.days[6].availableTo,
        "Date & Time": formatDate(sched.createdDateTime),
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 25 }, // Added for email
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Schedules Report");
    XLSX.writeFile(workbook, fileName);
    setExcelLoading(false);
    toast.success(`Report downloaded (${dataToExport.length} records)`);
  };

  const filterByDate = (doc) => {
    if (!dateFilter.start && !dateFilter.end) return true;

    const docDate = new Date(doc.createdDateTime);
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
      (doc.doctorName && doc.doctorName.toLowerCase().includes(searchLower)) ||
      (doc.doctorEmail &&
        doc.doctorEmail.toLowerCase().includes(searchLower)) || // Added email search
      (doc.perPatientTime &&
        doc.perPatientTime.toLowerCase().includes(searchLower))
    );
  };

  const filteredSchedules = schedulesData
    .filter(filterByDate)
    .filter(filterBySearch);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSchedules.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);

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

          <button
            className="filter-btn filter-btn-primary"
            data-toggle="modal"
            data-target="#addSchedule"
            onClick={resetForm}
          >
            New Schedule
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
              <th style={{textAlign:'start'}}>Doctor </th>
              <th>Per Patient Time</th>
              <th>Date & Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((sched, index) => (
              <tr key={index}>
                <td>{indexOfFirstItem + index + 1}</td>
               
                <td>
                  <div className="d-flex align-items-center">
                  
                      <div className="rounded-circle text-white d-flex align-items-center justify-content-center document_round_circle">
                       {sched.doctorName
                          ?.split(" ")
                          .map((word) => word.charAt(0))
                          .join("")
                          .toUpperCase()}
                     
                      </div>
                  
                    <div className="flex-wrap">
                      <p className="mb-0" style={{ textAlign: "start" }}>
                      {sched.doctorName} 
                      </p>
                      <p className="mb-0">{sched.doctorEmail}</p>
                    </div>
                  </div>
                </td>
                <td>{sched.perPatientTime}</td>
                <td>
                  <div className="badges bg-light-info">
                    {formatDate(sched.createdDateTime)}
                  </div>
                </td>
                <td>
                  <div
                    className="d-flex justify-center items-center"
                    style={{ justifyContent: "center" }}
                  >
                    <button
                      className="btn"
                      onClick={() => {
                        setViewSchedule(sched);
                        $("#viewSchedule").modal("show");
                      }}
                    >
                      <VisibilityIcon className="text-info" />
                    </button>
                    <button className="btn" onClick={() => handleEdit(sched)}>
                      <i className="text-primary fa fa-edit fa-lg" />
                    </button>
                    <button
                      className="btn"
                      data-toggle="modal"
                      data-target="#DeleteSchedule"
                      onClick={() => setDeleteId(sched.id)}
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
            {Math.min(indexOfLastItem, filteredSchedules.length)} of{" "}
            {filteredSchedules.length} results
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
        className="modal fade"
        id="viewSchedule"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="viewScheduleLabel"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="viewScheduleLabel">
                Schedule Details
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              {viewSchedule && (
                <>
                  <div className="row mb-2">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="font-weight-bold">Doctor:</label>
                        <p className="form-control-plaintext">
                          {viewSchedule.doctorName}
                        </p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="font-weight-bold">Email:</label>
                        <p className="form-control-plaintext">
                          {viewSchedule.doctorEmail}
                        </p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label className="font-weight-bold">
                          Per Patient Time:
                        </label>
                        <p className="form-control-plaintext">
                          {viewSchedule.perPatientTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  <h5 className="mb-3 font-weight-500">Schedule :</h5>
                  <div className="table-responsive">
                    <table className="table custom-table-striped custom-table table-hover text-center">
                      <thead className="thead-light">
                        <tr>
                          <th>Available On </th>
                          <th>Available From</th>
                          <th>Available To</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewSchedule.days.map((day, index) => (
                          <tr key={index}>
                            <td>{day.day}</td>

                            <td>
                              <p className="form-control-plaintext">
                                {day.availableFrom !== "00:00:00"
                                  ? new Date(
                                      `1970-01-01T${day.availableFrom}`
                                    ).toLocaleTimeString([], {
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })
                                  : "N/A"}
                              </p>
                            </td>
                            <td>
                              <p className="form-control-plaintext">
                                {day.availableTo !== "00:00:00"
                                  ? new Date(
                                      `1970-01-01T${day.availableTo}`
                                    ).toLocaleTimeString([], {
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })
                                  : "N/A"}
                              </p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade document_modal"
        id="addSchedule"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addSchedule"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl modal-center" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Schedule" : "New Schedule"}
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
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>
                      Doctor: <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={doctorOptions1}
                      placeholder="Select a doctor"
                      isSearchable
                      value={doctorOptions1.find(
                        (option) => option.value === schedule.doctorId
                      )}
                      onChange={(selectedOption) => {
                        if (selectedOption) {
                          setSchedule((prev) => ({
                            ...prev,
                            doctorId: selectedOption.value,
                            doctorName: selectedOption.label,
                          }));
                        }
                      }}
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          borderColor: !schedule.doctorId
                            ? "#ff4444"
                            : provided.borderColor,
                        }),
                      }}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>
                      Per Patient Time: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="time"
                      name="perPatientTime"
                      value={schedule.perPatientTime}
                      className="form-control"
                      onChange={handleChange}
                      step="1"
                    />
                  </div>
                </div>
              </div>

              <h5 className="mb-3">
                Schedule<span className="text-danger">*</span>
              </h5>
              <div className="table-responsive">
                <table className="table custom-table-striped custom-table table-hover text-center">
                  <thead className="thead-light">
                    <tr>
                      <th>Available On </th>
                      <th>Available From</th>
                      <th>Available To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.days.map((day, index) => (
                      <tr key={index}>
                        <td>{day.day}</td>
                        <td>
                          <input
                            type="time"
                            className="form-control"
                            value={day.availableFrom}
                            onChange={(e) =>
                              handleDayChange(
                                index,
                                "availableFrom",
                                e.target.value
                              )
                            }
                            step="1"
                          />
                        </td>
                        <td>
                          <input
                            type="time"
                            className="form-control"
                            value={day.availableTo}
                            onChange={(e) =>
                              handleDayChange(
                                index,
                                "availableTo",
                                e.target.value
                              )
                            }
                            step="1"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
        id="DeleteSchedule"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="DeleteSchedule"
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
            <p>Are you sure want to delete this Schedule?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteSchedule}
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

export default Schedules;
