import {
  FileSystemAccessError,
  saveGeneratedCsv,
} from "$lib/utils/reporting.save-csv-to-file.utils";

describe("reporting utils", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  // TODO: Investigate the random issues with showSaveFilePicker.
  describe("Modern Browser (File System Access API)", () => {
    let mockWritable;
    let mockHandle;

    beforeEach(() => {
      mockWritable = {
        write: vi.fn(),
        close: vi.fn(),
      };

      mockHandle = {
        createWritable: vi.fn().mockResolvedValue(mockWritable),
      };

      vi.stubGlobal(
        "showSaveFilePicker",
        vi.fn().mockResolvedValue(mockHandle)
      );
    });

    it("should use Legacy Browser Link as feature is disabled", async () => {
      URL.createObjectURL = vi.fn();
      URL.revokeObjectURL = vi.fn();

      await saveGeneratedCsv({
        csvContent: "",
        fileName: "test",
        description: "test",
      });

      expect(window.showSaveFilePicker).toHaveBeenCalledTimes(0);
      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    });

    it.skip("should use File System Access API when available", async () => {
      await saveGeneratedCsv({
        csvContent: "",
        fileName: "test",
        description: "test",
      });

      expect(window.showSaveFilePicker).toHaveBeenCalledWith({
        suggestedName: "test.csv",
        types: [
          {
            description: "Csv file",
            accept: { "text/csv": [".csv"] },
          },
        ],
      });
      expect(mockHandle.createWritable).toHaveBeenCalledTimes(1);
      expect(mockWritable.write).toHaveBeenCalledWith(expect.any(Blob));
      expect(mockWritable.write).toHaveBeenCalledTimes(1);
      expect(mockWritable.close).toHaveBeenCalledTimes(1);
    });

    it.skip("should gracefully handle user cancellation of save dialog", async () => {
      const abortError = new Error("User cancelled");
      abortError.name = "AbortError";

      vi.stubGlobal(
        "showSaveFilePicker",
        vi.fn().mockRejectedValue(abortError)
      );

      await expect(
        saveGeneratedCsv({
          csvContent: "",
          fileName: "",
          description: "",
        })
      ).resolves.not.toThrow();
    });

    it.skip("should throw FileSystemAccessError when modern API fails", async () => {
      vi.stubGlobal(
        "showSaveFilePicker",
        vi.fn().mockRejectedValue(new Error("API Error"))
      );

      await expect(
        saveGeneratedCsv({
          csvContent: "",
          fileName: "",
          description: "",
        })
      ).rejects.toThrow(FileSystemAccessError);
    });
  });

  describe("Legacy Browser (Fallback method)", () => {
    beforeEach(() => {
      URL.createObjectURL = vi.fn();
      URL.revokeObjectURL = vi.fn();
      window.showSaveFilePicker = undefined;
    });

    it("should use fallback method when showSaveFilePicker is not available", async () => {
      const mockLink = document.createElement("a");
      const clickSpy = vi
        .spyOn(mockLink, "click")
        .mockImplementationOnce(() => {});
      vi.spyOn(document, "createElement").mockReturnValue(mockLink);

      await saveGeneratedCsv({
        csvContent: "",
        fileName: "",
        description: "",
      });

      expect(URL.createObjectURL).toBeCalledTimes(1);
      expect(clickSpy).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it("should throw FileSystemAccessError on fallback method failure", async () => {
      document.body.appendChild = vi.fn().mockReturnValueOnce(() => {
        throw new Error("DOM Error");
      });

      await expect(
        saveGeneratedCsv({
          csvContent: "",
          fileName: "test",
          description: "",
        })
      ).rejects.toThrow(FileSystemAccessError);
    });
  });
});
