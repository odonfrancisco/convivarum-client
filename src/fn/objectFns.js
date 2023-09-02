import bn from 'bignumber.js'
import _ from 'lodash'

bn.config({ EXPONENTIAL_AT: 1e9 })

const TO_STRING_BASE = 10

// Different types of evaluations depending on the computation needed or obj field
export const evaluate = {
  // Compute types
  div: (dividend, divisor, isPercentage, numDecimals = 0) =>
    bn(dividend)
      .dividedBy(isNaN(divisor) ? 0 : divisor)
      .multipliedBy(isPercentage ? 100 : 1)
      .toFixed(isPercentage ? 4 : numDecimals),
  multiply: (f, s, numDecimals = 0) => bn(f).multipliedBy(s).toFixed(numDecimals),
  add: (f, s, numDecimals = 0) =>
    bn(f)
      .plus(bn(s))
      [numDecimals && !isNaN(numDecimals) ? 'toFixed' : 'toString'](
        (!isNaN(numDecimals) && numDecimals) || TO_STRING_BASE,
      ),
  subtract: (f, s, numDecimals = 0) =>
    bn(f)
      .minus(bn(s))
      [numDecimals && !isNaN(numDecimals) ? 'toFixed' : 'toString'](
        (!isNaN(numDecimals) && numDecimals) || TO_STRING_BASE,
      ),

  // Field types
  min: (prev, newVal) => (bn(prev).comparedTo(bn(newVal)) === -1 ? prev : newVal),
  max: (prev, newVal) => (bn(prev).comparedTo(bn(newVal)) === 1 ? prev : newVal),
  acc: (prev, newVal) => newVal,
  avg: (oldValue = 0, newValue) => evaluate.div(evaluate.add(oldValue, newValue), 2),

  default: bn(0),
}

/**
 * Keeps the min or max number for a field within an object
 *
 * @param {object} obj The object to update
 * @param {string} path The path to udate within the object
 * @param {number} newValue The value to compare the prev value to
 * @param {string} end The extreme to keep. Either max or min
 */
const keepExtreme = (obj, path, newValue, end) => {
  if (end !== 'min' && end !== 'max') return

  const prev = _.get(obj, path)
  if (!prev) {
    _.set(obj, path, newValue)
    return obj
  }

  const toSave = evaluate[end](prev, newValue)
  _.set(obj, path, toSave)
  return obj
}

/**
 * This will sort the stats obj passed in descending order and keep only the top X amount
 *
 * @param {object} obj The TopStats object
 * @param {number} maxStats Number of stats to keep
 * @returns {object}
 */
export const condenseStats = (obj, maxStats) => {
  const ofObj = Object.values(obj).filter(_.isObject).length

  if (ofObj) {
    for (const [key, value] of Object.entries(obj)) {
      obj[key] = Object.values(value).length ? condenseStats(value, maxStats) : {}
    }

    return obj
  }

  const sorted = Object.entries(obj)
    .sort(([, v], [, v2]) => (_.isString(v) ? bn(v2).minus(bn(v)) : v2 - v))
    .slice(0, maxStats)

  return _.fromPairs(sorted)
}

/**
 * Checks the depth of an object
 * @param {*} obj
 * @param {*} depth Running depth count. Should not be passed on initial fn call
 * @returns {Number} Object depth
 */
export const checkDepth = (obj, depth = 0, checkArr) => {
  const fn = checkArr ? _.isArray : _.isObject
  if (fn(obj)) {
    const currentDepth = ++depth
    const depths = Object.values(obj).map(obj => checkDepth(obj, currentDepth, checkArr))
    return Math.max(...depths)
  }

  return depth
}

/**
 * This "spreads" object updates so as to not override extra within the mongo doc.
 * So rather than saving {extra:{foo:332,bar:'eth'}}, this fn spreads the updates into {'extra.foo':332 & 'extra.bar':'eth'}
 *
 * @param {object} obj Object with updates to push to mongodb
 * @param [string] currentKey Key to start updates at
 * @param [number] depthLimit Limits the depth until where objects are spreaded
 * @param [object] state Used internally by the function
 * @returns {object}
 */
export const spreadUpdates = (obj, currentKey = '', depthLimit, { depth = 0 } = {}) => {
  const updates = {}

  for (const [key, vals] of Object.entries(obj)) {
    const newKey = `${currentKey ? `${currentKey}.` : ''}${key}`

    const reachedEnd = depthLimit !== undefined ? depth <= depthLimit : false

    const updateObj =
      _.isPlainObject(vals) && !reachedEnd
        ? spreadUpdates(vals, newKey, depthLimit, { depth: depth + 1 })
        : { [newKey]: vals }

    for (const [key, val] of Object.entries(updateObj)) {
      updates[key] = val
    }
  }

  return updates
}

/**
 * This merges two objects together, adding appropriate fields together as necessary
 *
 * @param {object} acc Base obj to merge into
 * @param {object} cur New obj to merge into base obj
 * @returns
 */
