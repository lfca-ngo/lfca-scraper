import axios from 'axios'
import cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

import { ALL_MEPS_XML_SRC, MEP_DETAIL_PAGE_BASE_URL } from './config'
import { parseEmailHref } from './utils'

interface EnrichedMEP {
  badges: string[]
  country: string
  email: string
  fullName: string
  id: string
  nationalPoliticalGroup: string
  politicalGroup: string
}

export async function run() {
  // Fetch all MEPs as XML
  const allMEPs = (await axios.get(ALL_MEPS_XML_SRC)).data.list

  console.info(`${allMEPs.length} MEPs found`)

  const enrichedMEPs: EnrichedMEP[] = []
  const badgesMap = {}
  // Fetch details for each MEP
  for (const [i, mep] of allMEPs.entries()) {
    const detailsHTML = (
      await axios.get(`${MEP_DETAIL_PAGE_BASE_URL}/${mep.persId}`)
    ).data
    const $ = cheerio.load(detailsHTML)
    const email = parseEmailHref($('.link_email').attr('href') || '')

    const badges: string[] = []
    $('.badges').each((i, el) => {
      const badgeId = $(el).find('.erpl_badge').text()
      const badgeName = $(el).find('.erpl_committee').text()
      badgesMap[badgeId] = badgeName
      badges.push(badgeId)
    })

    enrichedMEPs.push({
      badges,
      country: mep.countryLabel || '',
      email,
      fullName: mep.fullName || '',
      id: mep.persId || '',
      nationalPoliticalGroup: mep.nationalPoliticalGroupLabel || '',
      politicalGroup: mep.politicalGroupLabel || '',
    })

    process.stdout.write(`\r${i + 1} of ${allMEPs.length} MEPs scraped`)
  }

  // Save enrichedMEPs and badgesMap to JSON files
  fs.writeFileSync(
    path.resolve(__dirname, './output/meps-list.json'),
    JSON.stringify(enrichedMEPs, null, 2)
  )
  fs.writeFileSync(
    path.resolve(__dirname, './output/badges-map.json'),
    JSON.stringify(badgesMap, null, 2)
  )
}
