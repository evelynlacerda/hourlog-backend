const express = require("express");
const router = express.Router();
const prisma = require("../prisma/prisma");
const { gerarPdfDoHtml, templateHtmlRelatorio } = require("../utils/exportPdf");

function toMin(hhmm) {
	if (!hhmm || typeof hhmm !== "string") return null;
	const [h, m] = hhmm.split(":").map(Number);
	if (Number.isNaN(h) || Number.isNaN(m)) return null;
	return h * 60 + m;
}
function minToHhLabel(min) {
	const h = Math.floor(min / 60);
	const m = min % 60;
	return `${h}h${String(m).padStart(2, "0")}`;
}

function toDateOnly(val) {
	if (!val) return null;
	if (val instanceof Date) {
		return new Date(val.getFullYear(), val.getMonth(), val.getDate());
	}
	if (typeof val === "string") {
		if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
			const [y, m, d] = val.split("-").map(Number);
			return new Date(y, m - 1, d);
		}
		if (/^\d{2}\/\d{2}\/\d{4}$/.test(val)) {
			const [d, m, y] = val.split("/").map(Number);
			return new Date(y, m - 1, d);
		}
	}
	return null;
}

router.get("/item/:id/pdf", async (req, res) => {
	try {
		if (!prisma || !prisma.projeto) {
			return res.status(500).json({ message: "Prisma não inicializado" });
		}
		const { id } = req.params || {};
		if (!id)
			return res.status(400).json({ message: "Parâmetro id é obrigatório" });

		const projeto = await prisma.projeto.findUnique({
			where: { id: Number(id) },
			include: { tarefas: true },
		});
		if (!projeto)
			return res.status(404).json({ message: "Projeto não encontrado" });

		const tarefasOrdenadas = [...(projeto.tarefas ?? [])].sort((a, b) => {
			const da = toDateOnly(a.data);
			const db = toDateOnly(b.data);

			if (da && db) {
				const cmpDate = da.getTime() - db.getTime();
				if (cmpDate !== 0) return cmpDate;
				const ia = toMin(a.horaInicio);
				const ib = toMin(b.horaInicio);
				const iaNorm = ia == null ? Number.POSITIVE_INFINITY : ia;
				const ibNorm = ib == null ? Number.POSITIVE_INFINITY : ib;
				return iaNorm - ibNorm;
			}
			if (da && !db) return -1;
			if (!da && db) return 1;
			return 0;
		});

		const tarefas = tarefasOrdenadas.map((t) => ({
			data: t.data ?? "",
			descricao: t.descricao ?? "",
			detalhes: t.descricaoDetalhada ?? "",
			inicio: t.horaInicio ?? "",
			fim: t.horaFinal ?? "",
		}));

		const totalMin = tarefas.reduce((acc, t) => {
			const ini = toMin(t.inicio);
			const fim = toMin(t.fim);
			return ini != null && fim != null && fim >= ini ? acc + (fim - ini) : acc;
		}, 0);

		const html = templateHtmlRelatorio({
			projeto: projeto.nomeProjeto ?? `Projeto ${id}`,
			horasTotais: minToHhLabel(totalMin),
			tarefas,
		});

		const pdf = await gerarPdfDoHtml(html);

		res.setHeader("Content-Type", "application/pdf");
		res.setHeader(
			"Content-Disposition",
			`inline; filename=Relatorio${projeto.nomeProjeto}-${id}.pdf`
		);
		res.setHeader("Cache-Control", "no-store");
		return res.end(pdf);
	} catch (e) {
		console.error(e);
		return res.status(500).json({ message: "Erro ao gerar PDF" });
	}
});

module.exports = router;
