import axios from 'axios'
import { XMLParser } from 'fast-xml-parser'

import { waitRandom } from '../utils'
import { ALL_MEPS_XML_URL, COUNTRY_ICON_URL, LOCALES } from './config'
import { MEP } from './scrape-meps'

interface LocalizedCountryLabel {
  [locale: string]: string
}

interface CountryProps {
  countryCode: string
  iconUrl: string
  label: LocalizedCountryLabel
}

export async function createLocalizedCountries(
  mepsById: Record<string, MEP>
): Promise<CountryProps[]> {
  console.info('\nCreating localized countries...')
  console.info(`${LOCALES.length} localizations configured`)

  const allCountriesMap = Object.keys(mepsById).reduce(
    (countriesMap, mepId) => {
      const mep = mepsById[mepId]
      const countryCode = mep.countryCode

      if (!countriesMap[countryCode]) {
        countriesMap[countryCode] = {
          countryCode,
          iconUrl: COUNTRY_ICON_URL.replace(
            '{{countryCode}}',
            countryCode.toLowerCase()
          ),
          label: {},
        }
      }

      return countriesMap
    },
    {} as Record<string, CountryProps>
  )

  let allCountries = Object.keys(allCountriesMap).map(
    (countryCode) => allCountriesMap[countryCode]
  )

  // Fetch the MEPs list in all locales and create a mapping for countryCode and localized countryName
  for (const [i, locale] of LOCALES.entries()) {
    try {
      const localizedAllMEPsResp = await axios.get(
        ALL_MEPS_XML_URL.replace('{{locale}}', locale),
        {
          headers: {
            Accept: 'application/xml',
          },
        }
      )

      // Parse XML to JSON
      const xmlParser = new XMLParser()
      const localizedAllMEPs = xmlParser.parse(localizedAllMEPsResp.data).meps
        .mep

      // Go through ALL countries and add the localized label
      allCountries = allCountries.map((country) => {
        const mepIdWithCountryCode = Object.keys(mepsById).find((mepId) => {
          const mep = mepsById[mepId]
          return mep.countryCode === country.countryCode
        })

        // Finde the first MEP with the country
        const mepWithMatchingCountry = localizedAllMEPs.find((mep) => {
          return mep.id.toString() === mepIdWithCountryCode
        })

        if (!mepWithMatchingCountry) {
          console.error(
            `\nCould not find an MEP entry for countryCode ${country.countryCode}`
          )
          return country
        } else {
          return {
            ...country,
            label: {
              ...country.label,
              [locale]: mepWithMatchingCountry.country,
            },
          }
        }
      })
    } catch (e) {
      console.error(`\nFailed to get localizations for locale ${locale}`)
    }

    // Wait to avoid beeing blocked
    await waitRandom(2)

    process.stdout.write(`\r${i + 1} of ${LOCALES.length} locales processed`)
  }

  console.info('\nCreating localized countries ✔')

  return allCountries
}
