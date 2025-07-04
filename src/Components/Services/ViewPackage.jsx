import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";

const ViewPackage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [packageData, setPackageData] = useState({
    packageName: "",
    discount: "",
    description: "",
    services: [],
    createdDateTime: "",
  });

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/packages/${id}`);
        const pkg = res.data;
        setPackageData({
          packageName: pkg.packageName,
          discount: pkg.discount,
          description: pkg.description,
          services: pkg.services.map((s) => ({
            serviceId: s.serviceId,
            quantity: s.quantity || 1, // Default to 1 if undefined
            rate: s.rate || 0, // Default to 0 if undefined
            amount: (s.quantity || 1) * (s.rate || 0), // Calculate amount with defaults
          })),
          createdDateTime: pkg.createdDateTime,
        });
      } catch (error) {
        console.error("Error fetching package:", error);
        toast.error("Failed to load package");
      }
    };

    if (id) fetchPackage();
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
            <h1 className="h4">Package Details</h1>
            <div>
              <button
                className="btn btn-primary mr-2 px-4"
                onClick={() => navigate(`/packages/${id}/edit`)}
              >
                Edit
              </button>
              <button
                className="btn btn-outline-primary px-4"
                onClick={() => navigate("/packages")}
              >
                Back
              </button>
            </div>
          </div>

          <div className="card p-4 border-0 mb-5">
            <div className="form-row">
              <div className="form-group col-md-4">
                <label className="fs-5 text-gray-600">Package:</label>
                <p className="fs-5 text-gray-800">{packageData.packageName}</p>
              </div>
              <div className="form-group col-md-4">
                <label className="fs-5 text-gray-600">Discount:</label>
                <p className="fs-5 text-gray-800">{`${packageData.discount}%`}</p>
              </div>

              <div className="form-group col-md-4">
                <label className="fs-5 text-gray-600">Created On:</label>
                <p className="fs-5 text-gray-800">
                  {formatDate(packageData.createdDateTime)}
                </p>
              </div>
            </div>
            <div className="form-group">
              <label className="fs-5 text-gray-600">Description:</label>
              <p className="fs-5 text-gray-800">
                {packageData.description ? packageData.description : "N/A"}
              </p>
            </div>
          </div>
          <h3 className="h4 mb-3 mt-3">Services</h3>
          <div className="card p-4 border-0">
            <div className="mt-1">
             
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Service</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {packageData.services.map((service, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{service.serviceId || "N/A"}</td>{" "}
                      {/* Fallback if serviceId is undefined */}
                      <td>{service.quantity || 0}</td>
                      <td>${parseFloat(service.rate || 0).toFixed(2)}</td>
                      <td>${parseFloat(service.amount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPackage;
