import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
    const [user, setUser] = useState({
        name: "",
        email: "",
        phone: "",
        gender: "",
        dateOfBirth: "",
        height: "",
        weight: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [originalUser, setOriginalUser] = useState(null);

    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/admin/profile", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (!res.ok) throw new Error("Failed to fetch user profile");

                const data = await res.json();

                const fetchedUser = {
                    name: data.name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    gender: data.gender || "",
                    dateOfBirth: data.dateOfBirth || "",
                    height: data.height || "",
                    weight: data.weight || "",
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                };

                setUser(fetchedUser);
                setOriginalUser(fetchedUser);
            } catch (err) {
                console.error("Error fetching profile:", err);
            }
        };

        fetchUser();
    }, []);

    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [showBackToDashboard, setShowBackToDashboard] = useState(false);
    const [showFailed, setShowFailed] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        setShowConfirmPopup(true);
    };

    const confirmUpdate = async () => {
        setShowConfirmPopup(false);
        try {
            const payload = {
                name: user.name,
                email: user.email,
                phone: user.phone,
                gender: user.gender,
                dateOfBirth: user.dateOfBirth,
                height: user.height,
                weight: user.weight,
            };

            if (isChangingPassword) {
                payload.currentPassword = user.currentPassword;
                payload.newPassword = user.newPassword;
                payload.confirmPassword = user.confirmPassword;
            }

            const res = await fetch("http://localhost:8000/api/admin/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to update user profile");
            }

            const updated = await res.json();

            const updatedUser = {
                name: updated.name || "",
                email: updated.email || "",
                phone: updated.phone || "",
                gender: updated.gender || "",
                dateOfBirth: updated.dateOfBirth || "",
                height: updated.height || "",
                weight: updated.weight || "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            };

            setUser(updatedUser);
            setOriginalUser(updatedUser);
            setIsChangingPassword(false);

            setShowBackToDashboard(true);
        } catch (err) {
            console.error("Error updating profile:", err);
            setShowFailed(true);
        }
    };

    const hasChanges =
        originalUser &&
        JSON.stringify({ ...user, currentPassword: "", newPassword: "", confirmPassword: "" }) !==
        JSON.stringify({ ...originalUser, currentPassword: "", newPassword: "", confirmPassword: "" });

    const [showDiscardPopup, setShowDiscardPopup] = useState(false);

    const handleCancelChanges = () => {
        setShowDiscardPopup(true);
    };

    return (
        <div className="container mt-3 mb-3">
            <div className="card shadow rounded">
                <div className="card-body p-4">
                    <h2 className="mb-2">My Profile</h2>
                    <p className="text-muted mb-4">
                        Manage your profile information to keep your account secure
                    </p>

                    <form onSubmit={handleSave}>
                        <div className="row">
                            <div className="col-md-8">
                                <div className="mb-3">
                                    <label className="form-label">Username</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        style={{ maxWidth: "700px" }}
                                        value={user.name}
                                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        style={{ maxWidth: "700px" }}
                                        value={user.email}
                                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        style={{ maxWidth: "700px" }}
                                        value={user.phone}
                                        onChange={(e) => setUser({ ...user, phone: e.target.value })}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Gender</label>
                                    <div className="mt-1 mb-2">
                                        <div className="form-check form-check-inline">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                checked={user.gender === "male"}
                                                onChange={() => setUser({ ...user, gender: "male" })}
                                            />
                                            <label className="form-check-label">Male</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                checked={user.gender === "female"}
                                                onChange={() => setUser({ ...user, gender: "female" })}
                                            />
                                            <label className="form-check-label">Female</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                checked={user.gender === "other"}
                                                onChange={() => setUser({ ...user, gender: "other" })}
                                            />
                                            <label className="form-check-label">Other</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Password</label>
                                    {!isChangingPassword ? (
                                        <div className="d-flex align-items-center mt-2 mb-2">
                                            <input
                                                type="password"
                                                className="form-control"
                                                style={{ maxWidth: "545px" }}
                                                value="********"
                                                disabled
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-link ms-3"
                                                onClick={() => {
                                                    setIsChangingPassword(true);
                                                    setUser({
                                                        ...user,
                                                        currentPassword: "",
                                                        newPassword: "",
                                                        confirmPassword: "",
                                                    });
                                                }}
                                            >
                                                Change password
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="password"
                                                className="form-control mb-2"
                                                style={{ maxWidth: "700px" }}
                                                placeholder="Current password"
                                                value={user.currentPassword}
                                                onChange={(e) =>
                                                    setUser({ ...user, currentPassword: e.target.value })
                                                }
                                            />
                                            <input
                                                type="password"
                                                className="form-control mb-2"
                                                style={{ maxWidth: "700px" }}
                                                placeholder="New password"
                                                value={user.newPassword}
                                                onChange={(e) =>
                                                    setUser({ ...user, newPassword: e.target.value })
                                                }
                                            />
                                            <input
                                                type="password"
                                                className="form-control mb-2"
                                                style={{ maxWidth: "700px" }}
                                                placeholder="Confirm password"
                                                value={user.confirmPassword}
                                                onChange={(e) =>
                                                    setUser({ ...user, confirmPassword: e.target.value })
                                                }
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-link p-0 mt-1"
                                                onClick={() => {
                                                    setIsChangingPassword(false);
                                                    setUser({
                                                        ...user,
                                                        currentPassword: "",
                                                        newPassword: "",
                                                        confirmPassword: "",
                                                    });
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                </div>

                                <div className="d-flex gap-2">
                                    <button type="submit" className="btn btn-danger mt-3"
                                        style={{
                                            backgroundColor: '#28A745',
                                            color: '#fff',
                                            border: 'none',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#218838';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#28A745';
                                        }}
                                    >
                                        Save
                                    </button>
                                    {hasChanges && (
                                        <button
                                            type="button"
                                            className="btn btn-danger mt-3"
                                            onClick={handleCancelChanges}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>

                            {showConfirmPopup && (
                                <div className="popup-overlay">
                                    <div className="popup-box">
                                        <h4>⚠️ Confirm Update</h4>
                                        <p>Are you sure you want to save these changes?</p>
                                        <div className="popup-btn">
                                            <button onClick={confirmUpdate} className="popup-confirm">Yes</button>
                                            <button onClick={() => setShowConfirmPopup(false)} className="popup-remove">No</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {showBackToDashboard && (
                                <div className="popup-overlay">
                                    <div className="popup-box">
                                        <h4>✅ Update Successful!</h4>
                                        <p>Your profile has been updated. Click below to return to your admin dashboard.</p>
                                        <button
                                            onClick={() => {
                                                setShowBackToDashboard(false);
                                                navigate("/admin/dashboard");
                                            }}
                                            className="popup-confirm"
                                        >
                                            Back to Dashboard
                                        </button>
                                    </div>
                                </div>
                            )}

                            {showDiscardPopup && (
                                <div className="popup-overlay">
                                    <div className="popup-box">
                                        <h4>⚠️ Discard Changes</h4>
                                        <p>Are you sure you want to discard all changes?</p>
                                        <div className="popup-btn">
                                            <button
                                                onClick={() => {
                                                    setUser(originalUser);
                                                    setIsChangingPassword(false);
                                                    setShowDiscardPopup(false);
                                                }}
                                                className="popup-confirm"
                                            >
                                                Yes
                                            </button>
                                            <button
                                                onClick={() => setShowDiscardPopup(false)}
                                                className="popup-remove"
                                            >
                                                No
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="col-md-4 d-flex flex-column align-items-center align-self-start mt-4">
                                <div
                                    className="rounded-circle bg-light d-flex align-items-center justify-content-center mb-3"
                                    style={{ width: "200px", height: "200px" }}
                                >
                                    <span className="text-muted fs-1">👤</span>
                                </div>
                                <button className="btn btn-outline-secondary mb-2" type="button">
                                    Choose Image
                                </button>
                                <p className="text-muted small text-center">
                                    Max file size: 1MB <br /> Formats: JPEG, PNG
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
