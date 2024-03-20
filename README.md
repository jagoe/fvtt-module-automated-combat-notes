# FoundryVTT Module Combat Journal

A Foundry VTT module that allows GMs and players to specify journal entries that get opened automatically once combat starts.

## Running tests

You can run tests in Foundry by following these steps:

1. Install the Foundry module [Quench](https://github.com/Ethaks/FVTT-Quench)
2. Run `npm run build:tests` or `npm run watch:tests`
3. Copy or link the contents of the `dist` folder into a module folder named `fvtt-module-automated-combat-notes`
4. Run Foundry, start up a world
5. Sign in as a user without any existing combat notes
6. Activate the modules `Automated Combat Notes` and `Quench`
7. Click on the button labeled "QUENCH" below the chat input
8. Click on the button labeled "Run" in the Quench window
