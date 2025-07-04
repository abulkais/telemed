import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import Select from "react-select";
import { Link } from "react-router-dom";

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [patients, setPatients] = useState([]);
  const [documentData, setDocumentData] = useState({
    title: "",
    documentId: "",
    patientId: "",
    attachment: null,
    Notes: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const baseUrl = "http://localhost:8080";
  // Fetch documents, document types, and patients
  const fetchDocuments = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/documents");
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setDocuments(sortedData);
    } catch (error) {
      console.error("Error fetching Documents:", error);
      toast.error("Failed to load Documents");
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/documentTypes");
      setDocumentTypes(
        res.data.map((type) => ({
          value: type.id,
          label: type.name, // Assuming the document type has a 'name' field
        }))
      );
    } catch (error) {
      console.error("Error fetching Document Types:", error);
      toast.error("Failed to load Document Types");
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/patients");
      setPatients(
        res.data.map((patient) => ({
          value: patient.id,
          label: `${patient.firstName} ${patient.lastName} (${patient.email})`, // Combine firstName, lastName, and email
        }))
      );
    } catch (error) {
      console.error("Error fetching Patients:", error);
      toast.error("Failed to load Patients");
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchDocumentTypes();
    fetchPatients();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDocumentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setDocumentData((prev) => ({
      ...prev,
      attachment: e.target.files[0],
    }));
  };

  const handleDocumentTypeChange = (selectedOption) => {
    setDocumentData((prev) => ({
      ...prev,
      documentId: selectedOption ? selectedOption.value : "",
    }));
  };

  const handlePatientChange = (selectedOption) => {
    setDocumentData((prev) => ({
      ...prev,
      patientId: selectedOption ? selectedOption.value : "",
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!documentData.title) {
      toast.error("Title is required");
      return false;
    }
    if (!documentData.documentId) {
      toast.error("Please select a Document Type");
      return false;
    }
    if (!documentData.patientId) {
      toast.error("Please select a Patient");
      return false;
    }
    if (!editing && !documentData.attachment) {
      toast.error("Attachment is required");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("title", documentData.title);
    formData.append("documentId", documentData.documentId);
    formData.append("patientId", documentData.patientId);
    if (documentData.attachment) {
      formData.append("attachment", documentData.attachment);
    }
    formData.append("Notes", documentData.Notes);

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/documents/${editId}`,
          formData
        );
        toast.success("Document Updated Successfully");
      } else {
        await axios.post("http://localhost:8080/api/documents", formData);
        toast.success("Document Added Successfully");
      }
      fetchDocuments();
      resetForm();
      $("#addDocument").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving Document");
    }
  };

  const resetForm = () => {
    setDocumentData({
      title: "",
      documentId: "",
      patientId: "",
      attachment: null,
      Notes: "",
    });
    setEditing(false);
    setEditId(null);
  };

  // Handle delete
  const deleteDocument = async () => {
    if (!deleteId) {
      toast.error("Invalid Document ID!");
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/api/documents/${deleteId}`);
      setDocuments((prev) => prev.filter((item) => item.id !== deleteId));
      toast.success("Document deleted successfully!");
      $("#deleteDocument").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Document!");
    }
  };

  // Handle edit
  const handleEdit = (item) => {
    setEditing(true);
    setEditId(item.id);
    setDocumentData({
      title: item.title,
      documentId: item.documentId,
      patientId: item.patientId,
      attachment: null, // Attachment is optional on edit
      Notes: item.Notes,
    });
    $("#addDocument").modal("show");
  };

  // Handle download
  const handleDownload = (id, fileName) => {
    axios({
      url: `http://localhost:8080/api/documents/download/${id}`,
      method: "GET",
      responseType: "blob",
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        // Use the original file name from the database
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(() => toast.error("Error downloading file!"));
  };

  // Handle image preview
  const handleImagePreview = (attachment) => {
    setPreviewImage(attachment);
    $("#imagePreviewModal").modal("show");
  };

  const filterBySearch = (item) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return `${item.patientFirstName} ${item.patientLastName}`
      .toLowerCase()
      .includes(searchLower);
  };

  const filteredDocuments = documents.filter(filterBySearch);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link to="/documents" className="doctor-nav-btn active">
            Documents
          </Link>
          <Link to="/documnets-types" className="doctor-nav-btn">
            Documents Categories
          </Link>
        </div>
      </div>
      <div className="filter-bar-container">
        <div className="filter-search-box">
          <input
            type="text"
            className="form-control"
            placeholder="Search"
            style={{ width: "250px" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <button
            className="filter-btn filter-btn-primary"
            data-toggle="modal"
            data-target="#addDocument"
            onClick={resetForm}
          >
            New Document
          </button>
        </div>
      </div>

      <div className="custom-table-responsive">
        <table className="table custom-table-striped custom-table table-hover text-center">
          <thead className="thead-light">
            <tr>
              <th>S.N</th>

              <th>Document Type</th>
              <th>Patient</th>
              <th>Attachment</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>

                <td>
                  <span className="badges bg-light-info">{item.name}</span>
                </td>

                <td>
                  <div className="d-flex align-items-center">
                    {item.patientImgUrl ? (
                      <img
                        src={`${baseUrl}${item.patientImgUrl}`}
                        alt={`${item.patientFirstName} ${item.patientLastName}`}
                        className="rounded-circle-profile "
                      />
                    ) : (
                      <div className="rounded-circle-bgColor text-white d-flex align-items-center justify-content-center">
                        {item.patientFirstName?.charAt(0)?.toUpperCase() || ""}
                        {item.patientLastName?.charAt(0)?.toUpperCase() || ""}
                      </div>
                    )}
                    <div className="flex-wrap">
                      <p className="mb-0" style={{ textAlign: "start" }}>
                        {item.patientFirstName} {item.patientLastName}
                      </p>
                      <p className="mb-0">{item.patientEmail}</p>
                    </div>
                  </div>
                </td>
                <td>
                  {item.attachment ? (
                    <a
                      href={`http://localhost:8080/${item.attachment}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={item.attachment.split("/").pop()}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          opacity="0.3"
                          d="M19 22H5C4.4 22 4 21.6 4 21V3C4 2.4 4.4 2 5 2H14L20 8V21C20 21.6 19.6 22 19 22Z"
                          fill="black"
                        ></path>
                        <path
                          d="M15 8H20L14 2V7C14 7.6 14.4 8 15 8Z"
                          fill="black"
                        ></path>
                      </svg>
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>
                  <span className="badges bg-light-info lh-lg">
                    {formatTime(item.created_at)}
                    <br />
                    {formatDate(item.created_at)}
                  </span>
                </td>
                <td>
                  <div className="d-flex justify-content-center align-items-center">
                    <button className="btn" onClick={() => handleEdit(item)}>
                      <i className="text-primary fa fa-edit fa-lg" />
                    </button>
                    <button
                      className="btn"
                      data-toggle="modal"
                      data-target="#deleteDocument"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <DeleteIcon className="text-danger" />
                    </button>
                    {item.attachment && (
                      <button
                        className="btn"
                        onClick={() =>
                          handleDownload(
                            item.id,
                            item.attachment.split("/").pop()
                          )
                        }
                      >
                        <DownloadIcon className="text-success" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Document Modal */}
      <div
        className="modal fade document_modal"
        id="addDocument"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addDocument"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-lg modal-center"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Document" : "New Document"}
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
              <div className="form-group">
                <label>
                  Title: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter Title"
                  value={documentData.title}
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>
                  Document Type: <span className="text-danger">*</span>
                </label>
                <Select
                  options={documentTypes}
                  value={documentTypes.find(
                    (opt) => opt.value === documentData.documentId
                  )}
                  onChange={handleDocumentTypeChange}
                  className="basic-single"
                  classNamePrefix="select"
                  isClearable
                  placeholder="Select Document Type"
                />
              </div>
              <div className="form-group">
                <label>
                  Patient: <span className="text-danger">*</span>
                </label>
                <Select
                  options={patients}
                  value={patients.find(
                    (opt) => opt.value === documentData.patientId
                  )}
                  onChange={handlePatientChange}
                  className="basic-single"
                  classNamePrefix="select"
                  isClearable
                  placeholder="Select Patient"
                />
              </div>
              <div className="form-group">
                <label>
                  Attachment:{" "}
                  {editing ? "" : <span className="text-danger">*</span>}
                </label>
                <input
                  type="file"
                  name="attachment"
                  className="form-control"
                  onChange={handleFileChange}
                />
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="Notes"
                  placeholder="Enter Notes"
                  value={documentData.Notes}
                  className="form-control"
                  onChange={handleChange}
                  rows="3"
                />
              </div>
              <div className="d-flex align-items-center justify-content-end mt-4">
                <button className="btn btn-primary mr-3" onClick={handleSubmit}>
                  {editing ? "Update" : "Save"}
                </button>
                <button
                  className="btn btn-secondary px-4"
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

      {/* Delete Document Modal */}
      <div
        className="modal fade"
        id="deleteDocument"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="deleteDocument"
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
            <p>Are you sure you want to delete this Document?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteDocument}
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

      {/* Image Preview Modal */}
      <div
        className="modal fade"
        id="imagePreviewModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="imagePreviewModal"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Image Preview</h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                onClick={() => setPreviewImage(null)}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body text-center">
              {previewImage && (
                <img
                  src={`http://localhost:8080/${previewImage}`}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: "500px" }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
