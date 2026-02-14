import express, { Request, Response } from "express";

const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
	res.json({ message: "Hello from Express + TypeScript" });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 8000;

const server = app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});

export default app;

