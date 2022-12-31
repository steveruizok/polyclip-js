import { cleanupResult } from './steps/4_cleanupResult'
import { computeIntersections } from './steps/1_computeIntersections'
import { createResult } from './steps/3_createResult'
import { labelIntersections } from './steps/2_labelIntersections'
import { Polygon } from './Polygon'
import { IntersectionType, IteratorType, PolygonClipDebugging } from './types'
import { Point } from './Point'

export function clipXY(
	PP: { x: number; y: number }[][],
	QQ: { x: number; y: number }[][],
	union = false,
	debug = false
) {
	const pp: Polygon[] = []
	PP.forEach((polygon) => {
		const P = new Polygon()
		polygon.forEach((pair) => P.newVertex(new Point(pair.x, pair.y)), true)
		if (P.root !== null) pp.push(P)
	})

	const qq: Polygon[] = []
	QQ.forEach((polygon) => {
		const Q = new Polygon()
		polygon.forEach((pair) => Q.newVertex(new Point(pair.x, pair.y)), true)
		if (Q.root !== null) qq.push(Q)
	})

	const out: { x: number; y: number }[][] = []
	const result = clipPolygons(pp, qq, union, debug)
	result.forEach((polygon) => {
		const points: { x: number; y: number }[] = []
		for (const vertex of polygon.vertices(IteratorType.ALL)) {
			points.push({ x: vertex.p.x, y: vertex.p.y })
		}
		out.push(points)
	})

	return out
}

export function clipArray(
	PP: number[][][],
	QQ: number[][][],
	union = false,
	debug = false
) {
	const pp: Polygon[] = []
	PP.forEach((polygon) => {
		const P = new Polygon()
		polygon.forEach((pair) => P.newVertex(new Point(pair[0], pair[1])), true)
		if (P.root !== null) pp.push(P)
	})

	const qq: Polygon[] = []
	QQ.forEach((polygon) => {
		const Q = new Polygon()
		polygon.forEach((pair) => Q.newVertex(new Point(pair[0], pair[1])), true)
		if (Q.root !== null) qq.push(Q)
	})

	const out: number[][][] = []
	const result = clipPolygons(pp, qq, union, debug)
	result.forEach((polygon) => {
		const points: number[][] = []
		for (const vertex of polygon.vertices(IteratorType.ALL)) {
			points.push([vertex.p.x, vertex.p.y])
		}
		out.push(points)
	})

	return out
}

/**
 * Clip two polygons and log out debugging information.
 * @param PP The first set of polygons.
 * @param QQ The second set of polygons.
 * @param union Whether to compute the union or the intersection.
 * @param debug Whether to log out debugging information.
 */
export function clipPolygons(
	PP: Polygon[],
	QQ: Polygon[],
	union = false,
	debug = false
): Polygon[] {
	if (debug) {
		return clipWithDebugging(PP, QQ, union)
	}

	const RR: Polygon[] = []

	computeIntersections(PP, QQ)
	labelIntersections(PP, QQ, RR, union)
	createResult(PP, RR, union)
	cleanupResult(RR)

	return RR
}

/**
 * Clip two polygons and log out debugging information.
 * @param PP The first set of polygons.
 * @param QQ The second set of polygons.
 * @param union Whether to compute the union or the intersection.
 */
export function clipWithDebugging(PP: Polygon[], QQ: Polygon[], union = false) {
	const debug: PolygonClipDebugging = {
		intersections: {
			[IntersectionType.NO_INTERSECTION]: 0,
			[IntersectionType.X_INTERSECTION]: 0,
			[IntersectionType.T_INTERSECTION_Q]: 0,
			[IntersectionType.T_INTERSECTION_P]: 0,
			[IntersectionType.V_INTERSECTION]: 0,
			[IntersectionType.X_OVERLAP]: 0,
			[IntersectionType.T_OVERLAP_Q]: 0,
			[IntersectionType.T_OVERLAP_P]: 0,
			[IntersectionType.V_OVERLAP]: 0,
		},
		crossingIntersectionVertices: 0,
		bouncingIntersectionVertices: 0,
		delayedBouncings: 0,
		delayedCrossings: 0,
		interiorComponents: 0,
		identicalComponents: 0,
		bouncingVertexPairsSplit: 0,
		verticesRemoved: 0,
		components: 0,
		vertices: 0,
	}

	const RR: Polygon[] = []
	computeIntersections(PP, QQ, debug)
	labelIntersections(PP, QQ, RR, union, debug)
	createResult(PP, RR, union)
	cleanupResult(RR, debug)
	logDebugging(debug)
	return RR
}

function logDebugging(debug: PolygonClipDebugging) {
	const { intersections: i } = debug

	const nonDegenerateIntersections = i[IntersectionType.X_INTERSECTION]
	const degenerateIntersections =
		i[IntersectionType.X_INTERSECTION] +
		i[IntersectionType.T_INTERSECTION_Q] +
		i[IntersectionType.T_INTERSECTION_P] +
		i[IntersectionType.V_INTERSECTION] +
		i[IntersectionType.X_OVERLAP] +
		i[IntersectionType.T_OVERLAP_Q] +
		i[IntersectionType.T_OVERLAP_P]
	const XOverlaps = i[IntersectionType.X_OVERLAP]
	const TIntersections =
		i[IntersectionType.T_INTERSECTION_Q] + i[IntersectionType.T_INTERSECTION_P]
	const VIntersections = i[IntersectionType.V_INTERSECTION]
	const TOverlaps =
		i[IntersectionType.T_OVERLAP_Q] + i[IntersectionType.T_OVERLAP_P]
	const VOverlaps = i[IntersectionType.V_OVERLAP]
	const verticesAddedToP =
		i[IntersectionType.X_INTERSECTION] +
		i[IntersectionType.X_OVERLAP] +
		i[IntersectionType.T_OVERLAP_P] +
		i[IntersectionType.T_INTERSECTION_P]
	const verticesAddedToQ =
		i[IntersectionType.X_INTERSECTION] +
		i[IntersectionType.X_OVERLAP] +
		i[IntersectionType.T_OVERLAP_Q] +
		i[IntersectionType.T_INTERSECTION_Q]

	console.log(`
	Computing intersections...

	... ${nonDegenerateIntersections}	non-degenerate and ${degenerateIntersections} degenerate intersections found.
		(${TIntersections} T-intersections, ${VIntersections} V-intersections, 
		 ${XOverlaps} X-overlaps, ${TOverlaps} T-overlaps, ${VOverlaps} V-overlaps)
	... ${verticesAddedToP} vertices added to P
	... ${verticesAddedToQ} vertices added to Q

	Labelling intersections...

	... ${debug.crossingIntersectionVertices} crossing and ${debug.bouncingIntersectionVertices} bouncing intersection vertices
	... ${debug.delayedCrossings} delayed crossings and ${debug.delayedBouncings} delayed bouncings
	... ${debug.interiorComponents} interior and ${debug.identicalComponents} identical components added to result
	... ${debug.bouncingVertexPairsSplit} bouncing vertex pairs split
	
	Creating result...

	Post-processing...

	... ${debug.verticesRemoved} vertices removed

	R has ${debug.components} component with ${debug.vertices} vertices.
		`)
}
