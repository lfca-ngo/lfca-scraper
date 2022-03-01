import inquirer from 'inquirer'

import * as MEPs from './meps'

const SCRAPE_MAP: Record<string, () => Promise<void>> = {
  meps: MEPs.run,
}

inquirer
  .prompt([
    {
      choices: Object.keys(SCRAPE_MAP),
      message: 'Select a scraper to run',
      name: 'script',
      type: 'list',
    },
  ])
  .then(async ({ script }) => {
    await SCRAPE_MAP[script]()
  })
