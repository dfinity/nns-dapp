import * as icpIndexApi from "$lib/api/icp-index.api";
import ExportIcpTransactionsButton from "$lib/components/header/ExportIcpTransactionsButton.svelte";
import { authStore } from "$lib/stores/auth.store";
import * as toastsStore from "$lib/stores/toasts.store";
import { generateCsvFileToSave } from "$lib/utils/export-to-csv.utils";
import { mockPrincipal, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockAccountsStoreData } from "$tests/mocks/icp-accounts.store.mock";
import { createTransactionWithId } from "$tests/mocks/icp-transactions.mock";
import { MockLedgerIdentity } from "$tests/mocks/ledger.identity.mock";
import { ExportIcpTransactionsButtonPo } from "$tests/page-objects/ExportIcpTransactionsButton.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { render } from "@testing-library/svelte";
import { tick } from "svelte";

vi.mock("$lib/api/icp-ledger.api");

describe("ExportIcpTransactionsButton", () => {
  let spyGenerateCsvFileToSave;

  beforeEach(() => {
    vi.clearAllTimers();

    // spyGenerateCsvFileToSave = vi
    //   .spyOn(exportToCsv, "generateCsvFileToSave")
    //   .mockImplementation(() => Promise.resolve());
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

    const mockTransactions = [
      createTransactionWithId({}),
      createTransactionWithId({ id: 1n }),
    ];

    vi.spyOn(icpIndexApi, "getTransactions").mockResolvedValue({
      transactions: mockTransactions,
      balance: 0n,
      oldestTxId: 1n,
    });
    vi.mock("$lib/utils/export-to-csv.utils", () => ({
      generateCsvFileToSave: vi.fn().mockResolvedValue(undefined),
    }));
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
    vi.useRealTimers();

    const po = renderComponent();

    expect(await po.isDisabled()).toBe(false);
    expect(generateCsvFileToSave).toBeCalledTimes(0);

    await po.click();
    await tick();

    const expectedFileName = `icp_transactions_export_20241205`;
    expect(generateCsvFileToSave).toBeCalledWith(
      expect.objectContaining({
        fileName: expectedFileName,
      })
    );
    expect(generateCsvFileToSave).toHaveBeenCalledTimes(1);
  });
});
