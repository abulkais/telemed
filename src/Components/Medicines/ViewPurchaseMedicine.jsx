import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ViewPurchaseMedicine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);

  useEffect(() => {
    fetchPurchase();
  }, []);

  const fetchPurchase = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/purchaseMedicines/${id}`);
      setPurchase(res.data);
    } catch (error) {
      console.error("Error fetching purchase:", error);
      toast.error("Failed to load purchase details");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!purchase) {
    return <div className="container py-4">Loading...</div>;
  }

  return (
    <div className="container-fluid">
      <ToastContainer />
      <div className="card">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">View Purchase Medicine</h4>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-12">
              <div className="purchase-form-container">
                <div className="form-row">
                  <div className="form-group col-md-4">
                    <label className="font-weight-bold">MEDICINES*</label>
                    <input
                      type="text"
                      className="form-control"
                      value={purchase.medicineName}
                      readOnly
                    />
                  </div>
                  <div className="form-group col-md-2">
                    <label className="font-weight-bold">LOT NO.*</label>
                    <input
                      type="text"
                      className="form-control"
                      value={purchase.batchNumber}
                      readOnly
                    />
                  </div>
                  <div className="form-group col-md-2">
                    <label className="font-weight-bold">EXPIRY DATE*</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formatDate(purchase.expiryDate)}
                      readOnly
                    />
                  </div>
                  <div className="form-group col-md-2">
                    <label className="font-weight-bold">SALE PRICE*</label>
                    <input
                      type="text"
                      className="form-control"
                      value={purchase.salePrice}
                      readOnly
                    />
                  </div>
                  <div className="form-group col-md-2">
                    <label className="font-weight-bold">PURCHASE PRICE*</label>
                    <input
                      type="text"
                      className="form-control"
                      value={purchase.purchasePrice}
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-row mt-3">
                  <div className="form-group col-md-2">
                    <label className="font-weight-bold">QUANTITY*</label>
                    <input
                      type="text"
                      className="form-control"
                      value={purchase.quantity}
                      readOnly
                    />
                  </div>
                  <div className="form-group col-md-2">
                    <label>TAX</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={purchase.tax}
                        readOnly
                      />
                      <div className="input-group-append">
                        <span className="input-group-text">%</span>
                      </div>
                    </div>
                  </div>
                  <div className="form-group col-md-2">
                    <label className="font-weight-bold">AMOUNT*</label>
                    <input
                      type="text"
                      className="form-control"
                      value={purchase.amount.toFixed(2)}
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-row mt-3">
                  <div className="form-group col-md-6">
                    <label>Note</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={purchase.note}
                      readOnly
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
                  <span>{purchase.total.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Discount</span>
                  <span>{purchase.discount.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax Amount</span>
                  <span>{purchase.taxAmount.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span className="font-weight-bold">Net Amount*</span>
                  <span className="font-weight-bold">{purchase.netAmount.toFixed(2)}</span>
                </div>
                <div className="form-group">
                  <label className="font-weight-bold">Payment Mode*</label>
                  <input
                    type="text"
                    className="form-control"
                    value={purchase.paymentMode}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Payment Note</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    value={purchase.paymentNote}
                    readOnly
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-12 text-right">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate("/purchase-medicine")}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPurchaseMedicine;