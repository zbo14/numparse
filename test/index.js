const assert = require('assert')
const numparse = require('..')

describe('numparse', () => {
  it('throws if pattern isn\'t string', () => {
    const str = '123 456,789 90.19 abc  100,00'
    
    try {
      numparse(str, { pattern: Symbol('\\d') })
      assert.fail('Should throw')
    } catch ({ message }) {
      assert.strictEqual(message, 'Expected pattern to be a string')
    }
  })

  it('throws if pattern doesn\'t contain <NUM>', () => {
    const str = '123 456,789 90.19 abc  100,00'
    
    try {
      numparse(str, { pattern: '\\d' })
      assert.fail('Should throw')
    } catch ({ message }) {
      assert.strictEqual(message, 'Expected pattern to contain <NUM>')
    }
  })

  it('throws if map isn\'t function', () => {
    const str = '123 456,789 90.19 abc  100,00'
    
    try {
      numparse(str, { map: [] })
      assert.fail('Should throw')
    } catch ({ message }) {
      assert.strictEqual(message, 'Expected map to be a function')
    }
  })

  it('throws if map doesn\'t return array or object literal', () => {
    const str = '123 456,789 90.19 abc  100,00'
    
    try {
      numparse(str, { map: () => null })
      assert.fail('Should throw')
    } catch ({ message }) {
      assert.strictEqual(message, 'Expected map to return array or object literal')
    }
  })

  it('throws if filter isn\'t function', () => {
    const str = '123 456,789 90.19 abc  100,00'
    
    try {
      numparse(str, { filter: {} })
      assert.fail('Should throw')
    } catch ({ message }) {
      assert.strictEqual(message, 'Expected filter to be a function')
    }
  })

  it('just parses numbers', () => {
    const str = '123 456,789 90.19 abc  100,00'
    const results = numparse(str)

    assert.deepStrictEqual(results, [
      { match: '123', values: [123] },
      { match: '456,789', values: [456789] },
      { match: '90.19', values: [90.19] },
      { match: '100', values: [100] },
      { match: '00', values: [0] }
    ])
  })

  it('parses numbers with custom pattern', () => {
    const str = 'foo: 123 bar:\t456,789 foo:90.19 abc  100,00'
    const results = numparse(str, {
      pattern: 'foo:\\s?<NUM>'
    })

    assert.deepStrictEqual(results, [
      { match: 'foo: 123', values: [123] },
      { match: 'foo:90.19', values: [90.19] }
    ])
  })

  it('parses numbers with custom pattern and filter function', () => {
    const str = 'foo: 123 foo:  456,786 foo:90.19 abc   10,000'
    const results = numparse(str, {
      filter: ([x]) => !(x % 3),
      pattern: 'foo:\\s*<NUM>'
    })

    assert.deepStrictEqual(results, [
      { match: 'foo: 123', values: [123] },
      { match: 'foo:  456,786', values: [456786] }
    ])
  })

  it('parses numbers with custom pattern, map and filter functions', () => {
    const str = 'foo: 123 foo:  456,786 foo:90.19 abc   10,000'
    const results = numparse(str, {
      map: ([foo]) => ({ foo }),
      filter: ({ foo }) => !(foo % 3),
      pattern: 'foo:\\s*<NUM>'
    })

    assert.deepStrictEqual(results, [
      { match: 'foo: 123', values: { foo: 123 } },
      { match: 'foo:  456,786', values: { foo: 456786 } }
    ])
  })

  it('returns numbers in range', () => {
    const str = '123 456,789 90.19 abc  100,00'

    const results = numparse(str, {
      filter: ([x]) => x > 91 && x < 456e3
    })

    assert.deepStrictEqual(results, [
      { match: '123', values: [123] },
      { match: '100', values: [100] }
    ])
  })

  it('parses multiple numbers with custom config', () => {
    const str = 'foo: 123 bar: 99,998 foo:  456,786 bar: 99,999 foo:90 abc   10,000'

    const results = numparse(str, {
      map: ([foo, bar]) => ({ foo, bar }),
      filter: ({ foo }) => !(foo % 2),
      pattern: 'foo:\\s*<NUM>\\s*bar:\\s*<NUM>'
    })

    assert.deepStrictEqual(results, [
      {
        match: 'foo:  456,786 bar: 99,999',
        values: { foo: 456786, bar: 99999 }
      }
    ])
  })
})
