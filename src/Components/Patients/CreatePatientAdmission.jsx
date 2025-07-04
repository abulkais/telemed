import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import Select from "react-select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const CreatePatientAdmission = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [admissionData, setAdmissionData] = useState({
    patientId: null,
    doctorId: null,
    admissionDate: "",
    packageId: null,
    insuranceId: null,
    bedId: null,
    policyNo: "",
    agentName: "",
    guardianName: "",
    guardianRelation: "",
    countryCode: "+91",
    guardianContact: "",
    guardianAddress: "",
    status: true,
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [packages, setPackages] = useState([]);
  const [insurances, setInsurances] = useState([]);
  const [beds, setBeds] = useState([]);

  const fetchData = async () => {
    try {
      const [patientsRes, doctorsRes, packagesRes, insurancesRes, bedsRes] =
        await Promise.all([
          axios.get("http://localhost:8080/api/getPatientsbyStatus"),
          axios.get("http://localhost:8080/api/getDoctorsByStatus"),
          axios.get("http://localhost:8080/api/packages"),
          axios.get("http://localhost:8080/api/getInsurancesByStatus"),
          axios.get("http://localhost:8080/api/beds"),
        ]);
      setPatients(
        patientsRes.data.map((p) => ({
          value: p.id,
          label: `${p.firstName} ${p.lastName}`,
        }))
      );
      setDoctors(
        doctorsRes.data.map((d) => ({
          value: d.id,
          label: `${d.firstName} ${d.lastName}`,
        }))
      );
      setPackages(
        packagesRes.data.map((p) => ({ value: p.id, label: p.packageName }))
      );
      setInsurances(
        insurancesRes.data.map((i) => ({ value: i.id, label: i.insuranceName }))
      );
      setBeds(bedsRes.data.map((b) => ({ value: b.id, label: b.name })));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    }
  };

  const fetchAdmission = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/patient-admissions/${id}`
      );
      const admission = res.data;
      const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const offset = d.getTimezoneOffset();
        const localDate = new Date(d.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
      };

      setAdmissionData({
        patientId: {
          value: admission.patientId,
          label: `${admission.patient.firstName} ${admission.patient.lastName}`,
        },
        doctorId: {
          value: admission.doctorId,
          label: `${admission.doctor.firstName} ${admission.doctor.lastName}`,
        },
        admissionDate: formatDate(admission.admissionDate),
        packageId: admission.packageId
          ? { value: admission.packageId, label: admission.package.packageName }
          : null,
        insuranceId: admission.insuranceId
          ? {
              value: admission.insuranceId,
              label: admission.insurance.insuranceName,
            }
          : null,
        bedId: admission.bedId
          ? { value: admission.bedId, label: admission.bed.name }
          : null,
        policyNo: admission.policyNo || "",
        agentName: admission.agentName || "",
        guardianName: admission.guardianName || "",
        guardianRelation: admission.guardianRelation || "",
        countryCode: admission.countryCode || "+91",
        guardianContact: admission.guardianContact || "",
        guardianAddress: admission.guardianAddress || "",
        status: !!admission.status,
      });
    } catch (error) {
      console.error("Error fetching admission:", error);
      toast.error("Failed to load admission");
    }
  };

  useEffect(() => {
    fetchData();
    if (isEditMode) fetchAdmission();
  }, [isEditMode, id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAdmissionData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setAdmissionData((prev) => ({
      ...prev,
      [name]: selectedOption,
    }));
  };

  const validateForm = () => {
    if (!admissionData.patientId) {
      toast.error("Patient is required");
      return false;
    }
    if (!admissionData.doctorId) {
      toast.error("Doctor is required");
      return false;
    }
    if (!admissionData.admissionDate) {
      toast.error("Admission Date is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const admissionToSave = {
      ...admissionData,
      patientId: admissionData.patientId?.value,
      doctorId: admissionData.doctorId?.value,
      packageId: admissionData.packageId?.value || null,
      insuranceId: admissionData.insuranceId?.value || null,
      bedId: admissionData.bedId?.value || null,
      status: admissionData.status ? "1" : "0",
    };

    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:8080/api/patient-admissions/${id}`,
          admissionToSave
        );
        toast.success("Admission updated successfully");
      } else {
        await axios.post(
          `http://localhost:8080/api/patient-admissions`,
          admissionToSave
        );
        toast.success("Admission added successfully");
        setAdmissionData({
          patientId: null,
          doctorId: null,
          admissionDate: "",
          packageId: null,
          insuranceId: null,
          bedId: null,
          policyNo: "",
          agentName: "",
          guardianName: "",
          guardianRelation: "",
          countryCode: "+91",
          guardianContact: "",
          guardianAddress: "",
          status: true,
        });
      }
      setTimeout(() => {
        navigate("/patient-admissions");
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error.response || error);
      toast.error(
        "Error saving admission: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">
              {isEditMode ? "Edit Admission" : "New Patient Admission"}
            </h1>
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/patient-admissions")}
            >
              Back
            </button>
          </div>

          <div className="card p-4 border-0">
            <div className="row">
              <div className="form-group col-md-4">
                <label>
                  Patient: <span className="text-danger">*</span>
                </label>
                <Select
                  options={patients}
                  value={admissionData.patientId}
                  onChange={(option) => handleSelectChange("patientId", option)}
                  placeholder="Select Patient"
                />
              </div>
              <div className="form-group col-md-4">
                <label>
                  Doctor: <span className="text-danger">*</span>
                </label>
                <Select
                  options={doctors}
                  value={admissionData.doctorId}
                  onChange={(option) => handleSelectChange("doctorId", option)}
                  placeholder="Select Doctor"
                />
              </div>
              <div className="form-group col-md-4">
                <label>
                  Admission Date: <span className="text-danger">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="admissionDate"
                  value={admissionData.admissionDate}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Package:</label>
                <Select
                  options={packages}
                  value={admissionData.packageId}
                  onChange={(option) => handleSelectChange("packageId", option)}
                  placeholder="Choose Package"
                  isClearable
                />
              </div>
              <div className="form-group col-md-4">
                <label>Insurance:</label>
                <Select
                  options={insurances}
                  value={admissionData.insuranceId}
                  onChange={(option) =>
                    handleSelectChange("insuranceId", option)
                  }
                  placeholder="Choose Insurance"
                  isClearable
                />
              </div>
              <div className="form-group col-md-4">
                <label>Bed:</label>
                <Select
                  options={beds}
                  value={admissionData.bedId}
                  onChange={(option) => handleSelectChange("bedId", option)}
                  placeholder="Choose Bed"
                  isClearable
                />
              </div>
              <div className="form-group col-md-4">
                <label>Policy No:</label>
                <input
                  type="text"
                  name="policyNo"
                  placeholder="Policy No"
                  value={admissionData.policyNo}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Agent Name:</label>
                <input
                  type="text"
                  name="agentName"
                  placeholder="Agent Name"
                  value={admissionData.agentName}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Guardian Name:</label>
                <input
                  type="text"
                  name="guardianName"
                  placeholder="Guardian Name"
                  value={admissionData.guardianName}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Guardian Relation:</label>
                <input
                  type="text"
                  name="guardianRelation"
                  placeholder="Guardian Relation"
                  value={admissionData.guardianRelation}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Guardian Contact:</label>
                <div className="input-group">
                  <PhoneInput
                    country={"id"}
                    value={admissionData.countryCode}
                    onChange={(code) =>
                      setAdmissionData((prev) => ({
                        ...prev,
                        countryCode: `+${code}`,
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
                    name="guardianContact"
                    placeholder="Guardian Contact"
                    value={admissionData.guardianContact}
                    className="form-control"
                    onChange={(e) => {
                      const contact = e.target.value.replace(/[^0-9]/g, "");
                      setAdmissionData((prev) => ({
                        ...prev,
                        guardianContact: contact,
                      }));
                    }}
                    style={{ width: "81%" }}
                  />
                </div>
              </div>
              <div className="form-group col-md-4">
                <label>Guardian Address:</label>
                <input
                  type="text"
                  name="guardianAddress"
                  placeholder="Guardian Address"
                  value={admissionData.guardianAddress}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Status:</label>
                <br />
                <label className="switch">
                  <input
                    type="checkbox"
                    name="status"
                    checked={admissionData.status}
                    onChange={handleInputChange}
                  />
                  <span className="slider round"></span>
                </label>
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
                onClick={() => navigate("/patient-admissions")}
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

export default CreatePatientAdmission;
