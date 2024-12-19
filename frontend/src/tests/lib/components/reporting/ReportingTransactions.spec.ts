import * as governanceApi from "$lib/api/governance.api";
import * as icpIndexApi from "$lib/api/icp-index.api";
import ReportingTransactions from "$lib/components/reporting/ReportingTransactions.svelte";
import * as exportDataService from "$lib/services/reporting.services";
import * as exportToCsv from "$lib/utils/reporting.utils";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockAccountsStoreData,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { ReportingTransactionsPo } from "$tests/page-objects/ReportingTransactions.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import {
  resetAccountsForTesting,
  setAccountsForTesting,
} from "$tests/utils/accounts.test-utils";
import { render } from "@testing-library/svelte";

vi.mock("$lib/api/icp-ledger.api");
vi.mock("$lib/api/governance.api");

describe("ReportingTransactions", () => {
  let getAccountTransactionsConcurrently;

  const renderComponent = () => {
    const { container } = render(ReportingTransactions);

    const po = ReportingTransactionsPo.under(
      new JestPageObjectElement(container)
    );
    return po;
  };

  beforeEach(() => {
    vi.clearAllTimers();
    resetIdentity();
    resetAccountsForTesting();

    vi.spyOn(exportToCsv, "generateCsvFileToSave").mockImplementation(() =>
      Promise.resolve()
    );
    vi.spyOn(governanceApi, "queryNeurons").mockResolvedValue([]);
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(icpIndexApi, "getTransactions").mockResolvedValue({
      transactions: [],
      balance: 0n,
      oldestTxId: 1n,
    });

    const mockDate = new Date("2023-10-14T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    setAccountsForTesting({
      ...mockAccountsStoreData,
    });

    getAccountTransactionsConcurrently = vi.spyOn(
      exportDataService,
      "getAccountTransactionsConcurrently"
    );
  });

  it("should fetch all transactions by default", async () => {
    const po = renderComponent();
    await po.getReportingTransactionsButtonPo().click();

    expect(getAccountTransactionsConcurrently).toHaveBeenCalledTimes(1);
    expect(getAccountTransactionsConcurrently).toHaveBeenCalledWith({
      entities: [mockMainAccount],
      identity: mockIdentity,
      range: {},
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
