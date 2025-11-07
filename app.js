const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const markdownIt = require("markdown-it");
const highlight = require("markdown-it-highlightjs");

const nodeHtmlToImage = require("node-html-to-image");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.text({ type: "text/markdown" }));

function parseYamlFrontMatter(mdContent) {
    const frontMatterRegex = /^---([\s\S]*?)---/;
    const match = mdContent.match(frontMatterRegex);
    if (!match) {
        return mdContent;
    }
    const yamlContent = match[1];
    const remainingContent = mdContent.replace(frontMatterRegex, "").trim();
    const yamlLines = yamlContent.split("\n");
    let yamlTable = "<table class='table-compact'>";
    yamlLines.forEach((line) => {
        if (line.trim() === "") return;
        let [key, ...rest] = line
            .split(":")
            .map((part, index) => (index === 0 ? part.trim() : part));
        let value = rest.join(":").trim();

        if (key && value) {
            const md = new markdownIt({ html: true }).use(highlight);
            value = md.render(value);
            value = value.replaceAll("<p>", "");
            value = value.replaceAll("</p>", "");
            yamlTable += `<tr><td>${key}</td><th>${value}</th></tr>`;
        }
    });
    yamlTable += "</table>\n\n";
    return yamlTable + remainingContent;
}

async function markdownToPng(mdContent, templateFile) {
    const md = new markdownIt({ html: true }).use(highlight);

    mdContent = parseYamlFrontMatter(mdContent);

    const htmlContent = md.render(mdContent);
    const template = fs.readFileSync(templateFile, "utf8");
    const html = template.replace("{{content}}", htmlContent);

    const imageBuffer = await nodeHtmlToImage({
        output: null,
        html,
        type: "png",
        puppeteerArgs: { args: ["--no-sandbox"] },
    });

    return imageBuffer;
}

// Endpoint POST
app.post("/md2png", async (req, res) => {
    try {
        const mdContent = req.body;
        const templateFile = "static/template.html"; // Chemin vers votre template externe
        const imageBuffer = await markdownToPng(mdContent, templateFile);
        const base64Image = imageBuffer.toString("base64");

        res.set("Content-Type", "application/json");
        res.send(JSON.stringify({ image: base64Image }));
    } catch (error) {
        console.error("Erreur:", error);
        res.status(500).send("Erreur lors de la génération de l'image.");
    }
});

app.use(express.static("static"));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "static", "index.html"));
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
