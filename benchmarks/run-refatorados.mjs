
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const raiz = process.cwd();

const pastaCodigos = path.join(raiz, "Codigos");
const pastaAdapters = path.join(raiz, "benchmarks", "adapters");
const runner = path.join(raiz, "benchmarks", "runner.mjs");
const pastaResultados = path.join(raiz, "resultados");

function encontrarArquivosRefatorados(diretorio, arquivos = []) {
    if (!fs.existsSync(diretorio)) {
        return arquivos;
    }

    const itens = fs.readdirSync(diretorio, {
        withFileTypes: true
    });

    for (const item of itens) {
        const caminho = path.join(diretorio, item.name);

        if (item.isDirectory()) {
            if (item.name.toLowerCase() === "refatorados") {
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
                encontrarArquivosRefatorados(caminho, arquivos);
            }
        }
    }

    return arquivos;
}

const arquivos = encontrarArquivosRefatorados(pastaCodigos);

if (arquivos.length === 0) {
    console.log("Nenhum código refatorado foi encontrado.");
    process.exit(0);
}

let concluidos = 0;
let falhas = 0;
let semAdapter = 0;

for (const arquivo of arquivos) {
    const caminhoCodigo = path.join(
        arquivo.codigo,
        arquivo.nome
    );

    // Ex.: bufferCircular-claude.js -> bufferCircular.mjs
    const nomeBase = arquivo.nome.replace(/-[^-]+\.js$/, "");
    const caminhoAdapter = path.join(
        pastaAdapters,
        `${nomeBase}.mjs`
    );

    if (!fs.existsSync(caminhoAdapter)) {
        console.error(
            `\n[SEM ADAPTER] ${caminhoCodigo}`
        );
        console.error(
            `Adapter esperado: ${caminhoAdapter}`
        );
        semAdapter++;
        continue;
    }

    // Recupera o caminho relativo do exercício.
    const caminhoRelativo = path.relative(
        pastaCodigos,
        arquivo.codigo
    );

    const partes = caminhoRelativo.split(path.sep);

    // Ex.: Codigos/Dificeis/Buffer circular/refatorados
    const indiceRefatorados = partes.findIndex(
        parte => parte.toLowerCase() === "refatorados"
    );

    const caminhoExercicio = partes
        .slice(0, indiceRefatorados)
        .join(path.sep);

    const nomeExercicio = partes[indiceRefatorados - 1];

    const caminhoResultado = path.join(
        pastaResultados,
        caminhoExercicio,
        "refatorados",
        arquivo.nome.replace(/\.js$/, ".json")
    );

    console.log(`\nExecutando: ${caminhoCodigo}`);

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
        falhas++;
    } else {
        concluidos++;
    }
}

console.log("\n========== RESUMO ==========");
console.log(`Concluídos: ${concluidos}`);
console.log(`Falhas: ${falhas}`);
console.log(`Sem adapter: ${semAdapter}`);
console.log(`Total encontrado: ${arquivos.length}`);
