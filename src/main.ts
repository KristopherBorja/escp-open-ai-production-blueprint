import "./styles.css";
import { ModelClient } from "./analysis/model-client";
import ModelWorker from "./analysis/model-worker?worker";
import { createApp } from "./ui/app";

const root = document.querySelector<HTMLDivElement>("#app");

if (root === null) {
  throw new Error("Application root #app is missing.");
}

const worker = new ModelWorker();
const model = new ModelClient(worker);
const destroy = createApp(root, { engine: model, model });

window.addEventListener(
  "beforeunload",
  () => {
    destroy();
    model.dispose();
  },
  { once: true },
);
