import "./styles.css";

const root = document.querySelector<HTMLDivElement>("#app");

if (root === null) {
  throw new Error("Application root #app is missing.");
}

root.innerHTML = `
  <main>
    <p class="eyebrow">ESCP Open AI Production Blueprint</p>
    <h1>Responsible Feedback Analyser</h1>
    <p>Typed analysis core under construction.</p>
  </main>
`;
