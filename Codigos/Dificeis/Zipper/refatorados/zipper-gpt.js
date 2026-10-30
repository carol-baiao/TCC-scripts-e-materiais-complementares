
class Node {
  _left;
  _right;
  _value;
  _parent;

  constructor({ left, right, value, parent } = {}) {
    this._left = left || null;
    this._right = right || null;
    this._value = value || null;
    this._parent = parent || null;
  }

  left(value) {
    if (value) {
      this._left = value;
    }

    return this._left;
  }

  setLeft(value) {
    this._left = value ? new Node(value) : null;
    return this;
  }

  right(value) {
    if (value) {
      this._right = value;
    }

    return this._right;
  }

  setRight(value) {
    this._right = value
      ? value instanceof Node
        ? value
        : new Node(value)
      : null;

    return this;
  }

  value(newValue) {
    if (newValue) {
      this._value = newValue;
    }

    return this._value;
  }

  setValue(newValue) {
    if (newValue) {
      this._value = newValue;
    }

    return this;
  }

  parent(newParent) {
    if (newParent) {
      this._parent = newParent;
    }

    return this._parent;
  }

  up() {
    return this._parent;
  }

  toTree() {
    let root = this.parent() ?? this;

    while (root.parent() !== null) {
      root = root.parent();
    }

    const representation = {};
    this.getRepresentation(root, representation);

    return representation;
  }

  getRepresentation(node, representation = {}, path = []) {
    const nodeExists = node != null;
    const hasMethods = nodeExists &&
      typeof node.value === 'function';

    if (path.length > 0) {
      const subtree = nodeExists
        ? {
            value: hasMethods ? node.value() : node.value,
            left: null,
            right: null,
          }
        : null;

      setPath(path.join('.'), representation, subtree);
    } else {
      representation.value = nodeExists
        ? hasMethods
          ? node.value()
          : node.value
        : null;

      representation.left = null;
      representation.right = null;
    }

    if (!nodeExists) {
      return;
    }

    const leftNode = hasMethods ? node.left() : node.left;
    const rightNode = hasMethods ? node.right() : node.right;

    if (leftNode) {
      this.getRepresentation(
        leftNode,
        representation,
        [...path, 'left'],
      );
    }

    if (rightNode) {
      this.getRepresentation(
        rightNode,
        representation,
        [...path, 'right'],
      );
    }
  }
}

const setPath = (path, object, value) => {
  const [currentKey, ...remainingKeys] = path.split('.');

  if (remainingKeys.length === 0) {
    object[currentKey] = value;
    return object;
  }

  object[currentKey] = object[currentKey] || {};

  return setPath(
    remainingKeys.join('.'),
    object[currentKey],
    value,
  );
};

export class Zipper {
  tree = {};

  constructor(tree) {
    this.tree = tree;

    this.root = new Node({
      value: tree.value,
    });

    this.buildTree(tree);
    this.current = this.root;
  }

  buildTree(treeNode, parent = null, side = '') {
    const node = parent !== null ? new Node() : this.root;

    node.value(treeNode.value);

    if (parent) {
      node.parent(parent);

      if (side) {
        parent[side](node);
      }
    }

    if (treeNode.left) {
      this.buildTree(treeNode.left, node, 'left');
    }

    if (treeNode.right) {
      this.buildTree(treeNode.right, node, 'right');
    }
  }

  getRepresentation(node, representation = {}, path = []) {
    if (path.length > 0) {
      const subtree = {
        value: node.value(),
        left: null,
        right: null,
      };

      setPath(path.join('.'), representation, subtree);
    } else {
      representation.value = node.value();
      representation.left = null;
      representation.right = null;
    }

    if (node.left()) {
      this.getRepresentation(
        node.left(),
        representation,
        [...path, 'left'],
      );
    }

    if (node.right()) {
      this.getRepresentation(
        node.right(),
        representation,
        [...path, 'right'],
      );
    }
  }

  static fromTree(tree) {
    return new Zipper(tree);
  }

  toTree() {
    const representation = {};
    this.getRepresentation(this.root, representation);

    return representation;
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

  setLeft(value) {
    return this.root.setLeft(value);
  }

  setRight(value) {
    const subtree = Zipper.fromTree(value);

    subtree.root._parent = this.root;
    this.root.setRight(subtree.root);

    return this.root;
  }
}
