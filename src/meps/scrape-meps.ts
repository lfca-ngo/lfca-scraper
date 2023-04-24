import axios from 'axios'
import { load } from 'cheerio'
import { XMLParser } from 'fast-xml-parser'

import { capitalizeFirstLetter, waitRandom } from '../utils'
import {
  ALL_MEPS_XML_URL,
  MEP_DETAIL_PAGE_BASE_URL,
  MEP_PHOTO_BASE_URL,
} from './config'
import countryCodesByEnName from './input/country-codes-by-en-name.json'
import shortPoliticalGroupByName from './input/short-political-group-by-name.json'
import { parseEmailHref } from './utils'

export interface MEP {
  badges: string[]
  countryCode: string
  email: string
  facebook?: string
  fullName: string
  id: string
  imageUrl: string
  instagram?: string
  nationalPoliticalGroup: string
  phone?: string
  politicalGroup: string
  twitter?: string
  website?: string
}

export async function scrapeMEPs(
  mepMap: Record<string, MEP>
): Promise<Record<string, MEP>> {
  console.info('\nScraping MEPs...')

  // Fetch all MEPs as XML
  const allMEPsResp = await axios.get(
    ALL_MEPS_XML_URL.replace('{{locale}}', 'en'),
    {
      headers: {
        Accept: 'application/xml',
      },
    }
  )

  // Parse XML to JSON
  const xmlParser = new XMLParser()
  const allMEPs = xmlParser.parse(allMEPsResp.data).meps.mep
  console.info(`${allMEPs.length} MEPs found`)

  // Fetch details for each MEP
  for (const [i, mep] of allMEPs.entries()) {
    if (!mepMap[mep.id]) {
      try {
        const mepDetailsHTML = (
          await axios.get(`${MEP_DETAIL_PAGE_BASE_URL}/${mep.id}`)
        ).data

        const $MEP = load(mepDetailsHTML)

        const email = parseEmailHref($MEP('.link_email').attr('href') || '')
        if (!email) {
          console.error(
            `\nCould not scrape email for ${mep.fullName} (ID: ${mep.id})`
          )
        }
        const facebook = $MEP('.link_fb').attr('href') || undefined
        const instagram = $MEP('.link_instagram').attr('href') || undefined
        const twitter = $MEP('.link_twitt').attr('href') || undefined
        const website = $MEP('.link_website').attr('href') || undefined

        const phone = $MEP('.erpl_contact-card-list a .t-x')
          .first()
          .text()
          .trim()

        const imageUrl =
          $MEP('.erpl_image-frame > span > img').attr('src') || ''

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

        const countryCode = countryCodesByEnName[mep.country]
        if (!countryCode) {
          console.error(`\nCould not find countryCode for ${mep.country}`)
        }

        mepMap[mep.id] = {
          badges,
          countryCode,
          email,
          facebook,
          fullName: capitalizeFirstLetter(mep.fullName),
          id: `MEP_${mep.id}`,
          imageUrl,
          instagram,
          nationalPoliticalGroup:
            shortPoliticalGroupByName[mep.nationalPoliticalGroup] ||
            mep.nationalPoliticalGroup,
          phone,
          politicalGroup:
            shortPoliticalGroupByName[mep.politicalGroup] || mep.politicalGroup,
          twitter,
          website,
        }
      } catch (e) {
        console.error(`\nFailed to scrape MEP ${mep.fullName} (ID: ${mep.id})`)
      }

      // Wait to avoid beeing blocked
      await waitRandom(2)
    }

    process.stdout.write(`\r${i + 1} of ${allMEPs.length} MEPs scraped`)
  }

  console.info('\nScraping MEPs ✔')

  return mepMap
}
