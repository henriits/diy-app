export function formatInstructions(instructions: string | null): string {
  if (!instructions) return ''

  // Add a newline before each step number if it's not already preceded by a newline
  const formattedInstructions = instructions
    // Add a newline before each step number
    .replace(/(?:^|\n)(\d+\.)/g, '\n\n<br><br><strong>$1</strong>')
    // Replace multiple newlines with a single newline
    .replace(/\n{3,}/g, '\n\n')
    // Remove extra leading and trailing newlines
    .trim()

  return formattedInstructions
}
