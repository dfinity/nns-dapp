import { isNullish } from "@dfinity/utils";

const escapeCsvValue = (value: unknown): string => {
  if (isNullish(value)) return "";

  let stringValue = String(value);

  const patternForSpecialCharacters = /[",\r\n=+\-@|]/;
  if (!patternForSpecialCharacters.test(stringValue)) {
    return stringValue;
  }

  const formulaInjectionCharacters = "=+-@|";
  const characterToBreakFormula = "'";
  if (formulaInjectionCharacters.includes(stringValue[0])) {
    stringValue = `${characterToBreakFormula}${stringValue}`;
  }

  const patternForCharactersToQuote = /[",\r\n]/;
  if (patternForCharactersToQuote.test(stringValue)) {
    stringValue = `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

export const convertToCsv = <T>({
  data,
  headers,
}: {
  data: T[];
  headers: { id: keyof T }[];
}) => {
  if (headers.length === 0) return "";

  const sanitizedHeaders = headers
    .map(({ id }) => id)
    .map((header) => escapeCsvValue(header));
  const csvRows = [sanitizedHeaders.join(",")];

  for (const row of data) {
    const values = headers.map((header) => escapeCsvValue(row[header.id]));
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
};
