import fs from 'fs'
import path from 'path'

import { addConstituencyZipCodesToMdBs } from './add-constituency-zip-codes-mdbs'
import { addEmailsToMdBs } from './add-emails-to-mdbs'
import { MDBS_BY_ID_FILE_NAME, SKIP_EXISTING_MDBS } from './config'
import { MdB, scrapeMdBs } from './scrape-mdbs'

export async function run() {
  // Scrape MdBs
  const mdbsByIdFilePath = path.resolve(
    __dirname,
    `./output/${MDBS_BY_ID_FILE_NAME}`
  )

  let existingMdBData: Record<string, MdB> = {}
  if (SKIP_EXISTING_MDBS) {
    try {
      existingMdBData = JSON.parse(fs.readFileSync(mdbsByIdFilePath, 'utf8'))
    } catch (e) {
      console.info('No existing MdBs present')
    }
  }

  const newMdBData = await scrapeMdBs(existingMdBData)
  fs.writeFileSync(mdbsByIdFilePath, JSON.stringify(newMdBData, null, 2))

  // Map MdBs to zip code
  const mdbsWithConstituencyData = await addConstituencyZipCodesToMdBs(
    newMdBData
  )
  fs.writeFileSync(
    mdbsByIdFilePath,
    JSON.stringify(mdbsWithConstituencyData, null, 2)
  )

  // Add Email addresses
  const mdbsWithEmail = await addEmailsToMdBs(newMdBData)
  fs.writeFileSync(mdbsByIdFilePath, JSON.stringify(mdbsWithEmail, null, 2))
}
