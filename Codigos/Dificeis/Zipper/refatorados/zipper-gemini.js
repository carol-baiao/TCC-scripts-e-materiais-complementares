export class Zipper {
  /**
   * Construtor privado/interno para manter o nó atual e a árvore.
   * @param {Object|null} node - Estrutura de dados do nó { value, left, right }
   * @param {Array} path - Histórico do caminho percorrido para permitir o 'up()'
   */
  constructor(node, path = []) {
    this._node = node;
    this._path = path;
  }

  /**
   * Cria uma nova instância de Zipper a partir de uma estrutura de árvore binária simples.
   * @param {Object|null} tree
   * @returns {Zipper|null}
   */
  static fromTree(tree) {
    if (!tree) return null;
    // Deep clone para garantir imutabilidade do objeto de entrada
    const treeCopy = JSON.parse(JSON.stringify(tree));
    return new Zipper(treeCopy);
  }

  /**
   * Reconstrói e retorna a árvore completa a partir do ponto atual.
   * @returns {Object|null}
   */
  toTree() {
    let current = this;
    while (current._path.length > 0) {
      current = current.up();
    }
    return current._node;
  }

  /**
   * Retorna o valor do nó atual.
   * @returns {*}
   */
  value() {
    return this._node ? this._node.value : null;
  }

  /**
   * Navega para o filho à esquerda.
   * @returns {Zipper|null}
   */
  left() {
    if (!this._node || !this._node.left) {
      return null;
    }
    return new Zipper(this._node.left, [
      { dir: 'left', parent: this._node },
      ...this._path
    ]);
  }

  /**
   * Navega para o filho à direita.
   * @returns {Zipper|null}
   */
  right() {
    if (!this._node || !this._node.right) {
      return null;
    }
    return new Zipper(this._node.right, [
      { dir: 'right', parent: this._node },
      ...this._path
    ]);
  }

  /**
   * Navega de volta para o nó pai na árvore.
   * @returns {Zipper|null}
   */
  up() {
    if (this._path.length === 0) {
      return null;
    }

    const [{ dir, parent }, ...restPath] = this._path;
    const updatedParent = {
      ...parent,
      [dir]: this._node
    };

    return new Zipper(updatedParent, restPath);
  }

  /**
   * Define o valor do nó atual e retorna a nova instância do Zipper.
   * @param {*} value
   * @returns {Zipper}
   */
  setValue(value) {
    const updatedNode = {
      ...this._node,
      value
    };
    return new Zipper(updatedNode, this._path);
  }

  /**
   * Define a subárvore à esquerda do nó atual.
   * @param {Object|null} left
   * @returns {Zipper}
   */
  setLeft(left) {
    const updatedNode = {
      ...this._node,
      left: left ? JSON.parse(JSON.stringify(left)) : null
    };
    return new Zipper(updatedNode, this._path);
  }

  /**
   * Define a subárvore à direita do nó atual.
   * @param {Object|null} right
   * @returns {Zipper}
   */
  setRight(right) {
    const updatedNode = {
      ...this._node,
      right: right ? JSON.parse(JSON.stringify(right)) : null
    };
    return new Zipper(updatedNode, this._path);
  }
}