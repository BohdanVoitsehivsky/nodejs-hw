import "dotenv/config";
import express from "express";
import cors from "cors";
import router from "./routes/notesRoutes.js";
import { errors } from "celebrate";
import { connectMongoDB } from "./db/connectMongoDB.js";
import { logger } from "./middleware/logger.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";
const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(
  logger
);
app.use(express.json());
app.use(cors());

// Routes

app.use(router);




app.use(notFoundHandler);
app.use(errors());

app.use(errorHandler);

await connectMongoDB();

app.listen (PORT, ()=> {
console.log(`Server is running on port ${PORT}`);
});
