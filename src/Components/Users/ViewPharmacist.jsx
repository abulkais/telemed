import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import moment from "moment";

const ViewPharmacist = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pharmacist, setPharmacist] = useState(null);

  const fetchPharmacist = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/pharmacists/${id}`);
      setPharmacist(res.data);
    } catch (error) {
      console.error("Error fetching pharmacist:", error);
      toast.error("Failed to load pharmacist");
    }
  };

  useEffect(() => {
    fetchPharmacist();
  }, [id]);

  if (!pharmacist) {
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
          <h1 className="h4">Pharmacists Details</h1>
          <div>
            <button
              className="btn btn-primary mr-2 px-4"
              onClick={() => navigate(`/pharmacists/${id}/edit`)}
            >
              Edit
            </button>
            <button
              className="btn btn-secondary px-4"
              onClick={() => navigate("/pharmacists")}
            >
              Back
            </button>
          </div>
        </div>

        <div className="card p-4 border-0 mb-4">
          <div className="d-flex align-items-center">
            <div className="profile-picture-container ">
              {pharmacist.profileImage ? (
                <img
                  src={pharmacist.profileImage}
                  alt={`${pharmacist.firstName} ${pharmacist.lastName}`}
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
                  {pharmacist.firstName?.charAt(0)?.toUpperCase() || ""}
                  {pharmacist.lastName?.charAt(0)?.toUpperCase() || ""}
                </div>
              )}
            </div>
            <div className="ml-3">
              <div className="d-flex align-center">
                <h5 className="mb-0">
                  {pharmacist.firstName} {pharmacist.lastName}
                </h5>{" "}
                <p
                  className={`badges mb-1 ml-2 ${
                    pharmacist.status === "Active"
                      ? "bg-light-success"
                      : "bg-light-danger"
                  }`}
                >
                  {pharmacist.status}
                </p>
              </div>

              <p className="text-muted mb-0">{pharmacist.email}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 border-0">
          <div className="row">
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Phone</label>
              <p className="fs-5 text-gray-800 showSpan">
                {`${pharmacist.phoneCountryCode} ${pharmacist.phoneNumber}`}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Blood Group</label>
              <p className="fs-5 text-gray-800 showSpan">
                {pharmacist.bloodGroups || "N/A"}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Designation</label>
              <p className="fs-5 text-gray-800 showSpan">
                {pharmacist.designation || "N/A"}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Qualification</label>
              <p className="fs-5 text-gray-800 showSpan">
                {pharmacist.qualification || "N/A"}
              </p>
            </div>

            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Date Of Birth</label>
              <p className="fs-5 text-gray-800 showSpan">
                {formatDateTime(pharmacist.dateOfBirth || "N/A")}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Gender</label>
              <p className="fs-5 text-gray-800 showSpan">
                {pharmacist.gender}
              </p>
            </div>

            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Address 1</label>
              <p className="fs-5 text-gray-800 showSpan">
                {pharmacist.address1 || "N/A"}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Address 2</label>
              <p className="fs-5 text-gray-800 showSpan">
                {pharmacist.address2 || "N/A"}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">City</label>
              <p className="fs-5 text-gray-800 showSpan">
                {pharmacist.city || "N/A"}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Zipcode</label>
              <p className="fs-5 text-gray-800 showSpan">
                {pharmacist.zipcode || "N/A"}
              </p>
            </div>
            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Created on</label>
              <p className="fs-5 text-gray-800 showSpan">
                {getTimeAgo(pharmacist.created_at)}
              </p>
            </div>

            <div className="col-md-4">
              <label class="fs-5 text-gray-600">Updated on</label>
              <p className="fs-5 text-gray-800 showSpan">
                {getTimeAgo(pharmacist.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default ViewPharmacist;