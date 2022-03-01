import { parseEmailHref } from '../parse-email-href'

describe('parseEmailHref', () => {
  it('should parse a spam protected email href', () => {
    const INPUT = 'mailto:ue[dot]aporue.lraporue[at]retset.acfl'
    const OUTPUT = 'lfca.tester@europarl.europa.eu'
    expect(parseEmailHref(INPUT)).toEqual(OUTPUT)
  })
})
