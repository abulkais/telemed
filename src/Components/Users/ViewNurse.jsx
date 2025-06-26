import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import moment from "moment";
const ViewNurse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [nurse, setNurse] = useState(null);

  const fetchNurse = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/nurses/${id}`);
      setNurse(res.data);
    } catch (error) {
      console.error("Error fetching nurse:", error);
      toast.error("Failed to load nurse");
    }
  };

  useEffect(() => {
    fetchNurse();
  }, [id]);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      // hour: "2-digit",
      // minute: "2-digit",
    });
  };

  const getTimeAgo = (date) => {
    return moment(date).fromNow();
  };

  if (!nurse) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">Nurse Details</h1>
            <div>
              <button
                className="btn btn-primary mr-2 px-4"
                onClick={() => navigate(`/nurses/${id}/edit`)}
              >
                Edit
              </button>
              <button
                className="btn btn-secondary px-4"
                onClick={() => navigate("/nurses")}
              >
                Back
              </button>
            </div>
          </div>

          <div className="card p-4 border-0 mb-4">
            <div className="d-flex align-items-center">
              <div className="profile-picture-container ">
                {nurse.profileImage ? (
                  <img
                    src={nurse.profileImage}
                    alt={`${nurse.firstName} ${nurse.lastName}`}
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
                    {nurse.firstName?.charAt(0)?.toUpperCase() || ""}
                    {nurse.lastName?.charAt(0)?.toUpperCase() || ""}
                  </div>
                )}
              </div>
              <div className="ml-3">
                <div className="d-flex align-center">
                  <h5 className="mb-0">
                    {nurse.firstName} {nurse.lastName}
                  </h5>{" "}
                  <p
                    className={`badges mb-1 ml-2 ${
                      nurse.status === "Active" ? "bg-light-success" : "bg-light-danger"
                    }`}
                  >
                    {nurse.status}
                  </p>
                </div>

                <p className="text-muted mb-0">{nurse.email}</p>
              </div>
            </div>
          </div>
          <div className="card p-4 border-0">
            <div className="row">
              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Phone</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {`${nurse.phoneCountryCode} ${nurse.phoneNumber}`}
                </p>
              </div>
              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Blood Group</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {nurse.bloodGroups || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Designation</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {nurse.designation || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Qualification</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {nurse.qualification || "N/A"}
                </p>
              </div>

              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Date Of Birth</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {formatDateTime(nurse.dateOfBirth || "N/A")}
                </p>
              </div>
              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Gender</label>
                <p className="fs-5 text-gray-800 showSpan">{nurse.gender}</p>
              </div>

              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Address 1</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {nurse.address1 || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Address 2</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {nurse.address2 || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label class="fs-5 text-gray-600">City</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {nurse.city || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Zipcode</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {nurse.zipcode || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Created on</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {getTimeAgo(nurse.created_at)}
                </p>
              </div>

              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Updated on</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {getTimeAgo(nurse.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewNurse;
