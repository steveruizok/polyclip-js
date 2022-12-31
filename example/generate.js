import fs from 'fs'
import { clipXY } from '../packages/polyclip-js/dist/index.js'

const allPolygons = {}

function createPolygonFromFile(name) {
	const data = fs.readFileSync(
		`../packages/polyclip-js/test/data/${name}.poly`,
		'utf8'
	)

	let result = []

	data
		.trim()
		.split(';')
		.forEach((polygon) => {
			const P = []

			polygon
				.trim()
				.split(',')
				.forEach((pair) => {
					const points = pair
						.trim()
						.split(' ')
						.map((point) => parseFloat(point))

					if (Number.isFinite(points[0]) && Number.isFinite(points[1])) {
						P.push({ x: points[0], y: points[1] })
					}
				})

			if (P.length > 0) {
				result.push(P)
			}
		})

	allPolygons[name] = result
}

// make data directory in src
if (!fs.existsSync('./src/data')) {
	fs.mkdirSync('./src/data')
}

createPolygonFromFile('Fig8-P')
createPolygonFromFile('Fig8-Q')
createPolygonFromFile('Fig8-clip')
createPolygonFromFile('Fig8-clip-u')

createPolygonFromFile('Fig14-P')
createPolygonFromFile('Fig14-Q')
createPolygonFromFile('Fig14-clip')
createPolygonFromFile('Fig14-clip-u')

createPolygonFromFile('Fig15-P')
createPolygonFromFile('Fig15-Q')
createPolygonFromFile('Fig15-clip')
createPolygonFromFile('Fig15-clip-u')

createPolygonFromFile('Fig16-P')
createPolygonFromFile('Fig16-Q')
createPolygonFromFile('Fig16-clip')
createPolygonFromFile('Fig16-clip-u')

createPolygonFromFile('Fig17-P')
createPolygonFromFile('Fig17-Q')
createPolygonFromFile('Fig17-clip')
createPolygonFromFile('Fig17-clip-u')

createPolygonFromFile('Fig18-P')
createPolygonFromFile('Fig18-Q')
createPolygonFromFile('Fig18-clip')

createPolygonFromFile('Fig19-P')
createPolygonFromFile('Fig19-Q')
createPolygonFromFile('Fig19-clip')

createPolygonFromFile('Fig20-E1')
createPolygonFromFile('Fig20-E2')
createPolygonFromFile('Fig20-E3')
createPolygonFromFile('Fig20-E4')
createPolygonFromFile('Fig20-E5')

createPolygonFromFile('Fig20-M1')
createPolygonFromFile('Fig20-M2')
createPolygonFromFile('Fig20-M3')

// write to json file
fs.writeFileSync(`./src/data/polys.json`, JSON.stringify(allPolygons, null, 2))
