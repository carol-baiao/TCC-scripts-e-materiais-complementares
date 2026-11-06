
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RAIZ = path.resolve(__dirname, "..");

const PASTA_CODIGOS = path.join(RAIZ, "Codigos");
const PASTA_TESTES = path.join(RAIZ, "Testes");
const PASTA_RESULTADOS = path.join(RAIZ, "resultados-testes");

const CONFIGURACAO = {
  "Boliche": {
    teste: "boliche.test.js",
    arquivoEsperado: "bowling.js"
  },
  "Buffer circular": {
    teste: "bufferCircular.test.js",
    arquivoEsperado: "circular-buffer.js"
  },
  "Caça palavras": {
    teste: "cacaPalavras.test.js",
    arquivoEsperado: "word-search.js"
  },
  "Forth": {
    teste: "forth.test.js",
    arquivoEsperado: "forth.js"
  },
  "Lista encadeada simples": {
    teste: "listaEncadeada.test.js",
    arquivoEsperado: "simple-linked-list.js"
  },
  "Quadrado criptografico": {
    teste: "quadradoCript.test.js",
    arquivoEsperado: "crypto-square.js"
  },
  "React": {
    teste: "react.test.js",
    arquivoEsperado: "react.js"
  },
  "Troco": {
    teste: "troco.test.js",
    arquivoEsperado: "change.js"
  },
  "Zipper": {
    teste: "zipper.test.js",
    arquivoEsperado: "zipper.js"
  }
};

function listarArquivosJs(pasta) {
  if (!fs.existsSync(pasta)) return [];

  return fs.readdirSync(pasta, { withFileTypes: true })
    .flatMap((item) => {
      const caminho = path.join(pasta, item.name);

      if (item.isDirectory()) {
        return listarArquivosJs(caminho);
      }

      return item.isFile() && item.name.endsWith(".js")
        ? [caminho]
        : [];
    });
}

function localizarExercicio(pastaRefatorados) {
  const relativo = path.relative(PASTA_CODIGOS, pastaRefatorados);
  const partes = relativo.split(path.sep);

  return partes.length >= 3 ? partes[partes.length - 2] : null;
}


function executarJest(pastaTemporaria, arquivoTeste) {
  const jestBin = path.join(
    RAIZ,
    "node_modules",
    "jest",
    "bin",
    "jest.js"
  );

  const resultado = spawnSync(
    process.execPath,
    [
      "--experimental-vm-modules",
      jestBin,
      "--config",
      JSON.stringify({
        rootDir: pastaTemporaria,
        testEnvironment: "node",
        transform: {}
      }),
      "--runInBand",
      "--json",
      "--runTestsByPath",
      arquivoTeste
    ],
    {
      cwd: pastaTemporaria,
      encoding: "utf8",
      timeout: 120000,
      maxBuffer: 20 * 1024 * 1024,
      env: {
        ...process.env,
        NODE_OPTIONS: ""
      }
    }
  );

  const saida = resultado.stdout ?? "";
  const inicioJson = saida.indexOf("{");
  const fimJson = saida.lastIndexOf("}");

  if (inicioJson >= 0 && fimJson > inicioJson) {
    try {
      return {
        relatorio: JSON.parse(saida.slice(inicioJson, fimJson + 1)),
        erroExecucao: resultado.error?.message ?? null,
        codigoSaida: resultado.status
      };
    } catch {
      // O relatório não pôde ser interpretado.
    }
  }

  return {
    relatorio: null,
    erroExecucao:
      resultado.error?.message ??
      resultado.stderr ??
      saida ??
      "O Jest não produziu um relatório válido.",
    codigoSaida: resultado.status
  };
}


