import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import Preloader from "../preloader";
import moment from "moment";

const ViewPatientAdmission = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [admission, setAdmission] = useState(null);

  const fetchAdmission = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/patient-admissions/${id}`
      );
      setAdmission(res.data);
    } catch (error) {
      console.error("Error fetching admission:", error);
      toast.error("Failed to load admission");
    }
  };

  useEffect(() => {
    fetchAdmission();
  }, [id]);

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString("default", { month: "short" });
    const year = dateObj.getFullYear();
    return ` ${day} ${month}, ${year}`;
  };

const formatTime = (dateString) => {
    const dateObj = new Date(dateString);
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const getTimeAgo = (dateString) => {
    const date = moment(dateString);
    return date.fromNow();
  };
  if (!admission) return <Preloader />;

  return (
    <div className="container-fluid">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">Admission Details</h1>
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/patient-admissions")}
            >
              Back
            </button>
          </div>

          <div className="card p-4 border-0 mb-4">
            <div className="d-flex align-items-center">
              <div className="profile-picture-container ">
                {admission.profileImage ? (
                  <img
                    src={admission.profileImage}
                    alt={`${admission.firstName} ${patientData.lastName}`}
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
                    {admission.patient?.firstName?.charAt(0)?.toUpperCase() ||
                      ""}
                    {admission.patient?.lastName?.charAt(0)?.toUpperCase() ||
                      ""}
                  </div>
                )}
              </div>
              <div className="ml-3">
                <div className="d-flex align-center">
                  <h5 className="mb-0">
                    {admission.patient?.firstName} {admission.patient?.lastName}
                  </h5>

                  <p
                    className={`badges mb-1 ml-2 ${
                      admission.status ? "bg-light-success" : "bg-light-danger"
                    }`}
                  >
                    {admission.status ? "Active" : "Inactive"}
                  </p>
                </div>

                <p className="text-muted mb-0">{admission.patient?.email}</p>
              </div>
            </div>
          </div>

          <div className="card p-4 border-0">
            <div className="row">
              <div className="col-md-3">
                <label class=" text-gray-600">Admission ID:</label>
                <p className=" text-gray-800 showSpan">
                  <span className="badges bg-light-success">
                    {admission.admissionID}
                  </span>
                </p>
              </div>

              <div className="col-md-3">
                <label class=" text-gray-600">Doctor:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.doctor?.firstName} {admission.doctor?.lastName}
                </p>
              </div>
              <div className="col-md-3">
                <label class=" text-gray-600">Admission Date:</label>
                <p className=" text-gray-800 showSpan">
                  <span className="badges bg-light-info">
                     {formatTime(admission.admissionDate)} <br />
                    {formatDate(admission.admissionDate)}
                  </span>
                </p>
              </div>
              <div className="col-md-3">
                <label class=" text-gray-600">Discharge Date:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.dischargeDate
                    ? new Date(admission.dischargeDate).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              <div className="col-md-3">
                <label class=" text-gray-600">Package:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.package?.packageName || "N/A"}
                </p>
              </div>
              <div className="col-md-3">
                <label class=" text-gray-600">Insurance:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.insurance?.insuranceName || "N/A"}
                </p>
              </div>
              <div className="col-md-3">
                <label class=" text-gray-600">Bed:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.bed?.name || "N/A"}
                </p>
              </div>
              <div className="col-md-3">
                <label class=" text-gray-600">Policy No:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.policyNo || "N/A"}
                </p>
              </div>
              <div className="col-md-3">
                <label class=" text-gray-600">Agent Name:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.agentName || "N/A"}
                </p>
              </div>
              <div className="col-md-3">
                <label class=" text-gray-600">Guardian Name:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.guardianName || "N/A"}
                </p>
              </div>
              <div className="col-md-3">
                <label class=" text-gray-600">Guardian Relation:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.guardianRelation || "N/A"}
                </p>
              </div>
              <div className="col-md-3">
                <label class=" text-gray-600">Guardian Contact:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.countryCode} {admission.guardianContact || "N/A"}
                </p>
              </div>
              <div className="col-md-3">
                <label class=" text-gray-600">Guardian Address:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.guardianAddress || "N/A"}
                </p>
              </div>
              <div className="col-md-3">
                <label class=" text-gray-600">Status:</label>
                <p className=" text-gray-800 showSpan">
                  <span
                    className={`badge ${
                      admission.status ? "bg-light-success" : "bg-light-danger"
                    }`}
                  >
                    {admission.status ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>

                <div className=" col-md-3">
                <label className="fs-5 text-gray-600">Created At:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {getTimeAgo(admission.created_at || "N/A")}
                </p>
              </div>
              <div className=" col-md-3">
                <label className="fs-5 text-gray-600">Updated At:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {getTimeAgo(admission.updated_at || "N/A")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPatientAdmission;
