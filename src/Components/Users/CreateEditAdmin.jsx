import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from "react-select";

const CreateAdmin = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [adminData, setAdminData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneCountryCode: "+91",
    phoneNumber: "",
    dateOfBirth: "",
    gender: null, // Changed to null for react-select
    status: true,
    password: "",
    confirmPassword: "",
    profileImage: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
  ];

  const fetchAdmin = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/admins/${id}`);
      const admin = res.data;

      const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().split("T")[0];
      };

      setAdminData({
        firstName: admin.firstName || "",
        lastName: admin.lastName || "",
        email: admin.email || "",
        phoneCountryCode: admin.phoneCountryCode || "+91",
        phoneNumber: admin.phoneNumber || "",
        dateOfBirth: formatDate(admin.dateOfBirth),
        gender: admin.gender
          ? { value: admin.gender, label: admin.gender }
          : null,
        status: admin.status === "Active",
        password: admin.password || "",
        confirmPassword: admin.password || "",
        profileImage: admin.profileImage || null,
      });
    } catch (error) {
      console.error("Error fetching admin:", error);
      toast.error("Failed to load admin");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setAdminData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setAdminData((prev) => ({
      ...prev,
      [name]: selectedOption,
    }));
  };

  const validateForm = () => {
    if (!adminData.firstName) {
      toast.error("First name is required");
      return false;
    }
    if (!adminData.lastName) {
      toast.error("Last name is required");
      return false;
    }
    if (!adminData.email || !/\S+@\S+\.\S+/.test(adminData.email)) {
      toast.error("Valid email is required");
      return false;
    }
    if (!adminData.phoneCountryCode) {
      toast.error("Country code is required");
      return false;
    }
    if (!adminData.phoneNumber) {
      toast.error("Phone number is required");
      return false;
    }
    if (!adminData.dateOfBirth) {
      toast.error("Date of birth is required");
      return false;
    }
    if (!adminData.gender || !adminData.gender.value) {
      toast.error("Gender is required");
      return false;
    }
    if (adminData.status === null || adminData.status === undefined) {
      toast.error("Status is required");
      return false;
    }

    if (!adminData.password) {
      toast.error("Password is required");
      return false;
    }
    if (!adminData.confirmPassword) {
      toast.error("Confirm Password is required");
      return false;
    }
    if (adminData.password !== adminData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const adminToSave = {
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      email: adminData.email,
      phoneCountryCode: adminData.phoneCountryCode,
      phoneNumber: adminData.phoneNumber,
      dateOfBirth: adminData.dateOfBirth,
      gender: adminData.gender?.value || "",
      status: adminData.status ? "Active" : "Inactive",
      password: adminData.password,
      confirmPassword: adminData.confirmPassword,
      profileImage: adminData.profileImage,
    };

    const hasNewProfileImage =
      adminToSave.profileImage && typeof adminToSave.profileImage !== "string";

    let requestData;
    let headers = {};

    if (hasNewProfileImage) {
      requestData = new FormData();
      Object.entries(adminToSave).forEach(([key, value]) => {
        if (key === "profileImage" && value) {
          requestData.append(key, value);
        } else if (value !== null && value !== undefined) {
          requestData.append(key, value);
        }
      });
      headers["Content-Type"] = "multipart/form-data";
    } else {
      requestData = { ...adminToSave };
      if (!requestData.profileImage) {
        requestData.profileImage = null;
      }
      headers["Content-Type"] = "application/json";
    }

    // Log the request data for debugging
    if (hasNewProfileImage) {
      for (let [key, value] of requestData.entries()) {
        console.log(`${key}: ${value}`);
      }
    } else {
      console.log("Request Data (JSON):", requestData);
    }

    try {
      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/admins/${id}`, requestData, {
          headers,
        });
        toast.success("Admin updated successfully");
      } else {
        await axios.post(`http://localhost:8080/api/admins`, requestData, {
          headers,
        });
        toast.success("Admin added successfully");
        setAdminData({
          firstName: "",
          lastName: "",
          email: "",
          phoneCountryCode: "+91",
          phoneNumber: "",
          dateOfBirth: "",
          gender: null,
          status: true,
          password: "",
          confirmPassword: "",
          profileImage: null,
        });
      }
      setTimeout(() => {
        navigate("/admin");
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error.response || error);
      toast.error(
        "Error saving admin: " + (error.response?.data?.error || error.message)
      );
    }
  };

  useEffect(() => {
    if (isEditMode) {
      fetchAdmin();
    }
  }, [isEditMode, id]);

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">{isEditMode ? "Edit Admin" : "New Admin"}</h1>
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/admin")}
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
                  value={adminData.firstName}
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
                  value={adminData.lastName}
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
                  value={adminData.email}
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
                    value={adminData.phoneCountryCode}
                    onChange={(phoneCountryCode) =>
                      setAdminData((prev) => ({
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
                    value={adminData.phoneNumber}
                    className="form-control"
                    onChange={(e) => {
                      const phoneNumber = e.target.value.replace(/[^0-9]/g, "");
                      setAdminData((prev) => ({
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
                  Date Of Birth: <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={adminData.dateOfBirth}
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
                  value={adminData.gender}
                  onChange={(option) => handleSelectChange("gender", option)}
                  placeholder="Select Gender"
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
                  value={adminData.password}
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
                  Confirm Password: <span className="text-danger">*</span>
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={adminData.confirmPassword}
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
                <label>
                  Status: <span className="text-danger">*</span>
                </label>
                <br />
                <label className="switch">
                  <input
                    type="checkbox"
                    name="status"
                    checked={adminData.status}
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
                    {adminData.profileImage ? (
                      <>
                        <img
                          src={
                            typeof adminData.profileImage === "string"
                              ? adminData.profileImage
                              : URL.createObjectURL(adminData.profileImage)
                          }
                          alt="Profile"
                          className="profile-picture"
                        />
                        <div className="edit-overlay">
                          <i className="fa fa-upload"></i>
                        </div>
                      </>
                    ) : (
                      <div className="empty-profile">
                        {adminData.firstName && adminData.lastName ? (
                          `${adminData.firstName[0]}${adminData.lastName[0]}`
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
                onClick={() => navigate("/admins")}
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

export default CreateAdmin;
