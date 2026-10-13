import { useState } from 'react';

export default function App() {
	const [count, setCount] = useState(0);

	return (
		<main>
			<h1>React + Vite</h1>
			<p>Counter: {count}</p>
			<button type="button" onClick={() => setCount(count + 1)}>
				Increment
			</button>
		</main>
	);
}
