import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EditPurchaseMedicine = () => {
  const { id } = useParams();
  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [lotNo, setLotNo] = useState("");
  const [expiryDate, setExpiryDate] = useState(null);
  const [salePrice, setSalePrice] = useState(0);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [tax, setTax] = useState(0);
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState("");
  const [total, setTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMedicines();
    fetchPurchase();
  }, []);

  useEffect(() => {
    calculateAmount();
  }, [purchasePrice, quantity, tax, discount]);

  const fetchMedicines = async () => {
    try {
      const res = await axios.get("http://localhost:8080/medicines");
      setMedicines(res.data);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      toast.error("Failed to load medicines");
    }
  };

  const fetchPurchase = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/purchaseMedicines/${id}`);
      const purchase = res.data;
      
      setSelectedMedicine(purchase.medicineId);
      setLotNo(purchase.batchNumber);
      setExpiryDate(new Date(purchase.expiryDate));
      setSalePrice(purchase.salePrice);
      setPurchasePrice(purchase.purchasePrice);
      setQuantity(purchase.quantity);
      setTax(purchase.tax);
      setAmount(purchase.amount);
      setNote(purchase.note);
      setTotal(purchase.total);
      setDiscount(purchase.discount);
      setTaxAmount(purchase.taxAmount);
      setNetAmount(purchase.netAmount);
      setPaymentMode(purchase.paymentMode);
      setPaymentNote(purchase.paymentNote);
    } catch (error) {
      console.error("Error fetching purchase:", error);
      toast.error("Failed to load purchase details");
    }
  };

  const calculateAmount = () => {
    const calculatedAmount = purchasePrice * quantity;
    setAmount(calculatedAmount);
    
    const calculatedTaxAmount = (calculatedAmount * tax) / 100;
    setTaxAmount(calculatedTaxAmount);
    
    const calculatedTotal = calculatedAmount + calculatedTaxAmount;
    setTotal(calculatedTotal);
    
    const calculatedNetAmount = calculatedTotal - discount;
    setNetAmount(calculatedNetAmount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedMedicine || !lotNo || !expiryDate || quantity <= 0) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const purchaseData = {
        medicineId: selectedMedicine,
        medicineName: medicines.find(m => m.id === selectedMedicine)?.name || "",
        batchNumber: lotNo,
        expiryDate: expiryDate,
        salePrice: salePrice,
        purchasePrice: purchasePrice,
        quantity: quantity,
        tax: tax,
        amount: amount,
        note: note,
        total: total,
        discount: discount,
        taxAmount: taxAmount,
        netAmount: netAmount,
        paymentMode: paymentMode,
        paymentNote: paymentNote,
        purchaseDate: new Date().toISOString()
      };

      await axios.put(`http://localhost:8080/purchaseMedicines/${id}`, purchaseData);
      toast.success("Purchase updated successfully!");
      navigate("/purchase-medicine");
    } catch (error) {
      console.error("Error updating purchase:", error);
      toast.error("Failed to update purchase");
    }
  };

  return (
    <div className="container-fluid">
      <ToastContainer />
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Edit Purchase Medicine</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-4">
              <div className="col-md-12">
                <div className="purchase-form-container">
                  <div className="form-row">
                    <div className="form-group col-md-4">
                      <label className="font-weight-bold">MEDICINES*</label>
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
                    </div>
                    <div className="form-group col-md-2">
                      <label className="font-weight-bold">LOT NO.*</label>
                      <input
                        type="text"
                        className="form-control"
                        value={lotNo}
                        onChange={(e) => setLotNo(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group col-md-2">
                      <label className="font-weight-bold">EXPIRY DATE*</label>
                      <DatePicker
                        selected={expiryDate}
                        onChange={(date) => setExpiryDate(date)}
                        className="form-control"
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Expiry Date"
                        required
                      />
                    </div>
                    <div className="form-group col-md-2">
                      <label className="font-weight-bold">ENTER SALE PRICE*</label>
                      <input
                        type="number"
                        className="form-control"
                        value={salePrice}
                        onChange={(e) => setSalePrice(parseFloat(e.target.value))}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="form-group col-md-2">
                      <label className="font-weight-bold">PURCHASE PRICE*</label>
                      <input
                        type="number"
                        className="form-control"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(parseFloat(e.target.value))}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row mt-3">
                    <div className="form-group col-md-2">
                      <label className="font-weight-bold">QUANTITY*</label>
                      <input
                        type="number"
                        className="form-control"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        min="1"
                        required
                      />
                    </div>
                    <div className="form-group col-md-2">
                      <label>TAX</label>
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          value={tax}
                          onChange={(e) => setTax(parseFloat(e.target.value))}
                          min="0"
                          step="0.01"
                        />
                        <div className="input-group-append">
                          <span className="input-group-text">%</span>
                        </div>
                      </div>
                    </div>
                    <div className="form-group col-md-2">
                      <label className="font-weight-bold">AMOUNT*</label>
                      <input
                        type="number"
                        className="form-control"
                        value={amount.toFixed(2)}
                        readOnly
                      />
                    </div>
                    <div className="form-group col-md-2 d-flex align-items-end">
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ height: "38px" }}
                      >
                        ADD
                      </button>
                    </div>
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
                  </div>
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-6 offset-md-6">
                <div className="purchase-summary">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="font-weight-bold">Total*</span>
                    <span>{total.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Discount</span>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{ width: "100px" }}
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax Amount</span>
                    <span>{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="font-weight-bold">Net Amount*</span>
                    <span className="font-weight-bold">{netAmount.toFixed(2)}</span>
                  </div>
                  <div className="form-group">
                    <label className="font-weight-bold">Payment Mode*</label>
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
                  Update
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPurchaseMedicine;