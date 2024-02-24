import express, { Request, Response } from "express";
import mongoose, { Schema, Document, Model } from "mongoose";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

const API_KEY = "f54454751b3c48bc855140631242202";

mongoose.connect("mongodb://127.0.0.1:27017/weather-app");

interface IUser extends Document {
    email: string;
    otp: string;
    createdAt: Date;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const User: Model<IUser> = mongoose.model("User", userSchema);

app.use(bodyParser.json());
app.post("/generate-otp", async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        try {
            const otp = await getTemperatures();
            const user = new User({ email, otp });
            await user.save();
            await sendEmail(email, `Your OTP is: ${otp}`);

            res.json({ success: true, message: "OTP sent successfully" });
        } catch (error: any) {
            if (error.code === 11000) {
                res.status(400).json({ success: false, message: "Email already registered" });
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

async function getTemperatures(): Promise<string> {
    // todo should it return something?
    try {
        const numOfCities = 3;
        const cities = getRandomUniqueCities(numOfCities);
        const promises = cities.map(async (city) => {
            try {
                const response = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}`);
                console.log(`Weather in ${city}:`, response.data);
                const tempFloat = response.data.current.temp_c;
                const temp = Math.abs(Math.round(tempFloat)).toString().padStart(2, "0");
                return temp;
            } catch (error: any) {
                console.error(`Error fetching weather for ${city}:`, error.message);
            }
        });
        const temperatureResults = await Promise.all(promises);
        const resultString = temperatureResults.join("");
        console.log(resultString);
        return resultString;
    } catch (error) {
        console.error("Error fetching temperatures:", error);
        return "Failed to fetch temperatures.";
    }
}

async function sendEmail(to: string, message: string): Promise<void> {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "otptaskbar@gmail.com",
            pass: "otptaskbar123!",
        },
    });

    const mailOptions = {
        from: "otptaskbar@gmail.com",
        to: "barz100@gmail.com",
        subject: "OTP",
        text: message,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}
function getRandomUniqueCities(numCities: number): string[] {
    const cities = [
        "Tokyo",
        "Vancouver",
        "Istanbul",
        "Nairobi",
        "Sydney",
        "Mexico City",
        "Moscow",
        "Cairo",
        "Rio de Janeiro",
        "Montreal",
        "Barcelona",
        "Mumbai",
        "Stockholm",
        "Buenos Aires",
        "Bangkok",
        "Amsterdam",
        "Johannesburg",
        "Prague",
        "Auckland",
        "Lima",
        "Seoul",
        "Houston",
        "Oslo",
        "Jakarta",
        "Dublin",
        "Warsaw",
        "San Francisco",
        "Vienna",
        "Casablanca",
        "Lahore",
        "Montreal",
        "Helsinki",
        "Chennai",
        "Reykjavik",
        "Karachi",
        "Bogota",
        "Frankfurt",
        "Honolulu",
        "Nairobi",
        "Riyadh",
        "Dallas",
        "Budapest",
        "Taipei",
        "Cape Town",
        "Warsaw",
        "Calgary",
        "Dhaka",
        "Belgrade",
        "Krakow",
        "Sofia",
    ];
    for (let i = cities.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cities[i], cities[j]] = [cities[j], cities[i]];
    }
    return cities.slice(0, numCities);
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
