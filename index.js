require("dotenv").config();

const cors = require("cors");
const express = require("express");
const app = express();

app.use(express.json());
app.use(cors());

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

module.exports = app;
