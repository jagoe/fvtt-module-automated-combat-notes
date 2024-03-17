export enum Frequency {
  Always = 'always',
  Once = 'once',
  OnceAfterN = 'once-after-n',
  EveryNth = 'every-nth',
  Never = 'never',
}

export const FREQUENCY_OPTIONS = {
  [Frequency.Always]: 'ACN.frequencies.always',
  [Frequency.Once]: 'ACN.frequencies.once',
  [Frequency.OnceAfterN]: 'ACN.frequencies.onceAfterN',
  [Frequency.EveryNth]: 'ACN.frequencies.everyNth',
  [Frequency.Never]: 'ACN.frequencies.never',
}
