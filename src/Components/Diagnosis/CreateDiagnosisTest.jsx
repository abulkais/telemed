import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";

const CreateDiagnosisTest = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [diagnosisData, setDiagnosisData] = useState({
    patientId: "",
    doctorId: "",
    diagnosisCategoryId: "",
    reportNumber: "", // Will be auto-generated, but needed for edit mode
    age: "",
    height: "",
    weight: "",
    averageGlucose: "",
    fastingBloodSugar: "",
    urineSugar: "",
    bloodPressure: "",
    diabetes: "",
    cholesterol: "",
  });

  const [properties, setProperties] = useState([
    { propertyName: "", propertyValue: "" },
  ]);

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [categories, setCategories] = useState([]);

  const fetchDiagnosisTest = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/diagnosis-tests/${id}`
      );
      const data = res.data;

      setDiagnosisData({
        patientId: data.patientId || "",
        doctorId: data.doctorId || "",
        diagnosisCategoryId: data.diagnosisCategoryId || "",
        reportNumber: data.reportNumber || "",
        age: data.age || "",
        height: data.height || "",
        weight: data.weight || "",
        averageGlucose: data.averageGlucose || "",
        fastingBloodSugar: data.fastingBloodSugar || "",
        urineSugar: data.urineSugar || "",
        bloodPressure: data.bloodPressure || "",
        diabetes: data.diabetes || "",
        cholesterol: data.cholesterol || "",
      });

      // Initialize properties with at least 2 empty fields if none exist
      const fetchedProperties = data.properties || [];
      const initialProperties = [
        ...fetchedProperties,
        ...Array(Math.max(0, 1 - fetchedProperties.length)).fill({
          propertyName: "",
          propertyValue: "",
        }),
      ];
      setProperties(initialProperties);
    } catch (error) {
      console.error("Error fetching diagnosis test:", error);
      toast.error("Failed to load diagnosis test");
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/getPatientsbyStatus");
      setPatients(res.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/getDoctorsByStatus");
      setDoctors(res.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/medicinescategories"
      );
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDiagnosisData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePropertyChange = (index, field, value) => {
    const updatedProperties = [...properties];
    updatedProperties[index] = {
      ...updatedProperties[index],
      [field]: value,
    };
    setProperties(updatedProperties);
  };

  const addProperty = () => {
    setProperties([...properties, { propertyName: "", propertyValue: "" }]);
  };

  const removeProperty = (index) => {
    if (properties.length > 1) {
      setProperties(properties.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    if (!diagnosisData.patientId) {
      toast.error("Patient is required");
      return false;
    }
    if (!diagnosisData.doctorId) {
      toast.error("Doctor is required");
      return false;
    }
    if (!diagnosisData.diagnosisCategoryId) {
      toast.error("Diagnosis Category is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const filteredProperties = properties.filter(
      (prop) => prop.propertyName.trim() && prop.propertyValue.trim()
    );

    const payload = {
      ...diagnosisData,
      properties: filteredProperties,
    };

    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:8080/api/diagnosis-tests/${id}`,
          payload
        );
        toast.success("Diagnosis test updated successfully");
      } else {
        const response = await axios.post(
          "http://localhost:8080/api/diagnosis-tests",
          payload
        );
        toast.success(
          `Diagnosis test added successfully. Report Number: ${response.data.reportNumber}`
        );
        setDiagnosisData({
          patientId: "",
          doctorId: "",
          diagnosisCategoryId: "",
          reportNumber: "",
          age: "",
          height: "",
          weight: "",
          averageGlucose: "",
          fastingBloodSugar: "",
          urineSugar: "",
          bloodPressure: "",
          diabetes: "",
          cholesterol: "",
        });
        setProperties([
          { propertyName: "", propertyValue: "" },
        ]);
      }
      setTimeout(() => {
        navigate("/diagnosis-tests");
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error.response || error);
      const errorMessage = error.response?.data?.error || error.message;
      toast.error("Error saving diagnosis test: " + errorMessage);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
    fetchCategories();
    if (isEditMode) {
      fetchDiagnosisTest();
    }
  }, [isEditMode, id]);

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">
              {isEditMode ? "Edit Diagnosis Test" : "New Diagnosis Test"}
            </h1>
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/diagnosis-tests")}
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
                <select
                  name="patientId"
                  value={diagnosisData.patientId}
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
                  value={diagnosisData.doctorId}
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
                  Diagnosis Category: <span className="text-danger">*</span>
                </label>
                <select
                  name="diagnosisCategoryId"
                  value={diagnosisData.diagnosisCategoryId}
                  className="form-control"
                  onChange={handleInputChange}
                >
                  <option value="">Choose Diagnosis Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group col-md-4" style={{display:'none'}}>
                <label>Report Number:</label>
                <input
                  type="text"
                  name="reportNumber"
                  value={diagnosisData.reportNumber}
                  className="form-control"
                  readOnly
                />
              </div>

              <div className="form-group col-md-4">
                <label>Age:</label>
                <input
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={diagnosisData.age}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Height:</label>
                <input
                  type="number"
                  name="height"
                  placeholder="Height"
                  value={diagnosisData.height}
                  className="form-control"
                  onChange={handleInputChange}
                  step="0.1"
                />
              </div>
              <div className="form-group col-md-4">
                <label>Weight:</label>
                <input
                  type="number"
                  name="weight"
                  placeholder="Weight"
                  value={diagnosisData.weight}
                  className="form-control"
                  onChange={handleInputChange}
                  step="0.1"
                />
              </div>

              <div className="form-group col-md-4">
                <label>Average Glucose:</label>
                <input
                  type="number"
                  name="averageGlucose"
                  placeholder="Average Glucose"
                  value={diagnosisData.averageGlucose}
                  className="form-control"
                  onChange={handleInputChange}
                  step="0.1"
                />
              </div>
              <div className="form-group col-md-4">
                <label>Fasting Blood Sugar:</label>
                <input
                  type="number"
                  name="fastingBloodSugar"
                  placeholder="Fasting Blood Sugar"
                  value={diagnosisData.fastingBloodSugar}
                  className="form-control"
                  onChange={handleInputChange}
                  step="0.1"
                />
              </div>
              <div className="form-group col-md-4">
                <label>Urine Sugar:</label>
                <input
                  type="number"
                  name="urineSugar"
                  placeholder="Urine Sugar"
                  value={diagnosisData.urineSugar}
                  className="form-control"
                  onChange={handleInputChange}
                  step="0.1"
                />
              </div>

              <div className="form-group col-md-4">
                <label>Blood Pressure:</label>
                <input
                  type="text"
                  name="bloodPressure"
                  placeholder="Blood Pressure"
                  value={diagnosisData.bloodPressure}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Diabetes:</label>
                <input
                  type="text"
                  name="diabetes"
                  placeholder="Diabetes"
                  value={diagnosisData.diabetes}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Cholesterol:</label>
                <input
                  type="number"
                  name="cholesterol"
                  placeholder="Cholesterol"
                  value={diagnosisData.cholesterol}
                  className="form-control"
                  onChange={handleInputChange}
                  step="0.1"
                />
              </div>
            </div>

            <hr />
            <h6>Add Other Diagnosis Properties</h6>
            <div className="row">
              <div className="col-md-12">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Diagnosis Property Name</th>
                      <th>Diagnosis Property Value</th>
                      <th>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={addProperty}
                        >
                          Add 
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((prop, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <input
                            type="text"
                            placeholder="Diagnosis Property Name"
                            value={prop.propertyName}
                            className="form-control"
                            onChange={(e) =>
                              handlePropertyChange(
                                index,
                                "propertyName",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Diagnosis Property Value"
                            value={prop.propertyValue}
                            className="form-control"
                            onChange={(e) =>
                              handlePropertyChange(
                                index,
                                "propertyValue",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => removeProperty(index)}
                            disabled={properties.length === 1}
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                onClick={() => navigate("/diagnosis-tests")}
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

export default CreateDiagnosisTest;
