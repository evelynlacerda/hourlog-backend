const isDev = process.env.NODE_ENV !== "production";

let puppeteer;
let chromium = null;

if (isDev) {
	puppeteer = require("puppeteer");
} else {
	puppeteer = require("puppeteer-core");
	chromium = require("@sparticuz/chromium");
}

async function launchBrowser() {
	if (isDev) {
		return await puppeteer.launch({
			headless: "new",
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});
	}
	const executablePath = await chromium.executablePath();
	return await puppeteer.launch({
		args: chromium.args,
		defaultViewport: chromium.defaultViewport,
		executablePath,
		headless: chromium.headless,
	});
}

async function gerarPdfDoHtml(html) {
	const browser = await launchBrowser();
	try {
		const page = await browser.newPage();
		await page.setContent(html, { waitUntil: "networkidle0" });
		const pdf = await page.pdf({
			format: "A4",
			printBackground: true,
			margin: { top: "16mm", right: "16mm", bottom: "16mm", left: "16mm" },
		});
		return pdf;
	} finally {
		await browser.close();
	}
}

function templateHtmlRelatorio({ projeto, horasTotais, tarefas }) {
	const safe = (v) => (v == null ? "" : String(v));

	// Converte "2025-10-23" → "23/10/2025"
	const formatDate = (dateStr) => {
		if (!dateStr) return "";
		const d = new Date(dateStr);
		if (isNaN(d)) return dateStr;
		return d.toLocaleDateString("pt-BR");
	};

	const linhas = (tarefas || [])
		.map(
			(t) => `
        <tr>
          <td>${formatDate(t.data)}</td>
          <td>
            <div>${safe(t.descricao)}</div>
            ${
							t.detalhes
								? `<div style="font-size: 13px; color: #555; margin-top: 4px;">${safe(
										t.detalhes
								  )}</div>`
								: ""
						}
          </td>
          <td>${safe(t.inicio)}</td>
          <td>${safe(t.fim)}</td>
        </tr>`
		)
		.join("");

	return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        * { box-sizing: border-box; }
        body { font-family: Arial, sans-serif; margin: 24px; }
        header { display:flex; flex-direction: column; justify-items: start; gap:16px; margin-bottom: 8px; }
        .logo { font-weight: 900; font-size: 22px; letter-spacing: .5px; color: #FF9932; text-align: center; }
        h1 { margin: 0; font-size: 18px; }
        h2 { margin: 6px 0 0; font-size: 14px; color:#444; }
        .totais { margin-top: 10px; font-size: 14px; }
        table { width:100%; border-collapse: collapse; margin-top:16px; font-size:13px; }
        th, td { border:1px solid #ddd; padding:8px; vertical-align: top; }
        th { background:#f6f7f9; }
        td div { line-height: 1.3; }
        footer { position: fixed; bottom: 16px; width: 100%; text-align: center; font-size: 12px; color:#777; }
      </style>
    </head>
    <body>
      <header>
        <div class="logo">HOURLOG</div>
        <div>
          <h1>Relatório de horas</h1>
          <h2>Projeto: ${safe(projeto)}</h2>
        </div>
      </header>

      <div class="totais"><strong>Horas totais:</strong> ${safe(
				horasTotais
			)}</div>

      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição / Detalhes</th>
            <th>Hora Início</th>
            <th>Hora Final</th>
          </tr>
        </thead>
        <tbody>${linhas}</tbody>
      </table>

      <footer>Gerado pelo Hourlog</footer>
    </body>
  </html>`;
}

module.exports = { gerarPdfDoHtml, templateHtmlRelatorio };
