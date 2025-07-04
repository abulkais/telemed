import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";

const ViewCaseHandler = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [caseHandler, setCaseHandler] = useState(null);

  const fetchCaseHandler = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/case-handlers/${id}`
      );
      setCaseHandler(res.data);
    } catch (error) {
      console.error("Error fetching case handler:", error);
      toast.error("Failed to load case handler");
    }
  };

  useEffect(() => {
    fetchCaseHandler();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (!caseHandler) {
    return (
      <div className="container-fluid patients_fields">
        <div className="text-center">
          <h4>Loading...</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">Case Handler Details</h1>
            <div>
              <button
                className="btn btn-primary mr-2 px-4"
                onClick={() => navigate(`/case-handlers/${id}/edit`)}
              >
                Edit
              </button>
              <button
                className="btn btn-secondary px-4"
                onClick={() => navigate("/case-handlers")}
              >
                Back
              </button>
            </div>
          </div>

          <div className="card p-4 border-0 mb-4">
            <div className="d-flex align-items-center">
              <div className="profile-picture-container ">
                {caseHandler.profileImage ? (
                  <img
                    src={caseHandler.profileImage}
                    alt={`${caseHandler.firstName} ${caseHandler.lastName}`}
                    className="profile-picture"
                  />
                ) : (
                  <div className="empty-profile text-white d-flex align-items-center justify-content-center">
                    {caseHandler.firstName?.charAt(0)?.toUpperCase() || ""}
                    {caseHandler.lastName?.charAt(0)?.toUpperCase() || ""}
                  </div>
                )}
              </div>
              <div className="ml-3">
                <h5 className="mb-0">
                  {caseHandler.firstName} {caseHandler.lastName}
                </h5>
                <p className="text-muted mb-0">{caseHandler.email}</p>
              </div>
            </div>
          </div>
          <div className="card p-4 border-0 mb-4">
            <div className="row">
              <div className=" col-md-6 ">
                <label className="fs-5 text-gray-600">Designation:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {caseHandler.designation || "N/A"}
                </p>
              </div>
              <div className=" col-md-6">
                <label className="fs-5 text-gray-600">Date of Birth:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  <span className="badges bg-light-info">
                    {formatDate(
                      caseHandler.dateOfBirth ? caseHandler.dateOfBirth : "N/A"
                    )}
                  </span>
                </p>
              </div>
              <div className=" col-md-6">
                <label className="fs-5 text-gray-600">Phone:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {caseHandler.phoneCountryCode || "+62"}{" "}
                  {caseHandler.phoneNumber || "N/A"}
                </p>
              </div>
              <div className=" col-md-6">
                <label className="fs-5 text-gray-600">Gender:</label>
                <p>{caseHandler.gender || "N/A"}</p>
              </div>
              <div className=" col-md-6">
                <label className="fs-5 text-gray-600">Status:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  <span
                    className={`badges ${
                      caseHandler.status
                        ? "bg-light-success"
                        : "bg-light-danger"
                    }`}
                  >
                    {caseHandler.status ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              <div className=" col-md-6">
                <label className="fs-5 text-gray-600">Blood Group:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {caseHandler.bloodGroup || "N/A"}
                </p>
              </div>
              <div className=" col-md-6">
                <label className="fs-5 text-gray-600">Qualification:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {caseHandler.qualification || "N/A"}
                </p>
              </div>
            </div>
          </div>
          <div className="card p-4 border-0">
            <div className="row">
              <div className=" col-md-6">
                <label className="fs-5 text-gray-600">Address 1:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {caseHandler.address1 || "N/A"}
                </p>
              </div>
              <div className=" col-md-6">
                <label className="fs-5 text-gray-600">Address 2:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {caseHandler.address2 || "N/A"}
                </p>
              </div>
              <div className=" col-md-6">
                <label className="fs-5 text-gray-600">City:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {caseHandler.city || "N/A"}
                </p>
              </div>
              <div className=" col-md-6">
                <label className="fs-5 text-gray-600">Zipcode:</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {caseHandler.zipcode || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCaseHandler;
