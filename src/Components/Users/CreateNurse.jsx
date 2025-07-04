import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from "react-select";

const CreateNurse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [nurseData, setNurseData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneCountryCode: "+62",
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

  const fetchNurse = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/nurses/${id}`);
      const nurse = res.data;

      const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().split("T")[0];
      };

      setNurseData({
        firstName: nurse.firstName || "",
        lastName: nurse.lastName || "",
        email: nurse.email || "",
        phoneCountryCode: nurse.phoneCountryCode || "+62",
        phoneNumber: nurse.phoneNumber || "",
        bloodId: nurse.bloodId ? { value: nurse.bloodId, label: nurse.bloodGroups } : null,
        designation: nurse.designation || "",
        qualification: nurse.qualification || "",
        dateOfBirth: formatDate(nurse.dateOfBirth),
        gender: nurse.gender ? { value: nurse.gender, label: nurse.gender } : null,
        status: nurse.status === "Active",
        password: "",
        confirmPassword: "",
        profileImage: nurse.profileImage || null,
        address1: nurse.address1 || "",
        address2: nurse.address2 || "",
        city: nurse.city || "",
        zipcode: nurse.zipcode || "",
      });
    } catch (error) {
      console.error("Error fetching nurse:", error);
      toast.error("Failed to load nurse");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setNurseData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setNurseData((prev) => ({
      ...prev,
      [name]: selectedOption,
    }));
  };

  const validateForm = () => {
    if (!nurseData.firstName) {
      toast.error("First name is required");
      return false;
    }
    if (!nurseData.lastName) {
      toast.error("Last name is required");
      return false;
    }
    if (!nurseData.email || !/\S+@\S+\.\S+/.test(nurseData.email)) {
      toast.error("Valid email is required");
      return false;
    }
    if (!nurseData.phoneCountryCode) {
      toast.error("Country code is required");
      return false;
    }
    if (!nurseData.phoneNumber) {
      toast.error("Phone number is required");
      return false;
    }
    if (!nurseData.bloodId || !nurseData.bloodId.value) {
      toast.error("Blood group is required");
      return false;
    }
    if (!nurseData.dateOfBirth) {
      toast.error("Date of birth is required");
      return false;
    }
    if (!nurseData.gender || !nurseData.gender.value) {
      toast.error("Gender is required");
      return false;
    }
    if (nurseData.status === null || nurseData.status === undefined) {
      toast.error("Status is required");
      return false;
    }
    if (!isEditMode) {
      if (!nurseData.password) {
        toast.error("Password is required");
        return false;
      }
      if (!nurseData.confirmPassword) {
        toast.error("Confirm Password is required");
        return false;
      }
      if (nurseData.password !== nurseData.confirmPassword) {
        toast.error("Passwords do not match");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const nurseToSave = {
      firstName: nurseData.firstName,
      lastName: nurseData.lastName,
      email: nurseData.email,
      phoneCountryCode: nurseData.phoneCountryCode,
      phoneNumber: nurseData.phoneNumber,
      bloodId: nurseData.bloodId?.value || "",
      designation: nurseData.designation,
      qualification: nurseData.qualification,
      dateOfBirth: nurseData.dateOfBirth,
      gender: nurseData.gender?.value || "",
      status: nurseData.status ? "Active" : "Inactive",
      password: nurseData.password,
      confirmPassword: nurseData.confirmPassword,
      profileImage: nurseData.profileImage,
      address1: nurseData.address1,
      address2: nurseData.address2,
      city: nurseData.city,
      zipcode: nurseData.zipcode,
    };

    const hasNewProfileImage =
      nurseToSave.profileImage &&
      typeof nurseToSave.profileImage !== "string";

    let requestData;
    let headers = {};

    if (hasNewProfileImage) {
      requestData = new FormData();
      Object.entries(nurseToSave).forEach(([key, value]) => {
        if (key === "profileImage" && value) {
          requestData.append(key, value);
        } else if (value !== null && value !== undefined) {
          requestData.append(key, value);
        }
      });
      headers["Content-Type"] = "multipart/form-data";
    } else {
      requestData = { ...nurseToSave };
      if (!requestData.profileImage) {
        requestData.profileImage = null;
      }
      headers["Content-Type"] = "application/json";
    }

    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:8080/api/nurses/${id}`,
          requestData,
          { headers }
        );
        toast.success("Nurse updated successfully");
      } else {
        await axios.post(`http://localhost:8080/api/nurses`, requestData, {
          headers,
        });
        toast.success("Nurse added successfully");
        setNurseData({
          firstName: "",
          lastName: "",
          email: "",
          phoneCountryCode: "+62",
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
        navigate("/nurses");
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error.response || error);
      toast.error("Error saving nurse: " + (error.response?.data?.error || error.message));
    }
  };

  useEffect(() => {
    fetchBloodGroups();
    if (isEditMode) {
      fetchNurse();
    }
  }, [isEditMode, id]);

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">
              {isEditMode ? "Edit Nurse" : "New Nurse"}
            </h1>
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/nurses")}
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
                  value={nurseData.firstName}
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
                  value={nurseData.lastName}
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
                  value={nurseData.email}
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
                    value={nurseData.phoneCountryCode}
                    onChange={(phoneCountryCode) =>
                      setNurseData((prev) => ({
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
                    value={nurseData.phoneNumber}
                    className="form-control"
                    onChange={(e) => {
                      const phoneNumber = e.target.value.replace(/[^0-9]/g, "");
                      setNurseData((prev) => ({
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
                  value={nurseData.bloodId}
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
                  value={nurseData.designation}
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
                  value={nurseData.qualification}
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
                  value={nurseData.dateOfBirth}
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
                  value={nurseData.gender}
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
                    checked={nurseData.status}
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
                  value={nurseData.password}
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
                  value={nurseData.confirmPassword}
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
                    {nurseData.profileImage ? (
                      <>
                        <img
                          src={
                            typeof nurseData.profileImage === "string"
                              ? nurseData.profileImage
                              : URL.createObjectURL(nurseData.profileImage)
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
                        {nurseData.firstName && nurseData.lastName ? (
                          `${nurseData.firstName[0]}${nurseData.lastName[0]}`
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
                  value={nurseData.address1}
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
                  value={nurseData.address2}
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
                  value={nurseData.city}
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
                  value={nurseData.zipcode}
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
                onClick={() => navigate("/nurses")}
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

export default CreateNurse;