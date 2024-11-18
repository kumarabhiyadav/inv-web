// PurchaseList.jsx
import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Store, RefreshCcw } from "lucide-react";
import "./PurchaseList.css";
import { remoteCreateQR, remoteFetch } from "../../api";
import axios from "axios";

const PurchaseList = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPurchases, setExpandedPurchases] = useState(new Set());
  const [toasts, setToasts] = useState([]);

  const showToast = (type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(remoteFetch);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPurchases(data["result"]);
      showToast("success", "Purchases loaded successfully");
    } catch (err) {
      setError(err.message);
      showToast("error", `Failed to load purchases: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  async function moveToInventory(product, supplier, purchaseid) {
    console.log("Jel")
    let res = await axios.post(remoteCreateQR, {
      supplierId: supplier._id,
      id: product._id,
    });
    if (res["data"]["success"]) {

        if(res['data']['message'] == "Moved TO INVENTORY"){

          //Hit Local API


        console.log(product);
        }




      showToast("success", res["data"]["success"]);
      for (let index = 0; index < purchases.length; index++) {
        const element = purchases[index];

        if (element._id === purchaseid) {
          for (let index = 0; index < purchases.subProducts.length; index++) {
            const prod = purchases.subProducts[index];
            if (prod._id == product._id) {
              prod["inInventory"] = true;
            }
          }
        }
      }
    }
    setPurchases([...purchases]);
  }

  useEffect(() => {
    fetchPurchases();
  }, []);

  const togglePurchase = (purchaseId) => {
    setExpandedPurchases((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(purchaseId)) {
        newSet.delete(purchaseId);
      } else {
        newSet.add(purchaseId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <RefreshCcw className="spinner" />
          <span>Loading purchases...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error-alert">
          <span>Error loading purchases: {error}</span>
          <button onClick={fetchPurchases}>Retry</button>
        </div>
      </div>
    );
  }

  if (!purchases.length) {
    return (
      <div className="card">
        <div className="empty-state">No purchases found</div>
      </div>
    );
  }

  return (
    <div className="purchase-container">
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Purchase History</h2>
          <button
            onClick={() => {
              fetchPurchases();
              showToast("info", "Refreshing purchases...");
            }}
            className="refresh-button"
            title="Refresh purchases"
          >
            <RefreshCcw />
          </button>
        </div>

        <div className="purchase-list">
          {purchases.map((purchase) => (
            <div key={purchase._id} className="purchase-item">
              <div
                className="purchase-header"
                onClick={() => togglePurchase(purchase._id)}
              >
                <div className="purchase-info">
                  <div className="purchase-date">
                    {expandedPurchases.has(purchase._id) ? (
                      <ChevronDown className="icon" />
                    ) : (
                      <ChevronRight className="icon" />
                    )}
                    <span>
                      Purchase on{" "}
                      {new Date(purchase.purchaseDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="supplier-info">
                    <Store className="icon" />
                    <span>{purchase.supplier.name}</span>
                    {/* <span className="supplier-id">({purchase.supplier.id})</span> */}
                  </div>
                </div>
                <span className="purchase-total">
                  ${purchase.totalCost.toFixed(2)}
                </span>
              </div>

              {expandedPurchases.has(purchase._id) && (
                <div className="products-table-container">
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>Inventory</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchase.subProducts.map((product) => (
                        <tr key={product._id}>
                          <td style={{ color: "black" }}>{product.name}</td>
                          <td style={{ color: "black" }}>{product.quantity}</td>
                          <td style={{ color: "black" }}>
                            ${product.cost.toFixed(2)}
                          </td>
                          <td style={{ color: "black" }}>
                            ${(product.cost * product.quantity).toFixed(2)}
                          </td>
                          <td>
                            {product.inInventory ? (
                              <></>
                            ) : (
                              <button
                                onClick={() => {
                                  moveToInventory(
                                    product,
                                    purchase.supplier,
                                    purchase._id
                                  );
                                }}
                              >
                                Move to Inventory
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PurchaseList;
