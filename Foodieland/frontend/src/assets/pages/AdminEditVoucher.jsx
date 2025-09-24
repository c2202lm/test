// src/pages/EditVoucher.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../css/AdminVoucher.css";

const API_URL = "http://localhost:8000/api/admin/vouchers";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const EditVoucher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    code: "",
    description: "",
    discount_percent: "",
    min_order_value: "",
    start_date: "",
    end_date: "",
    usage_limit: "",
    is_login_required: true,
    status: "active",
  });

  // lấy dữ liệu voucher cần sửa
  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        const res = await api.get(`/${id}`);
        setForm(res.data);
      } catch (err) {
        console.error("Unable to download voucher:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVoucher();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/${id}`, form);
      navigate("/admin/vouchers");
    } catch (err) {
      console.error("Error updating voucher:", err);
    }
  };

  if (loading)
  return (
    <div className="loading-wrapper">
      <p>Loading Vouchers data...</p>
    </div>
  );

  return (
    <div className="voucher-form__page">
      <h1 className="fw-bold" style={{ color: "#2c3e50" }}>Edit Managent</h1>
      <form onSubmit={handleSubmit} className="voucher-form">
        <input type="text" name="code" value={form.code} onChange={handleChange} placeholder="Voucher code" required />
        <input type="text" name="description" value={form.description} onChange={handleChange} placeholder="Describe" />
        <input type="number" name="discount_percent" value={form.discount_percent} onChange={handleChange} placeholder="% discount" required />
        <input type="number" name="min_order_value" value={form.min_order_value} onChange={handleChange} placeholder="Minimum order value" />
        <label>
          Start date:
          <input type="datetime-local" name="start_date" value={form.start_date} onChange={handleChange} />
        </label>
        <label>
          End date:
          <input type="datetime-local" name="end_date" value={form.end_date} onChange={handleChange} />
        </label>
        <input type="number" name="usage_limit" value={form.usage_limit} onChange={handleChange} placeholder="Number of uses" />
        <label style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          Login required?
          <label className="toggle">
            <input
              type="checkbox"
              name="is_login_required"
              checked={form.is_login_required}
              onChange={handleChange}
            />
            <span className="slider"></span>
          </label>
        </label>

        <select name="status" value={form.status} onChange={handleChange}>
          <option value="active">Active</option>
          <option value="inactive">Stop</option>
        </select>

        <div className="voucher-form__actions">
          <button type="submit" className="btn btn--primary">Update</button>
          <button type="button" className="btn btn--ghost" onClick={() => navigate("/admin/vouchers")}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditVoucher;
