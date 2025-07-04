import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const BloodIssues = () => {
  const [bloodIssues, setBloodIssues] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [bloodDonors, setBloodDonors] = useState([]);
  const [bloodIssue, setBloodIssue] = useState({
    issueDate: "",
    doctorId: "",
    patientId: "",
    donorId: "",
    bloodGroup: "",
    amount: "",
    remarks: "",
  });
  const [excelLoading, setExcelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    start: null,
    end: null,
  });

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/doctors`);
      setDoctors(res.data);
    } catch (error) {
      console.error("Error fetching Doctors:", error);
      toast.error("Failed to load Doctors");
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/patients`);
      setPatients(res.data);
    } catch (error) {
      console.error("Error fetching Patients:", error);
      toast.error("Failed to load Patients");
    }
  };

  const fetchBloodDonors = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/BloodDonors`);
      setBloodDonors(res.data);
    } catch (error) {
      console.error("Error fetching Blood Donors:", error);
      toast.error("Failed to load Blood Donors");
    }
  };

  const fetchBloodIssues = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/bloodIssues`);
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setBloodIssues(sortedData);
    } catch (error) {
      console.error("Error fetching Blood Issues:", error);
      toast.error("Failed to load Blood Issues");
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchPatients();
    fetchBloodDonors();
    fetchBloodIssues();
  }, []);

  const doctorOptions = doctors.map((doctor) => ({
    value: doctor.id,
    label: `${doctor.firstName} ${doctor.lastName}`.trim(), // Combine firstName and lastName
  }));

  const patientOptions = patients.map((patient) => ({
    value: patient.id,
    label: `${patient.firstName} ${patient.lastName} - ${patient.email}`,
  }));

  const donorOptions = bloodDonors.map((donor) => ({
    value: donor.id,
    label: donor.name,
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBloodIssue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDoctorChange = (selectedOption) => {
    setBloodIssue((prev) => ({
      ...prev,
      doctorId: selectedOption ? selectedOption.value : "",
    }));
  };

  const handlePatientChange = (selectedOption) => {
    setBloodIssue((prev) => ({
      ...prev,
      patientId: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleDonorChange = (selectedOption) => {
    const donorId = selectedOption ? selectedOption.value : "";
    const selectedDonor = bloodDonors.find((donor) => donor.id === donorId);
    setBloodIssue((prev) => ({
      ...prev,
      donorId: donorId,
      bloodGroup: selectedDonor ? selectedDonor.bloodGroups : "",
    }));
  };

  const validateForm = () => {
    if (!bloodIssue.issueDate) {
      toast.error("Issue Date is required");
      return false;
    }
    if (!bloodIssue.doctorId) {
      toast.error("Please select a Doctor");
      return false;
    }
    if (!bloodIssue.patientId) {
      toast.error("Please select a Patient");
      return false;
    }
    if (!bloodIssue.donorId) {
      toast.error("Please select a Donor");
      return false;
    }
    if (!bloodIssue.bloodGroup) {
      toast.error("Blood Group is required");
      return false;
    }
    if (!bloodIssue.amount || isNaN(bloodIssue.amount)) {
      toast.error("Amount must be a valid number");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    const newBloodIssue = {
      ...bloodIssue,
      created_at: currentDate,
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/bloodIssues/${editId}`,
          newBloodIssue
        );
        toast.success("Blood Issue Updated Successfully");
      } else {
        await axios.post(
          `http://localhost:8080/api/bloodIssues`,
          newBloodIssue
        );
        toast.success("Blood Issue Added Successfully");
      }
      fetchBloodIssues();
      resetForm();
      $("#addBloodIssue").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving Blood Issue");
    }
  };

  const resetForm = () => {
    setBloodIssue({
      issueDate: "",
      doctorId: "",
      patientId: "",
      donorId: "",
      bloodGroup: "",
      amount: "",
      remarks: "",
    });
    setEditing(false);
    setEditId(null);
  };

  const deleteBloodIssue = async () => {
    if (!deleteId) {
      toast.error("Invalid Blood Issue ID!");
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/api/bloodIssues/${deleteId}`);
      setBloodIssues((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Blood Issue deleted successfully!");
      $("#deleteBloodIssue").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Blood Issue!");
    }
  };

  const handleEdit = (item) => {
    setEditing(true);
    setEditId(item.id);
    setBloodIssue({
      issueDate: new Date(item.issueDate).toISOString().slice(0, 10), // Format for input type="date"
      doctorId: item.doctorId,
      patientId: item.patientId,
      donorId: item.donorId,
      bloodGroup: item.bloodGroup,
      amount: item.amount,
      remarks: item.remarks,
    });
    $("#addBloodIssue").modal("show");
  };

  const downloadExcel = () => {
    setExcelLoading(true);

    let dataToExport = filteredBloodIssues;
    let fileName = `BloodIssues_${new Date().toISOString().slice(0, 10)}.xlsx`;

    if (dataToExport.length === 0) {
      toast.error("No data found to export!");
      setExcelLoading(false);
      return;
    }

    const data = [
      {
        "S.N": "S.N",
        Patient: "Patient",
        Doctor: "Doctor",
        "Donor Name": "Donor Name",
        "Issue Date": "Issue Date",
        "Blood Group": "Blood Group",
        Amount: "Amount",
        Remarks: "Remarks",
        "Created Date": "Created Date",
      },
      ...dataToExport.map((item, index) => {
        const patient = getPatientById(item.patientId);
        const doctor = getDoctorById(item.doctorId);
        const donor = getDonorById(item.donorId);
        return {
          "S.N": index + 1,
          Patient: patient ? `${patient.name} - ${patient.email}` : "N/A",
          Doctor: doctor
            ? `${doctor.firstName} ${doctor.lastName}`.trim()
            : "N/A",
          "Donor Name": donor ? donor.name : "N/A",
          "Issue Date": formatDate(item.issueDate),
          "Blood Group": item.bloodGroup,
          Amount: item.amount,
          Remarks: item.remarks || "N/A",
          "Created Date": formatDate(item.created_at),
        };
      }),
    ];

    const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 30 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Blood_Issues");
    XLSX.writeFile(workbook, fileName);
    setExcelLoading(false);
    toast.success(`Report downloaded (${dataToExport.length} records)`);
  };

  const getDoctorById = (doctorId) => {
    return doctors.find((doctor) => doctor.id === doctorId);
  };

  const getPatientById = (patientId) => {
    return patients.find((patient) => patient.id === patientId);
  };

  const getDonorById = (donorId) => {
    return bloodDonors.find((donor) => donor.id === donorId);
  };

  const filterByDate = (item) => {
    if (!dateFilter.start && !dateFilter.end) return true;

    const itemDate = new Date(item.created_at);
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

    return itemDate >= startDate && itemDate <= endDate;
  };

  const filterBySearch = (item) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    const patient = getPatientById(item.patientId);
    const doctor = getDoctorById(item.doctorId);
    const donor = getDonorById(item.donorId);

    return (
      (patient.firstName &&
        patient.firstName.toLowerCase().includes(searchLower)) ||
      (patient.lastName &&
        patient.lastName.toLowerCase().includes(searchLower)) ||
      (patient.email && patient.email.toLowerCase().includes(searchLower)) ||
      (doctor.firstName && doctor.firstName.toLowerCase().includes(searchLower))
    );
  };

  const filteredBloodIssues = bloodIssues
    .filter(filterByDate)
    .filter(filterBySearch);

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
            className={`doctor-nav-btn`}
            onClick={() => {}}
          >
            Blood Donations
          </Link>
          <Link
            to="/blood-issues"
            className={`doctor-nav-btn active`}
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
            data-target="#addBloodIssue"
            onClick={resetForm}
          >
            New Blood Issue
          </button>

          <button
            className="btn btn-success ml-2"
            onClick={downloadExcel}
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
              <th>Patient</th>
              <th>Doctor</th>
              <th>Donor Name</th>
              <th>Issue Date</th>
              <th>Blood Group</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBloodIssues.map((item, index) => {
              const patient = getPatientById(item.patientId);
              const doctor = getDoctorById(item.doctorId);
              const donor = getDonorById(item.donorId);
              return (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      {patient.profileImage ? (
                        <img
                          src={patient.profileImage}
                          alt={`${patient.firstName} ${patient.lastName}`}
                          className="rounded-circle"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            marginRight: "10px",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            backgroundColor: patient?.color || "#1d4ed8",
                          }}
                          className="rounded-circle text-white d-flex align-items-center justify-content-center document_round_circle"
                        >
                          {patient?.firstName
                            .split(" ")
                            .map((word) => word.charAt(0))
                            .join("")
                            .toUpperCase()}
                          {patient?.lastName
                            .split(" ")
                            .map((word) => word.charAt(0))
                            .join("")
                            .toUpperCase()}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {patient?.firstName} {patient?.lastName}
                        </p>
                        <p className="mb-0">{patient?.email}</p>
                      </div>
                    </div>
                  </td>
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
                      <div
                        style={{ backgroundColor: patient?.color || "#1d4ed8" }}
                        className="rounded-circle text-white d-flex align-items-center justify-content-center document_round_circle"
                      >
                        {patient?.firstName
                          .split(" ")
                          .map((word) => word.charAt(0))
                          .join("")
                          .toUpperCase()}
                        {patient?.lastName
                          .split(" ")
                          .map((word) => word.charAt(0))
                          .join("")
                          .toUpperCase()}
                      </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {doctor.firstName} {doctor.lastName}
                        </p>
                        <p className="mb-0">{doctor?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badges bg-light-info">
                      {donor?.name || "N/A"}
                    </span>
                  </td>
                  <td>
                    <span className="badges bg-light-danger">
                      {formatDate(item.issueDate)}
                    </span>
                  </td>
                  <td>
                    <span className="badges bg-light-success">
                      {item.bloodGroup}
                    </span>
                  </td>
                  <td>
                    <span className="badges bg-light-info">{item.amount}</span>
                  </td>
                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                      <button className="btn" onClick={() => handleEdit(item)}>
                        <i className="text-primary fa fa-edit fa-lg" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deleteBloodIssue"
                        onClick={() => setDeleteId(item.id)}
                      >
                        <DeleteIcon className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        className="modal fade document_modal"
        id="addBloodIssue"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addBloodIssue"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-center" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <img
                  src="https://png.pngtree.com/png-vector/20221027/ourmid/pngtree-blood-icon-png-image_6389057.png"
                  width="25"
                  height="25"
                  alt=""
                />{" "}
                {editing ? "Edit Blood Issue" : "New Blood Issue"}
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
              <div className="row">
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Issue Date: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      name="issueDate"
                      value={bloodIssue.issueDate}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Doctor Name: <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={doctorOptions}
                      value={doctorOptions.find(
                        (opt) => opt.value === bloodIssue.doctorId
                      )}
                      onChange={handleDoctorChange}
                      className="basic-single"
                      classNamePrefix="select"
                      isClearable
                      placeholder="Select Doctor Name"
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Patient Name: <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={patientOptions}
                      value={patientOptions.find(
                        (opt) => opt.value === bloodIssue.patientId
                      )}
                      onChange={handlePatientChange}
                      className="basic-single"
                      classNamePrefix="select"
                      isClearable
                      placeholder="Select Patient"
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Donor Name: <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={donorOptions}
                      value={donorOptions.find(
                        (opt) => opt.value === bloodIssue.donorId
                      )}
                      onChange={handleDonorChange}
                      className="basic-single"
                      classNamePrefix="select"
                      isClearable
                      placeholder="Choose Donor Name"
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Blood Group: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="bloodGroup"
                      value={bloodIssue.bloodGroup}
                      className="form-control"
                      disabled
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Amount: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="amount"
                      placeholder="Amount"
                      value={bloodIssue.amount}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-lg-12">
                  <div className="form-group">
                    <label>Remarks:</label>
                    <textarea
                      name="remarks"
                      placeholder="Enter any remarks"
                      value={bloodIssue.remarks}
                      className="form-control"
                      onChange={handleChange}
                      rows="2"
                    />
                  </div>
                </div>
              </div>
              <div className="d-flex align-center justify-center mt-4">
                <button
                  className="btn btn-primary mr-3 px-3"
                  onClick={handleSubmit}
                >
                  {editing ? "Update" : "Save"}
                </button>
                <button
                  className="btn btn-secondary px-4"
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
        id="deleteBloodIssue"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteBloodIssue"
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
            <p>Are you sure want to delete this Blood Issue?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteBloodIssue}
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

export default BloodIssues;
