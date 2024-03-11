# FoundryVTT Module Combat Journal

A Foundry VTT module that allows GMs and players to open journal entries automatically once combat starts.

## Todo

* Features
  * Drag journal into list
    * Implement drop handler
    * Save data & fire event
    * Load data on open & on event
  * Delete from list
  * Automatically open listed journals on combat start
  * Add entry modes:
    * For nth combat: Active in nth combat, remove entry afterwards
    * Once: Active exactly once, remove entry afterwards
    * Always
  * Add entry event:
    * Combat start
    * Combat end
    * Turn of actor: Select actor by dragging
