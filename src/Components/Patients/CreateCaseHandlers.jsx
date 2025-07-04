import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const CreateCaseHandlers = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [caseHandlerData, setCaseHandlerData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    designation: "",
    dateOfBirth: "",
    phoneCountryCode: "+91",
    phoneNumber: "",
    gender: "Male",
    status: true,
    bloodGroup: "",
    qualification: "",
    password: "",
    confirmPassword: "",
    profileImage: null,
    address1: "",
    address2: "",
    city: "",
    zipcode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fetchCaseHandler = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/case-handlers/${id}`);
      const handler = res.data;

      const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().split("T")[0];
      };

      setCaseHandlerData({
        firstName: handler.firstName || "",
        lastName: handler.lastName || "",
        email: handler.email || "",
        designation: handler.designation || "",
        dateOfBirth: formatDate(handler.dateOfBirth),
        phoneCountryCode: handler.phoneCountryCode || "+91",
        phoneNumber: handler.phoneNumber || "",
        gender: handler.gender || "Male",
        status: !!handler.status,
        bloodGroup: handler.bloodGroup || "",
        qualification: handler.qualification || "",
        password: handler.password,
        confirmPassword: handler.password,
        profileImage: handler.profileImage || null,
        address1: handler.address1 || "",
        address2: handler.address2 || "",
        city: handler.city || "",
        zipcode: handler.zipcode || "",
      });
    } catch (error) {
      console.error("Error fetching case handler:", error);
      toast.error("Failed to load case handler");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setCaseHandlerData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const validateForm = () => {
    if (!caseHandlerData.firstName) {
      toast.error("First name is required");
      return false;
    }
    if (!caseHandlerData.lastName) {
      toast.error("Last name is required");
      return false;
    }
    if (!caseHandlerData.email || !/\S+@\S+\.\S+/.test(caseHandlerData.email)) {
      toast.error("Valid email is required");
      return false;
    }
    if (!caseHandlerData.phoneCountryCode) {
      toast.error("Country code is required");
      return false;
    }
    if (!caseHandlerData.phoneNumber) {
      toast.error("Phone number is required");
      return false;
    }
    if (!caseHandlerData.password) {
      toast.error("Password is required");
      return false;
    }
    if (!caseHandlerData.confirmPassword) {
      toast.error("Confirm Password is required");
      return false;
    }
    if (caseHandlerData.password !== caseHandlerData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    if (!caseHandlerData.gender) {
      toast.error("Gender is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formatDateTime = (date) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
        d.getMinutes()
      ).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    };

    const caseHandlerToSave = {
      ...caseHandlerData,
      id: isEditMode
        ? id
        : String(Math.floor(Math.random() * 1000)).padStart(2, "0"),
      created_at: formatDateTime(new Date()),
      status: caseHandlerData.status ? "1" : "0",
    };

    const hasNewProfileImage =
      caseHandlerToSave.profileImage &&
      typeof caseHandlerToSave.profileImage !== "string";

    let requestData;
    let headers = {};

    if (hasNewProfileImage) {
      requestData = new FormData();
      for (const key in caseHandlerToSave) {
        if (key === "profileImage" && caseHandlerToSave[key]) {
          requestData.append(key, caseHandlerToSave[key]);
        } else if (key !== "confirmPassword") {
          requestData.append(key, caseHandlerToSave[key] || "");
        }
      }
      headers["Content-Type"] = "multipart/form-data";
    } else {
      requestData = { ...caseHandlerToSave };
      delete requestData.confirmPassword;
      headers["Content-Type"] = "application/json";
    }

    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:8080/api/case-handlers/${id}`,
          requestData,
          { headers }
        );
        toast.success("Case handler updated successfully");
      } else {
        await axios.post("http://localhost:8080/api/case-handlers", requestData, {
          headers,
        });
        toast.success("Case handler added successfully");
        setCaseHandlerData({
          firstName: "",
          lastName: "",
          email: "",
          designation: "",
          dateOfBirth: "",
          phoneCountryCode: "+91",
          phoneNumber: "",
          gender: "Male",
          status: true,
          bloodGroup: "",
          qualification: "",
          password: "",
          confirmPassword: "",
          profileImage: null,
          address1: "",
          address2: "",
          city: "",
          zipcode: "",
        });
      }
      setTimeout(() => {
        navigate("/case-handlers");
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error.response || error);
      const errorMessage = error.response?.data?.error || error.message;
      toast.error("Error saving case handler: " + errorMessage);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      fetchCaseHandler();
    }
  }, [isEditMode, id]);

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">
              {isEditMode ? "Edit Case Handler" : "New Case Handler"}
            </h1>
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/case-handlers")}
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
                  value={caseHandlerData.firstName}
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
                  value={caseHandlerData.lastName}
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
                  value={caseHandlerData.email}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Designation:</label>
                <input
                  type="text"
                  name="designation"
                  placeholder="Designation"
                  value={caseHandlerData.designation}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Date Of Birth:</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={caseHandlerData.dateOfBirth}
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
                    country={"id"}
                    value={caseHandlerData.phoneCountryCode}
                    onChange={(phoneCountryCode) =>
                      setCaseHandlerData((prev) => ({
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
                    value={caseHandlerData.phoneNumber}
                    className="form-control"
                    onChange={(e) => {
                      const phoneNumber = e.target.value.replace(/[^0-9]/g, "");
                      setCaseHandlerData((prev) => ({
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
                  value={caseHandlerData.bloodGroup}
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
                <label>Qualification:</label>
                <input
                  type="text"
                  name="qualification"
                  placeholder="Qualification"
                  value={caseHandlerData.qualification}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>
                  Password: <span className="text-danger">*</span>
                </label>
                <div className="position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={caseHandlerData.password}
                    className="form-control"
                    onChange={handleInputChange}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="toggle-password"
                  
                  >
                    {showPassword ? (
                      <i className="fa fa-eye-slash"></i>
                    ) : (
                      <i className="fa fa-eye"></i>
                    )}
                  </span>
                </div>
              </div>
              <div className="form-group col-md-4">
                <label>
                  Confirm Password: <span className="text-danger">*</span>
                </label>
                <div className="position-relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={caseHandlerData.confirmPassword}
                    className="form-control"
                    onChange={handleInputChange}
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="toggle-password"
                 
                  >
                    {showConfirmPassword ? (
                      <i className="fa fa-eye-slash"></i>
                    ) : (
                      <i className="fa fa-eye"></i>
                    )}
                  </span>
                </div>
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
                      checked={caseHandlerData.gender === "Male"}
                      onChange={handleInputChange}
                    />{" "}
                    Male
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={caseHandlerData.gender === "Female"}
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
                    checked={caseHandlerData.status}
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
                    style={{ cursor: "pointer" }}
                  >
                    {caseHandlerData.profileImage ? (
                      <>
                        <img
                          src={
                            typeof caseHandlerData.profileImage === "string"
                              ? caseHandlerData.profileImage
                              : URL.createObjectURL(caseHandlerData.profileImage)
                          }
                          alt="Profile"
                          className="profile-picture"
                        
                        />
                        <div
                          className="edit-overlay"
                       
                        >
                          <i className="fas fa-pencil-alt text-white"></i>
                        </div>
                      </>
                    ) : (
                      <div
                        className="empty-profile"
                       
                      >
                        {caseHandlerData.firstName && caseHandlerData.lastName
                          ? `${caseHandlerData.firstName[0]}${caseHandlerData.lastName[0]}`
                          : <i className="fa fa-upload"></i>}
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
                  value={caseHandlerData.address1}
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
                  value={caseHandlerData.address2}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-6">
                <label>City:</label>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={caseHandlerData.city}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-6">
                <label>Zipcode:</label>
                <input
                  type="text"
                  name="zipcode"
                  placeholder="Zipcode"
                  value={caseHandlerData.zipcode}
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
                onClick={() => navigate("/case-handlers")}
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

export default CreateCaseHandlers;