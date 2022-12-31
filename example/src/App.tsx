import './App.css'
import { clipXY } from 'polyclip-js'
import polys from './data/polys.json'

function App() {
	return (
		<div className="App">
			<h1>Examples</h1>
			<p>
				Figures from{' '}
				<a href="https://www.sciencedirect.com/science/article/pii/S259014861930007X">
					Clipping simple polygons with degenerate intersections
				</a>
				.
			</p>
			<Figure title="Fig 8" a="Fig8-P" b="Fig8-Q" union={false} scale={15} />
			<Figure title="Fig 14" a="Fig14-P" b="Fig14-Q" union={false} scale={15} />
			<Figure title="Fig 15" a="Fig15-P" b="Fig15-Q" union={false} scale={15} />
			<Figure title="Fig 16" a="Fig16-P" b="Fig16-Q" union={false} scale={15} />
			<Figure title="Fig 17" a="Fig17-P" b="Fig17-Q" union={false} scale={15} />
			<Figure title="Fig 18" a="Fig18-P" b="Fig18-Q" union={false} scale={15} />
			<Figure title="Fig 19" a="Fig19-P" b="Fig19-Q" union={false} scale={1} />
			<Figure
				title="Fig 20a"
				a="Fig20-E1"
				b="Fig20-M1"
				union={false}
				scale={1000}
			/>
			<Figure
				title="Fig 20b"
				a="Fig20-E2"
				b="Fig20-M2"
				union={false}
				scale={1000}
			/>
			<Figure
				title="Fig 20b"
				a="Fig20-E1"
				b="Fig20-M2"
				union={false}
				scale={1000}
			/>
		</div>
	)
}

export default App

function Figure({
	title,
	a,
	b,
	union,
	scale,
}: {
	title: string
	a: keyof typeof polys
	b: keyof typeof polys
	union: boolean
	scale: number
}) {
	const PP = polys[a]
	const QQ = polys[b]
	const RR = clipXY(PP, QQ, union)

	const { minX, minY, maxX, maxY } = minmax(PP, QQ)

	console.log(minmax(PP, QQ), `${minX},${minY},${maxX - minX},${maxY - minY}`)

	return (
		<div>
			<h2>{title}</h2>
			<svg
				width={(maxX - minX) * scale}
				height={(maxY - minY) * scale}
				viewBox={`${minX},${minY},${maxX - minX},${maxY - minY}`}
			>
				<g>
					{RR.map((p, i) => (
						<polygon
							key={i}
							points={p.map(({ x, y }) => `${x},${y}`).join(' ')}
							fill="grey"
						/>
					))}
				</g>
				<g>
					{PP.map((p, i) => (
						<polygon
							key={i}
							points={p.map(({ x, y }) => `${x},${y}`).join(' ')}
							fill="none"
							strokeWidth={2 / scale}
							stroke="blue"
							opacity={0.5}
						/>
					))}
				</g>
				<g>
					{QQ.map((p, i) => (
						<polygon
							key={i}
							points={p.map(({ x, y }) => `${x},${y}`).join(' ')}
							fill="none"
							strokeWidth={2 / scale}
							stroke="red"
							opacity={0.5}
						/>
					))}
				</g>
			</svg>
		</div>
	)
}

function minmax(
	a: { x: number; y: number }[][],
	b: { x: number; y: number }[][]
) {
	let minX = Infinity
	let minY = Infinity
	let maxX = -Infinity
	let maxY = -Infinity

	for (let i = 0; i < a.length; i++) {
		for (let j = 0; j < a[i].length; j++) {
			minX = Math.min(minX, a[i][j].x)
			minY = Math.min(minY, a[i][j].y)
			maxX = Math.max(maxX, a[i][j].x)
			maxY = Math.max(maxY, a[i][j].y)
		}
	}

	for (let i = 0; i < b.length; i++) {
		for (let j = 0; j < b[i].length; j++) {
			minX = Math.min(minX, b[i][j].x)
			minY = Math.min(minY, b[i][j].y)
			maxX = Math.max(maxX, b[i][j].x)
			maxY = Math.max(maxY, b[i][j].y)
		}
	}

	return { minX, minY, maxX, maxY }
}
