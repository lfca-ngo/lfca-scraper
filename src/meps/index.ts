import fs from 'fs'
import path from 'path'

import {
  BADGES_FILE_NAME,
  COUNTRIES_FILE_NAME,
  MEPS_FILE_NAME,
  SKIP_EXISTING_MEPS,
} from './config'
import { scrapeLocalizedBadges } from './scrape-localized-badges'
import { scrapeLocalizedCountries } from './scrape-localized-countries'
import { MEP, scrapeMEPs } from './scrape-meps'

export async function run() {
  // Scrape MEPs
  const mepsFilePath = path.resolve(__dirname, `./output/${MEPS_FILE_NAME}`)

  let existingMEPData: Record<string, MEP> = {}
  if (SKIP_EXISTING_MEPS) {
    try {
      existingMEPData = JSON.parse(fs.readFileSync(mepsFilePath, 'utf8'))
    } catch (e) {
      console.info('No existing MEPs present')
    }
  }

  const newMEPData = await scrapeMEPs(existingMEPData)
  fs.writeFileSync(mepsFilePath, JSON.stringify(newMEPData, null, 2))

  // Create countries map
  const countriesFilePath = path.resolve(
    __dirname,
    `./output/${COUNTRIES_FILE_NAME}`
  )

  const countries = await scrapeLocalizedCountries(newMEPData)
  fs.writeFileSync(countriesFilePath, JSON.stringify(countries, null, 2))

  // Scrape badges
  const badges = await scrapeLocalizedBadges()
  fs.writeFileSync(
    path.resolve(__dirname, `./output/${BADGES_FILE_NAME}`),
    JSON.stringify(badges, null, 2)
  )
}
