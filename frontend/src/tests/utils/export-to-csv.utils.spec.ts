import { convertToCsv } from "$lib/utils/export-to-csv.utils";

describe("Export to Csv", () => {
  describe("convertToCSV", () => {
    it("should handle empty arrays", () => {
      const data = [];
      const expected = "";
      expect(convertToCsv(data)).toBe(expected);
    });

    it("should handle null and undefined values", () => {
      const data = [
        { name: null, age: undefined, city: "New York" },
        { name: "Jane", age: 25, city: null },
      ];
      const expected = "name,age,city\n,,New York\nJane,25,";
      expect(convertToCsv(data)).toBe(expected);
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
      const expected = 'note,id\n"Line 1\nLine 2",1\nSingle Line,2';
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
      const expected = 'value,id\n"<script>alert(""xss"")</script>",1';
      expect(convertToCsv(data)).toBe(expected);
    });
  });
});
