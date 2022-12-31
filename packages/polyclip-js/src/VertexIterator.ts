import { Polygon } from './Polygon'
import { IntersectionLabel, IteratorType } from './types'
import { Vertex } from './Vertex'

export class VertexIterator implements Iterator<Vertex> {
	root: Vertex
	V: Vertex | null = null

	constructor(
		public polygon: Polygon,
		public iterType: IteratorType,
		public first: Vertex | null = null
	) {
		if (first === null) {
			this.root = polygon.root!
		} else {
			this.root = first
		}
	}

	next(): IteratorResult<Vertex> {
		let nextFound = false

		if (this.V === null) {
			this.V = this.root

			switch (this.iterType) {
				case IteratorType.ALL: {
					nextFound = true
					break
				}
				case IteratorType.SOURCE: {
					if (this.V.source) {
						nextFound = true
					}
					break
				}
				case IteratorType.INTERSECTION: {
					if (this.V.intersection) {
						nextFound = true
					}
					break
				}
				case IteratorType.CROSSING_INTERSECTION: {
					if (
						this.V.intersection &&
						this.V.label === IntersectionLabel.CROSSING
					) {
						nextFound = true
					}
					break
				}
			}
		}

		while (!nextFound) {
			switch (this.iterType) {
				case IteratorType.ALL: {
					this.V = this.V.next
					break
				}
				case IteratorType.SOURCE: {
					do {
						this.V = this.V.next
					} while (!this.V.source && this.V !== this.root)
					break
				}
				case IteratorType.INTERSECTION: {
					do {
						this.V = this.V.next
					} while (!this.V.intersection && this.V !== this.root)
					break
				}
				case IteratorType.CROSSING_INTERSECTION: {
					do {
						this.V = this.V.next
					} while (
						(!this.V.intersection ||
							this.V.label !== IntersectionLabel.CROSSING) &&
						this.V !== this.root
					)
					break
				}
			}

			if (this.V === this.root) {
				this.V = null
				return { done: true, value: this.V }
			}

			switch (this.iterType) {
				case IteratorType.ALL: {
					nextFound = true
					break
				}
				case IteratorType.SOURCE: {
					if (this.V.source) {
						nextFound = true
					}
					break
				}
				case IteratorType.INTERSECTION: {
					if (this.V.intersection) {
						nextFound = true
					}
					break
				}
				case IteratorType.CROSSING_INTERSECTION: {
					if (
						this.V.intersection &&
						this.V.label === IntersectionLabel.CROSSING
					) {
						nextFound = true
					}
					break
				}
			}
		}

		return { done: false, value: this.V }
	}
}

export class VertexIterable implements Iterable<Vertex> {
	constructor(
		public polygon: Polygon,
		public iterType: IteratorType,
		public first: Vertex | null = null
	) {}

	[Symbol.iterator](): VertexIterator {
		return new VertexIterator(this.polygon, this.iterType, this.first)
	}
}
