export class FileSystemAccessError extends Error {
  constructor(message: string, options: ErrorOptions = {}) {
    super(message);
    this.name = "FileSystemAccessError";

    if (options.cause) {
      this.cause = options.cause;
    }
  }
}

export class CSVGenerationError extends Error {
  constructor(message: string, options: ErrorOptions = {}) {
    super(message);
    this.name = "CSVGenerationError";

    if (options.cause) {
      this.cause = options.cause;
    }
  }
}

// Source: https://web.dev/patterns/files/save-a-file
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
      { cause: error }
    );
  }
};

const downloadFileWithAnchor = ({
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
 * @param options.entity - Array of objects to be converted to Csv. Each object should have consistent keys. It uses first object to check for consistency
 * @param options.fileName - Name of the file without extension (defaults to "entity")
 * @param options.description - File description for save dialog (defaults to " Csv file")
 *
 * @example
 * await generateCsvDownload({
 *   entity: [
 *     { name: "John", age: 30 },
 *     { name: "Jane", age: 25 }
 *   ]
 * });
 *
 * @throws {FileSystemAccessError|CSVGenerationError} If there is an issue accessing the file system or generating the Csv
 * @returns {Promise<void>} Promise that resolves when the file has been downloaded
 *
 * @remarks
 * - Uses the modern File System Access API when available, falling back to traditional download method
 * - Automatically handles values containing commas by wrapping them in quotes
 * - Adds BOM character for proper UTF-8 encoding in Excel
 */
export const generateCsvDownload = async <T extends Record<string, unknown>>({
  entity,
  fileName = "entity",
  description = "Csv file",
}: {
  entity: [T, ...Array<{ [K in keyof T]: T[K] }>];
  fileName?: string;
  description?: string;
}): Promise<void> => {
  try {
    const csvContent = convertToCsv(entity);
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    if (
      "showSaveFilePicker" in window &&
      typeof window.showSaveFilePicker === "function"
    ) {
      await downloadFileWithShowSaveFilePicker({ blob, fileName, description });
    } else {
      downloadFileWithAnchor({ blob, fileName });
    }
  } catch (error) {
    console.error(error);
    if (error instanceof FileSystemAccessError) {
      throw error;
    }
    throw new CSVGenerationError(
      "Unexpected error generating Csv to download",
      {
        cause: error,
      }
    );
  }
};
