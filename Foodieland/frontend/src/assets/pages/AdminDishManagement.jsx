import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import AdminDishCard from '../components/AdminDishCard.jsx';
import '../css/Categories.css';

const CANONICAL_CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snacks', 'smoothies'];

const AdminDishManagement = ({
    dishes,
    handleDelete,
    favourites,
    addToFavourites,
    removeFromFavourites,
    addToOrders,
    cartItems,
    addToCart,
    removeFromCart
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const [apiDishes, setApiDishes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [ingredientSearch, setIngredientSearch] = useState('');
    const [selectedDiet, setSelectedDiet] = useState('all');
    const [minCalories, setMinCalories] = useState('');
    const [maxCalories, setMaxCalories] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedAllergy, setSelectedAllergy] = useState('all');
    const [showMoreFilters, setShowMoreFilters] = useState(false);
    const [allCategories, setAllCategories] = useState(CANONICAL_CATEGORIES);
    const [categoryDisplayNames, setCategoryDisplayNames] = useState({});
    const [allAllergies, setAllAllergies] = useState(['Gluten-Free', 'Dairy-Free', 'Nut-Free']);

    const fetchMeals = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/meals', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (!res.ok) throw new Error('Failed to fetch meals');

            const data = await res.json();

            const formatted = data.map(meal => ({
                id: meal.id,
                title: meal.name,
                description: meal.description,
                calories: meal.calories,
                image: meal.image,
                diet: Array.isArray(meal.diet_types)
                    ? meal.diet_types.map(d => d.dietType)
                    : meal.diet_type?.dietType
                        ? [meal.diet_type.dietType]
                        : [],
                ingredients: meal.ingredients?.map(i => i.name) || [],
                category: meal.meal_type?.mealType ? meal.meal_type.mealType.toLowerCase() : 'uncategd',
                price: meal.price,
                allergies: Array.isArray(meal.allergens)
                    ? meal.allergens.map(a => a.allergen)
                    : meal.allergen
                        ? [meal.allergen.allergen]
                        : []
            }));

            setApiDishes(formatted);

            const categoriesFromData = [...new Set(formatted.map(m => m.category))];

            const canonicalPresent = CANONICAL_CATEGORIES.filter(c => categoriesFromData.includes(c));
            const others = categoriesFromData.filter(c => !CANONICAL_CATEGORIES.includes(c));
            const orderedCategories = [...canonicalPresent, ...others];

            const finalCategories = orderedCategories.length > 0 ? orderedCategories : categoriesFromData;

            setAllCategories(finalCategories);

            const displayMap = {};
            finalCategories.forEach(c => {
                displayMap[c] = c.charAt(0).toUpperCase() + c.slice(1);
            });

            CANONICAL_CATEGORIES.forEach(c => {
                if (!displayMap[c]) displayMap[c] = c.charAt(0).toUpperCase() + c.slice(1);
            });

            setCategoryDisplayNames(displayMap);

            const allergiesFromData = [...new Set(formatted.flatMap(m => m.allergies))];
            setAllAllergies(allergiesFromData);

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMeals();
    }, []);

    useEffect(() => {
        if (location.state?.refresh) {
            fetchMeals();
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);

    useEffect(() => {
        const lowerSearch = searchTerm.toLowerCase();
        const lowerIngredient = ingredientSearch.toLowerCase();

        const filtered = apiDishes.filter(dish => {
            const matchSearch = lowerSearch === '' || dish.title.toLowerCase().includes(lowerSearch);
            const matchIngredient = lowerIngredient === '' ||
                (dish.ingredients && dish.ingredients.some(ing => ing.toLowerCase().includes(lowerIngredient)));
            const matchDiet = selectedDiet === 'all' ||
                (Array.isArray(dish.diet) && dish.diet.some(d => d.toLowerCase() === selectedDiet.toLowerCase()));
            const matchCalories =
                (minCalories === '' || dish.calories >= parseInt(minCalories)) &&
                (maxCalories === '' || dish.calories <= parseInt(maxCalories));
            const matchCategory = selectedCategory === 'all' ||
                dish.category.toLowerCase() === selectedCategory.toLowerCase();
            const matchAllergy = selectedAllergy === 'all' ||
                (Array.isArray(dish.allergies) && dish.allergies.some(a => a.toLowerCase().includes(selectedAllergy.toLowerCase())));
            return matchSearch && matchIngredient && matchDiet && matchCalories && matchCategory && matchAllergy;
        });

        setFilteredRecipes(filtered);
    }, [searchTerm, ingredientSearch, selectedDiet, minCalories, maxCalories, selectedCategory, selectedAllergy, apiDishes]);

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.substring(1);
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [location.hash]);

    const uniqueDiets = [...new Set(apiDishes.flatMap(dish => dish.diet || []).filter(Boolean))];

    const handleEdit = (id) => navigate(`/admin/dishes/edit/${id}`);
    const [showDelete, setShowDelete] = useState(false);

    const handleDeleteClick = async (id) => {
        try {
            const res = await fetch(`http://localhost:8000/api/admin/meals/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (!res.ok) throw new Error('Failed to delete meal');

            // Cập nhật lại danh sách
            fetchMeals();
            setShowDelete(true);

        } catch (err) {
            console.error(err);
            // Bạn có thể show popup lỗi custom ở đây thay vì alert
        }
    };

    const getRecipesByCategory = (cat) => filteredRecipes.filter(r => r.category === cat);

    const toggleShowMoreFilters = () => setShowMoreFilters(prev => !prev);

    return (
        <div className="container py-5" style={{ maxWidth: 1200 }}>
            <section className="d-flex justify-content-between align-items-center mb-5">
                <h2 className="fw-bold fs-1" style={{ color: '#2c3e50' }}>
                    Dish Management
                </h2>
                <button
                    onClick={() => navigate('/admin/dishes/add')}
                    className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm transition duration-300 ease-in-out transform hover:scale-105"
                >
                    <i className="bi bi-plus-circle me-2"></i> Add New Dish
                </button>
            </section>

            <section className="mb-5 mt-5 p-4 bg-light rounded-3 shadow-sm filter-section">
                <h3 className="mb-4">Search and Filter Dishes</h3>
                <div className="row g-4 align-items-end mb-4">
                    <div className="col-md-4">
                        <label htmlFor="keywordSearch" className="form-label">By Keyword</label>
                        <input
                            type="text"
                            className="form-control rounded-5 px-4 py-2"
                            id="keywordSearch"
                            placeholder="e.g. chicken, salad"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="ingredientSearch" className="form-label">By Ingredient</label>
                        <input
                            type="text"
                            className="form-control rounded-5 px-4 py-2"
                            id="ingredientSearch"
                            placeholder="e.g. rice, avocado"
                            value={ingredientSearch}
                            onChange={e => setIngredientSearch(e.target.value)}
                        />
                    </div>
                    <div className="col-md-4">
                        <label htmlFor="dietType" className="form-label">By Diet Type</label>
                        <select
                            className="form-select rounded-5 px-4 py-2"
                            id="dietType"
                            value={selectedDiet}
                            onChange={e => setSelectedDiet(e.target.value)}
                        >
                            <option value="all">All</option>
                            {uniqueDiets.map((diet, index) => (
                                <option key={index} value={diet.toLowerCase()}>{diet}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={`filter-collapse-content ${showMoreFilters ? 'expanded' : 'collapsed'}`}>
                    <div className="row g-4 align-items-end">
                        <div className="col-md-6">
                            <label htmlFor="minCalories" className="form-label">Calories (Min)</label>
                            <input
                                type="number"
                                className="form-control rounded-5 px-4 py-2"
                                id="minCalories"
                                value={minCalories}
                                onChange={e => setMinCalories(e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="maxCalories" className="form-label">Calories (Max)</label>
                            <input
                                type="number"
                                className="form-control rounded-5 px-4 py-2"
                                id="maxCalories"
                                value={maxCalories}
                                onChange={e => setMaxCalories(e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="mealType" className="form-label">By Meal Type</label>
                            <select
                                className="form-select rounded-5 px-4 py-2"
                                id="mealType"
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                            >
                                <option value="all">All</option>
                                {allCategories.map((cat, i) => (
                                    <option key={i} value={cat}>{categoryDisplayNames[cat]}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="allergyType" className="form-label">By Allergy</label>
                            <select
                                className="form-select rounded-5 px-4 py-2"
                                id="allergyType"
                                value={selectedAllergy}
                                onChange={e => setSelectedAllergy(e.target.value)}
                            >
                                <option value="all">None</option>
                                {allAllergies.map((a, i) => (
                                    <option key={i} value={a.toLowerCase()}>{a}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-4">
                    <button
                        className="btn btn-link text-decoration-none p-0 filter-toggle-button"
                        onClick={toggleShowMoreFilters}
                    >
                        <i className={`bi bi-chevron-down me-2 ${showMoreFilters ? 'rotate-up' : ''}`}></i>
                        {showMoreFilters ? 'Hide Filters' : 'Show More Filters'}
                    </button>
                </div>
            </section>

            {filteredRecipes.length > 0 ? (
                allCategories.map(category => {
                    const dishes = getRecipesByCategory(category);
                    if (dishes.length === 0) return null;
                    return (
                        <section className="mb-5" key={category}>
                            <h3 className="mb-4" id={`${category}-title`}>
                                {categoryDisplayNames[category] || category}
                            </h3>
                            <div className="row g-4">
                                {dishes.map((dish, i) => (
                                    <div className="col-md-3" key={i}>
                                        <AdminDishCard
                                            {...dish}
                                            onEdit={handleEdit}
                                            onDelete={handleDeleteClick}
                                            favourites={favourites}
                                            addToFavourites={addToFavourites}
                                            removeFromFavourites={removeFromFavourites}
                                            addToOrders={addToOrders}
                                            cartItems={cartItems}
                                            addToCart={addToCart}
                                            removeFromCart={removeFromCart}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    );
                })
            ) : (
                <section className="mb-5 text-center">
                    <p className="lead">No dishes found matching your search criteria.</p>
                </section>
            )}

            <style>{`
                .hover-scale-effect {
                    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                }
                .hover-scale-effect:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                }
            `}</style>

            {showDelete && (
                <div className="popup-overlay">
                    <div className="popup-box">
                        <h4>Deleted successfully!</h4>
                        <button onClick={() =>  {
                            setShowDelete(false);
                            navigate("/admin/dishes", { state: { refresh: true } });
                        }} className="popup-confirm">Back to Dish</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDishManagement;