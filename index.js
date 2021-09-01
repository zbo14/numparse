'use strict'

const parseNum = str => +str.replace(/,/g, '')

/**
 * @namespace
 * 
 * @desc   Parse numbers from a string using optional regex pattern,
 *         custom map and filter functions.
 * 
 * @param  {String}   str
 * @param  {Object}   [opts = {}]
 * @param  {String}   [opts.pattern]
 * @param  {Function} [opts.map]
 * @param  {Function} [opts.filter]
 *
 * @return {Object[]}
 */
const numParse = (str, opts = {}) => {
  const hasProp = Object.hasOwnProperty.bind(opts)

  let customPattern = false
  let pattern = PATTERN

  if (hasProp('pattern')) {
    pattern = generatePattern(opts.pattern)
    customPattern = true
  }

  if (hasProp('map') && typeof opts.map !== 'function') {
    throw new Error('Expected map to be a function')
  }

  if (hasProp('filter') && typeof opts.filter !== 'function') {
    throw new Error('Expected filter to be a function')
  }

  const regex = new RegExp(pattern, 'g')
  const matches = customPattern || str.match(regex)
  const getMatch = () => customPattern ? regex.exec(str) : matches.shift()

  const results = []

  let match

  while ((match = getMatch())) {
    let values = customPattern
      ? match.slice(1).map(parseNum)
      : [parseNum(match)]

    if (hasProp('map')) {
      values = opts.map(values)

      if (!Array.isArray(values) && values?.constructor?.name !== 'Object') {
        throw new Error('Expected map to return array or object literal')
      }
    }

    if (hasProp('filter') && !opts.filter(values)) continue

    results.push({ 
      match: customPattern ? match[0] : match, 
      values 
    })
  }

  return results
}

/**
 * Regex pattern for matching numbers.
 *
 * @type {String}
 */
const PATTERN = '\\b(?:\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.\\d+)?\\b'

/**
 * Regex for matching numbers.
 *
 * @type {RegExp}
 */
const REGEX = new RegExp(PATTERN, 'g')

/**
 * @func
 * @desc   Generate a regex pattern from a custom numparse pattern.
 * 
 * @param  {String} pattern
 * 
 * @return {String}
 */
const generatePattern = pattern => {
  if (typeof pattern !== 'string') {
    throw new Error('Expected pattern to be a string')
  }

  const newPattern = pattern.replace(/<NUM>/g, `(${PATTERN})`)

  if (pattern === newPattern) {
    throw new Error('Expected pattern to contain <NUM>')
  }

  return newPattern
}

numParse.PATTERN = PATTERN
numParse.REGEX = REGEX
numParse.generatePattern = generatePattern

module.exports = numParse