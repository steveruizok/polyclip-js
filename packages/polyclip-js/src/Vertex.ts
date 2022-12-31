import { Point } from './Point'
import {
	EntryExitLabel,
	IntersectionLabel,
	RelativePositionType,
} from './types'

export class Vertex {
	p: Point // coordinates of the vertex
	prev = {} as Vertex // pointer to previous vertex
	next = {} as Vertex // pointer to next vertex
	neighbour = {} as Vertex // pointer to neighbouring vertex for intersection vertices
	source = false // to mark source vertices of the polygon
	intersection = false // to mark intersection vertices
	alpha = -1 // to describe relative edge position of an intersection vertex
	label = IntersectionLabel.NONE // type of intersection vertex
	enex = EntryExitLabel.NEITHER // entry/exit "flag"

	constructor(q: Point, alpha = -1) {
		this.p = Point.From(q)
		this.alpha = alpha
	}

	insertVertex(curr: Vertex, alpha = -1) {
		if (alpha > -1.0)
			do {
				curr = curr.next
			} while (!curr.source && curr.alpha < alpha)
		else curr = curr.next

		curr.prev.next = this
		this.prev = curr.prev
		this.next = curr
		curr.prev = this
	}

	getRelativePositionType(
		P1: Vertex,
		P2: Vertex,
		P3: Vertex
	): RelativePositionType {
		// is Q linked to P1 ?
		if (P1.intersection !== undefined && P1.neighbour === this)
			return RelativePositionType.IS_P_m

		// is Q linked to P2 ?
		if (P3.intersection && P3.neighbour === this)
			return RelativePositionType.IS_P_p

		// check relative position of Q with respect to chain (P1,P2,P3)
		const s1 = this.p.A(P1.p, P2.p)
		const s2 = this.p.A(P2.p, P3.p)
		const s3 = P1.p.A(P2.p, P3.p)

		if (s3 > 0) {
			// chain makes a left turn
			if (s1 > 0 && s2 > 0) return RelativePositionType.LEFT
			else return RelativePositionType.RIGHT
		} else {
			// chain makes a right turn (or is straight)
			if (s1 < 0 && s2 < 0) return RelativePositionType.RIGHT
			else return RelativePositionType.LEFT
		}
	}

	link(Q: Vertex) {
		this.neighbour = Q
		Q.neighbour = this
		this.intersection = true
		Q.intersection = true
	}
}
