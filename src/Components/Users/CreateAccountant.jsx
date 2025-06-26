import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from "react-select";

const CreateAccountant = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [accountantData, setAccountantData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneCountryCode: "+91",
    phoneNumber: "",
    bloodId: null,
    designation: "",
    qualification: "",
    dateOfBirth: "",
    gender: null,
    status: true,
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
  const [bloodGroups, setBloodGroups] = useState([]);

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ];

  const fetchBloodGroups = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/blood-groups");
      setBloodGroups(res.data);
    } catch (error) {
      console.error("Error fetching blood groups:", error);
      toast.error("Failed to load blood groups");
    }
  };

  const fetchAccountant = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/accountants/${id}`);
      const accountant = res.data;

      const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().split("T")[0];
      };

      setAccountantData({
        firstName: accountant.firstName || "",
        lastName: accountant.lastName || "",
        email: accountant.email || "",
        phoneCountryCode: accountant.phoneCountryCode || "+91",
        phoneNumber: accountant.phoneNumber || "",
        bloodId: accountant.bloodId ? { value: accountant.bloodId, label: accountant.bloodGroups } : null,
        designation: accountant.designation || "",
        qualification: accountant.qualification || "",
        dateOfBirth: formatDate(accountant.dateOfBirth),
        gender: accountant.gender ? { value: accountant.gender, label: accountant.gender } : null,
        status: accountant.status === "Active",
        password: "",
        confirmPassword: "",
        profileImage: accountant.profileImage || null,
        address1: accountant.address1 || "",
        address2: accountant.address2 || "",
        city: accountant.city || "",
        zipcode: accountant.zipcode || "",
      });
    } catch (error) {
      console.error("Error fetching accountant:", error);
      toast.error("Failed to load accountant");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setAccountantData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setAccountantData((prev) => ({
      ...prev,
      [name]: selectedOption,
    }));
  };

  const validateForm = () => {
    if (!accountantData.firstName) {
      toast.error("First name is required");
      return false;
    }
    if (!accountantData.lastName) {
      toast.error("Last name is required");
      return false;
    }
    if (!accountantData.email || !/\S+@\S+\.\S+/.test(accountantData.email)) {
      toast.error("Valid email is required");
      return false;
    }
    if (!accountantData.phoneCountryCode) {
      toast.error("Country code is required");
      return false;
    }
    if (!accountantData.phoneNumber) {
      toast.error("Phone number is required");
      return false;
    }
    if (!accountantData.bloodId || !accountantData.bloodId.value) {
      toast.error("Blood group is required");
      return false;
    }
    if (!accountantData.dateOfBirth) {
      toast.error("Date of birth is required");
      return false;
    }
    if (!accountantData.gender || !accountantData.gender.value) {
      toast.error("Gender is required");
      return false;
    }
    if (accountantData.status === null || accountantData.status === undefined) {
      toast.error("Status is required");
      return false;
    }
    if (!isEditMode) {
      if (!accountantData.password) {
        toast.error("Password is required");
        return false;
      }
      if (!accountantData.confirmPassword) {
        toast.error("Confirm Password is required");
        return false;
      }
      if (accountantData.password !== accountantData.confirmPassword) {
        toast.error("Passwords do not match");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const accountantToSave = {
      firstName: accountantData.firstName,
      lastName: accountantData.lastName,
      email: accountantData.email,
      phoneCountryCode: accountantData.phoneCountryCode,
      phoneNumber: accountantData.phoneNumber,
      bloodId: accountantData.bloodId?.value || "",
      designation: accountantData.designation,
      qualification: accountantData.qualification,
      dateOfBirth: accountantData.dateOfBirth,
      gender: accountantData.gender?.value || "",
      status: accountantData.status ? "Active" : "Inactive",
      password: accountantData.password,
      confirmPassword: accountantData.confirmPassword,
      profileImage: accountantData.profileImage,
      address1: accountantData.address1,
      address2: accountantData.address2,
      city: accountantData.city,
      zipcode: accountantData.zipcode,
    };

    const hasNewProfileImage =
      accountantToSave.profileImage &&
      typeof accountantToSave.profileImage !== "string";

    let requestData;
    let headers = {};

    if (hasNewProfileImage) {
      requestData = new FormData();
      Object.entries(accountantToSave).forEach(([key, value]) => {
        if (key === "profileImage" && value) {
          requestData.append(key, value);
        } else if (value !== null && value !== undefined) {
          requestData.append(key, value);
        }
      });
      headers["Content-Type"] = "multipart/form-data";
    } else {
      requestData = { ...accountantToSave };
      if (!requestData.profileImage) {
        requestData.profileImage = null;
      }
      headers["Content-Type"] = "application/json";
    }

    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:8080/api/accountants/${id}`,
          requestData,
          { headers }
        );
        toast.success("Accountant updated successfully");
      } else {
        await axios.post(`http://localhost:8080/api/accountants`, requestData, {
          headers,
        });
        toast.success("Accountant added successfully");
        setAccountantData({
          firstName: "",
          lastName: "",
          email: "",
          phoneCountryCode: "+91",
          phoneNumber: "",
          bloodId: null,
          designation: "",
          qualification: "",
          dateOfBirth: "",
          gender: null,
          status: true,
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
        navigate("/accountants");
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error.response || error);
      toast.error("Error saving accountant: " + (error.response?.data?.error || error.message));
    }
  };

  useEffect(() => {
    fetchBloodGroups();
    if (isEditMode) {
      fetchAccountant();
    }
  }, [isEditMode, id]);

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">
              {isEditMode ? "Edit Accountant" : "New Accountant"}
            </h1>
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/accountants")}
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
                  value={accountantData.firstName}
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
                  value={accountantData.lastName}
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
                  value={accountantData.email}
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
                    value={accountantData.phoneCountryCode}
                    onChange={(phoneCountryCode) =>
                      setAccountantData((prev) => ({
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
                    value={accountantData.phoneNumber}
                    className="form-control"
                    onChange={(e) => {
                      const phoneNumber = e.target.value.replace(/[^0-9]/g, "");
                      setAccountantData((prev) => ({
                        ...prev,
                        phoneNumber,
                      }));
                    }}
                    style={{ width: "81%" }}
                  />
                </div>
              </div>
              <div className="form-group col-md-4">
                <label>
                  Blood Group: <span className="text-danger">*</span>
                </label>
                <Select
                  options={bloodGroups}
                  value={accountantData.bloodId}
                  onChange={(option) => handleSelectChange("bloodId", option)}
                  placeholder="Select Blood Group"
                />
              </div>
              <div className="form-group col-md-4">
                <label>Designation:</label>
                <input
                  type="text"
                  name="designation"
                  placeholder="Designation"
                  value={accountantData.designation}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Qualification:</label>
                <input
                  type="text"
                  name="qualification"
                  placeholder="Qualification"
                  value={accountantData.qualification}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>
                  Date Of Birth: <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={accountantData.dateOfBirth}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>
                  Gender: <span className="text-danger">*</span>
                </label>
                <Select
                  options={genderOptions}
                  value={accountantData.gender}
                  onChange={(option) => handleSelectChange("gender", option)}
                  placeholder="Select Gender"
                />
              </div>
              <div className="form-group col-md-4">
                <label>
                  Status: <span className="text-danger">*</span>
                </label>
                <br />
                <label className="switch">
                  <input
                    type="checkbox"
                    name="status"
                    checked={accountantData.status}
                    onChange={handleInputChange}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
              <div className="form-group col-md-4">
                <label>
                  Password: <span className="text-danger">{isEditMode ? "" : "*"}</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={accountantData.password}
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
              <div className="form-group col-md-4">
                <label>
                  Confirm Password: <span className="text-danger">{isEditMode ? "" : "*"}</span>
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={accountantData.confirmPassword}
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
              <div className="form-group col-md-4">
                <label className="d-block">Profile Picture</label>
                <div className="profile-picture-upload">
                  <label
                    htmlFor="profile-upload"
                    className="profile-picture-container"
                  >
                    {accountantData.profileImage ? (
                      <>
                        <img
                          src={
                            typeof accountantData.profileImage === "string"
                              ? accountantData.profileImage
                              : URL.createObjectURL(accountantData.profileImage)
                          }
                          alt="Profile"
                          className="profile-picture"
                        />
                        <div className="edit-overlay">
                          <i className="fas fa-upload"></i>
                        </div>
                      </>
                    ) : (
                      <div className="empty-profile">
                        {accountantData.firstName && accountantData.lastName ? (
                          `${accountantData.firstName[0]}${accountantData.lastName[0]}`
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
              <div className="col-md-12">
                <h5>Address Details</h5>
              </div>
              <div className="form-group col-md-4">
                <label>Address 1:</label>
                <input
                  type="text"
                  name="address1"
                  placeholder="Address 1"
                  value={accountantData.address1}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Address 2:</label>
                <input
                  type="text"
                  name="address2"
                  placeholder="Address 2"
                  value={accountantData.address2}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>City:</label>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={accountantData.city}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Zipcode:</label>
                <input
                  type="text"
                  name="zipcode"
                  placeholder="Zipcode"
                  value={accountantData.zipcode}
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
                onClick={() => navigate("/accountants")}
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

export default CreateAccountant;