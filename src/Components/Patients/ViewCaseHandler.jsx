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

          <div className="card p-4 border-0">
            <div className="d-flex align-items-center">
              <div className="profile-picture-container ">
                {caseHandler.profileImage ? (
                  <img
                    src={caseHandler.profileImage}
                    alt={`${caseHandler.firstName} ${caseHandler.lastName}`}
                    className="profile-picture"
                  />
                ) : (
                  <div className="empty-profile">
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

            {/* <div className="col-md-8">
                <div className="row">
                  <div className="form-group col-md-6">
                    <label>
                      <strong>First Name:</strong>
                    </label>
                    <p>{caseHandler.firstName || "N/A"}</p>
                  </div>
                  <div className="form-group col-md-6">
                    <label>
                      <strong>Last Name:</strong>
                    </label>
                    <p>{caseHandler.lastName || "N/A"}</p>
                  </div>
                  <div className="form-group col-md-6">
                    <label>
                      <strong>Email:</strong>
                    </label>
                    <p>{caseHandler.email || "N/A"}</p>
                  </div>
                  <div className="form-group col-md-6 divide">
                    <label>
                      <strong>Designation:</strong>
                    </label>
                    <p>{caseHandler.designation || "N/A"}</p>
                  </div>
                  <div className="form-group col-md-6">
                    <label>
                      <strong>Date of Birth:</strong>
                    </label>
                    <p>
                      {caseHandler.dateOfBirth
                        ? new Date(caseHandler.dateOfBirth).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="form-group col-md-6">
                    <label>
                      <strong>Phone:</strong>
                    </label>
                    <p>
                      {caseHandler.phoneCountryCode || "+62"}{" "}
                      {caseHandler.phoneNumber || "N/A"}
                    </p>
                  </div>
                  <div className="form-group col-md-6">
                    <label>
                      <strong>Gender:</strong>
                    </label>
                    <p>{caseHandler.gender || "N/A"}</p>
                  </div>
                  <div className="form-group col-md-6">
                    <label>
                      <strong>Status:</strong>
                    </label>
                    <p>
                      <span
                        className={`badge ${
                          caseHandler.status
                            ? "bg-light-success"
                            : "bg-light-danger"
                        }`}
                      >
                        {caseHandler.status ? "Active" : "Inactive"}
                      </span>
                    </p>
                  </div>
                  <div className="form-group col-md-6">
                    <label>
                      <strong>Blood Group:</strong>
                    </label>
                    <p>{caseHandler.bloodGroup || "N/A"}</p>
                  </div>
                  <div className="form-group col-md-6">
                    <label>
                      <strong>Qualification:</strong>
                    </label>
                    <p>{caseHandler.qualification || "N/A"}</p>
                  </div>
                </div>
              </div> */}

         
            {/* <div className="row">
              <div className="form-group col-md-6">
                <label>
                  <strong>Address 1:</strong>
                </label>
                <p>{caseHandler.address1 || "N/A"}</p>
              </div>
              <div className="form-group col-md-6">
                <label>
                  <strong>Address 2:</strong>
                </label>
                <p>{caseHandler.address2 || "N/A"}</p>
              </div>
              <div className="form-group col-md-6">
                <label>
                  <strong>City:</strong>
                </label>
                <p>{caseHandler.city || "N/A"}</p>
              </div>
              <div className="form-group col-md-6">
                <label>
                  <strong>Zipcode:</strong>
                </label>
                <p>{caseHandler.zipcode || "N/A"}</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCaseHandler;
