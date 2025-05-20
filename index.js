import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send(`App Name: ${process.env.APP_NAME}`);
});

app.listen(80, () => {
    console.log("Server is running on port 3000");
});
