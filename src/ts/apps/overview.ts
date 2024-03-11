import { moduleId } from '../constants'

export default class Overview extends Application {
    private imageUrl? = ''

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
            imageUrl: this.imageUrl,
        }
    }

    override activateListeners(html: JQuery<HTMLElement>): void {
        super.activateListeners(html)
    }
}
