import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import Select from "react-select";

const CreateOpdPatient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [opdData, setOpdData] = useState({
    patientId: null,
    caseId: null,
    height: "",
    weight: "",
    bloodPressure: "",
    visitDate: "",
    doctorId: null,
    standardCharge: "",
    paymentMode: "",
    symptoms: "",
    notes: "",
  });

  const [patients, setPatients] = useState([]);
  const [cases, setCases] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const paymentModes = [
    { value: "Cash", label: "Cash" },
    { value: "Credit Card", label: "Credit Card" },
    { value: "Debit Card", label: "Debit Card" },
    { value: "UPI", label: "UPI" },
    { value: "Insurance", label: "Insurance" },
  ];

  const fetchData = async () => {
    try {
      const [patientsRes, doctorsRes] = await Promise.all([
        axios.get("http://localhost:8080/api/patients"),
        axios.get("http://localhost:8080/api/doctors"),
      ]);
      setPatients(patientsRes.data.map(p => ({ value: p.id, label: `${p.firstName} ${p.lastName}` })));
      setDoctors(doctorsRes.data.map(d => ({ value: d.id, label: `${d.firstName} ${d.lastName}` })));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    }
  };

  const fetchOpdPatient = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/opd-patients/${id}`);
      const opd = res.data;
      setOpdData({
        patientId: { value: opd.patientId, label: `${opd.patient.firstName} ${opd.patient.lastName}` },
        caseId: opd.caseId ? { value: opd.caseId, label: opd.caseId } : null,
        height: opd.height || "",
        weight: opd.weight || "",
        bloodPressure: opd.bloodPressure || "",
        visitDate: new Date(opd.visitDate).toISOString().slice(0, 16),
        doctorId: { value: opd.doctorId, label: `${opd.doctor.firstName} ${opd.doctor.lastName}` },
        standardCharge: opd.standardCharge || "",
        paymentMode: opd.paymentMode ? { value: opd.paymentMode, label: opd.paymentMode } : null,
        symptoms: opd.symptoms || "",
        notes: opd.notes || "",
      });

      const casesRes = await axios.get(`http://localhost:8080/api/cases/patient/${opd.patientId}`);
      setCases(casesRes.data.map(c => ({ value: c.id, label: c.caseId })));

      if (opd.caseId) {
        const selectedCase = casesRes.data.find(c => c.id === opd.caseId);
        if (selectedCase) {
          setOpdData(prev => ({
            ...prev,
            caseId: { value: selectedCase.id, label: selectedCase.caseId }
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching OPD patient:", error);
      toast.error("Failed to load OPD patient");
    }
  };

  useEffect(() => {
    fetchData();
    if (isEditMode) fetchOpdPatient();
  }, [isEditMode, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOpdData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = async (name, selectedOption) => {
    setOpdData((prev) => ({
      ...prev,
      [name]: selectedOption,
    }));

    if (name === "patientId" && selectedOption) {
      try {
        const res = await axios.get(`http://localhost:8080/api/cases/patient/${selectedOption.value}`);
        setCases(res.data.map(c => ({ value: c.id, label: c.caseId })));
        setOpdData((prev) => ({ ...prev, caseId: null }));
      } catch (error) {
        toast.error("Failed to fetch cases");
      }
    }

    if (name === "doctorId" && selectedOption) {
      try {
        const res = await axios.get(`http://localhost:8080/api/doctorOpdCharges/doctor/${selectedOption.value}`);
        setOpdData((prev) => ({
          ...prev,
          standardCharge: res.data.standardCharge || "",
        }));
      } catch (error) {
        toast.error("Failed to fetch doctor charge");
        setOpdData((prev) => ({ ...prev, standardCharge: "" }));
      }
    }
  };

  const validateForm = () => {
    if (!opdData.patientId) {
      toast.error("Patient is required");
      return false;
    }
    if (!opdData.visitDate) {
      toast.error("Visit Date is required");
      return false;
    }
    if (!opdData.doctorId) {
      toast.error("Doctor is required");
      return false;
    }
    if (!opdData.standardCharge) {
      toast.error("Standard Charge is required");
      return false;
    }
    if (!opdData.paymentMode) {
      toast.error("Payment Mode is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const opdToSave = {
      ...opdData,
      patientId: opdData.patientId?.value,
      caseId: opdData.caseId?.value || null,
      doctorId: opdData.doctorId?.value,
      standardCharge: opdData.standardCharge,
      paymentMode: opdData.paymentMode?.value,
    };

    try {
      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/opd-patients/${id}`, opdToSave);
        toast.success("OPD Patient updated successfully");
      } else {
        await axios.post(`http://localhost:8080/api/opd-patients`, opdToSave);
        toast.success("OPD Patient added successfully");
        setOpdData({
          patientId: null,
          caseId: null,
          height: "",
          weight: "",
          bloodPressure: "",
          visitDate: "",
          doctorId: null,
          standardCharge: "",
          paymentMode: "",
          symptoms: "",
          notes: "",
        });
        setCases([]);
      }
      setTimeout(() => {
        navigate("/opd-patients");
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error.response || error);
      toast.error("Error saving OPD patient: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">{isEditMode ? "Edit OPD Patient" : "New OPD Patient"}</h1>
            <button className="btn btn-primary px-4" onClick={() => navigate("/opd-patients")}>
              Back
            </button>
          </div>

          <div className="card p-4 border-0">
            <div className="row">
              <div className="form-group col-md-4">
                <label>Patient: <span className="text-danger">*</span></label>
                <Select
                  options={patients}
                  value={opdData.patientId}
                  onChange={(option) => handleSelectChange("patientId", option)}
                  placeholder="Select Patient"
                />
              </div>
              <div className="form-group col-md-4">
                <label>Case:</label>
                <Select
                  options={cases}
                  value={opdData.caseId}
                  onChange={(option) => handleSelectChange("caseId", option)}
                  placeholder="Select Case"
                  isClearable
                />
              </div>
              <div className="form-group col-md-4">
                <label>Height:</label>
                <input
                  type="number"
                  name="height"
                  placeholder="Height"
                  value={opdData.height}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Weight:</label>
                <input
                  type="number"
                  name="weight"
                  placeholder="Weight"
                  value={opdData.weight}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Blood Pressure:</label>
                <input
                  type="text"
                  name="bloodPressure"
                  placeholder="Blood Pressure"
                  value={opdData.bloodPressure}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Visit Date: <span className="text-danger">*</span></label>
                <input
                  type="datetime-local"
                  name="visitDate"
                  value={opdData.visitDate}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Doctor: <span className="text-danger">*</span></label>
                <Select
                  options={doctors}
                  value={opdData.doctorId}
                  onChange={(option) => handleSelectChange("doctorId", option)}
                  placeholder="Select Doctor"
                />
              </div>
              <div className="form-group col-md-4">
                <label>Standard Charge: <span className="text-danger">*</span></label>
                <input
                  type="number"
                  name="standardCharge"
                  placeholder="Standard Charge"
                  value={opdData.standardCharge}
                  className="form-control"
                  onChange={handleInputChange}
                  readOnly
                />
              </div>
              <div className="form-group col-md-4">
                <label>Payment Mode: <span className="text-danger">*</span></label>
                <Select
                  options={paymentModes}
                  value={opdData.paymentMode}
                  onChange={(option) => handleSelectChange("paymentMode", option)}
                  placeholder="Select Payment Mode"
                />
              </div>
              <div className="form-group col-md-4">
                <label>Symptoms:</label>
                <input
                  type="text"
                  name="symptoms"
                  placeholder="Symptoms"
                  value={opdData.symptoms}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-12">
                <label>Notes:</label>
                <textarea
                  name="notes"
                  placeholder="Notes"
                  value={opdData.notes}
                  className="form-control"
                  onChange={handleInputChange}
                  rows="3"
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
                onClick={() => navigate("/opd-patients")}
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

export default CreateOpdPatient;