const BASE_URL = "http://localhost:8000/api";

export const apiGet = async (url) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(`${BASE_URL}/${url}`, { headers });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }
  return await response.json();
};

export const apiPost = async (url, body) => {
  const token = localStorage.getItem("token");

  console.log(`[API Auth] Using token: ${token ? 'Bearer ' + token.substring(0, 20) + '...' : 'No Token Found'}`);

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // DEBUG: Log the request details
  console.log(`[API POST] to ${url} with body:`, JSON.stringify(body, null, 2));

  const response = await fetch(`${BASE_URL}/${url}`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    // DEBUG: Log the full error response
    console.error(`[API POST ERROR] to ${url}:`, error);
    if (error.errors) {
        console.error('Validation errors:', error.errors);
    }
    // Throw an error object that can be caught and inspected
    const err = new Error(error.message || "Request failed");
    err.response = error;
    throw err;
  }

  return await response.json();
};

export const apiPut = async (url, body) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/${url}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }

  return await response.json();
};

export const apiPatch = async (url, body) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/${url}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }

  return await response.json();
};

export const apiDelete = async (url) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}/${url}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Request failed");
  }

  return await response.json();
};

export const getAdminDashboard = async () => apiGet("admin/dashboard");
export const getAdminAnalytics = async () => apiGet("admin/analytics");
export const getAdminOrders = async () => apiGet("admin/orders");
export const getUserOrders = () => apiGet("orders");
export const updateOrderStatus = async (id, status) =>
  apiPost(`admin/orders/${id}/update-status`, { status });

export const placeOrder = (orderData) => apiPost("orders/place", orderData);
export const createOrder = (items) => apiPost("orders", { items });
export const getVouchers = async (subtotal = 0) => apiGet(`vouchers?subtotal=${encodeURIComponent(subtotal)}`);
export const getUserVouchers = async (subtotal = 0) => apiGet(`user/vouchers?subtotal=${encodeURIComponent(subtotal)}`);
export const cancelOrder = (orderId) => apiPatch(`orders/${orderId}/cancel`);
