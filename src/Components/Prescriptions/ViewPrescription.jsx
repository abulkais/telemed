import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import moment from "moment";

const ViewPrescription = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const baseUrl = "http://localhost:8080";
  const [medicinesList, setMedicinesList] = useState([]); // New state for medicines
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [prescriptionRes, medicinesRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/prescriptions/${id}`),
          axios.get("http://localhost:8080/api/medicines"), // Fetch medicines list
        ]);
        // console.log("API Response (Prescription):", prescriptionRes.data);
        if (prescriptionRes.data) {
          setPrescription(prescriptionRes.data);
        } else {
          setPrescription(null);
          toast.error("No prescription data found");
        }
        // console.log("API Response (Medicines):", medicinesRes.data);
        setMedicinesList(medicinesRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error || !prescription) return <div>{error || "No data available"}</div>;

  const formatDateTime = (dateTime) => {
    if (dateTime) {
      return moment(dateTime).format("DD MMM, YYYY");
    }
    return "N/A";
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
            <h1 className="h4">Prescription Details</h1>
            <div>
              <button
                className="btn btn-primary mr-2 px-4"
                onClick={() => navigate(`/prescriptions/${id}/edit`)}
              >
                Edit
              </button>
              <button
                className="btn btn-secondary px-4"
                onClick={() => navigate("/prescriptions")}
              >
                Back
              </button>
            </div>
          </div>

          <div className="card p-4 border-0 mb-4">
            <div className="d-flex align-items-center">
              <div className="profile-picture-container">
                {prescription.profileImage ? (
                  <img
                    src={`${baseUrl}${prescription.profileImage}`}
                    alt={`${prescription.patientFirstName} ${prescription.patientLastName}`}
                    className="profile-picture" />
                ) : (
                  <div
                    className="empty-profile text-white d-flex align-items-center justify-content-center" >
                    {prescription.patientFirstName?.charAt(0)?.toUpperCase() ||
                      ""}
                    {prescription.patientLastName?.charAt(0)?.toUpperCase() ||
                      ""}
                  </div>
                )}
              </div>
              <div className="ml-3">
                <div className="d-flex align-center">
                  <h5 className="mb-0">
                    {prescription.patientFirstName}{" "}
                    {prescription.patientLastName}
                  </h5>{" "}
                  <p
                    className={`badges mb-1 ml-2 ${prescription.status === "1"
                      ? "bg-light-success"
                      : "bg-light-danger"
                      }`}
                  >
                    {prescription.status === "1" ? "Active" : "Inactive"}
                  </p>
                </div>
                <p className="text-muted mb-0">{prescription.patientEmail}</p>
              </div>
            </div>
          </div>

          <div className="card p-4 border-0">
            <div className="row">
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Health Insurance</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {prescription.healthInsurance || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Low Income</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {prescription.lowIncome || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Reference</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {prescription.reference || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">High Blood Pressure</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {prescription.highBloodPressure || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Food Allergies</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {prescription.foodAllergies || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Tendency Bleed</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {prescription.tendencyBleed || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Heart Disease</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {prescription.heartDisease || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Diabetic</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {prescription.diabetic || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Added At</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {formatDateTime(prescription.addedT) || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Female Pregnancy</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {prescription.femalePregnancy || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Breast Feeding</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {prescription.breastFeeding || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Current Medication</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {prescription.currentMedication || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Surgery</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {prescription.surgery || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Accident</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {prescription.accident || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Others</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {prescription.others || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Pulse Rate</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {prescription.pulseRate || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Temperature</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {prescription.temperature || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Description</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {prescription.description || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Test</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {prescription.test || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Advice</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {prescription.advice || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Next Visit </label>
                <p className="fs-5 text-gray-800 showSpan">
                  {prescription.nextVisitNumber} {prescription.nextVisitDay || "N/A"}
                </p>
              </div>

              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Created on</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {getTimeAgo(prescription.created_at)}
                </p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Updated on</label>
                <p className="fs-5 text-gray-800 showSpan">
                  {getTimeAgo(prescription.updated_at)}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-4 border-0 mt-4">
            <h5 className="mb-3">Medicines</h5>
            {prescription.medicines && prescription.medicines.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Medicine Name</th>
                      <th>Dosage</th>
                      <th>Dose Duration</th>
                      <th>Time</th>
                      <th>Dose Interval</th>
                      <th>Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescription.medicines.map((med, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          {medicinesList.find((m) => m.id === parseInt(med.medicineId))
                            ?.name || "N/A"}
                        </td>
                        <td>{med.dosage || "N/A"}</td>
                        <td>{med.doseDuration || "N/A"}</td>
                        <td>{med.time || "N/A"}</td>
                        <td>{med.doseInterval || "N/A"}</td>
                        <td>{med.comment || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted">No medicines prescribed.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPrescription;
