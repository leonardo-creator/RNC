const express = require('express');
const puppeteer = require('puppeteer');
const tmp = require('tmp');
const fs = require('fs');
const cors = require('cors');  // Importando o CORS
const app = express();
const port = 3000;

app.use(cors());  // Permite requisições de todas as origens
app.use(express.json());  // Permite que o Express receba JSON no corpo da requisição
app.use(express.static('public')); // Para servir arquivos estáticos (HTML, CSS, etc.)

// Endpoint para gerar o PDF
app.post('/gerar-pdf', async (req, res) => {
    const { htmlContent } = req.body;

    try {
        console.log("Recebendo conteúdo HTML:", htmlContent);  // Log do conteúdo recebido

        // Cria um arquivo temporário para salvar o conteúdo HTML
        const tempFile = tmp.fileSync({ postfix: '.html' });
        fs.writeFileSync(tempFile.name, htmlContent);  // Salva o conteúdo HTML no arquivo temporário

        // Lançar o Puppeteer (abrir o navegador)
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Carregar o arquivo HTML que foi salvo temporariamente
        await page.goto(`file://${tempFile.name}`, { waitUntil: 'domcontentloaded' });

        console.log("Gerando o PDF...");

        // Gerar o PDF com a configuração de margem
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10mm',
                left: '10mm',
                bottom: '10mm',
                right: '10mm',
            },
        });

        console.log("PDF gerado com sucesso!");

        await browser.close();

        // Remover o arquivo temporário
        tempFile.removeCallback();

        // Enviar o PDF gerado como resposta
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);
    } catch (err) {
        console.error('Erro ao gerar PDF:', err);
        res.status(500).send('Erro ao gerar PDF');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
