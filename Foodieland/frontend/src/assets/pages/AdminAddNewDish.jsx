import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import '../css/AdminAddNewDish.css';

const MEAL_TYPE_OPTIONS = ["Breakfast", "Lunch", "Dinner", "Snacks", "Smoothies"];

export default function AdminAddNewDish() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [allDietTypes, setAllDietTypes] = useState([]);
    const [selectedDietTypeIds, setSelectedDietTypeIds] = useState([]);

    const [allAllergens, setAllAllergens] = useState([]);
    const [selectedAllergenIds, setSelectedAllergenIds] = useState([]);

    const [currentDish, setCurrentDish] = useState({
        title: "",
        image: "",
        mealType: "",
        price: "",
        description: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        prep_time: "",
        ingredients: []
    });
    const [tempIngredientsString, setTempIngredientsString] = useState("");

    useEffect(() => {
        // fetch diet types
        fetch("http://localhost:8000/api/diet-types")
            .then(res => res.json())
            .then(data => setAllDietTypes(data))
            .catch(err => console.error("Failed to fetch diet types", err));

        // fetch allergens
        fetch("http://localhost:8000/api/allergens")
            .then(res => res.json())
            .then(data => setAllAllergens(data))
            .catch(err => console.error("Failed to fetch allergens", err));
    }, []);

    useEffect(() => {
        if (!isEditing) return;
        const token = localStorage.getItem("token");

        fetch(`http://localhost:8000/api/admin/meals/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
            .then(res => {
                if (!res.ok) throw new Error('Fetch failed');
                return res.json();
            })
            .then(meal => {
                setCurrentDish({
                    title: meal.name || "",
                    image: meal.image || "",
                    mealType: meal.mealType?.mealType || "",
                    price: meal.price != null ? String(meal.price) : "",
                    description: meal.description || "",
                    calories: meal.calories != null ? String(meal.calories) : "",
                    protein: meal.protein != null ? String(meal.protein) : "",
                    carbs: meal.carbs != null ? String(meal.carbs) : "",
                    fat: meal.fat != null ? String(meal.fat) : "",
                    prep_time: meal.prep_time != null ? String(meal.prep_time) : "",
                    ingredients: meal.ingredients || []
                });

                setTempIngredientsString(
                    Array.isArray(meal.ingredients) ? meal.ingredients.join(", ") : ""
                );

                // set selected diet type ids from backend
                setSelectedDietTypeIds(
                    Array.isArray(meal.dietTypes) ? meal.dietTypes.map(dt => dt.id) : []
                );

                // set selected allergens
                setSelectedAllergenIds(
                    Array.isArray(meal.allergens) ? meal.allergens.map(a => a.id) : []
                );
            })
            .catch(err => console.error("Fetch meal detail failed:", err));
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentDish(prev => ({ ...prev, [name]: value }));
    };

    const handleTempIngredientsChange = (e) => {
        setTempIngredientsString(e.target.value);
    };

    const handleDietTypeToggle = (id) => {
        setSelectedDietTypeIds(prev =>
            prev.includes(id) ? prev.filter(did => did !== id) : [...prev, id]
        );
    };

    const handleAllergenToggle = (id) => {
        setSelectedAllergenIds(prev =>
            prev.includes(id) ? prev.filter(aid => aid !== id) : [...prev, id]
        );
    };

    const [newDish, setNewDish] = useState(false);
    const [newUpdate, setNewUpdate] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        const parsedIngredients = tempIngredientsString
            .split(",")
            .map(x => x.trim())
            .filter(Boolean);

        const mealTypeMap = {
            Breakfast: 1,
            Lunch: 2,
            Dinner: 3,
            Snacks: 4,
            Smoothies: 5
        };
        const mealTypeId = mealTypeMap[currentDish.mealType] || null;

        const mealData = {
            name: currentDish.title,
            description: currentDish.description || null,
            calories: currentDish.calories ? parseInt(currentDish.calories) : 0,
            protein: currentDish.protein ? parseFloat(currentDish.protein) : 0,
            carbs: currentDish.carbs ? parseFloat(currentDish.carbs) : 0,
            fat: currentDish.fat ? parseFloat(currentDish.fat) : 0,
            prep_time: currentDish.prep_time ? parseInt(currentDish.prep_time) : 0,
            price: currentDish.price ? parseFloat(currentDish.price) : 0,
            image: currentDish.image || null,
            mealType_ID: mealTypeId,
            diet_types: selectedDietTypeIds,
            ingredients: parsedIngredients,
            allergens: selectedAllergenIds
        };

        const url = isEditing
            ? `http://localhost:8000/api/admin/meals/${id}`
            : "http://localhost:8000/api/admin/meals";

        const method = isEditing ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify(mealData)
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error("Save failed:", res.status, errText);
                alert("Save failed! Check console for details.");
                return;
            }

            const updated = await res.json();

            // update UI states after saving
            setSelectedDietTypeIds(Array.isArray(updated.dietTypes) ? updated.dietTypes.map(dt => dt.id) : []);
            setSelectedAllergenIds(Array.isArray(updated.allergens) ? updated.allergens.map(a => a.id) : []);
            setTempIngredientsString(Array.isArray(updated.ingredients) ? updated.ingredients.join(", ") : "");
            if (isEditing) {
                setNewUpdate(true);
            } else {
                setNewDish(true);
            };
            
        } catch (err) {
            console.error("Save error:", err);
            alert("Save failed! Check console for details.");
        }
    };

    return (
        <div className="container py-5" style={{ maxWidth: 1200 }}>
            <h2 className="fw-bold mb-5 fs-1 text-gray-800">{isEditing ? "Edit Dish" : "Add New Dish"}</h2>

            <section className="p-4 bg-white rounded-3 shadow-lg">
                <form onSubmit={handleSubmit} className="row g-4">

                    <div className="col-md-6">
                        <label className="form-label fw-bold">Title</label>
                        <input type="text" name="title" value={currentDish.title} onChange={handleChange} className="form-control" required />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-bold">Image URL</label>
                        <input type="text" name="image" value={currentDish.image} onChange={handleChange} className="form-control" />
                    </div>

                    <div className="col-12">
                        <label className="form-label fw-bold">Diet Types</label>
                        <div className="d-flex flex-wrap gap-3">
                            {allDietTypes.map(dt => (
                                <div key={dt.id} className="form-check">
                                    <input
                                        id={`diet-${dt.id}`}
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={selectedDietTypeIds.includes(dt.id)}
                                        onChange={() => handleDietTypeToggle(dt.id)}
                                    />
                                    <label htmlFor={`diet-${dt.id}`} className="form-check-label">{dt.dietType}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-12">
                        <label className="form-label fw-bold">Allergens</label>
                        <div className="d-flex flex-wrap gap-3">
                            {allAllergens.map(a => (
                                <div key={a.id} className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`allergen-${a.id}`}
                                        checked={selectedAllergenIds.includes(a.id)}
                                        onChange={() => handleAllergenToggle(a.id)}
                                    />
                                    <label className="form-check-label" htmlFor={`allergen-${a.id}`}>{a.allergen}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-md-4">
                        <label className="form-label fw-bold">Price</label>
                        <input type="number" step="0.01" name="price" value={currentDish.price} onChange={handleChange} className="form-control" />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label fw-bold">Meal Type</label>
                        <select name="mealType" value={currentDish.mealType} onChange={handleChange} className="form-select">
                            <option value="">Select Meal Type</option>
                            {MEAL_TYPE_OPTIONS.map(mt => <option key={mt} value={mt}>{mt}</option>)}
                        </select>
                    </div>

                    <div className="col-12">
                        <label className="form-label fw-bold">Description</label>
                        <textarea name="description" value={currentDish.description} onChange={handleChange} className="form-control" />
                    </div>

                    <div className="col-md-3">
                        <label className="form-label fw-bold">Calories</label>
                        <input type="number" name="calories" value={currentDish.calories} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label fw-bold">Protein</label>
                        <input type="number" step="0.01" name="protein" value={currentDish.protein} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label fw-bold">Carbs</label>
                        <input type="number" step="0.01" name="carbs" value={currentDish.carbs} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label fw-bold">Fat</label>
                        <input type="number" step="0.01" name="fat" value={currentDish.fat} onChange={handleChange} className="form-control" />
                    </div>

                    <div className="col-md-4">
                        <label className="form-label fw-bold">Prep Time (minutes)</label>
                        <input type="number" name="prep_time" value={currentDish.prep_time} onChange={handleChange} className="form-control" />
                    </div>

                    <div className="col-12">
                        <label className="form-label fw-bold">Ingredients (comma-separated)</label>
                        <textarea value={tempIngredientsString} onChange={handleTempIngredientsChange} className="form-control" />
                    </div>

                    <div className="col-12 d-flex justify-content-end gap-3 mt-4">
                        <button type="submit" className="btn btn-primary">{isEditing ? "Update Dish" : "Add Dish"}</button>
                        <button type="button" onClick={() => navigate("/admin/dishes")} className="btn btn-outline-secondary">Cancel</button>
                    </div>

                </form>
            </section>

            {newDish && (
                <div className="popup-overlay">
                    <div className="popup-box">
                        <h4>✅ Meal add successfully!</h4>
                        <p>You has successfully added a new meal !</p>
                        <button onClick={() =>  {
                            setNewDish(false);
                            navigate("/admin/dishes", { state: { refresh: true } });
                        }} className="popup-confirm">Create More</button>
                    </div>
                </div>
            )}

            {newUpdate && (
                <div className="popup-overlay">
                    <div className="popup-box">
                        <h4>✅ Meal update successfully!</h4>
                        <p>Meal has successfully updated !</p>
                        <button onClick={() => {
                            setNewUpdate(false);
                            navigate("/admin/dishes", { state: { refresh: true } });
                        }} className="popup-confirm">Update More</button>
                    </div>
                </div>
            )}
        </div>
    );
}
