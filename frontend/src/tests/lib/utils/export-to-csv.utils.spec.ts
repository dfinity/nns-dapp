import {
  FileSystemAccessError,
  downloadCSV,
} from "$lib/utils/export-to-csv.utils";

describe("CSV Utils", () => {
  describe("convertToCSV", () => {
    it("should handle values containing commas by wrapping them in quotes", () => {
      const data = [
        { name: "John, Jr.", age: 30 },
        { name: "Jane", age: 25 },
      ];

      const result = downloadCSV.convertToCSV(data);
      const expected = 'name,age\n"John, Jr.",30\nJane,25';
      expect(result).toBe(expected);
    });
  });

  describe("downloadCSV", () => {
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

      it("should use File System Access API when available", async () => {
        await downloadCSV({
          entity: [{}],
          fileName: "test",
        });

        expect(window.showSaveFilePicker).toHaveBeenCalledWith({
          suggestedName: "test.csv",
          types: [
            {
              description: " CSV file",
              accept: { "text/csv": [".csv"] },
            },
          ],
        });
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

        await expect(downloadCSV({ entity: [{}] })).resolves.not.toThrow();
      });

      it("should throw FileSystemAccessError when modern API fails", async () => {
        vi.stubGlobal(
          "showSaveFilePicker",
          vi.fn().mockRejectedValue(new Error("API Error"))
        );

        await expect(downloadCSV({ entity: [{}] })).rejects.toThrow(
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

        await downloadCSV({
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

        await expect(downloadCSV({ entity: [{}] })).rejects.toThrow(
          FileSystemAccessError
        );
      });
    });
  });
});
