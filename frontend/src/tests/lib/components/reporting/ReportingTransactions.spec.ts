import * as governanceApi from "$lib/api/governance.api";
import * as icpIndexApi from "$lib/api/icp-index.api";
import * as icrcIndex from "$lib/api/icrc-index.api";
import * as icrcLedger from "$lib/api/icrc-ledger.api";
import ReportingTransactions from "$lib/components/reporting/ReportingTransactions.svelte";
import { CKBTC_INDEX_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import * as exportDataService from "$lib/services/reporting.services";
import * as exportToCsv from "$lib/utils/reporting.utils";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockAccountsStoreData,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { createIcrcTransactionWithId } from "$tests/mocks/icrc-transactions.mock";
import { ReportingTransactionsPo } from "$tests/page-objects/ReportingTransactions.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { render } from "@testing-library/svelte";

vi.mock("$lib/api/icp-ledger.api");
vi.mock("$lib/api/governance.api");

describe("ReportingTransactions", () => {
  let getAccountTransactionsConcurrently;
  let getAllIcrcTransactionsForCkTokens;

  const renderComponent = () => {
    const { container } = render(ReportingTransactions);

    const po = ReportingTransactionsPo.under(
      new JestPageObjectElement(container)
    );
    return po;
  };

  beforeEach(() => {
    resetIdentity();

    getAccountTransactionsConcurrently = vi.spyOn(
      exportDataService,
      "getAccountTransactionsConcurrently"
    );
    getAllIcrcTransactionsForCkTokens = vi.spyOn(
      exportDataService,
      "getAllIcrcTransactionsForCkTokens"
    );

    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(exportToCsv, "generateCsvFileToSave").mockImplementation(() =>
      Promise.resolve()
    );

    const mockDate = new Date("2023-10-14T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  describe("nns", () => {
    beforeEach(() => {
      vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([]);
      vi.spyOn(console, "error").mockImplementation(() => {});
      vi.spyOn(icpIndexApi, "getTransactions").mockResolvedValue({
        transactions: [],
        balance: 0n,
        oldestTxId: 1n,
      });

      setAccountsForTesting({
        ...mockAccountsStoreData,
      });
    });

    it("should only fetch icp data", async () => {
      const po = renderComponent();
      await po.getReportingTransactionsButtonPo().click();

      expect(getAllIcrcTransactionsForCkTokens).toHaveBeenCalledTimes(0);
      expect(getAccountTransactionsConcurrently).toHaveBeenCalledTimes(1);
    });

    it("should fetch all transactions by default", async () => {
      const po = renderComponent();
      await po.getReportingTransactionsButtonPo().click();

      expect(getAccountTransactionsConcurrently).toHaveBeenCalledTimes(1);
      expect(getAccountTransactionsConcurrently).toHaveBeenCalledWith({
        entities: [mockMainAccount],
        identity: mockIdentity,
        range: {
          from: 1672531200000000000n,
        },
      });
    });

    it("should fetch year-to-date transactions when selecting such option", async () => {
      const beginningOfYear = new Date("2023-01-01T00:00:00Z");
      const NANOS_IN_MS = BigInt(1_000_000);
      const beginningOfYearInNanoseconds =
        BigInt(beginningOfYear.getTime()) * NANOS_IN_MS;

      const po = renderComponent();
      await po
        .getReportingDateRangeSelectorPo()
        .selectProvidedOption("year-to-date");
      await po.getReportingTransactionsButtonPo().click();

      expect(getAccountTransactionsConcurrently).toHaveBeenCalledTimes(1);
      expect(getAccountTransactionsConcurrently).toHaveBeenCalledWith({
        entities: [mockMainAccount],
        identity: mockIdentity,
        range: {
          from: beginningOfYearInNanoseconds,
        },
      });
    });

    it("should fetch last-year transactions when selecting such option", async () => {
      const beginningOfYear = new Date("2023-01-01T00:00:00Z");
      const beginningOfLastYear = new Date("2022-01-01T00:00:00Z");
      const NANOS_IN_MS = BigInt(1_000_000);
      const beginningOfYearInNanoseconds =
        BigInt(beginningOfYear.getTime()) * NANOS_IN_MS;

      const beginningOfLastYearInNanoseconds =
        BigInt(beginningOfLastYear.getTime()) * NANOS_IN_MS;

      const po = renderComponent();
      await po
        .getReportingDateRangeSelectorPo()
        .selectProvidedOption("last-year");
      await po.getReportingTransactionsButtonPo().click();

      expect(getAccountTransactionsConcurrently).toHaveBeenCalledTimes(1);
      expect(getAccountTransactionsConcurrently).toHaveBeenCalledWith({
        entities: [mockMainAccount],
        identity: mockIdentity,
        range: {
          from: beginningOfLastYearInNanoseconds,
          to: beginningOfYearInNanoseconds,
        },
      });
    });
  });

  describe("ckTokens", () => {
    beforeEach(() => {
      vi.spyOn(icrcLedger, "queryIcrcToken").mockResolvedValue({
        symbol: "CKBTC",
        name: "Chain Key Bitcoin",
        fee: 0n,
        decimals: 8,
      });

      const mockIcrcTransactions = [
        createIcrcTransactionWithId({}),
        createIcrcTransactionWithId({
          id: 1n,
        }),
      ];

      vi.spyOn(icrcIndex, "getTransactions").mockImplementation(
        async (params) => {
          if (params?.indexCanisterId === CKBTC_INDEX_CANISTER_ID) {
            return {
              transactions: mockIcrcTransactions,
              balance: 0n,
              oldestTxId: 1n,
            };
          }
          return {
            transactions: [],
            balance: 0n,
            oldestTxId: 0n,
          };
        }
      );
    });

    it("should only fetch icrc data", async () => {
      const po = renderComponent();

      await po.getReportingSourceSelectorPo().selectProvidedOption("ck");
      await po.getReportingTransactionsButtonPo().click();

      expect(getAccountTransactionsConcurrently).toHaveBeenCalledTimes(0);
      expect(getAllIcrcTransactionsForCkTokens).toHaveBeenCalledTimes(1);
    });

    it("should fetch year-to-date transactions by default", async () => {
      const beginningOfYear = new Date("2023-01-01T00:00:00Z");
      const NANOS_IN_MS = BigInt(1_000_000);
      const beginningOfYearInNanoseconds =
        BigInt(beginningOfYear.getTime()) * NANOS_IN_MS;

      const po = renderComponent();
      await po.getReportingSourceSelectorPo().selectProvidedOption("ck");
      await po.getReportingTransactionsButtonPo().click();

      expect(getAllIcrcTransactionsForCkTokens).toHaveBeenCalledTimes(1);
      expect(getAllIcrcTransactionsForCkTokens).toHaveBeenCalledWith({
        account: { owner: mockIdentity.getPrincipal() },
        identity: mockIdentity,
        range: {
          from: beginningOfYearInNanoseconds,
        },
      });
    });

    it("should fetch year-to-date transactions when selecting such option", async () => {
      const beginningOfYear = new Date("2023-01-01T00:00:00Z");
      const NANOS_IN_MS = BigInt(1_000_000);
      const beginningOfYearInNanoseconds =
        BigInt(beginningOfYear.getTime()) * NANOS_IN_MS;

      const po = renderComponent();
      await po.getReportingSourceSelectorPo().selectProvidedOption("ck");
      await po
        .getReportingDateRangeSelectorPo()
        .selectProvidedOption("year-to-date");
      await po.getReportingTransactionsButtonPo().click();

      expect(getAllIcrcTransactionsForCkTokens).toHaveBeenCalledTimes(1);
      expect(getAllIcrcTransactionsForCkTokens).toHaveBeenCalledWith({
        account: { owner: mockIdentity.getPrincipal() },
        identity: mockIdentity,
        range: {
          from: beginningOfYearInNanoseconds,
        },
      });
    });

    it("should fetch last-year transactions when selecting such option", async () => {
      const beginningOfYear = new Date("2023-01-01T00:00:00Z");
      const beginningOfLastYear = new Date("2022-01-01T00:00:00Z");
      const NANOS_IN_MS = BigInt(1_000_000);
      const beginningOfYearInNanoseconds =
        BigInt(beginningOfYear.getTime()) * NANOS_IN_MS;

      const beginningOfLastYearInNanoseconds =
        BigInt(beginningOfLastYear.getTime()) * NANOS_IN_MS;

      const po = renderComponent();
      await po.getReportingSourceSelectorPo().selectProvidedOption("ck");
      await po
        .getReportingDateRangeSelectorPo()
        .selectProvidedOption("last-year");
      await po.getReportingTransactionsButtonPo().click();

      expect(getAllIcrcTransactionsForCkTokens).toHaveBeenCalledTimes(1);
      expect(getAllIcrcTransactionsForCkTokens).toHaveBeenCalledWith({
        account: { owner: mockIdentity.getPrincipal() },
        identity: mockIdentity,
        range: {
          from: beginningOfLastYearInNanoseconds,
          to: beginningOfYearInNanoseconds,
        },
      });
    });
  });
});
