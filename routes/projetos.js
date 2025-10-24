const express = require("express");
const router = express.Router();
const prisma = require("../prisma/prisma");
const autenticar = require("../middlewares/auth");
const { atualizarHorasTotaisDoProjeto } = require("../utils/calcularHoras");

// GET /projetos
router.get("/", autenticar, async (req, res) => {
    const usuarioId = req.userId;
	try {
		const projetos = await prisma.projeto.findMany({
            where: { usuarioId },
			include: { tarefas: true },
		});
		res.json(projetos);
	} catch {
		res.status(500).json({ error: "Erro ao buscar projetos." });
	}
});

// POST /projetos
router.post("/incluir", autenticar, async (req, res) => {
  const { nomeProjeto, status, tarefas } = req.body;

  const usuarioId = req.userId;

  try {
    const novoProjeto = await prisma.projeto.create({
      data: {
        nomeProjeto,
        status,
        horasTotais: "00:00",
        finalizedAt: status === "FINALIZADO" ? new Date() : null,
        usuarioId,
        ...(Array.isArray(tarefas) && tarefas.length > 0
          ? {
              tarefas: {
                create: tarefas
                  .filter((t) => t.descricao?.trim())
                  .map((t) => ({
                    descricao: t.descricao.trim(),
                    data: t.data || null,
                    horaInicio: t.horaInicio || null,
                    horaFinal: t.horaFinal || null,
                    descricaoDetalhada: t.descricaoDetalhada || null,
                  })),
              },
            }
          : {}),
      },
      include: { tarefas: true },
    });

    res.status(201).json(novoProjeto);
  } catch {
    res.status(400).json({ error: "Erro ao criar projeto." });
  }
});

// GET /projetos/:id
router.get("/:id", autenticar, async (req, res) => {
	const { id } = req.params;
	const usuarioId = req.userId;

	try {
		const projeto = await prisma.projeto.findFirst({
			where: {
				id: Number(id),
				usuarioId,
			},
			include: { tarefas: { orderBy: { id: "asc" } } },
		});

		if (!projeto) {
			return res
				.status(404)
				.json({ error: "Projeto não encontrado ou não pertence a você." });
		}

		res.json(projeto);
	} catch (error) {
		res.status(500).json({ error: "Erro ao buscar projeto." });
	}
});

// PUT /projetos/:id
router.put("/:id", autenticar, async (req, res) => {
    console.log("PUT /projetos/:id", { id: req.params.id, reqUserId: req.userId });
	const { id } = req.params;
	const usuarioId = req.userId;
	const { nomeProjeto, status, horasTotais } = req.body;

	try {
		const projeto = await prisma.projeto.findFirst({
			where: { id: Number(id), usuarioId },
		});

		if (!projeto) {
			return res
				.status(404)
				.json({ error: "Projeto não encontrado ou não autorizado." });
		}

        let finalizedAt = projeto.finalizedAt;
        if (status && status !== projeto.status) {
            if (status === "FINALIZADO") finalizedAt = new Date();
            else finalizedAt = null;
        }

		const atualizado = await prisma.projeto.update({
			where: { id: Number(id) },
			data: { nomeProjeto, status, horasTotais, finalizedAt },
		});

		res.json(atualizado);
	} catch (error) {
		res.status(400).json({ error: "Erro ao atualizar projeto." });
	}
});

// DELETE /projetos/:id
router.delete("/:id", autenticar, async (req, res) => {
	const { id } = req.params;
	const usuarioId = req.userId;

	try {
		const projeto = await prisma.projeto.findFirst({
			where: { id: Number(id), usuarioId },
		});

		if (!projeto) {
			return res
				.status(404)
				.json({ error: "Projeto não encontrado ou não autorizado." });
		}

		await prisma.projeto.delete({ where: { id: Number(id) } });

		res.json({ message: "Projeto excluído com sucesso." });
	} catch (error) {
		res.status(400).json({ error: "Erro ao excluir projeto." });
	}
});

// POST /projetos/:id/tarefas
router.post("/:id/tarefas", autenticar, async (req, res) => {
	const { id } = req.params;
	const usuarioId = req.userId;
	const { data, descricao, descricaoDetalhada, horaInicio, horaFinal } = req.body;

	try {
		const projeto = await prisma.projeto.findUnique({
			where: { id: Number(id) },
		});

		if (!projeto || projeto.usuarioId !== usuarioId) {
			return res
				.status(403)
				.json({ error: "Você não tem acesso a esse projeto." });
		}

		const novaTarefa = await prisma.tarefa.create({
			data: {
				projetoId: Number(id),
				data,
				descricao,
                descricaoDetalhada,
				horaInicio,
				horaFinal,
			},
		});

		await atualizarHorasTotaisDoProjeto(id);

		res.status(201).json(novaTarefa);
	} catch (error) {
		res.status(400).json({ error: "Erro ao criar tarefa." });
	}
});

module.exports = router;
