import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Preloader from "../preloader";

const BedDetails = () => {
  const { id } = useParams(); // Bed ID
  const navigate = useNavigate();

  const [bed, setBed] = useState(null);
  const [bedType, setBedType] = useState(null);
  const [cases, setCases] = useState([]);
  const [patients, setPatients] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        // Get bed details
        const bedRes = await axios.get(`http://localhost:8080/api/beds/${id}`);
        setBed(bedRes.data);

        // Get bed type
        if (bedRes.data.bed_type_id) {
          const bedTypeRes = await axios.get(
            `http://localhost:8080/api/bedTypes/${bedRes.data.bed_type_id}`
          );
          setBedType(bedTypeRes.data);
        }

        // Get bed assignments for this bed
        const assignmentsRes = await axios.get(
          `http://localhost:8080/api/bedAssignments?bedId=${id}`
        );
        const assignments = assignmentsRes.data || [];

        // Get all patients for lookup
        const patientsRes = await axios.get(
          `http://localhost:8080/api/patients`
        );
        const allPatients = patientsRes.data || [];
        const patientMap = allPatients.reduce((acc, patient) => {
          acc[patient.id] = `${patient.firstName} ${patient.lastName || ""}`;
          return acc;
        }, {});

        // Get cases for assigned patient IDs
        const caseIds = assignments
          .map((a) => a.ipdPatientId)
          .filter((id) => id); // Filter out undefined/null
        const casesRes = await axios.get(
          `http://localhost:8080/api/patientscases?patientIds=${caseIds.join(
            ","
          )}`
        );
        const allCases = casesRes.data || [];

        const enrichedCases = allCases.map((caseItem) => ({
          ...caseItem,
          patientName: patientMap[caseItem.patientId] || "N/A",
          dischargeDate: caseItem.dischargeDate || "N/A",
        }));

        setCases(enrichedCases);
        setPatients(patientMap);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load bed details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const formatDate = (date) => moment(date).format("DD MMM, YYYY");
  const timeAgo = (date) => moment(date).fromNow();

  if (loading) return <Preloader message="Loading bed details..." />;
  if (!bed) return <div className="text-center">No Bed Data Found</div>;

  return (
    <div className="container-fluid">
      <ToastContainer />
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h4>Bed Details</h4>
        <button
          className="btn btn-secondary px-3"
          onClick={() => navigate("/beds")}
        >
          Back
        </button>
      </div>

      <div className="card p-4 mb-4">
        <div className="row">
          <div className="col-md-4">
            <label className="fs-5 text-gray-600">Bed:</label>
            <p>{bed.name || "N/A"}</p>
          </div>
          <div className="col-md-4">
            <label className="fs-5 text-gray-600">Bed Type:</label>
            <p>{bedType?.name || "N/A"}</p>
          </div>
          <div className="col-md-4">
            <label className="fs-5 text-gray-600">Bed ID:</label>
            <p>{bed.id}</p>
          </div>
          <div className="col-md-4">
            <label className="fs-5 text-gray-600">Charge:</label>
            <p>${bed.charge}</p>
          </div>
          <div className="col-md-4">
            <label className="fs-5 text-gray-600">Available:</label>
            <p>
              <span
                className={`badge ${
                  bed.available ? "bg-light-success" : "bg-light-danger"
                }`}
              >
                {bed.available ? "Yes" : "No"}
              </span>
            </p>
          </div>
          <div className="col-md-4">
            <label className="fs-5 text-gray-600">Created On:</label>
            <p>{timeAgo(bed.created_at)}</p>
          </div>
          <div className="col-md-4">
            <label className="fs-5 text-gray-600">Updated At:</label>
            <p>{timeAgo(bed.updated_at)}</p>
          </div>
          <div className="col-md-8">
            <label className="fs-5 text-gray-600">Description:</label>
            <p>{bed.description || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="card p-4 border-0">
        <h5>Associated Cases ({cases.length})</h5>
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Patient</th>
                <th>Assign Date</th>
                <th>Discharge Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {cases.length > 0 ? (
                cases.map((caseItem, index) => (
                  <tr key={caseItem.id}>
                    <td>{caseItem.caseid}</td>
                    <td>{caseItem.patientName}</td>
                    <td>{formatDate(caseItem.caseDate)}</td>
                    <td>{caseItem.dischargeDate}</td>
                    <td>
                      <span
                        className={`badge ${
                          caseItem.status === 1
                            ? "bg-light-success"
                            : "bg-light-danger"
                        }`}
                      >
                        {caseItem.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No associated cases
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BedDetails;
