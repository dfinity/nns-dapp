import * as icpIndexApi from "$lib/api/icp-index.api";
import ReportingTransactionsButton from "$lib/components/reporting/ReportingTransactionsButton.svelte";
import * as toastsStore from "$lib/stores/toasts.store";
import * as exportToCsv from "$lib/utils/export-to-csv.utils";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockAccountsStoreData } from "$tests/mocks/icp-accounts.store.mock";
import { createTransactionWithId } from "$tests/mocks/icp-transactions.mock";
import { ReportingTransactionsButtonPo } from "$tests/page-objects/ReportingTransactionsButton.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import {
  resetAccountsForTesting,
  setAccountsForTesting,
} from "$tests/utils/accounts.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";

vi.mock("$lib/api/icp-ledger.api");

describe("ExportIcpTransactionsButton", () => {
  let spyGenerateCsvFileToSave;
  let spyToastError;

  beforeEach(() => {
    vi.clearAllTimers();

    spyGenerateCsvFileToSave = vi
      .spyOn(exportToCsv, "generateCsvFileToSave")
      .mockImplementation(() => Promise.resolve());
    spyToastError = vi.spyOn(toastsStore, "toastsError");
    vi.spyOn(console, "error").mockImplementation(() => {});

    const mockDate = new Date("2023-10-14T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    resetIdentity();

    setAccountsForTesting({
      ...mockAccountsStoreData,
    });

    const mockTransactions = [
      createTransactionWithId({}),
      createTransactionWithId({
        id: 1n,
      }),
    ];

    vi.spyOn(icpIndexApi, "getTransactions").mockResolvedValue({
      transactions: mockTransactions,
      balance: 0n,
      oldestTxId: 1n,
    });
  });

  const renderComponent = ({ onTrigger }: { onTrigger?: () => void } = {}) => {
    const { container, component } = render(ReportingTransactionsButton);

    const po = ReportingTransactionsButtonPo.under({
      element: new JestPageObjectElement(container),
    });

    if (onTrigger) {
      component.$on("nnsExportIcpTransactionsCsvTriggered", onTrigger);
    }
    return po;
  };

  it("should be disabled when there is no identity", async () => {
    setNoIdentity();
    const po = renderComponent();
    expect(await po.isDisabled()).toBe(true);
  });

  it("should be disabled when there is no accounts nor neurons", async () => {
    resetAccountsForTesting();
    const po = renderComponent();
    expect(await po.isDisabled()).toBe(true);
  });

  it("should name the file with the date of the export", async () => {
    const po = renderComponent();

    expect(await po.isDisabled()).toBe(false);
    expect(spyGenerateCsvFileToSave).toHaveBeenCalledTimes(0);

    await po.click();
    await runResolvedPromises();

    const expectedFileName = `icp_transactions_export_20231014`;
    expect(spyGenerateCsvFileToSave).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: expectedFileName,
      })
    );
    expect(spyGenerateCsvFileToSave).toHaveBeenCalledTimes(1);
  });

  it("should transform transaction data correctly", async () => {
    const po = renderComponent();

    expect(spyGenerateCsvFileToSave).toBeCalledTimes(0);
    await po.click();
    await runResolvedPromises();

    expect(spyGenerateCsvFileToSave).toBeCalledWith(
      expect.objectContaining({
        datasets: expect.arrayContaining([
          {
            data: expect.arrayContaining([
              {
                amount: "-1.0001",
                from: "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f",
                id: "1234",
                project: "Internet Computer",
                symbol: "ICP",
                timestamp: "Jan 1, 2023 12:00 AM",
                to: "d0654c53339c85e0e5fff46a2d800101bc3d896caef34e1a0597426792ff9f32",
                type: "Sent",
              },
            ]),
            metadata: [
              {
                label: "Account ID",
                value:
                  "d4685b31b51450508aff0331584df7692a84467b680326f5c5f7d30ae711682f",
              },
              {
                label: "Account Name",
                value: "Main",
              },
              {
                label: "Balance(ICP)",
                value: "1'234'567.8901",
              },
              {
                label: "Controller Principal ID",
                value:
                  "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe",
              },
              {
                label: "Transactions",
                value: "2",
              },
              {
                label: "Export Date Time",
                value: "Oct 14, 2023 12:00 AM",
              },
            ],
          },
        ]),
      })
    );
    expect(spyGenerateCsvFileToSave).toBeCalledTimes(1);
  });

  it("should dispatch nnsExportIcpTransactionsCsvTriggered event after click to close the menu", async () => {
    const onTrigger = vi.fn();
    const po = renderComponent({ onTrigger });

    expect(onTrigger).toHaveBeenCalledTimes(0);

    await po.click();
    await runResolvedPromises();
    expect(onTrigger).toHaveBeenCalledTimes(1);
  });

  it("should show error toast when file system access fails", async () => {
    vi.spyOn(exportToCsv, "generateCsvFileToSave").mockRejectedValueOnce(
      new exportToCsv.FileSystemAccessError("File system access denied")
    );

    const po = renderComponent();

    expect(spyToastError).toBeCalledTimes(0);

    await po.click();
    await runResolvedPromises();

    expect(spyToastError).toBeCalledWith({
      labelKey: "export_error.file_system_access",
    });
    expect(spyToastError).toBeCalledTimes(1);
  });

  it("should show error toast when Csv generation fails", async () => {
    vi.spyOn(exportToCsv, "generateCsvFileToSave").mockRejectedValueOnce(
      new exportToCsv.CsvGenerationError("Csv generation failed")
    );

    const po = renderComponent();

    expect(spyToastError).toBeCalledTimes(0);

    await po.click();
    await runResolvedPromises();

    expect(spyToastError).toBeCalledWith({
      labelKey: "export_error.csv_generation",
    });
    expect(spyToastError).toBeCalledTimes(1);
  });

  it("should show error toast when file saving fails", async () => {
    vi.spyOn(exportToCsv, "generateCsvFileToSave").mockRejectedValueOnce(
      new Error("Something wrong happened")
    );

    const po = renderComponent();

    expect(spyToastError).toBeCalledTimes(0);
    await po.click();
    await runResolvedPromises();

    expect(spyToastError).toBeCalledWith({
      labelKey: "export_error.neurons",
    });
    expect(spyToastError).toBeCalledTimes(1);
  });
});
