# react-svelte-store

Use Svelte stores, or any Svelte-like stores, in React, with a hook-like syntax

## Basic usage

```ts
// stores/counter.ts
import { createStore } from 'react-svelte-store'

export const { useStore, store } = createStore(0)

setTimeout(() => {
	// You can update the store directly, even inside components
	store.set(10)
}, 1000)
```

```tsx
// App.tsx
import { useStore } from 'react-svelte-store'
import { store } from './stores/counter'

function App() {
	// You can pass the store to 'useStore' exported from the lib
	const [counter, setCounter] = useStore(store)

	return (
		<div className="App">
			<button onClick={() => setCounter(counter + 1)}>Increment</button>
			<Display />
			<button onClick={() => setCounter(counter - 1)}>Decrement</button>
		</div>
	)
}
```

```tsx
// Display.tsx
import { useStore } from './stores/counter'

export default function Display() {
	// You can also use the 'useStore' returned from the createStore directly
	const [counter, setCounter] = useStore();
	return (
		<h2>Counter: {counter}</h2>
	)
}
```

Both uses point to the same store.

## Using a custom store

Any object that implements the store contract will work seamlessly, we even use our custom store implementation rather than the Svelte one. That implementation is exported as a `class` for ease of extendability

```ts
import { Store } from 'react-svelte-store'

class CustomStore extends Store<number> {
	public increment() {
		this.update(v => v + 1)
	}

	public decrement() {
		this.update(v => v - 1)
	}

	public reset() {
		this.set(0)
	}
}

function getStore<T extends number>(initialValue: T){
	return new CustomStore(initialValue)
}

const { store, useStore } = createStore(0, getStore)

// Works as expected
store.increment()
```

## Creating a store without an initial value

As in React's useState, if a value is not informed on initialization, the
Store's value will be `T | undefined`

```typescript
const {
	store,   // 'string | undefined'
	useStore // accepts string and undefined as parameters
} = createStore<string>()
```
