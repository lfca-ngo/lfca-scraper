import { capitalizeFirstLetter } from '../capitalize-first-letter'

describe('capitalizeFirstLetter', () => {
  it('should capitalize the first letter of a single lowercase word', () => {
    const INPUT = 'somelowercase'
    const OUTPUT = 'Somelowercase'
    expect(capitalizeFirstLetter(INPUT)).toEqual(OUTPUT)
  })

  it('should capitalize the first letter of a single camelcase word', () => {
    const INPUT = 'someCamelCase'
    const OUTPUT = 'Somecamelcase'
    expect(capitalizeFirstLetter(INPUT)).toEqual(OUTPUT)
  })

  it('should capitalize the first letter of a single uppercase word', () => {
    const INPUT = 'SOMEUPPERCASE'
    const OUTPUT = 'Someuppercase'
    expect(capitalizeFirstLetter(INPUT)).toEqual(OUTPUT)
  })

  it('should capitalize the first letter of every word in a sentence', () => {
    const INPUT = 'a sentence with lowercase, camelCase and UPPERCASE words.'
    const OUTPUT = 'A Sentence With Lowercase, Camelcase And Uppercase Words.'
    expect(capitalizeFirstLetter(INPUT)).toEqual(OUTPUT)
  })
})
