import { PRECISION } from './constants'
import { EntryExitLabel } from './types'

export function insert<T>(arr: T[][], index: number, item: T) {
	if (arr[index] === undefined) {
		arr[index] = [item]
	} else {
		arr[index].push(item)
	}
}

export function xor(a: boolean, b: boolean) {
	return (a && !b) || (!a && b)
}

export function toggleStatus(status: EntryExitLabel) {
	if (status === EntryExitLabel.ENTRY) {
		return EntryExitLabel.EXIT
	} else if (status === EntryExitLabel.EXIT) {
		return EntryExitLabel.ENTRY
	}

	return status
}

export function toPrecision(x: number) {
	return Math.round(x * PRECISION) / PRECISION
}
