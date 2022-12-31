import { toPrecision } from './utils'

export class Point {
	x: number
	y: number

	constructor(x: number, y: number) {
		this.x = toPrecision(x)
		this.y = toPrecision(y)
	}

	add(point: Point) {
		return new Point(this.x + point.x, this.y + point.y)
	}

	sub(point: Point) {
		return new Point(this.x - point.x, this.y - point.y)
	}

	mulScalar(scalar: number) {
		return new Point(this.x * scalar, this.y * scalar)
	}

	dot(point: Point) {
		return this.x * point.x + this.y * point.y
	}

	A(Q: Point, R: Point) {
		return (Q.x - this.x) * (R.y - this.y) - (Q.y - this.y) * (R.x - this.x)
	}

	static From(point: Point) {
		return new Point(point.x, point.y)
	}
}
