import { EPSILON } from './constants'
import { Point } from './Point'
import { IntersectionType } from './types'
import { Vertex } from './Vertex'

export class Edge {
	one: Vertex
	two: Vertex

	constructor(P: Vertex, Q: Vertex) {
		this.one = P
		this.two = Q
	}

	insertVertex(V: Vertex) {
		const alpha = V.alpha
		let curr = this.one

		if (alpha > -1.0) {
			do {
				curr = curr.next
			} while (!curr.source && curr.alpha < alpha)
		} else {
			curr = curr.next
		}

		curr.prev.next = V
		V.prev = curr.prev
		V.next = curr
		curr.prev = V
	}

	intersectEdge(edgeQ: Edge): {
		alpha: number
		beta: number
		intersection: IntersectionType
	} {
		const P1 = this.one.p
		const P2 = this.two.p
		const Q1 = edgeQ.one.p
		const Q2 = edgeQ.two.p

		const AP1 = P1.A(Q1, Q2)
		const AP2 = P2.A(Q1, Q2)

		let alpha = -1
		let beta = -1
		let intersection = IntersectionType.NO_INTERSECTION

		if (Math.abs(AP1 - AP2) > EPSILON) {
			// from here: [P1,P2] and [Q1,Q2] are not parallel

			// analyse potential intersection

			const AQ1 = Q1.A(P1, P2)
			const AQ2 = Q2.A(P1, P2)

			// compute alpha and beta
			alpha = AP1 / (AP1 - AP2)
			beta = AQ1 / (AQ1 - AQ2)

			// classify alpha
			let alpha_is_0 = false
			let alpha_in_0_1 = false

			if (alpha > EPSILON && alpha < 1.0 - EPSILON) alpha_in_0_1 = true
			else if (Math.abs(alpha) <= EPSILON) alpha_is_0 = true

			// classify beta
			let beta_is_0 = false
			let beta_in_0_1 = false

			if (beta > EPSILON && beta < 1.0 - EPSILON) beta_in_0_1 = true
			else if (Math.abs(beta) <= EPSILON) beta_is_0 = true

			// distinguish intersection types

			if (alpha_in_0_1 && beta_in_0_1) {
				intersection = IntersectionType.X_INTERSECTION
			} else if (alpha_is_0 && beta_in_0_1) {
				intersection = IntersectionType.T_INTERSECTION_Q
			} else if (beta_is_0 && alpha_in_0_1) {
				intersection = IntersectionType.T_INTERSECTION_P
			} else if (alpha_is_0 && beta_is_0) {
				intersection = IntersectionType.V_INTERSECTION
			}
		} else if (Math.abs(AP1) < EPSILON) {
			// from here: [P1,P2] and [Q1,Q2] are collinear

			// analyse potential overlap

			const dP = P2.sub(P1)
			const dQ = Q2.sub(Q1)
			const PQ = Q1.sub(P1)

			// compute alpha and beta
			alpha = PQ.dot(dP) / dP.dot(dP)
			beta = -(PQ.dot(dQ) / dQ.dot(dQ))

			// classify alpha
			let alpha_is_0 = false
			let alpha_in_0_1 = false
			let alpha_not_in_0_1 = false

			if (alpha > EPSILON && alpha < 1.0 - EPSILON) alpha_in_0_1 = true
			else if (Math.abs(alpha) <= EPSILON) alpha_is_0 = true
			else alpha_not_in_0_1 = true

			// classify beta
			let beta_is_0 = false
			let beta_in_0_1 = false
			let beta_not_in_0_1 = false

			if (beta > EPSILON && beta < 1.0 - EPSILON) beta_in_0_1 = true
			else if (Math.abs(alpha) <= EPSILON) beta_is_0 = true
			else beta_not_in_0_1 = true

			// distinguish intersection types

			if (alpha_in_0_1 && beta_in_0_1) {
				intersection = IntersectionType.X_OVERLAP
			} else if (alpha_not_in_0_1 && beta_in_0_1) {
				intersection = IntersectionType.T_OVERLAP_Q
			} else if (beta_not_in_0_1 && alpha_in_0_1) {
				intersection = IntersectionType.T_OVERLAP_P
			} else if (alpha_is_0 && beta_is_0) {
				intersection = IntersectionType.V_OVERLAP
			}
		}

		return { alpha, beta, intersection }
	}
}
