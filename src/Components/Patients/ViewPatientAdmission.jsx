import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import Preloader from "../preloader";

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

  if (!admission) return <Preloader />;

  return (
    <div className="container-fluid patients_view">
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

          <div className="card p-4 border-0">
            <div className="row">
              <div className="col-md-6">
                <label class=" text-gray-600">Admission ID:</label>
                <p className=" text-gray-800 showSpan">
                  <span className="badges bg-light-success">
                    {admission.admissionID}
                  </span>
                </p>
                <label class=" text-gray-600">Patient:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.patient?.firstName} {admission.patient?.lastName}
                </p>
                <label class=" text-gray-600">Doctor:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.doctor?.firstName} {admission.doctor?.lastName}
                </p>
                <label class=" text-gray-600">Admission Date:</label>
                <p className=" text-gray-800 showSpan">
                  <span className="badges bg-light-info">
                    {" "}
                    {new Date(admission.admissionDate).toLocaleString()}
                  </span>
                </p>
                <label class=" text-gray-600">Discharge Date:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.dischargeDate
                    ? new Date(admission.dischargeDate).toLocaleString()
                    : "N/A"}
                </p>
                <label class=" text-gray-600">Package:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.package?.packageName || "N/A"}
                </p>
                <label class=" text-gray-600">Insurance:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.insurance?.insuranceName || "N/A"}
                </p>
              </div>
              <div className="col-md-6">
                <label class=" text-gray-600">Bed:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.bed?.name || "N/A"}
                </p>
                <label class=" text-gray-600">Policy No:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.policyNo || "N/A"}
                </p>
                <label class=" text-gray-600">Agent Name:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.agentName || "N/A"}
                </p>
                <label class=" text-gray-600">Guardian Name:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.guardianName || "N/A"}
                </p>
                <label class=" text-gray-600">Guardian Relation:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.guardianRelation || "N/A"}
                </p>
                <label class=" text-gray-600">Guardian Contact:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.countryCode} {admission.guardianContact || "N/A"}
                </p>
                <label class=" text-gray-600">Guardian Address:</label>
                <p className=" text-gray-800 showSpan">
                  {admission.guardianAddress || "N/A"}
                </p>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPatientAdmission;
