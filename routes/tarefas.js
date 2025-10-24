const express = require("express");
const router = express.Router();
const prisma = require("../prisma/prisma");
const autenticar = require("../middlewares/auth");
const { atualizarHorasTotaisDoProjeto } = require("../utils/calcularHoras");

// GET /tarefas
router.get("/", autenticar, async (req, res) => {
	const usuarioId = req.userId;

	try {
		const tarefas = await prisma.tarefa.findMany({
			where: {
				projeto: {
					usuarioId,
				},
			},
			include: { projeto: true },
		});

		res.json(tarefas);
	} catch (error) {
		res.status(500).json({ error: "Erro ao buscar tarefas." });
	}
});

// PUT /tarefas/:id
router.put("/:id", autenticar, async (req, res) => {
	const { id } = req.params;
	const usuarioId = req.userId;
	const { data, descricao, descricaoDetalhada, horaInicio, horaFinal } = req.body;

	try {
		const tarefa = await prisma.tarefa.findUnique({
			where: { id: Number(id) },
			include: { projeto: true },
		});

		if (!tarefa || tarefa.projeto.usuarioId !== usuarioId) {
			return res.status(403).json({ error: "Acesso negado à tarefa." });
		}

		const tarefaAtualizada = await prisma.tarefa.update({
			where: { id: Number(id) },
			data: { data, descricao, descricaoDetalhada, horaInicio, horaFinal },
		});

		await atualizarHorasTotaisDoProjeto(tarefa.projetoId);

		res.json(tarefaAtualizada);
	} catch (error) {
		res.status(400).json({ error: "Erro ao atualizar tarefa." });
	}
});

// DELETE /tarefas/:id
router.delete("/:id", autenticar, async (req, res) => {
	const { id } = req.params;
	const usuarioId = req.userId;

	try {
		const tarefa = await prisma.tarefa.findUnique({
			where: { id: Number(id) },
			include: { projeto: true },
		});

		if (!tarefa || tarefa.projeto.usuarioId !== usuarioId) {
			return res.status(403).json({ error: "Acesso negado à tarefa." });
		}

		await prisma.tarefa.delete({ where: { id: Number(id) } });

		await atualizarHorasTotaisDoProjeto(tarefa.projetoId);

		res.json({ message: "Tarefa excluída com sucesso." });
	} catch (error) {
		res.status(400).json({ error: "Erro ao excluir tarefa." });
	}
});

module.exports = router;
