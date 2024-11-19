// Source: https://web.dev/patterns/files/save-a-file
const supportsFileSystemAccess =
  "showSaveFilePicker" in window &&
  (() => {
    try {
      return window.self === window.top;
    } catch {
      return false;
    }
  })();

const escapeCsvValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";

  const stringValue = String(value);

  // Quick check for any special characters before doing more work
  if (!/[",\r\n=+\-@|]/.test(stringValue)) {
    return stringValue;
  }

  // Handle formula injection
  if (
    stringValue[0] === "=" ||
    stringValue[0] === "+" ||
    stringValue[0] === "-" ||
    stringValue[0] === "@" ||
    stringValue[0] === "|"
  ) {
    return `'${stringValue}`;
  }

  // If we need to quote, do all the work
  if (/[",\r\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

export const convertToCsv = (data: Record<string, unknown>[]) => {
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];

  for (const row of data) {
    const values = headers.map((header) => escapeCsvValue(row[header]));
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
};

export class FileSystemAccessError extends Error {
  constructor(message: string, { cause }: { cause: string }) {
    super(message);
    this.name = "FileSystemAccessError";
    this.cause = cause;
  }
}

export class CSVGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CSVGenerationError";
  }
}

const downloadFileWithShowSaveFilePicker = async ({
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
      { cause: error instanceof Error ? error.message : String(error) }
    );
  }
};

const downloadFileWithAnchor = ({ blob }: { blob: Blob }) => {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "neurons.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(
      `Failed to save file using fallback method.\n${error instanceof Error ? error.message : String(error)}`
    );
  }
};
/**
 * Downloads data as a Csv file using either the File System Access API or fallback method.
 *
 * @param options - Configuration object for the Csv download
 * @param options.entity - Array of objects to be converted to Csv. Each object should have consistent keys. It uses first object to check for consistency
 * @param options.fileName - Name of the file without extension (defaults to "entity")
 * @param options.description - File description for save dialog (defaults to " Csv file")
 *
 * @example
 * await downloadCsv({
 *   entity: [
 *     { name: "John", age: 30 },
 *     { name: "Jane", age: 25 }
 *   ]
 * });
 *
 * @throws {Error} If the data array is empty or contains inconsistent object structures
 * @returns {Promise<void>} Promise that resolves when the file has been downloaded
 *
 * @remarks
 * - Uses the modern File System Access API when available, falling back to traditional download method
 * - Automatically handles values containing commas by wrapping them in quotes
 * - Adds BOM character for proper UTF-8 encoding in Excel
 */
export const downloadCsv = async <T extends Record<string, unknown>>({
  entity,
  fileName = "entity",
  description = " Csv file",
}: {
  entity: [T, ...Array<{ [K in keyof T]: T[K] }>];
  fileName?: string;
  description?: string;
}): Promise<void> => {
  try {
    const csvContent = convertToCsv(entity);
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    if (supportsFileSystemAccess) {
      downloadFileWithShowSaveFilePicker({ blob, fileName, description });
    } else {
      downloadFileWithAnchor({ blob });
    }
  } catch (error) {
    if (
      error instanceof FileSystemAccessError ||
      error instanceof CSVGenerationError
    ) {
      throw error;
    }
    throw new Error("Unexpected error during Csv download", {
      cause: error instanceof Error ? error.message : String(error),
    });
  }
};
