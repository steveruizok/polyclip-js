import { Edge } from './Edge'
import { EdgeIterable } from './EdgeIterator'
import { Point } from './Point'
import { IntersectionLabel, IteratorType } from './types'
import { Vertex } from './Vertex'
import { VertexIterable } from './VertexIterator'

export class Polygon {
	root: Vertex | null = null

	newVertex(V: Point, source = false): void {
		const vertex = new Vertex(V)
		vertex.source = source

		if (this.root === null) {
			vertex.next = vertex
			vertex.prev = vertex
			this.root = vertex
		} else {
			vertex.prev = this.root.prev
			vertex.next = this.root
			this.root.prev.next = vertex
			this.root.prev = vertex
		}
	}

	removeVertex(V: Vertex): void {
		if (this.root === V) {
			this.root = V.next
			if (this.root.next === this.root) {
				this.root = null
			}
		}
		V.prev.next = V.next
		V.next.prev = V.prev
	}

	pointInPolygon(R: Point): boolean {
		const { root } = this
		let w = 0
		let V = root
		if (V === null) return false

		let P0: Point
		let P1: Point

		for (const edge of this.edges(IteratorType.ALL)) {
			P0 = edge.one.p
			P1 = edge.two.p

			if (P0.y < R.y != P1.y < R.y) {
				if (P0.x >= R.x) {
					if (P1.x > R.x) {
						w = w + 2 * (P1.y > P0.y ? 1 : 0) - 1
					} else if (P0.A(P1, R) > 0 == P1.y > P0.y) {
						w = w + 2 * (P1.y > P0.y ? 1 : 0) - 1
					}
				} else if (P1.x > R.x) {
					if (P0.A(P1, R) > 0 == P1.y > P0.y) {
						w = w + 2 * (P1.y > P0.y ? 1 : 0) - 1
					}
				}
			}
		}

		return w % 2 != 0
	}

	allOnOn(): boolean {
		for (const V of this.vertices(IteratorType.ALL)) {
			if (V.label !== IntersectionLabel.ON_ON) {
				return false
			}
		}

		return true
	}

	noCrossingVertex(union = false) {
		for (const V of this.vertices(IteratorType.ALL)) {
			if (V.intersection) {
				if (
					V.label === IntersectionLabel.CROSSING ||
					V.label === IntersectionLabel.DELAYED_CROSSING
				) {
					return false
				}
				if (
					union &&
					(V.label === IntersectionLabel.BOUNCING ||
						V.label === IntersectionLabel.DELAYED_BOUNCING)
				) {
					return false
				}
			}
		}
		return true
	}

	getIntersectionPoint() {
		for (const V of this.vertices(IteratorType.ALL)) {
			if (!V.intersection) {
				return V.p
			}
		}

		for (const V of this.vertices(IteratorType.ALL)) {
			if (
				V.next.neighbour !== V.neighbour.prev &&
				V.next.neighbour !== V.neighbour.next
			) {
				return V.p.add(V.next.p).mulScalar(0.5)
			}
		}

		return null
	}

	getNonIntersectionPoint() {
		for (const V of this.vertices(IteratorType.ALL)) {
			if (!V.intersection) {
				return V.p
			}
		}

		for (const V of this.vertices(IteratorType.ALL)) {
			if (
				V.next.neighbour !== V.neighbour.prev &&
				V.next.neighbour !== V.neighbour.next
			) {
				return V.p.add(V.next.p).mulScalar(0.5)
			}
		}

		return
	}

	getNonIntersectionVertex() {
		for (const V of this.vertices(IteratorType.ALL)) {
			if (!V.intersection) {
				return V
			}
		}

		for (const V of this.vertices(IteratorType.ALL)) {
			if (
				V.next.neighbour !== V.neighbour.prev &&
				V.next.neighbour !== V.neighbour.next
			) {
				const p = V.p.add(V.next.p).mulScalar(0.5)
				const T = new Vertex(p)
				T.insertVertex(V)
				return T
			}
		}

		return null
	}

	vertices(
		iterType: IteratorType,
		first: Vertex | null = null
	): Iterable<Vertex> {
		return new VertexIterable(this, iterType, first)
	}

	edges(iterType: IteratorType): Iterable<Edge> {
		return new EdgeIterable(this, iterType)
	}

	static From(points: { x: number; y: number }[]) {
		const polygon = new Polygon()

		for (let i = 0; i < points.length; i++) {
			polygon.newVertex(new Point(points[i].x, points[i].y), true)
		}

		return polygon
	}
}
