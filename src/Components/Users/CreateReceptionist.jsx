import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from "react-select";

const CreateReceptionist = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [receptionistData, setReceptionistData] = useState({
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

  const fetchReceptionist = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/receptionists/${id}`);
      const receptionist = res.data;

      const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().split("T")[0];
      };

      setReceptionistData({
        firstName: receptionist.firstName || "",
        lastName: receptionist.lastName || "",
        email: receptionist.email || "",
        phoneCountryCode: receptionist.phoneCountryCode || "+62",
        phoneNumber: receptionist.phoneNumber || "",
        bloodId: receptionist.bloodId ? { value: receptionist.bloodId, label: receptionist.bloodGroups } : null,
        designation: receptionist.designation || "",
        qualification: receptionist.qualification || "",
        dateOfBirth: formatDate(receptionist.dateOfBirth),
        gender: receptionist.gender ? { value: receptionist.gender, label: receptionist.gender } : null,
        status: receptionist.status === "Active",
        password: "",
        confirmPassword: "",
        profileImage: receptionist.profileImage || null,
        address1: receptionist.address1 || "",
        address2: receptionist.address2 || "",
        city: receptionist.city || "",
        zipcode: receptionist.zipcode || "",
      });
    } catch (error) {
      console.error("Error fetching receptionist:", error);
      toast.error("Failed to load receptionist");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setReceptionistData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setReceptionistData((prev) => ({
      ...prev,
      [name]: selectedOption,
    }));
  };

  const validateForm = () => {
    if (!receptionistData.firstName) {
      toast.error("First name is required");
      return false;
    }
    if (!receptionistData.lastName) {
      toast.error("Last name is required");
      return false;
    }
    if (!receptionistData.email || !/\S+@\S+\.\S+/.test(receptionistData.email)) {
      toast.error("Valid email is required");
      return false;
    }
    if (!receptionistData.phoneCountryCode) {
      toast.error("Country code is required");
      return false;
    }
    if (!receptionistData.phoneNumber) {
      toast.error("Phone number is required");
      return false;
    }
    if (!receptionistData.bloodId || !receptionistData.bloodId.value) {
      toast.error("Blood group is required");
      return false;
    }
    if (!receptionistData.dateOfBirth) {
      toast.error("Date of birth is required");
      return false;
    }
    if (!receptionistData.gender || !receptionistData.gender.value) {
      toast.error("Gender is required");
      return false;
    }
    if (receptionistData.status === null || receptionistData.status === undefined) {
      toast.error("Status is required");
      return false;
    }
    if (!isEditMode) {
      if (!receptionistData.password) {
        toast.error("Password is required");
        return false;
      }
      if (!receptionistData.confirmPassword) {
        toast.error("Confirm Password is required");
        return false;
      }
      if (receptionistData.password !== receptionistData.confirmPassword) {
        toast.error("Passwords do not match");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const receptionistToSave = {
      firstName: receptionistData.firstName,
      lastName: receptionistData.lastName,
      email: receptionistData.email,
      phoneCountryCode: receptionistData.phoneCountryCode,
      phoneNumber: receptionistData.phoneNumber,
      bloodId: receptionistData.bloodId?.value || "",
      designation: receptionistData.designation,
      qualification: receptionistData.qualification,
      dateOfBirth: receptionistData.dateOfBirth,
      gender: receptionistData.gender?.value || "",
      status: receptionistData.status ? "Active" : "Inactive",
      password: receptionistData.password,
      confirmPassword: receptionistData.confirmPassword,
      profileImage: receptionistData.profileImage,
      address1: receptionistData.address1,
      address2: receptionistData.address2,
      city: receptionistData.city,
      zipcode: receptionistData.zipcode,
    };

    const hasNewProfileImage =
      receptionistToSave.profileImage &&
      typeof receptionistToSave.profileImage !== "string";

    let requestData;
    let headers = {};

    if (hasNewProfileImage) {
      requestData = new FormData();
      Object.entries(receptionistToSave).forEach(([key, value]) => {
        if (key === "profileImage" && value) {
          requestData.append(key, value);
        } else if (value !== null && value !== undefined) {
          requestData.append(key, value);
        }
      });
      headers["Content-Type"] = "multipart/form-data";
    } else {
      requestData = { ...receptionistToSave };
      if (!requestData.profileImage) {
        requestData.profileImage = null;
      }
      headers["Content-Type"] = "application/json";
    }

    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:8080/api/receptionists/${id}`,
          requestData,
          { headers }
        );
        toast.success("Receptionist updated successfully");
      } else {
        await axios.post(`http://localhost:8080/api/receptionists`, requestData, {
          headers,
        });
        toast.success("Receptionist added successfully");
        setReceptionistData({
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
        navigate("/receptionists");
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error.response || error);
      toast.error("Error saving receptionist: " + (error.response?.data?.error || error.message));
    }
  };

  useEffect(() => {
    fetchBloodGroups();
    if (isEditMode) {
      fetchReceptionist();
    }
  }, [isEditMode, id]);

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">
              {isEditMode ? "Edit Receptionist" : "New Receptionist"}
            </h1>
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/receptionists")}
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
                  value={receptionistData.firstName}
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
                  value={receptionistData.lastName}
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
                  value={receptionistData.email}
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
                    value={receptionistData.phoneCountryCode}
                    onChange={(phoneCountryCode) =>
                      setReceptionistData((prev) => ({
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
                    value={receptionistData.phoneNumber}
                    className="form-control"
                    onChange={(e) => {
                      const phoneNumber = e.target.value.replace(/[^0-9]/g, "");
                      setReceptionistData((prev) => ({
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
                  value={receptionistData.bloodId}
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
                  value={receptionistData.designation}
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
                  value={receptionistData.qualification}
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
                  value={receptionistData.dateOfBirth}
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
                  value={receptionistData.gender}
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
                    checked={receptionistData.status}
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
                  value={receptionistData.password}
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
                  value={receptionistData.confirmPassword}
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
                    {receptionistData.profileImage ? (
                      <>
                        <img
                          src={
                            typeof receptionistData.profileImage === "string"
                              ? receptionistData.profileImage
                              : URL.createObjectURL(receptionistData.profileImage)
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
                        {receptionistData.firstName && receptionistData.lastName ? (
                          `${receptionistData.firstName[0]}${receptionistData.lastName[0]}`
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
                  value={receptionistData.address1}
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
                  value={receptionistData.address2}
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
                  value={receptionistData.city}
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
                  value={receptionistData.zipcode}
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
                onClick={() => navigate("/receptionists")}
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

export default CreateReceptionist;