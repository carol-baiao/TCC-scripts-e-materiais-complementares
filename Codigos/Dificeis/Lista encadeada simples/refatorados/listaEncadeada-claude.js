export function Element(value, next = null, prev = null) {
  return { value, next, prev, isElement: true }
}

export class List {
  constructor(values = []) {
    this.head = null
    this.tail = null
    this.length = 0
    values.forEach((value) => this.add(value))
  }

  *[Symbol.iterator]() {
    for (let cursor = this.head; cursor; cursor = cursor.next) {
      yield cursor.value
    }
  }

  add(value) {
    return this.prepend(value)
  }

  prepend(value) {
    const node = toNode(value)

    if (this.head) {
      this.head.prev = node
      node.next = this.head
    } else {
      this.tail = node
    }

    this.head = node
    this.length++
    return this
  }

  append(value) {
    const node = toNode(value)

    if (this.tail) {
      this.tail.next = node
      node.prev = this.tail
    } else {
      this.head = node
    }

    this.tail = node
    this.length++
    return this
  }

  at(index) {
    const node = this.findNode(index)
    return node ? node.value : null
  }

  findNode(index) {
    let cursor = this.tail
    for (let steps = 0; cursor && steps < index; steps++) {
      cursor = cursor.prev
    }
    return cursor
  }

  delete(index) {
    if (index === 0) return this.removeTail()
    if (index === this.length - 1) return this.removeHead()

    const node = this.findNode(index)
    if (!node) return null

    node.prev.next = node.next
    node.next.prev = node.prev
    node.next = null
    node.prev = null
    return node
  }

  removeTail() {
    const node = this.tail
    if (!node) return null

    if (node.prev) {
      this.tail = node.prev
      this.tail.next = null
      node.prev = null
    } else {
      this.tail = null
      this.head = null
    }

    this.length--
    return node
  }

  removeHead() {
    const node = this.head
    if (!node) return null

    if (node.next) {
      this.head = node.next
      this.head.prev = null
      node.next = null
    } else {
      this.head = null
      this.tail = null
    }

    this.length--
    return node
  }

  map(fn) {
    const result = new List()
    for (const value of valuesFromTail(this)) {
      result.add(fn(value))
    }
    return result
  }

  filter(fn) {
    const result = new List()
    for (const value of valuesFromTail(this)) {
      if (fn(value)) result.add(value)
    }
    return result
  }

  reduce(fn, initialValue) {
    let accumulator = initialValue
    for (const value of valuesFromTail(this)) {
      accumulator = fn(accumulator, value)
    }
    return accumulator
  }

  reverse() {
    const result = new List()
    for (const value of this) {
      result.add(value)
    }
    return result
  }

  toArray() {
    return [...this]
  }
}

function toNode(value) {
  return value.isElement ? value : Element(value)
}

function* valuesFromTail(list) {
  for (let cursor = list.tail; cursor; cursor = cursor.prev) {
    yield cursor.value
  }
}