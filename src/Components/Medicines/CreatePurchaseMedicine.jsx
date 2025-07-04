


import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const CreatePurchaseMedicine = () => {
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [lotNo, setLotNo] = useState("");
  const [expiryDate, setExpiryDate] = useState(null);
  const [salePrice, setSalePrice] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tax, setTax] = useState(0);
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [total, setTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("fixed"); // 'fixed' or 'percentage'
  const [taxAmount, setTaxAmount] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [purchaseItems, setPurchaseItems] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.pathname.includes("edit");
  const purchaseId = location.pathname.split("/").pop();

  useEffect(() => {
    fetchMedicines();
    if (isEditMode) fetchPurchaseData();
  }, []);

  useEffect(() => {
    if (selectedMedicine) {
      const medicine = medicines.find((m) => m.id === selectedMedicine);
      if (medicine) {
        setSalePrice(parseFloat(medicine.sellingPrice));
        setPurchasePrice(parseFloat(medicine.buyingPrice));
      }
    }
  }, [selectedMedicine, medicines]);

  // Calculate AMOUNT (purchasePrice * quantity) and TAX AMOUNT
  useEffect(() => {
    const calculatedAmount = purchasePrice * quantity;
    setAmount(calculatedAmount);
    const calculatedTaxAmount = (calculatedAmount * tax) / 100;
    setTaxAmount(calculatedTaxAmount);
  }, [purchasePrice, quantity, tax]);

  // Calculate TOTAL (including tax) and NET AMOUNT (Total - Discount)
  useEffect(() => {
    const currentTotal = amount + taxAmount; // Total = Amount + Tax
    setTotal(currentTotal);

    let calculatedDiscount = discount;
    if (discountType === "percentage") {
      calculatedDiscount = (currentTotal * discount) / 100;
    }
    const calculatedNetAmount = currentTotal - calculatedDiscount;
    setNetAmount(calculatedNetAmount);
  }, [amount, taxAmount, discount, discountType]);


  const fetchMedicines = async () => {
    try {
      const res = await axios.get("http://localhost:8080/medicines");
      setMedicines(res.data);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      toast.error("Failed to load medicines");
    }
  };

  const fetchPurchaseData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/purchaseMedicines/${purchaseId}`
      );
      const data = res.data;
      setPurchaseItems(data.items || [data]);
      setNote(data.note || "");
      setDiscount(data.discount || 0);
      setPaymentMode(data.paymentMode || "");
      setPaymentNote(data.paymentNote || "");
    } catch (error) {
      console.error("Error fetching purchase data:", error);
      toast.error("Failed to load purchase data");
    }
  };

  const calculateAmount = () => {
    const calculatedAmount = purchasePrice * quantity;
    setAmount(calculatedAmount);

    const calculatedTaxAmount = (calculatedAmount * tax) / 100;
    setTaxAmount(calculatedTaxAmount);
  };

  const calculateTotals = () => {
    const itemsTotal = purchaseItems.reduce(
      (sum, item) => sum + item.purchasePrice * item.quantity,
      0
    );
    const itemsTax = purchaseItems.reduce(
      (sum, item) =>
        sum + (item.purchasePrice * item.quantity * item.tax) / 100,
      0
    );

    const calculatedTotal = itemsTotal + itemsTax;
    setTotal(calculatedTotal);

    let calculatedDiscount = discount;
    if (discountType === "percentage") {
      calculatedDiscount = (calculatedTotal * discount) / 100;
    }

    const calculatedNetAmount = calculatedTotal - calculatedDiscount;
    setNetAmount(calculatedNetAmount);
  };

  const handleAddItem = () => {
    if (!selectedMedicine || !lotNo || !expiryDate || quantity <= 0) {
      toast.error("Please fill all required fields");
      return;
    }

    const medicine = medicines.find((m) => m.id === selectedMedicine);
    const newItem = {
      medicineId: selectedMedicine,
      medicineName: medicine?.name || "",
      batchNumber: lotNo,
      expiryDate: expiryDate,
      salePrice: salePrice,
      purchasePrice: purchasePrice,
      quantity: quantity,
      tax: tax,
      amount: amount,
    };

    setPurchaseItems([...purchaseItems, newItem]);
    resetItemFields();
  };

  const resetItemFields = () => {
    setSelectedMedicine("");
    setLotNo("");
    setExpiryDate(null);
    setSalePrice(0);
    setPurchasePrice(0);
    setQuantity(1);
    setTax(0);
    setAmount(0);
  };

  const handleDeleteItem = (index) => {
    const updatedItems = [...purchaseItems];
    updatedItems.splice(index, 1);
    setPurchaseItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (purchaseItems.length === 0) {
      toast.error("Please add at least one medicine");
      return;
    }

    if (!paymentMode) {
      toast.error("Please select payment mode");
      return;
    }

    try {
      const purchaseData = {
        items: purchaseItems,
        note,
        total,
        discount,
        discountType,
        taxAmount,
        netAmount,
        paymentMode,
        paymentNote,
        purchaseDate: new Date().toISOString(),
      };

      if (isEditMode) {
        await axios.put(
          `http://localhost:8080/purchaseMedicines/${purchaseId}`,
          purchaseData
        );
        toast.success("Purchase updated successfully!");
      } else {
        await axios.post(
          "http://localhost:8080/purchaseMedicines",
          purchaseData
        );
        toast.success("Purchase created successfully!");
      }
      navigate("/purchase-medicine");
    } catch (error) {
      console.error("Error saving purchase:", error);
      toast.error("Failed to save purchase");
    }
  };


  return (
    <div className="container-fluid purchase-form-container">
      <ToastContainer />
      <h4 className="mb-0">{isEditMode ? "Edit Purchase" : "Purchase Medicine"}</h4>

      <form onSubmit={handleSubmit}>
        <div className="row mb-4">
          <div className="col-md-12">
            <div className="custom-table-responsive mt-3">
              <table className="table custom-table-striped custom-table table-hover text-center">
                <thead className="thead-light">
                  <tr>
                    <th>MEDICINES <span className="text-danger">*</span></th>
                    <th>LOT NO. <span className="text-danger">*</span></th>
                    <th>EXPIRY DATE <span className="text-danger">*</span></th>
                    <th>SALE PRICE <span className="text-danger">*</span></th>
                    <th>PURCHASE PRICE <span className="text-danger">*</span></th>
                    <th>QTY <span className="text-danger">*</span></th>
                    <th>TAX%</th>
                    <th>AMOUNT</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Existing items */}
                  {purchaseItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.medicineName}</td>
                      <td>{item.batchNumber}</td>
                      <td>{new Date(item.expiryDate).toLocaleDateString()}</td>
                      <td>{item.salePrice.toFixed(2)}</td>
                      <td>{item.purchasePrice.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>{item.tax}%</td>
                      <td>{(item.purchasePrice * item.quantity).toFixed(2)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteItem(index)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Form for new item */}
                  <tr>
                    <td>
                      <select
                        className="form-control"
                        value={selectedMedicine}
                        onChange={(e) => setSelectedMedicine(e.target.value)}
                        required
                      >
                        <option value="">Select Medicine</option>
                        {medicines.map((medicine) => (
                          <option key={medicine.id} value={medicine.id}>
                            {medicine.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        value={lotNo}
                        onChange={(e) => setLotNo(e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <DatePicker
                        selected={expiryDate}
                        onChange={(date) => setExpiryDate(date)}
                        className="form-control"
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Expiry Date"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={salePrice}
                        onChange={(e) => setSalePrice(parseFloat(e.target.value))}
                        min="0"
                        step="0.01"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(parseFloat(e.target.value))}
                        min="0"
                        step="0.01"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        min="1"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={tax}
                        onChange={(e) => setTax(parseFloat(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={amount.toFixed(2)}
                        readOnly
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary btn-block"
                        onClick={handleAddItem}
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="form-row mt-3">
              <div className="form-group col-md-6">
                <label>Note</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
              </div>
              <div className="col-md-6">
                <div className="purchase-summary p-3 border rounded bg-light">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="font-weight-bold">Total <span className="text-danger">*</span></span>
                    <span>{total.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Discount</span>
                    <div className="input-group" style={{ width: '200px' }}>
                      <input
                        type="number"
                        className="form-control"
                        value={discount}
                        onChange={(e) => setDiscount(parseFloat(e.target.value))}
                        min="0"
                        step="0.01"
                      />
                      <div className="input-group-append">
                        <select
                          className="form-control"
                          value={discountType}
                          onChange={(e) => setDiscountType(e.target.value)}
                        >
                          <option value="fixed">₹</option>
                          <option value="percentage">%</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax Amount</span>
                    <span>{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="font-weight-bold">Net Amount <span className="text-danger">*</span></span>
                    <span className="font-weight-bold">{netAmount.toFixed(2)}</span>
                  </div>
                  <div className="form-group">
                    <label className="font-weight-bold">
                      Payment Mode <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-control"
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      required
                    >
                      <option value="">Payment Mode</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="UPI">UPI</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Payment Note</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12 text-right">
            <button
              type="button"
              className="btn btn-secondary mr-2"
              onClick={() => navigate("/purchase-medicine")}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditMode ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePurchaseMedicine;