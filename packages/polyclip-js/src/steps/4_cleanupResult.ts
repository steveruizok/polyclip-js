import { EPSILON } from '../constants'
import { Point } from '../Point'
import { Polygon } from '../Polygon'
import { IteratorType, PolygonClipDebugging } from '../types'

export function cleanupResult(RR: Polygon[], debug?: PolygonClipDebugging) {
	let i = 0
	// for all crossing vertices
	for (const R of RR) {
		while (
			R.root !== null &&
			Math.abs(R.root.prev.p.A(R.root.p, R.root.next.p)) < EPSILON
		) {
			if (i > 1000) throw new Error('cleanupResult: infinite loop')
			i++
			R.removeVertex(R.root)
			if (debug) debug.verticesRemoved++
		}

		if (R.root !== null) {
			for (const V of R.vertices(IteratorType.ALL)) {
				if (Math.abs(V.prev.p.A(V.p, V.next.p)) < EPSILON) {
					R.removeVertex(V)
					if (debug) debug.verticesRemoved++
				}
			}
		}
	}

	if (debug) {
		debug.components = RR.length
		debug.vertices = RR.reduce((acc, r) => {
			if (r.root === null) return acc
			return acc + Array.from(r.vertices(IteratorType.ALL)).length
		}, 0)
	}
}
