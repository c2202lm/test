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
                const res = await fetch("http://localhost:8000/api/user/profile", {
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

    const handleSave = async (e) => {
        e.preventDefault();

        const confirmSave = window.confirm("Are you sure you want to save changes?");
        if (!confirmSave) return;

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

            const res = await fetch("http://localhost:8000/api/user/profile", {
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
            alert("Profile updated successfully!");
            navigate("/");
        } catch (err) {
            console.error("Error updating profile:", err);
            alert(err.message || "Update failed!");
        }
    };

    const hasChanges =
        originalUser &&
        JSON.stringify({ ...user, currentPassword: "", newPassword: "", confirmPassword: "" }) !==
        JSON.stringify({ ...originalUser, currentPassword: "", newPassword: "", confirmPassword: "" });

    const handleCancelChanges = () => {
        const confirmCancel = window.confirm("Are you sure you want to discard all changes?");
        if (!confirmCancel) return;
        setUser(originalUser);
        setIsChangingPassword(false);
    };

    return (
        <div className="container mt-5 mb-5">
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
                                    <label className="form-label">Date of Birth</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        style={{ maxWidth: "700px" }}
                                        value={user.dateOfBirth}
                                        onChange={(e) =>
                                            setUser({ ...user, dateOfBirth: e.target.value })
                                        }
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

                                <div className="row" style={{ maxWidth: "710px" }}>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Height (cm)</label>
                                        <input
                                            type="number"
                                            className="form-control w-100"
                                            value={user.height}
                                            onChange={(e) => setUser({ ...user, height: e.target.value })}
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3 pe-0 ps-3">
                                        <label className="form-label">Weight (kg)</label>
                                        <input
                                            type="number"
                                            className="form-control w-100"
                                            value={user.weight}
                                            onChange={(e) => setUser({ ...user, weight: e.target.value })}
                                        />
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
