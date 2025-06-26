import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Select from "react-select";

const NewBed = ({ onClose, onSave }) => {
  const [bedData, setBedData] = useState({
    bedId: "",
    bedTypeId: "",
    charge: "",
    description: "",
  });
  const [bedTypes, setBedTypes] = useState([]);

  // Fetch bed types for dropdown
  const fetchBedTypes = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/bed-types");
      setBedTypes(
        res.data.map((type) => ({
          value: type.id,
          label: type.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching bed types:", error);
      toast.error("Failed to load bed types");
    }
  };

  useEffect(() => {
    fetchBedTypes();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBedData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle bed type selection
  const handleBedTypeChange = (selectedOption) => {
    setBedData((prev) => ({
      ...prev,
      bedTypeId: selectedOption ? selectedOption.value : "",
    }));
  };

  // Validate and submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bedData.bedId || !bedData.bedTypeId || !bedData.charge) {
      toast.error("All required fields must be filled");
      return;
    }
    if (isNaN(bedData.charge) || bedData.charge <= 0) {
      toast.error("Charge must be a number greater than 0");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/beds", bedData);
      toast.success("Bed added successfully");
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving bed:", error);
      toast.error("Failed to save bed");
    }
  };

  return (
    <div
      className="modal"
      style={{
        display: "block",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1050,
      }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">New Bed</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <ToastContainer />
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  Bed:<span className="text-danger"> *</span>
                </label>
                <input
                  type="text"
                  name="bedId"
                  placeholder="Bed"
                  value={bedData.bedId}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group mt-3">
                <label>
                  Bed Type:<span className="text-danger"> *</span>
                </label>
                <Select
                  options={bedTypes}
                  value={bedTypes.find((opt) => opt.value === bedData.bedTypeId)}
                  onChange={handleBedTypeChange}
                  placeholder="Select Bed Type"
                />
              </div>
              <div className="form-group mt-3">
                <label>
                  Charge:<span className="text-danger"> *</span>
                </label>
                <input
                  type="number"
                  name="charge"
                  placeholder="Charge"
                  value={bedData.charge}
                  className="form-control"
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              <div className="form-group mt-3">
                <label>Description:</label>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={bedData.description}
                  className="form-control"
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="d-flex justify-content-end mt-4">
                <button type="submit" className="btn btn-primary mr-2 px-4">
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBed;