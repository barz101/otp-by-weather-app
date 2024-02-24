/** @format */
"use client";
import React, { useState } from "react";
import axios from "axios";
import "./styles.css";

export default function Home() {
    const [email, setEmail] = useState<string>("");
    const [showError, setShowError] = useState<boolean>(false);

    const validateEmail = (inputEmail: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(inputEmail);
    };

    const handleGenerateOTP = async () => {
        if (!validateEmail(email)) {
            setShowError(true);
            return;
        }
        try {
            await axios.post("http://localhost:3000/generate-otp", { email });
            alert("OTP sent successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to send OTP. Please try again.");
        }
    };

    const closeErrorPopup = () => {
        setShowError(false);
    };

    return (
        <div className="container">
            <h1 className="heading">OTP Generator</h1>
            <div className="formContainer">
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setShowError(false);
                    }}
                    className="input"
                />
                <button onClick={handleGenerateOTP} className="button">
                    Generate OTP
                </button>
                {showError && (
                    <div className="overlay">
                        <div className="modal">
                            <div className="closeButton" onClick={closeErrorPopup}>
                                &times;
                            </div>
                            <p className="errorText">Please enter a valid email address</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
