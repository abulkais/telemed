import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import * as XLSX from "xlsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Switch from "@mui/material/Switch";

const Services = () => {
  const [servicesData, setServicesData] = useState([]);
  const [excelLoading, setExcelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [service, setService] = useState({
    serviceName: "",
    serviceQty: "",
    serviceRate: "",
    serviceDescription: "",
    serviceStatus: true, // Default to active
  });
  const [filter, setFilter] = useState("Services");

  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    start: null,
    end: null,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setService((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (e) => {
    setService((prev) => ({
      ...prev,
      serviceStatus: e.target.checked,
    }));
  };

  const validateForm = () => {
    if (!service.serviceName) {
      toast.error("Service name is required");
      return false;
    }

    if (!service.serviceRate || isNaN(service.serviceRate)) {
      toast.error("Service rate must be a valid number");
      return false;
    }

    if (service.serviceQty && isNaN(service.serviceQty)) {
      toast.error("Quantity must be a valid number");
      return false;
    }

    // Check for duplicate service name (case insensitive)
    const isDuplicate = servicesData.some(
      (item) =>
        item.serviceName.toLowerCase() === service.serviceName.toLowerCase() &&
        (!editing || item.id !== editId)
    );

    if (isDuplicate) {
      toast.error("The name has already been taken.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const currentDate = new Date().toISOString().slice(0,19).replace("T", " ");

    // Generate a simple ID
    const newId = String(servicesData.length + 1).padStart(2, "0");
    const serviceId = String(servicesData.length + 1).padStart(2, "0");

    const newService = {
      ...service,
      id: newId,
      serviceId: serviceId,
      createdDateTime: currentDate,
    };

    try {
      if (editing) {
        await axios.put(`http://localhost:8080/api/services/${editId}`, newService);
        toast.success("Service Updated Successfully");
      } else {
        await axios.post(`http://localhost:8080/api/services`, newService);
        toast.success("Service Added Successfully");
      }
      fetchServices();
      resetForm();
      $("#addService").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving Service");
    }
  };

  const resetForm = () => {
    setService({
      serviceName: "",
      serviceQty: "",
      serviceRate: "",
      serviceDescription: "",
      serviceStatus: true,
    });
    setEditing(false);
    setEditId(null);
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/services`);
      const sortedData = res.data.sort(
        (a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime)
      );
      setServicesData(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching Services:", error);
      toast.error("Failed to load Services");
    }
  };

  const deleteService = async () => {
    if (!deleteId) {
      toast.error("Invalid Service ID!");
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/services/${deleteId}`);
      setServicesData((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Service deleted successfully!");
      $("#deleteService").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Service!");
    }
  };

  const handleEdit = (item) => {
    setEditing(true);
    setEditId(item.id);
    setService({
      serviceName: item.serviceName,
      serviceQty: item.serviceQty,
      serviceRate: item.serviceRate,
      serviceDescription: item.serviceDescription,
      serviceStatus: item.serviceStatus,
    });
    $("#addService").modal("show");
  };

  const downloadCSV = () => {
    setExcelLoading(true);

    let dataToExport;
    let fileName;

    if (dateFilter.start && !dateFilter.end) {
      dataToExport = servicesData.filter((doc) => {
        const docDate = new Date(doc.createdDateTime);
        const filterDate = new Date(dateFilter.start);

        return (
          docDate.getDate() === filterDate.getDate() &&
          docDate.getMonth() === filterDate.getMonth() &&
          docDate.getFullYear() === filterDate.getFullYear()
        );
      });
      fileName = `Services_${new Date(dateFilter.start)
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else if (dateFilter.start || dateFilter.end || searchQuery) {
      dataToExport = servicesData.filter(filterByDate).filter(filterBySearch);
      fileName = `Services_Filtered_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else {
      dataToExport = servicesData;
      fileName = `Services_All_Data_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
    }

    if (dataToExport.length === 0) {
      toast.error("No data found for the current filters!");
      setExcelLoading(false);
      return;
    }

    const data = [
      {
        "Service ID": "Service ID",
        "Service Name": "Service Name",
        Quantity: "Quantity",
        Rate: "Rate",
        Status: "Status",
        Description: "Description",
        "Date & Time": "Date & Time",
      },
      ...dataToExport.map((item) => ({
        "Service ID": item.serviceId,
        "Service Name": item.serviceName,
        Quantity: item.serviceQty,
        Rate: item.serviceRate,
        Status: item.serviceStatus ? "Active" : "Inactive",
        Description: item.serviceDescription,
        "Date & Time": formatDate(item.createdDateTime),
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 20 },
      { wch: 10 },
      { wch: 15 },
      { wch: 10 },
      { wch: 30 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Services_Report");
    XLSX.writeFile(workbook, fileName);
    setExcelLoading(false);
    toast.success(`Report downloaded (${dataToExport.length} records)`);
  };

  const filterByDate = (doc) => {
    if (!dateFilter.start && !dateFilter.end) return true;

    const docDate = new Date(doc.createdDateTime);
    const startDate = dateFilter.start
      ? new Date(dateFilter.start)
      : new Date(0);

    let endDate;
    if (dateFilter.end) {
      endDate = new Date(dateFilter.end);
      endDate.setHours(23, 59, 59, 999);
    } else {
      endDate = new Date();
    }

    return docDate >= startDate && docDate <= endDate;
  };

  const filterBySearch = (doc) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      (doc.serviceName &&
        doc.serviceName.toLowerCase().includes(searchLower)) ||
      (doc.serviceDescription &&
        doc.serviceDescription.toLowerCase().includes(searchLower)) ||
      (doc.serviceId && doc.serviceId.toLowerCase().includes(searchLower)) ||
      (doc.serviceRate && doc.serviceRate.toString().includes(searchLower)) ||
      (doc.serviceQty && doc.serviceQty.toString().includes(searchLower))
    );
  };

  const filteredServices = servicesData
    .filter(filterByDate)
    .filter(filterBySearch);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredServices.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link
            to="/insurances"
            className={`doctor-nav-btn ${
              filter === "Insurances" ? "active" : ""
            }`}
            onClick={() => setFilter("Insurances")}
          >
            <span className="btn-text">Insurances</span>
          </Link>
          <Link
            to="/packages"
            className={`doctor-nav-btn ${
              filter === "Packages" ? "active" : ""
            }`}
            onClick={() => setFilter("Packages")}
          >
            <span className="btn-text">Packages</span>
          </Link>

         
          <Link
            to="/services"
            className={`doctor-nav-btn ${
              filter === "Services" ? "active" : ""
            }`}
            onClick={() => setFilter("Services")}
          >
            <span className="btn-text">Services</span>
          </Link>

          <Link
            to="/ambulances"
            className={`doctor-nav-btn ${
              filter === "Ambulance" ? "active" : ""
            }`}
            onClick={() => setFilter("Ambulance")}
          >
            <span className="btn-text">Ambulance</span>
          </Link>

          <Link
            to="/ambulance-calls"
            className={`doctor-nav-btn ${
              filter === "AmbulanceCalls" ? "active" : ""
            }`}
            onClick={() => setFilter("AmbulanceCalls")}
          >
            <span className="btn-text">AmbulanceCalls</span>
          </Link>
        </div>
      </div>
      <div className="filter-bar-container">
        <div className="filter-search-box">
          <input
            type="text"
            className="form-control"
            placeholder="Search Services"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <div className="mr-2">
            <DatePicker
              selected={dateFilter.start}
              onChange={(date) => setDateFilter({ ...dateFilter, start: date })}
              selectsStart
              startDate={dateFilter.start}
              endDate={dateFilter.end}
              placeholderText="Start Date"
              className="form-control"
              dateFormat="MMM d, yyyy"
              isClearable
            />
          </div>
          <div className="mr-2">
            <DatePicker
              selected={dateFilter.end}
              onChange={(date) => setDateFilter({ ...dateFilter, end: date })}
              selectsEnd
              startDate={dateFilter.start}
              endDate={dateFilter.end}
              minDate={dateFilter.start}
              placeholderText="End Date"
              className="form-control"
              dateFormat="MMM d, yyyy"
              isClearable
            />
          </div>

          <button
            className="filter-btn filter-btn-primary"
            data-toggle="modal"
            data-target="#addService"
            onClick={resetForm}
          >
            New Service
          </button>

          <button
            className="btn btn-success ml-2"
            onClick={downloadCSV}
            disabled={excelLoading}
          >
            {excelLoading ? (
              <span>Exporting...</span>
            ) : (
              <span>
                <i className="fa fa-file-excel-o fa-md p-1"></i>
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>S.N</th>
              <th>Service Name</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>
                  <span className="badges bg-light-success">
                    {item.serviceName}
                  </span>
                  
                </td>
                <td>{item.serviceQty || "N/A"}</td>
                <td>{formatCurrency(item.serviceRate)}</td>
                <td>
                  <span
                    className={`badges ${
                      item.serviceStatus
                        ? "bg-light-success"
                        : "bg-light-danger"
                    }`}
                  >
                    {item.serviceStatus ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div
                    className="d-flex justify-center items-center"
                    style={{ justifyContent: "center" }}
                  >
                    <button className="btn" onClick={() => handleEdit(item)}>
                      <i className="text-primary fa fa-edit fa-lg" />
                    </button>
                    <button
                      className="btn"
                      data-toggle="modal"
                      data-target="#deleteService"
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

        {/* Pagination controls */}
        <div className="d-flex justify-content-between align-items-center mt-5">
          <div>
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredServices.length)} of{" "}
            {filteredServices.length} results
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

              {/* Always show first page */}
              <li className={`page-item ${currentPage === 1 ? "active" : ""}`}>
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

              {/* Show ellipsis if current page is far from start */}
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

              {/* Show pages around current page */}
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

              {/* Show ellipsis if current page is far from end */}
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

              {/* Always show last page if there's more than 1 page */}
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

      {/* Add/Edit Service Modal */}
      <div
        className="modal fade document_modal"
        id="addService"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addService"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-lg modal-center"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Service" : "New Service"}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                onClick={resetForm}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-lg-12">
                  <div className="form-group">
                    <label>
                      Service Name: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="serviceName"
                      placeholder="Enter service name"
                      value={service.serviceName}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                <div className="form-group">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    name="serviceQty"
                    placeholder="Enter quantity"
                    value={service.serviceQty}
                    className="form-control"
                    onChange={handleChange}
                  />
                </div>
              
                </div>
                <div className="col-lg-6">
                <div className="form-group">
                  <label>
                    Rate: <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="serviceRate"
                    placeholder="Enter rate"
                    value={service.serviceRate}
                    className="form-control"
                    onChange={handleChange}
                    step="0.01"
                  />
                </div>
                </div>
                <div className="col-lg-12">
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    name="serviceDescription"
                    placeholder="Enter description"
                    value={service.serviceDescription}
                    className="form-control"
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
                </div>
              </div>
              <div className="form-group">
                <label>Status:</label>
                <div className="d-flex align-items-center">
                  <Switch
                    checked={service.serviceStatus}
                    onChange={handleStatusChange}
                    color="primary"
                    inputProps={{ "aria-label": "service status" }}
                  />
                  <span className="ml-2">
                    {service.serviceStatus ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="d-flex align-center justify-center mt-4">
                <button className="btn btn-primary mr-3" onClick={handleSubmit}>
                  {editing ? "Update" : "Save"}
                </button>
                <button
                  className="btn btn-secondary"
                  data-dismiss="modal"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div
        className="modal fade"
        id="deleteService"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteService"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-sm modal-dialog-centered"
          role="document"
        >
          <div className="modal-content text-center">
            <span className="modal-icon">
              <img
                src="https://hms.infyom.com/assets/images/remove.png"
                alt=""
              />
            </span>
            <h2>Delete</h2>
            <p>Are you sure want to delete this Service?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteService}
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
    </div>
  );
};

export default Services;
