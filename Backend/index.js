import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// Middleware setup
app.use(
  cors({
    origin: "http://localhost:3000", // Adjust based on your frontend URL
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());

// Example route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Start server
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
