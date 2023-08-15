// remove (array-index:|spaces|")
export const simplifyJson = (json: string | null) =>
  json?.replace(/(\d+\s*:\s*)(\w+|"|{|}|\[|])/g, "$2").replace(/"| |,|\\/g, "");
