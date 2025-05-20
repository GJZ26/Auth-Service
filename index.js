import dotenv from "dotenv";
import express from "express";
import { Sequelize } from "sequelize";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

dotenv.config();

const app = express();
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});

sequelize.authenticate().then(() => {
    console.log('Database connection has been established successfully.');
}).catch(err => {
    console.error('Failed to initialize Sequelize:', err);
});

app.use(express.json());

app.get('/', (req, res) => {
    res.json(
        {
            name: process.env.APP_NAME
        }
    );
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    sequelize.query('SELECT * FROM Users WHERE email = ? LIMIT 1', {
        replacements: [email],
        type: Sequelize.QueryTypes.SELECT
    }).then(users => {
        if (users.length > 0) {
            if (bcrypt.compareSync(password, users[0].password)) {
                res.json({
                    message: 'Login successful',
                    user: {
                        id: users[0].id,
                        username: users[0].username,
                        email: users[0].email
                    },
                    token: jwt.sign({ id: users[0].id }, process.env.JWT_SECRET)
                });
            }else{
                res.status(401).json({
                    message: 'Invalid password'
                });
            }
        } else {
            res.status(404).json({
                message: 'User not found'
            });
        }
    });
});

app.listen(80, () => {
    console.log("Server is running on port 3000");
});
