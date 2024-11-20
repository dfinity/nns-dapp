import { convertToCsv } from "$lib/utils/export-to-csv.utils";

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
      const headers = [{ id: "age" }, { id: "name" }];
      const expected = "age,name\n25,Peter\n30,John";
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should handle null and undefined values", () => {
      const data = [
        { name: "Peter", age: undefined },
        { name: null, age: 25 },
      ];
      const headers = [{ id: "name" }, { id: "age" }];
      const expected = "name,age\nPeter,\n,25";
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should handle values containing commas by wrapping them in quotes", () => {
      const data = [
        { name: "John, Jr.", age: 30 },
        { name: "Jane", age: 25 },
      ];
      const headers = [{ id: "name" }, { id: "age" }];
      const expected = 'name,age\n"John, Jr.",30\nJane,25';
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should escape double quotes by doubling them", () => {
      const data = [
        { name: 'John "Johnny" Doe', age: 30 },
        { name: "Jane", age: 25 },
      ];
      const headers = [{ id: "name" }, { id: "age" }];
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
      const headers = [{ id: "formula" }, { id: "value" }];
      const expected =
        "formula,value\n'=SUM(A1:A10),100\n'+1234567,200\n'-1234567,300\n'@SUM(A1),400\n'|MACRO,500";
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should handle formula injection and special characters in values", () => {
      const data = [
        { value: "=SUM(A1:A10)", id: 1 },
        { value: "+1234567,12", id: 2 },
      ];
      const headers = [{ id: "value" }, { id: "id" }];
      const expected = "value,id\n'=SUM(A1:A10),1\n\"'+1234567,12\",2";
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should handle values containing newlines by wrapping them in quotes", () => {
      const data = [
        { note: "Line 1\nLine 2", id: 1 },
        { note: "Single Line", id: 2 },
      ];``
      const headers = [{ id: "note" }, { id: "id" }];
      const expected = 'note,id\n"Line 1\nLine 2",1\nSingle Line,2';
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should handle empty strings", () => {
      const data = [
        { value: "", id: 1 },
        { value: "not empty", id: 2 },
      ];
      const headers = [{ id: "value" }, { id: "id" }];
      const expected = "value,id\n,1\nnot empty,2";
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should handle potential XSS attempts", () => {
      const data = [
        {
          value: '<script>"text"</script>',
          id: 1,
        },
      ];
      const headers = [{ id: "value" }, { id: "id" }];
      const expected = 'value,id\n"&lt;script&gt;""text""&lt;/script&gt;",1';
      expect(convertToCsv({ data, headers })).toBe(expected);
    });
  });
});
