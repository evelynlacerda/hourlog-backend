const cron = require("node-cron");
const { subDays } = require("date-fns");
const prisma = require("../prisma/prisma");

/**
 * Number of days to retain completed projects before automatic deletion.
 * Defaults to 15 days if not defined in environment variables.
 * @constant {number}
 */
const RETENTION_DAYS = Number(process.env.PROJECT_RETENTION_DAYS ?? 15);

/**
 * Cron schedule string that defines when the cleanup task runs.
 * Defaults to "0 2 * * *" (every day at 2 AM).
 * @constant {string}
 */
const CRON_SCHEDULE = process.env.CRON_SCHEDULE ?? "0 2 * * *";

/**
 * Timezone used for scheduling and logging.
 * Defaults to "America/Sao_Paulo".
 * @constant {string}
 */
const TZ = process.env.CRON_TZ ?? "America/Sao_Paulo";

/**
 * Indicates whether the cleanup process is currently running.
 * Prevents concurrent executions.
 * @type {boolean}
 */
let running = false;

/**
 * Indicates whether the cleanup task has already been scheduled.
 * Prevents multiple schedules from being created.
 * @type {boolean}
 */
let schedule = false;

/**
 * Runs the cleanup process to remove finalized projects older than the retention period.
 *
 * @async
 * @function runCleanup
 * @returns {Promise<void>} Resolves when the cleanup process is completed.
 *
 * @description
 * This function calculates the cutoff date based on the retention period,
 * deletes all projects with `status = "FINALIZADO"` and `finalizedAt <= cutoff`,
 * and logs the number of removed records along with timestamp information.
 * It ensures that no two cleanup processes run simultaneously.
 */
async function runCleanup() {
	if (running) return;
	running = true;
	try {
		const cutoff = subDays(new Date(), RETENTION_DAYS);
		const result = await prisma.projeto.deleteMany({
			where: { status: "FINALIZADO", finalizedAt: { lte: cutoff } },
		});

		console.log(
			`[CLEANUP] tick=${new Date().toLocaleString("pt-BR", {
				timeZone: TZ,
			})} ` +
				`tz=${TZ} | cutoff=${cutoff.toLocaleString("pt-BR", {
					timeZone: TZ,
				})} | ` +
				`removidos=${result.count}`
		);
	} catch (e) {
		console.error("[CLEANUP] Erro:", e);
	} finally {
		running = false;
	}
}

/**
 * Initializes and starts the scheduled cleanup task using a cron expression.
 *
 * @function startCleanupScheduler
 * @returns {{ stop: () => void }} A task object with a `stop()` method to cancel the scheduler.
 *
 * @description
 * This function creates a cron job that periodically triggers the cleanup process
 * according to the defined schedule and timezone. If the environment variable
 * `RUN_CLEANUP_ON_BOOT` is set to `"true"`, the cleanup is also executed immediately
 * upon server startup.
 *
 * The scheduler runs once per application lifecycle and prevents duplicate scheduling.
 */
function startCleanupScheduler() {
	if (schedule) return { stop() {} };
	const task = cron.schedule(
		CRON_SCHEDULE,
		() => {
			console.log(`[CRON] disparou em ${new Date().toLocaleString("PT-BR")}`);
			runCleanup();
		},
		{ timezone: TZ }
	);
	schedule = true;
	if (process.env.RUN_CLEANUP_ON_BOOT === "true") runCleanup();
	return task;
}

module.exports = { startCleanupScheduler, runCleanup };
