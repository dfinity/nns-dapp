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

export const saveGeneratedCsv = async ({
  csvContent,
  fileName,
  description,
}: {
  csvContent: string;
  fileName: string;
  description: string;
}): Promise<void> => {
  try {
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    // TODO: Investigate the random issues with showSaveFilePicker.
    const isShowSaveFilePickerEnabled = false;
    if (
      "showSaveFilePicker" in window &&
      typeof window.showSaveFilePicker === "function" &&
      isShowSaveFilePickerEnabled
    ) {
      await saveFileWithPicker({ blob, fileName, description });
    } else {
      saveFileWithAnchor({ blob, fileName });
    }
  } catch (error) {
    console.error(error);
    if (error instanceof FileSystemAccessError) {
      throw error;
    }
    throw new CsvGenerationError("Unexpected error saving CSV file", {
      cause: error,
    });
  }
};
