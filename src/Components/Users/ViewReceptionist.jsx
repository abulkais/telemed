import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import moment from "moment";

const ViewReceptionist = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [receptionist, setReceptionist] = useState(null);

  const fetchReceptionist = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/receptionists/${id}`
      );
      setReceptionist(res.data);
    } catch (error) {
      console.error("Error fetching receptionist:", error);
      toast.error("Failed to load receptionist");
    }
  };

  useEffect(() => {
    fetchReceptionist();
  }, [id]);

  if (!receptionist) {
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
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">Receptionists Details</h1>
            <div>
              <button
                className="btn btn-primary mr-2 px-4"
                onClick={() => navigate(`/receptionists/${id}/edit`)}
              >
                Edit
              </button>
              <button
                className="btn btn-secondary px-4"
                onClick={() => navigate("/receptionists")}
              >
                Back
              </button>
            </div>
          </div>

          <div className="card p-4 border-0 mb-4">
            <div className="d-flex align-items-center">
              <div className="profile-picture-container ">
                {receptionist.profileImage ? (
                  <img
                    src={receptionist.profileImage}
                    alt={`${receptionist.firstName} ${receptionist.lastName}`}
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
                    {receptionist.firstName?.charAt(0)?.toUpperCase() || ""}
                    {receptionist.lastName?.charAt(0)?.toUpperCase() || ""}
                  </div>
                )}
              </div>
              <div className="ml-3">
                <div className="d-flex align-center">
                  <h5 className="mb-0">
                    {receptionist.firstName} {receptionist.lastName}
                  </h5>{" "}
                  <p
                    className={`badges mb-1 ml-2 ${
                      receptionist.status === "Active"
                        ? "bg-light-success"
                        : "bg-light-danger"
                    }`}
                  >
                    {receptionist.status}
                  </p>
                </div>

                <p className="text-muted mb-0">{receptionist.email}</p>
              </div>
            </div>
          </div>
          <div className="card p-4 border-0">
            <div className="row">
              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Phone</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {`${receptionist.phoneCountryCode} ${receptionist.phoneNumber}`}
                </p>
              </div>
              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Blood Group</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {receptionist.bloodGroups || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Designation</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {receptionist.designation || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Qualification</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {receptionist.qualification || "N/A"}
                </p>
              </div>

              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Date Of Birth</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {formatDateTime(receptionist.dateOfBirth || "N/A")}
                </p>
              </div>
              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Gender</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {receptionist.gender}
                </p>
              </div>

              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Address 1</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {receptionist.address1 || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Address 2</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {receptionist.address2 || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label class="fs-5 text-gray-600">City</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {receptionist.city || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Zipcode</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {receptionist.zipcode || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Created on</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {getTimeAgo(receptionist.created_at)}
                </p>
              </div>

              <div className="col-md-4">
                <label class="fs-5 text-gray-600">Updated on</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {getTimeAgo(receptionist.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewReceptionist;
