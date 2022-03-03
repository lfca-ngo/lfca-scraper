import fs from 'fs'
import path from 'path'

import { scrapeBadges } from './scrape-badges'
import { scrapeMEPs } from './scrape-meps'

export async function run() {
  const meps = await scrapeMEPs()
  fs.writeFileSync(
    path.resolve(__dirname, './output/meps-list.json'),
    JSON.stringify(meps, null, 2)
  )

  const badges = await scrapeBadges()
  fs.writeFileSync(
    path.resolve(__dirname, './output/badges-map.json'),
    JSON.stringify(badges, null, 2)
  )
}
