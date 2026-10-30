/**
 * Nó de uma árvore binária.
 *
 * Os métodos `left`, `right`, `value` e `parent` funcionam como getter quando
 * chamados sem argumentos e como setter quando recebem um valor.
 */
class Node {
  constructor({ left, right, value, parent } = {}) {
    this._left = left || null;
    this._right = right || null;
    this._value = value || null;
    this._parent = parent || null;
  }

  left(node) {
    if (node) this._left = node;
    return this._left;
  }

  setLeft(data) {
    this._left = data ? new Node(data) : null;
    return this;
  }

  right(node) {
    if (node) this._right = node;
    return this._right;
  }

  setRight(data) {
    this._right = data ? (data instanceof Node ? data : new Node(data)) : null;
    return this;
  }

  value(newValue) {
    if (newValue) this._value = newValue;
    return this._value;
  }

  setValue(newValue) {
    if (newValue) this._value = newValue;
    return this;
  }

  parent(node) {
    if (node) this._parent = node;
    return this._parent;
  }

  up() {
    return this._parent;
  }
}

/**
 * Cria recursivamente os nós filhos de `node` a partir da estrutura de `source`.
 */
function attachChildren(source, node) {
  for (const side of ['left', 'right']) {
    if (source[side]) {
      const child = new Node({ value: source[side].value, parent: node });
      node[side](child);
      attachChildren(source[side], child);
    }
  }
}

/**
 * Converte recursivamente uma estrutura de nós na representação de objeto
 * `{ value, left, right }`.
 */
function toRepresentation(node) {
  if (!node) return null;

  return {
    value: node.value(),
    left: toRepresentation(node.left()),
    right: toRepresentation(node.right()),
  };
}

export class Zipper {
  constructor(tree) {
    this.tree = tree;
    this.root = new Node({ value: tree.value });
    attachChildren(tree, this.root);
    this.current = this.root;
  }

  static fromTree(tree) {
    return new Zipper(tree);
  }

  toTree() {
    return toRepresentation(this.root);
  }

  value() {
    return this.current.value();
  }

  left() {
    this.current = this.current.left();
    return this.root.left();
  }

  right() {
    return this.root.right();
  }

  up() {
    this.current = this.current.parent();
    return this.root.up();
  }

  setValue(value) {
    return this.root.setValue(value);
  }

  setLeft(tree) {
    return this.root.setLeft(tree);
  }

  setRight(tree) {
    const subTree = Zipper.fromTree(tree);
    subTree.root.parent(this.root);
    this.root.setRight(subTree.root);
    return this.root;
  }
}