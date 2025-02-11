/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal (path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername (str) {
  // eslint-disable-next-line camelcase
  const valid_map = ['admin', 'editor']
  return valid_map.indexOf(str.trim()) >= 0
}

export function validUrlIsLoginOrReg (str) {
  return str.trim() === '/user/login' || str.trim() === '/user/register'
}
