export enum Frequency {
  Always = 'always',
  Once = 'once',
  OnceNth = 'once-nth',
  EveryNth = 'every-nth',
  Never = 'never',
}

export const FREQUENCY_OPTIONS = {
  [Frequency.Always]: 'ACN.frequencies.always',
  [Frequency.Once]: 'ACN.frequencies.once',
  [Frequency.OnceNth]: 'ACN.frequencies.onceNth',
  [Frequency.EveryNth]: 'ACN.frequencies.everyNth',
  [Frequency.Never]: 'ACN.frequencies.never',
}
