const jwt = require("jsonwebtoken");

function autenticar(req, res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader)
		return res.status(401).json({ error: "Token não fornecido" });

	const token = authHeader.split(" ")[1];

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		req.userId = payload.userId;
        console.log("auth ok:", { userId: req.userId });
		next();
	} catch {
		return res.status(401).json({ error: "Token inválido ou expirado" });
	}
}

module.exports = autenticar;
