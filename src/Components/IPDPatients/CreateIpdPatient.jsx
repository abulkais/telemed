import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import Select from "react-select";

const CreateIpdPatient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [ipdData, setIpdData] = useState({
    patientId: null,
    caseId: null,
    height: "",
    weight: "",
    bloodPressure: "",
    admissionDate: "",
    doctorId: null,
    bedTypeId: null,
    bedId: null,
    idCardNumber: "",
    isOldPatient: true,
    symptoms: "",
    notes: "",
  });

  const [patients, setPatients] = useState([]);
  const [cases, setCases] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [bedTypes, setBedTypes] = useState([]);
  const [beds, setBeds] = useState([]);

  const fetchData = async () => {
    try {
      const [patientsRes, doctorsRes, bedTypesRes] = await Promise.all([
        axios.get("http://localhost:8080/api/patients"),
        axios.get("http://localhost:8080/api/doctors"),
        axios.get("http://localhost:8080/api/bedTypes"),
      ]);
      setPatients(patientsRes.data.map(p => ({ value: p.id, label: `${p.firstName} ${p.lastName}` })));
      setDoctors(doctorsRes.data.map(d => ({ value: d.id, label: `${d.firstName} ${d.lastName}` })));
      setBedTypes(bedTypesRes.data.map(bt => ({ value: bt.id, label: bt.name })));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    }
  };

  // const fetchIpdPatient = async () => {
  //   try {
  //     const res = await axios.get(`http://localhost:8080/api/ipd-patients/${id}`);
  //     const ipd = res.data;
  //     setIpdData({
  //       patientId: { value: ipd.patientId, label: `${ipd.patient.firstName} ${ipd.patient.lastName}` },
  //       caseId: ipd.caseId ? { value: ipd.id, label: ipd.caseId } : null,
  //       height: ipd.height || "",
  //       weight: ipd.weight || "",
  //       bloodPressure: ipd.bloodPressure || "",
  //       admissionDate: new Date(ipd.admissionDate).toISOString().slice(0, 16),
  //       doctorId: { value: ipd.doctorId, label: `${ipd.doctor.firstName} ${ipd.doctor.lastName}` },
  //       bedTypeId: { value: ipd.bedTypeId, label: ipd.bedType.name },
  //       bedId: { value: ipd.bedId, label: ipd.bed.name },
  //       idCardNumber: ipd.idCardNumber || "",
  //       isOldPatient: !!ipd.isOldPatient,
  //       symptoms: ipd.symptoms || "",
  //       notes: ipd.notes || "",
  //     });

  //     // Fetch cases and beds for the selected patient and bed type
  //     const [casesRes, bedsRes] = await Promise.all([
  //       axios.get(`http://localhost:8080/api/cases/patient/${ipd.patientId}`),
  //       axios.get(`http://localhost:8080/api/beds/bedtype/${ipd.bedTypeId}`),
  //     ]);
  //     setCases(casesRes.data.map(c => ({ value: c.id, label: c.caseId  })));
  //     setBeds(bedsRes.data.map(b => ({ value: b.id, label: b.name })));
  //   } catch (error) {
  //     console.error("Error fetching IPD patient:", error);
  //     toast.error("Failed to load IPD patient");
  //   }
  // };
  const fetchIpdPatient = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/ipd-patients/${id}`);
      const ipd = res.data;
      setIpdData({
        patientId: { value: ipd.patientId, label: `${ipd.patient.firstName} ${ipd.patient.lastName}` },
        caseId: ipd.caseId ? { value: ipd.caseId, label: ipd.caseId } : null, // We'll fetch the caseId label separately
        height: ipd.height || "",
        weight: ipd.weight || "",
        bloodPressure: ipd.bloodPressure || "",
        admissionDate: new Date(ipd.admissionDate).toISOString().slice(0, 16),
        doctorId: { value: ipd.doctorId, label: `${ipd.doctor.firstName} ${ipd.doctor.lastName}` },
        bedTypeId: { value: ipd.bedTypeId, label: ipd.bedType.name },
        bedId: { value: ipd.bedId, label: ipd.bed.name },
        idCardNumber: ipd.idCardNumber || "",
        isOldPatient: !!ipd.isOldPatient,
        symptoms: ipd.symptoms || "",
        notes: ipd.notes || "",
      });

      // Fetch cases and beds for the selected patient and bed type
      const [casesRes, bedsRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/cases/patient/${ipd.patientId}`),
        axios.get(`http://localhost:8080/api/beds/bedtype/${ipd.bedTypeId}`),
      ]);
      setCases(casesRes.data.map(c => ({ value: c.id, label: c.caseId })));
      setBeds(bedsRes.data.map(b => ({ value: b.id, label: b.name })));

      // Update caseId label after fetching cases
      if (ipd.caseId) {
        const selectedCase = casesRes.data.find(c => c.id === ipd.caseId);
        if (selectedCase) {
          setIpdData(prev => ({
            ...prev,
            caseId: { value: selectedCase.id, label: selectedCase.caseId }
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching IPD patient:", error);
      toast.error("Failed to load IPD patient");
    }
  };


  useEffect(() => {
    fetchData();
    if (isEditMode) fetchIpdPatient();
  }, [isEditMode, id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setIpdData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  const handleSelectChange = async (name, selectedOption) => {
    setIpdData((prev) => ({
      ...prev,
      [name]: selectedOption,
    }));

    if (name === "patientId" && selectedOption) {
      try {
        const res = await axios.get(`http://localhost:8080/api/cases/patient/${selectedOption.value}`);
        setCases(res.data.map(c => ({ value: c.id, label: c.caseId })));
        setIpdData((prev) => ({ ...prev, caseId: null })); // Reset caseId when patient changes
      } catch (error) {
        toast.error("Failed to fetch cases");
      }
    }

    if (name === "bedTypeId" && selectedOption) {
      try {
        const res = await axios.get(`http://localhost:8080/api/beds/bedtype/${selectedOption.value}`);
        setBeds(res.data.map(b => ({ value: b.id, label: b.name })));
        setIpdData((prev) => ({ ...prev, bedId: null })); // Reset bed selection
      } catch (error) {
        toast.error("Failed to fetch beds");
      }
    }
  };
  const validateForm = () => {
    if (!ipdData.patientId) {
      toast.error("Patient is required");
      return false;
    }
    if (!ipdData.admissionDate) {
      toast.error("Admission Date is required");
      return false;
    }
    if (!ipdData.doctorId) {
      toast.error("Doctor is required");
      return false;
    }
    if (!ipdData.bedTypeId) {
      toast.error("Bed Type is required");
      return false;
    }
    if (!ipdData.bedId) {
      toast.error("Bed is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const ipdToSave = {
      ...ipdData,
      patientId: ipdData.patientId?.value,
      caseId: ipdData.caseId?.value || null,
      doctorId: ipdData.doctorId?.value,
      bedTypeId: ipdData.bedTypeId?.value,
      bedId: ipdData.bedId?.value,
      isOldPatient: ipdData.isOldPatient ? "true" : "false",
    };

    try {
      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/ipd-patients/${id}`, ipdToSave);
        toast.success("IPD Patient updated successfully");
      } else {
        await axios.post(`http://localhost:8080/api/ipd-patients`, ipdToSave);
        toast.success("IPD Patient added successfully");
        setIpdData({
          patientId: null,
          caseId: null,
          height: "",
          weight: "",
          bloodPressure: "",
          admissionDate: "",
          doctorId: null,
          bedTypeId: null,
          bedId: null,
          idCardNumber: "",
          isOldPatient: false,
          symptoms: "",
          notes: "",
        });
        setCases([]);
        setBeds([]);
      }
      setTimeout(() => {
        navigate("/ipd-patients");
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error.response || error);
      toast.error("Error saving IPD patient: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">{isEditMode ? "Edit IPD Patient" : "New IPD Patient"}</h1>
            <button className="btn btn-primary px-4" onClick={() => navigate("/ipd-patients")}>
              Back
            </button>
          </div>

          <div className="card p-4 border-0">
            <div className="row">
              <div className="form-group col-md-4">
                <label>Patient: <span className="text-danger">*</span></label>
                <Select
                  options={patients}
                  value={ipdData.patientId}
                  onChange={(option) => handleSelectChange("patientId", option)}
                  placeholder="Select Patient"
                />
              </div>
              <div className="form-group col-md-4">
                <label>Case:</label>
                <Select
                  options={cases}
                  value={ipdData.caseId}
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
                  value={ipdData.height}
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
                  value={ipdData.weight}
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
                  value={ipdData.bloodPressure}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Admission Date: <span className="text-danger">*</span></label>
                <input
                  type="datetime-local"
                  name="admissionDate"
                  value={ipdData.admissionDate}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Doctor: <span className="text-danger">*</span></label>
                <Select
                  options={doctors}
                  value={ipdData.doctorId}
                  onChange={(option) => handleSelectChange("doctorId", option)}
                  placeholder="Select Doctor"
                />
              </div>
              <div className="form-group col-md-4">
                <label>Bed Type: <span className="text-danger">*</span></label>
                <Select
                  options={bedTypes}
                  value={ipdData.bedTypeId}
                  onChange={(option) => handleSelectChange("bedTypeId", option)}
                  placeholder="Select Bed Type"
                />
              </div>
              <div className="form-group col-md-4">
                <label>Bed: <span className="text-danger">*</span></label>
                <Select
                  options={beds}
                  value={ipdData.bedId}
                  onChange={(option) => handleSelectChange("bedId", option)}
                  placeholder="Select Bed"
                />
              </div>
              <div className="form-group col-md-4">
                <label>ID Card Number:</label>
                <input
                  type="text"
                  name="idCardNumber"
                  placeholder="ID Card Number"
                  value={ipdData.idCardNumber}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Is Old Patient:</label>
                <br />
                <label className="switch">
                  <input
                    type="checkbox"
                    name="isOldPatient"
                    checked={ipdData.isOldPatient}
                    onChange={handleInputChange}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="form-group col-md-4">
                <label>Symptoms:</label>
                <input
                  type="text"
                  name="symptoms"
                  placeholder="Symptoms"
                  value={ipdData.symptoms}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-12">
                <label>Notes:</label>
                <textarea
                  name="notes"
                  placeholder="Notes"
                  value={ipdData.notes}
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
                onClick={() => navigate("/ipd-patients")}
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

export default CreateIpdPatient;