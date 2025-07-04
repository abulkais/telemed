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
  const baseUrl = "http://localhost:8080";

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

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getTimeAgo = (date) => {
    return moment(date).fromNow();
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
                {admission.patientProfileImage ? (
                  <img
                    src={`${baseUrl}${admission.patientProfileImage}`}
                    alt={`${admission.firstName} ${admission.lastName}`}
                    className="profile-picture"
                  />
                ) : (
                  <div className="empty-profile text-white d-flex align-items-center justify-content-center">
                    {admission.patient?.firstName?.charAt(0)?.toUpperCase() ||
                      ""}
                    {admission.patient?.lastName?.charAt(0)?.toUpperCase() ||
                      ""}
                  </div>
                )}
              </div>
              <div className="ml-3">
                <h5 className="mb-0">
                  {admission.patient?.firstName} {admission.patient?.lastName}
                </h5>
                <p className="text-muted mb-0">{admission.patient?.email}</p>
              </div>
            </div>
          </div>

          <div className="card p-4 border-0">
            <div className="row">
              <div className="col-md-6">
                <label class="fs-5 text-gray-600">Admission ID:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  <span className="badges bg-light-success">
                    {admission.admissionID}
                  </span>
                </p>

                <label class="fs-5 text-gray-600">Doctor:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {admission.doctor?.firstName} {admission.doctor?.lastName}
                </p>
                <label class="fs-5 text-gray-600">Admission Date:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  <span className="badges bg-light-info">
                    {formatDate(admission.admissionDate)}{" "}
                    {formatTime(admission.admissionDate)}
                  </span>
                </p>
                <label class="fs-5 text-gray-600">Discharge Date:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {admission.dischargeDate
                    ? new Date(admission.dischargeDate).toLocaleString()
                    : "N/A"}
                </p>
                <label class="fs-5 text-gray-600">Package:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {admission.package?.packageName || "N/A"}
                </p>
                <label class="fs-5 text-gray-600">Insurance:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {admission.insurance?.insuranceName || "N/A"}
                </p>

                <label class="fs-5 text-gray-600">Status:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  <span
                    className={`badges ${
                      admission.status ? "bg-light-success" : "bg-light-danger"
                    }`}
                  >
                    {admission.status ? "Active" : "Inactive"}
                  </span>
                </p>

                <label class="fs-5 text-gray-600">Created At:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {getTimeAgo(admission.created_at)}
                </p>
              </div>
              <div className="col-md-6">
                <label class="fs-5 text-gray-600">Bed:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {admission.bed?.name || "N/A"}
                </p>
                <label class="fs-5 text-gray-600">Policy No:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {admission.policyNo || "N/A"}
                </p>
                <label class="fs-5 text-gray-600">Agent Name:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {admission.agentName || "N/A"}
                </p>
                <label class="fs-5 text-gray-600">Guardian Name:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {admission.guardianName || "N/A"}
                </p>
                <label class="fs-5 text-gray-600">Guardian Relation:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {admission.guardianRelation || "N/A"}
                </p>
                <label class="fs-5 text-gray-600">Guardian Contact:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {admission.countryCode} {admission.guardianContact || "N/A"}
                </p>
                <label class="fs-5 text-gray-600">Guardian Address:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {admission.guardianAddress || "N/A"}
                </p>

                <label class="fs-5 text-gray-600">Updated At:</label>
                <p className=" fs-5 text-gray-800 showSpan">
                  {getTimeAgo(admission.updated_at)}
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
