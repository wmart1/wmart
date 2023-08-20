export const validateEmail = value => {
  const pattern =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  const isValid = pattern.test(String(value).toLowerCase())
  return isValid
}

export function onlySpaces(str) {
  return /^\s*$/.test(str)
}

export function zipCode(str) {
  return  /^(?:[A-Z0-9]+([- ]?[A-Z0-9]+)*)?$/.test(str)
}
