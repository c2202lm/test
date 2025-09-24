import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard.jsx';

import timer from '../images/RecipeDetail/Timer.png';
import forkKnife from '../images/RecipeDetail/ForkKnife.png';
import RecipeNotFound from "../images/RecipeDetail/RecipeNotFound.svg";
import CartIcon from '../images/Cart/Cart.svg';

const RecipeDetailComponent = ({
  favourites,
  addToFavourites,
  removeFromFavourites,
  addToOrders,
  cartItems,
  addToCart,
  removeFromCart,
}) => {
  const navigate = useNavigate();

  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [similarRecipes, setSimilarRecipes] = useState([]);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [isCartClicked, setIsCartClicked] = useState(false);

  const [showQuantityPopup, setShowQuantityPopup] = useState(false);
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(() => {
    try {
      const cached = localStorage.getItem('selected_voucher');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [voucherError, setVoucherError] = useState('');

  const shippingFee = Number(localStorage.getItem('shipping_fee') ?? 5);

  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/meals/${id}`);
        if (!res.ok) throw new Error('Failed to fetch meal data');
        const meal = await res.json();

        const formattedMeal = {
          id: meal.id,
          title: meal.name,
          description: meal.description,
          calories: meal.calories,
          image: meal.image,
          diet: meal.dietTypes?.map((d) => d.dietType) || [],
          ingredients: meal.ingredients || [],
          category: meal.mealType?.mealType?.toLowerCase() || 'uncategd',
          price: meal.price,
          allergies: meal.allergens?.map((a) => a.allergen) || [],
          time: meal.prep_time,
          protein: meal.protein,
          carb: meal.carbs,
          fats: meal.fat,
        };

        setCurrentRecipe(formattedMeal);

        const resAll = await fetch(`http://localhost:8000/api/meals`);
        if (!resAll.ok) throw new Error('Failed to fetch all meals');
        const allMeals = await resAll.json();

        const formattedAll = allMeals.map((m) => ({
          id: m.id,
          title: m.name,
          description: m.description,
          image: m.image,
          category: m.mealType?.mealType?.toLowerCase() || 'uncategd',
          calories: m.calories,
          price: m.price,
          protein: m.protein,
          carb: m.carbs,
          fats: m.fat,
          time: m.prep_time,
          diet: (m.dietTypes || m.diet_types || []).map((d) => d.dietType),
        }));

        let similar = formattedAll.filter(
          (dish) => dish.category === formattedMeal.category && dish.id !== formattedMeal.id
        );

        if (similar.length === 0) {
          similar = formattedAll.filter((dish) => dish.id !== formattedMeal.id);
        }

        similar = similar.slice(0, 4);
        setSimilarRecipes(similar);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };

    fetchData();
  }, [id]);

  const recipeToDisplay = currentRecipe || {
    title: 'Dish Not Found',
    calories: 'N/A',
    diet: 'N/A',
    image: RecipeNotFound,
    ingredients: [],
    time: 'N/A',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    protein: 'N/A',
    carb: 'N/A',
    fats: 'N/A',
    preparations: [],
    price: 0,
  };

  useEffect(() => {
    const isInCart = cartItems.some((item) => item.title === recipeToDisplay?.title);
    setIsCartClicked(isInCart);
  }, [cartItems, recipeToDisplay]);

  const subtotal = useMemo(() => {
    const price = Number.parseFloat(recipeToDisplay.price) || 0;
    const qty = Number.parseInt(selectedQuantity) || 1;
    return price * qty;
  }, [recipeToDisplay.price, selectedQuantity]);

  const discount = useMemo(() => {
    if (!selectedVoucher) return 0;
    const minOk = selectedVoucher.minOrderValue == null || subtotal >= Number(selectedVoucher.minOrderValue);
    if (!minOk) return 0;

    if (selectedVoucher.type === 'percent') {
      const d = (subtotal * Number(selectedVoucher.value || 0)) / 100;
      const capped = selectedVoucher.maxDiscount != null
        ? Math.min(d, Number(selectedVoucher.maxDiscount))
        : d;
      return Math.min(capped, subtotal);
    }
    if (selectedVoucher.type === 'fixed') {
      return Math.min(Number(selectedVoucher.value || 0), subtotal);
    }
    return 0;
  }, [selectedVoucher, subtotal]);

  const totalAfterVoucher = Math.max(0, subtotal - discount) + shippingFee;

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const baseUrl = 'http://localhost:8000/api';
        const url = token
          ? `${baseUrl}/user/vouchers?subtotal=${encodeURIComponent(subtotal)}`
          : `${baseUrl}/vouchers/public?subtotal=${encodeURIComponent(subtotal)}`;

        const res = await fetch(url, { headers });

        if (!res.ok && token) {
          const publicRes = await fetch(
            `${baseUrl}/vouchers/public?subtotal=${encodeURIComponent(subtotal)}`,
            { headers: { 'Content-Type': 'application/json' } }
          );
          if (!publicRes.ok) throw new Error(`Failed to fetch vouchers: ${publicRes.status}`);
          const dataPub = await publicRes.json();
          const arrPub = Array.isArray(dataPub) ? dataPub : [];
          setVouchers(
            arrPub.map((v) => ({
              ...v,
              remaining_uses: v.remaining_uses ?? null,
              user_remaining_uses: v.user_remaining_uses ?? null,
              isEligible: v.isEligible ?? (v.minOrderValue == null || subtotal >= Number(v.minOrderValue)),
            }))
          );
          return;
        }

        if (!res.ok) throw new Error(`Failed to fetch vouchers: ${res.status}`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];

        const withFlag = arr.map((v) => {
          const remainingGlobal = v.remaining_uses ?? (v.usage_limit != null && v.used_count != null
            ? Math.max(0, Number(v.usage_limit) - Number(v.used_count))
            : null);
          const remainingUser = v.user_remaining_uses ?? (v.user_usage_limit != null
            ? Math.max(0, Number(v.user_usage_limit) - Number(v.user_used_count || 0))
            : null);
          const minOk = v?.minOrderValue == null || subtotal >= Number(v.minOrderValue);
          const userOk = remainingUser == null || remainingUser > 0;
          const globalOk = remainingGlobal == null || remainingGlobal > 0;
          return {
            ...v,
            remaining_uses: remainingGlobal,
            user_remaining_uses: remainingUser,
            isEligible: v.isEligible ?? (minOk && userOk && globalOk),
          };
        });

        setVouchers(withFlag);
      } catch (err) {
        console.error(err);
        setVouchers([]);
      }
    };

    fetchVouchers();
  }, [subtotal]);

  useEffect(() => {
    if (selectedVoucher) {
      const minOk = selectedVoucher.minOrderValue == null || subtotal >= Number(selectedVoucher.minOrderValue);
      if (!minOk) {
        const minVal = Number(selectedVoucher.minOrderValue || 0);
        setVoucherError(`Minimum order $${minVal.toFixed(2)} required for this voucher.`);
      } else {
        setVoucherError('');
      }
    } else {
      setVoucherError('');
    }
  }, [subtotal, selectedVoucher]);

  const nutritionInfo = {
    calories: recipeToDisplay.calories,
    protein: recipeToDisplay.protein,
    carb: recipeToDisplay.carb,
    fats: recipeToDisplay.fats,
  };
  const price = recipeToDisplay.price;

  const preparations = [
    {
      title: 'Flavor Profile',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    },
    {
      title: 'How It’s Made',
      description:
        'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    },
    {
      title: 'Serving Info',
      description:
        'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
  ];

  const handleEmailSubmit = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email address is required.');
      setEmailSuccess('');
    } else if (!emailRegex.test(email)) {
      setEmailError('Email address is invalid.');
      setEmailSuccess('');
    } else {
      setEmailError('');
      setEmailSuccess("Thanks! We'll get in touch with you soon.");
      setEmail('');
    }
  };

  const handleBuyNowClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuantityPopup(true);
  };

  const handleConfirmQuantity = () => {
    const itemToOrder = {
      name: recipeToDisplay.title,
      image: recipeToDisplay.image,
      diet: recipeToDisplay.diet,
      price: parseFloat(recipeToDisplay.price) || 0,
      quantity: parseInt(selectedQuantity) || 1,
    };
    setShowQuantityPopup(false);
    navigate('/order', {
      state: {
        items: [itemToOrder],
      },
    });
  };

  const handleChooseVoucher = (v) => {
    if (v.isEligible === false) {
      alert('This voucher is no longer available for you.');
      return;
    }
    setSelectedVoucher(v);
    localStorage.setItem('selected_voucher', JSON.stringify(v));
    setVoucherModalOpen(false);
  };

  const handleClearVoucher = () => {
    setSelectedVoucher(null);
    localStorage.removeItem('selected_voucher');
  };

  const handleAddToCartClick = () => {
    const cartItem = cartItems.find(item => item.mealId === recipeToDisplay.id);

    if (cartItem) {
      removeFromCart(cartItem);
      setShowRemove(true);
    } else {
      const recipeWithQuantity = {
        mealId: recipeToDisplay.id,
        title: recipeToDisplay.title,
        image: recipeToDisplay.image,
        diet: recipeToDisplay.diet,
        price: parseFloat(recipeToDisplay.price) || 0,
        quantity: selectedQuantity,
      };
      addToCart(recipeWithQuantity);
      setShowSuccess(true);
    }
  };

  const cartButtonBackgroundColor = isCartClicked ? '#36b0c2' : '#f8f9fa';
  const cartIconFilter = isCartClicked ? 'brightness(0) invert(1)' : 'none';

  const [showSuccess, setShowSuccess] = useState(false);
  const [showRemove, setShowRemove] = useState(false);

  return (
    <>
      <header className="container-fluid">
        <div className='container pe-0'>
          <div className='d-flex justify-content-center align-items-center'>
            <div className='row w-100'>
              <div className="col-12 d-flex justify-content-between align-items-center pt-3 pb-2 pe-2 ps-0">
                <h1>{recipeToDisplay.title}</h1>
                <button onClick={() => navigate(-1)} className="btn btn-secondary rounded-pill">
                  <i className="bi bi-arrow-left me-2"></i> Back
                </button>
              </div>
              <div className='col-12 d-flex align-items-center gap-4 py-3 pe-0 ps-0'>
                <div className='border-end border-end-2 d-flex gap-2 align-items-center'>
                  <img src={timer} alt="Preparation time icon" />
                  <div className='px-2'>
                    <p className='mb-0 fw-semibold'>Preparation Time</p>
                    <p className='text-secondary mb-0'>{recipeToDisplay.time} mins</p>
                  </div>
                </div>
                <div className='d-flex gap-2 align-items-center'>
                  <img src={forkKnife} alt="Diet icon" />
                  <div>
                    <p className='text-secondary mb-0'>
                      {Array.isArray(recipeToDisplay.diet) ? recipeToDisplay.diet.join(', ') : recipeToDisplay.diet}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="container py-4">
        <div className="d-flex flex-column flex-lg-row gap-4 justify-content-center ps-3 pe-1">
          <div className="col-12 col-lg-8 rounded-4 overflow-hidden">
            <img
              src={recipeToDisplay.image}
              alt={recipeToDisplay.title}
              className='object-fit-cover'
              style={{ width: '780px', height: '530px' }}
            />
          </div>

          <div className="col-12 col-lg-4 d-flex flex-column gap-4">
            <div
              className=" container rounded-4 p-3"
              style={{ height: '360px', overflowY: 'auto', backgroundColor: '#e8fafaff', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', borderRadius: '16px' }}
            >
              <h4 className='py-3'>Nutrition Information </h4>
              <div className='d-flex justify-content-between align-items-center border-bottom border-secondary'>
                <p className='fw-semibold text-secondary'>Calories</p>
                <p className='fw-semibold'>{nutritionInfo.calories}kcal</p>
              </div>
              <div className='d-flex justify-content-between align-items-center border-bottom border-secondary my-3'>
                <p className='fw-semibold text-secondary'>Protein</p>
                <p className='fw-semibold'>{nutritionInfo.protein}g</p>
              </div>
              <div className='d-flex justify-content-between align-items-center border-bottom border-secondary '>
                <p className='fw-semibold text-secondary'>Carbs</p>
                <p className='fw-semibold'>{nutritionInfo.carb}g</p>
              </div>
              <div className='d-flex justify-content-between align-items-center border-bottom border-secondary my-3'>
                <p className='fw-semibold text-secondary'>Fats</p>
                <p className='fw-semibold'>{nutritionInfo.fats}g</p>
              </div>
            </div>

            {price !== undefined && price !== null && (
              <div>
                <div className="d-flex align-items-center gap-3 mb-2">
                  <span className='text-black fs-6 fw-semibold'>Quantity:</span>

                  <div className="d-flex align-items-center gap-1">
                    <button
                      className="btn btn-outline-secondary px-3 py-1"
                      onClick={() => {
                        const value = parseInt(selectedQuantity) || 1;
                        setSelectedQuantity(Math.max(1, value - 1));
                      }}
                    >
                      −
                    </button>

                    <input
                      type="number"
                      className="form-control text-center"
                      style={{ maxWidth: '80px', maxHeight: '40px', fontWeight: 'bold', borderRadius: '8px' }}
                      value={selectedQuantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setSelectedQuantity('');
                        } else {
                          const num = parseInt(value);
                          if (!isNaN(num) && num > 0) {
                            setSelectedQuantity(num);
                          }
                        }
                      }}
                    />

                    <button
                      className="btn btn-outline-secondary px-3 py-1"
                      onClick={() => {
                        const value = parseInt(selectedQuantity) || 1;
                        setSelectedQuantity(value + 1);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <span className="fw-semibold text-black me-1 fs-5">Total:</span>
                  <span className="text-danger fw-bold fs-4">${(Number(price || 0) * (parseInt(selectedQuantity || 0) || 0)).toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="d-flex justify-content-between align-items-center flex-shrink-0">
              <button
                className="btn rounded-pill px-3 flex-grow-1 me-2"
                style={{ backgroundColor: '#28A745', color: '#fff', border: 'none' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#218838';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#28A745';
                }}
                onClick={handleBuyNowClick}
              >
                Buy Now
              </button>

              <button
                className="btn rounded-circle"
                onClick={handleAddToCartClick}
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.3s ease, filter 0.3s ease',
                  backgroundColor: cartButtonBackgroundColor,
                }}
                onMouseEnter={(e) => {
                  if (!isCartClicked) {
                    e.currentTarget.style.backgroundColor = '#e2e6ea';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCartClicked) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }
                }}
              >
                <img src={CartIcon} alt="Cart Icon" style={{ width: '20px', height: '20px', filter: cartIconFilter }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className='container py-5'>
        <div className='d-flex justify-content-center mb-3 '>
          <h1 className='border-bottom border-secondary'>About the Dish</h1>
        </div>
        <div className='border-bottom border-secondary pb-3'>
          <span className='text-secondary'>{recipeToDisplay.description}</span>
        </div>
      </div>

      <section className="container my-4">
        <div className="row">
          <div className="col-lg-7">
            <h3 className="fw-bold">Ingredients</h3>
            <h5 className="mt-4 fw-semibold">For the Main Course</h5>
            <ul className="list-unstyled border-top">
              {recipeToDisplay.ingredients && recipeToDisplay.ingredients.length > 0 ? (
                recipeToDisplay.ingredients.map((ingredient, index) => (
                  <li key={index} className="border-bottom py-3 d-flex align-items-center">
                    <input type="checkbox" className="form-check-input me-3 mt-0" />
                    {ingredient}
                  </li>
                ))
              ) : (
                <li className="py-3 text-secondary">No ingredients listed.</li>
              )}
            </ul>

            <div className='py-5'>
              <h3 className="fw-bold">Dish Information</h3>
              <ul className="list-unstyled border-top">
                {preparations && preparations.length > 0 ? (
                  preparations.map((step, index) => (
                    <li key={index} className="border-bottom py-3 d-flex align-items-center flex-wrap">
                      <p className='fw-semibold fs-3'>{index + 1}. {step.title}</p>
                      <p className='text-secondary'>{step.description}</p>
                    </li>
                  ))
                ) : (
                  <li className="py-3 text-secondary">No dish information listed.</li>
                )}
              </ul>
            </div>
          </div>

          <div className="col-lg-5 ps-lg-5 mt-5 mt-lg-0" style={{ position: 'sticky', top: '90px', alignSelf: 'flex-start' }}>
            <h5 className="fw-bold">Other Dishes</h5>

            {similarRecipes.length > 0 ? (
              similarRecipes.map((dish, index) => (
                <div className="d-flex mb-3" key={index}>
                  <Link to={`/dish/${dish.id}`} className="me-3">
                    <img
                      src={dish.image}
                      className="rounded-3"
                      width="120"
                      height="80"
                      alt={dish.title}
                      style={{ objectFit: 'cover' }}
                    />
                  </Link>
                  <div>
                    <Link to={`/dish/${dish.id}`} className="mb-1 fw-semibold text-decoration-none text-black">
                      {dish.title}
                    </Link>
                    <p className="text-muted">{Array.isArray(dish.diet) ? dish.diet.join(', ') : dish.diet}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted">No similar dishes found.</p>
            )}

            <div className="text-center bg-success text-white p-4 rounded-4 mt-3">
              <p className="fw-semibold mb-1">Want your own special diet?</p>
              <p className="fw-semibold fs-2">Contact us!</p>

              <div className="d-flex flex-column flex-md-row gap-2 mb-2">
                <input
                  type="email"
                  className="form-control border-0 rounded-3 w-full flex-grow-1"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ height: '45px' }}
                />
                <button
                  className="btn btn-light fw-semibold text-success px-4 rounded-3 w-full md:w-32"
                  onClick={handleEmailSubmit}
                  style={{ height: '45px' }}
                >
                  Submit
                </button>
              </div>

              {emailError && <small className="text-warning d-block">{emailError}</small>}
              {emailSuccess && <small className="text-warning d-block">{emailSuccess}</small>}

              <small className="d-block mt-2">or</small>
              <p className="mb-0">
                <a href="#" className="small text-decoration-none text-white">www.foodieland.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className='container my-5'>
        <div className='d-flex justify-content-center mb-3'>
          <h3 className="fw-bold">You might also like these dishes</h3>
        </div>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {similarRecipes.length > 0 ? (
            similarRecipes.map((dish, index) => (
              <div className="col" key={index}>
                <RecipeCard
                  id={dish.id}
                  image={dish.image}
                  title={dish.title}
                  description={dish.description}
                  time={dish.time}
                  diet={dish.diet}
                  calories={dish.calories}
                  price={dish.price}
                  favourites={favourites}
                  addToFavourites={addToFavourites}
                  removeFromFavourites={removeFromFavourites}
                  addToOrders={addToOrders}
                  cartItems={cartItems}
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                  protein={dish.protein}
                  carb={dish.carb}
                  fat={dish.fats}
                />
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <p className="text-muted">No dishes to display.</p>
            </div>
          )}
        </div>
      </section>

      {showQuantityPopup && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
          onClick={() => setShowQuantityPopup(false)}
        >
          <div
            className="bg-white p-0 rounded-4 shadow d-flex position-relative"
            style={{ width: 900, maxWidth: '95vw', minHeight: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn btn-outline-secondary position-absolute"
              style={{ top: 16, right: 16, borderRadius: '50%', width: 36, height: 36, padding: 0, fontSize: 20, lineHeight: 1 }}
              onClick={() => setShowQuantityPopup(false)}
              tabIndex={0}
              aria-label="Close"
            >
              &times;
            </button>
            <div style={{ flex: '0 0 50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={recipeToDisplay.image}
                alt={recipeToDisplay.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderTopLeftRadius: 12,
                  borderBottomLeftRadius: 12,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  background: '#fafafa',
                }}
              />
            </div>
            <div
              style={{ flex: '0 0 50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', overflowY: 'auto' }}
              className='pe-5'
            >
              <div style={{ width: '100%', maxWidth: '500px' }}>
                <div className="fw-bold mb-2" style={{ fontSize: 22 }}>
                  {recipeToDisplay.title}
                </div>
                <div style={{ color: '#fa5230', fontWeight: 700, fontSize: 28, marginBottom: 12 }}>
                  ${Number.parseFloat(recipeToDisplay.price || 0).toFixed(2)}
                </div>

                <div className="d-flex gap-3 align-items-center mb-3">
                  <div className="fw-semibold" style={{ fontSize: 16 }}>Quantity:</div>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      className="btn btn-outline-secondary px-3 py-1"
                      onClick={() => {
                        const value = parseInt(selectedQuantity) || 1;
                        setSelectedQuantity(Math.max(1, value - 1));
                      }}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      className="form-control text-center"
                      style={{ maxWidth: 50, height: 30, fontWeight: 'bold', borderRadius: '8px' }}
                      value={selectedQuantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setSelectedQuantity('');
                        } else {
                          const num = parseInt(value);
                          if (!isNaN(num) && num > 0) {
                            setSelectedQuantity(num);
                          }
                        }
                      }}
                    />
                    <button
                      className="btn btn-outline-secondary px-3 py-1"
                      onClick={() => {
                        const value = parseInt(selectedQuantity) || 1;
                        setSelectedQuantity(value + 1);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="fw-semibold" style={{ fontSize: 16 }}>Voucher</div>
                    <button
                      type="button"
                      className="btn-link p-0 fw-semibold bg-white small"
                      style={{ textDecoration: 'underline', color: '#36B0C2', transition: 'color 0.2s ease-in-out', border: 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'rgb(43 137 151)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#36B0C2')}
                      onClick={() => setVoucherModalOpen(true)}
                      title="Select voucher"
                      aria-label="Select voucher"
                    >
                      {selectedVoucher ? 'Change' : 'Select Voucher'}
                    </button>
                  </div>
                  <div className='border rounded-3 p-2 mt-2'>
                    {selectedVoucher ? (
                      <div className="mt-2 d-flex align-items-center justify-content-between">
                        <div>
                          <div className="fw-semibold text-black">{selectedVoucher.title || selectedVoucher.code}</div>
                          <div className="text-success small">
                            {selectedVoucher.type === 'percent'
                              ? `Discount ${selectedVoucher.value}%`
                              : `Discount $${Number(selectedVoucher.value || 0).toFixed(2)}`}
                          </div>
                          {voucherError && <div className="small text-danger mt-1">{voucherError}</div>}
                        </div>
                        <span
                          className='small'
                          onClick={handleClearVoucher}
                          style={{ color: '#DC3545', textDecoration: 'underline', transition: 'color 0.2s ease-in-out', cursor: 'pointer' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#920614ff')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#DC3545')}
                        >
                          Remove
                        </span>
                      </div>
                    ) : (
                      <div className="mt-2 text-muted small">No voucher applied.</div>
                    )}
                  </div>
                </div>

                <div className="mb-1 text-muted">
                  Subtotal: <span style={{ color: 'black' }}>${subtotal.toFixed(2)}</span>
                </div>

                <div className="mb-0 text-muted">
                  Shipping fee: <span style={{ color: 'black' }}>${shippingFee}</span>
                </div>

                {selectedVoucher && (
                  <div className="text-muted">
                    <p className='mt-1 mb-0'>
                      <span className='text-muted'>Discount:</span>
                      <span className='text-success'> -${discount.toFixed(2)}</span>
                    </p>
                  </div>
                )}

                <div className="mb-3 mt-2">
                  <strong>Total: </strong>
                  <span className="text-danger fw-semibold" style={{ fontSize: 20 }}>
                    ${totalAfterVoucher.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 mt-auto w-100">
                <button className="btn btn-lg buy-btn flex-grow-1" onClick={handleConfirmQuantity} disabled={!!voucherError}>
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {voucherModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: 'rgba(0,0,0,0.4)', zIndex: 2000 }}
          onClick={() => setVoucherModalOpen(false)}
        >
          <div
            className="bg-white rounded shadow p-3 position-relative"
            style={{ width: 520, maxWidth: '90%', margin: '10vh auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn btn-outline-secondary position-absolute"
              style={{ top: 9, right: 11, borderRadius: '50%', width: 25, height: 25, padding: 0, fontSize: 20, lineHeight: 1 }}
              onClick={() => setVoucherModalOpen(false)}
              tabIndex={0}
              aria-label="Close"
            >
              &times;
            </button>

            <h5 className="m-0 mb-3">Choose voucher</h5>

            {vouchers.length === 0 ? (
              <div className="text-muted">No available vouchers</div>
            ) : (
              <div className="list-group">
                {vouchers.map((v) => (
                  <button
                    key={`voucher-${v.id || v.code}`}
                    type="button"
                    className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${(selectedVoucher?.id === v.id || selectedVoucher?.code === v.code) ? 'active' : ''
                      }`}
                    onClick={() => handleChooseVoucher(v)}
                    disabled={v.isEligible === false}
                    title={
                      v.isEligible === false
                        ? v.user_remaining_uses === 0
                          ? 'You have reached the usage limit for this voucher'
                          : v.remaining_uses === 0
                            ? 'Voucher usage limit reached (global)'
                            : v.login_require && !localStorage.getItem('token')
                              ? 'Requires login'
                              : v.minOrderValue
                                ? `Requires minimum order $${Number(v.minOrderValue).toFixed(2)}`
                                : ''
                        : ''
                    }
                  >
                    <div className="text-start">
                      <div className="fw-semibold">{v.title || v.code}</div>

                      <div className="small">
                        {v.type === 'percent'
                          ? `Discount ${Number(v.value || 0)}%`
                          : `Discount $${Number(v.value || 0).toFixed(2)}`}
                        {v.minOrderValue ? ` • Min $${Number(v.minOrderValue).toFixed(2)}` : ''}
                        {v.maxDiscount != null ? ` • Max $${Number(v.maxDiscount).toFixed(2)}` : ''}
                      </div>

                      {v.end_date && (
                        <div className="small text-muted">Expiry: {new Date(v.end_date).toLocaleDateString()}</div>
                      )}

                      {v.remaining_uses != null && (
                        <div className="small text-muted">Global remaining: {Math.max(0, v.remaining_uses)}</div>
                      )}

                      {v.user_usage_limit != null && (
                        <div className="small text-muted">
                          You can use: {Math.max(0, v.user_usage_limit - (v.user_used_count || 0))} times left
                        </div>
                      )}

                      {v.user_remaining_uses != null && (
                        <div className="small text-muted">You can use: {v.user_remaining_uses} times left</div>
                      )}
                    </div>

                    <span className={`badge ${v.isEligible === false ? 'bg-secondary' : 'bg-light text-dark'}`}>
                      {v.isEligible === false ? 'Not eligible' : 'Select'}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {selectedVoucher && (
              <div className="d-flex justify-content-end mt-3">
                <p
                  className='small'
                  style={{ color: '#DC3545', textDecoration: 'underline', transition: 'color 0.2s ease-in-out', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#920614ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#DC3545')}
                  onClick={handleClearVoucher}
                >
                  Remove voucher
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h4>✅ Add to cart successfully!</h4>
            <p>You have successfully added your dish to your cart</p>
            <div className='popup-btn'>
              <button onClick={() => setShowSuccess(false)} className="popup-confirm">Buy More</button>
              <button onClick={() => navigate('/cart')} className="popup-confirm">Go to Cart</button>
            </div>
          </div>
        </div>
      )}

      {showRemove && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h4> Are you sure to remove this dish from your cart ? </h4>
            <div className='popup-btn'>
              <button onClick={() => {
                const cartItem = cartItems.find(c => c.mealId === recipeToDisplay.id);
                if (cartItem) removeFromCart(cartItem);
                setShowRemove(false);
              }} className="popup-confirm">Yes</button>
              <button onClick={() => setShowRemove(false)} className="popup-remove">No</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecipeDetailComponent;
