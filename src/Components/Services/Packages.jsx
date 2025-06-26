import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import Select from "react-select";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility"; // Import View icon
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import removeIcon from "../../assets/images/remove.png";

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  // Package form state
  const [packageData, setPackageData] = useState({
    packageName: "",
    discount: "",
    description: "",
    services: [{ serviceId: "", quantity: 1, rate: "", amount: 0 }],
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch services for dropdown
  const fetchServices = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/services");
      setServices(
        res.data.map((service) => ({
          value: service.id,
          label: service.name,
          rate: service.rate || 0,
        }))
      );
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    }
  };

  // Fetch packages
  const fetchPackages = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/packages");
      const sortedData = res.data.sort(
        (a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime)
      );
      setPackages(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("Failed to load packages");
    }
  };

  useEffect(() => {
    fetchServices();
    fetchPackages();
    if (id) {
      setEditing(true);
      setEditId(id);
      axios
        .get(`http://localhost:8080/api/packages/${id}`)
        .then((res) => {
          const pkg = res.data;
          setPackageData({
            packageName: pkg.packageName,
            discount: pkg.discount,
            description: pkg.description,
            services: pkg.services.map((s) => ({
              serviceId: s.serviceId,
              quantity: s.quantity,
              rate: s.rate,
              amount: s.quantity * s.rate,
            })),
          });
        })
        .catch((error) => {
          console.error("Error fetching package:", error);
          toast.error("Failed to load package");
        });
    }
  }, [id]);

  // Handle input changes, service changes, etc. (same as before)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPackageData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceChange = (index, selectedOption) => {
    const newServices = [...packageData.services];
    newServices[index].serviceId = selectedOption ? selectedOption.value : "";
    newServices[index].rate = selectedOption ? selectedOption.rate : "";
    newServices[index].amount =
      newServices[index].quantity * (selectedOption ? selectedOption.rate : 0);
    setPackageData((prev) => ({ ...prev, services: newServices }));
  };

  const handleServiceInputChange = (index, e) => {
    const { name, value } = e.target;
    const newServices = [...packageData.services];
    newServices[index][name] = value;
    if (name === "quantity" || name === "rate") {
      newServices[index].amount =
        (parseFloat(newServices[index].quantity) || 0) *
        (parseFloat(newServices[index].rate) || 0);
    }
    setPackageData((prev) => ({ ...prev, services: newServices }));
  };

  const addServiceRow = () => {
    setPackageData((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        { serviceId: "", quantity: 1, rate: "", amount: 0 },
      ],
    }));
  };

  const removeServiceRow = (index) => {
    const newServices = packageData.services.filter((_, i) => i !== index);
    setPackageData((prev) => ({ ...prev, services: newServices }));
  };

  const validateForm = () => {
    if (!packageData.packageName) {
      toast.error("Package name is required");
      return false;
    }
    if (!packageData.discount || isNaN(packageData.discount)) {
      toast.error("Valid discount percentage is required");
      return false;
    }
    if (packageData.services.some((s) => !s.serviceId)) {
      toast.error("All services must be selected");
      return false;
    }
    if (packageData.services.some((s) => !s.quantity || s.quantity <= 0)) {
      toast.error("All quantities must be greater than 0");
      return false;
    }
    if (packageData.services.some((s) => !s.rate || s.rate <= 0)) {
      toast.error("All rates must be greater than 0");
      return false;
    }
    const isDuplicate = packages.some(
      (pkg) =>
        pkg.packageName.toLowerCase() ===
          packageData.packageName.toLowerCase() &&
        (!editing || pkg.id !== editId)
    );
    if (isDuplicate) {
      toast.error("Package name already exists");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    const newPackage = {
      ...packageData,
      id: editing ? editId : String(packages.length + 1).padStart(2, "0"),
      createdDateTime: currentDate,
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/packages/${editId}`,
          newPackage
        );
        toast.success("Package updated successfully");
      } else {
        await axios.post("http://localhost:8080/api/packages", newPackage);
        toast.success("Package added successfully");
      }
      fetchPackages();
      navigate("/packages");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving package");
    }
  };

  const resetForm = () => {
    setPackageData({
      packageName: "",
      discount: "",
      description: "",
      services: [{ serviceId: "", quantity: 1, rate: "", amount: 0 }],
    });
    setEditing(false);
    setEditId(null);
  };

  const deletePackage = async () => {
    if (!deleteId) {
      toast.error("Invalid Package ID!");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/packages/${deleteId}`);
      setPackages((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Package deleted successfully!");
      $("#deletePackage").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting package!");
    }
  };

  const handleEdit = (pkg) => {
    navigate(`/packages/${pkg.id}/edit`);
  };

  const handleView = (pkg) => {
    navigate(`/packages/${pkg.id}/view`);
  };

  const filterBySearch = (pkg) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      pkg.packageName?.toLowerCase().includes(searchLower) ||
      pkg.description?.toLowerCase().includes(searchLower)
    );
  };

  const filteredPackages = packages.filter(filterBySearch);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPackages.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);

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

  const renderPackageForm = () => (
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">
          {editing ? "Edit Package" : "New Package"}
        </h5>
        <button
          type="button"
          className="close"
          onClick={() => navigate("/packages")}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <div className="modal-body">
        <div className="row">
          <div className="col-lg-6">
            <div className="form-group">
              <label>
                Package: <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="packageName"
                placeholder="Enter package name"
                value={packageData.packageName}
                className="form-control"
                onChange={handleInputChange}
                disabled={editing}
              />
            </div>
          </div>
          <div className="col-lg-6">
            <div className="form-group">
              <label>
                Discount (%): <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                name="discount"
                placeholder="Enter discount percentage"
                value={packageData.discount}
                className="form-control"
                onChange={handleInputChange}
                disabled={editing}
              />
            </div>
          </div>
          <div className="col-lg-12">
            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                placeholder="Enter description"
                value={packageData.description}
                className="form-control"
                onChange={handleInputChange}
                rows="3"
                disabled={editing}
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <h6>Services</h6>
          <table className="table custom-table-striped custom-table table-hover">
            <thead className="thead-light">
              <tr>
                <th>#</th>
                <th>Service</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {packageData.services.map((service, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <Select
                      options={services}
                      value={services.find(
                        (opt) => opt.value === service.serviceId
                      )}
                      onChange={(option) => handleServiceChange(index, option)}
                      className="basic-single"
                      classNamePrefix="select"
                      placeholder="Select service"
                      isDisabled={editing}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="quantity"
                      value={service.quantity}
                      className="form-control"
                      onChange={(e) => handleServiceInputChange(index, e)}
                      min="1"
                      disabled={editing}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="rate"
                      value={service.rate}
                      className="form-control"
                      onChange={(e) => handleServiceInputChange(index, e)}
                      min="0"
                      disabled={editing}
                    />
                  </td>
                  <td>{service.amount.toFixed(2)}</td>
                  <td>
                    <button
                      className="btn"
                      onClick={() => removeServiceRow(index)}
                      disabled={editing}
                    >
                      <DeleteIcon className="text-danger" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="btn btn-primary mt-2"
            onClick={addServiceRow}
            disabled={editing}
          >
            Add Service
          </button>
        </div>
        <div className="d-flex align-center justify-center mt-4">
          <button className="btn btn-primary mr-3" onClick={handleSubmit}>
            {editing ? "Update" : "Save"}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/packages")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <ToastContainer />
      {id &&
      (window.location.pathname.includes("/edit") ||
        window.location.pathname.includes("/create")) ? (
        <div className="modal fade document_modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-center">
            {renderPackageForm()}
          </div>
        </div>
      ) : (
        <>
          <div className="doctor-nav-buttons">
            <div className="nav_headings">
              <Link to="/insurances" className="doctor-nav-btn">
                <span className="btn-text">Insurances</span>
              </Link>
              <Link to="/packages" className="doctor-nav-btn active">
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
          <div className="filter-bar-container">
            <div className="filter-search-box">
              <input
                type="text"
                className="form-control"
                placeholder="Search Packages"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <button
                className="filter-btn filter-btn-primary"
                onClick={() => navigate("/packages/create")}
              >
                New Package
              </button>
            </div>
          </div>

          <div className="custom-table-responsive">
            <table className="table custom-table-striped custom-table table-hover text-center">
              <thead className="thead-light">
                <tr>
                  <th>S.N</th>
                  <th>Package Name</th>
                  <th>Discount (%)</th>
                  <th>Description</th>
                  <th>Created Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={index}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>
                      <span className="badges bg-light-success">
                        {item.packageName}
                      </span>
                    </td>
                    <td>{item.discount}</td>
                    <td>{item.description ? item.description : "N/A"}</td>
                    <td>
                      <span className="badges bg-light-success">
                        {formatDate(item.createdDateTime)}
                      </span>
                    </td>
                    <td>
                      <div
                        className="d-flex justify-center items-center"
                        style={{ justifyContent: "center" }}
                      >
                        <button
                          className="btn"
                          onClick={() => handleView(item)}
                        >
                          <VisibilityIcon className="text-info" />
                        </button>
                        <button
                          className="btn"
                          onClick={() => handleEdit(item)}
                        >
                          <i className="fa fa-edit fa-lg text-primary" />
                        </button>
                        <button
                          className="btn"
                          data-toggle="modal"
                          data-target="#deletePackage"
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
                {Math.min(indexOfLastItem, filteredPackages.length)} of{" "}
                {filteredPackages.length} results
              </div>
              <nav>
                <ul className="pagination">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
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
            id="deletePackage"
            tabIndex="-1"
            role="dialog"
            aria-labelledby="deletePackage"
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
                <p>Are you sure want to delete this Package?</p>
                <div className="d-flex">
                  <button
                    className="btn btn-danger w-100 mr-1"
                    onClick={deletePackage}
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
      )}
    </div>
  );
};

export default Packages;
