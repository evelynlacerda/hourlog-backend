const { runCleanup } = require("../utils/cleanup");

module.exports = async (req, res) => {
	if (req.method !== "GET") {
		return res.status(405).json({ error: "Method Not Allowed" });
	}

	try {
		const userAgent = req.headers["user-agent"] || "";
		const isVercelCron = userAgent.includes("vercel-cron/1.0"); // doc da Vercel :contentReference[oaicite:0]{index=0}

		console.log(
			`[CRON-ENDPOINT] called. isVercelCron=${isVercelCron} at ${new Date().toISOString()}`
		);

		await runCleanup();

		return res.status(200).json({
			ok: true,
			fromCron: isVercelCron,
			message: "Cleanup executed successfully",
		});
	} catch (err) {
		console.error("[CRON-ENDPOINT] error:", err);
		return res.status(500).json({ ok: false, error: err.message });
	}
};
