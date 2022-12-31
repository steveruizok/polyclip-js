import { Point } from '../Point'
import { Polygon } from '../Polygon'
import { IntersectionType, IteratorType, PolygonClipDebugging } from '../types'
import { Vertex } from '../Vertex'

export function computeIntersections(
	PP: Polygon[],
	PQ: Polygon[],
	debug?: PolygonClipDebugging
) {
	let I: Point
	let I_P: Vertex
	let I_Q: Vertex
	let P1: Vertex
	let Q1: Vertex

	// loop over the source edges of P and Q
	for (const P of PP) {
		for (const edgeP of P.edges(IteratorType.SOURCE)) {
			for (const Q of PQ) {
				for (const edgeQ of Q.edges(IteratorType.SOURCE)) {
					// determine intersection or overlap type
					const { intersection, alpha, beta } = edgeP.intersectEdge(edgeQ)

					P1 = edgeP.one
					Q1 = edgeQ.one

					if (debug) {
						debug.intersections[intersection]++
					}

					switch (intersection) {
						// X-intersection
						case IntersectionType.X_INTERSECTION: {
							I = edgeP.one.p
								.mulScalar(1.0 - alpha)
								.add(edgeP.two.p.mulScalar(alpha))

							I_P = new Vertex(I, alpha)
							I_Q = new Vertex(I, beta)
							edgeP.insertVertex(I_P)
							edgeQ.insertVertex(I_Q)
							I_P.link(I_Q)
							break
						}

						// X-overlap
						case IntersectionType.X_OVERLAP: {
							I_Q = new Vertex(P1.p, beta)
							edgeQ.insertVertex(I_Q)
							P1.link(I_Q)

							I_P = new Vertex(Q1.p, alpha)
							edgeP.insertVertex(I_P)
							I_P.link(Q1)
							break
						}

						// T-intersection or T_overlap on Q
						case IntersectionType.T_INTERSECTION_Q:
						case IntersectionType.T_OVERLAP_Q: {
							I_Q = new Vertex(P1.p, beta)
							edgeQ.insertVertex(I_Q)
							P1.link(I_Q)
							break
						}

						// T-intersection or T-overlap on P
						case IntersectionType.T_INTERSECTION_P:
						case IntersectionType.T_OVERLAP_P: {
							I_P = new Vertex(Q1.p, alpha)
							edgeP.insertVertex(I_P)
							I_P.link(Q1)
							break
						}

						// V-intersection or V-overlap
						case IntersectionType.V_INTERSECTION:
						case IntersectionType.V_OVERLAP: {
							P1.link(Q1)
							break
						}
					}
				}
			}
		}
	}
}
