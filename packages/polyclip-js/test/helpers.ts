import fs from 'fs'
import { clipPolygons } from '../src'
import { Point } from '../src/Point'
import { Polygon } from '../src/Polygon'
import { IteratorType } from '../src/types'

/**
 * Get the test data as a string from a file.
 *
 * @param name The name of the file in the ./test/data folder.
 *
 * @returns The file contents as a string.
 */
export function getStringFromFile(name: string) {
	let data = fs.readFileSync(`./test/data/${name}`, 'utf8')
	data = data.replace(/\r\n/g, '\n')
	return data
}

/**
 * Convert the test data string into a list of polygons.
 *
 * @param data The test data string.
 *
 * @returns An array of polygons from the test data.
 */
export function getPolygonsFromString(data: string) {
	const result: Polygon[] = []

	data
		.trim()
		.split(';')
		.forEach((polygon) => {
			const P = new Polygon()

			polygon
				.trim()
				.split(',')
				.forEach((pair) => {
					const points = pair
						.trim()
						.split(' ')
						.map((point) => parseFloat(point))

					if (Number.isFinite(points[0]) && Number.isFinite(points[1])) {
						P.newVertex(new Point(points[0], points[1]), true)
					}
				})

			if (P.root !== null) {
				result.push(P)
			}
		})

	return result
}

/**
 * Convert the list of polygons into a string.
 *
 * @param polygons The list of polygons.
 *
 * @returns The polygons as a string.
 */
export function getStringFromPolygons(polygons: Polygon[]) {
	let result = ``

	for (const polygon of polygons) {
		const points: string[] = []
		for (const vertex of polygon.vertices(IteratorType.ALL)) {
			points.push(`${vertex.p.x} ${vertex.p.y}`)
		}
		result += points.join(',\n') + ';\n'
	}

	return result
}

/**
 * Test the clip function with the given files. Runs the clip
 * function with the contents of the first and second files,
 * expecting the output to match the third file.
 *
 * @param first The first polygon file.
 * @param second The second polygon file.
 * @param output The expected output file.
 *
 */
export function testFiles(
	first: string,
	second: string,
	output: string,
	union: boolean
) {
	const P = getPolygonsFromString(getStringFromFile(first))
	const Q = getPolygonsFromString(getStringFromFile(second))
	const result = clipPolygons(P, Q, union)
	const expected = getStringFromFile(output)
	const out = getStringFromPolygons(result)
	expect(out).toBe(expected)
}
