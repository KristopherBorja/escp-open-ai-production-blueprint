interface BrowserCapabilityScope {
  readonly Worker?: unknown;
  readonly WebAssembly?: unknown;
}

export function supportsBrowserInference(
  scope: BrowserCapabilityScope,
): boolean {
  return (
    typeof scope.Worker === "function" &&
    (typeof scope.WebAssembly === "object" ||
      typeof scope.WebAssembly === "function")
  );
}

export function renderUnsupportedBrowser(root: HTMLElement): void {
  const main = document.createElement("main");
  main.className = "unsupported-shell";
  main.setAttribute("role", "alert");

  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "Local inference unavailable";

  const heading = document.createElement("h1");
  heading.textContent = "This browser cannot run the local model";

  const explanation = document.createElement("p");
  explanation.textContent =
    "Use a current browser with JavaScript modules, Web Workers and WebAssembly enabled. The application cannot analyse feedback safely without those local capabilities.";

  const architecture = document.createElement("a");
  architecture.className = "button button--secondary";
  architecture.href =
    "https://github.com/KristopherBorja/escp-open-ai-production-blueprint/blob/main/docs/architecture.md";
  architecture.target = "_blank";
  architecture.rel = "noreferrer";
  architecture.textContent = "Read the deployment architecture";

  main.append(eyebrow, heading, explanation, architecture);
  root.replaceChildren(main);
}
