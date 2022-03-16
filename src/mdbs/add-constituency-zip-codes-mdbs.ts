import csv from 'csvtojson'
import path from 'path'

import { CONSTITUENCIES_CSV_FILE_NAME } from './config'
import { MdB } from './scrape-mdbs'

export async function addConstituencyZipCodesToMdBs(
  mdbsById: Record<string, MdB>
): Promise<Record<string, MdB>> {
  console.info('\nAdding constituency zip codes to MdBs...')

  const mdbIds = Object.keys(mdbsById)
  console.info(`${mdbIds.length} MdBs loaded`)

  const constituencies = await csv().fromFile(
    path.resolve(__dirname, `./input/${CONSTITUENCIES_CSV_FILE_NAME}`)
  )

  mdbIds.forEach((mdbId, i) => {
    const mdb = mdbsById[mdbId]

    try {
      // Parse the constituency number from the MdB's constituency name
      const constituencyNumber = parseInt(
        mdb.constituency?.split(':').shift()?.split(' ').pop() || ''
      )

      if (typeof constituencyNumber !== 'number') {
        console.error(
          `\nCould not get constituencyNumber for ${mdb.fullName} (ID: ${mdb.id})`
        )
      }

      // Find all zip codes for that constituency
      const constituencyZipCodes = constituencies
        .filter(
          (constituency) => parseInt(constituency.number) === constituencyNumber
        )
        .map((costituency) => costituency.area_code)

      mdbsById[mdbId] = {
        ...mdb,
        constituencyZipCodes,
      }
    } catch (e) {
      console.error(
        `\nFailed to add constituency zip codes for ${mdb.fullName} (ID: ${mdb.id})`
      )
    }
    process.stdout.write(`\r${i + 1} of ${mdbIds.length} MdBs processed`)
  })
  console.info('\nAdding constituency zip codes to MdBs ✔')

  return mdbsById
}
