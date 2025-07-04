import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const CreatePatients = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [patientData, setPatientData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    phoneCountryCode: "+91",
    phoneNumber: "",
    gender: "Male",
    status: true, // Boolean for checkbox
    bloodGroup: "",
    password: "",
    confirmPassword: "",
    uhid: "",
    profileImage: null,
    address1: "",
    address2: "",
    city: "",
    zipcode: "",
    facebookUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fetchPatient = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/patients/${id}`);
      const patient = res.data;

      // Convert date fields to YYYY-MM-DD
      const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().split("T")[0]; // Returns YYYY-MM-DD
      };

      setPatientData({
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        email: patient.email || "",
        dateOfBirth: formatDate(patient.dateOfBirth),
        phoneCountryCode: patient.phoneCountryCode || "+91",
        phoneNumber: patient.phoneNumber || "",
        gender: patient.gender || "Male",
        status: !!patient.status, // Convert 1/0 to true/false
        bloodGroup: patient.bloodGroup || "",
        password: patient.password,
        confirmPassword: patient.password,
        uhid: patient.uhid || "",
        profileImage: patient.profileImage || null,
        address1: patient.address1 || "",
        address2: patient.address2 || "",
        city: patient.city || "",
        zipcode: patient.zipcode || "",
        facebookUrl: patient.facebookUrl || "",
        twitterUrl: patient.twitterUrl || "",
        instagramUrl: patient.instagramUrl || "",
        linkedinUrl: patient.linkedinUrl || "",
      });
    } catch (error) {
      console.error("Error fetching patient:", error);
      toast.error("Failed to load patient");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setPatientData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const validateForm = () => {
    if (!patientData.firstName) {
      toast.error("First name is required");
      return false;
    }
    if (!patientData.lastName) {
      toast.error("Last name is required");
      return false;
    }
    if (!patientData.email || !/\S+@\S+\.\S+/.test(patientData.email)) {
      toast.error("Valid email is required");
      return false;
    }
    if (!patientData.phoneCountryCode) {
      toast.error("Country code is required");
      return false;
    }
    if (!patientData.phoneNumber) {
      toast.error("Phone number is required");
      return false;
    } else if (!patientData.password) {
      toast.error("Password is required");
      return false;
    } else if (!patientData.confirmPassword) {
      toast.error("Confirm Password is required");
      return false;
    }
    else if (!patientData.gender) {
      toast.error("Gender is required");
      return false;
    }
    if (patientData.password !== patientData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (!patientData.uhid) {
      toast.error("UHID is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;


    // Format created_at to YYYY-MM-DD HH:MM:SS
    const formatDateTime = (date) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")} ${String(
        d.getHours()
      ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(
        d.getSeconds()
      ).padStart(2, "0")}`;
    };

    const patientToSave = {
      ...patientData,
      id: isEditMode
        ? id
        : String(Math.floor(Math.random() * 1000)).padStart(2, "0"),
      created_at: formatDateTime(new Date()),
      status: patientData.status ? "1" : "0", // Convert boolean to string for backend
    };

    const hasNewProfileImage =
      patientToSave.profileImage &&
      typeof patientToSave.profileImage !== "string";

    let requestData;
    let headers = {};

    if (hasNewProfileImage) {
      requestData = new FormData();
      for (const key in patientToSave) {
        if (key === "profileImage" && patientToSave[key]) {
          requestData.append(key, patientToSave[key]);
        } else if (key !== "confirmPassword") {
          requestData.append(key, patientToSave[key] ?? "");
        }
      }
      headers["Content-Type"] = "multipart/form-data";
    } else {
      requestData = { ...patientToSave };
      delete requestData.confirmPassword;
      headers["Content-Type"] = "application/json";
    }

    console.log(
      "Request data being sent:",
      hasNewProfileImage ? [...requestData.entries()] : requestData
    );

    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:8080/api/patients/${id}`,
          requestData,
          {
            headers,
          }
        );
        toast.success("Patient updated successfully");
      } else {
        await axios.post(`http://localhost:8080/api/patients`, requestData, {
          headers,
        });
        toast.success("Patient added successfully");
        setPatientData({
          firstName: "",
          lastName: "",
          email: "",
          dateOfBirth: "",
          phoneCountryCode: "+91",
          phoneNumber: "",
          gender: "Male",
          status: true,
          bloodGroup: "",
          password: "",
          confirmPassword: "",
          uhid: "",
          profileImage: null,
          address1: "",
          address2: "",
          city: "",
          zipcode: "",
          facebookUrl: "",
          twitterUrl: "",
          instagramUrl: "",
          linkedinUrl: "",
        });
      }
      setTimeout(() => {
        navigate("/patients");
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error.response || error);
      const errorMessage = error.response?.data?.error || error.message;
      toast.error("Error saving patient: " + errorMessage);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      fetchPatient();
    }
  }, [isEditMode, id]);

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">
              {isEditMode ? "Edit Patient" : "New Patient"}
            </h1>
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/patients")}
            >
              Back
            </button>
          </div>

          <div className="card p-4 border-0">
            <div className="row">
              <div className="form-group col-md-4">
                <label>
                  First Name: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={patientData.firstName}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>
                  Last Name: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={patientData.lastName}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group col-md-4">
                <label>
                  Email: <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={patientData.email}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Date Of Birth:</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={patientData.dateOfBirth}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group col-md-4">
                <label>
                  Phone: <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <PhoneInput
                    country={"in"}
                    value={patientData.phoneCountryCode}
                    onChange={(phoneCountryCode) =>
                      setPatientData((prev) => ({
                        ...prev,
                        phoneCountryCode: `+${phoneCountryCode}`,
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
                    value={patientData.phoneNumber}
                    className="form-control"
                    onChange={(e) => {
                      const phoneNumber = e.target.value.replace(/[^0-9]/g, "");
                      setPatientData((prev) => ({
                        ...prev,
                        phoneNumber,
                      }));
                    }}
                    style={{ width: "81%" }}
                  />
                </div>
              </div>

              <div className="form-group col-md-4">
                <label>Blood Group:</label>
                <select
                  name="bloodGroup"
                  value={patientData.bloodGroup}
                  className="form-control"
                  onChange={handleInputChange}
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

              <div className="form-group col-md-4">
                <label>
                  UHID: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="uhid"
                  placeholder="UHID"
                  value={patientData.uhid}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group col-md-4">
                <label>
                  Password: <span className="text-danger">*</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={patientData.password}
                  className="form-control"
                  onChange={handleInputChange}
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
              <div className="form-group col-md-4">
                <label>
                  Confirm Password: <span className="text-danger">*</span>
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={patientData.confirmPassword}
                  className="form-control"
                  onChange={handleInputChange}
                />

                <span
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  class="toggle-password"
                >
                  {showConfirmPassword ? (
                    <i class="fa fa-eye-slash"></i>
                  ) : (
                    <i class="fa fa-eye"></i>
                  )}
                </span>
              </div>

              <div className="form-group col-md-4">
                <label>
                  Gender: <span className="text-danger">*</span>
                </label>
                <div>
                  <label className="mr-3">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={patientData.gender === "Male"}
                      onChange={handleInputChange}
                    />{" "}
                    Male
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={patientData.gender === "Female"}
                      onChange={handleInputChange}
                    />{" "}
                    Female
                  </label>
                </div>
              </div>
              <div className="form-group col-md-4">
                <label>Status:</label> <br />
                <label className="switch">
                  <input
                    type="checkbox"
                    name="status"
                    checked={patientData.status}
                    onChange={handleInputChange}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="form-group col-md-4">
                <label className="d-block">Profile Picture</label>
                <div className="profile-picture-upload">
                  <label
                    htmlFor="profile-upload"
                    className="profile-picture-container"
                  >
                    {patientData.profileImage ? (
                      <>
                        <img
                          src={
                            typeof patientData.profileImage === "string"
                              ? patientData.profileImage
                              : URL.createObjectURL(patientData.profileImage)
                          }
                          alt="Profile"
                          className="profile-picture"
                        />
                        <div className="edit-overlay">
                          <i className="fas fa-pencil-alt"></i>
                        </div>
                      </>
                    ) : (
                      <div className="empty-profile">
                        {patientData.firstName && patientData.lastName ? (
                          `${patientData.firstName[0]}${patientData.lastName[0]}`
                        ) : (
                          <i className="fa fa-upload"></i>
                        )}
                      </div>
                    )}
                  </label>
                  <input
                    id="profile-upload"
                    accept="image/*"
                    type="file"
                    name="profileImage"
                    className="d-none"
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <hr />
            <h6>Address Details</h6>
            <div className="row">
              <div className="form-group col-md-6">
                <label>Address 1:</label>
                <input
                  type="text"
                  name="address1"
                  placeholder="Address 1"
                  value={patientData.address1}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-6">
                <label>Address 2:</label>
                <input
                  type="text"
                  name="address2"
                  placeholder="Address 2"
                  value={patientData.address2}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label>City:</label>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={patientData.city}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-6">
                <label>Zipcode:</label>
                <input
                  type="number"
                  name="zipcode"
                  placeholder="Zipcode"
                  value={patientData.zipcode}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <hr />
            <h6>Social Details</h6>
            <div className="row">
              <div className="form-group col-md-6">
                <label>Facebook URL:</label>
                <input
                  type="url"
                  name="facebookUrl"
                  placeholder="Facebook URL"
                  value={patientData.facebookUrl}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-6">
                <label>Twitter URL:</label>
                <input
                  type="url"
                  name="twitterUrl"
                  placeholder="Twitter URL"
                  value={patientData.twitterUrl}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group col-md-6">
                <label>Instagram URL:</label>
                <input
                  type="url"
                  name="instagramUrl"
                  placeholder="Instagram URL"
                  value={patientData.instagramUrl}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-6">
                <label>LinkedIn URL:</label>
                <input
                  type="url"
                  name="linkedinUrl"
                  placeholder="LinkedIn URL"
                  value={patientData.linkedinUrl}
                  className="form-control"
                  onChange={handleInputChange}
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
                onClick={() => navigate("/patients")}
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

export default CreatePatients;
