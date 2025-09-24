import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard.jsx';
import '../css/Categories.css';

export default function Categories({ favourites, addToFavourites, removeFromFavourites, addToOrders, cartItems, addToCart, removeFromCart }) {

    const [recipesData, setRecipesData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [ingredientSearch, setIngredientSearch] = useState('');
    const [selectedDiet, setSelectedDiet] = useState('all');
    const [minCalories, setMinCalories] = useState('');
    const [maxCalories, setMaxCalories] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedAllergy, setSelectedAllergy] = useState('all');

    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [showMoreFilters, setShowMoreFilters] = useState(false);

    const [allCategories, setAllCategories] = useState([]);
    const [categoryDisplayNames, setCategoryDisplayNames] = useState({});
    const [allAllergies, setAllAllergies] = useState([]);

    const location = useLocation();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const scrollToCategory = () => {
            const categoryParam = searchParams.get("category");
            if (categoryParam) {
                const element = document.getElementById(`${categoryParam}-title`);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            } else if (location.hash) {
                const id = location.hash.substring(1);
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }
        };

        const timeout = setTimeout(scrollToCategory, 0);

        return () => clearTimeout(timeout);
    }, [location.hash, searchParams, recipesData]);

    useEffect(() => {
        const lowerSearch = searchTerm.toLowerCase();
        const lowerIngredient = ingredientSearch.toLowerCase();
        const minCal = minCalories ? parseInt(minCalories) : null;
        const maxCal = maxCalories ? parseInt(maxCalories) : null;

        const newFiltered = recipesData.filter(dish => {
            const matchesSearch = !lowerSearch || (dish.title && dish.title.toLowerCase().includes(lowerSearch));
            const matchesIngredient = !lowerIngredient || (dish.ingredients?.some(i => i.toLowerCase().includes(lowerIngredient)));
            const matchesDiet = selectedDiet === 'all' || (dish.diet?.some(d => d.toLowerCase() === selectedDiet.toLowerCase()));
            const matchesCalories =
                (minCal === null || dish.calories >= minCal) &&
                (maxCal === null || dish.calories <= maxCal);
            const matchesCategory = selectedCategory === 'all' || (dish.category && dish.category.toLowerCase() === selectedCategory.toLowerCase());
            const matchesAllergy = selectedAllergy === 'all' || (dish.allergies?.some(a => a.toLowerCase().includes(selectedAllergy.toLowerCase())));

            return matchesSearch && matchesIngredient && matchesDiet && matchesCalories && matchesCategory && matchesAllergy;
        });

        setFilteredRecipes(newFiltered);

    }, [searchTerm, ingredientSearch, selectedDiet, minCalories, maxCalories, selectedCategory, selectedAllergy, recipesData]);

    const handleSearchTermChange = (e) => setSearchTerm(e.target.value);
    const handleIngredientSearchChange = (e) => setIngredientSearch(e.target.value);
    const handleDietChange = (e) => setSelectedDiet(e.target.value);
    const handleMinCaloriesChange = (e) => setMinCalories(e.target.value);
    const handleMaxCaloriesChange = (e) => setMaxCalories(e.target.value);
    const handleCategoryChange = (e) => setSelectedCategory(e.target.value);
    const handleAllergyChange = (e) => setSelectedAllergy(e.target.value);

    const getRecipesByCategory = (category) => filteredRecipes.filter(dish => dish.category.toLowerCase() === category.toLowerCase());

    const toggleShowMoreFilters = () => setShowMoreFilters(prev => !prev);

    useEffect(() => {
        const fetchMeals = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/meals', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });

                if (!res.ok) throw new Error('Failed to fetch meals');

                const data = await res.json();

                const formatted = data.map(meal => ({
                    id: meal.id,
                    title: meal.name || '',
                    description: meal.description || '',
                    calories: meal.calories || 0,
                    image: meal.image || '',
                    diet: meal.diet_types?.map(d => d.dietType) || [],
                    ingredients: Array.isArray(meal.ingredients) ? meal.ingredients.map(i => i.name) : [],
                    category: meal.meal_type?.mealType ? meal.meal_type.mealType.toLowerCase() : 'uncategd',
                    price: meal.price || 0,
                    allergies: meal.allergens?.map(a => a.allergen) || []
                }));

                setRecipesData(formatted);

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

                setAllCategories(sortedCategories);

                const displayMap = {};
                sortedCategories.forEach(c => {
                    displayMap[c] = c.charAt(0).toUpperCase() + c.slice(1);
                });
                setCategoryDisplayNames(displayMap);

                const allergiesFromData = [...new Set(formatted.flatMap(m => m.allergies))];
                setAllAllergies(allergiesFromData);

            } catch (err) {
                console.error(err);
            }
        };

        fetchMeals();
    }, []);

    const uniqueDiets = [...new Set(recipesData.flatMap(dish => dish.diet || []).filter(Boolean))];

    return (
        <div className="categories-page">
            <section className="container mb-5 mt-5 p-4 bg-light rounded-3 shadow-sm filter-section">
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
                            onChange={handleSearchTermChange}
                        />
                    </div>

                    <div className="col-md-4">
                        <label htmlFor="ingredientSearch" className="form-label">By Ingredient</label>
                        <input
                            type="text"
                            className="form-control rounded-5 px-4 py-2"
                            id="ingredientSearch"
                            placeholder="e.g. rice, avocado, tomato"
                            value={ingredientSearch}
                            onChange={handleIngredientSearchChange}
                        />
                    </div>

                    <div className="col-md-4">
                        <label htmlFor="dietType" className="form-label">By Diet Type</label>
                        <select
                            className="form-select rounded-5 px-4 py-2"
                            id="dietType"
                            value={selectedDiet}
                            onChange={handleDietChange}
                        >
                            <option value="all">All</option>
                            {uniqueDiets.map((dietItem, index) => (
                                <option key={index} value={dietItem.toLowerCase()}>{dietItem}</option>
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
                                placeholder="From"
                                value={minCalories}
                                onChange={handleMinCaloriesChange}
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="maxCalories" className="form-label">Calories (Max)</label>
                            <input
                                type="number"
                                className="form-control rounded-5 px-4 py-2"
                                id="maxCalories"
                                placeholder="To"
                                value={maxCalories}
                                onChange={handleMaxCaloriesChange}
                            />
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="mealType" className="form-label">By Meal Type</label>
                            <select
                                className="form-select rounded-5 px-4 py-2"
                                id="mealType"
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                            >
                                <option value="all">All</option>
                                {allCategories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {categoryDisplayNames[category]}
                                    </option>

                                ))}
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="allergyType" className="form-label">By Allergy</label>
                            <select
                                className="form-select rounded-5 px-4 py-2"
                                id="allergyType"
                                value={selectedAllergy}
                                onChange={handleAllergyChange}
                            >
                                <option value="all">None</option>
                                {allAllergies.map((allergy, index) => (
                                    <option key={index} value={allergy.toLowerCase()}>{allergy}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-4">
                    <button
                        className="btn btn-link text-decoration-none p-0 filter-toggle-button"
                        onClick={toggleShowMoreFilters}
                        aria-expanded={showMoreFilters}
                        aria-controls="filterCollapseContent"
                    >
                        <i className={`bi bi-chevron-down me-2 ${showMoreFilters ? 'rotate-up' : ''}`}></i>
                        {showMoreFilters ? 'Hide Filters' : 'Show More Filters'}
                    </button>
                </div>
            </section>

            <div className="container">
                {filteredRecipes.length > 0 ? (
                    <>
                        {allCategories.map(category => {
                            const recipesForCategory = getRecipesByCategory(category);
                            if (recipesForCategory.length > 0) {
                                const displayCategory = categoryDisplayNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
                                return (
                                    <section className="container mb-5" key={category}>
                                        <h3 className="mb-4" id={`${category}-title`}>
                                            {displayCategory}
                                        </h3>
                                        <div className="row g-4">
                                            {recipesForCategory.map((dish, index) => (
                                                <div className="col-md-3" key={index}>
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
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                );
                            }
                            return null;
                        })}
                    </>
                ) : (
                    <section className="container mb-5 text-center">
                        <p className="lead">No dishes found matching your search criteria.</p>
                    </section>
                )}
            </div>
        </div>
    );
}
