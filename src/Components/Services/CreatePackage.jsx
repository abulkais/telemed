import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import Select from "react-select";
import DeleteIcon from "@mui/icons-material/Delete";

const CreatePackage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // id will be undefined for create, present for edit
  const isEditMode = !!id;

  // Package form state
  const [packageData, setPackageData] = useState({
    packageName: "",
    discount: "",
    description: "",
    services: [{ serviceId: "", quantity: 1, rate: "", amount: 0 }],
  });

  // Services state for dropdown
  const [services, setServices] = useState([]);

  // Fetch services for dropdown
  const fetchServices = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/servicesgetbyStatus");
      setServices(
        res.data.map((service) => ({
          value: service.id,
          label: service.serviceName,
          rate: service.rate || 0,
        }))
      );
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to load services");
    }
  };

  // Fetch package data for edit mode
  const fetchPackage = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/packages/${id}`);
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
    } catch (error) {
      console.error("Error fetching package:", error);
      toast.error("Failed to load package");
    }
  };

  useEffect(() => {
    fetchServices();
    if (isEditMode) fetchPackage();
  }, [id]);

  // Handle package input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPackageData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle service selection
  const handleServiceChange = (index, selectedOption) => {
    const newServices = [...packageData.services];
    newServices[index].serviceId = selectedOption ? selectedOption.value : "";
    newServices[index].rate = selectedOption ? selectedOption.rate : "";
    newServices[index].amount =
      newServices[index].quantity * (selectedOption ? selectedOption.rate : 0);
    setPackageData((prev) => ({ ...prev, services: newServices }));
  };

  // Handle quantity and rate changes
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

  // Add new service row
  const addServiceRow = () => {
    setPackageData((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        { serviceId: "", quantity: 1, rate: "", amount: 0 },
      ],
    }));
  };

  // Remove service row
  const removeServiceRow = (index) => {
    const newServices = packageData.services.filter((_, i) => i !== index);
    setPackageData((prev) => ({ ...prev, services: newServices }));
  };

  // Validate form
  const validateForm = () => {
    if (!packageData.packageName) {
      toast.error("Package name is required");
      return false;
    }
    if (!packageData.discount || isNaN(packageData.discount) || packageData.discount < 0 || packageData.discount > 100) {
      toast.error("Valid discount percentage (0-100) is required");
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
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    const packageToSave = {
      ...packageData,
      id: isEditMode ? id : String(Math.floor(Math.random() * 1000)).padStart(2, "0"),
      createdDateTime: isEditMode ? packageData.createdDateTime || currentDate : currentDate,
    };

    try {
      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/packages/${id}`, packageToSave);
        toast.success("Package updated successfully");
      } else {
        await axios.post("http://localhost:8080/api/packages", packageToSave);
        toast.success("Package added successfully");
      }
      navigate("/packages");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving package");
    }
  };

  return (
    <div className="container-fluid">
      <ToastContainer />
      <div className="row">
        {/* Main content */}
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">{isEditMode ? "Edit Package" : "New Package"}</h1>
            <button className="btn btn-primary px-4" onClick={() => navigate("/packages")}>
              Back
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="card p-4">
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label>
                    Package:<span className="text-danger"> *</span>
                  </label>
                  <input
                    type="text"
                    name="packageName"
                    placeholder="Package"
                    value={packageData.packageName}
                    className="form-control"
                    onChange={handleInputChange}
                    
                  />
                </div>
                <div className="form-group col-md-6">
                  <label>
                    Discount (%):<span className="text-danger"> *</span>
                  </label>
                  <input
                    type="number"
                    name="discount"
                    placeholder="In Percentage"
                    value={packageData.discount}
                    className="form-control"
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={packageData.description}
                  className="form-control"
                  onChange={handleInputChange}
                  rows="3"
                  
                />
              </div>
              <div className="mt-4">
                <div className="d-flex justify-content-between mb-4">
                <h6>Services</h6>
                <button
                  type="button"
                  className="btn btn-primary px-4"
                  onClick={addServiceRow}
                  
                >
                  Add
                </button>
                </div>
               
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Service <span className="text-danger">*</span></th>
                      <th>Qty <span className="text-danger">*</span></th>
                      <th>Rate <span className="text-danger">*</span></th>
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
                            placeholder="Select Service"
                            is
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
                            
                          />
                        </td>
                        <td>{service.amount.toFixed(2)}</td>
                        <td>
                          <button
                            className="btn btn-link text-danger"
                            onClick={() => removeServiceRow(index)}
                            
                          >
                            <DeleteIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
              </div>
              <div className="d-flex justify-content-end mt-4">
                <button type="submit" className="btn btn-primary mr-2 px-4" >
                  {isEditMode ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary px-3"
                  onClick={() => navigate("/packages")}
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

export default CreatePackage;