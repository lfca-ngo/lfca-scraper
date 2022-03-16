import csv from 'csvtojson'
import path from 'path'

import { CONTACTS_CSV_FILE_NAME } from './config'
import { MdB } from './scrape-mdbs'
import { removeTitlesPrefixesFromName } from './utils'

export async function addEmailsToMdBs(
  mdbsById: Record<string, MdB>
): Promise<Record<string, MdB>> {
  console.info('\nAdding Emails to MdBs...')

  const mdbIds = Object.keys(mdbsById)
  console.info(`${mdbIds.length} MdBs loaded`)

  const contacts = await csv({
    delimiter: ';',
  }).fromFile(path.resolve(__dirname, `./input/${CONTACTS_CSV_FILE_NAME}`))

  mdbIds.forEach((mdbId, i) => {
    const mdb = mdbsById[mdbId]

    try {
      // Find an entry in the contacts using the simple name
      const simpleFullName = removeTitlesPrefixesFromName(mdb.fullName)
      const matchingContact = contacts.find(
        (contact) =>
          `${contact['Vorname BT']} ${contact['Name BT']}` === simpleFullName
      )

      if (!matchingContact) {
        console.error(
          `\nCould not get contact for ${mdb.fullName} (ID: ${mdb.id})`
        )
      }

      mdbsById[mdbId] = {
        ...mdb,
        email: matchingContact['E-Mail'] || '',
      }
    } catch (e) {
      console.error(`\nFailed to add Email for ${mdb.fullName} (ID: ${mdb.id})`)
    }
    process.stdout.write(`\r${i + 1} of ${mdbIds.length} MdBs processed`)
  })
  console.info('\nAdding Email to MdBs ✔')

  return mdbsById
}
