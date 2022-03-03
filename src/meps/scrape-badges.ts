import axios from 'axios'
import cheerio from 'cheerio'

import { waitRandom } from '../utils'
import {
  BADGE_LOCALIZATIONS,
  COMMITTEE_DETAIL_PAGE_URL,
  DELEGATION_DETAIL_PAGE_URL,
} from './config'

interface LocalizedBadgeMap {
  [badgeId: string]: {
    [locale: string]: string
  }
}

export async function scrapeBadges(): Promise<LocalizedBadgeMap> {
  console.info('\nScraping badges...')
  console.info(`${BADGE_LOCALIZATIONS.length} localizations configured`)

  const localizedBadgeMap: LocalizedBadgeMap = {}

  for (const [i, locale] of BADGE_LOCALIZATIONS.entries()) {
    // Scrape Delegations
    const delegationDetailsHTML = (
      await axios.get(DELEGATION_DETAIL_PAGE_URL.replace('{{locale}}', locale))
    ).data

    const $DELEGATION = cheerio.load(delegationDetailsHTML)

    const delegationElements = $DELEGATION('.erpl_delegations-list-item')

    delegationElements.each((i, el) => {
      const badgeLink = $DELEGATION(el).find('a')
      const localizedBadgeName = badgeLink.text()
      const badgeId = badgeLink.attr('href')?.split('/').pop()?.toUpperCase()
      if (badgeId) {
        if (!localizedBadgeMap[badgeId]) {
          localizedBadgeMap[badgeId] = {}
        }
        localizedBadgeMap[badgeId][locale] = localizedBadgeName
      } else {
        console.error(
          `\nCould not scrape ${locale} localized delegation for ${badgeLink.attr(
            'href'
          )}`
        )
      }
    })

    // Scrape Committees
    const committeeDetailsHTML = (
      await axios.get(COMMITTEE_DETAIL_PAGE_URL.replace('{{locale}}', locale))
    ).data

    const $COMMITTEE = cheerio.load(committeeDetailsHTML)

    const committeeElements = $COMMITTEE('.erpl_badge-committee')

    committeeElements.each((i, el) => {
      const localizedBadgeName = el.attribs['title']
      const badgeId = el.attribs['href']?.split('/').pop()?.toUpperCase()
      if (badgeId) {
        if (!localizedBadgeMap[badgeId]) {
          localizedBadgeMap[badgeId] = {}
        }
        localizedBadgeMap[badgeId][locale] = localizedBadgeName
      } else {
        console.error(
          `\nCould not scrape ${locale} localized committee for ${el.attribs['href']}`
        )
      }
    })

    process.stdout.write(
      `\r${i + 1} of ${BADGE_LOCALIZATIONS.length} locales scraped`
    )

    // Wait to avoid beeing blocked
    await waitRandom(2)
  }

  console.info('\nScraping badges ✔')

  return localizedBadgeMap
}
