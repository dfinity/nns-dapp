import {
  convertToCsv,
  FileSystemAccessError,
  generateCsvFileToSave,
} from "$lib/utils/export-to-csv.utils";

describe("Export to Csv", () => {
  describe("convertToCSV", () => {
    it("should return an empty string when empty headers are provided", () => {
      const data = [];
      const headers = [];
      const expected = "";
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should return a string with headers and no content when empty data is provided", () => {
      const data = [];
      const headers = [{ id: "name" }];
      const expected = "name";
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should apply order defined by the headers argument", () => {
      const data = [
        { name: "Peter", age: 25 },
        { name: "John", age: 30 },
      ];
      const headers: { id: "age" | "name" }[] = [{ id: "age" }, { id: "name" }];
      const expected = "age,name\n25,Peter\n30,John";
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should handle null, undefined and empty strings ", () => {
      const data = [
        { name: "Peter", age: undefined },
        { name: null, age: 25 },
        { name: "", age: 22 },
      ];
      const headers: { id: "age" | "name" }[] = [{ id: "name" }, { id: "age" }];
      const expected = "name,age\nPeter,\n,25\n,22";
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should handle values containing commas by wrapping them in quotes", () => {
      const data = [
        { name: "John, Jr.", age: 30 },
        { name: "Jane", age: 25 },
      ];
      const headers: { id: "age" | "name" }[] = [{ id: "name" }, { id: "age" }];
      const expected = 'name,age\n"John, Jr.",30\nJane,25';
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should escape double quotes by doubling them", () => {
      const data = [
        { name: 'John "Johnny" Doe', age: 30 },
        { name: "Jane", age: 25 },
      ];
      const headers: { id: "age" | "name" }[] = [{ id: "name" }, { id: "age" }];
      const expected = 'name,age\n"John ""Johnny"" Doe",30\nJane,25';
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should prevent formula injection by prefixing with single quote", () => {
      const data = [
        { formula: "=SUM(A1:A10)", value: 100 },
        { formula: "+1234567", value: 200 },
        { formula: "-1234567", value: 300 },
        { formula: "@SUM(A1)", value: 400 },
        { formula: "|MACRO", value: 500 },
      ];
      const headers: { id: "formula" | "value" }[] = [
        { id: "formula" },
        { id: "value" },
      ];
      const expected =
        "formula,value\n'=SUM(A1:A10),100\n'+1234567,200\n'-1234567,300\n'@SUM(A1),400\n'|MACRO,500";
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should handle formula injection and special characters in values", () => {
      const data = [
        { formula: "=SUM(A1:A10)", value: 100 },
        { formula: "+1234567,12", value: 200 },
      ];
      const headers: { id: "formula" | "value" }[] = [
        { id: "formula" },
        { id: "value" },
      ];
      const expected = "formula,value\n'=SUM(A1:A10),100\n\"'+1234567,12\",200";
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should handle values containing newlines by wrapping them in quotes", () => {
      const data = [
        { note: "Line 1\nLine 2", id: 1 },
        { note: "Single Line", id: 2 },
      ];
      ``;
      const headers: { id: "note" | "id" }[] = [{ id: "note" }, { id: "id" }];
      const expected = 'note,id\n"Line 1\nLine 2",1\nSingle Line,2';
      expect(convertToCsv({ data, headers })).toBe(expected);
    });
  });

  describe("downloadCSV", () => {
    beforeEach(() => {
      vi.spyOn(console, "error").mockImplementation(() => {});
    });

    describe("Modern Browser (File System Access API)", () => {
      let mockWritable;
      let mockHandle;

      beforeEach(() => {
        vi.unstubAllGlobals();

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
        await generateCsvFileToSave({
          data: [],
          headers: [],
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
          generateCsvFileToSave({ data: [], headers: [] })
        ).resolves.not.toThrow();
      });

      it("should throw FileSystemAccessError when modern API fails", async () => {
        vi.stubGlobal(
          "showSaveFilePicker",
          vi.fn().mockRejectedValue(new Error("API Error"))
        );

        await expect(
          generateCsvFileToSave({ data: [], headers: [] })
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

        await generateCsvFileToSave({
          data: [],
          headers: [],
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

        await expect(
          generateCsvFileToSave({ data: [], headers: [] })
        ).rejects.toThrow(FileSystemAccessError);
      });
    });
  });
});
