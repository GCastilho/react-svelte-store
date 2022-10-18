import { useState, useEffect } from 'react'
import { get_store_value } from './lib'
import type { Subscriber, Writable, Invalidator } from './lib'

/** Custom writable store implementation */
export class Store<T> implements Writable<T> {
	private value: T
	private subscriptions: Set<Subscriber<T>>

	constructor(initialValue: T) {
		this.value = initialValue
		this.subscriptions = new Set()
	}

	public subscribe(callback: Subscriber<T>, invalidate?: Invalidator<T>) {
		this.subscriptions.add(callback)
		callback(this.value)
		return () => {
			if (invalidate) invalidate(this.value)
			this.subscriptions.delete(callback)
		}
	}

	public set(value: T) {
		this.value = value
		this.subscriptions.forEach(callback => callback(value))
	}

	public update(updater: (value: T) => T) {
		const newValue = updater(this.value)
		this.set(newValue)
	}
}

/**
 * Custom React hook that takes a Writable store as a parameter and return a
 * [state, setState] pair with the same call signature as useState
 * @param store Writable store
 * @returns Custom hook with the store value and a updater
 */
export function useStore<T>(store: Writable<T>): [T, Subscriber<T>] {
	const [state, setState] = useState(get_store_value(store))

	useEffect(() => {
		const unsubscribe = store.subscribe(newValue => setState(newValue))
		return unsubscribe
	}, [store])

	const set = (newValue: T) => store.set(newValue)

	return [
		state,
		set,
	]
}

function getStore<T>(initialValue: T): Store<T> {
	return new Store(initialValue)
}

type CreateStore<T, W extends Writable<T> = Store<T>> = {
	store: W;
	useStore: () => [T, Subscriber<T>];
}

/**
 * Creates a new store with a related useStore hook
 * @param initialValue Initial store value
 * @param writable Function that returns a store-like object that implements the
 * Writable interface
 * @returns A store and a useStore hook for that store
 */
export function createStore<T, W extends Writable<T> = Store<T>>(
	initialValue: T,
	writable?: (v: T) => W,
): CreateStore<T, W>

/**
 * Creates a new store with a related useStore hook
 *
 * Since there is no initial value, undefined will be mixed with
 * the store's T type
 *
 * @returns A store and a useStore hook for that store
 */
export function createStore<T = undefined>(): CreateStore<T|undefined>

export function createStore<T, W extends Writable<T> = Store<T>>(
	initialValue?: T,
	writable: (v: T) => W = getStore as unknown as (v: T) => W,
): CreateStore<T, W> {
	const store = writable(initialValue as T)

	return {
		store,
		useStore: () => useStore(store),
	}
}
