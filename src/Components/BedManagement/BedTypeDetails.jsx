import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import Pagination from "../Pagination";
import Preloader from "../preloader";

const BedTypeDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [bedType, setBedType] = useState(null);
  const [beds, setBeds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [bedTypeRes, bedsRes, assignmentsRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/bedTypes/${id}`),
          axios.get("http://localhost:8080/api/beds"),
          axios.get("http://localhost:8080/api/bedAssignments?status=active"),
        ]);
        setBedType(bedTypeRes.data);

        const allBeds = bedsRes.data || [];
        const assignments = assignmentsRes.data || [];

        // Filter beds by bedType.id and determine availability
        const filteredBeds = allBeds
          .filter((bed) => bed.bed_type_id === parseInt(id))
          .map((bed) => {
            const isAssigned = assignments.some(
              (assignment) =>
                assignment.bedId === bed.id &&
                (!assignment.dischargeDate ||
                  moment(assignment.dischargeDate).isAfter(moment()))
            );
            return { ...bed, available: !isAssigned };
          });

        // if (filteredBeds.length === 0 && bedTypeRes.data) {
        //   setError("No beds found for this bed type.");
        // } else {
          setBeds(filteredBeds);
        // }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data or data not found in database.");
        toast.error("Failed to load data or data not found in database.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <Preloader message="Loading..." />; // Show preloader with message during loading
  if (error || !bedType) return <div className="text-center">{error || "No data available"}</div>;

  const formatDateTime = (dateTime) => {
    return moment(dateTime).format("DD MMM, YYYY");
  };

  const getTimeAgo = (date) => {
    return moment(date).fromNow();
  };

  // Filter beds based on search query
  const filteredBeds = beds.filter(
    (bed) =>
      bed.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bed.name?.toLowerCase().includes(searchQuery)
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBeds.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBeds.length / itemsPerPage);

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">Bed Type Details</h1>
            <div>
              <button
                className="btn btn-primary mr-2 px-4"
                onClick={() => navigate(`/bed-types/${id}/edit`)}
              >
                Edit
              </button>
              <button
                className="btn btn-secondary px-4"
                onClick={() => navigate("/bed-types")}
              >
                Back
              </button>
            </div>
          </div>

          <div className="card p-4 border-0 mb-4">
            <div className="row">
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Bed Type:</label>
                <p className="fs-5 text-gray-800 showSpan">{bedType.name || "N/A"}</p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Description:</label>
                <p className="fs-5 text-gray-800 showSpan">{bedType.description || "N/A"}</p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Created On:</label>
                <p className="fs-5 text-gray-800 showSpan">{getTimeAgo(bedType.created_at)}</p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Last Updated:</label>
                <p className="fs-5 text-gray-800 showSpan">{getTimeAgo(bedType.updated_at)}</p>
              </div>
              <div className="col-md-4">
                <label className="fs-5 text-gray-600">Total Beds:</label>
                <p className="fs-5 text-gray-800 showSpan">{beds.length}</p>
              </div>
            </div>
          </div>

          <div className="card p-4 border-0 mt-4">
            <h5 className="mb-3">Beds</h5>
            <div className="filter-search-box mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Bed</th>
                    <th>Description</th>
                    <th>Charge</th>
                    <th>Available</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((bed, index) => (
                      <tr key={bed.id}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>{bed.name}</td>
                        <td>{bed.description || "N/A"}</td>
                        <td>${bed.charge || "N/A"}</td>
                        <td>
                          <span
                            className={`badge ${bed.available ? "bg-light-success" : "bg-light-danger"}`}
                          >
                            {bed.available ? "Yes" : "No"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        {loading ? <Preloader message="Loading..." /> : "No data available in table"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
      />
    </div>
  );
};

export default BedTypeDetails;