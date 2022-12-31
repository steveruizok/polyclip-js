// types of intersections between edges in the first phase
export enum IntersectionType {
	NO_INTERSECTION,
	X_INTERSECTION,
	T_INTERSECTION_Q,
	T_INTERSECTION_P,
	V_INTERSECTION,
	X_OVERLAP,
	T_OVERLAP_Q,
	T_OVERLAP_P,
	V_OVERLAP,
}

// for the classification of intersection vertices in the second phase
export enum IntersectionLabel {
	NONE,
	CROSSING,
	BOUNCING,
	LEFT_ON,
	RIGHT_ON,
	ON_ON,
	ON_LEFT,
	ON_RIGHT,
	DELAYED_CROSSING,
	DELAYED_BOUNCING,
}

// for marking intersection vertices as "entry" or "exit"
export enum EntryExitLabel {
	EXIT,
	ENTRY,
	NEITHER,
}

// types of relative positions of Q w.r.t. (P1,P2,P3)
export enum RelativePositionType {
	LEFT,
	RIGHT,
	IS_P_m,
	IS_P_p,
}

// types passed into custom vertex / edge iterators
export enum IteratorType {
	SOURCE,
	INTERSECTION,
	CROSSING_INTERSECTION,
	ALL,
}

// An object used to record debugging information
export type PolygonClipDebugging = {
	intersections: Record<IntersectionType, number>
	delayedCrossings: number
	delayedBouncings: number
	interiorComponents: number
	identicalComponents: number
	crossingIntersectionVertices: number
	bouncingIntersectionVertices: number
	bouncingVertexPairsSplit: number
	verticesRemoved: number
	components: number
	vertices: number
}
