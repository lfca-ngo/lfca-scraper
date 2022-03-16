const TITLE_AND_PREFIX_REPLACEMENTS = [
  {
    match: 'Dr. ',
    replace: '',
  },
  {
    match: 'Dr.-Ing. ',
    replace: '',
  },
  {
    match: 'Prof. ',
    replace: '',
  },
  {
    match: 'h. ',
    replace: '',
  },
  {
    match: 'med. ',
    replace: '',
  },
  {
    match: 'forest ',
    replace: '',
  },
  {
    match: 'c. ',
    replace: '',
  },
  {
    match: 'habil. ',
    replace: '',
  },

  {
    match: 'Graf ',
    replace: '',
  },
  {
    match: ' von ',
    replace: ' ',
  },
  {
    match: ' Freiherr ',
    replace: ' ',
  },
  {
    match: ' de ',
    replace: ' ',
  },
  {
    match: ' dos ',
    replace: ' ',
  },
]

export function removeTitlesPrefixesFromName(name: string): string {
  let res = name
  for (const item of TITLE_AND_PREFIX_REPLACEMENTS) {
    res = res.replace(item.match, item.replace)
  }

  return res
}
