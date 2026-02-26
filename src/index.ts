import express, { Request, Response } from "express";
import SubjectRouter from "./routes/subjects";
import cors from "cors";
const app = express();

app.use(express.json());
app.use(cors({
	credentials: true,
	origin: process.env.FRONTEND_URL || "http://localhost:5173",
	methods: ["GET", "POST", "PUT", "DELETE"],
 }));
app.use("/api/subjects", SubjectRouter)
app.get("/", (req: Request, res: Response) => {
	res.json({ message: "Hello from Express + TypeScript" });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;

const server = app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});

export default app;

