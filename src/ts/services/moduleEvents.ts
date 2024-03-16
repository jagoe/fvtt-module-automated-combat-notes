import { MODULE_EVENT, MODULE_ID } from '../constants'

export class ModuleEvents {
  private static MODULE_SOCKET_EVENT = `module.${MODULE_ID}`

  public emit(type: MODULE_EVENT, data?: any) {
    const g = game as Game

    g.socket?.emit(ModuleEvents.MODULE_SOCKET_EVENT, { type, data })
  }

  public on(type: MODULE_EVENT, callback: (data: any) => void) {
    const g = game as Game

    g.socket?.on(ModuleEvents.MODULE_SOCKET_EVENT, ({ type: eventType, data }: { type: string; data: any }) => {
      if (eventType === type) {
        callback(data)
      }
    })
  }
}
