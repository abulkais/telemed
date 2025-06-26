import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from 'react-select';
const CreateCases = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [caseData, setCaseData] = useState({
    patientId: "",
    doctorId: "",
    caseDate: "",
    countryCode: "+91",
    phoneNumber: "",
    status: true,
    fees: "",
    description: "",
  });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const fetchPatientsAndDoctors = async () => {
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        axios.get("http://localhost:8080/api/getPatientsbyStatus"),
        axios.get("http://localhost:8080/api/getDoctorsByStatus"),
      ]);
      setPatients(patientsRes.data);
      setDoctors(doctorsRes.data);
    } catch (error) {
      console.error("Error fetching patients or doctors:", error);
      toast.error("Failed to load patients or doctors");
    }
  };

  const fetchCase = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/cases/${id}`);
      const caseItem = res.data;
      setCaseData({
        patientId: caseItem.patientId || "",
        doctorId: caseItem.doctorId || "",
        caseDate: caseItem.caseDate ? caseItem.caseDate.split("T")[0] : "",
        countryCode: caseItem.countryCode || "+91",
        phoneNumber: caseItem.phoneNumber || "",
        status: !!caseItem.status,
        fees: caseItem.fees || "",
        description: caseItem.description || "",
      });
    } catch (error) {
      console.error("Error fetching case:", error);
      toast.error("Failed to load case");
    }
  };

  useEffect(() => {
    fetchPatientsAndDoctors();
    if (isEditMode) {
      fetchCase();
    }
  }, [isEditMode, id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCaseData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    if (!caseData.patientId) {
      toast.error("Patient is required");
      return false;
    }
    if (!caseData.doctorId) {
      toast.error("Doctor is required");
      return false;
    }
    if (!caseData.caseDate) {
      toast.error("Case Date is required");
      return false;
    }
    if (!caseData.countryCode) {
      toast.error("Country code is required");
      return false;
    }
    if (!caseData.phoneNumber) {
      toast.error("Phone number is required");
      return false;
    }
    if (!caseData.fees || isNaN(caseData.fees) || caseData.fees <= 0) {
      toast.error("Valid fee is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const caseToSave = {
      ...caseData,
      created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      updated_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      status: caseData.status ? "1" : "0",
    };

    try {
      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/cases/${id}`, caseToSave, {
          headers: { "Content-Type": "application/json" },
        });
        toast.success("Case updated successfully");
      } else {
        await axios.post(`http://localhost:8080/api/cases`, caseToSave, {
          headers: { "Content-Type": "application/json" },
        });
        toast.success("Case added successfully");
        setCaseData({
          patientId: "",
          doctorId: "",
          caseDate: "",
          countryCode: "+91",
          phoneNumber: "",
          status: true,
          fees: "",
          description: "",
        });
      }
      setTimeout(() => {
        navigate("/cases");
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error.response || error);
      const errorMessage = error.response?.data?.error || error.message;
      toast.error("Error saving case: " + errorMessage);
    }
  };

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">{isEditMode ? "Edit Case" : "New Case"}</h1>
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/cases")}
            >
              Back
            </button>
          </div>

          <div className="card p-4 border-0">
            <div className="row">
              <div className="form-group col-md-6">
                <label>
                  Patient: <span className="text-danger">*</span>
                </label>

                
                <select
                  name="patientId"
                  value={caseData.patientId}
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
              <div className="form-group col-md-6">
                <label>
                  Doctor: <span className="text-danger">*</span>
                </label>
                <select
                  name="doctorId"
                  value={caseData.doctorId}
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
              <div className="form-group col-md-6">
                <label>
                  Case Date: <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  name="caseDate"
                  value={caseData.caseDate}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-6">
                <label>
                  Phone: <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <PhoneInput
                    country={"id"}
                    value={caseData.countryCode}
                    onChange={(countryCode) =>
                      setCaseData((prev) => ({
                        ...prev,
                        countryCode: `+${countryCode}`,
                      }))
                    }
                    inputClass="form-control"
                    containerStyle={{ width: "13%" }}
                    inputStyle={{ width: "100%" }}
                    placeholder=""
                    enableSearch={true}
                    disableDropdown={false}
                  />
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={caseData.phoneNumber}
                    className="form-control"
                    onChange={(e) => {
                      const phoneNumber = e.target.value.replace(/[^0-9]/g, "");
                      setCaseData((prev) => ({ ...prev, phoneNumber }));
                    }}
                    style={{ width: "81%" }}
                  />
                </div>
              </div>
              <div className="form-group col-md-6">
                <label>Status:</label> <br />
                <label className="switch">
                  <input
                    type="checkbox"
                    name="status"
                    checked={caseData.status}
                    onChange={handleInputChange}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="form-group col-md-6">
                <label>
                  Fee: <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="fees"
                  placeholder="Fee"
                  value={caseData.fees}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-12">
                <label>Description:</label>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={caseData.description}
                  className="form-control"
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-primary mr-2 px-4"
                onClick={handleSubmit}
              >
                {isEditMode ? "Update" : "Save"}
              </button>
              <button
                type="button"
                className="btn btn-secondary px-4"
                onClick={() => navigate("/cases")}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCases;