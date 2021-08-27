/**
 * 
 * @param {String} str
 */

const titleCase = (str) => {
  let splitStr = str.toLowerCase().split(" ");
  for (let i = 0; i < splitStr.length; i++) {
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(" ");
};

/**
 * @param {String} str
 */

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = { titleCase, capitalize };
