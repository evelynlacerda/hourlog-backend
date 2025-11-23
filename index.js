require("dotenv").config();

const cors = require("cors");
const express = require("express");
const app = express();

const { runCleanup } = require("./utils/cleanup");

app.use(express.json());

app.use(
	cors({
		origin: [
			"http://localhost:5173",
			"http://localhost:3000",
			"https://hourlog.vercel.app",
		],
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	})
);
app.options("", cors());

const authRoutes = require("./routes/auth");
const passwordRoutes = require("./routes/password");
const projetosRoutes = require("./routes/projetos");
const tarefasRoutes = require("./routes/tarefas");
const relatoriosRoutes = require("./routes/relatorios");

app.use(authRoutes);
app.use(passwordRoutes);

app.get("/", (_req, res) => {
	res.send("Hourlog API funcionando! 🚀");
});

app.use("/relatorios", relatoriosRoutes);
app.use("/projetos", projetosRoutes);
app.use("/tarefas", tarefasRoutes);

app.get("/api/cron", async (req, res) => {
	try {
		await runCleanup();

		return res.status(200).json({
			ok: true,
			message: "Cleanup executed successfully",
		});
	} catch (err) {
		console.error("[CRON-ENDPOINT] error:", err);
		return res.status(500).json({ ok: false, error: err.message });
	}
});

module.exports = app;
