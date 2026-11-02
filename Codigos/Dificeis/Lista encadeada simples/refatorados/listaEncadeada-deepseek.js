export function Element(value, next = null, prev = null) {
  return { value, next, prev, isElement: true }
}

export function List(values = []) {
  this.head = null
  this.tail = null
  this.length = 0
  values.forEach(value => this.add(value))
}

Object.assign(
  List.prototype,
  withPrepend(),
  withAppend(),
  withAdd(),
  withAt(),
  withMap(),
  withFilter(),
  withReduce(),
  withDelete(),
  withFindNode(),
  withRemoveHead(),
  withRemoveTail(),
  withIterator(),
  withListReverse(),
  withToArray()
)

/* ---------- helpers internos ---------- */

function toElement(value) {
  return value && value.isElement ? value : Element(value)
}

function isIndexOutOfBounds(list, index) {
  return index < 0 || index >= list.length
}

/* ---------- mixins ---------- */

function withAt() {
  return {
    at(index) {
      const node = this.findNode(index)
      return node ? node.value : null
    },
  }
}

function withAdd() {
  return {
    // Por design, `add` insere no início (alias de `prepend`).
    add(value) {
      return this.prepend(value)
    },
  }
}

function withToArray() {
  return {
    toArray() {
      return [...this]
    },
  }
}

function withListReverse() {
  return {
    reverse() {
      const newList = new List()
      let cursor = this.head
      while (cursor) {
        newList.add(cursor.value)
        cursor = cursor.next
      }
      return newList
    },
  }
}

function withMap() {
  return {
    // Itera do tail ao head (ordem inversa ao iterator).
    map(fn) {
      const newList = new List()
      let cursor = this.tail
      while (cursor) {
        newList.add(fn(cursor.value))
        cursor = cursor.prev
      }
      return newList
    },
  }
}

function withFilter() {
  return {
    // Itera do tail ao head (ordem inversa ao iterator).
    filter(fn) {
      const newList = new List()
      let cursor = this.tail
      while (cursor) {
        if (fn(cursor.value)) {
          newList.add(cursor.value)
        }
        cursor = cursor.prev
      }
      return newList
    },
  }
}

function withReduce() {
  return {
    // Itera do tail ao head (ordem inversa ao iterator).
    reduce(fn, initialValue) {
      let accumulator = initialValue
      let cursor = this.tail
      while (cursor) {
        accumulator = fn(accumulator, cursor.value)
        cursor = cursor.prev
      }
      return accumulator
    },
  }
}

function withIterator() {
  return {
    *[Symbol.iterator]() {
      let cursor = this.head
      while (cursor) {
        yield cursor.value
        cursor = cursor.next
      }
    },
  }
}

function withPrepend() {
  return {
    prepend(value) {
      const newNode = toElement(value)

      if (this.head) {
        this.head.prev = newNode
        newNode.next = this.head
      }
      this.head = newNode

      if (!this.tail) {
        this.tail = newNode
      }

      this.length++
      return this
    },
  }
}

function withAppend() {
  return {
    append(value) {
      const newNode = toElement(value)

      if (this.tail) {
        this.tail.next = newNode
        newNode.prev = this.tail
      }
      this.tail = newNode

      if (!this.head) {
        this.head = newNode
      }

      this.length++
      return this
    },
  }
}

function withFindNode() {
  return {
    findNode(index) {
      if (isIndexOutOfBounds(this, index)) {
        return null
      }
      // Índices são contados a partir do tail (index 0 == tail).
      if (index === 0) {
        return this.tail
      }
      if (index === this.length - 1) {
        return this.head
      }

      let cursor = this.tail
      let currentIndex = 0
      while (currentIndex++ < index) {
        cursor = cursor.prev
      }
      return cursor
    },
  }
}

function withDelete() {
  return {
    delete(index) {
      if (index === 0) {
        return this.removeTail()
      }
      if (index === this.length - 1) {
        return this.removeHead()
      }

      const nodeToRemove = this.findNode(index)
      if (!nodeToRemove) {
        return null
      }

      nodeToRemove.prev.next = nodeToRemove.next
      nodeToRemove.next.prev = nodeToRemove.prev
      nodeToRemove.next = null
      nodeToRemove.prev = null
      return nodeToRemove
    },
  }
}

function withRemoveTail() {
  return {
    removeTail() {
      if (!this.tail) {
        return null
      }

      const nodeToRemove = this.tail
      if (this.tail.prev) {
        this.tail = this.tail.prev
        this.tail.next = null
        nodeToRemove.prev = null
      } else {
        this.tail = null
        this.head = null
      }

      this.length--
      return nodeToRemove
    },
  }
}

function withRemoveHead() {
  return {
    removeHead() {
      if (!this.head) {
        return null
      }

      const nodeToRemove = this.head
      if (this.head.next) {
        this.head = this.head.next
        this.head.prev = null
        nodeToRemove.next = null
      } else {
        this.head = null
        this.tail = null
      }

      this.length--
      return nodeToRemove
    },
  }
}