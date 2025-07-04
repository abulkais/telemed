import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ViewAdmin = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [admin, setAdmin] = useState(null);

  const fetchAdmin = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/admins/${id}`);
      setAdmin(res.data);
    } catch (error) {
      console.error("Error fetching admin:", error);
      toast.error("Failed to load admin");
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, [id]);

  if (!admin) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">Admin Details</h1>
            <button className="btn btn-primary px-4" onClick={() => navigate("/admin")}>
              Back
            </button>
          </div>

          <div className="card p-4 border-0">
            <div className="row">
              <div className="col-md-4 mb-3">
                <strong>Profile:</strong>
                {admin.profileImage ? (
                  <img
                    src={admin.profileImage}
                    alt={admin.firstName}
                    className="rounded-circle mt-2"
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="rounded-circle text-white d-flex align-items-center justify-content-center mt-2"
                    style={{
                      width: "100px",
                      height: "100px",
                      backgroundColor: "#1976d2",
                      fontSize: "40px",
                    }}
                  >
                    {admin.firstName?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                )}
              </div>
              <div className="col-md-4 mb-3">
                <strong>First Name:</strong> {admin.firstName}
              </div>
              <div className="col-md-4 mb-3">
                <strong>Last Name:</strong> {admin.lastName}
              </div>
              <div className="col-md-4 mb-3">
                <strong>Email:</strong> {admin.email}
              </div>
              <div className="col-md-4 mb-3">
                <strong>Phone:</strong> {admin.phone}
              </div>
              <div className="col-md-4 mb-3">
                <strong>Date of Birth:</strong> {admin.dateOfBirth}
              </div>
              <div className="col-md-4 mb-3">
                <strong>Gender:</strong> {admin.gender}
              </div>
              <div className="col-md-4 mb-3">
                <strong>Status:</strong>{" "}
                <span
                  className={`badge ${
                    admin.status === "Active" ? "badge-success" : "badge-danger"
                  }`}
                >
                  {admin.status}
                </span>
              </div>
              <div className="col-md-4 mb-3">
                <strong>Created At:</strong> {new Date(admin.created_at).toLocaleString()}
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button
                className="btn btn-primary mr-2 px-4"
                onClick={() => navigate(`/admins/edit/${admin.id}`)}
              >
                Edit
              </button>
              <button
                className="btn btn-secondary px-4"
                onClick={() => navigate("/admins")}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAdmin;