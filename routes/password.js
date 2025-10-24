const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const prisma = require("../prisma/prisma");

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8000"
const RESET_TOKEN_TTL_MINUTES = Number(process.env.RESET_TOKEN_TTL_MINUTES || 60)

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

router.post("/password/forgot", async (req, res) => {
    const { email } = req.body;
    const usuario = await prisma.usuario.findUnique({
        where: { email },
        select: {
            id: true,
            email: true,
            nome: true
        }
    });

    const genericOk = () => res.json({ ok: true });

    if (!usuario) return genericOk();

    await prisma.passwordReset.deleteMany({
        where: {
            userId: usuario.id,
            usedAt: null
        }
    });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await prisma.passwordReset.create({
        data: {
            userId: usuario.id,
            tokenHash,
            expiresAt
        },
    });

    const resetUrl = `${FRONTEND_URL}/nova-senha/${usuario.id}/${rawToken}`;

    try {
        if (process.env.SMTP_HOST && process.env.SMTP_USER) {
            await transporter.sendMail({
                from: process.env.MAIL_FROM || process.env.SMTP_USER,
                to: usuario.email,
                subject: "Hourlog - Recuperação de Senha",
                html: `
                    <p>Olá ${usuario.nome || ""},<p/>
                    <p>Recebemos um pedido para redefinir sua senha no Hourlog.</p>
                    <p>O link expira em ${RESET_TOKEN_TTL_MINUTES} minutos.</p>
                    <br>
                    <p>Caso não tenha feita essa solicitação, ignore este e-mail.</p>
                `
            });
        } else {
            console.log("[DEV] Link de reset: ", resetUrl);
        }
    } catch (err) {}

    return genericOk();
});

router.post("/password/reset", async (req, res) => {
    const { userId, token, newPassword } = req.body;

    if (!userId || token || !newPassword) {
        return res.status(400).json({ error: "Dados inválidos" });
    };

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const pr = await prisma.passwordReset.findFirst({
        where: {
            userId: Number(userId),
            tokenHash,
            usedAt: null,
            expiresAt: { gt: new Date() },
        },
    });

    if (!pr) return res.status(400).json({ error: "Link inválido ou expirado" });

    const hash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
		prisma.usuario.update({
			where: { id: Number(userId) },
			data: { senha: hash },
		}),
		prisma.passwordReset.update({
			where: { id: pr.id },
			data: { usedAt: new Date() },
		}),
		prisma.passwordReset.deleteMany({
			where: { userId: Number(userId), usedAt: null },
		}),
	]);

    return res.json({ ok: true });
});

module.exports = router
