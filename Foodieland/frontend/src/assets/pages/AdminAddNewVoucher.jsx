// src/pages/AddNewVoucher.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/AdminVoucher.css";

const API_URL = "http://localhost:8000/api/admin/vouchers";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AddNewVoucher = () => {
  const navigate = useNavigate();
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

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    setErrors({ ...errors, [name]: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Kiểm tra bắt buộc nhập
    if (!form.start_date) newErrors.start_date = "Please enter start date";
    if (!form.end_date) newErrors.end_date = "Please enter end date";

    // Kiểm tra end_date > start_date
    if (form.start_date && form.end_date) {
      const start = new Date(form.start_date);
      const end = new Date(form.end_date);
      if (end <= start) {
        newErrors.end_date = "End date must be greater than start date";
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await api.post("", form);
      navigate("/admin/vouchers");
    } catch (err) {
      console.error("Error adding vouchers:", err);
    }
  };

  return (
    <div className="voucher-form__page">
      <div className="voucher-form__container">
        <h1 className="fw-bold" style={{ color: "#2c3e50" }}>
          Add New Voucher
        </h1>
        <form onSubmit={handleSubmit} className="voucher-form">
          <input
            type="text"
            name="code"
            value={form.code}
            onChange={handleChange}
            placeholder="Voucher code"
            required
          />
          <input
            type="text"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe"
          />
          <input
            type="number"
            name="discount_percent"
            value={form.discount_percent}
            onChange={handleChange}
            placeholder="% discount"
            required
          />
          <input
            type="number"
            name="min_order_value"
            value={form.min_order_value}
            onChange={handleChange}
            placeholder="Minimum order value"
          />

          <label>
            Star date:
            <input
              type="datetime-local"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              className={errors.start_date ? "error-input" : ""}
            />
            {errors.start_date && (
              <p className="error-text">{errors.start_date}</p>
            )}
          </label>
          <label>
            End date:
            <input
              type="datetime-local"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              min={form.start_date || undefined} // chỉ cho phép chọn từ sau ngày bắt đầu
              className={errors.end_date ? "error-input" : ""}
            />
            {errors.end_date && (
              <p className="error-text">{errors.end_date}</p>
            )}
          </label>

          <input
            type="number"
            name="usage_limit"
            value={form.usage_limit}
            onChange={handleChange}
            placeholder="Number of uses"
          />

          <label
            className="voucher-form__toggle"
            style={{ display: "flex", alignItems: "center", gap: "12px" }}
          >
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

          <div className="voucher-form__actions">
            <button type="submit" className="btn btn--primary">
              Add
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => navigate("/admin/vouchers")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewVoucher;
