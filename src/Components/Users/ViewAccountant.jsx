import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import moment from "moment";
const ViewAccountant = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [accountant, setAccountant] = useState(null);

  const fetchAccountant = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/accountants/${id}`);
      setAccountant(res.data);
    } catch (error) {
      console.error("Error fetching accountant:", error);
      toast.error("Failed to load accountant");
    }
  };

  useEffect(() => {
    fetchAccountant();
  }, [id]);

  if (!accountant) {
    return <div>Loading...</div>;
  }
  const formatDateTime = (dateTime) => {
    if (dateTime) {
      return moment(dateTime).format("DD MMM, YYYY");
    }
  };
  const getTimeAgo = (date) => {
    return moment(date).fromNow();
  };
  return (
    <div className="row">
      <div className="col-lg-12">
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <h1 className="h4">Accountant Details</h1>
          <div>
            <button
              className="btn btn-primary mr-2 px-4"
              onClick={() => navigate(`/accountants/${id}/edit`)}
            >
              Edit
            </button>
            <button
              className="btn btn-secondary px-4"
              onClick={() => navigate("/accountants")}
            >
              Back
            </button>
          </div>
        </div>

        <div className="card p-4 border-0 mb-4">
          <div className="d-flex align-items-center">
            <div className="profile-picture-container ">
              {accountant.profileImage ? (
                <img
                  src={accountant.profileImage}
                  alt={`${accountant.firstName} ${accountant.lastName}`}
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
                  {accountant.firstName?.charAt(0)?.toUpperCase() || ""}
                  {accountant.lastName?.charAt(0)?.toUpperCase() || ""}
                </div>
              )}
            </div>
            <div className="ml-3">
              <div className="d-flex align-center">
                <h5 className="mb-0">
                  {accountant.firstName} {accountant.lastName}
                </h5>{" "}
                <p
                  className={`badges mb-1 ml-2 ${
                    accountant.status === "Active"
                      ? "bg-light-success"
                      : "bg-light-danger"
                  }`}
                >
                  {accountant.status}
                </p>
              </div>

              <p className="text-muted mb-0">{accountant.email}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 border-0">
          <div className="row">
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Phone</label>
              <p className="fs-5 text-gray-800 showSpan">
                {`${accountant.phoneCountryCode} ${accountant.phoneNumber}`}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Blood Group</label>
              <p className="fs-5 text-gray-800 showSpan">
                {accountant.bloodGroups || "N/A"}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Designation</label>
              <p className="fs-5 text-gray-800 showSpan">
                {accountant.designation || "N/A"}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Qualification</label>
              <p className="fs-5 text-gray-800 showSpan">
                {accountant.qualification || "N/A"}
              </p>
            </div>

            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Date Of Birth</label>
              <p className="fs-5 text-gray-800 showSpan">
                {formatDateTime(accountant.dateOfBirth || "N/A")}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Gender</label>
              <p className="fs-5 text-gray-800 showSpan">{accountant.gender}</p>
            </div>

            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Address 1</label>
              <p className="fs-5 text-gray-800 showSpan">
                {accountant.address1 || "N/A"}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Address 2</label>
              <p className="fs-5 text-gray-800 showSpan">
                {accountant.address2 || "N/A"}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">City</label>
              <p className="fs-5 text-gray-800 showSpan">
                {accountant.city || "N/A"}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Zipcode</label>
              <p className="fs-5 text-gray-800 showSpan">
                {accountant.zipcode || "N/A"}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Created on</label>
              <p className="fs-5 text-gray-800 showSpan">
                {getTimeAgo(accountant.created_at)}
              </p>
            </div>

            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Updated on</label>
              <p className="fs-5 text-gray-800 showSpan">
                {getTimeAgo(accountant.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );
};

export default ViewAccountant;