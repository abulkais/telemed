import React, { useState, useEffect, useRef } from "react"; // Added useRef
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FilterListIcon from "@mui/icons-material/FilterList"; // Added Filter Icon
import removeIcon from "../../assets/images/remove.png";
import FilterAltIcon from '@mui/icons-material/FilterAlt';

const Insurances = () => {
  const [insurances, setInsurances] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showFilter, setShowFilter] = useState(false); // State to toggle filter dropdown
  const navigate = useNavigate();
  const { id } = useParams();
  const filterRef = useRef(null); // Ref to track filter dropdown

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch insurances
  const fetchInsurances = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/insurances");
      const sortedData = res.data.sort(
        (a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime)
      );
      setInsurances(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching insurances:", error);
      toast.error("Failed to load insurances");
    }
  };

  useEffect(() => {
    fetchInsurances();
    if (id) {
      setEditing(true);
      setEditId(id);
      axios
        .get(`http://localhost:8080/api/insurances/${id}`)
        .then((res) => {
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
          });
        })
        .catch((error) => {
          console.error("Error fetching insurance:", error);
          toast.error("Failed to load insurance");
        });
    }
  }, [id]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };

    if (showFilter) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilter]);

  const deleteInsurance = async () => {
    if (!deleteId) {
      toast.error("Invalid Insurance ID!");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/insurances/${deleteId}`);
      setInsurances((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Insurance deleted successfully!");
      $("#deleteInsurance").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting insurance!");
    }
  };

  const handleEdit = (ins) => {
    navigate(`/insurances/${ins.id}/edit`);
  };

  const handleView = (ins) => {
    navigate(`/insurances/${ins.id}/view`);
  };

  // Filter by search query and status
  const filterInsurances = (ins) => {
    const matchesSearch = searchQuery
      ? ins.insuranceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ins.insuranceNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ins.insuranceCode?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && ins.status) ||
      (statusFilter === "INACTIVE" && !ins.status);

    return matchesSearch && matchesStatus;
  };

  const filteredInsurances = insurances.filter(filterInsurances);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInsurances.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredInsurances.length / itemsPerPage);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setStatusFilter("ALL");
    setSearchQuery("");
    setCurrentPage(1);
    setShowFilter(false); // Close dropdown on reset
  };

  const toggleFilterDropdown = () => {
    setShowFilter(!showFilter);
  };

  return (
    <div>
      <ToastContainer />
      <>
        <div className="doctor-nav-buttons">
          <div className="nav_headings">
            <Link to="/insurances" className="doctor-nav-btn active">
              <span className="btn-text">Insurances</span>
            </Link>
            <Link to="/packages" className="doctor-nav-btn">
              <span className="btn-text">Packages</span>
            </Link>
            <Link to="/services" className="doctor-nav-btn">
              <span className="btn-text">Services</span>
            </Link>
            <Link to="/ambulances" className="doctor-nav-btn">
              <span className="btn-text">Ambulance</span>
            </Link>
            <Link to="/ambulance-calls" className="doctor-nav-btn">
              <span className="btn-text">AmbulanceCalls</span>
            </Link>
          </div>
        </div>
        <div
          className="filter-bar-container"
          
        >
          <div className="filter-search-box" style={{ flex: 1 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <div
              className="filter-options"
              style={{ position: "relative" }}
              ref={filterRef}
            >
              <button
                className="filter-btn filter-btn-icon mr-3"
                onClick={toggleFilterDropdown}
                style={{
                  backgroundColor: "#e3f2fd",
                  color: "#fff",
                  border: "none",
                }}
              >
              <FilterAltIcon />
              </button>
              {showFilter && (
                <div
                  className="dropdown-content"
                  style={{
                    position: "absolute",
                    backgroundColor: "#fff",
                    minWidth: "200px",
                    boxShadow: "0px 8px 16px 0px rgba(0,0,0,0.2)",
                    zIndex: 1,
                    right: 0,
                    borderRadius: "5px",
                    padding: "15px",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <div className="form-group">
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      Status:
                    </label>
                    <select
                      className="form-control"
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      style={{ padding: "5px", fontSize: "14px" }}
                    >
                      <option value="ALL">ALL</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                  <button
                    className="btn btn-secondary w-100 mt-2"
                    onClick={resetFilters}
                    style={{
                      backgroundColor: "#bdbdbd",
                      border: "none",
                      padding: "8px",
                      fontSize: "14px",
                    }}
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
            <button
              className="filter-btn filter-btn-primary"
              onClick={() => navigate("/insurances/create")}
            >
              New Insurance
            </button>
          </div>
        </div>

        <div className="custom-table-responsive">
          <table className="table custom-table-striped custom-table table-hover text-center">
            <thead className="thead-light">
              <tr>
                <th>S.N</th>
                <th>Insurance</th>
                <th>Service Tax</th>
                <th>Insurance No</th>
                <th>Insurance Code</th>
                <th>Hospital Rate</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={item.id}>
                  <td>{index+1}</td>
                  <td>{item.insuranceName}</td>
                  <td>${parseFloat(item.serviceTax || 0).toFixed(2)}</td>
                  <td>{item.insuranceNo}</td>
                  <td>{item.insuranceCode}</td>
                  <td>${parseFloat(item.hospitalRate || 0).toFixed(2)}</td>
                  <td>${parseFloat(item.total || 0).toFixed(2)}</td>
                  <td>
                    <span
                      className={`badge ${
                        item.status ? "bg-light-success" : "bg-light-danger"
                      }`}
                    >
                      {item.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                      <button className="btn" onClick={() => handleView(item)}>
                        <VisibilityIcon className="text-info" />
                      </button>
                      <button className="btn" onClick={() => handleEdit(item)}>
                        <i className="text-primary fa fa-edit fa-lg" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deleteInsurance"
                        onClick={() => setDeleteId(item.id)}
                      >
                        <DeleteIcon className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex justify-content-between align-items-center mt-5">
            <div>
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredInsurances.length)} of{" "}
              {filteredInsurances.length} results
            </div>
            <nav>
              <ul className="pagination">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ArrowBackIosIcon />
                  </button>
                </li>
                <li
                  className={`page-item ${currentPage === 1 ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(1)}
                    style={{
                      height: "42px",
                      borderRadius: "10px",
                      boxShadow: "none",
                      border: "none",
                    }}
                  >
                    1
                  </button>
                </li>
                {currentPage > 4 && (
                  <li className="page-item disabled">
                    <span
                      className="page-link"
                      style={{
                        height: "42px",
                        borderRadius: "10px",
                        boxShadow: "none",
                        border: "none",
                      }}
                    >
                      ...
                    </span>
                  </li>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (number) =>
                      number > 1 &&
                      number < totalPages &&
                      Math.abs(number - currentPage) <= 2
                  )
                  .map((number) => (
                    <li
                      key={number}
                      className={`page-item ${
                        currentPage === number ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(number)}
                        style={{
                          height: "42px",
                          borderRadius: "10px",
                          boxShadow: "none",
                          border: "none",
                        }}
                      >
                        {number}
                      </button>
                    </li>
                  ))}
                {currentPage < totalPages - 3 && (
                  <li className="page-item disabled">
                    <span
                      className="page-link"
                      style={{
                        height: "42px",
                        borderRadius: "10px",
                        boxShadow: "none",
                        border: "none",
                      }}
                    >
                      ...
                    </span>
                  </li>
                )}
                {totalPages > 1 && (
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(totalPages)}
                      style={{
                        height: "42px",
                        borderRadius: "10px",
                        boxShadow: "none",
                        border: "none",
                      }}
                    >
                      {totalPages}
                    </button>
                  </li>
                )}
                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <ArrowForwardIosIcon />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div
          className="modal fade"
          id="deleteInsurance"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="deleteInsurance"
          aria-hidden="true"
        >
          <div
            className="modal-dialog modal-sm modal-dialog-centered"
            role="document"
          >
            <div className="modal-content text-center">
              <span className="modal-icon">
                <img src={removeIcon} alt="" />
              </span>
              <h2>Delete</h2>
              <p>Are you sure want to delete this Insurance?</p>
              <div className="d-flex">
                <button
                  className="btn btn-danger w-100 mr-1"
                  onClick={deleteInsurance}
                >
                  Yes, Delete
                </button>
                <button
                  className="btn btn-secondary w-100 ml-1"
                  data-dismiss="modal"
                >
                  No, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

       
      </>
    </div>
  );
};

export default Insurances;
