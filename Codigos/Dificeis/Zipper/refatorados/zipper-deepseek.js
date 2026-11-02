// Representa um nó da árvore binária. Imutável em relação à estrutura
// (setters são do Zipper, não do Node).
class Node {
  constructor({ left = null, right = null, value = null, parent = null } = {}) {
    this.left = left;
    this.right = right;
    this.value = value;
    this.parent = parent;
  }
}

export class Zipper {
  // Cria um Zipper a partir de uma árvore "pura" (objeto plano {value, left, right}).
  static fromTree(tree) {
    const root = Zipper.#buildNode(tree, null);
    return new Zipper(root);
  }

  // Converte recursivamente um objeto plano em Node, ligando os parentes.
  static #buildNode(tree, parent) {
    if (tree == null) return null;

    const node = new Node({ value: tree.value, parent });

    node.left = Zipper.#buildNode(tree.left ?? null, node);
    node.right = Zipper.#buildNode(tree.right ?? null, node);

    return node;
  }

  // Converte um Node (e seus descendentes) num objeto plano.
  static #toPlainObject(node) {
    if (node == null) return null;

    return {
      value: node.value,
      left: Zipper.#toPlainObject(node.left),
      right: Zipper.#toPlainObject(node.right),
    };
  }

  #current;

  constructor(rootNode) {
    this.#current = rootNode;
  }

  // --- Acesso ao valor ---

  value() {
    return this.#current?.value ?? null;
  }

  // --- Navegação (retorna um novo Zipper focado no nó destino) ---

  left() {
    if (!this.#current?.left) return null;
    return new Zipper(this.#current.left);
  }

  right() {
    if (!this.#current?.right) return null;
    return new Zipper(this.#current.right);
  }

  up() {
    if (!this.#current?.parent) return null;
    return new Zipper(this.#current.parent);
  }

  // --- Edição (retorna um novo Zipper; não muta o nó atual) ---

  setValue(value) {
    return Zipper.#withCurrent(this.#current, { value });
  }

  setLeft(tree) {
    const newLeft = Zipper.#buildNode(tree ?? null, this.#current);
    return Zipper.#withCurrent(this.#current, { left: newLeft });
  }

  setRight(tree) {
    const newRight = Zipper.#buildNode(tree ?? null, this.#current);
    return Zipper.#withCurrent(this.#current, { right: newRight });
  }

  // Cria um novo Node com as mesmas ligações do original, mas com
  // as propriedades sobrescritas. Mantém a imutabilidade do Zipper.
  static #withCurrent(node, overrides) {
    const clone = new Node({
      left: node.left,
      right: node.right,
      value: node.value,
      parent: node.parent,
    });
    Object.assign(clone, overrides);

    // Corrige o parentesco dos filhos, se foram substituídos.
    if (clone.left) clone.left.parent = clone;
    if (clone.right) clone.right.parent = clone;

    return new Zipper(clone);
  }

  // --- Serialização ---

  toTree() {
    let root = this.#current;
    while (root.parent) root = root.parent;

    return Zipper.#toPlainObject(root);
  }
}