import chaiWaitFor, { bindWaitFor } from 'chai-wait-for'

chai.use(chaiWaitFor)

export const expectThatEventually = bindWaitFor({
  timeout: 500,
  retryInterval: 50,
})
