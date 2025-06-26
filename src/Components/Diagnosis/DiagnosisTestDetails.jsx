
import React,{useState} from "react";
import { useLocation, useNavigate,Link } from "react-router-dom";
import moment from "moment";
const DiagnosisTestDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { diagnosisTest } = location.state || {};
  const [filter, setFilter] = useState("DiagnosisTests");

  if (!diagnosisTest) {
    return <div>No diagnosis test data available.</div>;
  }

  // Format dates for "Created On" and "Last Updated"
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const createdAt = formatDateTime(diagnosisTest.created_at);
  const updatedAt = formatDateTime(diagnosisTest.updated_at);

  const getTimeAgo = (date) => {
    return moment(date).fromNow();
  };
  return (
    <>
     <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link
            to="/diagnosis-categories"
            className={`doctor-nav-btn ${
              filter === "DiagnosisCategory" ? "active" : ""
            }`}
            onClick={() => setFilter("DiagnosisCategory")}
          >
            <span className="btn-text">Diagnosis Category</span>
          </Link>
          <Link
            to="/diagnosis-tests"
            className={`doctor-nav-btn ${
              filter === "DiagnosisTests" ? "active" : ""
            }`}
            onClick={() => setFilter("DiagnosisTests")}
          >
            <span className="btn-text">Diagnosis Tests</span>
          </Link>
        </div>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-4">
      <h1 className="h4">Patient Diagnosis Test Details</h1>
        <div>
          <button
           className="btn btn-success px-3 mr-2"
            onClick={() => {
              sessionStorage.setItem('diagnosisTest', JSON.stringify(diagnosisTest));
              window.open(`/diagnosis-tests/${diagnosisTest.id}/pdf`, "_blank");
            }}
          >
            Print Diagnosis Test
          </button>
          <button
            className="btn btn-primary mr-2 px-4"
            onClick={() => navigate(`/diagnosis-tests/${diagnosisTest.id}/edit`)}
          >
            Edit
          </button>
          <button
            className="btn btn-outline-primary px-4"
            onClick={() => navigate("/diagnosis-tests")}
          >
            Back
          </button>
        </div>
      </div>

      <div className="card p-4">
        <div className="row">
          <div className="col-md-4">
          <label class="fs-5 text-gray-600">Patient</label>
             <p className="fs-5 text-gray-800 showSpan">{`${diagnosisTest.patientFirstName} ${diagnosisTest.patientLastName}`}</p>
             <label class="fs-5 text-gray-600">Doctor</label>
             <p className="fs-5 text-gray-800 showSpan">{`${diagnosisTest.doctorFirstName} ${diagnosisTest.doctorLastName}`}</p>
             <label class="fs-5 text-gray-600">Diagnosis Category</label>
             <p className="fs-5 text-gray-800 showSpan">{diagnosisTest.diagnosisCategoryName}</p>
          </div>
          <div className="col-md-4">
             <label class="fs-5 text-gray-600">Report number</label>
             <p className="fs-5 text-gray-800 showSpan">{diagnosisTest.reportNumber}</p>
             <label class="fs-5 text-gray-600">Age</label>
             <p className="fs-5 text-gray-800 showSpan">{diagnosisTest.age || "N/A"}</p>
             <label class="fs-5 text-gray-600">Height</label>
             <p className="fs-5 text-gray-800 showSpan">{diagnosisTest.height || "N/A"}</p>
          </div>
          <div className="col-md-4">
             <label class="fs-5 text-gray-600">Weight</label>
             <p className="fs-5 text-gray-800 showSpan">{diagnosisTest.weight || "N/A"}</p>
             <label class="fs-5 text-gray-600">Average glucose</label>
             <p className="fs-5 text-gray-800 showSpan">{diagnosisTest.averageGlucose || "N/A"}</p>
             <label class="fs-5 text-gray-600">Fasting Blood Sugar</label>
             <p className="fs-5 text-gray-800 showSpan">{diagnosisTest.fastingBloodSugar || "N/A"}</p>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-md-4">
             <label class="fs-5 text-gray-600">Urine Sugar</label>
             <p className="fs-5 text-gray-800 showSpan">{diagnosisTest.urineSugar || "N/A"}</p>
             <label class="fs-5 text-gray-600">Blood Pressure</label>
             <p className="fs-5 text-gray-800 showSpan">{diagnosisTest.bloodPressure || "N/A"}</p>
             <label class="fs-5 text-gray-600">Diabetes</label>
             <p className="fs-5 text-gray-800 showSpan">{diagnosisTest.diabetes || "N/A"}</p>
          </div>
          <div className="col-md-4">
             <label class="fs-5 text-gray-600">Cholesterol</label>
             <p className="fs-5 text-gray-800 showSpan">{diagnosisTest.cholesterol || "N/A"}</p>
             <label class="fs-5 text-gray-600">Created On</label>
             <p className="fs-5 text-gray-800 showSpan">{getTimeAgo(createdAt)}</p>
          </div>
          <div className="col-md-4">
             <label class="fs-5 text-gray-600">Last Updated</label>
             <p className="fs-5 text-gray-800 showSpan">{getTimeAgo(updatedAt)}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DiagnosisTestDetails;