import {
  FileSystemAccessError,
  buildNeuronsDatasets,
  buildTransactionsDatasets,
  combineDatasetsToCsv,
  convertPeriodToNanosecondRange,
  convertToCsv,
  generateCsvFileToSave,
  periodToDateRangeTimestampts,
  type CsvHeader,
} from "$lib/utils/reporting.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { createTransactionWithId } from "$tests/mocks/icp-transactions.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NeuronState, type NeuronInfo } from "@dfinity/nns";

type TestPersonData = { name: string; age: number };
type TestFormulaData = { formula: string; value: number };

describe("reporting utils", () => {
  beforeEach(() => {
    const mockDate = new Date("2023-10-14T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  describe("convertToCSV", () => {
    it("should return an empty string when empty headers are provided", () => {
      const data = [];
      const headers = [];
      const expected = "";
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should return a string with headers and no content when empty data is provided", () => {
      const data = [];
      const headers = [{ id: "name", label: "name" }];
      const expected = "name";
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should apply order defined by the headers argument", () => {
      const data: TestPersonData[] = [
        { name: "Peter", age: 25 },
        { name: "John", age: 30 },
      ];
      const headers: CsvHeader<TestPersonData>[] = [
        { id: "age", label: "Age" },
        { id: "name", label: "Name" },
      ];
      const expected = "Age,Name\n25,Peter\n30,John";
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should handle null, undefined and empty strings ", () => {
      const data: TestPersonData[] = [
        { name: "Peter", age: undefined },
        { name: null, age: 25 },
        { name: "", age: 22 },
      ];
      const headers: CsvHeader<TestPersonData>[] = [
        { id: "name", label: "name" },
        { id: "age", label: "age" },
      ];
      const expected = "name,age\nPeter,\n,25\n,22";
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should handle values containing commas by wrapping them in quotes", () => {
      const data: TestPersonData[] = [
        { name: "John, Jr.", age: 30 },
        { name: "Jane", age: 25 },
      ];
      const headers: CsvHeader<TestPersonData>[] = [
        { id: "name", label: "name" },
        { id: "age", label: "age" },
      ];
      const expected = 'name,age\n"John, Jr.",30\nJane,25';
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should escape double quotes by doubling them", () => {
      const data: TestPersonData[] = [
        { name: 'John "Johnny" Doe', age: 30 },
        { name: "Jane", age: 25 },
      ];
      const headers: CsvHeader<TestPersonData>[] = [
        { id: "name", label: "name" },
        { id: "age", label: "age" },
      ];
      const expected = 'name,age\n"John ""Johnny"" Doe",30\nJane,25';
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should prevent formula injection by prefixing with single quote", () => {
      const data: TestFormulaData[] = [
        { formula: "=SUM(A1:A10)", value: 100 },
        { formula: "@SUM(A1)", value: 400 },
        { formula: "|MACRO", value: 500 },
      ];
      const headers: CsvHeader<TestFormulaData>[] = [
        { id: "formula", label: "formula" },
        { id: "value", label: "value" },
      ];
      const expected =
        "formula,value\n'=SUM(A1:A10),100\n'@SUM(A1),400\n'|MACRO,500";
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should handle formula injection and special characters in values", () => {
      const data: TestFormulaData[] = [
        { formula: "=SUM(A1:A10)", value: 100 },
        { formula: "+1234567,12", value: 200 },
      ];
      const headers: CsvHeader<TestFormulaData>[] = [
        { id: "formula", label: "formula" },
        { id: "value", label: "value" },
      ];
      const expected = 'formula,value\n\'=SUM(A1:A10),100\n"+1234567,12",200';
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should handle values containing newlines by wrapping them in quotes", () => {
      const data: TestPersonData[] = [
        { name: "Peter\nParker", age: 24 },
        { name: "Jane Doe", age: 25 },
      ];
      ``;
      const headers: CsvHeader<TestPersonData>[] = [
        { id: "name", label: "Full Name" },
        { id: "age", label: "Age" },
      ];
      const expected = 'Full Name,Age\n"Peter\nParker",24\nJane Doe,25';
      expect(convertToCsv({ data, headers })).toBe(expected);
    });

    it("should add metadata to the CSV file", () => {
      const data: TestPersonData[] = [{ name: "John", age: 30 }];
      const headers: CsvHeader<TestPersonData>[] = [
        { id: "name", label: "name" },
        { id: "age", label: "age" },
      ];
      const metadata = [
        {
          label: "Title",
          value: "This is a test file",
        },
        {
          label: "Export Date",
          value: "10/10/2021, 2:00:00 AM",
        },
      ];
      const expected = `Title,This is a test file\nExport Date,"10/10/2021, 2:00:00 AM"\n\n,,name,age\n,,John,30`;

      expect(convertToCsv({ data, headers, metadata })).toBe(expected);
    });
  });

  describe("combineDatasetsToCsv", () => {
    const headers: CsvHeader<TestPersonData>[] = [
      { id: "name", label: "Name" },
      { id: "age", label: "Age" },
    ];

    it("should handle empty datasets by rendering the headers and two empty spaces between them", () => {
      const datasets = [{ data: [] }, { data: [] }];
      const expected = "Name,Age\n\n\nName,Age";

      expect(combineDatasetsToCsv({ datasets, headers })).toBe(expected);
    });

    it("should handle multiple datasets by rendering them and two empty spaces in between", () => {
      const datasets = [
        {
          data: [
            { name: "John", age: 30 },
            { name: "Jane", age: 25 },
          ],
        },
        {
          data: [
            { name: "Peter", age: 24 },
            { name: "Mary", age: 28 },
          ],
        },
      ];
      const expected =
        "Name,Age\nJohn,30\nJane,25\n\n\nName,Age\nPeter,24\nMary,28";

      expect(combineDatasetsToCsv({ datasets, headers })).toBe(expected);
    });

    it("should handle multiple datasets with metadata", () => {
      const datasets = [
        {
          data: [{ name: "John", age: 30 }],
          metadata: [
            { label: "Report Date", value: "2024-01-01" },
            { label: "Department", value: "Sales" },
          ],
        },
        {
          data: [{ name: "Jane", age: 25 }],
          metadata: [
            { label: "Report Date", value: "2024-01-01" },
            { label: "Department", value: "Marketing" },
          ],
        },
      ];

      const expected =
        "Report Date,2024-01-01\nDepartment,Sales\n\n,,Name,Age\n,,John,30\n\n\nReport Date,2024-01-01\nDepartment,Marketing\n\n,,Name,Age\n,,Jane,25";

      expect(combineDatasetsToCsv({ datasets, headers })).toBe(expected);
    });
  });

  describe("downloadCSV", () => {
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

        await generateCsvFileToSave({
          datasets: [],
          headers: [],
          fileName: "test",
        });

        expect(window.showSaveFilePicker).toHaveBeenCalledTimes(0);
        expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
        expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
      });

      it.skip("should use File System Access API when available", async () => {
        await generateCsvFileToSave({
          datasets: [],
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

      it.skip("should gracefully handle user cancellation of save dialog", async () => {
        const abortError = new Error("User cancelled");
        abortError.name = "AbortError";

        vi.stubGlobal(
          "showSaveFilePicker",
          vi.fn().mockRejectedValue(abortError)
        );

        await expect(
          generateCsvFileToSave({ datasets: [], headers: [] })
        ).resolves.not.toThrow();
      });

      it.skip("should throw FileSystemAccessError when modern API fails", async () => {
        vi.stubGlobal(
          "showSaveFilePicker",
          vi.fn().mockRejectedValue(new Error("API Error"))
        );

        await expect(
          generateCsvFileToSave({ datasets: [], headers: [] })
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
          datasets: [],
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
          generateCsvFileToSave({ datasets: [], headers: [] })
        ).rejects.toThrow(FileSystemAccessError);
      });
    });
  });

  describe("buildTransactionsDatasets", () => {
    const transactions = [createTransactionWithId({})];

    it("should return an empty array when no transactions are provided", () => {
      expect(
        buildTransactionsDatasets({
          transactions: [],
          i18n: en,
          neuronAccounts: new Set(),
          principal: mockPrincipal,
          swapCanisterAccounts: new Set(),
        })
      ).toEqual([]);
    });

    it("should generate datasets for accounts transactions", () => {
      const mockTransactions = [
        {
          entity: {
            identifier: "1",
            balance: 100n,
            type: "account" as const,
            originalData: mockMainAccount,
          },
          transactions,
        },
      ];

      const datasets = buildTransactionsDatasets({
        transactions: mockTransactions,
        i18n: en,
        neuronAccounts: new Set(),
        principal: mockPrincipal,
        swapCanisterAccounts: new Set(),
      });

      expect(datasets).toEqual([
        {
          data: [
            {
              amount: "+1.00",
              from: "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f",
              id: "1234",
              project: "Internet Computer",
              symbol: "ICP",
              timestamp: "Jan 1, 2023 12:00 AM",
              to: "d0654c53339c85e0e5fff46a2d800101bc3d896caef34e1a0597426792ff9f32",
              type: "Received",
            },
          ],
          metadata: [
            {
              label: "Account ID",
              value: "1",
            },
            {
              label: "Account Name",
              value: "Main",
            },
            {
              label: "Balance(ICP)",
              value: "0.000001",
            },
            {
              label: "Controller Principal ID",
              value:
                "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe",
            },
            {
              label: "Transactions",
              value: "1",
            },
            {
              label: "Export Date Time",
              value: "Oct 14, 2023 12:00 AM",
            },
          ],
        },
      ]);
    });

    it("should add neuron metadata when neurons transactions", () => {
      const mockTransactions = [
        {
          entity: {
            identifier: "1",
            balance: 100n,
            type: "neuron" as const,
            originalData: mockNeuron,
          },
          transactions,
        },
      ];
      const datasets = buildTransactionsDatasets({
        transactions: mockTransactions,
        i18n: en,
        neuronAccounts: new Set(),
        principal: mockPrincipal,
        swapCanisterAccounts: new Set(),
      });

      expect(datasets[0].metadata[1]).toEqual({
        label: "Neuron ID",
        value: "1",
      });
    });
  });

  describe("buildNeuronsDatasets", () => {
    const expectedMetadata = [
      {
        label: "NNS Account Principal ID",
        value:
          "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe",
      },
      {
        label: "Export Date Time",
        value: "Oct 14, 2023 12:00 AM",
      },
    ];

    it("should generate metadata and empty data when no neurons are provided", () => {
      expect(
        buildNeuronsDatasets({
          neurons: [],
          i18n: en,
          nnsAccountPrincipal: mockPrincipal,
        })
      ).toEqual([
        {
          data: [],
          metadata: expectedMetadata,
        },
      ]);
    });

    it("should generate datasets for neurons", () => {
      const createdTimestampSeconds = 1602339200n; // Oct 10, 2020
      const mockLockedNeuron: NeuronInfo = {
        ...mockNeuron,
        neuronId: 10n,
        state: NeuronState.Locked,
        dissolveDelaySeconds: 100n,
        createdTimestampSeconds,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          controller: "controllerId",
          cachedNeuronStake: 30_000_000n,
          maturityE8sEquivalent: 100000n,
          stakedMaturityE8sEquivalent: 200000000n,
          neuronFees: 10000n,
          accountIdentifier: "accountIdentifier",
        },
      };
      const mockDissolvingNeuron: NeuronInfo = {
        ...mockNeuron,
        neuronId: 10n,
        state: NeuronState.Dissolving,
        dissolveDelaySeconds: 100n,
        createdTimestampSeconds,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          controller: "controllerId",
          cachedNeuronStake: 30_000_000n,
          maturityE8sEquivalent: 100000n,
          stakedMaturityE8sEquivalent: 200000000n,
          neuronFees: 10000n,
          accountIdentifier: "accountIdentifier",
        },
      };
      const datasets = buildNeuronsDatasets({
        neurons: [mockLockedNeuron, mockDissolvingNeuron],
        i18n: en,
        nnsAccountPrincipal: mockPrincipal,
      });

      expect(datasets).toEqual([
        {
          data: [
            {
              availableMaturity: "0.001",
              controllerId: "controllerId",
              creationDate: "Oct 10, 2020",
              dissolveDate: "N/A",
              dissolveDelaySeconds: "1 minute",
              neuronAccountId: "accountIdentifier",
              neuronId: "10",
              project: "Internet Computer",
              stake: "0.2999",
              stakedMaturity: "2.00",
              state: "Locked",
              symbol: "ICP",
            },
            {
              availableMaturity: "0.001",
              controllerId: "controllerId",
              creationDate: "Oct 10, 2020",
              dissolveDate: "Oct 14, 2023",
              dissolveDelaySeconds: "1 minute",
              neuronAccountId: "accountIdentifier",
              neuronId: "10",
              project: "Internet Computer",
              stake: "0.2999",
              stakedMaturity: "2.00",
              state: "Dissolving",
              symbol: "ICP",
            },
          ],
          metadata: expectedMetadata,
        },
      ]);
    });
  });

  describe("convertPeriodToNanosecondRange", () => {
    const mockDate = new Date("2024-03-15T12:00:00Z");
    const NANOS_IN_MS = BigInt(1_000_000);

    beforeEach(() => {
      vi.clearAllTimers();
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);
    });

    it('returns empty object for "all" period', () => {
      const result = convertPeriodToNanosecondRange("all");
      expect(result).toEqual({});
    });

    it('returns correct range for "last-year"', () => {
      const result = convertPeriodToNanosecondRange("last-year");

      expect(result).toEqual({
        from: BigInt(new Date("2023-01-01T00:00:00Z").getTime()) * NANOS_IN_MS,
        to: BigInt(new Date("2024-01-01T00:00:00Z").getTime()) * NANOS_IN_MS,
      });
    });

    it('returns correct range for "year-to-date"', () => {
      const result = convertPeriodToNanosecondRange("year-to-date");

      expect(result).toEqual({
        from: BigInt(new Date("2024-01-01T00:00:00Z").getTime()) * NANOS_IN_MS,
      });
    });
  });
});
