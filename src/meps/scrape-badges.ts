import axios from 'axios'
import { load } from 'cheerio'

import { waitRandom } from '../utils'
import {
  COMMITTEE_DETAIL_PAGE_URL,
  DELEGATION_DETAIL_PAGE_URL,
  LOCALES,
} from './config'

interface LocalizedBadgeMap {
  [badgeId: string]: {
    [locale: string]: string
  }
}

export async function scrapeBadges(): Promise<LocalizedBadgeMap> {
  const localizedBadgeMap: LocalizedBadgeMap = {}

  console.info('\nScraping badges...')
  console.info(`${LOCALES.length} localizations configured`)

  for (const [i, locale] of LOCALES.entries()) {
    // Scrape Delegations
    try {
      const delegationDetailsHTML = (
        await axios.get(
          DELEGATION_DETAIL_PAGE_URL.replace('{{locale}}', locale)
        )
      ).data

      const $DELEGATION = load(delegationDetailsHTML)

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
    } catch (e) {
      console.error(`\nFailed to scrape delegations for locale ${locale}`)
    }

    // Scrape Committees
    try {
      const committeeDetailsHTML = (
        await axios.get(COMMITTEE_DETAIL_PAGE_URL.replace('{{locale}}', locale))
      ).data

      const $COMMITTEE = load(committeeDetailsHTML)

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

      // Wait to avoid beeing blocked
      await waitRandom(2)
    } catch (e) {
      console.error(`\nFailed to scrape committees for locale ${locale}`)
    }

    process.stdout.write(`\r${i + 1} of ${LOCALES.length} locales scraped`)
  }

  console.info('\nScraping badges ✔')

  return localizedBadgeMap
}
