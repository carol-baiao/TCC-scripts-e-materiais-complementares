//
// This is only a SKELETON file for the 'Zipper' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

class Node {
  _left;
  _right;
  _value;
  _parent;
  constructor({ left, right, value, parent} = {}) {

    this._left = left || null;
    this._right = right || null;
    this._value = value || null;
    this._parent = parent || null;
    
  }

  left(v) {
    if (v) this._left = v;
    return this._left;
  }

  setLeft(v) {
    this._left = v ? new Node(v) : null;
    return this;
  }

  right(v) {
    if (v) this._right = v;
    return this._right;
  }

  setRight(v) {
    this._right = v ? ((v instanceof Node) ? v : new Node(v) ): null;
    return this; 
  }

  value(v) {
    if (v) this._value = v;
    return this._value;
  }

  setValue(v) {
    if (v) this._value = v;
    return this;
  }

  parent(v) {
    if (v) this._parent = v;
    return this._parent;
  }

  up() {
    return this._parent;
  }

  toTree() {
    let repr = {};
    let root = (this.parent() !== null) ? this.parent() : this;
    // console.log('1>>> found', root);
    if (root){
      while (root.parent() !== null) {
        // console.log('2>>> found', root);
        root = root.parent(); 
      }
    }

    // console.log('3>>> found', root);
    this.getRepresentation(root, repr);
    // console.log('repr', repr);
    return repr;
  }

  getRepresentation(node, repr={}, key=[]) {
    // console.log('node', typeof node, node, key);
    const hasVal = (node != null);
    const hasFn = node && typeof node.value === 'function';
    // console.log('node', node.value, key);
    // console.log('node', node, key);

    if (key.length > 0) {
      // console.log('Sub');
      let subRpr = {};
      if (!hasVal) {
        subRpr = null;
      } else {
        subRpr['value'] = hasFn ? node.value() : node.value;
        subRpr['left'] = null;
        subRpr['right'] = null;
      }

      setPls(key.join('.'), repr, subRpr);
    } else {
      repr.value = hasVal ? node.value() : null;
      repr['left'] = null;
      repr['right'] = null;
    }

    if (!hasVal) { return }

    const hasLeft = hasFn ? node.left() : node.left;
    const hasRight = hasFn ? node.right() : node.right;
    
    if (hasLeft) { 
      this.getRepresentation(hasLeft, repr, [...key, 'left']); 
    }
    
    if (hasRight) { 
      this.getRepresentation(hasRight, repr, [...key, 'right']); 
    }
  }
}


const setPls = (string, obj, value) => {
    const [current,...rest] = string.split(".");
    rest.length >= 1 ? setPls(rest.join("."), obj[current] = obj[current] || {}, value) : obj[current]= value;
    return obj; 
};

export class Zipper {
  tree = {};

  pTree(n, parent = null, key = '') {
    const node = (parent !== null) ? new Node() : this.root;
    node.value(n.value);
  
    if (parent) {
      node.parent(parent);
      if (key) {
        parent[key](node);
      }
    }
  
    if (n.left) { this.pTree(n.left, node, 'left'); }
    if (n.right) { this.pTree(n.right, node, 'right'); }
  }

  getRepresentation(node, repr={}, key=[]) {
    if (typeof node.value !== 'function') { console.log('>>>', node.value); }
    console.log('node', typeof node, key);
    console.log('node', typeof node.value, key);

    if (key.length > 0) {
      console.log('Sub');
      let subRpr = {};
      // subRpr['value'] = (typeof node.value === 'function') ?node.value() : node.value;
      subRpr['value'] = node.value();
      subRpr['left'] = null;
      subRpr['right'] = null;

      setPls(key.join('.'), repr, subRpr);
    } else {
      repr.value = node.value();
      repr['left'] = null;
      repr['right'] = null;
    }
    
    if (node.left()) { 
      this.getRepresentation(node.left(), repr, [...key, 'left']); 
    }
    
    if (node.right()) { 
      this.getRepresentation(node.right(), repr, [...key, 'right']); 
    }
  }
  
  constructor(t) {
    this.tree = t;
    
    this.root = new Node({
      value: t.value
    });
    this.pTree(t);
    this.current = this.root;
  }

  static fromTree(t) {
    return new Zipper(t);
  }

  toTree() {
    // return this.tree;
    let repr = {};
    this.getRepresentation(this.root, repr);
    console.log('repr', repr);
    return repr;
  }

  value() {
    return this.current.value();
  }

  left() {
    // console.log(this.tree);
    this.current = this.current.left();
    // console.log(this.current);
    return this.root.left();
  }

  right() {
    // this.current = this.current.right();
    // return this.current;
    return this.root.right();
  }

  up() {
    this.current = this.current.parent();
    // return this.current;
    return this.root.up();
  }

  setValue(v) {
    return this.root.setValue(v);
  }

  setLeft(v) {
    return this.root.setLeft(v);
  }

  setRight(v) {

    const subTree = Zipper.fromTree(v);
    
    subTree.root._parent = this.root;
    // this.root.setRight(v);
    // return this.root;
    //this.root._right = subTree.root;
    this.root.setRight(subTree.root);
    return this.root;
  }
}