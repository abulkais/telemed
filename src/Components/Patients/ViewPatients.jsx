import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import moment from "moment";

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
    created_at: "",
    updated_at: "",
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
        created_at: patient.created_at,
        updated_at: patient.updated_at,
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

  const getTimeAgo = (date) => {
    return moment(date).fromNow();
  };

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
                    src={`${patientData.profileImage}`}
                    alt={`${patientData.firstName} ${patientData.lastName}`}
                    className="profile-picture"
                  />
                ) : (
                  <div className="empty-profile text-white d-flex align-items-center justify-content-center">
                    {patientData.firstName?.charAt(0)?.toUpperCase() || ""}
                    {patientData.lastName?.charAt(0)?.toUpperCase() || ""}
                  </div>
                )}
              </div>
              <div className="ml-3">
                <h5 className="mb-0">
                  {patientData.firstName} {patientData.lastName}
                </h5>
                <p className="text-muted mb-0">{patientData.email}</p>
              </div>
            </div>
          </div>

          <div className="card p-4 border-0 mb-4">
            <div className="row">
              <div className=" col-md-4">
                <label class="fs-5 text-gray-600">Date Of Birth:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {formatDate(patientData.dateOfBirth)}
                </p>
              </div>

              <div className=" col-md-4">
                <label class="fs-5 text-gray-600">Phone:</label>
                <p className=" fs-5 text-gray-800 showSpan">{`${patientData.phoneCountryCode} ${patientData.phoneNumber}`}</p>
              </div>
              <div className=" col-md-4">
                <label class="fs-5 text-gray-600">Gender:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {patientData.gender}
                </p>
              </div>
              <div className=" col-md-4">
                <label class="fs-5 text-gray-600">Status:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {patientData.status ? "Active" : "Inactive"}
                </p>
              </div>

              <div className=" col-md-4">
                <label class="fs-5 text-gray-600">Blood Group:</label>
                <span className="badge fs-6 bg-light-success"></span>
                <p className=" fs-5 text-gray-800 showSpan">
                  <span className="badge fs-6 bg-light-success">
                    {patientData.bloodGroup || "N/A"}
                  </span>
                </p>
              </div>

              <div className=" col-md-4">
                <label class="fs-5 text-gray-600">UHID:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {patientData.uhid}
                </p>
              </div>

              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Created At:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {getTimeAgo(patientData.created_at)}
                </p>
              </div>

              <div className=" col-md-4">
                <label class="fs-5 text-gray-600">Updated At:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {getTimeAgo(patientData.updated_at)}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4 border-0 mb-4">
            <h6 className="mt-2">Address Details</h6>
            <div className="row">
              <div className=" col-md-6">
                <label class="fs-5 text-gray-600">Address 1:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {patientData.address1 || "N/A"}
                </p>
              </div>
              <div className=" col-md-6">
                <label class="fs-5 text-gray-600">Address 2:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {patientData.address2 || "N/A"}
                </p>
              </div>

              <div className=" col-md-6">
                <label class="fs-5 text-gray-600">City:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {patientData.city || "N/A"}
                </p>
              </div>
              <div className=" col-md-6">
                <label class="fs-5 text-gray-600">Zipcode:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {patientData.zipcode || "N/A"}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4 border-0 mb-4">
            <h6 className="mt-2">Social Details</h6>
            <div className="form-row">
              <div className=" col-md-6">
                <label class="fs-5 text-gray-600">Facebook URL:</label>

                <p className=" fs-5 text-gray-800 showSpan">
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
              <div className=" col-md-6">
                <label class="fs-5 text-gray-600">Twitter URL:</label>
                <p className=" fs-5 text-gray-800 showSpan">
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
              <div className=" col-md-6">
                <label class="fs-5 text-gray-600">Instagram URL:</label>
                <p className=" fs-5 text-gray-800 showSpan">
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
              <div className=" col-md-6">
                <label class="fs-5 text-gray-600">LinkedIn URL:</label>
                <p className=" fs-5 text-gray-800 showSpan">
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
