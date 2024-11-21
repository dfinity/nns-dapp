import { isNullish } from "@dfinity/utils";

const escapeCsvValue = (value: unknown): string => {
  if (isNullish(value)) return "";

  let stringValue = String(value);

  const patternForSpecialCharacters = /[",\r\n=+-@|]/;
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

export class FileSystemAccessError extends Error {
  constructor(message: string, options: ErrorOptions = {}) {
    super(message, options);
    this.name = "FileSystemAccessError";
  }
}

export class CsvGenerationError extends Error {
  constructor(message: string, options: ErrorOptions = {}) {
    super(message, options);
    this.name = "CSVGenerationError";
  }
}

// Source: https://web.dev/patterns/files/save-a-file
const saveFileWithPicker = async ({
  blob,
  fileName,
  description,
}: {
  blob: Blob;
  fileName: string;
  description: string;
}) => {
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: `${fileName}.csv`,
      types: [
        {
          description,
          accept: { "text/csv": [".csv"] },
        },
      ],
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
  } catch (error) {
    // User cancelled the save dialog - not an error
    if (error instanceof Error && error.name === "AbortError") return;

    throw new FileSystemAccessError(
      "Failed to save file using File System Access API",
      { cause: error }
    );
  }
};

const saveFileWithAnchor = ({
  blob,
  fileName,
}: {
  blob: Blob;
  fileName: string;
}) => {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new FileSystemAccessError(
      "Failed to save file using fallback method",
      {
        cause: error,
      }
    );
  }
};

/**
 * Downloads data as a Csv file using either the File System Access API or fallback method.
 *
 * @param options - Configuration object for the Csv download
 * @param options.data - Array of objects to be converted to Csv. Each object should have consistent keys. It uses first object to check for consistency
 * @param options.headers - Array of objects defining the headers and their order in the CSV. Each object should include an `id` key that corresponds to a key in the data objects.
 * @param options.fileName - Name of the file without extension (defaults to "data")
 * @param options.description - File description for save dialog (defaults to " Csv file")
 *
 * @example
 * await generateCsvFileToSave({
 *   data: [
 *     { name: "John", age: 30 },
 *     { name: "Jane", age: 25 }
 *   ],
 *   headers: [
 *     { id: "name" },
 *     { id: "age" }
 *   ],
 * });
 *
 * @throws {FileSystemAccessError|CsvGenerationError} If there is an issue accessing the file system or generating the Csv
 * @returns {Promise<void>} Promise that resolves when the file has been downloaded
 *
 * @remarks
 * - Uses the modern File System Access API when available, falling back to traditional download method
 * - Automatically handles values containing special characters like commas and new lines
 */
export const generateCsvFileToSave = async <T>({
  data,
  headers,
  fileName = "data",
  description = "Csv file",
}: {
  data: T[];
  headers: { id: keyof T }[];
  fileName?: string;
  description?: string;
}): Promise<void> => {
  try {
    const csvContent = convertToCsv<T>({ data, headers });

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    if (
      "showSaveFilePicker" in window &&
      typeof window.showSaveFilePicker === "function"
    ) {
      await saveFileWithPicker({ blob, fileName, description });
    } else {
      saveFileWithAnchor({ blob, fileName });
    }
  } catch (error) {
    console.error(error);
    if (
      error instanceof FileSystemAccessError ||
      error instanceof CsvGenerationError
    ) {
      throw error;
    }
    throw new CsvGenerationError(
      "Unexpected error generating Csv to download",
      {
        cause: error,
      }
    );
  }
};
