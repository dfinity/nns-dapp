import * as icpIndexApi from "$lib/api/icp-index.api";
import ExportIcpTransactionsButton from "$lib/components/header/ExportIcpTransactionsButton.svelte";
import { authStore } from "$lib/stores/auth.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { toastsError } from "$lib/stores/toasts.store";
import * as exportToCsv from "$lib/utils/export-to-csv.utils";
import { generateCsvFileToSave } from "$lib/utils/export-to-csv.utils";
import { mockPrincipal, setNoIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockAccountsStoreData,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { createTransactionWithId } from "$tests/mocks/icp-transactions.mock";
import { MockLedgerIdentity } from "$tests/mocks/ledger.identity.mock";
import { mockTransactionWithId } from "$tests/mocks/transaction.mock";
import { ExportIcpTransactionsButtonPo } from "$tests/page-objects/ExportIcpTransactionsButton.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { render } from "@testing-library/svelte";

vi.mock("$lib/api/icp-ledger.api");
vi.mock("$lib/api/accounts.api");

describe("ExportIcpTransactionsButton", () => {
  const accountIdentifier = mockMainAccount.identifier;
  const props = {
    accountIdentifier,
  };
  const mainBalanceE8s = 10_000_000n;
  const firstPageTransactions = [
    { id: 1000n, transaction: mockTransactionWithId.transaction },
  ];
  const oldestTxId = 10n;
  const lastPageTransactions = [
    { id: oldestTxId, transaction: mockTransactionWithId.transaction },
  ];
  const accountTransactions = [mockTransactionWithId];

  let spyGetTransactions;

  beforeEach(() => {
    vi.clearAllTimers();
    vi.spyOn(exportToCsv, "generateCsvFileToSave").mockImplementation(vi.fn());
    vi.spyOn(toastsStore, "toastsError");
    // vi.spyOn(console, "error").mockImplementation(() => {});

    const mockDate = new Date("2023-10-14T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockDate));

    const mockSignInIdentity = new MockLedgerIdentity({
      principal: mockPrincipal,
    });
    authStore.setForTesting(mockSignInIdentity);

    setAccountsForTesting({
      ...mockAccountsStoreData,
    });

    spyGetTransactions = vi.spyOn(icpIndexApi, "getTransactions");
    const mockTransactions = [
      createTransactionWithId({}),
      createTransactionWithId({}),
    ];
    spyGetTransactions.mockResolvedValue({
      transactions: mockTransactions,
    });
  });

  const renderComponent = ({ onTrigger }: { onTrigger?: () => void } = {}) => {
    const { container, component } = render(ExportIcpTransactionsButton);

    const po = ExportIcpTransactionsButtonPo.under({
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

  it("should name the file with the date of the export", async () => {
    const po = renderComponent();

    expect(await po.isDisabled()).toBe(false);
    expect(generateCsvFileToSave).toBeCalledTimes(0);

    await po.click();

    const expectedFileName = `icp_transactions_export_20231014`;
    // expect(generateCsvFileToSave).toBeCalledWith(
    //   expect.objectContaining({
    //     fileName: expectedFileName,
    //   })
    // );
    expect(generateCsvFileToSave).toBeCalledTimes(1);
  });

  it("should transform neuron data correctly", async () => {
    const po = renderComponent();

    expect(generateCsvFileToSave).toBeCalledTimes(0);
    await po.click();
    expect(generateCsvFileToSave).toBeCalledWith(
      expect.objectContaining({
        datasets: expect.arrayContaining([
          expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({
                neuronId: "1",
                project: "Internet Computer",
                symbol: "ICP",
                neuronAccountId:
                  "d0654c53339c85e0e5fff46a2d800101bc3d896caef34e1a0597426792ff9f32",
                controllerId: "1",
                creationDate: "Jan 1, 1970",
                dissolveDate: "N/A",
                dissolveDelaySeconds: "3 hours, 5 minutes",
                stakedMaturity: "0",
                stake: "30.00",
                state: "Locked",
              }),
            ]),
          }),
        ]),
      })
    );
    expect(generateCsvFileToSave).toBeCalledTimes(1);
  });

  it("should dispatch nnsExportNeuronsCsvTriggered event after click to close the menu", async () => {
    const onTrigger = vi.fn();
    const po = renderComponent({ onTrigger });

    expect(onTrigger).toBeCalledTimes(0);
    await po.click();
    expect(onTrigger).toBeCalledTimes(1);
  });

  it("should show error toast when file system access fails", async () => {
    vi.spyOn(exportToCsv, "generateCsvFileToSave").mockRejectedValueOnce(
      new exportToCsv.FileSystemAccessError("File system access denied")
    );

    const po = renderComponent();

    expect(toastsError).toBeCalledTimes(0);
    await po.click();
    expect(toastsError).toBeCalledWith({
      labelKey: "export_error.file_system_access",
    });
    expect(toastsError).toBeCalledTimes(1);
  });

  it("should show error toast when Csv generation fails", async () => {
    vi.spyOn(exportToCsv, "generateCsvFileToSave").mockRejectedValueOnce(
      new exportToCsv.CsvGenerationError("Csv generation failed")
    );

    const po = renderComponent();

    expect(toastsError).toBeCalledTimes(0);
    await po.click();
    expect(toastsError).toBeCalledWith({
      labelKey: "export_error.csv_generation",
    });
    expect(toastsError).toBeCalledTimes(1);
  });

  it("should show error toast when file saving fails", async () => {
    vi.spyOn(exportToCsv, "generateCsvFileToSave").mockRejectedValueOnce(
      new Error("Something wrong happened")
    );

    const po = renderComponent();

    expect(toastsError).toBeCalledTimes(0);
    await po.click();
    expect(toastsError).toBeCalledWith({
      labelKey: "export_error.neurons",
    });
    expect(toastsError).toBeCalledTimes(1);
  });
});
