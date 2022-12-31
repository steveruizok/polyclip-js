import { Polygon } from '../Polygon'
import { EntryExitLabel, IteratorType } from '../types'
import { toggleStatus, xor } from '../utils'

export function createResult(PP: Polygon[], RR: Polygon[], UNION = false) {
	// for all crossing vertices
	for (const P of PP) {
		for (const I of P.vertices(IteratorType.CROSSING_INTERSECTION)) {
			const R = new Polygon()

			let V = I // start traversal at I
			V.intersection = false // mark visited vertices

			do {
				let status = V.enex
				status = toggleStatus(status)

				do {
					// traverse P (or Q) and add vertices to R, until...
					if (xor(status === EntryExitLabel.EXIT, UNION)) {
						V = V.next // move forward  from an ENTRY vertex to the next EXIT  vertex
					} else {
						V = V.prev // move backward from an EXIT  vertex to the next ENTRY vertex
					}

					V.intersection = false // mark visited vertices

					// add vertex to result polygon
					R.newVertex(V.p)
				} while (
					V.enex !== status && // ... we arrive at a vertex with opposite entry/exit flag, or
					V !== I // at the initial vertex I)
				)

				if (V !== I) {
					V = V.neighbour // switch from P to Q or vice versa
					V.intersection = false // mark visited vertices
				}
			} while (V !== I) // the result polygon component is complete,
			// if we are back to the initial vertex I
			RR.push(R)
		}
	}
}
