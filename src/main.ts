import "./styles.css";
import { ModelClient } from "./analysis/model-client";
import ModelWorker from "./analysis/model-worker?worker";
import { createApp } from "./ui/app";
import {
  renderUnsupportedBrowser,
  supportsBrowserInference,
} from "./ui/browser-support";

const root = document.querySelector<HTMLDivElement>("#app");

if (root === null) {
  throw new Error("Application root #app is missing.");
}

if (!supportsBrowserInference(globalThis)) {
  renderUnsupportedBrowser(root);
} else {
  try {
    const model = new ModelClient(() => new ModelWorker());
    const destroy = createApp(root, { engine: model, model });

    window.addEventListener(
      "beforeunload",
      () => {
        destroy();
        model.dispose();
      },
      { once: true },
    );
  } catch {
    renderUnsupportedBrowser(root);
  }
}
