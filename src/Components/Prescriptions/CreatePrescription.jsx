import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

const CreatePrescription = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    healthInsurance: "",
    lowIncome: "",
    reference: "",
    status: true,
    medicines: [
      {
        medicineId: "",
        dosage: "",
        doseDuration: "",
        time: "",
        doseInterval: "",
        comment: "",
      },
    ],
    highBloodPressure: "",
    foodAllergies: "",
    tendencyBleed: "",
    heartDisease: "",
    diabetic: "",
    addedAt: "",
    femalePregnancy: "",
    breastFeeding: "",
    currentMedication: "",
    surgery: "",
    accident: "",
    others: "",
    pulseRate: "",
    temperature: "",
    description: "",
    test: "",
    advice: "",
    nextVisitNumber: 1,
    nextVisitDay: "Days",
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [medicines, setMedicines] = useState([]);



  const fetchPatients = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/getPatientsbyStatus"
      );
      setPatients(res.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/getDoctorsByStatus"
      );
      setDoctors(res.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to load doctors");
    }
  };

  const fetchMedicines = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/medicines");
      setMedicines(res.data);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      toast.error("Failed to load medicines");
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
    fetchMedicines();
    if (isEditMode) {
      fetchPrescription();
    }
  }, [isEditMode, id]);

  const fetchPrescription = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/prescriptions/${id}`
      );
      const data = res.data;
      const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const offset = d.getTimezoneOffset();
        const localDate = new Date(d.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
      };
      console.log("Fetched Prescription Data:", data); // Debug log to check API response
      const parsedMedicines = Array.isArray(data.medicines)
        ? data.medicines
        : typeof data.medicines === "string"
          ? JSON.parse(data.medicines)
          : [
            {
              medicineId: "",
              dosage: "",
              doseDuration: "",
              time: "",
              doseInterval: "",
              comment: "",
            },
          ];

      setFormData({
        patientId: data.patientId || "",
        doctorId: data.doctorId || "",
        healthInsurance: data.healthInsurance || "",
        lowIncome: data.lowIncome || "",
        reference: data.reference || "",
        status: data.status !== undefined ? data.status : true,
        medicines:
          parsedMedicines.length > 0
            ? parsedMedicines
            : [
              {
                medicineId: "",
                dosage: "",
                doseDuration: "",
                time: "",
                doseInterval: "",
                comment: "",
              },
            ],
        highBloodPressure: data.highBloodPressure || "",
        foodAllergies: data.foodAllergies || "",
        tendencyBleed: data.tendencyBleed || "",
        heartDisease: data.heartDisease || "",
        diabetic: data.diabetic || "",
        addedAt: formatDate(data.addedT),
        femalePregnancy: data.femalePregnancy || "",
        breastFeeding: data.breastFeeding || "",
        currentMedication: data.currentMedication || "",
        surgery: data.surgery || "",
        accident: data.accident || "",
        others: data.others || "",
        pulseRate: data.pulseRate || "",
        temperature: data.temperature || "",
        description: data.description || "",
        test: data.test || "",
        advice: data.advice || "",
        nextVisitNumber: data.nextVisitNumber || 1,
        nextVisitDay: data.nextVisitDay || "Days",
      });
    } catch (error) {
      console.error("Error fetching prescription:", error);
      toast.error("Failed to load prescription");
    }
  };

  // Update handleInputChange to handle datetime-local
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "addedAt" && value ? new Date(value).toISOString() : value,
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...formData.medicines];
    updatedMedicines[index] = { ...updatedMedicines[index], [field]: value };
    setFormData((prev) => ({ ...prev, medicines: updatedMedicines }));
  };

  const addMedicine = () => {
    setFormData((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        {
          medicineId: "",
          dosage: "",
          doseDuration: "",
          time: "",
          doseInterval: "",
          comment: "",
        },
      ],
    }));
  };

  const removeMedicine = (index) => {
    if (formData.medicines.length > 1) {
      const updatedMedicines = formData.medicines.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, medicines: updatedMedicines }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filteredMedicines = formData.medicines.filter(
      (med) =>
        med.medicineId &&
        med.dosage &&
        med.doseDuration &&
        med.time &&
        med.doseInterval
    );

    const payload = {
      ...formData,
      medicines: filteredMedicines,
    };

    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:8080/api/prescriptions/${id}`,
          payload
        );
        toast.success("Prescription updated successfully");
      } else {
        await axios.post("http://localhost:8080/api/prescriptions", payload);
        toast.success("Prescription created successfully");
      }
      setTimeout(() => navigate("/prescriptions"), 2000);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving prescription");
    }
  };


  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">
              {isEditMode ? "Edit Prescription" : "New Prescription"}
            </h1>
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/prescriptions")}
            >
              Back
            </button>
          </div>

          <div className="card p-4 border-0 mb-5">
            <div className="row">
              <div className="form-group col-md-4">
                <label>
                  Patient: <span className="text-danger">*</span>
                </label>
                <Select
                  options={patients.map((patient) => ({
                    value: patient.id,
                    label: `${patient.firstName} ${patient.lastName} (${patient.email})`,
                  }))}
                  value={
                    patients.find((p) => p.id === formData.patientId)
                      ? {
                        value: formData.patientId,
                        label: `${patients.find((p) => p.id === formData.patientId)
                            .firstName
                          } ${patients.find((p) => p.id === formData.patientId)
                            .lastName
                          }`,
                      }
                      : null
                  }
                  onChange={(selectedOption) =>
                    handleInputChange({
                      target: {
                        name: "patientId",
                        value: selectedOption.value,
                      },
                    })
                  }
                  placeholder="Select Patient"
                />
              </div>
              <div className="form-group col-md-4">
                <label>
                  Doctor: <span className="text-danger">*</span>
                </label>
                <Select
                  options={doctors.map((doctor) => ({
                    value: doctor.id,
                    label: `${doctor.firstName} ${doctor.lastName} (${doctor.email})`,
                  }))}
                  value={
                    doctors.find((d) => d.id === formData.doctorId)
                      ? {
                        value: formData.doctorId,
                        label: `${doctors.find((d) => d.id === formData.doctorId)
                            .firstName
                          } ${doctors.find((d) => d.id === formData.doctorId)
                            .lastName
                          }`,
                      }
                      : null
                  }
                  onChange={(selectedOption) =>
                    handleInputChange({
                      target: { name: "doctorId", value: selectedOption.value },
                    })
                  }
                  placeholder="Select Doctor"
                />
              </div>
              <div className="form-group col-md-4">
                <label>Health Insurance:</label>
                <input
                  type="text"
                  name="healthInsurance"
                  value={formData.healthInsurance}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Low Income:</label>
                <input
                  type="text"
                  name="lowIncome"
                  value={formData.lowIncome}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Reference:</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
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
                    checked={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.checked,
                      }))
                    }
                  />
                  <span className="slider round"></span>
                </label>
                {/* <div className="custom-control custom-switch">
                  <input
                    type="checkbox"
                    className="custom-control-input"
                    id="statusSwitch"
                    checked={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.checked,
                      }))
                    }
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="statusSwitch"
                  >
                    Status
                  </label>
                </div> */}
              </div>
            </div>
          </div>

          <div className="card p-4 border-0 mb-5">
            <div className="d-flex align-items-center justify-content-between">
              <h5 className="mb-0">Medicines</h5>
              <button
                type="button"
                className="btn btn-primary"
                onClick={addMedicine}
              >
                Add
              </button>
            </div>
            {/* <div className="row mt-4">
              {formData.medicines.map((medicine, index) => (
                <div key={index} className="row">
                  <div className="form-group col-md-2">
                    <label htmlFor="Medicines">
                      Medicines <span className="text-danger">*</span>
                    </label>
                    <select
                      value={medicine.medicineId}
                      className="form-control"
                      onChange={(e) =>
                        handleMedicineChange(
                          index,
                          "medicineId",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Select Medicine</option>
                      {medicines.map((med) => (
                        <option key={med.id} value={med.id}>
                          {med.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group col-md-2">
                    <label htmlFor="Medicines">Dosage</label>

                    <input
                      type="text"
                      value={medicine.dosage}
                      className="form-control"
                      placeholder="Dosage"
                      onChange={(e) =>
                        handleMedicineChange(index, "dosage", e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group col-md-2">
                    <label htmlFor="Dose Duration">
                      Dose Duration <span className="text-danger">*</span>
                    </label>
                    <select
                      value={medicine.doseDuration}
                      className="form-control"
                      onChange={(e) =>
                        handleMedicineChange(
                          index,
                          "doseDuration",
                          e.target.value
                        )
                      }
                    >
                      <option value="Only one day">Only one day</option>
                      <option value="Upto three days">Upto three days</option>
                      <option value="Upto one week">Upto one week</option>
                      <option value="Upto two week">Upto two week</option>
                      <option value="Upto one months">Upto one months</option>
                    </select>
                  </div>
                  <div className="form-group col-md-2">
                    <label htmlFor="Time">
                      Time <span className="text-danger">*</span>
                    </label>
                    <select
                      value={medicine.time}
                      className="form-control"
                      onChange={(e) =>
                        handleMedicineChange(index, "time", e.target.value)
                      }
                    >
                      <option value="After Meal">After Meal</option>
                      <option value="Before Meal">Before Meal</option>
                    </select>
                  </div>
                  <div className="form-group col-md-2">
                    <label htmlFor="Dose Interval">
                      Dose Interval <span className="text-danger">*</span>
                    </label>
                    <select
                      value={medicine.doseInterval}
                      className="form-control"
                      onChange={(e) =>
                        handleMedicineChange(
                          index,
                          "doseInterval",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Dose Interval</option>
                      <option value="Daily morning">Daily morning</option>
                      <option value="Daily evening">Daily evening</option>
                      <option value="Daily noon">Daily noon</option>
                      <option value=" Daily morning, evening, noon">
                        Daily morning, evening, noon
                      </option>
                      <option value="Daily morning and evening">
                        Daily morning and evening
                      </option>
                      <option value="4 times in a day">4 times in a day</option>
                    </select>
                  </div>
                  <div className="form-group col-md-2">
                    <label htmlFor="Comment">Comment</label>
                    <textarea
                      rows="1"
                      type="text"
                      value={medicine.comment}
                      className="form-control"
                      placeholder="Comment"
                      onChange={(e) =>
                        handleMedicineChange(index, "comment", e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group col-md-1">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeMedicine(index)}
                      disabled={formData.medicines.length === 1}
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div> */}

            <div className="row mt-4">
              {formData.medicines.map((medicine, index) => (
                <div key={index} className="row">
                  <div className="form-group col-md-2">
                    <label htmlFor="Medicines">
                      Medicines <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={medicines.map((med) => ({
                        value: med.id,
                        label: med.name,
                      }))}
                      value={
                        medicine.medicineId
                          ? {
                            value: medicine.medicineId,
                            label: medicines.find((m) => m.id === medicine.medicineId)
                              ?.name || "",
                          }
                          : null
                      }
                      onChange={(selectedOption) =>
                        handleMedicineChange(
                          index,
                          "medicineId",
                          selectedOption ? selectedOption.value : ""
                        )
                      }
                      placeholder="Select Medicine"
                      isClearable
                    />
                  </div>
                  <div className="form-group col-md-2">
                    <label htmlFor="Dosage">Dosage</label>
                    <input
                      type="text"
                      value={medicine.dosage}
                      className="form-control"
                      placeholder="Dosage"
                      onChange={(e) =>
                        handleMedicineChange(index, "dosage", e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group col-md-2">
                    <label htmlFor="Dose Duration">
                      Dose Duration <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={[
                        { value: "Only one day", label: "Only one day" },
                        { value: "Upto three days", label: "Upto three days" },
                        { value: "Upto one week", label: "Upto one week" },
                        { value: "Upto two week", label: "Upto two week" },
                        { value: "Upto one months", label: "Upto one months" },
                      ]}
                      value={
                        medicine.doseDuration
                          ? {
                            value: medicine.doseDuration,
                            label: medicine.doseDuration,
                          }
                          : null
                      }
                      onChange={(selectedOption) =>
                        handleMedicineChange(
                          index,
                          "doseDuration",
                          selectedOption ? selectedOption.value : ""
                        )
                      }
                      placeholder="Select Duration"
                      isClearable
                    />
                  </div>
                  <div className="form-group col-md-2">
                    <label htmlFor="Time">
                      Time <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={[
                        { value: "After Meal", label: "After Meal" },
                        { value: "Before Meal", label: "Before Meal" },
                      ]}
                      value={
                        medicine.time
                          ? { value: medicine.time, label: medicine.time }
                          : null
                      }
                      onChange={(selectedOption) =>
                        handleMedicineChange(
                          index,
                          "time",
                          selectedOption ? selectedOption.value : ""
                        )
                      }
                      placeholder="Select Time"
                      isClearable
                    />
                  </div>
                  <div className="form-group col-md-2">
                    <label htmlFor="Dose Interval">
                      Dose Interval <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={[
                        { value: "", label: "Dose Interval" },
                        { value: "Daily morning", label: "Daily morning" },
                        { value: "Daily evening", label: "Daily evening" },
                        { value: "Daily noon", label: "Daily noon" },
                        {
                          value: "Daily morning, evening, noon",
                          label: "Daily morning, evening, noon",
                        },
                        {
                          value: "Daily morning and evening",
                          label: "Daily morning and evening",
                        },
                        { value: "4 times in a day", label: "4 times in a day" },
                      ]}
                      value={
                        medicine.doseInterval
                          ? { value: medicine.doseInterval, label: medicine.doseInterval }
                          : null
                      }
                      onChange={(selectedOption) =>
                        handleMedicineChange(
                          index,
                          "doseInterval",
                          selectedOption ? selectedOption.value : ""
                        )
                      }
                      placeholder="Select Interval"
                      isClearable
                    />
                  </div>
                  <div className="form-group col-md-2">
                    <label htmlFor="Comment">Comment</label>
                    <textarea
                      rows="1"
                      type="text"
                      value={medicine.comment}
                      className="form-control"
                      placeholder="Comment"
                      onChange={(e) =>
                        handleMedicineChange(index, "comment", e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group col-md-1">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeMedicine(index)}
                      disabled={formData.medicines.length === 1}
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4 border-0 mb-5">
            <h5>Physical Information</h5>
            <div className="row mt-4">
              <div className="form-group col-md-3">
                <label>High Blood Pressure:</label>
                <input
                  type="text"
                  name="highBloodPressure"
                  value={formData.highBloodPressure}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label>Food Allergies:</label>
                <input
                  type="text"
                  name="foodAllergies"
                  value={formData.foodAllergies}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label>Tendency Bleed:</label>
                <input
                  type="text"
                  name="tendencyBleed"
                  value={formData.tendencyBleed}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label>Heart Disease:</label>
                <input
                  type="text"
                  name="heartDisease"
                  value={formData.heartDisease}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label>Diabetic:</label>
                <input
                  type="text"
                  name="diabetic"
                  value={formData.diabetic}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label>Added At:</label>
                <input
                  type="datetime-local"
                  name="addedAt"
                  value={
                    formData.addedAt
                      ? new Date(formData.addedAt).toISOString().slice(0, 16)
                      : ""
                  }
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label>Female Pregnancy:</label>
                <input
                  type="text"
                  name="femalePregnancy"
                  value={formData.femalePregnancy}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label>Breast Feeding:</label>
                <input
                  type="text"
                  name="breastFeeding"
                  value={formData.breastFeeding}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label>Current Medication:</label>
                <input
                  type="text"
                  name="currentMedication"
                  value={formData.currentMedication}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label>Surgery:</label>
                <input
                  type="text"
                  name="surgery"
                  value={formData.surgery}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label>Accident:</label>
                <input
                  type="text"
                  name="accident"
                  value={formData.accident}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label>Others:</label>
                <input
                  type="text"
                  name="others"
                  value={formData.others}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label>Pulse Rate:</label>
                <input
                  type="text"
                  name="pulseRate"
                  value={formData.pulseRate}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-3">
                <label>Temperature:</label>
                <input
                  type="text"
                  name="temperature"
                  value={formData.temperature}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group col-md-12">
                <label>Problem Description:</label>
                <textarea
                  rows="3"
                  type="text"
                  name="description"
                  value={formData.description}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="card p-4 border-0">
            <div className="row mt-4"></div>
            <div className="form-group col-md-12">
              <label>Test:</label>
              <textarea
                rows="3"
                type="text"
                name="test"
                value={formData.test}
                className="form-control"
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group col-md-12">
              <label>Advice:</label>
              <textarea
                rows="3"
                name="advice"
                value={formData.advice}
                className="form-control"
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group col-md-4">
              <label>Next Visit:</label>
              <div className="d-flex" width="250">
                <input
                  style={{ width: "25%" }}
                  min="1"
                  type="number"
                  name="nextVisitNumber"
                  value={formData.nextVisitNumber}
                  className="form-control"
                  onChange={handleInputChange}
                />

                <select
                  style={{ width: "75%" }}
                  name="nextVisitDay"
                  value={formData.nextVisitDay}
                  className="form-control"
                  onChange={handleInputChange}
                >
                  <option value="Days">Days</option>
                  <option value="Months">Months</option>
                  <option value="Years">Years</option>
                </select>
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
                onClick={() => navigate("/prescriptions")}
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

export default CreatePrescription;
