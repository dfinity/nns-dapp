const convertToCSV = (data: Record<string, unknown>[]) => {
  const headers = Object.keys(data[0]);

  const csvRows = [headers.join(",")];

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      // Handle special cases (like strings with commas)
      return typeof value === "string" && value.includes(",")
        ? `"${value}"`
        : value;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
};

export class FileSystemAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileSystemAccessError";
  }
}

export class CSVGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CSVGenerationError";
  }
}

/**
 * Downloads data as a CSV file using either the File System Access API or fallback method.
 *
 * @param options - Configuration object for the CSV download
 * @param options.entity - Array of objects to be converted to CSV. Each object should have consistent keys. It uses first object to check for consistency
 * @param options.fileName - Name of the file without extension (defaults to "entity")
 * @param options.description - File description for save dialog (defaults to " CSV file")
 *
 * @example
 * await downloadCSV({
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
export const downloadCSV = async <T extends Record<string, unknown>>({
  entity,
  fileName = "entity",
  description = " CSV file",
}: {
  entity: [T, ...Array<{ [K in keyof T]: T[K] }>];
  fileName?: string;
  description?: string;
}): Promise<void> => {
  try {
    const csvContent = convertToCSV(entity);
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    if (window.showSaveFilePicker) {
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
          "Failed to save file using File System Access API"
        );
      }
    } else {
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
        throw new FileSystemAccessError(
          "Failed to save file using fallback method"
        );
      }
    }
  } catch (error) {
    if (
      error instanceof FileSystemAccessError ||
      error instanceof CSVGenerationError
    ) {
      throw error;
    }
    throw new Error("Unexpected error during CSV download");
  }
};

// For testing purposes
downloadCSV.convertToCSV = convertToCSV;
