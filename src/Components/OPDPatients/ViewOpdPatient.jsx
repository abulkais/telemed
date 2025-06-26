import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import Preloader from "../preloader";
import moment from "moment";

const ViewOpdPatient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [opd, setOpd] = useState(null);

  const fetchOpdPatient = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/opd-patients/${id}`);
      setOpd(res.data);
    } catch (error) {
      console.error("Error fetching OPD patient:", error);
      toast.error("Failed to load OPD patient");
    }
  };

  useEffect(() => {
    fetchOpdPatient();
  }, [id]);

  const getTimeAgo = (date) => {
    return moment(date).fromNow();
  };

  const handleEdit = (opd) => {
    navigate(`/opd-patients/${opd.id}/edit`);
  };

  if (!opd) return <Preloader />;

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">OPD Patient Details</h1>
            <div>
              <button
                className="btn btn-primary px-4 mr-2"
                onClick={() => handleEdit(opd)}
              >
                Edit
              </button>
              <button
                className="btn btn-outline-primary px-4"
                onClick={() => navigate("/opd-patients")}
              >
                Back
              </button>
            </div>
          </div>

          <div className="card p-4 border-0">
            <div className="row">
              <div className="col-md-6">
                <label className="fs-5 text-gray-600">OPD No:</label>
                <p className="fs-5 text-gray-800 showSpan">{opd.opdNo}</p>
                <label className="fs-5 text-gray-600">Patient:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {opd.patient?.firstName} {opd.patient?.lastName}
                </p>
                <label className="fs-5 text-gray-600">Case ID:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {opd.caseId || "N/A"}
                </p>
                <label className="fs-5 text-gray-600">Height:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {opd.height || "N/A"}
                </p>
                <label className="fs-5 text-gray-600">Weight:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {opd.weight || "N/A"}
                </p>
                <label className="fs-5 text-gray-600">Blood Pressure:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {opd.bloodPressure || "N/A"}
                </p>
                <label className="fs-5 text-gray-600">Appointment Date:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {new Date(opd.visitDate).toLocaleString()}
                </p>
                <label className="fs-5 text-gray-600">Created on:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {getTimeAgo(opd.created_at)}
                </p>
              </div>
              <div className="col-md-6">
                <label className="fs-5 text-gray-600">Doctor:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {opd.doctor?.firstName} {opd.doctor?.lastName}
                </p>
                <label className="fs-5 text-gray-600">Standard Charge:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {opd.standardCharge || "N/A"}
                </p>
                <label className="fs-5 text-gray-600">Payment Mode:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {opd.paymentMode || "N/A"}
                </p>
                <label className="fs-5 text-gray-600">Symptoms:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {opd.symptoms || "N/A"}
                </p>
                <label className="fs-5 text-gray-600">Notes:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {opd.notes || "N/A"}
                </p>
                <label className="fs-5 text-gray-600">Updated on:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {getTimeAgo(opd.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOpdPatient;