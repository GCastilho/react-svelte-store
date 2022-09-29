/** Callback to inform of a value updates. */
export type Subscriber<T> = (value: T) => void;

/** Unsubscribes from value updates. */
export type Unsubscriber = () => void;

/** Cleanup logic callback. */
export type Updater<T> = (value: T) => T;

/** Callback to update a value. */
export type Invalidator<T> = (value?: T) => void;

/** Readable interface for subscribing. */
export interface Readable<T> {
	/**
	 * Subscribe on value changes.
	 * @param callback subscription callback
	 * @param invalidate cleanup callback
	 */
	subscribe(this: void, callback: Subscriber<T>, invalidate?: Invalidator<T>): Unsubscriber;
}

/** Writable interface for both updating and subscribing. */
export interface Writable<T> extends Readable<T> {
	/**
	 * Set value and inform subscribers.
	 * @param value to set
	 */
	set(this: void, value: T): void;
	/**
	 * Update value using callback and inform subscribers.
	 * @param updater callback
	 */
	update(this: void, updater: Updater<T>): void;
}

export function get_store_value<T>(store: Readable<T>) {
	let value: T = null as T
	store.subscribe(v => value = v)()
	return value
}
