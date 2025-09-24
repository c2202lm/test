// src/pages/AdminVoucherManagement.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/AdminVoucher.css";

const API_URL = "http://localhost:8000/api/admin/vouchers";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AdminVoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchVouchers = async () => {
    try {
      const res = await api.get("");
      setVouchers(res.data);
    } catch (err) {
      setError("Unable to load voucher data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this voucher?")) return;
    try {
      await api.delete(`/${id}`);
      fetchVouchers();
    } catch (err) {
      console.error("Error when deleting voucher:", err);
    }
  };

  if (loading)
  return (
    <div className="loading-wrapper">
      <p>Loading data...</p>
    </div>
  );
  if (error) return <p>{error}</p>;

  return (
    <div className="voucher-admin">
      <div className="voucher-admin__header">
        <h1 className="fw-bold" style={{ color: "#2c3e50" }}>Voucher Management</h1>
        <button
          onClick={() => navigate("/admin/vouchers/add")}
          className="btn rounded-pill px-4 py-2 fw-bold shadow-sm transition duration-300 ease-in-out transform hover:scale-105"
          style={{ backgroundColor: "#28a745", color: "white", border: "none" }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add New Voucher
        </button>
      </div>

      <div className="voucher-table__wrap">
        <table className="voucher-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Code</th>
              <th>%</th>
              <th>Start</th>
              <th>End</th>
              <th>Used / Maximum</th>
              <th>Status</th>
              <th>Log in</th>
              <th>Operation</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((v) => (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td className="mono">{v.code}</td>
                <td>{v.discount_percent}</td>
                <td>{v.start_date}</td>
                <td>{v.end_date}</td>
                <td>{v.used_count}/{v.usage_limit || "∞"}</td>
                <td><span className={`badge badge--${v.status}`}>{v.status}</span></td>
                <td>{v.is_login_required ? "Yes" : "No"}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn--small" onClick={() => navigate(`/admin/vouchers/edit/${v.id}`)}>Update</button>
                    <button className="btn btn--small btn--danger" onClick={() => handleDelete(v.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {vouchers.length === 0 && (
              <tr>
                <td colSpan="9" className="voucher-table__empty">No vouchers have been created yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminVoucherManagement;
