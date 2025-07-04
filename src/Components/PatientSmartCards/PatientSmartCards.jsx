import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Preloader from "../preloader";
import logo from "../../assets/images/logo.png";
import "../../assets/Patients.css";
import Pagination from "../Pagination";

const PatientSmartCards = () => {
  const [smartCards, setSmartCards] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#FF9800");
  const [deleteId, setDeleteId] = useState(null);
  const [viewCard, setViewCard] = useState(null);
  const [updateCard, setUpdateCard] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default to 10
  const smartCardRef = useRef(null);
  const baseurl = "http://localhost:8080";
  const [loading, setLoading] = useState(true);

  const fetchSmartCards = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/patientSmartCards"
      );
      setSmartCards(res.data);
    } catch (error) {
      console.error("Error fetching smart cards:", error);
      toast.error("Failed to load smart cards");

    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/getPatientsbyStatus"
      );
      const patientOptions = res.data.map((patient) => ({
        value: patient.id,
        label: `${patient.firstName} ${patient.lastName} - ${patient.email}`,
      }));
      setPatients(patientOptions);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    }
  };

  useEffect(() => {
    fetchSmartCards();
    fetchPatients();
  }, []);

  const handleCreateOrUpdateSmartCard = async () => {
    if (!selectedColor) {
      toast.error("Please select a background color");
      return;
    }

    if (updateCard) {
      // Update existing smart card
      try {
        await axios.put(
          `http://localhost:8080/api/patientSmartCards/${updateCard.id}`,
          {
            smartCardColor: selectedColor,
          }
        );
        toast.success("Smart card updated successfully");
        fetchSmartCards();
        $("#smartCardModal").modal("hide");
        setUpdateCard(null);
        setSelectedColor("#FF9800");
      } catch (error) {
        console.error("Error updating smart card:", error);
        toast.error("Failed to update smart card");
      }
    } else {
      // Create new smart card
      if (!selectedPatient) {
        toast.error("Please select a patient");
        return;
      }
      try {
        const res = await axios.post(
          "http://localhost:8080/api/patientSmartCards",
          {
            patientId: selectedPatient.value,
            smartCardColor: selectedColor,
          }
        );
        toast.success(res.data.message);
        fetchSmartCards();
        $("#smartCardModal").modal("hide");
        setSelectedPatient(null);
        setSelectedColor("#FF9800");
      } catch (error) {
        console.error("Error creating smart card:", error);
        toast.error(
          error.response?.data?.error || "Failed to create smart card"
        );
      }
    }
  };

  const handleView = async (card) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/patientSmartCards/${card.id}/qrcode`
      );
      setViewCard({ ...card, qrCode: res.data.qrCode });
      $("#viewSmartCard").modal("show");
    } catch (error) {
      console.error("Error fetching QR code:", error);
      toast.error("Failed to load smart card details");
    }
  };



  const downloadPDF = (patient) => {
    if (!patient || !smartCardRef.current) return;

    const input = smartCardRef.current;

    // Hide the download button
    const downloadBtn = input.querySelector(".smartCardDownload");
    if (downloadBtn) downloadBtn.style.display = "none";

    html2canvas(input, { scale: 3, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth(); // A4 width in mm
      const imgWidth = pageWidth; // Full width of the A4 page
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${patient.firstName}_${patient.patientUniqueId}_Smart_Card.pdf`);

      // Restore UI
      setTimeout(() => {
        input.style.backgroundColor = "#fff";
        if (downloadBtn) downloadBtn.style.display = "block";
      }, 1000);
    });
  };
  const handleUpdate = (card) => {
    setUpdateCard(card);
    setSelectedColor(card.smartCardColor);
    setSelectedPatient({
      value: card.id,
      label: `${card.firstName} ${card.lastName}`,
    });
    $("#smartCardModal").modal("show");
  };

  const handleDelete = async () => {
    if (!deleteId) {
      toast.error("Invalid Smart Card ID!");
      return;
    }

    setIsDeleting(true);
    try {
      await axios.delete(
        `http://localhost:8080/api/patientSmartCards/${deleteId}`
      );
      setSmartCards((prev) => prev.filter((card) => card.id !== deleteId));
      toast.success("Smart card deleted successfully!");
      $("#deleteSmartCard").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting smart card!");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredSmartCards = smartCards.filter(
    (card) =>
      card.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.phoneCountryCode
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      card.patientUniqueId?.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSmartCards.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredSmartCards.length / itemsPerPage);
  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
        <div className="nav_headings">

          <Link to="/patient-smart-cards" className="doctor-nav-btn active">
            <span className="btn-text">Patient Smart Cards</span>
          </Link>
        </div>
      </div>

      <div
        className="filter-bar-container"
        style={{ display: "flex", alignItems: "center", gap: "10px" }}
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
        <button
          className="filter-btn filter-btn-primary"
          data-toggle="modal"
          data-target="#smartCardModal"
          onClick={() => {
            setUpdateCard(null);
            setSelectedPatient(null);
            setSelectedColor("#FF9800");
          }}
        >
          New Patient Smart Card
        </button>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>S.N</th>
              <th>Patients</th>
              <th>Patient Unique ID</th>
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
              currentItems.map((card, index) => (
                <tr key={card.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      {card.profileImage ? (
                        <img
                          src={`${baseurl}${card.profileImage}`}
                          alt={`${card.firstName} ${card.lastName}`}
                          className="rounded-circle-profile"
                        />
                      ) : (
                        <div
                          className="rounded-circle-bgColor text-white d-flex align-items-center justify-content-center"
                          style={{ backgroundColor: card.smartCardColor }}
                        >
                          {card.firstName?.charAt(0)?.toUpperCase() || ""}
                          {card.lastName?.charAt(0)?.toUpperCase() || ""}
                        </div>
                      )}
                      <div className="flex-wrap">
                        <p className="mb-0" style={{ textAlign: "start" }}>
                          {card.firstName} {card.lastName}
                        </p>
                        <p className="mb-0">{card.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badges bg-light-info">
                      {card.patientUniqueId}
                    </span>
                  </td>
                  <td>
                    <div
                      className="d-flex justify-center items-center"
                      style={{ justifyContent: "center" }}
                    >
                      <button className="btn" onClick={() => handleView(card)}>
                        <VisibilityIcon className="text-info" />
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleUpdate(card)}
                      >
                        <i className="text-primary fa fa-edit fa-lg" />
                      </button>
                      <button
                        className="btn"
                        data-toggle="modal"
                        data-target="#deleteSmartCard"
                        onClick={() => setDeleteId(card.id)}
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
                  <p className="text-center">No data found.</p>
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
        className="modal fade"
        id="smartCardModal"
        tabIndex="-1"
        role="dialog"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-md modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {updateCard
                  ? "Update Patient Smart Card"
                  : "Generate Patient Smart Card"}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Patient</label>
                <Select
                  options={patients}
                  value={selectedPatient}
                  onChange={setSelectedPatient}
                  placeholder="Select a patient"
                  isDisabled={updateCard} // Disable patient selection for updates
                />
              </div>
              <div className="form-group">
                <label>Background Color</label>
                <input
                  type="color"
                  className="form-control"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  style={{ height: "38px", padding: "0" }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary px-3"
                data-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateOrUpdateSmartCard}
              >
                {updateCard ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="viewSmartCard"
        tabIndex="-1"
        role="dialog"
        aria-hidden="true"
      >
        <div
          className="modal-dialog"
          role="document"
          style={{ maxWidth: "700px" }}
        >
          <div
            className="modal-content text-center"
            id="smartCard"
            ref={smartCardRef}
          >
            <div
              className="modal-header text-white d-flex justify-content-between smart-card-header align-items-center"
              style={{
                padding: 15,
                backgroundColor: viewCard ? viewCard.smartCardColor : "#1976d2",
                boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
              }}
            >
              <div className="flex-1 d-flex align-items-center me-3">
                <div className="logo me-4 mr-3">
                  <img
                    src="https://infyhms.sgp1.cdn.digitaloceanspaces.com/638/Graphics.png"
                    alt="logo"
                    style={{ height: 40 }}
                  />
                </div>
                <h4 className="text-white mb-0 fw-bold">HMS</h4>
              </div>
              <div className="d-flex text-end">
                <address className="text-white fs-12 mb-0">
                  <p className="mb-0" style={{ textAlign: "end" }}>
                    {viewCard && viewCard.address1}
                  </p>
                </address>
              </div>
            </div>
            <div className="modal-body">
              {viewCard && (
                <div className="d-flex align-items-center">
                  {viewCard.profileImage ? (
                    <img
                      src={`${baseurl}${viewCard.profileImage}`}
                      alt={`${viewCard.firstName} ${viewCard.lastName}`}
                      className="rounded-circle"
                      style={{
                        width: "100px",
                        height: "100px",
                        backgroundColor: viewCard
                          ? viewCard.smartCardColor
                          : "#1976d2",
                        fontSize: "2.5rem",
                        fontWeight: "normal",
                      }}
                    />
                  ) : (
                    <div
                      className="rounded-circle text-white d-flex align-items-center justify-content-center"
                      style={{
                        width: "100px",
                        height: "100px",
                        backgroundColor: "#fff",
                        color: viewCard.smartCardColor,
                        fontSize: "2.5rem",
                        fontWeight: "normal",
                      }}
                    >
                      {`${viewCard.firstName} ${viewCard.lastName}`
                        .split(" ")
                        .map((word) => word.charAt(0))
                        .join("")
                        .toUpperCase()}
                    </div>
                  )}
                  <div className="ml-3" style={{ textAlign: "left" }}>
                    <p className="mb-1">
                      Patient Name: {viewCard.firstName} {viewCard.lastName}
                    </p>
                    {viewCard.email && (
                      <p className="mb-1">Email: {viewCard.email}</p>
                    )}
                    <p className="mb-1">
                      Phone: {viewCard.phoneCountryCode} {viewCard.phoneNumber}
                    </p>
                    {viewCard.dateOfBirth && (
                      <p className="mb-1">
                        DOB:{" "}
                        {new Date(viewCard.dateOfBirth).toLocaleDateString()}
                      </p>
                    )}
                    {viewCard.bloodGroup && (
                      <p className="mb-1">Blood Group: {viewCard.bloodGroup}</p>
                    )}
                  </div>
                  <div className="ml-auto text-center">
                    <img
                      src={viewCard.qrCode}
                      alt="QR Code"
                      style={{ width: "100px", height: "100px" }}
                    />
                    {viewCard.patientUniqueId && (
                      <p className="mb-1">{viewCard.patientUniqueId}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer smartCardDownload">
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
              >
                Close
              </button>
              {viewCard && (
                <button
                  className="btn btn-sm"
                  style={{
                    width: "50px",
                    margin: "0 auto",
                    backgroundColor: viewCard.smartCardColor || "#1976d2",
                    color: "#fff",
                  }}
                  onClick={() => downloadPDF(viewCard)}
                >
                  <DownloadIcon />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div
        className="modal fade"
        id="deleteSmartCard"
        tabIndex="-1"
        role="dialog"
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
                alt="Remove Icon"
              />
            </span>
            <h2>Delete</h2>
            <p>Are you sure you want to delete this smart card?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={handleDelete}
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

export default PatientSmartCards;
