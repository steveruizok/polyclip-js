## Introduction

This is a TypeScript implementation of "polyclip" by the authors of
[Clipping simple polygons with degenerate intersections](https://www.sciencedirect.com/science/article/pii/S259014861930007X): Erich L. Foster, Kai Hormann, and Romeo Traian Popa.

Polyclip was a c++ implementation of their extension of the
Greiner-Hormann clipping algorithm, which **computes the
intersection (or union) of two non-self-intersecting complex
polygons**, with possibly multiple and nested components, even in
case of degenerate intersections (vertex on edge, overlapping
edges, etc.).

## Installation

```bash
npm install polyclip-js

# or

yarn add polyclip-js
```

## Usage

The library exports two functions: `clipXY` and `clipArray`. They both produce the same output but take different input types.

### `clipXY`

Accepts two arrays of polygons, where each polygon is an array of points, and each point is an object with `x` and `y` properties. Returns a new polygon in the same format that describes the intersection of the two input polygons.

```ts
import { clipXY } from 'polyclip-js'

clipXY(
	[
		[
			{ x: 0, y: 0 },
			{ x: 10, y: 0 },
			{ x: 10, y: 10 },
			{ x: 0, y: 10 },
		],
	],
	[
		[
			{ x: 5, y: 5 },
			{ x: 15, y: 5 },
			{ x: 15, y: 15 },
			{ x: 5, y: 15 },
		],
	]
)

// returns
// [
//   [
//     { x: 5, y: 5 },
//     { x: 10, y: 5 },
//     { x: 10, y: 10 },
//     { x: 5, y: 10 },
//   ],
// ]
```

### `clipArray`

Accepts two arrays of polygons, where each polygon is an array of points, and each point is an object with `x` and `y` properties. Returns a new polygon in the same format that describes the intersection of the two input polygons.

```ts
import { clipArray } from 'polyclip-js'

clipArray(
	[
		[
			[0, 0],
			[10, 0],
			[10, 10],
			[0, 10],
		],
	],
	[
		[
			[5, 5],
			[15, 5],
			[15, 15],
			[5, 15],
		],
	]
)

// returns
// [
//   [
//     [5, 5],
//     [10, 5],
//     [10, 0],
//     [5, 0],
//   ],
// ]
```

## Test File Format

The library's tests rely on the original `.poly` files from the
paper's supplementary material.

The "\*.poly" file must have the following structure. Each line
contains two numbers (int or double), the x and the y coordinates
of a vertex, followed by a "," or a ";", where the "," is used to
separate the vertices of a polygon component and ";" marks the end
of the component. For example, the following 7 lines:

0 0,
1 0,
0 1;
-0.5 -0.5,
1.5 -0.5,
1.5 1.5,
-0.5 1.5;

describe a polygon with 2 components, a right triangle inside a
square. All vertices in one file must be different from each
other.

## Admitted Input

The following features are allowed in the input polygons:

- the vertex order in each component can be CW or CCW
- components can be nested (AKA holes)
- the two input polygons are allowed to have degenerate
  intersections (vertex on edge, overlapping edges, etc.)
  with each other

The following features are not allowed in the input polygons:

- the polygons should not self-intersect (including degenerate
  self-intersections like vertex on vertex, vertex on edge),
  although the result will be correct as long as the self-
  intersection does not lie on the other polygon

## Robustness

The implementation is based on floating point numbers with
double precision and therefore not robust. The EPSILON parameter
(set to 0.000000001) is used as a tolerance for equality checks,
and two numbers are considered equal if their difference is less
than EPSILON.

## License

This library is offered under the MIT license. The original was offered under the [CC BY 4.0 license](https://creativecommons.org/licenses/by/4.0/).
