import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import moment from "moment";
const ViewLabTechnician = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [technician, setTechnician] = useState(null);

  const fetchLabTechnician = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/lab-technicians/${id}`
      );
      setTechnician(res.data);
    } catch (error) {
      console.error("Error fetching lab technician:", error);
      toast.error("Failed to load lab technician");
    }
  };

  useEffect(() => {
    fetchLabTechnician();
  }, [id]);

  if (!technician) {
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
          <h1 className="h4">Technicians Details</h1>
          <div>
            <button
              className="btn btn-primary mr-2 px-4"
              onClick={() => navigate(`/lab-technicians/${id}/edit`)}
            >
              Edit
            </button>
            <button
              className="btn btn-secondary px-4"
              onClick={() => navigate("/lab-technicians")}
            >
              Back
            </button>
          </div>
        </div>

        <div className="card p-4 border-0 mb-4">
          <div className="d-flex align-items-center">
            <div className="profile-picture-container ">
              {technician.profileImage ? (
                <img
                  src={technician.profileImage}
                  alt={`${technician.firstName} ${technician.lastName}`}
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
                  {technician.firstName?.charAt(0)?.toUpperCase() || ""}
                  {technician.lastName?.charAt(0)?.toUpperCase() || ""}
                </div>
              )}
            </div>
            <div className="ml-3">
              <div className="d-flex align-center">
                <h5 className="mb-0">
                  {technician.firstName} {technician.lastName}
                </h5>{" "}
                <p
                  className={`badges mb-1 ml-2 ${
                    technician.status === "Active"
                      ? "bg-light-success"
                      : "bg-light-danger"
                  }`}
                >
                  {technician.status}
                </p>
              </div>

              <p className="text-muted mb-0">{technician.email}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 border-0">
          <div className="row">
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Phone</label>
              <p className="fs-5 text-gray-800 showSpan">
                {`${technician.phoneCountryCode} ${technician.phoneNumber}`}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Blood Group</label>
              <p className="fs-5 text-gray-800 showSpan">
                {technician.bloodGroups || "N/A"}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Designation</label>
              <p className="fs-5 text-gray-800 showSpan">
                {technician.designation || "N/A"}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Qualification</label>
              <p className="fs-5 text-gray-800 showSpan">
                {technician.qualification || "N/A"}
              </p>
            </div>

            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Date Of Birth</label>
              <p className="fs-5 text-gray-800 showSpan">
                {formatDateTime(technician.dateOfBirth || "N/A")}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Gender</label>
              <p className="fs-5 text-gray-800 showSpan">{technician.gender}</p>
            </div>

            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Address 1</label>
              <p className="fs-5 text-gray-800 showSpan">
                {technician.address1 || "N/A"}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Address 2</label>
              <p className="fs-5 text-gray-800 showSpan">
                {technician.address2 || "N/A"}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">City</label>
              <p className="fs-5 text-gray-800 showSpan">
                {technician.city || "N/A"}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Zipcode</label>
              <p className="fs-5 text-gray-800 showSpan">
                {technician.zipcode || "N/A"}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Created on</label>
              <p className="fs-5 text-gray-800 showSpan">
                {getTimeAgo(technician.created_at)}
              </p>
            </div>

            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Updated on</label>
              <p className="fs-5 text-gray-800 showSpan">
                {getTimeAgo(technician.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewLabTechnician;
