import {
  FileSystemAccessError,
  convertToCsv,
  generateCsvDownload,
} from "$lib/utils/export-to-csv.utils";

describe("Export to Csv", () => {
  describe("convertToCSV", () => {
    it("should handle null and undefined values", () => {
      const data = [
        { name: null, age: undefined, city: "New York" },
        { name: "Jane", age: 25, city: null },
      ];
      const expected = "name,age,city\n,,New York\nJane,25,";
      expect(convertToCsv(data)).toBe(expected);
    });

    it("should handle empty array", () => {
      const data: Record<string, unknown>[] = [];
      expect(convertToCsv(data)).toBe("");
    });

    it("should handle values containing commas by wrapping them in quotes", () => {
      const data = [
        { name: "John, Jr.", age: 30 },
        { name: "Jane", age: 25 },
      ];
      const expected = 'name,age\n"John, Jr.",30\nJane,25';
      expect(convertToCsv(data)).toBe(expected);
    });

    it("should escape double quotes by doubling them", () => {
      const data = [
        { name: 'John "Johnny" Doe', age: 30 },
        { name: "Jane", age: 25 },
      ];
      const expected = 'name,age\n"John ""Johnny"" Doe",30\nJane,25';
      expect(convertToCsv(data)).toBe(expected);
    });

    it("should prevent formula injection by prefixing with single quote", () => {
      const data = [
        { formula: "=SUM(A1:A10)", value: 100 },
        { formula: "+1234567", value: 200 },
        { formula: "-1234567", value: 300 },
        { formula: "@SUM(A1)", value: 400 },
        { formula: "|MACRO", value: 500 },
      ];
      const expected =
        "formula,value\n'=SUM(A1:A10),100\n'+1234567,200\n'-1234567,300\n'@SUM(A1),400\n'|MACRO,500";
      expect(convertToCsv(data)).toBe(expected);
    });

    it("should handle values containing newlines by wrapping them in quotes", () => {
      const data = [
        { note: "Line 1\nLine 2", id: 1 },
        { note: "Single Line", id: 2 },
      ];
      const expected = 'note,id\n"Line 1\nLine 2",1\n"Single Line",2';
      expect(convertToCsv(data)).toBe(expected);
    });

    it("should handle combination of special characters", () => {
      const data = [
        {
          value: '=Formula with "quotes", and\nnewline',
          id: 1,
        },
        {
          value: 'Normal text with "quotes" and, comma',
          id: 2,
        },
      ];
      const expected =
        'value,id\n"\'=Formula with ""quotes"", and\nnewline",1\n"Normal text with ""quotes"" and, comma",2';
      expect(convertToCsv(data)).toBe(expected);
    });

    it("should handle empty strings", () => {
      const data = [
        { value: "", id: 1 },
        { value: "not empty", id: 2 },
      ];
      const expected = "value,id\n,1\nnot empty,2";
      expect(convertToCsv(data)).toBe(expected);
    });

    it("should handle potential XSS attempts", () => {
      const data = [
        {
          value: '<script>alert("xss")</script>',
          id: 1,
        },
      ];
      const expected = 'value,id\n<script>alert("xss")</script>,1';
      expect(convertToCsv(data)).toBe(expected);
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

        await expect(generateCsvDownload({ entity: [{}] })).resolves.not.toThrow();
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
