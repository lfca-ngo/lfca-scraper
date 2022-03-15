export function capitalizeFirstLetter(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => {
      return word[0].toUpperCase() + word.substring(1)
    })
    .join(' ')
}
