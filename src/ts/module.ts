// Do not remove this import. If you do Vite will think your styles are dead
// code and not include them in the build output.
import "../styles/style.scss";
import AcnOverview from "./apps/overview";
import { moduleId } from "./constants";
import { ACN } from "./types";

let module: ACN;

Hooks.once("init", () => {
  console.log(`Initializing ${moduleId}`);

  module = (game as Game).modules.get(moduleId) as ACN;
  module.overview = new AcnOverview();
});

Hooks.on("renderCombatTracker", (_: Application, html: JQuery) => {
  const button = $(
    `<a class="combat-button" aria-label="Open Combat Notes Overview" role="button" data-tooltip="ACN.overview.open.label">
      <i class="fa-regular fa-note-sticky" />
    </button>`
  );
  button.on("click", () => {
    module.overview.render(true);
  });
  html.find(".combat-tracker-header > nav").append(button);
});
