// Source - https://github.com/papyrs/markdown-plugin/blob/main/src/plugin/utils/save.utils.ts

const JSON_PICKER_OPTIONS: FilePickerAcceptType = {
  description: "JSON file",
  accept: {
    "text/plain": [".json"],
  },
};

/**
 *
 * @throws Error, AbortError
 */
export const saveToJSONFile = ({
  blob,
  filename,
}: {
  blob: Blob;
  filename: string;
}) => {
  if ("showSaveFilePicker" in window) {
    return exportNativeFileSystem({ blob, filename });
  }

  return download({ blob, filename });
};

const exportNativeFileSystem = async ({
  blob,
  filename,
}: {
  blob: Blob;
  filename: string;
}) => {
  const fileHandle: FileSystemFileHandle = await getNewFileHandle({
    filename,
    types: [JSON_PICKER_OPTIONS],
  });

  if (fileHandle === undefined || fileHandle === null) {
    throw new Error("Cannot access filesystem");
  }

  await writeFile({ fileHandle, blob });
};

const getNewFileHandle = ({
  filename,
  types,
}: {
  filename: string;
  types: FilePickerAcceptType[];
}): Promise<FileSystemFileHandle> => {
  const opts: SaveFilePickerOptions = {
    suggestedName: filename,
    types,
  };

  return showSaveFilePicker(opts);
};

const writeFile = async ({
  fileHandle,
  blob,
}: {
  fileHandle: FileSystemFileHandle;
  blob: Blob;
}) => {
  const writer: FileSystemWritableFileStream =
    await fileHandle.createWritable();
  await writer.write(blob);
  await writer.close();
};

const download = ({ filename, blob }: { filename: string; blob: Blob }) => {
  const a: HTMLAnchorElement = document.createElement("a");
  a.style.display = "none";
  document.body.appendChild(a);

  const url: string = window.URL.createObjectURL(blob);

  a.href = url;
  a.download = filename;

  a.click();

  window.URL.revokeObjectURL(url);
  a.parentElement?.removeChild(a);
};
