const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma/prisma");
const autenticar = require("../middlewares/auth");

// Rota de cadastro
router.post("/cadastrar", async (req, res) => {
	const { nome, email, senha } = req.body;

	const usuarioExistente = await prisma.usuario.findUnique({
		where: { email },
	});
	if (usuarioExistente) {
		return res.status(400).json({ error: "Email já cadastrado" });
	}

	const hash = await bcrypt.hash(senha, 10);

	const novoUsuario = await prisma.usuario.create({
		data: { nome, email, senha: hash },
	});

	res.status(201).json({ message: "Usuário criado com sucesso" });
});

// Rota de login
router.post("/login", async (req, res) => {
	const { email, senha } = req.body;

	const usuario = await prisma.usuario.findUnique({ 
        where: { email },
        select: { id: true, nome: true, email: true, senha: true }
    });
	if (!usuario) {
		return res.status(401).json({ error: "Credenciais inválidas" });
	}

	const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
	if (!senhaCorreta) {
		return res.status(401).json({ error: "Credenciais inválidas" });
	}

	const token = jwt.sign({ userId: usuario.id }, process.env.JWT_SECRET, {
		expiresIn: "24h",
	});

	const { id, nome } = usuario;
	res.json({ token, user: { id, nome, email: usuario.email } });
});

router.get("/me", autenticar, async (req, res) => {
    try {
        const userId = req.userId;
        const usuario = await prisma.usuario.findUnique({
            where: { id: userId },
            select: { id: true, nome: true, email: true }
        });

        if (!usuario) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        };

        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar usuário" });
    };
});

module.exports = router;
