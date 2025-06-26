import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import moment from "moment";

const PayrollView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [payroll, setPayroll] = useState(null);

  const fetchPayroll = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/empPayrolls/${id}`
      );
      setPayroll(res.data);
    } catch (error) {
      console.error("Error fetching payroll:", error);
      toast.error("Failed to load payroll");
    }
  };
  const baseUrl = "http://localhost:8080";

  useEffect(() => {
    fetchPayroll();
  }, [id]);

  if (!payroll) {
    return <div>Loading...</div>;
  }

  const getTimeAgo = (date) => {
    return moment(date).fromNow();
  };

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <div className="d-flex align-items-center">
              <h1 className="h4">Payroll Details</h1>
            </div>
            <div>
              <button
                className="btn btn-primary mr-2 px-4"
                onClick={() => navigate(`/employee-payrolls/edit/${id}`)}
              >
                Edit
              </button>
              <button
                className="btn btn-secondary px-4"
                onClick={() => navigate("/employee-payrolls")}
              >
                Back
              </button>
            </div>
          </div>

          <div className="card p-4 border-0 mb-4">
            <div className="d-flex align-items-center">
              <div className="profile-picture-container">
                {payroll.profile_image ? (
                  <img
                    src={`${baseUrl}${payroll.profile_image}`}
                    alt={`${payroll.employee_name}`}
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
                      fontSize: "30px",
                    }}
                  >
                    {payroll.employee_name
                      ?.split(" ")
                      .map((name) => name.charAt(0).toUpperCase())
                      .join("") || "P"}
                  </div>
                )}
              </div>
              <div className="ml-3">
                <div className="d-flex align-center">
                  <h5 className="mb-0">{payroll.employee_name}</h5>
                  <span
                    className={`badges ml-2 ${
                      payroll.status === "Paid"
                        ? "bg-light-success"
                        : "bg-light-danger"
                    }`}
                  >
                    {payroll.status}
                  </span>
                </div>
                <p className="text-muted mb-0 text-capitalize">
                  {payroll.role}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-4 border-0">
            <div className="row">
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Payroll Id</label>
                <p className="fs-5 text-gray-800 showSpan">
                  <span className="badges bg-light-success">
                    {payroll.payroll_id}
                  </span>
                </p>
              </div>

              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Month</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {payroll.month || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Year</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {payroll.year || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Basic Salary</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {payroll.basic_salary || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Allowance</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {payroll.allowance || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Deductions</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {payroll.deductions || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Net Salary</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {payroll.net_salary || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Created on</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {getTimeAgo(payroll.created_at)}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Updated on</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {getTimeAgo(payroll.updated_at)}
                </p>
              </div>

              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Notes</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {payroll.description ? payroll.description : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollView;
