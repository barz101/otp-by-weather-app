/** @format */
"use client";
import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import "./styles.css";

export default function Home() {
    const [email, setEmail] = useState<string>("");
    const [showModal, setShowModal] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const validateEmail = (inputEmail: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(inputEmail);
    };

    const handleGenerateOTP = async () => {
        if (!validateEmail(email)) {
            setShowModal(true);
            setErrorMessage("Please enter a valid email address");
            return;
        }
        try {
            await axios.post("http://localhost:3000/generate-otp", { email });
            setShowModal(true);
            setErrorMessage("OTP sent successfully!");
        } catch (error: any) {
            if (error.response?.data?.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage("Failed to generate OTP. Please try again.");
            }
            setShowModal(true);
        }
    };

    const closeErrorPopup = () => {
        setShowModal(false);
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
                    }}
                    className="input"
                />
                <button onClick={handleGenerateOTP} className="button">
                    Generate OTP
                </button>
                {showModal && (
                    <div className="overlay">
                        <div className="modal">
                            <div className="closeButton" onClick={closeErrorPopup}>
                                &times;
                            </div>
                            <p className="errorText">{errorMessage && errorMessage}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
