import { isNullish } from "@dfinity/utils";

const escapeCsvValue = (value: unknown): string => {
  if (isNullish(value)) return "";

  let stringValue = String(value);

  // Quick check for any special characters before doing more work
  if (!/[",\r\n=+\-@|]/.test(stringValue)) {
    return stringValue;
  }

  const formulaInjectionCharacters = "=+-@|";
  const characterToBreakFormula = "'";
  if (formulaInjectionCharacters.includes(stringValue[0])) {
    stringValue = `${characterToBreakFormula}${stringValue}`;
  }

  // If we need to quote, do all the work
  if (/[",\r\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

export const convertToCsv = ({
  data,
  headers,
}: {
  data: Record<string, unknown>[];
  headers: { id: string }[];
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
