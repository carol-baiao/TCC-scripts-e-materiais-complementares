
import process from "node:process";
import os from "node:os";
import { resolve, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";

// Parâmetros recebidos via terminal.
const [, , codePath, adapterPath, outputPath] = process.argv;

if (!codePath || !adapterPath || !outputPath) {
    console.error(
        'Uso: node runner.mjs "codigo.js" "adaptador.mjs" "resultado.json"'
    );
    process.exit(1);
}

const solution = await import(
    pathToFileURL(resolve(codePath)).href
);

const { execute } = await import(
    pathToFileURL(resolve(adapterPath)).href
);

if (typeof execute !== "function") {
    throw new Error(
        "O adaptador não exporta a função execute()."
    );
}

// Configuração do benchmark.
const WARMUP = 10_000;
const ITERATIONS = 100_000;
const SAMPLES = 10;

// Quantidade de CPUs lógicas disponíveis para o processo.
const CPUS_DISPONIVEIS = os.availableParallelism();

function mean(values) {
    return values.reduce(
        (sum, value) => sum + value,
        0
    ) / values.length;
}

function median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    return sorted.length % 2 === 0
        ? (sorted[middle - 1] + sorted[middle]) / 2
        : sorted[middle];
}

function standardDeviation(values) {
    const average = mean(values);

    return Math.sqrt(
        mean(
            values.map(
                value => (value - average) ** 2
            )
        )
    );
}

let lastResult;

// Aquecimento do código.
for (let i = 0; i < WARMUP; i++) {
    lastResult = execute(solution);
}

// Tenta liberar objetos temporários antes das medições.
if (globalThis.gc) {
    globalThis.gc();
}

const samples = [];

// Executa as amostras medidas.
for (let sample = 0; sample < SAMPLES; sample++) {
    const cpuStart = process.cpuUsage();
    const start = process.hrtime.bigint();

    for (let i = 0; i < ITERATIONS; i++) {
        lastResult = execute(solution);
    }

    const elapsedNs = process.hrtime.bigint() - start;
    const cpu = process.cpuUsage(cpuStart);

    const elapsedMs = Number(elapsedNs) / 1e6;
    const cpuMs = (cpu.user + cpu.system) / 1000;

    // Percentual estimado da capacidade lógica disponível
    // consumida pelo processo durante esta amostra.
    const utilizacaoCpuComputadorPercentual =
        elapsedMs > 0
            ? (cpuMs / (elapsedMs * CPUS_DISPONIVEIS)) * 100
            : null;

    samples.push({
        amostra: sample + 1,
        execucoes: ITERATIONS,
        tempoTotalMs: elapsedMs,
        tempoMedioMs: elapsedMs / ITERATIONS,
        cpuTotalMs: cpuMs,
        cpuMedioMs: cpuMs / ITERATIONS,
        utilizacaoCpuComputadorPercentual
    });
}

// Estatísticas de tempo: uma chamada ao adapter.
const times = samples.map(
    sample => sample.tempoMedioMs
);

// Estatísticas de CPU: tempo de CPU por chamada ao adapter.
const cpuTimes = samples.map(
    sample => sample.cpuMedioMs
);

// Estatísticas da utilização percentual normalizada.
// Ignora valores nulos, caso alguma amostra não possa ser calculada.
const utilizacoesCpu = samples
    .map(sample => sample.utilizacaoCpuComputadorPercentual)
    .filter(value => value !== null);

const utilizacaoComputadorPercentual =
    utilizacoesCpu.length > 0
        ? mean(utilizacoesCpu)
        : null;

// Pico de memória residente de todo o processo.
const memoryUsage = process.resourceUsage();
const peakRssMiB = memoryUsage.maxRSS / 1024;

const result = {
    codigo: codePath,
    versaoNode: process.version,
    aquecimento: WARMUP,
    execucoesPorAmostra: ITERATIONS,
    quantidadeAmostras: SAMPLES,
    cpusLogicasDisponiveis: CPUS_DISPONIVEIS,

    resultadoExecucao: lastResult,

    tempoExecucaoMs: {
        media: mean(times),
        mediana: median(times),
        desvioPadrao: standardDeviation(times)
    },

    cpu: {
        tempoMedioMs: mean(cpuTimes),
        utilizacaoComputadorPercentual
    },

    memoria: {
        picoRssMiB: peakRssMiB
    },

    amostras: samples
};

// Cria a pasta de destino, se necessário.
await mkdir(dirname(resolve(outputPath)), {
    recursive: true
});

// Salva o resultado em JSON.
await writeFile(
    resolve(outputPath),
    JSON.stringify(result, null, 2),
    "utf8"
);

console.log("Benchmark concluído.");
console.log(`Resultado funcional: ${lastResult}`);
console.log(
    `Tempo médio: ${result.tempoExecucaoMs.media.toFixed(6)} ms`
);
console.log(
    `CPU média: ${result.cpu.tempoMedioMs.toFixed(6)} ms`
);
console.log(
    `Utilização média da capacidade lógica disponível: ${
        result.cpu.utilizacaoComputadorPercentual?.toFixed(2) ?? "N/A"
    }%`
);
console.log(`CPUs lógicas disponíveis: ${CPUS_DISPONIVEIS}`);
console.log(`Pico RSS: ${peakRssMiB.toFixed(2)} MiB`);
console.log(`Arquivo salvo em: ${resolve(outputPath)}`);
