import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Home.css';
import { Link } from 'react-router-dom';
import Fire from '../images/Home/Fire.png'

export default function FavouritePage({ favourites, removeFromFavourites }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [ingredientSearch, setIngredientSearch] = useState('');
    const [selectedDiet, setSelectedDiet] = useState('all');
    const [filteredFavourites, setFilteredFavourites] = useState(favourites);
    const navigate = useNavigate();

    const uniqueDiets = [...new Set(favourites.flatMap(dish => dish.diet || []).filter(Boolean))];

    useEffect(() => {
        let currentFiltered = favourites;

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentFiltered = currentFiltered.filter(dish =>
                dish.title && dish.title.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }

        if (ingredientSearch) {
            const lowerCaseIngredientSearch = ingredientSearch.toLowerCase().split(',').map(item => item.trim());
            currentFiltered = currentFiltered.filter(dish =>
                dish.ingredients && lowerCaseIngredientSearch.every(searchIng =>
                    dish.ingredients.some(recipeIng =>
                        recipeIng.toLowerCase().includes(searchIng)
                    )
                )
            );
        }

        if (selectedDiet !== 'all') {
            currentFiltered = currentFiltered.filter(dish =>
                Array.isArray(dish.diet) && dish.diet.some(d => d.toLowerCase() === selectedDiet.toLowerCase())
            );
        }

        setFilteredFavourites(currentFiltered);
    }, [favourites, searchTerm, ingredientSearch, selectedDiet]);

    const getDietBadgeStyles = (dietItem) => {
        if (typeof dietItem !== 'string') {
            return { backgroundColor: '#e0e0e0', color: '#424242' };
        }
        const normalized = dietItem.toLowerCase().replace(/\s+/g, '-');
        const colorMap = {
            vegan: ['#e6f4ea', '#2c7a4b'],
            keto: ['#f3e8fd', '#7e57c2'],
            'gluten-free': ['#fff4e5', '#ef6c00'],
            paleo: ['#e1f5fe', '#0277bd'],
            'low-carb': ['#fdeaea', '#c62828'],
            vegetarian: ['#e7fbe9', '#388e3c'],
            'dairy-free': ['#f1f8e9', '#689f38'],
            'whole30': ['#e3f2fd', '#1565c0'],
        };
        const [bgColor, textColor] = colorMap[normalized] || ['#e0f7fa', '#00796b'];
        return { backgroundColor: bgColor, color: textColor };
    };

    return (
        <div className="bg-light py-5" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <div className="container">
                <h2 className='fs-2 fw-bold mb-5'>Your Favorite Dishes</h2>

                <section className="mb-5 p-4 bg-white rounded-3 shadow-sm">
                    <h4 className="mb-4">Search and Filter</h4>
                    <div className="row g-3 align-items-end">
                        <div className="col-md-8">
                            <label htmlFor="keywordSearch" className="form-label visually-hidden">Search by name</label>
                            <input
                                type="text"
                                className="form-control rounded-pill px-4 py-2"
                                id="keywordSearch"
                                placeholder="Search by dish name..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="col-md-4">
                            <label htmlFor="dietType" className="form-label visually-hidden">Diet type</label>
                            <select
                                className="form-select rounded-pill px-4 py-2"
                                id="dietType"
                                value={selectedDiet}
                                onChange={e => setSelectedDiet(e.target.value)}
                            >
                                <option value="all">All Diets</option>
                                {uniqueDiets.map((dietItem, idx) => (
                                    <option key={idx} value={typeof dietItem === 'string' ? dietItem.toLowerCase() : ''}>
                                        {dietItem}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {filteredFavourites.length === 0 ? (
                    <div className="text-center p-5 bg-white rounded-3 shadow-sm">
                        <p className="lead text-muted">No favorite dishes yet.</p>
                        <p className="text-muted">Find and add your favorite dishes! <Link
                            to='/categories'
                            style={{
                                textDecoration: 'underline',
                                color: '#36B0C2',
                                transition: 'color 0.3s ease-in-out',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(43 137 151)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#36B0C2'}
                        >Go to Categories</Link></p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {filteredFavourites.map((dish, index) => (
                            <div className="col-12" key={index}>
                                <div className="d-flex flex-column flex-md-row p-4 align-items-center bg-white rounded-3 shadow-sm hover-scale-effect">
                                    <img
                                        src={dish.image}
                                        alt={dish.title}
                                        className="rounded-3 me-md-4 mb-3 mb-md-0"
                                        style={{
                                            width: '150px',
                                            height: '150px',
                                            objectFit: 'cover',
                                            flexShrink: 0,
                                        }}
                                    />
                                    <div className="flex-grow-1 text-md-start">
                                        <h5 className="fw-bold mb-2 fs-4">{dish.title}</h5>
                                        <p className="mb-2 text-muted"><img src={Fire} className="fire-icon" /> {dish.calories} calories</p>
                                        <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
                                            {Array.isArray(dish.diet) && dish.diet.map((dietItem, dietIdx) => (
                                                <span
                                                    key={dietIdx}
                                                    className="badge rounded-pill px-3 py-1"
                                                    style={getDietBadgeStyles(dietItem)}
                                                >
                                                    {dietItem}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column flex-md-row gap-2 mt-3 mt-md-0">
                                        <button
                                            className="btn btn-danger rounded-pill px-4 py-2"
                                            onClick={() => removeFromFavourites(dish)}
                                        >
                                            <i className="bi bi-trash me-2"></i> Remove
                                        </button>
                                        <button
                                            className="btn btn-primary rounded-pill px-4 py-2"
                                            onClick={() => navigate(`/dish/${encodeURIComponent(dish.title)}`)}
                                        >
                                            <i className="bi bi-eye me-2"></i> View Dish
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .hover-scale-effect {
                    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                }
                .hover-scale-effect:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
                }
            `}</style>
        </div>
    );
}
