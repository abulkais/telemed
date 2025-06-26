import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import Preloader from "../preloader";
import moment from "moment";
const ViewIpdPatient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [ipd, setIpd] = useState(null);

  const fetchIpdPatient = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/ipd-patients/${id}`
      );
      setIpd(res.data);
    } catch (error) {
      console.error("Error fetching IPD patient:", error);
      toast.error("Failed to load IPD patient");
    }
  };

  useEffect(() => {
    fetchIpdPatient();
  }, [id]);

  const getTimeAgo = (date) => {
    return moment(date).fromNow();
  };

  const handleEdit = (ipd) => {
    navigate(`/ipd-patients/${ipd.id}/edit`);
  };
  
  if (!ipd) return <Preloader />;

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">IPD Patient Details</h1>
            <div>
              <button
                className="btn btn-primary px-4 mr-2"
                onClick={() => handleEdit(ipd)}
              >
                Edit
              </button>

              <button
                className="btn btn-outline-primary px-4"
                onClick={() => navigate("/ipd-patients")}
              >
                Back
              </button>
            </div>
          </div>

          <div className="card p-4 border-0">
            <div className="row">
              <div className="col-md-6">
                <label className="fs-5 text-gray-600">IPD No:</label>
                <p className="fs-5 text-gray-800 showSpan">{ipd.ipdNo}</p>
                <label className="fs-5 text-gray-600">Patient:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {ipd.patient?.firstName} {ipd.patient?.lastName}
                </p>
                <label className="fs-5 text-gray-600">Case ID:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {ipd.caseId || "N/A"}
                </p>
                <label className="fs-5 text-gray-600">Height:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {ipd.height || "N/A"}
                </p>
                <label className="fs-5 text-gray-600">Weight:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {ipd.weight || "N/A"}
                </p>
                <label className="fs-5 text-gray-600">Blood Pressure:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {ipd.bloodPressure || "N/A"}
                </p>
                <label className="fs-5 text-gray-600">Admission Date:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {new Date(ipd.admissionDate).toLocaleString()}
                </p>

                <label className="fs-5 text-gray-600">Created on:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {getTimeAgo(ipd.created_at)}
                </p>
              </div>
              <div className="col-md-6">
                <label className="fs-5 text-gray-600">Doctor:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {ipd.doctor?.firstName} {ipd.doctor?.lastName}
                </p>
                <label className="fs-5 text-gray-600">Bed Type:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {ipd.bedType?.name || "N/A"}
                </p>
                <label className="fs-5 text-gray-600">Bed:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {ipd.bed?.name || "N/A"}
                </p>
                <label className="fs-5 text-gray-600">ID Card Number:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {ipd.idCardNumber || "N/A"}
                </p>
                <label className="fs-5 text-gray-600">Is Old Patient:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  <span
                    className={`badge ${
                      ipd.isOldPatient ? "bg-light-success" : "bg-light-danger"
                    }`}
                  >
                    {ipd.isOldPatient ? "Yes" : "No"}
                  </span>
                </p>
                <label className="fs-5 text-gray-600">Symptoms:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {ipd.symptoms || "N/A"}
                </p>
                <label className="fs-5 text-gray-600">Notes:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {ipd.notes || "N/A"}
                </p>

                <label className="fs-5 text-gray-600">Updated on:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {getTimeAgo(ipd.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewIpdPatient;
