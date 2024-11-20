import {
  FileSystemAccessError,
  generateCsvDownload,
} from "$lib/utils/export-to-csv.utils";

describe("Export to Csv", () => {
  describe("downloadCSV", () => {
    beforeEach(() => {
      vi.spyOn(console, "error").mockImplementation(() => {});
    });

    describe("Modern Browser (File System Access API)", () => {
      let mockWritable;
      let mockHandle;

      beforeEach(() => {
        mockWritable = {
          write: vi.fn().mockResolvedValue(undefined),
          close: vi.fn().mockResolvedValue(undefined),
        };

        mockHandle = {
          createWritable: vi.fn().mockResolvedValue(mockWritable),
        };

        vi.stubGlobal(
          "showSaveFilePicker",
          vi.fn().mockResolvedValue(mockHandle)
        );
      });

      it("should use File System Access API when available", async () => {
        await generateCsvDownload({
          entity: [{}],
          fileName: "test",
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

      it("should gracefully handle user cancellation of save dialog", async () => {
        const abortError = new Error("User cancelled");
        abortError.name = "AbortError";

        vi.stubGlobal(
          "showSaveFilePicker",
          vi.fn().mockRejectedValue(abortError)
        );

        await expect(
          generateCsvDownload({ entity: [{}] })
        ).resolves.not.toThrow();
      });

      it("should throw FileSystemAccessError when modern API fails", async () => {
        vi.stubGlobal(
          "showSaveFilePicker",
          vi.fn().mockRejectedValue(new Error("API Error"))
        );

        await expect(generateCsvDownload({ entity: [{}] })).rejects.toThrow(
          FileSystemAccessError
        );
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

        await generateCsvDownload({
          entity: [{}],
          fileName: "test",
        });

        expect(URL.createObjectURL).toBeCalledTimes(1);
        expect(clickSpy).toHaveBeenCalled();
        expect(URL.revokeObjectURL).toHaveBeenCalled();
      });

      it("should throw FileSystemAccessError on fallback method failure", async () => {
        document.body.appendChild = vi.fn().mockReturnValueOnce(() => {
          throw new Error("DOM Error");
        });

        await expect(generateCsvDownload({ entity: [{}] })).rejects.toThrow(
          FileSystemAccessError
        );
      });
    });
  });
});
