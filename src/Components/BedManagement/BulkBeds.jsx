import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";

const BulkBeds = () => {
  const navigate = useNavigate();
  const [bedTypes, setBedTypes] = useState([]);
  const generateBedId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const [bedsData, setBedsData] = useState([
    {
      bed_id: generateBedId(), // Frontend-only unique ID
      name: "",
      bed_type_id: "",
      charge: "",
      description: "",
    },
  ]);

 
  const fetchBedTypes = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/bedTypes");
      setBedTypes(res.data);
    } catch (error) {
      console.error("Error fetching bed types:", error);
      toast.error("Failed to load bed types");
    }
  };

  useEffect(() => {
    fetchBedTypes();
  }, []);

  const handleBedTypeChange = (index, e) => {
    const newBeds = [...bedsData];
    newBeds[index].bed_type_id = e.target.value;
    setBedsData(newBeds);
  };

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const newBeds = [...bedsData];
    newBeds[index][name] = value;
    setBedsData(newBeds);
  };

  const addBedRow = () => {
    setBedsData((prev) => [
      ...prev,
      {
        bed_id: generateBedId(),
        name: "",
        bed_type_id: "",
        charge: "",
        description: "",
      },
    ]);
  };

  const removeBedRow = (index) => {
    const newBeds = bedsData.filter((_, i) => i !== index);
    setBedsData(newBeds);
  };

  const validateForm = () => {
    if (bedsData.length === 0) {
      toast.error("At least one bed must be added");
      return false;
    }
    for (const bed of bedsData) {
      if (!bed.name) {
        toast.error("All bed names must be provided");
        return false;
      }
      if (!bed.bed_type_id) {
        toast.error("All bed types must be selected");
        return false;
      }
      if (!bed.charge || parseFloat(bed.charge) <= 0) {
        toast.error("All charges must be greater than 0");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
    const bedsToSave = bedsData.map((bed) => ({
      name: bed.name,
      bed_type_id: bed.bed_type_id,
      charge: parseFloat(bed.charge),
      description: bed.description,
      created_at: currentDate,
    }));

    console.log("Payload being sent:", bedsToSave); // Debug log

    try {
      const response = await axios.post("http://localhost:8080/api/bulk-beds", bedsToSave);
      toast.success(`${bedsData.length} Beds Added Successfully`);
      navigate("/beds");
    } catch (error) {
      console.error("Submission error:", error.response?.data || error.message);
      toast.error(`Error saving beds: ${error.response?.data?.error || "Unknown error"}`);
    }
  };

  return (
    <div className="container-fluid">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-3">
            <h1 className="h4">New Bulk Bed</h1>
            <Link to="/beds" className="btn btn-primary px-4">
              Back
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="card p-4">
              <div className="row">
                <div className="col-lg-1">#</div>
                <div className="col-lg-2">
                  Bed Name<span className="text-danger">*</span>
                </div>
                <div className="col-lg-3">
                  Bed Type<span className="text-danger">*</span>
                </div>
                <div className="col-lg-2">
                  Charge<span className="text-danger">*</span>
                </div>
                <div className="col-lg-3">Description</div>
                <div className="col-lg-1">
                  <div className="d-flex justify-content-end mb-3">
                    <button type="button" className="btn btn-primary px-4" onClick={addBedRow}>
                      Add
                    </button>
                  </div>
                </div>
              </div>
              {bedsData.map((bed, index) => (
                <div key={bed.bed_id} className="row align-items-center mb-3">
                  <div className="col-lg-1">
                    <p>{index + 1}</p>
                  </div>
                  <div className="col-lg-2">
                    <input
                      type="text"
                      className="form-control"
                      value={bed.name}
                      name="name"
                      onChange={(e) => handleInputChange(index, e)}
                    />
                  </div>
                  <div className="col-lg-3">
                    <select
                      className="form-control"
                      value={bed.bed_type_id}
                      onChange={(e) => handleBedTypeChange(index, e)}
                    >
                      <option value="">Select Bed Type</option>
                      {bedTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-lg-2">
                    <input
                      type="number"
                      name="charge"
                      className="form-control"
                      value={bed.charge}
                      onChange={(e) => handleInputChange(index, e)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-lg-3">
                    <textarea
                      name="description"
                      className="form-control"
                      value={bed.description}
                      onChange={(e) => handleInputChange(index, e)}
                      rows="1"
                    />
                  </div>
                  <div className="col-lg-1">
                    <div className="d-flex align-items-end">
                      <button
                        type="button"
                        className="btn btn-link text-danger"
                        onClick={() => removeBedRow(index)}
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="d-flex justify-content-end mt-4">
                <button
                  type="submit"
                  className="btn btn-primary mr-2 px-4"
                  disabled={bedsData.length === 0}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary px-4"
                  onClick={() => navigate("/beds")}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BulkBeds;