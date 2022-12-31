import {
	testFiles,
	getPolygonsFromString,
	getStringFromFile,
	getStringFromPolygons,
} from './helpers'

describe('Helpers', () => {
	test('getStringFromFile -> getPolygonsFromString -> getStringFromPolygons', () => {
		const input = getStringFromFile('Fig8-P.poly')
		const P = getPolygonsFromString(input)
		const output = getStringFromPolygons(P)
		expect(output).toBe(input)
	})
})

describe('Intersections', () => {
	it('creates Figure 8', () => {
		testFiles('Fig8-P.poly', 'Fig8-Q.poly', 'Fig8-clip.poly', false)
	})

	it('creates Figure 14', () => {
		testFiles('Fig14-P.poly', 'Fig14-Q.poly', 'Fig14-clip.poly', false)
	})

	it('creates Figure 15', () => {
		testFiles('Fig15-P.poly', 'Fig15-Q.poly', 'Fig15-clip.poly', false)
	})

	it('creates Figure 16', () => {
		testFiles('Fig16-P.poly', 'Fig16-Q.poly', 'Fig16-clip.poly', false)
	})

	it('creates Figure 17', () => {
		testFiles('Fig17-P.poly', 'Fig17-Q.poly', 'Fig17-clip.poly', false)
	})

	it('creates Figure 18', () => {
		testFiles('Fig18-P.poly', 'Fig18-Q.poly', 'Fig18-clip.poly', false)
	})

	it('creates Figure 19', () => {
		testFiles('Fig19-P.poly', 'Fig19-Q.poly', 'Fig19-clip.poly', false)
	})
})

describe('Unions', () => {
	it('creates Figure 8', () => {
		testFiles('Fig8-P.poly', 'Fig8-Q.poly', 'Fig8-clip-u.poly', true)
	})

	it('creates Figure 14', () => {
		testFiles('Fig14-P.poly', 'Fig14-Q.poly', 'Fig14-clip-u.poly', true)
	})

	it('creates Figure 15', () => {
		testFiles('Fig15-P.poly', 'Fig15-Q.poly', 'Fig15-clip-u.poly', true)
	})

	it('creates Figure 16', () => {
		testFiles('Fig16-P.poly', 'Fig16-Q.poly', 'Fig16-clip-u.poly', true)
	})

	it('creates Figure 17', () => {
		testFiles('Fig17-P.poly', 'Fig17-Q.poly', 'Fig17-clip-u.poly', true)
	})
})
