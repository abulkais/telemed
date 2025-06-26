import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import DeleteIcon from "@mui/icons-material/Delete";

const CreateInsurances = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [insuranceData, setInsuranceData] = useState({
    insuranceName: "",
    serviceTax: "",
    insuranceNo: "",
    insuranceCode: "",
    hospitalRate: "",
    discount: 0,
    remark: "",
    status: true,
    diseases: [{ diseaseName: "", diseaseCharge: "" }],
  });

  const fetchInsurance = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/insurances/${id}`);
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
    } catch (error) {
      console.error("Error fetching insurance:", error);
      toast.error("Failed to load insurance");
    }
  };

  useEffect(() => {
    if (isEditMode) fetchInsurance();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInsuranceData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDiseaseChange = (index, e) => {
    const { name, value } = e.target;
    const newDiseases = [...insuranceData.diseases];
    newDiseases[index][name] = value;
    setInsuranceData((prev) => ({ ...prev, diseases: newDiseases }));
  };

  const addDiseaseRow = () => {
    setInsuranceData((prev) => ({
      ...prev,
      diseases: [...prev.diseases, { diseaseName: "", diseaseCharge: "" }],
    }));
  };

  const removeDiseaseRow = (index) => {
    const newDiseases = insuranceData.diseases.filter((_, i) => i !== index);
    setInsuranceData((prev) => ({ ...prev, diseases: newDiseases }));
  };

  const validateForm = () => {
    if (!insuranceData.insuranceName) {
      toast.error("Insurance name is required");
      return false;
    }
    if (!insuranceData.serviceTax || isNaN(insuranceData.serviceTax) || insuranceData.serviceTax < 0) {
      toast.error("Valid service tax is required");
      return false;
    }
    if (!insuranceData.insuranceNo) {
      toast.error("Insurance number is required");
      return false;
    }
    if (!insuranceData.insuranceCode) {
      toast.error("Insurance code is required");
      return false;
    }
    if (!insuranceData.hospitalRate || isNaN(insuranceData.hospitalRate) || insuranceData.hospitalRate < 0) {
      toast.error("Valid hospital rate is required");
      return false;
    }
    if (insuranceData.diseases.some((d) => !d.diseaseName)) {
      toast.error("All disease names must be filled");
      return false;
    }
    if (insuranceData.diseases.some((d) => !d.diseaseCharge || isNaN(d.diseaseCharge) || d.diseaseCharge < 0)) {
      toast.error("All disease charges must be valid and greater than 0");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const total = insuranceData.diseases.reduce((sum, d) => sum + parseFloat(d.diseaseCharge || 0), 0);
    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
    const insuranceToSave = {
      ...insuranceData,
      id: isEditMode ? id : String(Math.floor(Math.random() * 1000)).padStart(2, "0"),
      total: total,
      createdDateTime: isEditMode ? insuranceData.createdDateTime || currentDate : currentDate,
    };

    try {
      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/insurances/${id}`, insuranceToSave);
        toast.success("Insurance updated successfully");
      } else {
        await axios.post("http://localhost:8080/api/insurances", insuranceToSave);
        toast.success("Insurance added successfully");
      }
      navigate("/insurances");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving insurance");
    }
  };

  return (
    <div className="container-fluid">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">{isEditMode ? "Edit Insurance" : "New Insurance"}</h1>
            <button className="btn btn-primary px-4" onClick={() => navigate("/insurances")}>
              Back
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="card p-4 border-0">
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label>
                    Insurance: <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="insuranceName"
                    placeholder="Insurance"
                    value={insuranceData.insuranceName}
                    className="form-control"
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group col-md-6">
                  <label>
                    Service Tax: <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="serviceTax"
                    placeholder="Service Tax"
                    value={insuranceData.serviceTax}
                    className="form-control"
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label>
                    Insurance No: <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="insuranceNo"
                    placeholder="Insurance No"
                    value={insuranceData.insuranceNo}
                    className="form-control"
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group col-md-6">
                  <label>
                    Insurance Code: <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="insuranceCode"
                    placeholder="Insurance Code"
                    value={insuranceData.insuranceCode}
                    className="form-control"
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label>
                    Hospital Rate: <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="hospitalRate"
                    placeholder="Hospital Rate"
                    value={insuranceData.hospitalRate}
                    className="form-control"
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
                <div className="form-group col-md-6">
                  <label>Discount: (In Percentage(%))</label>
                  <input
                    type="number"
                    name="discount"
                    placeholder="In Percentage"
                    value={insuranceData.discount}
                    className="form-control"
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label>Remark:</label>
                  <textarea
                    name="remark"
                    placeholder="Remark"
                    value={insuranceData.remark}
                    className="form-control"
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
                <div className="form-group col-md-6">
                  <label>Status:</label> <br />
                  <label className="switch">
                    <input
                      type="checkbox"
                      name="status"
                      checked={insuranceData.status}
                      onChange={handleInputChange}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
              <div className="mt-4">
                <div className="d-flex justify-content-between mb-4">
                  <h6>Disease Details</h6>
                  <button type="button" className="btn btn-primary px-4" onClick={addDiseaseRow}>
                    Add
                  </button>
                </div>
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Diseases Name <span className="text-danger">*</span></th>
                      <th>Diseases Charge <span className="text-danger">*</span></th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insuranceData.diseases.map((disease, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <input
                            type="text"
                            name="diseaseName"
                            placeholder="Diseases Name"
                            value={disease.diseaseName}
                            className="form-control"
                            onChange={(e) => handleDiseaseChange(index, e)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            name="diseaseCharge"
                            placeholder="Diseases Charge"
                            value={disease.diseaseCharge}
                            className="form-control"
                            onChange={(e) => handleDiseaseChange(index, e)}
                            min="0"
                          />
                        </td>
                        <td>
                          <button className="btn btn-link text-danger" onClick={() => removeDiseaseRow(index)}>
                            <DeleteIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="d-flex justify-content-end">
                  <span>Total Amount: ${insuranceData.diseases.reduce((sum, d) => sum + parseFloat(d.diseaseCharge || 0), 0).toFixed(2)}</span>
                </div>
              </div>
              <div className="d-flex justify-content-end mt-4">
                <button type="submit" className="btn btn-primary mr-2 px-4">
                  {isEditMode ? "Update" : "Save"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate("/insurances")}>
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

export default CreateInsurances;