import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";

const CreateInvestigationReport = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [reportData, setReportData] = useState({
    title: "",
    patientId: "",
    doctorId: "",
    date: "",
    attachment: null,
    status: false,
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const fetchReport = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/investigation-reports/${id}`);
      const report = res.data;

      const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().split("T")[0]; // Returns YYYY-MM-DD
      };

      setReportData({
        title: report.title || "",
        patientId: report.patientId || "",
        doctorId: report.doctorId || "",
        date: formatDate(report.date),
        attachment: report.attachment || null,
        status: !!report.status,
      });
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to load report");
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/patients");
      setPatients(res.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/doctors");
      setDoctors(res.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setReportData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const validateForm = () => {
    if (!reportData.title) {
      toast.error("Title is required");
      return false;
    }
    if (!reportData.patientId) {
      toast.error("Patient is required");
      return false;
    }
    if (!reportData.doctorId) {
      toast.error("Doctor is required");
      return false;
    }
    if (!reportData.date) {
      toast.error("Date is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formatDateTime = (date) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    };

    const reportToSave = {
      ...reportData,
      date: formatDateTime(reportData.date),
      status: reportData.status.toString(),
    };

    const hasNewAttachment = reportToSave.attachment && typeof reportToSave.attachment !== "string";

    let requestData;
    let headers = {};

    if (hasNewAttachment) {
      requestData = new FormData();
      for (const key in reportToSave) {
        if (key === "attachment" && reportToSave[key]) {
          requestData.append(key, reportToSave[key]);
        } else {
          requestData.append(key, reportToSave[key] ?? "");
        }
      }
      headers["Content-Type"] = "multipart/form-data";
    } else {
      requestData = { ...reportToSave };
      headers["Content-Type"] = "application/json";
    }

    try {
      if (isEditMode) {
        requestData.existingAttachment = reportData.attachment;
        await axios.put(`http://localhost:8080/api/investigation-reports/${id}`, requestData, { headers });
        toast.success("Investigation report updated successfully");
      } else {
        await axios.post(`http://localhost:8080/api/investigation-reports`, requestData, { headers });
        toast.success("Investigation report added successfully");
        setReportData({
          title: "",
          patientId: "",
          doctorId: "",
          date: "",
          attachment: null,
          status: false,
        });
      }
      setTimeout(() => {
        navigate("/investigation-reports");
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error.response || error);
      const errorMessage = error.response?.data?.error || error.message;
      toast.error("Error saving report: " + errorMessage);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
    if (isEditMode) {
      fetchReport();
    }
  }, [isEditMode, id]);

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">{isEditMode ? "Edit Investigation Report" : "New Investigation Report"}</h1>
            <button className="btn btn-primary px-4" onClick={() => navigate("/investigation-reports")}>
              Back
            </button>
          </div>

          <div className="card p-4 border-0">
            <div className="row">
              <div className="form-group col-md-4">
                <label>
                  Title: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={reportData.title}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>
                  Patient: <span className="text-danger">*</span>
                </label>
                <select
                  name="patientId"
                  value={reportData.patientId}
                  className="form-control"
                  onChange={handleInputChange}
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group col-md-4">
                <label>
                  Doctor: <span className="text-danger">*</span>
                </label>
                <select
                  name="doctorId"
                  value={reportData.doctorId}
                  className="form-control"
                  onChange={handleInputChange}
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group col-md-4">
                <label>
                  Date: <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={reportData.date}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Attachment:</label>
                <input
                  type="file"
                  name="attachment"
                  className="form-control"
                  onChange={handleInputChange}
                  accept=".pdf,.doc,.docx,.jpeg,.jpg,.png"
                />
                {reportData.attachment && typeof reportData.attachment === "string" && (
                  <a href={reportData.attachment} target="_blank" rel="noopener noreferrer">
                    View Current Attachment
                  </a>
                )}
              </div>
              <div className="form-group col-md-4">
                <label>Status:</label>
                <br />
                <label className="switch">
                  <input
                    type="checkbox"
                    name="status"
                    checked={reportData.status}
                    onChange={handleInputChange}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button type="button" className="btn btn-primary mr-2 px-4" onClick={handleSubmit}>
                {isEditMode ? "Update" : "Save"}
              </button>
              <button type="button" className="btn btn-secondary px-4" onClick={() => navigate("/investigation-reports")}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvestigationReport;