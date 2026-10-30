export function Element(value, next = null, prev = null) {
  return {
    value,
    next,
    prev,
    isElement: true,
  }
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
  withToArray(),
)

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
      const reversedList = new List()
      let currentNode = this.head

      while (currentNode) {
        reversedList.add(currentNode.value)
        currentNode = currentNode.next
      }

      return reversedList
    },
  }
}

function withMap() {
  return {
    map(callback) {
      const mappedList = new List()
      let currentNode = this.tail

      while (currentNode) {
        mappedList.add(callback(currentNode.value))
        currentNode = currentNode.prev
      }

      return mappedList
    },
  }
}

function withFilter() {
  return {
    filter(predicate) {
      const filteredList = new List()
      let currentNode = this.tail

      while (currentNode) {
        if (predicate(currentNode.value)) {
          filteredList.add(currentNode.value)
        }

        currentNode = currentNode.prev
      }

      return filteredList
    },
  }
}

function withReduce() {
  return {
    reduce(callback, initialValue) {
      let accumulator = initialValue
      let currentNode = this.tail

      while (currentNode) {
        accumulator = callback(accumulator, currentNode.value)
        currentNode = currentNode.prev
      }

      return accumulator
    },
  }
}

function withIterator() {
  return {
    *[Symbol.iterator]() {
      let currentNode = this.head

      while (currentNode) {
        yield currentNode.value
        currentNode = currentNode.next
      }
    },
  }
}

function withPrepend() {
  return {
    prepend(value) {
      let newNode = value

      if (!newNode.isElement) {
        newNode = Element(value)
      }

      if (!this.head) {
        this.head = newNode
      } else {
        this.head.prev = newNode
        newNode.next = this.head
        this.head = newNode
      }

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
      let newNode = value

      if (!newNode.isElement) {
        newNode = Element(value)
      }

      if (!this.tail) {
        this.tail = newNode
      } else {
        this.tail.next = newNode
        newNode.prev = this.tail
        this.tail = newNode
      }

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
      if (index === 0) {
        return this.tail
      }

      if (index === this.length - 1) {
        return this.head
      }

      let currentNode = this.tail
      let currentIndex = 0

      while (currentIndex++ < index) {
        if (!currentNode) {
          return null
        }

        currentNode = currentNode.prev
      }

      return currentNode
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

      if (nodeToRemove) {
        nodeToRemove.prev.next = nodeToRemove.next
        nodeToRemove.next.prev = nodeToRemove.prev

        nodeToRemove.next = null
        nodeToRemove.prev = null

        return nodeToRemove
      }

      return null
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