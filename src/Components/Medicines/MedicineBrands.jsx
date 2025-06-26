import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/Documents.css";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const MedicineBrands = () => {
  const [brandsData, setBrandsData] = useState([]);
  const [excelLoading, setExcelLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [brand, setBrand] = useState({
    name: "",
    countryCode: "",
    phone: "",
    email: "",
  });
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState("MedicineBrands");

  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBrand((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!brand.name) {
      toast.error("Brand name is required");
      return false;
    }

  

    if (brand.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brand.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // const isDuplicate = brandsData.some(
    //   (brand) => brand.name.toLowerCase() === brand.name.toLowerCase()
    // );

    // if (isDuplicate && !editing) {
    //   toast.error("This Brand name already exists!");
    //   return;
    // }
    const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    const newId = String(brandsData.length + 1).padStart(2, "0");
    const brandId = String(brandsData.length + 1).padStart(2, "0");

    const newBrand = {
      ...brand,
      id: newId,
      brandId: brandId,
      created_at: currentDate,
    };

    try {
      if (editing) {
        await axios.put(
          `http://localhost:8080/api/medicineBrands/${editId}`,
          newBrand
        );
        toast.success("Brand Updated Successfully");
      } else {
        await axios.post(`http://localhost:8080/api/medicineBrands`, newBrand);
        toast.success("Brand Added Successfully");
      }

      fetchBrandsData();
      resetForm();
      $("#addBrand").modal("hide");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Error saving Brand");
    }
  };

  const resetForm = () => {
    setBrand({
      name: "",
      countryCode: "",
      phone: "",
      email: "",
    });
    setEditing(false);
    setEditId(null);
  };

  const fetchBrandsData = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/medicineBrands`);
      const sortedData = res.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setBrandsData(sortedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching Brands:", error);
      toast.error("Failed to load Brands");
    }
  };

  const deleteBrand = async () => {
    if (!deleteId) {
      toast.error("Invalid Brand ID!");
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8080/api/medicineBrands/${deleteId}`
      );
      setBrandsData((prev) => prev.filter((brand) => brand.id !== deleteId));
      toast.success("Brand deleted successfully!");
      $("#DeleteBrand").modal("hide");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting Brand!");
    }
  };

  const handleEdit = (brand) => {
    setEditing(true);
    setEditId(brand.id);
    setBrand({
      name: brand.name,
      phone: brand.phone,
      countryCode: brand.countryCode,
      email: brand.email,
    });
    $("#addBrand").modal("show");
  };

  const downloadCSV = () => {
    setExcelLoading(true);

    let dataToExport;
    let fileName;

    if (searchQuery) {
      dataToExport = brandsData.filter(filterBySearch);
      fileName = `Medicine_Brands_Filtered_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
    } else {
      dataToExport = brandsData;
      fileName = `Medicine_Brands_All_Data_${new Date()
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
        "ID": "ID",
        "Brand Name": "Brand Name",
        "Phone Number": "Phone Number",
        "Email ID": "Email ID",
        "Date & Time": "Date & Time",
      },
      ...dataToExport.map((brand, index) => ({
        "ID": index + 1,
        "Brand Name": brand.name,
        "Phone Number": `${brand.countryCode} ${brand.phone}`,
        "Email ID": brand.email,
        "Date": formatDate(brand.created_at),
      })),
    ];

    const worksheet = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 20 },
      { wch: 15 },
      { wch: 25 },
      { wch: 20 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Brands Report");
    XLSX.writeFile(workbook, fileName);
    setExcelLoading(false);
    toast.success(`Report downloaded (${dataToExport.length} records)`);
  };

  const filterBySearch = (brand) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      (brand.name && brand.name.toLowerCase().includes(searchLower)) ||
      (brand.phone && brand.phone.toLowerCase().includes(searchLower)) ||
      (brand.email && brand.email.toLowerCase().includes(searchLower))
    );
  };

  const filteredBrands = brandsData.filter(filterBySearch);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBrands.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);

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

  useEffect(() => {
    fetchBrandsData();
  }, []);

  return (
    <div>
      <ToastContainer />
      <div className="doctor-nav-buttons">
        <div className="nav_headings">
          <Link
            to="/medicnies-categories"
            className={`doctor-nav-btn ${
              filter === "MedicineCategories" ? "active" : ""
            }`}
            onClick={() => setFilter("MedicineCategories")}
          >
            <span className="btn-text">Medicine Categories</span>
          </Link>

          <Link
            to="/medicine-brands"
            className={`doctor-nav-btn ${
              filter === "MedicineBrands" ? "active" : ""
            }`}
            onClick={() => setFilter("MedicineBrands")}
          >
            <span className="btn-text">Medicine Brands</span>
          </Link>

          <Link
            to="/medicine"
            className={`doctor-nav-btn ${
              filter === "Medicine" ? "active" : ""
            }`}
            onClick={() => setFilter("Medicine")}
          >
            <span className="btn-text">Medicine</span>
          </Link>

          <Link
            to="/purchase-medicine"
            className={`doctor-nav-btn ${
              filter === "PurchaseMedicine" ? "active" : ""
            }`}
            onClick={() => setFilter("PurchaseMedicine")}
          >
            <span className="btn-text">Purchase Medicine</span>
          </Link>

          <Link
            to="/used-medicine"
            className={`doctor-nav-btn ${
              filter === "UsedMedicine" ? "active" : ""
            }`}
            onClick={() => setFilter("UsedMedicine")}
          >
            <span className="btn-text">Used Medicine</span>
          </Link>

          <Link
            to="/medicine-bills"
            className={`doctor-nav-btn ${
              filter === "MedicineBills" ? "active" : ""
            }`}
            onClick={() => setFilter("MedicineBills")}
          >
            <span className="btn-text">Medicine Bills</span>
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
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <button
            className="filter-btn filter-btn-primary"
            data-toggle="modal"
            data-target="#addBrand"
            onClick={resetForm}
          >
            New Medicine Brand
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
              <th>Brand Name</th>
              <th>Phone Number</th>
              <th>Email ID</th>
              <th>Date & Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((brand, index) => (
              <tr key={index}>
                <td>{indexOfFirstItem + index + 1}</td>
                <td>
                  <span className="badges bg-light-success">{brand.name}</span>
                </td>
                <td>{brand.countryCode} {brand.phone || "N/A"}</td>
                <td>{brand.email || "N/A"}</td>
                <td>
                  <div className="badges bg-light-info">
                    {formatDate(brand.created_at)}
                  </div>
                </td>
                <td>
                  <div
                    className="d-flex justify-center items-center"
                    style={{ justifyContent: "center" }}
                  >
                    <button className="btn" onClick={() => handleEdit(brand)}>
                      <i className="text-primary fa fa-edit fa-lg" />
                    </button>
                    <button
                      className="btn"
                      data-toggle="modal"
                      data-target="#DeleteBrand"
                      onClick={() => setDeleteId(brand.id)}
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
            {Math.min(indexOfLastItem, filteredBrands.length)} of{" "}
            {filteredBrands.length} results
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

      {/* Add/Edit Brand Modal */}
      <div
        className="modal fade document_modal"
        id="addBrand"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addBrand"
        aria-hidden="true"
      >
        <div
          className="modal-dialog modal-dialog-lg modal-center"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {editing ? "Edit Medicine Brand" : "New Medicine Brand"}
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
              <div className="form-group">
                <label>
                  Brand Name: <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Brand Name"
                  value={brand.name}
                  className="form-control"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number:</label>
                <div className="input-group">
                  <PhoneInput
                    country={"in"} // Default country (India)
                    value={brand.countryCode} // Bind to countryCode
                    onChange={(countryCode) =>
                      setBrand((prev) => ({
                        ...prev,
                        countryCode: `+${countryCode}`, // Store country code with +
                      }))
                    }
                    inputClass="form-control"
                    containerStyle={{ width: "15%" }}
                    inputStyle={{ width: "100%" }}
                    placeholder=""
                    enableSearch={true}
                    disableDropdown={false}
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={brand.phone}
                    className="form-control"
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    maxLength="10"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email ID:</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email ID"
                  value={brand.email}
                  className="form-control"
                  onChange={handleChange}
                />
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
        id="DeleteBrand"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="DeleteBrand"
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
            <p>Are you sure want to delete this Brand?</p>
            <div className="d-flex">
              <button
                className="btn btn-danger w-100 mr-1"
                onClick={deleteBrand}
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

export default MedicineBrands;
