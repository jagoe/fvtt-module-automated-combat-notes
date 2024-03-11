import { moduleId } from '../constants'
import {CombatNote} from '../models/note'

export default class Overview extends Application {
    // TODO: When loading, set name automatically
    private notes: CombatNote[] = [{id: 'h7BN5ZNBTKvdzaS5', name: 'Test'}]

    override get title(): string {
        return (game as Game).i18n.localize('ACN.overview.title')
    }

    static override get defaultOptions(): ApplicationOptions {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: 'acn-overview',
            template: `modules/${moduleId}/templates/overview.hbs`,
            width: 720,
            height: 720,
        }) as ApplicationOptions
    }

    override getData() {
        return {
            notes: [...this.notes],
        }
    }

    override activateListeners(html: JQuery<HTMLElement>): void {
        super.activateListeners(html)
    }
}
