import { Polygon } from './Polygon'
import { IteratorType } from './types'
import { Edge } from './Edge'
import { Vertex } from './Vertex'

export class EdgeIterator implements Iterator<Edge> {
	root: Vertex | null
	one: Vertex | null = null
	two: Vertex | null = null

	constructor(public polygon: Polygon, public iterType: IteratorType) {
		this.root = polygon.root

		if (this.root === null) {
			return
		}

		// if (this.nextEdge() === null) {
		// 	this.root = null
		// 	this.one = null
		// 	this.two = null
		// }
	}

	nextVertex(curr: Vertex | null) {
		if (curr === null) {
			return null
		}

		switch (this.iterType) {
			case IteratorType.ALL: {
				curr = curr.next
				break
			}
			case IteratorType.SOURCE: {
				do {
					curr = curr.next
				} while (!curr.source)
				break
			}
		}

		return curr
	}

	nextEdge(): Vertex | null {
		if (this.root === null) {
			// empty polygon
			return null
		}

		if (this.one === null) {
			// find one (source) vertex
			// note: root is always a (source) vertex
			this.one = this.root
			this.two = this.nextVertex(this.one)
			if (this.two === this.one) {
				// just one (source) vertex
				// -> no (source) edges
				return null
			}
			return this.one
		}

		if (this.two === this.root) {
			// back at the root vertex?
			// -> mark iterator as "end"
			this.two = null
			this.one = null
			this.root = null
			return null
		}

		this.one = this.two
		this.two = this.nextVertex(this.one)

		return this.one
	}

	next(): IteratorResult<Edge> {
		const res = this.nextEdge()
		return { done: res === null, value: new Edge(this.one!, this.two!) }
	}
}

export class EdgeIterable implements Iterable<Edge> {
	constructor(public polygon: Polygon, public iterType: IteratorType) {}

	[Symbol.iterator](): EdgeIterator {
		return new EdgeIterator(this.polygon, this.iterType)
	}
}
