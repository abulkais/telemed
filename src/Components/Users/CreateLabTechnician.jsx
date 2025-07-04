import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from "react-select";

const CreateLabTechnician = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [technicianData, setTechnicianData] = useState({
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

  const fetchLabTechnician = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/lab-technicians/${id}`);
      const technician = res.data;

      const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().split("T")[0];
      };

      setTechnicianData({
        firstName: technician.firstName || "",
        lastName: technician.lastName || "",
        email: technician.email || "",
        phoneCountryCode: technician.phoneCountryCode || "+62",
        phoneNumber: technician.phoneNumber || "",
        bloodId: technician.bloodId ? { value: technician.bloodId, label: technician.bloodGroup } : null,
        designation: technician.designation || "",
        qualification: technician.qualification || "",
        dateOfBirth: formatDate(technician.dateOfBirth),
        gender: technician.gender ? { value: technician.gender, label: technician.gender } : null,
        status: technician.status === "Active",
        password: "",
        confirmPassword: "",
        profileImage: technician.profileImage || null,
        address1: technician.address1 || "",
        address2: technician.address2 || "",
        city: technician.city || "",
        zipcode: technician.zipcode || "",
      });
    } catch (error) {
      console.error("Error fetching lab technician:", error);
      toast.error("Failed to load lab technician");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setTechnicianData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setTechnicianData((prev) => ({
      ...prev,
      [name]: selectedOption,
    }));
  };

  const validateForm = () => {
    if (!technicianData.firstName) {
      toast.error("First name is required");
      return false;
    }
    if (!technicianData.lastName) {
      toast.error("Last name is required");
      return false;
    }
    if (!technicianData.email || !/\S+@\S+\.\S+/.test(technicianData.email)) {
      toast.error("Valid email is required");
      return false;
    }
    if (!technicianData.phoneCountryCode) {
      toast.error("Country code is required");
      return false;
    }
    if (!technicianData.phoneNumber) {
      toast.error("Phone number is required");
      return false;
    }
    if (!technicianData.bloodId || !technicianData.bloodId.value) {
      toast.error("Blood group is required");
      return false;
    }
    if (!technicianData.dateOfBirth) {
      toast.error("Date of birth is required");
      return false;
    }
    if (!technicianData.gender || !technicianData.gender.value) {
      toast.error("Gender is required");
      return false;
    }
    if (technicianData.status === null || technicianData.status === undefined) {
      toast.error("Status is required");
      return false;
    }
    if (!isEditMode) {
      if (!technicianData.password) {
        toast.error("Password is required");
        return false;
      }
      if (!technicianData.confirmPassword) {
        toast.error("Confirm Password is required");
        return false;
      }
      if (technicianData.password !== technicianData.confirmPassword) {
        toast.error("Passwords do not match");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const technicianToSave = {
      firstName: technicianData.firstName,
      lastName: technicianData.lastName,
      email: technicianData.email,
      phoneCountryCode: technicianData.phoneCountryCode,
      phoneNumber: technicianData.phoneNumber,
      bloodId: technicianData.bloodId?.value || "",
      designation: technicianData.designation,
      qualification: technicianData.qualification,
      dateOfBirth: technicianData.dateOfBirth,
      gender: technicianData.gender?.value || "",
      status: technicianData.status ? "Active" : "Inactive",
      password: technicianData.password,
      confirmPassword: technicianData.confirmPassword,
      profileImage: technicianData.profileImage,
      address1: technicianData.address1,
      address2: technicianData.address2,
      city: technicianData.city,
      zipcode: technicianData.zipcode,
    };

    const hasNewProfileImage =
      technicianToSave.profileImage &&
      typeof technicianToSave.profileImage !== "string";

    let requestData;
    let headers = {};

    if (hasNewProfileImage) {
      requestData = new FormData();
      Object.entries(technicianToSave).forEach(([key, value]) => {
        if (key === "profileImage" && value) {
          requestData.append(key, value);
        } else if (value !== null && value !== undefined) {
          requestData.append(key, value);
        }
      });
      headers["Content-Type"] = "multipart/form-data";
    } else {
      requestData = { ...technicianToSave };
      if (!requestData.profileImage) {
        requestData.profileImage = null;
      }
      headers["Content-Type"] = "application/json";
    }

    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:8080/api/lab-technicians/${id}`,
          requestData,
          { headers }
        );
        toast.success("Lab Technician updated successfully");
      } else {
        await axios.post(`http://localhost:8080/api/lab-technicians`, requestData, {
          headers,
        });
        toast.success("Lab Technician added successfully");
        setTechnicianData({
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
        navigate("/lab-technicians");
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error.response || error);
      toast.error("Error saving lab technician: " + (error.response?.data?.error || error.message));
    }
  };

  useEffect(() => {
    fetchBloodGroups();
    if (isEditMode) {
      fetchLabTechnician();
    }
  }, [isEditMode, id]);

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">
              {isEditMode ? "Edit Lab Technician" : "New Lab Technician"}
            </h1>
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/lab-technicians")}
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
                  value={technicianData.firstName}
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
                  value={technicianData.lastName}
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
                  value={technicianData.email}
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
                    value={technicianData.phoneCountryCode}
                    onChange={(phoneCountryCode) =>
                      setTechnicianData((prev) => ({
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
                    value={technicianData.phoneNumber}
                    className="form-control"
                    onChange={(e) => {
                      const phoneNumber = e.target.value.replace(/[^0-9]/g, "");
                      setTechnicianData((prev) => ({
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
                  value={technicianData.bloodId}
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
                  value={technicianData.designation}
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
                  value={technicianData.qualification}
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
                  value={technicianData.dateOfBirth}
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
                  value={technicianData.gender}
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
                    checked={technicianData.status}
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
                  value={technicianData.password}
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
                  value={technicianData.confirmPassword}
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
                    {technicianData.profileImage ? (
                      <>
                        <img
                          src={
                            typeof technicianData.profileImage === "string"
                              ? technicianData.profileImage
                              : URL.createObjectURL(technicianData.profileImage)
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
                        {technicianData.firstName && technicianData.lastName ? (
                          `${technicianData.firstName[0]}${technicianData.lastName[0]}`
                        ) : (
                          <i className="fa fa-pencil"></i>
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
                  value={technicianData.address1}
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
                  value={technicianData.address2}
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
                  value={technicianData.city}
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
                  value={technicianData.zipcode}
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
                onClick={() => navigate("/lab-technicians")}
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

export default CreateLabTechnician;