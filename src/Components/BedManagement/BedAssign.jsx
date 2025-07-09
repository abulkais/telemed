import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteIcon from "@mui/icons-material/Delete";
import * as XLSX from "xlsx";
import removeIcon from "../../assets/images/remove.png";
import Preloader from "../preloader";
import Select from "react-select";
import Pagination from "../Pagination";

const BedAssign = () => {
  const [bedAssignments, setBedAssignments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [beds, setBeds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteId, setDeleteId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [bedAssignmentData, setBedAssignmentData] = useState({
    ipdPatientId: "",
    ipdNo: "",
    bedId: "",
    assignDate: "",
    description: "",
    status: true,
  });
  const [editing, setEditing] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const filterRef = useRef(null);
  const baseUrl = "http://localhost:8080";
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchBedAssignments = async () => {
    try {
      const params = statusFilter !== "ALL" ? { status: statusFilter } : {};
      const res = await axios.get("http://localhost:8080/api/bedAssignments", {
        params,
      });
      setBedAssignments(
        res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      );
      setCurrentPage(1);
    } catch (error) {
      console.error(
        "Error fetching bed assignments:",
        error.response?.data || error.message
      );
      toast.error("Failed to load bed assignments");
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/bedAssignments/patients"
      );
      setPatients(
        res.data.map((patient) => ({
          value: patient.id,
          label: `${patient.firstName} ${patient.lastName} (${patient.email})`,
        }))
      );
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    }
  };

  // const fetchBeds = async () => {
  //   try {
  //     const res = await axios.get(
  //       "http://localhost:8080/api/bedAssignments/beds"
  //     ); // Confirm this endpoint
  //     const bedsData = res.data.map((bed) => ({
  //       value: bed.id,
  //       label: bed.name,
  //     })); // Ensure mapping
  //     console.log("Fetched beds:", bedsData); // Debug log
  //     setBeds(bedsData);
  //   } catch (error) {
  //     console.error("Error fetching beds:", error);
  //     toast.error("Failed to load beds");
  //   }
  // };

  const fetchBeds = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/bedAssignments/beds"
      ); // Confirm this endpoint
      const bedsData = res.data.map((bed) => ({
        value: bed.id,
        label: bed.name,
      })); // Ensure mapping
      console.log("Fetched beds:", bedsData); // Debug log
      setBeds(bedsData);
    } catch (error) {
      console.error("Error fetching beds:", error);
      toast.error("Failed to load beds");
    }
  };

  const handleSelectChange = async (name, selectedOption) => {
    if (name === "ipdPatientId") {
      setSelectedPatient(selectedOption);
      setBedAssignmentData((prev) => ({
        ...prev,
        [name]: selectedOption.value,
        ipdNo: "",
        bedId: "",
      }));
      if (selectedOption) {
        try {
          const res = await axios.get(
            `http://localhost:8080/api/bedAssignments/patients/${selectedOption.value}`
          );
          setBedAssignmentData((prev) => ({
            ...prev,
            ipdNo: res.data.ipdNo || "",
          }));
          // Auto-select bed after setting ipdNo
          if (res.data.ipdNo && beds.length > 0) {
            const availableBed = beds.find(
              (b) =>
                !bedAssignments.some((ba) => ba.bedId === b.value && ba.status)
            );
            if (availableBed) {
              setBedAssignmentData((prev) => ({
                ...prev,
                bedId: availableBed.value,
              }));
            } else {
              setBedAssignmentData((prev) => ({ ...prev, bedId: "" }));
              toast.error(
                "No available beds. Please check bed assignments or add new beds."
              );
            }
          }
        } catch (error) {
          console.error("Error fetching IPD No:", error);
          toast.error("Failed to load IPD No");
        }
      }
    } else if (name === "bedId") {
      setBedAssignmentData((prev) => ({
        ...prev,
        [name]: selectedOption.value,
      }));
    }
  };

  const handleIpdNoChange = (e) => {
    const { value } = e.target;
    setBedAssignmentData((prev) => ({ ...prev, ipdNo: value }));
    if (value && beds.length > 0) {
      // Auto-select the first available bed
      const availableBed = beds.find(
        (b) => !bedAssignments.some((ba) => ba.bedId === b.value && ba.status)
      );
      if (availableBed) {
        setBedAssignmentData((prev) => ({
          ...prev,
          bedId: availableBed.value,
        }));
      } else {
        setBedAssignmentData((prev) => ({ ...prev, bedId: "" }));
        toast.error(
          "No available beds. Please check bed assignments or add new beds."
        );
      }
    }
  };

  const validateForm = () => {
    if (
      !bedAssignmentData.ipdPatientId ||
      !bedAssignmentData.ipdNo ||
      !bedAssignmentData.assignDate
    ) {
      toast.error("All fields are required!");
      return false;
    }
    if (!bedAssignmentData.bedId) {
      toast.error("Bed is required!");
      return false;
    }
    const isDuplicate = bedAssignments.some(
      (item) =>
        item.ipdPatientId === bedAssignmentData.ipdPatientId &&
        item.bedId === bedAssignmentData.bedId &&
        (!editing || item.id !== bedAssignmentData.id)
    );
    if (isDuplicate) {
      toast.error("This bed is already assigned to the selected patient.");
      return false;
    }
    return true;
  };

  useEffect(() => {
    fetchBedAssignments();
    fetchPatients();
    fetchBeds();
  }, [statusFilter]);

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

  const deleteBedAssignment = async () => {
    if (!deleteId) {
      toast.error("Invalid Bed Assignment ID!");
      return;
    }
    setIsDeleting(true);
    try {
      await axios.delete(
        `http://localhost:8080/api/bedAssignments/${deleteId}`
      );
      setBedAssignments((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Bed assignment deleted successfully!");
      $("#deleteBedAssignment").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting bed assignment!");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (assignment) => {
    setEditing(true);
    setBedAssignmentData({
      id: assignment.id,
      ipdPatientId: assignment.ipdPatientId,
      ipdNo: assignment.ipdNo,
      bedId: assignment.bedId,
      assignDate: assignment.assignDate.split("T")[0],
      description: assignment.description || "",
      status: assignment.status,
    });
    setSelectedPatient(
      patients.find((p) => p.value === assignment.ipdPatientId)
    );
    $("#addBedAssignmentModal").modal("show");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBedAssignmentData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleSelectChange = async (name, selectedOption) => {
  //   if (name === "ipdPatientId") {
  //     setSelectedPatient(selectedOption);
  //     setBedAssignmentData((prev) => ({
  //       ...prev,
  //       [name]: selectedOption.value,
  //       ipdNo: "",
  //       bedId: "",
  //     }));
  //     if (selectedOption) {
  //       try {
  //         const res = await axios.get(
  //           `http://localhost:8080/api/bedAssignments/patients/${selectedOption.value}`
  //         );
  //         setBedAssignmentData((prev) => ({
  //           ...prev,
  //           ipdNo: res.data.ipdNo || "",
  //         }));
  //       } catch (error) {
  //         console.error("Error fetching IPD No:", error);
  //         toast.error("Failed to load IPD No");
  //       }
  //     }
  //   }
  // };

  // const handleIpdNoChange = (e) => {
  //   const { value } = e.target;
  //   setBedAssignmentData((prev) => ({ ...prev, ipdNo: value }));
  //   if (value) {
  //     // Auto-select the first available bed
  //     const availableBed = beds.find(
  //       (b) => !bedAssignments.some((ba) => ba.bedId === b.value && ba.status)
  //     );
  //     if (availableBed) {
  //       setBedAssignmentData((prev) => ({
  //         ...prev,
  //         bedId: availableBed.value,
  //       }));
  //     }
  //   }
  // };

  const handleStatusChange = (e) => {
    setBedAssignmentData((prev) => ({ ...prev, status: e.target.checked }));
  };

  // const validateForm = () => {
  //   if (
  //     !bedAssignmentData.ipdPatientId ||
  //     !bedAssignmentData.ipdNo ||
  //     !bedAssignmentData.assignDate
  //   ) {
  //     toast.error("All fields are required!");
  //     return false;
  //   }
  //   // if (!bedAssignmentData.bedId) {
  //   //   toast.error("Bed is required!");
  //   //   return false;
  //   // }
  //   const isDuplicate = bedAssignments.some(
  //     (item) =>
  //       item.ipdPatientId === bedAssignmentData.ipdPatientId &&
  //       item.bedId === bedAssignmentData.bedId &&
  //       (!editing || item.id !== bedAssignmentData.id)
  //   );
  //   if (isDuplicate) {
  //     toast.error("This bed is already assigned to the selected patient.");
  //     return false;
  //   }
  //   return true;
  // };

  // const handleSaveBedAssignment = async (e) => {
  //   e.preventDefault();
  //   if (!validateForm()) return;

  //   setIsSaving(true);
  //   try {
  //     if (editing) {
  //       await axios.put(
  //         `http://localhost:8080/api/bedAssignments/${bedAssignmentData.id}`,
  //         bedAssignmentData
  //       );
  //       toast.success("Bed assignment updated successfully!");
  //     } else {
  //       await axios.post(
  //         "http://localhost:8080/api/bedAssignments",
  //         bedAssignmentData
  //       );
  //       toast.success("Bed assignment added successfully!");
  //     }
  //     fetchBedAssignments();
  //     $("#addBedAssignmentModal").modal("hide");
  //     resetForm();
  //   } catch (error) {
  //     console.error(
  //       "Error saving bed assignment:",
  //       error.response?.data || error.message
  //     );
  //     toast.error(
  //       "Error saving bed assignment: " +
  //         (error.response?.data?.error || error.message)
  //     );
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };
  const handleSaveBedAssignment = async (e) => {
    e.preventDefault();
    console.log("Submitting bedAssignmentData:", bedAssignmentData); // Debug log
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/bedAssignments/${bedAssignmentData.id}`,
          bedAssignmentData
        );
        toast.success("Bed assignment updated successfully!");
      } else {
        await axios.post(
          "http://localhost:8080/api/bedAssignments",
          bedAssignmentData
        );
        toast.success("Bed assignment added successfully!");
      }
      fetchBedAssignments();
      $("#addBedAssignmentModal").modal("hide");
      resetForm();
    } catch (error) {
      console.error(
        "Error saving bed assignment:",
        error.response?.data || error.message
      );
      toast.error(
        "Error saving bed assignment: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setIsSaving(false);
    }
  };
  const resetForm = () => {
    setBedAssignmentData({
      id: null,
      ipdPatientId: "",
      ipdNo: "",
      bedId: "",
      assignDate: "",
      description: "",
      status: true,
    });
    setSelectedPatient(null);
    setEditing(false);
  };

  const filterBedAssignments = (assignment) => {
    const matchesSearch = searchQuery
      ? assignment.ipdNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.patientName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        assignment.bedName?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "active" ? assignment.status : !assignment.status);
    return matchesSearch && matchesStatus;
  };

  const filteredBedAssignments = bedAssignments.filter(filterBedAssignments);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBedAssignments.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredBedAssignments.length / itemsPerPage);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setStatusFilter("ALL");
    setSearchQuery("");
    setCurrentPage(1);
    setShowFilter(false);
  };

  const toggleFilterDropdown = () => {
    setShowFilter(!showFilter);
  };

  const downloadExcel = () => {
    const dataToExport = filteredBedAssignments.map((assignment, index) => ({
      "S.N": index + 1,
      "IPD Number": assignment.ipdNo || "N/A",
      Patient: assignment.patientName,
      Bed: assignment.bedName,
      "Assign Date": new Date(assignment.assignDate).toLocaleString(),
      "Discharge Date": assignment.dischargeDate
        ? new Date(assignment.dischargeDate).toLocaleString()
        : "N/A",
      Status: assignment.status ? "Active" : "Inactive",
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bed_Assignments");
    XLSX.writeFile(workbook, "Bed_Assignments_List.xlsx");
  };

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

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:8080/api/bedAssignments/${id}`,
        { status: !currentStatus }
      );
      if (response.status === 200) {
        fetchBedAssignments();
        toast.success("Status updated successfully!");
      }
    } catch (error) {
      console.error(
        "Error updating status:",
        error.response?.data || error.message
      );
      toast.error(
        "Failed to update status: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link to="/bed-status" className="doctor-nav-btn">
            <span className="btn-text">Bed Status</span>
          </Link>
          <Link to="/bed-assignments" className="doctor-nav-btn active">
            <span className="btn-text">Bed Assigns</span>
          </Link>
          <Link to="/beds" className="doctor-nav-btn ">
            <span className="btn-text">Beds</span>
          </Link>
          <Link to="/bed-types" className="doctor-nav-btn">
            <span className="btn-text">Bed Types</span>
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
              className="filter-btn filter-btn-icon mr-3 py-2_half"
              onClick={toggleFilterDropdown}
            >
              <i className="fa fa-filter fa-lg" />
            </button>
            {showFilter && (
              <div className="dropdown-content">
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
                    <option value="ALL">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
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
            className="filter-btn filter-btn-primary mr-2 py-2_half"
            onClick={downloadExcel}
          >
            <i className="fa fa-file-excel-o fa-lg"></i>
          </button>
          <button
            className="filter-btn filter-btn-primary"
            data-toggle="modal"
            data-target="#addBedAssignmentModal"
            onClick={resetForm}
          >
            New Bed Assign
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>IPD No</th>
              <th>Patient</th>
              <th>Bed</th>
              <th>Assign Date</th>
              <th>Discharge Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((assignment, index) => (
                <tr key={assignment.id}>
                  <td>
                    <span className="badges bg-light-success">
                      {assignment.ipdNo}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      {assignment.profileImage ? (
                        <img
                          src={`${baseUrl}${assignment.profileImage}`}
                          alt={`${assignment.patientName}`}
                          className="rounded-circle-profile"
                        />
                      ) : (
                        <div className="rounded-circle-bgColor text-white d-flex align-items-center justify-content-center">
                          {assignment.patientName?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {assignment.patientName}
                        </p>
                        <p className="mb-0">{assignment.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{assignment.bedName}</td>
                  <td>
                    <span className="badges bg-light-info">
                      {formatDate(assignment.assignDate)}
                    </span>
                  </td>
                  <td>
                    {assignment.dischargeDate ? (
                      <span className="badges bg-light-info">
                        {formatDate(assignment.dischargeDate)}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={assignment.status}
                        onChange={() =>
                          handleStatusToggle(assignment.id, assignment.status)
                        }
                      />
                      <span className="slider round"></span>
                    </label>
                  </td>
                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                      <button
                        className="btn"
                        onClick={() => handleEdit(assignment)}
                      >
                        <i className="text-primary fa fa-edit fa-lg" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deleteBedAssignment"
                        onClick={() => setDeleteId(assignment.id)}
                      >
                        <DeleteIcon className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">
                  <Preloader />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
        setItemsPerPage={setItemsPerPage}
      />

      {/* Add/Edit Bed Assignment Modal */}
      <div
        className="modal fade document_modal"
        id="addBedAssignmentModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addBedAssignmentModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-center" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Bed Assignment" : "New Bed Assign"}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                onClick={resetForm}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveBedAssignment}>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>Patient:*</label>
                      <Select
                        name="ipdPatientId"
                        options={patients}
                        value={selectedPatient}
                        onChange={(selectedOption) =>
                          handleSelectChange("ipdPatientId", selectedOption)
                        }
                        placeholder="Choose Patient"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>IPD No:*</label>
                      <input
                        type="text"
                        name="ipdNo"
                        className="form-control"
                        value={bedAssignmentData.ipdNo}
                        onChange={handleIpdNoChange}
                        placeholder="IPD No"
                        disabled={!selectedPatient}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>Bed:*</label>
                      <Select
                        name="bedId"
                        options={beds}
                        value={beds.find(
                          (b) => b.value === bedAssignmentData.bedId
                        )} // Correct value binding
                        onChange={(selectedOption) =>
                          handleSelectChange("bedId", selectedOption)
                        }
                        placeholder="Choose Bed"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>Assign Date:*</label>
                      <input
                        type="date"
                        name="assignDate"
                        className="form-control"
                        value={bedAssignmentData.assignDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>Description:</label>
                      <input
                        type="text"
                        name="description"
                        className="form-control"
                        value={bedAssignmentData.description}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>
                        Status: <span className="text-danger">*</span>
                      </label>
                      <br />
                      <label className="switch">
                        <input
                          type="checkbox"
                          name="status"
                          checked={bedAssignmentData.status}
                          onChange={handleStatusChange}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-center justify-center mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary mr-3 px-3"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        <span className="ml-2">
                          {editing ? "Updating..." : "Saving..."}
                        </span>
                      </div>
                    ) : editing ? (
                      "Update"
                    ) : (
                      "Submit"
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary px-3"
                    data-dismiss="modal"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Bed Assignment Modal */}
      <div
        className="modal fade"
        id="deleteBedAssignment"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteBedAssignment"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-sm modal-dialog-centered"
          role="document"
        >
          <div className="modal-content text-center">
            <span className="modal-icon">
              <img src={removeIcon} alt="Remove Icon" />
            </span>
            <h2>Delete</h2>
            <p>Are you sure you want to delete this bed assignment?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteBedAssignment}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="d-flex align-items-center justify-content-center">
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    <span className="ml-2">Wait</span>
                  </div>
                ) : (
                  <span>Yes, Delete</span>
                )}
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

export default BedAssign;
