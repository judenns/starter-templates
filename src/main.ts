import './css/index.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
	app.innerHTML = `
		<h1>Hello Vite!</h1>
		<p>Edit <code>src/main.ts</code> to get started.</p>
	`;
}