export const combineObjects = (acc, cur, addAcc = false) =>
  _.mergeWith(acc, cur, (objVal, curVal, key) => {
    if (evaluate[key] && (key === 'acc' ? !addAcc : 1)) return evaluate[key](objVal, curVal)

    const [fn, def] = _.isObject(curVal) ? [combineObjects, {}] : [evaluate.add, evaluate.default]

    return fn(objVal || def, curVal, ...(fn === combineObjects ? [addAcc] : []))
  })

/**
 * This creates an obj from an array of elements to check for validity
 *
 * @param {array} arr Array of either strings or arrays to turn into a validObj
 * @param {string|object} val Either an obj or string to set the validity value to
 * @param {function} fn A function by which to modify the validity value (most useful when passing an object as val)
 * @returns Object
 */
export const arrReducer = (arr, val = 1, fn = v => v) => {
  const validityObj = {}
  if (!_.isArray(arr)) return validityObj

  const valIsObj = _.isObject(val)

  for (const elem of arr) {
    const elemIsArr = _.isArray(elem)
    const [fieldToSave, valToSave] =
      valIsObj && elemIsArr
        ? // If val is obj && elem is arr, then elem[0] is field to save & elem[1] is the field to get from val obj
          [elem[0], _.get(val, elem[1])]
        : valIsObj
        ? // If val is obj and elem is not arr, then elem is field to save as well as the field to get from val obj
          [elem, _.get(val, elem)]
        : // If val isn't an object and elem isn't an array
          [elemIsArr ? elem[0] : elem, val]

    validityObj[fieldToSave] = fn(valToSave)
  }

  return validityObj
}

/**
 *
 * @param  {...Object} objs Objects to merge together without mutating the original
 * @returns Object
 */
export const nonMutationalMerge = (...objs) => {
  const mergedObj = {}

  for (const obj of objs) {
    const paths = spreadUpdates(obj)

    for (const [path, val] of Object.entries(paths)) {
      if (_.isArray(val)) {
        for (const elem of val) mutUpdate.push(mergedObj, path, elem)
        continue
      }
      _.set(mergedObj, path, val)
    }
  }
  return mergedObj
}

const KEY_DOESNT_EXIST = '_NOT_^_FOUND__$(^&#*&'

export const mutUpdate = {
  add: (obj, path, inc, decimals) => {
    const prev = _.get(obj, path)
    if (!prev) {
      _.setWith(obj, path, inc, Object)
      return obj
    }

    const newVal = evaluate.add(prev, inc, decimals)
    _.set(obj, path, newVal)
    return obj
  },
  set: (obj, path, toSet) => {
    _.set(obj, path, toSet)
    return obj
  },
  setObj: (obj, path, toSet) => {
    _.setWith(obj, path, toSet, Object)
    return obj
  },
  setInitial: (obj, path, toSet) => {
    const exists = _.get(obj, path, KEY_DOESNT_EXIST) !== KEY_DOESNT_EXIST
    if (exists) return obj

    _.set(obj, path, toSet)
    return obj
  },
  delete: (obj, path) => {
    _.unset(obj, path)
    return obj
  },
  push: (obj, path, toPush) => {
    const arr = _.get(obj, path)
    if (!arr) {
      const firstArrIndexPath = _.isString(path) ? `${path}.0` : `${path.join('.')}.0`
      _.set(obj, firstArrIndexPath, toPush)
      return 0
    }

    // try {
    //   arr.push(toPush)
    // } catch (err) {
    //   console.log('wow')
    //   return
    // }

    return arr.push(toPush)
  },
  addToSet: (obj, path, toPush) => {
    const arr = _.get(obj, path)
    if (!arr) {
      const firstArrIndexPath = _.isString(path) ? `${path}.0` : `${path.join('.')}.0`
      _.set(obj, firstArrIndexPath, toPush)
      return obj
    }

    const exists = arr.find(elem => _.isEqual(elem, toPush))
    if (!exists) arr.push(toPush)

    return obj
  },
  max: (...props) => keepExtreme(...props, 'max'),
  min: (...props) => keepExtreme(...props, 'min'),
}

/**
 * Increments/initializes, sets, or keeps max/min value at a path within an obj. Mutates the object passed
 *
 * @param {object} obj The obj whose path value will increase
 * @param {array} updatesArr An Array of updates to make
 * @param {string} updatesArr[0][0] The path to update within obj
 * @param {string|number} updatesArr[0][1] The value by which to increment/modify
 * @param {string} updatesArr[0][2] The kind of modification to make (Calling mutUpdate[string])
 * @returns {null}
 */

export const mutUpdates = (obj, updatesArr) => {
  if (!_.isArray(updatesArr) || !_.isObject(obj)) return

  for (const update of updatesArr) {
    if (!_.isArray(update) || !update.length) continue

    const [path, value, fn = 'add'] = update
    if (!path || !mutUpdate[fn]) continue

    mutUpdate[fn](obj, path, value)
  }
}
