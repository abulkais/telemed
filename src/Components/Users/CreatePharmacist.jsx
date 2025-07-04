import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import Select from "react-select";

const CreatePharmacist = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [pharmacistData, setPharmacistData] = useState({
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

  const fetchPharmacist = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/pharmacists/${id}`);
      const pharmacist = res.data;

      const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().split("T")[0];
      };

      setPharmacistData({
        firstName: pharmacist.firstName || "",
        lastName: pharmacist.lastName || "",
        email: pharmacist.email || "",
        phoneCountryCode: pharmacist.phoneCountryCode || "+62",
        phoneNumber: pharmacist.phoneNumber || "",
        bloodId: pharmacist.bloodId ? { value: pharmacist.bloodId, label: pharmacist.bloodGroups } : null,
        designation: pharmacist.designation || "",
        qualification: pharmacist.qualification || "",
        dateOfBirth: formatDate(pharmacist.dateOfBirth),
        gender: pharmacist.gender ? { value: pharmacist.gender, label: pharmacist.gender } : null,
        status: pharmacist.status === "Active",
        password: "",
        confirmPassword: "",
        profileImage: pharmacist.profileImage || null,
        address1: pharmacist.address1 || "",
        address2: pharmacist.address2 || "",
        city: pharmacist.city || "",
        zipcode: pharmacist.zipcode || "",
      });
    } catch (error) {
      console.error("Error fetching pharmacist:", error);
      toast.error("Failed to load pharmacist");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setPharmacistData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  const handleSelectChange = (name, selectedOption) => {
    setPharmacistData((prev) => ({
      ...prev,
      [name]: selectedOption,
    }));
  };

  const validateForm = () => {
    if (!pharmacistData.firstName) {
      toast.error("First name is required");
      return false;
    }
    if (!pharmacistData.lastName) {
      toast.error("Last name is required");
      return false;
    }
    if (!pharmacistData.email || !/\S+@\S+\.\S+/.test(pharmacistData.email)) {
      toast.error("Valid email is required");
      return false;
    }
    if (!pharmacistData.phoneCountryCode) {
      toast.error("Country code is required");
      return false;
    }
    if (!pharmacistData.phoneNumber) {
      toast.error("Phone number is required");
      return false;
    }
    if (!pharmacistData.bloodId || !pharmacistData.bloodId.value) {
      toast.error("Blood group is required");
      return false;
    }
    if (!pharmacistData.dateOfBirth) {
      toast.error("Date of birth is required");
      return false;
    }
    if (!pharmacistData.gender || !pharmacistData.gender.value) {
      toast.error("Gender is required");
      return false;
    }
    if (pharmacistData.status === null || pharmacistData.status === undefined) {
      toast.error("Status is required");
      return false;
    }
    if (!isEditMode) {
      if (!pharmacistData.password) {
        toast.error("Password is required");
        return false;
      }
      if (!pharmacistData.confirmPassword) {
        toast.error("Confirm Password is required");
        return false;
      }
      if (pharmacistData.password !== pharmacistData.confirmPassword) {
        toast.error("Passwords do not match");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const pharmacistToSave = {
      firstName: pharmacistData.firstName,
      lastName: pharmacistData.lastName,
      email: pharmacistData.email,
      phoneCountryCode: pharmacistData.phoneCountryCode,
      phoneNumber: pharmacistData.phoneNumber,
      bloodId: pharmacistData.bloodId?.value || "",
      designation: pharmacistData.designation,
      qualification: pharmacistData.qualification,
      dateOfBirth: pharmacistData.dateOfBirth,
      gender: pharmacistData.gender?.value || "",
      status: pharmacistData.status ? "Active" : "Inactive",
      password: pharmacistData.password,
      confirmPassword: pharmacistData.confirmPassword,
      profileImage: pharmacistData.profileImage,
      address1: pharmacistData.address1,
      address2: pharmacistData.address2,
      city: pharmacistData.city,
      zipcode: pharmacistData.zipcode,
    };

    const hasNewProfileImage =
      pharmacistToSave.profileImage &&
      typeof pharmacistToSave.profileImage !== "string";

    let requestData;
    let headers = {};

    if (hasNewProfileImage) {
      requestData = new FormData();
      Object.entries(pharmacistToSave).forEach(([key, value]) => {
        if (key === "profileImage" && value) {
          requestData.append(key, value);
        } else if (value !== null && value !== undefined) {
          requestData.append(key, value);
        }
      });
      headers["Content-Type"] = "multipart/form-data";
    } else {
      requestData = { ...pharmacistToSave };
      if (!requestData.profileImage) {
        requestData.profileImage = null;
      }
      headers["Content-Type"] = "application/json";
    }

    try {
      if (isEditMode) {
        await axios.put(
          `http://localhost:8080/api/pharmacists/${id}`,
          requestData,
          { headers }
        );
        toast.success("Pharmacist updated successfully");
      } else {
        await axios.post(`http://localhost:8080/api/pharmacists`, requestData, {
          headers,
        });
        toast.success("Pharmacist added successfully");
        setPharmacistData({
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
        navigate("/pharmacists");
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error.response || error);
      toast.error("Error saving pharmacist: " + (error.response?.data?.error || error.message));
    }
  };

  useEffect(() => {
    fetchBloodGroups();
    if (isEditMode) {
      fetchPharmacist();
    }
  }, [isEditMode, id]);

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">
              {isEditMode ? "Edit Pharmacist" : "New Pharmacist"}
            </h1>
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/pharmacists")}
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
                  value={pharmacistData.firstName}
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
                  value={pharmacistData.lastName}
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
                  value={pharmacistData.email}
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
                    value={pharmacistData.phoneCountryCode}
                    onChange={(phoneCountryCode) =>
                      setPharmacistData((prev) => ({
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
                    value={pharmacistData.phoneNumber}
                    className="form-control"
                    onChange={(e) => {
                      const phoneNumber = e.target.value.replace(/[^0-9]/g, "");
                      setPharmacistData((prev) => ({
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
                  value={pharmacistData.bloodId}
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
                  value={pharmacistData.designation}
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
                  value={pharmacistData.qualification}
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
                  value={pharmacistData.dateOfBirth}
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
                  value={pharmacistData.gender}
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
                    checked={pharmacistData.status}
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
                  value={pharmacistData.password}
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
                  value={pharmacistData.confirmPassword}
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
                    {pharmacistData.profileImage ? (
                      <>
                        <img
                          src={
                            typeof pharmacistData.profileImage === "string"
                              ? pharmacistData.profileImage
                              : URL.createObjectURL(pharmacistData.profileImage)
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
                        {pharmacistData.firstName && pharmacistData.lastName ? (
                          `${pharmacistData.firstName[0]}${pharmacistData.lastName[0]}`
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
                  value={pharmacistData.address1}
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
                  value={pharmacistData.address2}
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
                  value={pharmacistData.city}
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
                  value={pharmacistData.zipcode}
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
                onClick={() => navigate("/pharmacists")}
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

export default CreatePharmacist;