function testarImplementacao(arquivoCodigo, pastaRefatorados) {
  const nomeExercicio = localizarExercicio(pastaRefatorados);
  const config = CONFIGURACAO[nomeExercicio];

  if (!config) {
    return {
      ignorado: true,
      motivo: `Exercício sem configuração: ${nomeExercicio}`
    };
  }

  const caminhoTeste = path.join(PASTA_TESTES, config.teste);

  if (!fs.existsSync(caminhoTeste)) {
    return {
      ignorado: true,
      motivo: `Arquivo de teste não encontrado: ${config.teste}`
    };
  }

  const pastaTemporaria = fs.mkdtempSync(
    path.join(os.tmpdir(), "teste-refatorado-")
  );

  try {
    const extensao = path.extname(config.arquivoEsperado);
    const nomeSemExtensao = path.basename(
      config.arquivoEsperado,
      extensao
    );

    const codigoTemporario = path.join(
      pastaTemporaria,
      config.arquivoEsperado
    );

    const testeTemporario = path.join(
      pastaTemporaria,
      config.teste
    );

    fs.copyFileSync(arquivoCodigo, codigoTemporario);
    fs.copyFileSync(caminhoTeste, testeTemporario);

    fs.writeFileSync(
      path.join(pastaTemporaria, "package.json"),
      JSON.stringify({ type: "module" }, null, 2)
    );

    const resultadoJest = executarJest(
      pastaTemporaria,
      testeTemporario
    );

    const relatorio = resultadoJest.relatorio;
    const resultadoSuite = relatorio?.testResults?.[0];

    const testesPassaram = relatorio?.numPassedTests ?? 0;
    const testesFalharam = relatorio?.numFailedTests ?? 0;
    const testesIgnorados = relatorio?.numPendingTests ?? 0;

    const erroExecucao =
      resultadoJest.erroExecucao ??
      resultadoSuite?.message ??
      null;

    const aprovado =
      resultadoJest.codigoSaida === 0 &&
      relatorio !== null &&
      testesFalharam === 0 &&
      !erroExecucao;

    return {
      exercicio: nomeExercicio,
      implementacao: path.basename(arquivoCodigo),
      caminho: path.relative(RAIZ, arquivoCodigo),
      aprovado,
      testes: {
        total: relatorio?.numTotalTests ?? 0,
        aprovados: testesPassaram,
        falhos: testesFalharam,
        ignorados: testesIgnorados
      },
      erroExecucao,
      detalhesFalhas: (resultadoSuite?.assertionResults ?? [])
        .filter((teste) => teste.status === "failed")
        .map((teste) => ({
          teste: teste.fullName,
          mensagens: (teste.failureMessages ?? []).map(
            (mensagem) => mensagem
          )
        }))
    };
  } finally {
    fs.rmSync(pastaTemporaria, {
      recursive: true,
      force: true
    });
  }
}

function main() {
  fs.mkdirSync(PASTA_RESULTADOS, { recursive: true });

  const arquivos = listarArquivosJs(PASTA_CODIGOS)
    .filter((arquivo) =>
      arquivo.split(path.sep).includes("refatorados")
    );

  const resultados = [];

  for (const arquivo of arquivos) {
    const pastaRefatorados = path.dirname(arquivo);
    const resultado = testarImplementacao(
      arquivo,
      pastaRefatorados
    );

    resultados.push(resultado);

    if (resultado.ignorado) {
      console.log(
        `[IGNORADO] ${path.basename(arquivo)}: ${resultado.motivo}`
      );
      continue;
    }

    console.log(
      `[${resultado.aprovado ? "APROVADO" : "REPROVADO"}] ` +
      `${resultado.exercicio} - ${resultado.implementacao}: ` +
      `${resultado.testes.aprovados} aprovados, ` +
      `${resultado.testes.falhos} falhos, ` +
      `${resultado.testes.ignorados} ignorados`
    );
  }

  const relatorioFinal = {
    dataExecucao: new Date().toISOString(),
    totalImplementacoes: resultados.filter(
      (resultado) => !resultado.ignorado
    ).length,
    aprovadas: resultados.filter(
      (resultado) => resultado.aprovado
    ).length,
    reprovadas: resultados.filter(
      (resultado) =>
        !resultado.ignorado && !resultado.aprovado
    ).length,
    ignoradas: resultados.filter(
      (resultado) => resultado.ignorado
    ).length,
    resultados
  };

  const caminhoRelatorio = path.join(
    PASTA_RESULTADOS,
    "relatorio-testes-refatorados.json"
  );

  fs.writeFileSync(
    caminhoRelatorio,
    JSON.stringify(relatorioFinal, null, 2),
    "utf8"
  );

  console.log(`\nRelatório salvo em: ${caminhoRelatorio}`);
  console.log(
    `Resumo: ${relatorioFinal.aprovadas} aprovadas, ` +
    `${relatorioFinal.reprovadas} reprovadas, ` +
    `${relatorioFinal.ignoradas} ignoradas.`
  );
}

main();