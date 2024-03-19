Hooks.on('quenchReady', (quench) => {
  quench.registerBatch(
    'ACN.module',
    (context) => {
      const { describe, it, assert } = context

      describe('Passing suite', () => {
        it('should pass', () => {
          assert.ok(true)
        })
      })
    },
    {
      displayName: 'Module',
    },
  )
})
