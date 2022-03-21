import axios from 'axios'
import { load } from 'cheerio'

import { waitRandom } from '../utils'
import { BUNDESTAG_ALL_MDBS_JSON_PATH, BUNDESTAG_BASE_URL } from './config'

export interface MdB {
  constituency?: string
  constituencyZipCodes: string[]
  countryCode: string
  email: string
  facebook?: string
  fullName: string
  id: string
  imageCredits: string
  imageUrl: string
  instagram?: string
  linkedIn?: string
  nationalPoliticalGroup: string
  phone?: string
  twitter?: string
  website?: string
}

export async function scrapeMdBs(
  mdbMap: Record<string, MdB>
): Promise<Record<string, MdB>> {
  console.info('\nScraping MdBs...')

  // Fetch all MdBs
  const allMdBsResp = (
    await axios.get(`${BUNDESTAG_BASE_URL}${BUNDESTAG_ALL_MDBS_JSON_PATH}`, {
      headers: {
        Accept: 'application/json',
      },
    })
  ).data

  const allMdBPaths = Object.keys(allMdBsResp).reduce(
    (list, key) => {
      const item = allMdBsResp[key]

      // The JSON contains other data besides politicians as well so we check for the presence of a name
      if (item.name) {
        list.push({
          href: item.href,
          id: item.id,
          img: item.img,
          name: item.name,
          party: item.party,
        })
      }

      return list
    },
    [] as {
      href: string
      id: string
      img: string
      name: string
      party: string
    }[]
  )

  console.info(`${allMdBPaths.length} MdBs found`)

  // Fetch details for each MEP
  for (const [i, mdb] of allMdBPaths.entries()) {
    if (!mdbMap[mdb.id]) {
      try {
        const mdbDetailsHTML = (
          await axios.get(`${BUNDESTAG_BASE_URL}${mdb.href}`)
        ).data

        const $MdB = load(mdbDetailsHTML)

        const constituency =
          $MdB('#bt-landesliste-collapse .bt-link-intern').attr('title') ||
          undefined

        const facebook = $MdB('a[title="Facebook"]').attr('href') || undefined
        const instagram = $MdB('a[title="Instagram"]').attr('href') || undefined
        const linkedIn = $MdB('a[title="LinkedIn"]').attr('href') || undefined
        const twitter = $MdB('a[title="Twitter"]').attr('href') || undefined
        const website = $MdB('a[title="Homepage"]').attr('href') || undefined

        const imageUrl = `${BUNDESTAG_BASE_URL}${
          $MdB('.bt-bild-standard > img').attr('data-img-md-retina') || ''
        }`
        if (!imageUrl) {
          console.error(
            `\nCould not scrape imageUrl for ${mdb.name} (ID: ${mdb.id})`
          )
        }
        const imageCredits = $MdB('.bt-bild-info-text > p:nth-child(3)').text()

        mdbMap[mdb.id] = {
          constituency,
          constituencyZipCodes: [], // Will be added in a separate step
          countryCode: 'DE',
          email: '', // Will be added in a separate step
          facebook,
          fullName: mdb.name,
          id: `MdB_${mdb.id}`,
          imageCredits,
          imageUrl: imageUrl || mdb.img,
          instagram,
          linkedIn,
          nationalPoliticalGroup: mdb.party,
          phone: undefined,
          twitter,
          website,
        }
      } catch (e) {
        console.error(`\nFailed to scrape MdB ${mdb.name} (ID: ${mdb.id})`)
      }

      // Wait to avoid beeing blocked
      await waitRandom(2)
    }

    process.stdout.write(`\r${i + 1} of ${allMdBPaths.length} MdBs scraped`)
  }

  console.info('\nScraping MdBs ✔')

  return mdbMap
}
