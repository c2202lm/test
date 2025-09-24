import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Swiper from 'swiper';
import 'swiper/css/bundle';
import { Autoplay, Pagination } from 'swiper/modules';
import '../css/Home.css';
import Slide from '../components/Slide.jsx';
import RecipeCard from '../components/RecipeCard.jsx';
import Post from '../components/Post.jsx';

import Pancake from '../images/Home/Breakfast.png';
import Salad from '../images/Home/Lunch.png';
import Spaghetti from '../images/Home/Dinner.png';
import Cookie from '../images/Home/Snacks.png';
import Smoothie from '../images/Home/Smoothies.png';
import Ads from '../images/Home/Ads.png';
import Cheff1 from '../images/Home/Cheff1.png';
import Cheff2 from '../images/Home/Cheff2.png';

export default function Home({
  favourites,
  addToFavourites,
  removeFromFavourites,
  addToOrders,
  cartItems,
  addToCart,
  removeFromCart
}) {
  const [recipesData, setRecipesData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [heroSlidesData, setHeroSlidesData] = useState([]);

  const allCategories = ['breakfast', 'lunch', 'dinner', 'snacks', 'smoothies'];

  const categoryDisplayNames = {
    breakfast: 'Breakfast Delights',
    lunch: 'Lunch Specials',
    dinner: 'Dinner Inspirations',
    snacks: 'Healthy Snacks',
    smoothies: 'Refreshing Smoothies',
  };

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/meals', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        if (!res.ok) throw new Error('Failed to fetch meals');

        const data = await res.json();

        const formatted = data.map(meal => {
          const authorName =
            meal.chef?.name ||
            meal.chef_name ||
            meal.author?.name ||
            meal.user?.name ||
            meal.created_by?.name ||
            'Unknown Chef';

          const authorImageFromApi =
            meal.chef?.avatar ||
            meal.chef?.image ||
            meal.chef_avatar ||
            meal.chef_image ||
            meal.author?.image ||
            meal.user?.avatar ||
            meal.created_by?.avatar ||
            meal.author_image ||
            '';

          const authorImage = authorImageFromApi || Cheff1;

          const authorDateRaw =
            meal.published_at ||
            meal.created_at ||
            meal.updated_at ||
            null;

          const authorDate = authorDateRaw
            ? new Date(authorDateRaw).toLocaleDateString()
            : 'N/A';

          return {
            id: meal.id,
            title: meal.name || '',
            description: meal.description || '',
            calories: meal.calories || 0,
            image: meal.image || '',
            diet: meal.diet_types?.map(d => d.dietType) || [],
            ingredients: Array.isArray(meal.ingredients) ? meal.ingredients.map(i => i.name) : [],
            category: meal.meal_type?.mealType ? meal.meal_type.mealType.toLowerCase() : 'uncategd',
            price: meal.price || 0,
            allergies: meal.allergens?.map(a => a.allergen) || [],
            tagBadge: meal.tagBadge || 'Hot Dish',
            time: meal.cooking_time || '30 mins',
            authorImage,
            authorName,
            authorDate,
          };
        });

        setRecipesData(formatted);
        setHeroSlidesData(formatted.slice(0, 6));

        const CATEGORY_ORDER = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack'];
        const categoriesFromData = [...new Set(formatted.map(m => m.category))];

        const sortedCategories = categoriesFromData.sort((a, b) => {
          const indexA = CATEGORY_ORDER.indexOf(a);
          const indexB = CATEGORY_ORDER.indexOf(b);
          if (indexA === -1 && indexB === -1) return a.localeCompare(b);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        setCategories(sortedCategories);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMeals();
  }, []);

  Swiper.use([Pagination, Autoplay]);

  useEffect(() => {
    if (heroSlidesData.length > 0) {
      const swiper = new Swiper('.mySwiper', {
        slidesPerView: 3,
        spaceBetween: 30,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
        },
        breakpoints: {
          768: {
            slidesPerView: 1,
          },
        },
        modules: [Pagination, Autoplay],
      });

      return () => swiper.destroy(true, true);
    }
  }, [heroSlidesData]);

  const instagramPostsData = [
    { likes: '44,686', date: 'September 19' },
    { likes: '32,123', date: 'October 01' },
    { likes: '50,000', date: 'October 10' },
    { likes: '60,500', date: 'November 05' },
  ];

  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const handleRatingChange = (newRating) => {
    setRating(newRating);
    setFeedbackError('');
  };

  const handleFeedbackSubmit = async (e) => {
  e.preventDefault();
  setFeedbackMessage('');
  setFeedbackError('');

  if (rating === 0) {
    setFeedbackError('Please select a rating before submitting.');
    return;
  }

  try {
    const res = await fetch('http://localhost:8000/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        rating: rating,
        message: feedbackText,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to submit feedback');
    }

    const data = await res.json();
    console.log('Feedback saved:', data);

    setRating(0);
    setFeedbackText('');
    setFeedbackMessage('Thank you for your feedback!');
  } catch (err) {
    console.error(err);
    setFeedbackError('Something went wrong. Please try again later.');
  }
};

  return (
    <div className="home-page">
      <section className="mt-4 container hero-section mb-custom-spacing">
        <div className="swiper mySwiper">
          <div className="swiper-wrapper">
            {heroSlidesData.map((slide, index) => (
              <Slide key={index} {...slide} />
            ))}
          </div>
        </div>
      </section>

      <section className="container mb-custom-spacing">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="mb-0">Categories</h3>
          <Link to="/categories" className="btn btn-outline-secondary rounded-pill px-3 py-2">
            View All Categories
          </Link>
        </div>
        <div className="row text-center g-4">
          {allCategories.map(category => (
            <div className="col" key={category}>
              <div className="category-wrapper">
                <Link to={`/categories?category=${category}#${category}-title`} className="category-clickable-area">
                  <img
                    src={{
                      breakfast: Pancake,
                      lunch: Salad,
                      dinner: Spaghetti,
                      snacks: Cookie,
                      smoothies: Smoothie,
                    }[category]}
                    alt={categoryDisplayNames[category]}
                    className="category-icon mb-2"
                  />
                  <div>{categoryDisplayNames[category]}</div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mb-custom-spacing">
        <section className="container text-center mb-4">
          <h2 className="fw-bold mb-3">Simple and tasty dishes</h2>
          <p className="text-muted mb-5">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliquat enim ad minim
          </p>
        </section>
        <div className="row g-4">
          {heroSlidesData.slice(0, 9).map((dish, index) => (
            <div className="col-md-4" key={index}>
              {index === 5 ? (
                <div className="card h-100 border-0 shadow-sm">
                  <img
                    src={Ads}
                    alt="Advertisement"
                    className="img-fluid rounded"
                    style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                  />
                </div>
              ) : (
                <RecipeCard
                  {...dish}
                  favourites={favourites}
                  addToFavourites={addToFavourites}
                  removeFromFavourites={removeFromFavourites}
                  addToOrders={addToOrders}
                  cartItems={cartItems}
                  addToCart={addToCart}
                  removeFromCart={removeFromCart}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <section
        className="container mb-custom-spacing"
        style={{
          backgroundColor: '#fff',
          borderRadius: '1.5rem',
          overflow: 'hidden',
        }}
      >
        <div className="row align-items-center">
          <div className="col-md-6 px-5 py-5">
            <h2 className="fw-bold mb-3 display-5">
              Everyone can be a <br /> chef in their own kitchen
            </h2>
            <p className="text-muted mb-4 fs-5">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
            </p>
            <Link to="/about" className="btn btn-dark px-4 py-2 rounded-pill">Learn More</Link>
          </div>
          <div className="col-md-6 p-0">
            <img
              src={Cheff1}
              alt="Chef"
              className="img-fluid w-100"
              style={{
                objectFit: 'cover',
                height: '100%',
              }}
            />
          </div>
        </div>
      </section>

      <section className="container mb-custom-spacing">
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-3 display-5">
            Check out @foodieland on Instagram
          </h2>
          <p className="text-muted mb-4 fs-5 mx-auto" style={{ maxWidth: '700px' }}>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
          </p>
        </div>
        <div className="row g-4 justify-content-center">
          {instagramPostsData.map((post, index) => (
            <div className="col-lg-3 col-md-6 col-sm-10" key={index}>
              <Post {...post} index={index} />
            </div>
          ))}
        </div>
        <div className="text-center mt-5">
          <a href="#" className="btn btn-dark px-4 py-2 rounded-pill d-inline-flex align-items-center">
            Visit Our Instagram <i className="bi bi-instagram ms-2"></i>
          </a>
        </div>
      </section>

      <section
        className="container mb-custom-spacing"
        style={{
          backgroundColor: '#fff',
          borderRadius: '1.5rem',
          overflow: 'hidden',
        }}
      >
        <div className="row align-items-stretch">
          <div className="col-md-7 px-5 py-5 d-flex flex-column justify-content-center">
            <div className="feedback-content-wrapper w-100">
              <h2 className="fw-bold mb-3 display-5 text-dark-blue">Submit Your Feedback</h2>
              <p className="text-muted mb-4 fs-5">
                We'd love to hear your thoughts to improve our website!
              </p>
              <form onSubmit={handleFeedbackSubmit} className="feedback-form">
                <div className="mb-4">
                  <label className="form-label d-block mb-3 text-dark-blue">
                    Rate our website interface:
                  </label>
                  <div className="star-rating d-flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`bi ${star <= rating ? 'bi-star-fill' : 'bi-star'}`}
                        onClick={() => handleRatingChange(star)}
                        style={{
                          cursor: 'pointer',
                          fontSize: '2.5rem',
                          color: star <= rating ? '#ffc107' : '#dee2e6',
                          transition: 'transform 0.2s ease-in-out'
                        }}
                      ></i>
                    ))}
                  </div>
                  {feedbackError && (
                    <div className="text-danger mt-2">{feedbackError}</div>
                  )}
                </div>

                {rating > 0 && (
                  <div className="mb-4">
                    <label htmlFor="feedbackText" className="form-label text-dark-blue">Your Feedback:</label>
                    <textarea
                      className="form-control"
                      id="feedbackText"
                      rows="5"
                      placeholder="Write your feedback here (optional)..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                    ></textarea>
                  </div>
                )}

                <button type="submit" className="btn btn-outline-secondary rounded-pill px-4 py-2">
                  Submit Feedback
                </button>
                {feedbackMessage && (
                  <div className="text-success mt-3">{feedbackMessage}</div>
                )}
              </form>
            </div>
          </div>
          <div className="col-md-5 p-0 d-flex align-items-end justify-content-center">
            <img
              src={Cheff2}
              alt="Cheff2"
              className="img-fluid"
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                marginBottom: '0',
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
