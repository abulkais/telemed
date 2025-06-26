import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";

const ViewInsurances = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [insuranceData, setInsuranceData] = useState({
    insuranceName: "",
    serviceTax: "",
    insuranceNo: "",
    insuranceCode: "",
    hospitalRate: "",
    discount: 0,
    remark: "",
    status: true,
    diseases: [],
    createdDateTime: "",
  });

  useEffect(() => {
    const fetchInsurance = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/insurances/${id}`);
        const ins = res.data;
        setInsuranceData({
          insuranceName: ins.insuranceName,
          serviceTax: ins.serviceTax,
          insuranceNo: ins.insuranceNo,
          insuranceCode: ins.insuranceCode,
          hospitalRate: ins.hospitalRate,
          discount: ins.discount,
          remark: ins.remark,
          status: ins.status,
          diseases: ins.diseases.map((d) => ({
            diseaseName: d.diseaseName,
            diseaseCharge: d.diseaseCharge,
          })),
          createdDateTime: ins.createdDateTime,
        });
      } catch (error) {
        console.error("Error fetching insurance:", error);
        toast.error("Failed to load insurance");
      }
    };

    if (id) fetchInsurance();
  }, [id]);

  const formatDate = (dateString) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const dateObj = new Date(dateString);
    const day = dateObj.getDate();
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  return (
    <div className="container-fluid">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">Insurance Details</h1>
            <div>
              <button
                className="btn btn-primary mr-2 px-4"
                onClick={() => navigate(`/insurances/${id}/edit`)}
              >
                Edit
              </button>
              <button
                className="btn btn-outline-primary px-4"
                onClick={() => navigate("/insurances")}
              >
                Back
              </button>
            </div>
          </div>

          <div className="card p-4 border-0">
            <div className="form-row">
              <div className="form-group col-md-4">
                <label className="fs-5 text-gray-600">Insurance:</label>
                <p className="fs-5 text-gray-800">
                  {insuranceData.insuranceName}
                </p>
              </div>
              <div className="form-group col-md-4">
                <label className="fs-5 text-gray-600">Service Tax:</label>
                <p className="fs-5 text-gray-800">
                  ${parseFloat(insuranceData.serviceTax || 0).toFixed(2)}
                </p>
              </div>
              <div className="form-group col-md-4">
                <label className="fs-5 text-gray-600">Insurance No:</label>
                <p className="fs-5 text-gray-800">
                  {insuranceData.insuranceNo}
                </p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-md-4">
                <label className="fs-5 text-gray-600">Insurance Code:</label>
                <p className="fs-5 text-gray-800">
                  {insuranceData.insuranceCode}
                </p>
              </div>
              <div className="form-group col-md-4">
                <label className="fs-5 text-gray-600">Hospital Rate:</label>
                <p className="fs-5 text-gray-800">
                  ${parseFloat(insuranceData.hospitalRate || 0).toFixed(2)}
                </p>
              </div>
              <div className="form-group col-md-4">
                <label className="fs-5 text-gray-600">Discount:</label>
                <p className="fs-5 text-gray-800">{`${insuranceData.discount}%`}</p>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-md-4">
                <label className="fs-5 text-gray-600">Remark:</label>
                <p className="fs-5 text-gray-800">
                  {insuranceData.remark || "N/A"}
                </p>
              </div>
              <div className="form-group col-md-4">
                <label className="fs-5 text-gray-600">Status:</label>
                <p className="fs-5 text-gray-800">
                  {" "}
                  <span
                    className={`badge ${
                        insuranceData.status ? "bg-light-success" : "bg-light-danger"
                    }`}
                  >
                    {insuranceData.status ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              <div className="form-group col-md-4">
                <label className="fs-5 text-gray-600">Created On:</label>
                <p className="fs-5 text-gray-800">
                  {formatDate(insuranceData.createdDateTime)}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <h6>Disease Details</h6>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Diseases Name</th>
                    <th>Diseases Charge</th>
                  </tr>
                </thead>
                <tbody>
                  {insuranceData.diseases.map((disease, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{disease.diseaseName || "N/A"}</td>
                      <td>
                        ${parseFloat(disease.diseaseCharge || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="d-flex justify-content-end">
                <span>
                  Total Amount: $
                  {insuranceData.diseases
                    .reduce(
                      (sum, d) => sum + parseFloat(d.diseaseCharge || 0),
                      0
                    )
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewInsurances;
