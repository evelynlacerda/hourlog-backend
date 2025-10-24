const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Calculates the difference in minutes between two time strings (HH:mm format).
 *
 * @param {string} inicio - The start time in "HH:mm" format.
 * @param {string} fim - The end time in "HH:mm" format.
 * @returns {number} The total difference in minutes between the two times.
 */
function calcularDiferencaHoras(inicio, fim) {
	const [h1, m1] = inicio.split(":").map(Number);
	const [h2, m2] = fim.split(":").map(Number);
	const minutosInicio = h1 * 60 + m1;
	const minutosFim = h2 * 60 + m2;
	return minutosFim - minutosInicio;
}

/**
 * Converts a number of minutes into a formatted time string (HH:mm).
 *
 * @param {number} minutos - The total number of minutes to format.
 * @returns {string} The formatted time string in "HH:mm" format.
 */
function formatarMinutosParaHora(minutos) {
	const h = Math.floor(minutos / 60)
		.toString()
		.padStart(2, "0");
	const m = (minutos % 60).toString().padStart(2, "0");
	return `${h}:${m}`;
}

/**
 * Updates the total hours of a given project based on its tasks' start and end times.
 *
 * @async
 * @function atualizarHorasTotaisDoProjeto
 * @param {number|string} projetoId - The ID of the project whose total time will be updated.
 * @returns {Promise<void>} Resolves when the project's total hours are successfully updated.
 *
 * @description
 * This function fetches all tasks associated with a project, calculates the total duration
 * (in minutes) of all tasks, converts it into a formatted "HH:mm" string, and updates the
 * corresponding project record in the database using Prisma ORM.
 */
async function atualizarHorasTotaisDoProjeto(projetoId) {
	const tarefas = await prisma.tarefa.findMany({
		where: { projetoId: Number(projetoId) },
	});

	let totalMinutos = 0;

	for (const tarefa of tarefas) {
		const diff = calcularDiferencaHoras(tarefa.horaInicio, tarefa.horaFinal);
		totalMinutos += diff;
	}

	const horasTotais = formatarMinutosParaHora(totalMinutos);

	await prisma.projeto.update({
		where: { id: Number(projetoId) },
		data: { horasTotais },
	});
}

module.exports = { atualizarHorasTotaisDoProjeto };
