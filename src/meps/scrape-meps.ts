import axios from 'axios'
import cheerio from 'cheerio'
import { XMLParser } from 'fast-xml-parser'

import { waitRandom } from '../utils'
import {
  ALL_MEPS_XML_SRC,
  MEP_DETAIL_PAGE_BASE_URL,
  MEP_PHOTO_BASE_URL,
} from './config'
import countries from './input/countries.json'
import { parseEmailHref } from './utils'

interface EnrichedMEP {
  badges: string[]
  country: string
  countryCode: string
  email: string
  fullName: string
  id: string
  imageUrl: string
  nationalPoliticalGroup: string
  politicalGroup: string
}

export async function scrapeMEPs(): Promise<EnrichedMEP[]> {
  // Fetch all MEPs as XML
  const allMEPsResp = await axios.get(ALL_MEPS_XML_SRC, {
    headers: {
      Accept: 'application/xml',
    },
  })

  // Parse XML to JSON
  const xmlParser = new XMLParser()
  const allMEPs = xmlParser.parse(allMEPsResp.data).meps.mep
  console.info('\nScraping MEPs...')
  console.info(`${allMEPs.length} MEPs found`)

  // Fetch details for each MEP
  const enrichedMEPs: EnrichedMEP[] = []
  for (const [i, mep] of allMEPs.entries()) {
    const mepDetailsHTML = (
      await axios.get(`${MEP_DETAIL_PAGE_BASE_URL}/${mep.id}`)
    ).data

    const $MEP = cheerio.load(mepDetailsHTML)

    const email = parseEmailHref($MEP('.link_email').attr('href') || '')
    if (!email) {
      console.error(
        `\nCould not scrape email for ${mep.fullName} (ID: ${mep.id})`
      )
    }

    const imageUrl = `${MEP_PHOTO_BASE_URL}/${
      $MEP('.erpl_image-frame > span > img').attr('src') || ''
    }`
    if (!imageUrl) {
      console.error(
        `\nCould not scrape imageUrl for ${mep.fullName} (ID: ${mep.id})`
      )
    }

    const badges: string[] = []
    $MEP('.badges').each((i, el) => {
      const badgeId = $MEP(el).find('.erpl_badge').text()
      badges.push(badgeId)
    })

    const countryCode = countries[mep.country]
    if (!countryCode) {
      console.error(`\nCould not find countryCode for ${mep.country}`)
    }

    enrichedMEPs.push({
      badges,
      country: mep.country || '',
      countryCode,
      email,
      fullName: mep.fullName || '',
      id: mep.id || '',
      imageUrl,
      nationalPoliticalGroup: mep.nationalPoliticalGroup || '',
      politicalGroup: mep.politicalGroup || '',
    })

    process.stdout.write(`\r${i + 1} of ${allMEPs.length} MEPs scraped`)

    // Wait to avoid beeing blocked
    await waitRandom(2)
  }

  console.info('\nScraping MEPs ✔')

  return enrichedMEPs
}
