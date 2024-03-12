# FoundryVTT Module Combat Journal

A Foundry VTT module that allows GMs and players to open journal entries automatically once combat starts.

## Todo

* Fix issue that doesn't correctly update data when calling `this.render()` after updating data
* Fix issue of when to load data into memory (maybe never!)
* Fix issue of delete deleting all with same uuid
  * Either prevent adding twice OR
  * Provide unique list identifier on top of uuid
* Automatically open listed journals on combat start
* Add entry modes:
  * For nth combat: Active in nth combat, remove entry afterwards
  * Once: Active exactly once, remove entry afterwards
  * Always
* Add entry event:
  * Combat start
  * Combat end
  * Turn of actor: Select actor by dragging
