import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
        <p>App Name: <b>${process.env.APP_NAME}</b></p>
        <p>JWT Secret: <b>${process.env.JWT_SECRET}</b></p>
        `);
});

app.listen(80, () => {
    console.log("Server is running on port 3000");
});
