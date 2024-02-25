import * as assert from "assert";
import axios from "axios";
import { User } from "../src/server";

const BASE_URL = "http://localhost:3000";
const TESTING_MAIL = Math.random().toString(36).substr(2, 10) + "@gmail.com";

async function getAPIRes(email: string) {
    return axios.post(`${BASE_URL}/generate-otp`, { email });
}

async function testInvalidEmailFormat() {
    try {
        const invalid_email_string = Math.random().toString(36).substr(2, 10);
        const response = await getAPIRes(invalid_email_string);
    } catch (error: any) {
        if (error.response && error.response.status === 400) {
            assert.strictEqual(error.response.data.error, "Invalid email format");
            console.log("Test testInvalidEmailFormat passed.");
        } else {
            console.error("Test testInvalidEmailFormat failed:", error.message);
        }
    }
}

async function testGenerateOTPForNewUser() {
    try {
        const response = await getAPIRes(TESTING_MAIL);
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.data.success, true);
        assert.strictEqual(response.data.message, "OTP sent successfully");
        console.log("Test testGenerateOTPForNewUser passed: Generate OTP for new user");
    } catch (error: any) {
        console.error("Test testGenerateOTPForNewUser failed:", error.message);
    }
}

async function testGenerateOTPForExistingUserWithExpiredOTP() {
    try {
        const user = await User.findOne({ email: TESTING_MAIL });
        if (!user) {
            console.error("Test testGenerateOTPForExistingUserWithExpiredOTP failed: User not found");
            return;
        }
        user.createdAt = new Date(0);
        await user.save();
        const response = await getAPIRes(TESTING_MAIL);
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.data.success, true);
        assert.strictEqual(response.data.message, "OTP updated and sent successfully");
        console.log("Test testGenerateOTPForExistingUserWithExpiredOTP passed: Generate OTP for existing user with expired OTP");
    } catch (error: any) {
        console.error("Test testGenerateOTPForExistingUserWithExpiredOTP failed:", error.message);
    }
}

async function testGenerateOTPForExistingUserWithValidOTP() {
    try {
        await getAPIRes(TESTING_MAIL);
        const response = await getAPIRes(TESTING_MAIL);
    } catch (error: any) {
        assert.strictEqual(error.response.status, 400);
        assert.strictEqual(error.response.data.success, false);
        assert.strictEqual(error.response.data.message.includes("OTP is still valid"), true);
        console.log("Test testGenerateOTPForExistingUserWithValidOTP passed");
    }
}

// Run the tests sequentially
async function runTests() {
    await testInvalidEmailFormat();
    await testGenerateOTPForNewUser();
    await testGenerateOTPForExistingUserWithExpiredOTP();
    await testGenerateOTPForExistingUserWithValidOTP();
}

// Run the tests
runTests();
