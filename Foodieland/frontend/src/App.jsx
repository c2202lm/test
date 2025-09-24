import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from "./assets/pages/Home.jsx";
import Header from "./assets/components/Header.jsx";
import Footer from "./assets/components/Footer.jsx";
import Contact from "./assets/pages/Contact.jsx";
import About from "./assets/pages/AboutUs.jsx";
import RecipeDetailComponent from "./assets/pages/RecipeDetail.jsx";
import Categories from "./assets/pages/Categories.jsx";
import FavouritePage from "./assets/pages/Favourite.jsx";
import Login from "./assets/pages/Login.jsx";
import Signup from "./assets/pages/SignUp.jsx";
import AdminDashboard from "./assets/pages/AdminDashboard.jsx";
import Orders from "./assets/pages/Orders.jsx";
import Cart from "./assets/pages/Cart.jsx";
import UserProfile from "./assets/pages/UserProfile.jsx";
import ProtectedRoute from "./assets/components/ProtectedRoute.jsx";
import AdminDishManagement from "./assets/pages/AdminDishManagement.jsx";
import AdminAddNewDish from "./assets/pages/AdminAddNewDish.jsx";
import AdminOrders from "./assets/pages/AdminOrders.jsx";
import AdminAnalytics from "./assets/pages/AdminAnalytics.jsx";
import AdminHeader from "./assets/components/AdminHeader.jsx";
import OrderForm from './assets/pages/OrderForm.jsx';
import AdminVoucherManagement from "./assets/pages/AdminVoucherManagement";
import AdminAddNewVoucher from "./assets/pages/AdminAddNewVoucher.jsx";
import AdminEditVoucher from "./assets/pages/AdminEditVoucher.jsx";
import AdminMessage from "./assets/pages/AdminMessage.jsx";
import AdminProfile from "./assets/pages/AdminProfile.jsx";
import { createOrder, getAdminDashboard, apiGet, apiPost, apiPut, apiDelete } from "./api.js";

const genOrderId = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function NotFound() {
  return <h1 className="text-center font-bold my-5">404 - Not Found</h1>;
}

