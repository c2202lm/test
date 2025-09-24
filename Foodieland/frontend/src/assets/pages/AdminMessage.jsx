import React, { useEffect, useState } from "react";
import "../css/AdminMessage.css";

const AdminMessage = () => {
  const [messages, setMessages] = useState({ contacts: [], feedbacks: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/api/admin/messages", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load data!");

        const data = await res.json();
        setMessages(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (loading) return <p>⏳ Loading data...</p>;
  if (error) return <p className="error">⚠ Error: {error}</p>;

  return (
    <div className="admin-message-container">
      <h2>📩 Manage Contacts & Feedback</h2>

      <h3>Contact List</h3>
      {messages.contacts.length > 0 ? (
        <table className="message-table">
          <thead>
            <tr>
              <th className="text-center">Name</th>
              <th className="text-center">Email</th>
              <th className="text-center">Subject</th>
              <th className="text-center">Type</th>
              <th className="text-center">Message</th>
            </tr>
          </thead>
          <tbody>
            {messages.contacts.map((c) => (
              <tr key={`contact-${c.id}`}>
                <td className="text-center">{c.name}</td>
                <td>{c.email}</td>
                <td>{c.subject}</td>
                <td className="text-center">{c.enquiry_type || "N/A"}</td>
                <td>{c.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>📭 No contacts available.</p>
      )}

      <h3>Feedback List</h3>
      {messages.feedbacks.length > 0 ? (
        <table className="message-table">
          <thead>
            <tr>
              <th className="text-center">User</th>
              <th className="text-center">Message</th>
              <th className="text-center">Rating</th>
            </tr>
          </thead>
          <tbody>
            {messages.feedbacks.map((f) => (
              <tr key={`feedback-${f.id}`}>
                <td className="text-center">{f.user ? f.user.name : "Anonymous"}</td>
                <td>{f.message}</td>
                <td className="text-center">{f.rating} ⭐</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>📭 No feedback available.</p>
      )}
    </div>
  );
};

export default AdminMessage;
