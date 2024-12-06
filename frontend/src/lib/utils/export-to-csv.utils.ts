import { isNullish } from "@dfinity/utils";

type Metadata = {
  label: string;
  value: string;
};

export type CsvDataset<T> = {
  data: T[];
  metadata?: Metadata[];
};

export type CsvHeader<T> = {
  id: keyof T;
  label: string;
};

const escapeCsvValue = (value: unknown): string => {
  if (isNullish(value)) return "";

  let stringValue = String(value);

  const patternForSpecialCharacters = /[",\r\n=@|]/;
  if (!patternForSpecialCharacters.test(stringValue)) {
    return stringValue;
  }

  const formulaInjectionCharacters = "=@|";
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
  metadata = [],
}: {
  data: T[];
  headers: CsvHeader<T>[];
  metadata?: Metadata[];
}) => {
  if (headers.length === 0) return "";

  const PAD_LEFT_WHEN_METADATA_PRESENT = 2;
  const csvRows: string[] = [];
  let padLeft = 0;

  if (metadata.length > 0) {
    const sanitizedMetadata = metadata.map(({ label, value }) => ({
      label: escapeCsvValue(label),
      value: escapeCsvValue(value),
    }));

    const metadataRow = sanitizedMetadata
      .map(({ label, value }) => `${label},${value}`)
      .join("\n");
    csvRows.push(metadataRow);

    // Add an empty row to separate metadata from data
    const emptyRow = "";
    csvRows.push(emptyRow);

    padLeft = PAD_LEFT_WHEN_METADATA_PRESENT;
  }

  const emptyPrefix = Array(padLeft).fill("");
  const sanitizedHeaders = headers
    .map(({ label }) => label)
    .map((header) => escapeCsvValue(header));
  csvRows.push([...emptyPrefix, ...sanitizedHeaders].join(","));

  for (const row of data) {
    const values = headers.map((header) => escapeCsvValue(row[header.id]));
    csvRows.push([...emptyPrefix, ...values].join(","));
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

export const combineDatasetsToCsv = <T>({
  datasets,
  headers,
}: {
  headers: CsvHeader<T>[];
  datasets: CsvDataset<T>[];
}): string => {
  const csvParts: string[] = [];
  // A double empty line break requires 3 new lines
  const doubleCsvLineBreak = "\n\n\n";

  for (const dataset of datasets) {
    const { data, metadata } = dataset;
    const csvContent = convertToCsv<T>({ data, headers, metadata });
    csvParts.push(csvContent);
  }
  return csvParts.join(doubleCsvLineBreak);
};

/**
 * Downloads data as a single CSV file combining multiple datasets, using either the File System Access API or fallback method.
 *
 * @param options - Configuration object for the CSV download
 * @param options.datasets - Array of dataset objects to be combined into a single CSV
 * @param options.datasets[].data - Array of objects to be converted to CSV. Each object should have consistent keys
 * @param options.datasets[].metadata - Optional array of metadata objects. Each object should include a `label` and `value` key. When present, the corresponding data will be shifted two columns to the left
 * @param options.headers - Array of objects defining the headers and their order in the CSV. Each object should include an `id` key that corresponds to a key in the data objects
 * @param options.fileName - Name of the file without extension (defaults to "data")
 * @param options.description - File description for save dialog (defaults to "Csv file")
 *
 * @throws {FileSystemAccessError|CsvGenerationError} If there is an issue accessing the file system or generating the CSV
 * @returns {Promise<void>} Promise that resolves when the combined CSV file has been downloaded
 *
 * @remarks
 * - Uses the modern File System Access API when available, falling back to traditional download method
 * - Automatically handles values containing special characters like commas and new lines
 * - Combines multiple datasets into a single CSV file, maintaining their respective metadata
 * - Each dataset's data and metadata will be appended sequentially in the final CSV
 */
export const generateCsvFileToSave = async <T>({
  datasets,
  headers,
  fileName = "data",
  description = "Csv file",
}: {
  fileName?: string;
  description?: string;
  headers: CsvHeader<T>[];
  datasets: CsvDataset<T>[];
}): Promise<void> => {
  try {
    const csvContent = combineDatasetsToCsv({ datasets, headers });

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
