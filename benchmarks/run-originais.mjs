
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const raiz = process.cwd();

const pastaCodigos = path.join(raiz, "Codigos");
const pastaAdapters = path.join(raiz, "benchmarks", "adapters");
const runner = path.join(raiz, "benchmarks", "runner.mjs");
const pastaResultados = path.join(raiz, "resultados");

const ADAPTERS = {
    "Boliche": "boliche.mjs",
    "Buffer circular": "bufferCircular.mjs",
    "Caça palavras": "cacaPalavras.mjs",
    "Forth": "forth.mjs",
    "Lista encadeada simples": "listaEncadeada.mjs",
    "Quadrado criptografico": "quadradoCript.mjs",
    "React": "react.mjs",
    "Troco": "troco.mjs",
    "Zipper": "zipper.mjs",
    "Book store": "bookStore.mjs",
    "Distancia relativa": "distanciaRelativa.mjs",
    "Maior produto de uma serie": "maiorProduto.mjs",
    "Matriz espiral": "matrizEspiral.mjs",
    "Números OCR": "numerosOCR.mjs",
    "Pontos de sela": "pontoDeSela.mjs",
    "Conjectura de Collatz": "collatz.mjs",
    "Conta bancaria": "contaBancaria.mjs",
    "Era espacial": "eraEspacial.mjs",
    "Pangrama": "pangrama.mjs",
    "Transcrição de RNA": "rna.mjs"
};

function encontrarArquivosOriginais(diretorio, arquivos = []) {
    if (!fs.existsSync(diretorio)) {
        return arquivos;
    }

    const itens = fs.readdirSync(diretorio, {
        withFileTypes: true
    });

    for (const item of itens) {
        const caminho = path.join(diretorio, item.name);

        if (!item.isDirectory()) {
            continue;
        }

        if (item.name.toLowerCase() === "original") {
            const codigos = fs.readdirSync(caminho, {
                withFileTypes: true
            });

            for (const codigo of codigos) {
                if (
                    codigo.isFile() &&
                    codigo.name.endsWith(".js")
                ) {
                    arquivos.push({
                        codigo: caminho,
                        nome: codigo.name
                    });
                }
            }
        } else {
            encontrarArquivosOriginais(caminho, arquivos);
        }
    }

    return arquivos;
}

function main() {
    if (!fs.existsSync(pastaCodigos)) {
        console.error(`Pasta de códigos não encontrada: ${pastaCodigos}`);
        process.exitCode = 1;
        return;
    }

    if (!fs.existsSync(runner)) {
        console.error(`Runner não encontrado: ${runner}`);
        process.exitCode = 1;
        return;
    }

    const arquivos = encontrarArquivosOriginais(pastaCodigos);

    if (arquivos.length === 0) {
        console.log("Nenhum código original foi encontrado.");
        return;
    }

    let concluidos = 0;
    let falhas = 0;
    let semAdapter = 0;

    for (const arquivo of arquivos) {
        const caminhoCodigo = path.join(
            arquivo.codigo,
            arquivo.nome
        );

        const caminhoRelativo = path.relative(
            pastaCodigos,
            arquivo.codigo
        );

        const partes = caminhoRelativo.split(path.sep);
        const indiceOriginal = partes.findIndex(
            parte => parte.toLowerCase() === "original"
        );

        if (indiceOriginal < 1) {
            console.error(`[CAMINHO INVÁLIDO] ${caminhoCodigo}`);
            falhas++;
            continue;
        }

        // Ex.: Codigos/Dificeis/Boliche/original
        const nomeExercicio = partes[indiceOriginal - 1];

        // Ex.: Dificeis
        const caminhoDificuldade = partes
            .slice(0, indiceOriginal - 1)
            .join(path.sep);

        const nomeAdapter = ADAPTERS[nomeExercicio];

        if (!nomeAdapter) {
            console.error(`\n[SEM CONFIGURAÇÃO] ${caminhoCodigo}`);
            console.error(`Exercício não mapeado: ${nomeExercicio}`);
            semAdapter++;
            continue;
        }

        const caminhoAdapter = path.join(
            pastaAdapters,
            nomeAdapter
        );

        if (!fs.existsSync(caminhoAdapter)) {
            console.error(`\n[SEM ADAPTER] ${caminhoCodigo}`);
            console.error(`Adapter esperado: ${caminhoAdapter}`);
            semAdapter++;
            continue;
        }

        // codigo_boliche.js -> boliche-original.json
        // codigo_bufferCircular.js -> bufferCircular-original.json
        const nomeBase = path.parse(arquivo.nome).name
            .replace(/^codigo_/i, "")
            .replace(/-original$/i, "");

        const nomeResultado = `${nomeBase}-original.json`;

        // Ex.: resultados/Dificeis/Boliche/original/boliche-original.json
        const caminhoResultado = path.join(
            pastaResultados,
            caminhoDificuldade,
            nomeExercicio,
            "original",
            nomeResultado
        );

        console.log(`\nExecutando original: ${caminhoCodigo}`);
        console.log(`Adapter: ${nomeAdapter}`);
        console.log(`Resultado: ${caminhoResultado}`);

        const resultado = spawnSync(
            process.execPath,
            [
                "--expose-gc",
                runner,
                caminhoCodigo,
                caminhoAdapter,
                caminhoResultado
            ],
            {
                cwd: raiz,
                stdio: "inherit"
            }
        );

        if (resultado.error || resultado.status !== 0) {
            console.error(`[FALHA] ${caminhoCodigo}`);

            if (resultado.error) {
                console.error(resultado.error.message);
            }

            falhas++;
        } else {
            concluidos++;
        }
    }

    console.log("\n========== RESUMO DOS ORIGINAIS ==========");
    console.log(`Concluídos: ${concluidos}`);
    console.log(`Falhas: ${falhas}`);
    console.log(`Sem adapter/configuração: ${semAdapter}`);
    console.log(`Total encontrado: ${arquivos.length}`);
}

main();