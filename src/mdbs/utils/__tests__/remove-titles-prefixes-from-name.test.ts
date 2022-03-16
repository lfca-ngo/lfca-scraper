import { removeTitlesPrefixesFromName } from '../remove-titles-prefixes-from-name'

describe('removeTitlesPrefixesFromName', () => {
  it('should remove titles and prefixes from a name', () => {
    // Dr.
    expect(removeTitlesPrefixesFromName('Dr. Wolfgang Schäuble')).toEqual(
      'Wolfgang Schäuble'
    )

    // Prof.
    expect(removeTitlesPrefixesFromName('Prof. Dr. Lars Castellucci')).toEqual(
      'Lars Castellucci'
    )

    // h. c.
    expect(
      removeTitlesPrefixesFromName('Dr. h. c. Thomas Sattelberger')
    ).toEqual('Thomas Sattelberger')

    // habil. & Dr.-Ing.
    expect(
      removeTitlesPrefixesFromName('Prof. Dr.-Ing. habil. Michael Kaufmann')
    ).toEqual('Michael Kaufmann')

    // med.
    expect(removeTitlesPrefixesFromName('Dr. med. Paula Piechotta')).toEqual(
      'Paula Piechotta'
    )

    // Graf
    expect(removeTitlesPrefixesFromName('Alexander Graf Lambsdorff')).toEqual(
      'Alexander Lambsdorff'
    )

    // Freiherr
    expect(
      removeTitlesPrefixesFromName('Christian Freiherr von Stetten')
    ).toEqual('Christian Stetten')

    // von
    expect(removeTitlesPrefixesFromName('Erik von Malottki')).toEqual(
      'Erik Malottki'
    )

    // forest
    expect(
      removeTitlesPrefixesFromName('Dr. forest Christoph Hoffmann')
    ).toEqual('Christoph Hoffmann')

    // de
    expect(removeTitlesPrefixesFromName('Christophde de Vries')).toEqual(
      'Christophde Vries'
    )

    // dos
    expect(
      removeTitlesPrefixesFromName('Catarina dos Sandos Firnhaber')
    ).toEqual('Catarina Sandos Firnhaber')
  })
})
