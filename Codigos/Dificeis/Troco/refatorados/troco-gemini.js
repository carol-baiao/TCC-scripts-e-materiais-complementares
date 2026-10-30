export class Change {
  /**
   * Calcula a menor quantidade de moedas necessária para atingir o valor alvo.
   * 
   * @param {number[]} coinArray Moedas disponíveis.
   * @param {number} target Valor total desejado.
   * @returns {number[]} Array ordenado com as moedas que compõem o troco.
   */
  calculate(coinArray, target) {
    this.validateInputs(coinArray, target);

    if (target === 0) {
      return [];
    }

    // Filtra moedas válidas e remove duplicatas
    const validCoins = [...new Set(coinArray.filter(coin => coin > 0 && coin <= target))];

    const result = this.findFewestCoins(validCoins, target);

    if (!result) {
      throw new Error(`The total ${target} cannot be represented in the given currency.`);
    }

    return result;
  }

  /**
   * Valida as entradas iniciais antes de processar o troco.
   */
  validateInputs(coinArray, target) {
    if (target < 0) {
      throw new Error('Negative totals are not allowed.');
    }
    if (!Array.isArray(coinArray)) {
      throw new Error('Coins must be provided as an array.');
    }
  }

  /**
   * Utiliza Busca em Largura (BFS) para garantir o menor número de moedas.
   * 
   * @param {number[]} coins Moedas disponíveis para uso.
   * @param {number} target Valor alvo.
   * @returns {number[] | null} Lista de moedas ou null se não houver solução.
   */
  findFewestCoins(coins, target) {
    // Fila para a busca em largura: cada elemento guarda [trocoRestante, moedasUsadas]
    const queue = [{ remaining: target, coinsUsed: [] }];
    const visited = new Set([target]);

    while (queue.length > 0) {
      const { remaining, coinsUsed } = queue.shift();

      for (const coin of coins) {
        const nextRemaining = remaining - coin;

        if (nextRemaining === 0) {
          // Como usamos BFS, a primeira combinação encontrada que chega a zero 
          // é garantidamente a que possui o menor número de moedas.
          return [...coinsUsed, coin].sort((a, b) => a - b);
        }

        if (nextRemaining > 0 && !visited.has(nextRemaining)) {
          visited.add(nextRemaining);
          queue.push({
            remaining: nextRemaining,
            coinsUsed: [...coinsUsed, coin]
          });
        }
      }
    }

    return null;
  }
}