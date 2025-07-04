import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import Pagination from "../Pagination";
import Preloader from "../preloader";


const VaccinatedPatients = () => {
  const [vaccinatedPatients, setVaccinatedPatients] = useState([]);
  const [patients, setPatients] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [vaccinatedPatient, setVaccinatedPatient] = useState({
    patientId: "",
    vaccinationId: "",
    serialNo: "",
    doseNo: "",
    doseGivenDate: "",
    notes: "",
  });
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [excelLoading, setExcelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/patients`);
      // console.log("Patients fetched:", res.data[0].profileImage);
      setPatients(res.data);
      // console.log("Patients:", res.data.);
    } catch (error) {
      console.error("Error fetching Patients:", error);
      toast.error("Failed to load Patients");
    }
  };

  const fetchVaccinations = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/vaccinationsbyStatus`);
      // console.log("Vaccinations fetched:", res.data);
      setVaccinations(res.data);
    } catch (error) {
      // console.error("Error fetching Vaccinations:", error);
      toast.error("Failed to load Vaccinations");
    }
  };

  const fetchVaccinatedPatients = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/vaccinatedPatients`);
      // console.log("Vaccinated Patients fetched:", res.data);
      const sortedData = res.data.sort(
        (a, b) => new Date(b.createdDateTime) - new Date(a.createdDateTime)
      );
      setVaccinatedPatients(sortedData);
      setCurrentPage(1);
    } catch (error) {
      // console.error("Error fetching Vaccinated Patients:", error);
      toast.error("Failed to load Vaccinated Patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchPatients(),
          fetchVaccinations(),
          fetchVaccinatedPatients(),
        ]);
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const patientOptions = patients.map((patient) => ({
    value: patient.id,
    label: `${patient.firstName} ${patient.lastName} - ${patient.email}`,
  }));

  const vaccinationOptions = vaccinations.map((vaccination) => ({
    value: String(vaccination.id),
    label: vaccination.name,
  }));



  const generateSerialNumber = () => {
    const count = vaccinatedPatients.length + 1;
    return `vaccine${String(count).padStart(2, "0")}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVaccinatedPatient((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePatientChange = (selectedOption) => {
    setVaccinatedPatient((prev) => ({
      ...prev,
      patientId: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleVaccinationChange = (selectedOption) => {
    setVaccinatedPatient((prev) => ({
      ...prev,
      vaccinationId: selectedOption ? selectedOption.value : "",
    }));
  };

  const validateForm = () => {
    if (!vaccinatedPatient.patientId) {
      toast.error("Please select a patient");
      return false;
    }
    if (!vaccinatedPatient.vaccinationId) {
      toast.error("Please select a vaccination");
      return false;
    }


    if (!vaccinatedPatient.serialNo) {
      toast.error("Serial No is required");
      return false;
    }
    if (!vaccinatedPatient.doseNo || isNaN(vaccinatedPatient.doseNo)) {
      toast.error("Dose No must be a valid number");
      return false;
    }
    if (!vaccinatedPatient.doseGivenDate) {
      toast.error("Dose Given Date is required");
      return false;
    }

    const isDuplicate = vaccinatedPatients.some(
      (item) =>
        item.patientId === vaccinatedPatient.patientId &&
        item.vaccinationId === vaccinatedPatient.vaccinationId &&
        (!editing || item.id !== editId)
    );
    if (isDuplicate) {
      toast.error(
        "This patient has already been vaccinated with this vaccine."
      );
      return false;
    }

    return true;
  };
  const getTodayDateTime = () => {
    const today = new Date(); // Current date and time: May 25, 2025, 11:43 AM IST
    return today.toISOString().slice(0, 16); // Format: "2025-05-25T11:43"
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
    const newId = String(vaccinatedPatients.length + 1).padStart(2, "0");

    const newVaccinatedPatient = {
      ...vaccinatedPatient,
      id: newId,
      createdDateTime: currentDate,
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/vaccinatedPatients/${editId}`,
          newVaccinatedPatient
        );
        toast.success("Vaccinated Patient Updated Successfully");
      } else {
        await axios.post(
          `http://localhost:8080/api/vaccinatedPatients`,
          newVaccinatedPatient
        );
        toast.success("Vaccinated Patient Added Successfully");
      }
      fetchVaccinatedPatients();
      resetForm();
      $("#addVaccinatedPatient").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.error || "This patient has already been vaccinated with this vaccine.");
      } else {
        toast.error("Error saving Vaccinated Patient");
      }
    }
  };
  const resetForm = () => {
    setVaccinatedPatient({
      patientId: "",
      vaccinationId: "",
      serialNo: "",
      doseNo: "",
      doseGivenDate: "",
      notes: "",
    });
    setEditing(false);
    setEditId(null);
  };

  const deleteVaccinatedPatient = async () => {
    if (!deleteId) {
      toast.error("Invalid Vaccinated Patient ID!");
      return;
    }
    try {
      await axios.delete(
        `http://localhost:8080/api/vaccinatedPatients/${deleteId}`
      );
      setVaccinatedPatients((prev) =>
        prev.filter((item) => item.id !== deleteId)
      );
      toast.success("Vaccinated Patient deleted successfully!");
      $("#deleteVaccinatedPatient").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Vaccinated Patient!");
    }
  };

  const handleEdit = (item) => {
    setEditing(true);
    setEditId(item.id);
    setVaccinatedPatient({
      patientId: item.patientId,
      vaccinationId: item.vaccinationId,
      serialNo: item.serialNo,
      doseNo: item.doseNo,
      doseGivenDate: new Date(item.doseGivenDate).toISOString().slice(0, 16),
      notes: item.notes,
    });
    $("#addVaccinatedPatient").modal("show");
  };

  const downloadExcel = () => {
    setExcelLoading(true);

    let dataToExport = filteredVaccinatedPatients;
    let fileName = `VaccinatedPatients_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    if (dataToExport.length === 0) {
      toast.error("No data found to export!");
      setExcelLoading(false);
      return;
    }

    const data = [
      {
        Patient: "Patient",
        Vaccination: "Vaccination",
        "Serial No": "Serial No",
        "Dose No": "Dose No",
        "Dose Given Date": "Dose Given Date",
        Notes: "Notes",
      },
      ...dataToExport.map((item) => {
        const patient = getPatientById(item.patientId);
        const vaccination = getVaccinationById(item.vaccinationId);
        return {
          Patient: patient ? `${patient.firstName} ${patient.lastName} - ${patient.email}` : "N/A",
          Vaccination: vaccination?.name || "N/A",
          "Serial No": item.serialNo,
          "Dose No": item.doseNo,
          "Dose Given Date": formatDateTime(item.doseGivenDate),
          Notes: item.notes || "N/A",
        };
      }),
    ];

    const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    worksheet["!cols"] = [
      { wch: 30 },
      { wch: 20 },
      { wch: 15 },
      { wch: 10 },
      { wch: 25 },
      { wch: 30 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vaccinated_Patients");
    XLSX.writeFile(workbook, fileName);
    setExcelLoading(false);
    toast.success(`Report downloaded (${dataToExport.length} records)`);
  };

  const getPatientById = (patientId) => {
    return patients.find((patient) => String(patient.id) === String(patientId));
  };

  const getVaccinationById = (vaccinationId) => {
    return vaccinations.find((vaccination) => String(vaccination.id) === String(vaccinationId));
  };

  const filterBySearch = (vaccinatedPatient) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const patient = getPatientById(vaccinatedPatient.patientId);
    const patientName = patient ? `${patient.firstName} ${patient.lastName}`.toLowerCase() : "";
    return patientName.includes(searchLower);
  };

  const filteredVaccinatedPatients = vaccinatedPatients.filter(filterBySearch);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVaccinatedPatients.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(
    filteredVaccinatedPatients.length / itemsPerPage
  );

  const formatDateTime = (dateString) => {
    const dateObj = new Date(dateString);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString("default", { month: "short" });
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm} ${day} ${month}, ${year}`;
  };

  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link
            to="/vaccinated-patients"
            className={`doctor-nav-btn active`}
            onClick={() => { }}
          >
            <span className="btn-text">Vaccinated Patients</span>
          </Link>

          <Link
            to="/vaccinations"
            className={`doctor-nav-btn`}
            onClick={() => { }}
          >
            <span className="btn-text">Vaccinations</span>
          </Link>
        </div>
      </div>

      <div className="filter-bar-container">
        <div className="filter-search-box">
          <input
            type="text"
            className="form-control"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <button
            className="filter-btn filter-btn-primary"
            data-toggle="modal"
            data-target="#addVaccinatedPatient"
            onClick={() => {
              resetForm();
              setVaccinatedPatient((prev) => ({
                ...prev,
                serialNo: generateSerialNumber(),
              }));
            }}
          >
            New Vaccinated Patient
          </button>
          <button
            className="btn btn-success ml-2"
            onClick={downloadExcel}
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
              <th>Patient</th>
              <th>Vaccination</th>
              <th>Serial No</th>
              <th>Dose No</th>
              <th>Dose Given Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">
                  <Preloader />
                </td>
              </tr>
            ) : currentItems.length > 0 ? (
              currentItems.map((item, index) => {
                const patient = getPatientById(item.patientId);
                const vaccination = getVaccinationById(item.vaccinationId);
                return (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        {patient.profileImage ? (
                          <img
                            src={patient.profileImage}
                            alt={`${patient.firstName} ${patient.lastName}`}
                            className="rounded-circle-profile"
                          />
                        ) : (
                          <div
                            className="rounded-circle-bgColor text-white d-flex align-items-center justify-content-center"
                          >
                            {patient.firstName?.charAt(0)?.toUpperCase() || ""}
                            {patient.lastName?.charAt(0)?.toUpperCase() || ""}
                          </div>
                        )}
                        <div className="flex-wrap">
                          <p className="mb-0" style={{ textAlign: "start" }}>
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="mb-0">{patient.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>{vaccination?.name || "N/A"}</td>
                    <td>
                      <span className="badges bg-light-success">
                        {item.serialNo}
                      </span>
                    </td>
                    <td>
                      <span className="badges bg-light-danger">{item.doseNo}</span>
                    </td>
                    <td>
                      <span className="badges bg-light-info">
                        {formatDateTime(item.doseGivenDate)}
                      </span>
                    </td>
                    <td>
                      <div
                        className="d-flex justify-center items-center"
                        style={{ justifyContent: "center" }}
                      >
                        <button className="btn" onClick={() => handleEdit(item)}>
                          <i className="fa fa-edit fa-lg text-primary"></i>
                        </button>
                        <button
                          className="btn"
                          data-toggle="modal"
                          data-target="#deleteVaccinatedPatient"
                          onClick={() => setDeleteId(item.id)}
                        >
                          <DeleteIcon className="text-danger" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7">
                  <p className="">No data found.</p>
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
      <div
        className="modal fade document_modal"
        id="addVaccinatedPatient"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addVaccinatedPatient"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-center" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Vaccinated Patient" : "New Vaccinated Patient"}
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
              <div className="row">
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Select Patient: <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={patientOptions}
                      value={patientOptions.find(
                        (opt) => opt.value === vaccinatedPatient.patientId
                      )}
                      onChange={handlePatientChange}
                      className="basic-single"
                      classNamePrefix="select"
                      isClearable
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Select Vaccination: <span className="text-danger">*</span>
                    </label>
                    <Select
                      options={vaccinationOptions}
                      value={vaccinationOptions.find(
                        (opt) => opt.value === vaccinatedPatient.vaccinationId
                      )}
                      onChange={handleVaccinationChange}
                      className="basic-single"
                      classNamePrefix="select"
                      isClearable
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Serial No: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="serialNo"
                      value={vaccinatedPatient.serialNo}
                      className="form-control"
                      disabled
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Dose No: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="doseNo"
                      placeholder="Enter dose number"
                      value={vaccinatedPatient.doseNo}
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label>
                      Dose Given Date: <span className="text-danger">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="doseGivenDate"
                      value={vaccinatedPatient.doseGivenDate}
                      className="form-control"
                      onChange={handleChange}
                      min={getTodayDateTime()}
                    />
                  </div>
                </div>
                <div className="col-lg-12">
                  <div className="form-group">
                    <label>Notes:</label>
                    <textarea
                      name="notes"
                      placeholder="Enter any notes"
                      value={vaccinatedPatient.notes}
                      className="form-control"
                      onChange={handleChange}
                      rows="2"
                    />
                  </div>
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

      <div
        className="modal fade"
        id="deleteVaccinatedPatient"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteVaccinatedPatient"
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
            <p>Are you sure want to delete this Vaccinated Patient?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteVaccinatedPatient}
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

export default VaccinatedPatients;