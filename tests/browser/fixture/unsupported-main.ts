import "../../../src/styles.css";
import { renderUnsupportedBrowser } from "../../../src/ui/browser-support";

const root = document.querySelector<HTMLDivElement>("#app");
if (root === null) {
  throw new Error("Fixture root is missing.");
}

renderUnsupportedBrowser(root);
