const SPECIAL_CHAR_MAP = {
  '[at]': '@',
  '[dot]': '.',
  'mailto:': '',
}

// Taken from https://stackoverflow.com/a/1144788
export function parseEmailHref(spamProtectedHref: string) {
  // replace special characters
  for (const key in SPECIAL_CHAR_MAP) {
    spamProtectedHref = spamProtectedHref.replace(
      new RegExp(escapeRegExp(key), 'g'),
      SPECIAL_CHAR_MAP[key]
    )
  }

  return spamProtectedHref.split('').reverse().join('')
}

function escapeRegExp(string: string) {
  return string.replace(/[.^$*+?()[{|\\]/g, '\\$&')
}
