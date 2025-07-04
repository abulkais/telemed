import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import "../../assets/Documents.css";

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    patientId: "",
    invoiceDate: new Date().toISOString().slice(0, 10), // Default to current date
    discount: "", // Percentage discount
    status: "Paid",
    description: "",
  });

  const [items, setItems] = useState([
    { accountId: "", qty: 1, price: "", amount: 0 },
  ]);

  const [patients, setPatients] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [subTotal, setSubTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchInvoice = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/invoices/${id}`);
      const data = res.data;
      setInvoiceData({
        invoiceNumber: data.invoiceNumber,
        patientId: data.patientId,
        invoiceDate: data.invoiceDate,
        discount: data.discount || "",
        status: data.status,
        description: data.description,
      });
      // Parse items from JSON if it exists, otherwise initialize with default
      const initialItems = Array.isArray(data.items)
        ? data.items
        : [{ accountId: "", qty: 1, price: "", amount: 0 }];
      setItems(initialItems);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      toast.error("Failed to load invoice");
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/patients");
      setPatients(
        res.data.map((p) => ({
          value: p.id,
          label: `${p.firstName} ${p.lastName}`,
        }))
      );
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients");
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/accounts");
      setAccounts(res.data.map((a) => ({ value: a.id, label: a.account })));
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Failed to load accounts");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...invoiceData, [name]: value };
    setInvoiceData(updatedData);
    updateTotals(value); // Recalculate totals when discount changes
  };

  const updateTotals = (discount, updatedItems = items) => {
    const discountValue = parseFloat(discount) || 0;
    const subTotalValue = updatedItems.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0
    );
    const totalValue = subTotalValue - subTotalValue * (discountValue / 100);
    setSubTotal(subTotalValue);
    setTotalAmount(totalValue);
  };

  const addItem = () => {
    setItems([...items, { accountId: "", qty: 1, price: "", amount: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    if (
      !invoiceData.patientId ||
      !invoiceData.invoiceDate ||
      !invoiceData.status
    ) {
      toast.error("All required fields must be filled");
      return false;
    }
    if (items.every((item) => !item.accountId || !item.price)) {
      toast.error("At least one item must have an account and price");
      return false;
    }
    return true;
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]:
        field === "accountId"
          ? value.value
          : field === "qty"
          ? parseInt(value) || 1
          : parseFloat(value) || 0,
    };
    // Recalculate amount for the changed item
    const qty = parseInt(updatedItems[index].qty) || 1;
    const price = parseFloat(updatedItems[index].price) || 0;
    updatedItems[index].amount = qty * price;
    setItems(updatedItems);
    updateTotals(invoiceData.discount, updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const filteredItems = items.filter((item) => item.accountId && item.price);
    const payload = {
      ...invoiceData,
      items: filteredItems,
    };

    try {
      const response = await axios({
        method: isEditMode ? "put" : "post",
        url: `http://localhost:8080/api/invoices${isEditMode ? `/${id}` : ""}`,
        data: payload,
      });
      toast.success(
        `${isEditMode ? "Updated" : "Created"} invoice successfully`
      );
      setTimeout(() => navigate(`/invoices`), 2000);
    } catch (error) {
      console.error("Submission error:", error.response || error);
      const errorMessage =
        error.response?.data?.error || error.message || "Unknown error";
      toast.error(`Error saving invoice: ${errorMessage}`);
    }
  };

  // ... (rest of the code remains unchanged)
  useEffect(() => {
    fetchPatients();
    fetchAccounts();
    if (isEditMode) fetchInvoice();
    else
      setInvoiceData((prev) => ({
        ...prev,
        invoiceNumber: generateInvoiceNumber(),
      }));
  }, [isEditMode, id]);

  const generateInvoiceNumber = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

  return (
    <div className="container-fluid patients_fields">
      <ToastContainer />
      <div className="row">
        <div className="col-lg-12">
          <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 className="h4">
              {isEditMode ? "Edit Invoice" : "New Invoice"}
            </h1>
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/invoices")}
            >
              Back
            </button>
          </div>

          <div className="card p-4 border-0">
            <div className="row">
              <div className="form-group col-md-4">
                <label>
                  Invoice # <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  className="form-control"
                  readOnly
                />
              </div>
              <div className="form-group col-md-4">
                <label>
                  Patient <span className="text-danger">*</span>
                </label>
                <Select
                  options={patients}
                  value={patients.find(
                    (p) => p.value === invoiceData.patientId
                  )}
                  onChange={(selected) =>
                    setInvoiceData({
                      ...invoiceData,
                      patientId: selected.value,
                    })
                  }
                  placeholder="Select Patient"
                />
              </div>
              <div className="form-group col-md-4">
                <label>
                  Invoice Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  name="invoiceDate"
                  value={invoiceData.invoiceDate}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group col-md-4">
                <label>Discount (%)</label>
                <input
                  type="number"
                  name="discount"
                  value={invoiceData.discount}
                  className="form-control"
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  max="100"
                />
              </div>
              <div className="form-group col-md-4">
                <label>
                  Status <span className="text-danger">*</span>
                </label>
                <select
                  name="status"
                  value={invoiceData.status}
                  className="form-control"
                  onChange={handleInputChange}
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
              <div className="form-group col-md-4">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={invoiceData.description}
                  className="form-control"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <hr />
            <h6>Add Invoice Items</h6>
            <div className="row">
              <div className="col-md-12">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Account</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Amount</th>
                      <th>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={addItem}
                        >
                          Add
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <Select
                            options={accounts}
                            value={accounts.find(
                              (a) => a.value === item.accountId
                            )}
                            onChange={(selected) =>
                              handleItemChange(index, "accountId", selected)
                            }
                            placeholder="Select Account"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.qty}
                            className="form-control"
                            onChange={(e) =>
                              handleItemChange(index, "qty", e.target.value)
                            }
                            min="1"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="Price"
                            value={item.price}
                            className="form-control"
                            onChange={(e) =>
                              handleItemChange(index, "price", e.target.value)
                            }
                            step="0.01"
                            min="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.amount}
                            className="form-control"
                            readOnly
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                          >
                            <i className="fa fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Section */}
            <div className="row mt-4">
              <div className="col-md-12">
                <div className="d-flex justify-content-end">
                  <table
                    className="table table-borderless"
                    style={{ width: "auto" }}
                  >
                    <tbody>
                      <tr>
                        <td>
                          <strong>Sub Total:</strong>
                        </td>
                        <td>${subTotal}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Discount:</strong>
                        </td>
                        <td>
                          $
                          {(
                            (subTotal *
                              (parseFloat(invoiceData.discount) || 0)) /
                              100 || 0
                          ).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Total Amount:</strong>
                        </td>
                        <td>{totalAmount}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <button
                type="button"
                className="btn btn-primary mr-2 px-4"
                onClick={handleSubmit}
              >
                {isEditMode ? "Update" : "Save"}
              </button>
              <button
                type="button"
                className="btn btn-secondary px-4"
                onClick={() => navigate("/invoices")}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInvoice;
