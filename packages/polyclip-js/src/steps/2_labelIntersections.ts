import { insert, toggleStatus, xor } from '../utils'
import { Point } from '../Point'
import { Polygon } from '../Polygon'
import {
	EntryExitLabel,
	IntersectionLabel,
	IteratorType,
	PolygonClipDebugging,
	RelativePositionType,
} from '../types'
import { Vertex } from '../Vertex'

export function labelIntersections(
	PP: Polygon[],
	QQ: Polygon[],
	RR: Polygon[],
	UNION = false,
	debug?: PolygonClipDebugging
) {
	let P_m: Vertex
	let P_p: Vertex
	let Q_m: Vertex
	let Q_p: Vertex
	let Q_m_type: RelativePositionType
	let Q_p_type: RelativePositionType
	let X: Vertex

	// let result = ``

	// loop over intersection vertices of P
	for (const P of PP) {
		for (const I of P.vertices(IteratorType.INTERSECTION)) {
			// determine local configuration at this intersection vertex
			P_m = I.prev // P-, predecessor of I on P
			P_p = I.next // P+, successor of I on P
			Q_m = I.neighbour.prev // Q-, predecessor of I on Q
			Q_p = I.neighbour.next // Q+, successor of I on P

			// check positions of Q- and Q+ relative to (P-, I, P+)
			Q_m_type = Q_m.getRelativePositionType(P_m, I, P_p)
			Q_p_type = Q_p.getRelativePositionType(P_m, I, P_p)

			// result += `${I.p.x} ${I.p.y} ${P_m.p.x} ${P_m.p.y}\n`

			// check non-overlapping cases
			if (
				(Q_m_type === RelativePositionType.LEFT &&
					Q_p_type === RelativePositionType.RIGHT) ||
				(Q_m_type === RelativePositionType.RIGHT &&
					Q_p_type === RelativePositionType.LEFT)
			) {
				I.label = IntersectionLabel.CROSSING
				if (debug) {
					debug.crossingIntersectionVertices++
				}
			}

			if (
				(Q_m_type === RelativePositionType.LEFT &&
					Q_p_type === RelativePositionType.LEFT) ||
				(Q_m_type === RelativePositionType.RIGHT &&
					Q_p_type === RelativePositionType.RIGHT)
			) {
				I.label = IntersectionLabel.BOUNCING
				if (debug) {
					debug.bouncingIntersectionVertices++
				}
			}

			// check overlapping cases
			if (
				(Q_p_type === RelativePositionType.IS_P_p &&
					Q_m_type === RelativePositionType.RIGHT) ||
				(Q_m_type === RelativePositionType.IS_P_p &&
					Q_p_type === RelativePositionType.RIGHT)
			) {
				I.label = IntersectionLabel.LEFT_ON
			}

			if (
				(Q_p_type === RelativePositionType.IS_P_p &&
					Q_m_type === RelativePositionType.LEFT) ||
				(Q_m_type === RelativePositionType.IS_P_p &&
					Q_p_type === RelativePositionType.LEFT)
			) {
				I.label = IntersectionLabel.RIGHT_ON
			}

			if (
				(Q_p_type === RelativePositionType.IS_P_p &&
					Q_m_type === RelativePositionType.IS_P_m) ||
				(Q_m_type === RelativePositionType.IS_P_p &&
					Q_p_type === RelativePositionType.IS_P_m)
			) {
				I.label = IntersectionLabel.ON_ON
			}

			if (
				(Q_m_type === RelativePositionType.IS_P_m &&
					Q_p_type === RelativePositionType.RIGHT) ||
				(Q_p_type === RelativePositionType.IS_P_m &&
					Q_m_type === RelativePositionType.RIGHT)
			) {
				I.label = IntersectionLabel.ON_LEFT
			}

			if (
				(Q_m_type === RelativePositionType.IS_P_m &&
					Q_p_type === RelativePositionType.LEFT) ||
				(Q_p_type === RelativePositionType.IS_P_m &&
					Q_m_type === RelativePositionType.LEFT)
			) {
				I.label = IntersectionLabel.ON_RIGHT
			}
		}
	}

	// 2) classify intersection chains

	// loop over intersection vertices of P
	for (const P of PP) {
		for (let I of P.vertices(IteratorType.INTERSECTION)) {
			// start of an intersection chain ?
			if (
				I.label === IntersectionLabel.LEFT_ON ||
				I.label === IntersectionLabel.RIGHT_ON
			) {
				let x: RelativePositionType
				// remember status of the first chain vertex and vertex itself
				if (I.label === IntersectionLabel.LEFT_ON) {
					x = RelativePositionType.LEFT
				} else {
					x = RelativePositionType.RIGHT
				}

				X = I

				// proceed to end of intersection chain and mark all visited vertices as NONE
				do {
					I.label = IntersectionLabel.NONE
					I = I.next
				} while (I.label === IntersectionLabel.ON_ON)

				let y: RelativePositionType
				if (I.label === IntersectionLabel.ON_LEFT) {
					y = RelativePositionType.LEFT
				} else {
					y = RelativePositionType.RIGHT
				}

				// determine type of intersection chain
				let chainType: IntersectionLabel
				if (x !== y) {
					chainType = IntersectionLabel.DELAYED_CROSSING
					if (debug) {
						debug.delayedCrossings++
					}
				} else {
					chainType = IntersectionLabel.DELAYED_BOUNCING
					if (debug) {
						debug.delayedBouncings++
					}
				}

				// mark both ends of an intersection chain with chainType (i.e., as DELAYED_*)
				X.label = chainType
				I.label = chainType
			}
		}
	}

	// 3) copy labels from P to Q

	// loop over intersection vertices of P
	for (const P of PP) {
		for (const I of P.vertices(IteratorType.INTERSECTION)) {
			I.neighbour.label = I.label
		}
	}

	// 3.5) check for special cases

	let noIntersection: Polygon[][] = [[], []]
	let identical: Polygon[][] = [[], []]
	let P_or_Q: Polygon[]
	let Q_or_P: Polygon[]

	for (let i = 0; i < 2; i++) {
		P_or_Q = PP // if i=0, then do it for P w.r.t. Q
		Q_or_P = QQ

		if (i === 1) {
			// if i=1, then do it for Q w.r.t. P
			P_or_Q = QQ
			Q_or_P = PP
		}

		// loop over all components of P (or Q)
		for (const P of P_or_Q) {
			if (P.noCrossingVertex(UNION)) {
				// P_ has no crossing vertex (but may have bounces or delayed bounces, except for UNION),
				// hence it does not intersect with Q_or_P
				insert(noIntersection, i, P) // remember component, and ignore it later in step 4

				// is P identical to some component of and Q_or_P?
				if (P.allOnOn()) {
					insert(identical, i, P) // remember for further processing below
				} else {
					// is P inside Q_or_P?
					let isInside = false
					const p = P.getNonIntersectionPoint()
					for (const Q of Q_or_P) {
						if (Q.pointInPolygon(p!)) {
							isInside = !isInside
						}
					}

					if (xor(isInside, UNION)) {
						RR.push(P) // add P to the result
						if (debug) {
							debug.interiorComponents++
						}
					}
				}
			}
		}
	}

	// handle components of P that are identical to some component of Q
	for (const P of identical[0]) {
		// is P a hole?
		let P_isHole = false

		for (const P_ of PP) {
			if (P_.root !== P.root && P_.pointInPolygon(P.root!.p)) {
				P_isHole = !P_isHole
			}
		}

		pqholes: for (const Q of identical[1]) {
			for (const V of Q.vertices(IteratorType.ALL)) {
				if (V === P.root!.neighbour) {
					// found Q that matches P
					// is Q a hole?
					let Q_isHole = false
					for (const Q_ of QQ) {
						if (Q_.root != Q.root && Q_.pointInPolygon(Q.root!.p)) {
							Q_isHole = !Q_isHole
						}
					}
					// if P and Q are both holes or both are not holes
					if (P_isHole === Q_isHole) {
						RR.push(P) // . add P to the result
						if (debug) {
							debug.identicalComponents++
						}
					}
					break pqholes
				}
			}
		}
	}

	// 4) set entry/exit flags

	const split: Vertex[][] = [[], []] // split vertex candidates for P and Q
	const crossing: Vertex[][] = [[], []] // CROSSING vertex candidates for P and Q
	let status: EntryExitLabel

	for (let i = 0; i < 2; ++i) {
		P_or_Q = PP // if i=0, then do it for P w.r.t. Q
		Q_or_P = QQ

		if (i === 1) {
			// if i=1, then do it for Q w.r.t. P
			P_or_Q = QQ
			Q_or_P = PP
		}

		// loop over all components of P (or Q)
		for (const P of P_or_Q) {
			// ignore P if it does not intersect with Q_or_P (detected in step 3.5 above)
			if (noIntersection[i].includes(P)) {
				continue
			}

			// start at a non-intersection vertex of P
			const V = P.getNonIntersectionVertex()

			// check if it is inside or outside Q (or P)
			// and set ENTRY/EXIT status accordingly
			status = EntryExitLabel.ENTRY

			for (const Q of Q_or_P) {
				if (Q.pointInPolygon(V!.p)) {
					status = toggleStatus(status)
				}
			}

			// starting at V, loop over those vertices of P, that are either
			// a crossing intersection or marked as ends of an intersection chain

			let first_chain_vertex = true // needed for dealing with crossing chains
			for (const I of P.vertices(IteratorType.INTERSECTION, V)) {
				// in the case of normal crossings, we...
				if (I.label === IntersectionLabel.CROSSING) {
					// mark vertex with current ENTRY/EXIT status
					I.enex = status
					// toggle status from ENTRY to EXIT or vice versa
					status = toggleStatus(status)
				}

				// identify split vertex candidates (INTERIOR bouncing vertices)
				if (
					I.label === IntersectionLabel.BOUNCING &&
					xor(status === EntryExitLabel.EXIT, UNION)
				) {
					insert(split, i, I)
				}

				// in the case of a delayed crossing chain, we
				// mark both end points of the chain with the current ENTRY/EXIT status,
				// toggling the status only at the end last chain vertex,
				// and, in case of a delayed EXIT  crossing, the first vertex
				// or, in case of a delayed ENTRY crossing, the last vertex,
				// of the chain as CROSSING
				if (I.label === IntersectionLabel.DELAYED_CROSSING) {
					// mark vertex with current ENTRY/EXIT status
					I.enex = status

					if (first_chain_vertex) {
						// are we at the first vertex of a delayed crossing chain?
						if (xor(status === EntryExitLabel.EXIT, UNION)) {
							I.label = IntersectionLabel.CROSSING // mark first vertex as CROSSING
						}
						first_chain_vertex = false
					} else {
						// here we are at the last vertex of a delayed crossing chain
						if (xor(status === EntryExitLabel.ENTRY, UNION)) {
							I.label = IntersectionLabel.CROSSING // mark last vertex as CROSSING
						}
						first_chain_vertex = true
						// toggle status from ENTRY to EXIT or vice versa (only for last chain vertex)
						status = toggleStatus(status)
					}
				}

				//
				// in the case of a delayed bouncing chain, we
				// mark both end points of the chain with the current ENTRY/EXIT status
				// toggling the status at both end points of the chain,
				// and, in case of a delayed INTERIOR bouncing, both end points
				// of the chain as CROSSING candidates
				//
				if (I.label === IntersectionLabel.DELAYED_BOUNCING) {
					// mark vertex with current ENTRY/EXIT status
					I.enex = status

					if (first_chain_vertex) {
						// are we at the first vertex of a delayed crossing chain?
						if (xor(status === EntryExitLabel.EXIT, UNION)) {
							insert(crossing, i, I) // mark first EXIT vertex as CROSSING candidate
						}
						first_chain_vertex = false
					} else {
						// here we are at the last vertex of a delayed crossing chain
						if (xor(status === EntryExitLabel.ENTRY, UNION)) {
							insert(crossing, i, I) // mark last ENTRY vertex as CROSSING candidate
						}
						first_chain_vertex = true
					}
					// toggle status from ENTRY to EXIT or vice versa (for first AND last chain vertex)
					status = toggleStatus(status)
				}
			}
		}
	}

	// 5) handle split vertex pairs

	// loop over P's split candidates
	for (const I_P of split[0]) {
		const I_Q = I_P.neighbour

		// check if the neighbour on Q is also a split candidate
		if (split[1].includes(I_Q)) {
			// split vertex pair
			if (debug) {
				debug.bouncingVertexPairsSplit++
			}

			// duplicate vertices
			const V_P = new Vertex(I_P.p)
			const V_Q = new Vertex(I_Q.p)

			// compute areas to compare local orientation
			const sP = I_P.prev.p.A(I_P.p, I_P.next.p)
			const sQ = I_Q.prev.p.A(I_Q.p, I_Q.next.p)

			// link vertices correctly
			if (sP * sQ > 0) {
				// same local orientation
				I_P.link(V_Q)
				I_Q.link(V_P)
			} else {
				// different local orientation
				V_P.link(V_Q)
			}

			// add duplicate vertices to P and Q
			V_P.insertVertex(I_P)
			V_Q.insertVertex(I_Q)

			// mark all four vertices correctly
			if (!UNION) {
				I_P.enex = EntryExitLabel.EXIT
				V_P.enex = EntryExitLabel.ENTRY
				I_Q.enex = EntryExitLabel.EXIT
				V_Q.enex = EntryExitLabel.ENTRY
			} else {
				I_P.enex = EntryExitLabel.ENTRY
				V_P.enex = EntryExitLabel.EXIT
				I_Q.enex = EntryExitLabel.ENTRY
				V_Q.enex = EntryExitLabel.EXIT
			}

			I_P.label = IntersectionLabel.CROSSING
			V_P.label = IntersectionLabel.CROSSING
			I_Q.label = IntersectionLabel.CROSSING
			V_Q.label = IntersectionLabel.CROSSING
		}
	}

	// 6) handle CROSSING vertex candidates

	// loop over P's CROSSING candidates
	for (const I_P of crossing[0]) {
		const I_Q = I_P.neighbour

		// check if the neighbour on Q is also a CROSSING candidate
		if (crossing[1].includes(I_Q)) {
			// mark CROSSING candidate pair as such
			I_P.label = IntersectionLabel.CROSSING
			I_Q.label = IntersectionLabel.CROSSING
		}
	}

	return RR
}
