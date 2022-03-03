export async function waitRandom(maxSeconds?: number) {
  await new Promise((res) => {
    const rndInt = Math.floor(Math.random() * ((maxSeconds || 2) * 10)) + 1
    setTimeout(() => {
      res(true)
    }, rndInt * 100)
  })
}
