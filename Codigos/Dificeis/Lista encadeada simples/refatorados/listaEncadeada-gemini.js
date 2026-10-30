class Node {
  constructor(value, next = null, prev = null) {
    this.value = value;
    this.next = next;
    this.prev = prev;
    this.isElement = true;
  }
}

export function Element(value, next = null, prev = null) {
  return new Node(value, next, prev);
}

export class List {
  constructor(values = []) {
    this.head = null;
    this.tail = null;
    this.length = 0;

    values.forEach(value => this.add(value));
  }

  /**
   * Helper privado para garantir que o valor seja um nó/elemento
   */
  #toNode(value) {
    return value && value.isElement ? value : new Node(value);
  }

  prepend(value) {
    const newNode = this.#toNode(value);

    if (!this.head) {
      this.head = newNode;
    } else {
      this.head.prev = newNode;
      newNode.next = this.head;
      this.head = newNode;
    }

    if (!this.tail) {
      this.tail = newNode;
    }

    this.length++;
    return this;
  }

  append(value) {
    const newNode = this.#toNode(value);

    if (!this.tail) {
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    }

    if (!this.head) {
      this.head = newNode;
    }

    this.length++;
    return this;
  }

  add(value) {
    return this.prepend(value);
  }

  findNode(index) {
    if (index === 0) return this.tail;
    if (index === this.length - 1) return this.head;

    let cursor = this.tail;
    let currentIndex = 0;

    while (currentIndex++ < index) {
      if (!cursor) return null;
      cursor = cursor.prev;
    }

    return cursor;
  }

  at(index) {
    const node = this.findNode(index);
    return node ? node.value : null;
  }

  removeHead() {
    if (!this.head) return null;

    const nodeToRemove = this.head;

    if (this.head.next) {
      this.head = this.head.next;
      this.head.prev = null;
      nodeToRemove.next = null;
    } else {
      this.head = null;
      this.tail = null;
    }

    this.length--;
    return nodeToRemove;
  }

  removeTail() {
    if (!this.tail) return null;

    const nodeToRemove = this.tail;

    if (this.tail.prev) {
      this.tail = this.tail.prev;
      this.tail.next = null;
      nodeToRemove.prev = null;
    } else {
      this.tail = null;
      this.head = null;
    }

    this.length--;
    return nodeToRemove;
  }

  delete(index) {
    if (index === 0) return this.removeTail();
    if (index === this.length - 1) return this.removeHead();

    const nodeToRemove = this.findNode(index);
    if (nodeToRemove) {
      if (nodeToRemove.prev) nodeToRemove.prev.next = nodeToRemove.next;
      if (nodeToRemove.next) nodeToRemove.next.prev = nodeToRemove.prev;

      nodeToRemove.next = null;
      nodeToRemove.prev = null;
      return nodeToRemove;
    }

    return null;
  }

  map(fn) {
    const newList = new List();
    let cursor = this.tail;

    while (cursor) {
      newList.add(fn(cursor.value));
      cursor = cursor.prev;
    }

    return newList;
  }

  filter(fn) {
    const newList = new List();
    let cursor = this.tail;

    while (cursor) {
      if (fn(cursor.value)) {
        newList.add(cursor.value);
      }
      cursor = cursor.prev;
    }

    return newList;
  }

  reduce(fn, initialValue) {
    let accumulator = initialValue;
    let cursor = this.tail;

    while (cursor) {
      accumulator = fn(accumulator, cursor.value);
      cursor = cursor.prev;
    }

    return accumulator;
  }

  reverse() {
    const newList = new List();
    let cursor = this.head;

    while (cursor) {
      newList.add(cursor.value);
      cursor = cursor.next;
    }

    return newList;
  }

  toArray() {
    return [...this];
  }

  *[Symbol.iterator]() {
    let cursor = this.head;
    while (cursor) {
      yield cursor.value;
      cursor = cursor.next;
    }
  }
}