function App() {
  const location = useLocation();

  const [favourites, setFavourites] = useState(() => {
    const saved = localStorage.getItem("nutriplanner-favourites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("nutriplanner-favourites", JSON.stringify(favourites));
  }, [favourites]);

  const addToFavourites = (dish) => {
    setFavourites((prev) =>
      prev.some((r) => r.title === dish.title) ? prev : [...prev, dish]
    );
  };

  const removeFromFavourites = (dish) => {
    setFavourites((prev) => prev.filter((r) => r.title !== dish.title));
  };

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('nutriplanner-orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [totalReturns, setTotalReturns] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);

  useEffect(() => {
    localStorage.setItem('nutriplanner-orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) {
      getAdminDashboard()
        .then((data) => {
          if (Array.isArray(data?.orders) && data.orders.length > 0) {
            setOrders(data.orders);
          }
          if (typeof data?.totalReturns === "number") {
            setTotalReturns(data.totalReturns);
          }
          if (typeof data?.totalCustomers === "number") {
            setTotalCustomers(data.totalCustomers);
          }
        })
        .catch((err) => {
          console.error("Lỗi lấy dữ liệu dashboard:", err);
        });
    }
  }, [location.pathname]);

  const addOrder = (newRecipe) => {
    setOrders((prev) => {
      const newId = genOrderId();
      const details = dishes.find((r) => r.title === newRecipe.name) || {};
      return [
        ...prev,
        {
          id: newId,
          name: newRecipe.name,
          status: "Pending Confirmation",
          image: newRecipe.image || details.image || "https://placehold.co/200x150",
          diet: newRecipe.diet || details.diet || [],
          dietClass: newRecipe.dietClass || details.dietClass || "bg-secondary",
          quantity: newRecipe.quantity || 1,
          price: newRecipe.price ?? details.price ?? 0,
          shippingFee: 5,
          orderDate: Date.now(),
        },
      ];
    });
  };

  const removeOrder = (orderIdToRemove, itemName = null) => {
    setOrders((prev) => {
      if (itemName) {
        return prev.filter(
          (order) => !(order.id === orderIdToRemove && order.name === itemName)
        );
      } else {
        return prev.filter((order) => order.id !== orderIdToRemove);
      }
    });
  };

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("nutriplanner-cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("nutriplanner-cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const fetchCart = async () => {
    try {
      const data = await apiGet("cart");
      setCartItems(
        (data || []).map(item => ({
          id: item.id,
          mealId: item.meal.id,
          title: item.meal.name,
          image: item.meal.image,
          price: item.meal.price,
          diet: item.meal.dietTypes?.map(d => d.dietType) || [],
          quantity: item.quantity
        }))
      );
    } catch (err) {
      console.error("Lỗi lấy giỏ hàng:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateCartQuantity = async (cartId, newQuantity) => {
    try {
      await apiPut(`cart/${cartId}`, { quantity: newQuantity });
      fetchCart();
    } catch (err) {
      console.error("Lỗi cập nhật số lượng:", err);
    }
  };

  const addToCart = async (dish) => {
    try {
      await apiPost("cart", {
        meal_id: dish.mealId || dish.id,
        quantity: dish.quantity || 1
      });
      fetchCart();
    } catch (err) {
      console.error("Lỗi thêm giỏ hàng:", err);
    }
  };

  const removeFromCart = async (dish) => {
    try {
      await apiDelete(`cart/${dish.id}`);
      fetchCart();
    } catch (err) {
      console.error("Lỗi xóa giỏ hàng:", err);
    }
  };

  const handlePlaceOrderFromCart = async (ordersToPlace) => {
    try {
      const now = new Date().toISOString();
      const normalized = (ordersToPlace || []).map(o => ({
        id: o.id || genOrderId(),
        name: o.name,
        image: o.image,
        diet: o.diet ?? [],
        price: Number(o.price ?? 0),
        quantity: Number(o.quantity ?? 1),
        shippingFee: o.shippingFee ?? 5,
        status: o.status || 'Pending Confirmation',
        orderDate: o.orderDate || now,
      }));

      setOrders(prev => {
        const next = [...prev, ...normalized];
        localStorage.setItem('nutriplanner-orders', JSON.stringify(next));
        return next;
      });

    } catch (e) {
      console.error('Save local order error:', e);
      alert('Đặt hàng thất bại!');
    }
  };

  const [dishes, setDishes] = useState([]);

  const fetchDishes = async () => {
    try {
      const data = location.pathname.startsWith("/admin")
        ? await apiGet("admin/meals")
        : await apiGet("meals");
      setDishes(data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách món ăn:", err);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, [location.pathname]);

  const handleSaveDish = async (dishToSave) => {
    try {
      if (dishToSave.id) {
        await apiPost(`admin/meals/${dishToSave.id}`, dishToSave);
      } else {
        await apiPost("admin/meals", dishToSave);
      }
      fetchDishes();
    } catch (err) {
      console.error("Lỗi lưu món ăn:", err);
    }
  };

  const handleDeleteDish = async (idToDelete) => {
    try {
      await apiDelete(`admin/meals/${idToDelete}`);
      fetchDishes();
    } catch (err) {
      console.error("Lỗi xóa món ăn:", err);
    }
  };

  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="d-flex flex-column min-vh-100">
        {isAdminRoute ? (
          <AdminHeader />
        ) : (
          <Header favourites={favourites} cartItemCount={cartItems.length} />
        )}
        <main className="flex-grow-1">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  favourites={favourites}
                  addToFavourites={addToFavourites}
                  removeFromFavourites={removeFromFavourites}
                  addToOrders={addOrder}
                  cartItems={cartItems}
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                  dishes={dishes}
                />
              }
            />
            <Route
              path="/dish/:id"
              element={
                <RecipeDetailComponent
                  favourites={favourites}
                  addToFavourites={addToFavourites}
                  removeFromFavourites={removeFromFavourites}
                  addToOrders={addOrder}
                  cartItems={cartItems}
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                  dishes={dishes}
                />
              }
            />
            <Route
              path="/contact"
              element={
                <Contact
                  favourites={favourites}
                  addToFavourites={addToFavourites}
                  removeFromFavourites={removeFromFavourites}
                  addToOrders={addOrder}
                  cartItems={cartItems}
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                  dishes={dishes}
                />
              }
            />
            <Route path="/about" element={<About />} />
            <Route
              path="/categories"
              element={
                <Categories
                  favourites={favourites}
                  addToFavourites={addToFavourites}
                  removeFromFavourites={removeFromFavourites}
                  addToOrders={addOrder}
                  cartItems={cartItems}
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                  dishes={dishes}
                />
              }
            />
            <Route
              path="/favourite"
              element={
                <FavouritePage
                  favourites={favourites}
                  removeFromFavourites={removeFromFavourites}
                />
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard
                    orders={orders}
                    setOrders={setOrders}
                    totalReturns={totalReturns}
                    setTotalReturns={setTotalReturns}
                    totalCustomers={totalCustomers}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={<Orders />}
            />
            <Route
              path="/cart"
              element={
                <Cart
                  cartItems={cartItems}
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                  updateCartQuantity={updateCartQuantity}
                  onPlaceOrder={handlePlaceOrderFromCart}
                />
              }
            />
            <Route
              path="/profile"
              element={<UserProfile></UserProfile>}
            >
            </Route>
            <Route
              path="/admin/dishes"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDishManagement dishes={dishes} handleDelete={handleDeleteDish} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/vouchers"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminVoucherManagement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminMessage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/dishes/add"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminAddNewDish dishes={dishes} onSaveDish={handleSaveDish} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/dishes/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminAddNewDish dishes={dishes} onSaveDish={handleSaveDish} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminOrders
                    orders={orders}
                    setOrders={setOrders}
                    totalReturns={totalReturns}
                    setTotalReturns={setTotalReturns}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/vouchers/add"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminAddNewVoucher />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/vouchers/edit/:id"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminEditVoucher />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminAnalytics
                    orders={orders}
                    setOrders={setOrders}
                    totalReturns={totalReturns}
                    setTotalReturns={setTotalReturns}
                  />
                </ProtectedRoute>
              }
            />

            <Route path="/order" element={<OrderForm setOrders={setOrders} />} />

            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminProfile />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;
