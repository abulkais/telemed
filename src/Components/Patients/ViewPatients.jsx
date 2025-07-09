import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";

const ViewPatients = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [patientData, setPatientData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    phoneCountryCode: "+91",
    phoneNumber: "",
    gender: "",
    status: true,
    bloodGroup: "",
    fechaDeLoQueSea: "",
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

  const fetchPatient = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/patients/${id}`);
      const patient = res.data;
      setPatientData({
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        email: patient.email || "",
        dateOfBirth: patient.dateOfBirth || "",
        phoneCountryCode: patient.phoneCountryCode || "+91",
        phoneNumber: patient.phoneNumber || "",
        gender: patient.gender || "",
        status: patient.status || false,
        bloodGroup: patient.bloodGroup || "",
        fechaDeLoQueSea: patient.fechaDeLoQueSea || "",
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

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString("default", { month: "short" });
    const year = dateObj.getFullYear();
    return ` ${day} ${month}, ${year}`;
  };
  useEffect(() => {
    if (id) fetchPatient();
  }, [id]);

  return (
    <div className="container-fluid">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">View Patient</h1>
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/patients")}
            >
              Back
            </button>
          </div>

          <div className="card p-4 border-0 mb-4">
            <div className="d-flex align-items-center">
              <div className="profile-picture-container ">
                {patientData.profileImage ? (
                  <img
                    src={patientData.profileImage}
                    alt={`${patientData.firstName} ${patientData.lastName}`}
                    className="rounded-circle"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                      marginBottom: "20px",
                    }}
                  />
                ) : (
                  <div
                    className="rounded-circle text-white d-flex align-items-center justify-content-center"
                    style={{
                      width: "80px",
                      height: "80px",
                      backgroundColor: "#1976d2",
                      margin: "0 auto 20px",
                      fontSize: "40px",
                    }}
                  >
                    {patientData.firstName?.charAt(0)?.toUpperCase() || ""}
                    {patientData.lastName?.charAt(0)?.toUpperCase() || ""}
                  </div>
                )}
              </div>
              <div className="ml-3">
                <div className="d-flex align-center">
                  <h5 className="mb-0">
                    {patientData.firstName} {patientData.lastName}
                  </h5>

                  <p
                     className={`badges mb-1 ml-2 ${
                      patientData.status
                        ? "bg-light-success"
                        : "bg-light-danger"
                    }`}
                  >
                    {patientData.status ? "Active" : "Inactive"}
                  </p>
                </div>

                <p className="text-muted mb-0">{patientData.email}</p>
              </div>
            </div>
          </div>

          <div className="card p-4 border-0">
            <div className="row">
              <div className="form-group col-md-4">
                <label>Date Of Birth:</label>
                <p>{formatDate(patientData.dateOfBirth)}</p>
              </div>

              <div className="form-group col-md-4">
                <label>Phone:</label>
                <p>{`${patientData.phoneCountryCode} ${patientData.phoneNumber}`}</p>
              </div>
              <div className="form-group col-md-4">
                <label>Gender:</label>
                <p>{patientData.gender}</p>
              </div>

              <div className="form-group col-md-4">
                <label>Blood Group:</label>
                <span className="badge fs-6 bg-light-success"></span>
                <p>
                  <span className="badge fs-6 bg-light-success">
                    {patientData.bloodGroup || "N/A"}
                  </span>
                </p>
              </div>

              <div className="form-group col-md-4">
                <label>UHID:</label>
                <p>{patientData.uhid}</p>
              </div>
            </div>
            <h6 className="mt-4">Address Details</h6>
            <div className="row">
              <div className="form-group col-md-6">
                <label>Address 1:</label>
                <p>{patientData.address1 || "N/A"}</p>
              </div>
              <div className="form-group col-md-6">
                <label>Address 2:</label>
                <p>{patientData.address2 || "N/A"}</p>
              </div>

              <div className="form-group col-md-6">
                <label>City:</label>
                <p>{patientData.city || "N/A"}</p>
              </div>
              <div className="form-group col-md-6">
                <label>Zipcode:</label>
                <p>{patientData.zipcode || "N/A"}</p>
              </div>
            </div>

            <h6 className="mt-4">Social Details</h6>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label>Facebook URL:</label>

                <p>
                  {patientData.facebookUrl &&
                  patientData.facebookUrl.length > 0 ? (
                    <a
                      href={patientData.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {patientData.facebookUrl}
                    </a>
                  ) : (
                    <span>N/A</span>
                  )}
                </p>
              </div>
              <div className="form-group col-md-6">
                <label>Twitter URL:</label>
                <p>
                  {patientData.twitterUrl &&
                  patientData.twitterUrl.length > 0 ? (
                    <a
                      href={patientData.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {patientData.twitterUrl}
                    </a>
                  ) : (
                    <span>N/A</span>
                  )}
                </p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-md-6">
                <label>Instagram URL:</label>
                <p>
                  {patientData.instagramUrl &&
                  patientData.instagramUrl.length > 0 ? (
                    <a
                      href={patientData.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {patientData.instagramUrl}
                    </a>
                  ) : (
                    <span>N/A</span>
                  )}
                </p>
              </div>
              <div className="form-group col-md-6">
                <label>LinkedIn URL:</label>
                <p>
                  {patientData.linkedinUrl &&
                  patientData.linkedinUrl.length > 0 ? (
                    <a
                      href={patientData.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {patientData.linkedinUrl}
                    </a>
                  ) : (
                    <span>N/A</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPatients;
