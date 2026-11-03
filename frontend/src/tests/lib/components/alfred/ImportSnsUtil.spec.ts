import ImportSnsUtil from "$lib/components/alfred/ImportSnsUtil.svelte";
import * as importedSnsServices from "$lib/services/imported-sns.services";
import {
  importedSnsesStore,
  loadedImportedSnsesStore,
} from "$lib/stores/imported-snses.store";
import { ImportedSnsError } from "$lib/types/imported-sns.errors";
import { aggregatorSnsMockWith } from "$tests/mocks/sns-aggregator.mock";
import { mockSnsToken } from "$tests/mocks/sns-projects.mock";
import { ImportSnsUtilPo } from "$tests/page-objects/ImportSnsUtil.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { Principal } from "@icp-sdk/core/principal";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("ImportSnsUtil", () => {
  const rootCanisterId = "3e3x2-xyaaa-aaaaq-aaalq-cai";
  const otherRootCanisterId = "zxeu2-7aaaa-aaaaq-aaafa-cai";
  const sns = aggregatorSnsMockWith({
    rootCanisterId,
    projectName: "Test SNS",
    tokenMetadata: { ...mockSnsToken, symbol: "TST" },
  });

  const getSnsToImportSpy = () =>
    vi.spyOn(importedSnsServices, "getSnsToImport");
  const importSnsSpy = () => vi.spyOn(importedSnsServices, "importSns");

  const renderComponent = () => {
    const { container } = render(ImportSnsUtil);
    return ImportSnsUtilPo.under(new JestPageObjectElement(container));
  };

  const checkRootCanisterId = async (
    po: ImportSnsUtilPo,
    value = rootCanisterId
  ) => {
    await po.enterRootCanisterId(value);
    await po.clickCheck();
    await runResolvedPromises();
  };

  beforeEach(() => {
    getSnsToImportSpy().mockResolvedValue(sns);
    importSnsSpy().mockImplementation(async (rootCanisterId) => {
      importedSnsesStore.add(rootCanisterId.toText());
      loadedImportedSnsesStore.set({
        rootCanisterIds: get(importedSnsesStore),
        snses: [sns],
      });
    });
  });

  it("should disable the check button without a root canister ID", async () => {
    const po = renderComponent();

    expect(await po.isCheckButtonDisabled()).toBe(true);

    await po.enterRootCanisterId(rootCanisterId);

    expect(await po.isCheckButtonDisabled()).toBe(false);
  });

  it("should show an error for an invalid canister ID", async () => {
    const po = renderComponent();

    await checkRootCanisterId(po, "not-a-principal");

    expect(await po.getErrorText()).toBe("Enter a valid canister ID.");
    expect(getSnsToImportSpy()).not.toHaveBeenCalled();
  });

  it("should show the review after the checks", async () => {
    const po = renderComponent();

    await checkRootCanisterId(po);

    expect(getSnsToImportSpy()).toHaveBeenCalledTimes(1);
    expect(getSnsToImportSpy()).toHaveBeenCalledWith(
      Principal.fromText(rootCanisterId)
    );
    expect(await po.isReviewPresent()).toBe(true);
    expect(await po.getName()).toBe("Test SNS");
    expect(await po.getSymbol()).toBe("TST");
  });

  it.each([
    ["already-imported", "You already imported this SNS."],
    ["already-listed", "The NNS dapp already lists this SNS."],
    ["limit", "You can import up to 20 SNSes. Remove an SNS first."],
    [
      "missing-canisters",
      "This canister is not an SNS root canister. It does not list the governance, ledger, index and swap canisters.",
    ],
    ["controllers", "The SNS canisters do not have the controllers of an SNS."],
    [
      "minting-account",
      "The minting account of the ledger is not the governance canister.",
    ],
    ["governance-mode", "The governance canister is not in Normal mode."],
  ] as const)("should show the error for %s", async (reason, message) => {
    getSnsToImportSpy().mockRejectedValue(new ImportedSnsError(reason));
    const po = renderComponent();

    await checkRootCanisterId(po);

    expect(await po.getErrorText()).toBe(message);
    expect(await po.isReviewPresent()).toBe(false);
  });

  it("should show the error detail if the SNS fails to load", async () => {
    getSnsToImportSpy().mockRejectedValue(new Error("Canister not found"));
    const po = renderComponent();

    await checkRootCanisterId(po);

    expect(await po.getErrorText()).toBe(
      "The NNS dapp could not load this SNS. Canister not found"
    );
  });

  it("should import the SNS", async () => {
    const po = renderComponent();
    await checkRootCanisterId(po);

    await po.clickImport();
    await runResolvedPromises();

    expect(importSnsSpy()).toHaveBeenCalledTimes(1);
    expect(importSnsSpy()).toHaveBeenCalledWith(
      Principal.fromText(rootCanisterId)
    );
    expect(await po.isReviewPresent()).toBe(false);
    expect(await po.getImportedSnsTexts()).toEqual([
      `Test SNS ${rootCanisterId}`,
    ]);
  });

  it("should go back to the form without an import", async () => {
    const po = renderComponent();
    await checkRootCanisterId(po);

    await po.clickBack();

    expect(await po.isReviewPresent()).toBe(false);
    expect(importSnsSpy()).not.toHaveBeenCalled();
    expect(get(importedSnsesStore)).toEqual([]);
  });

  it("should list the imported SNSes with the root canister ID if an SNS did not load", async () => {
    importedSnsesStore.add(rootCanisterId);
    importedSnsesStore.add(otherRootCanisterId);
    loadedImportedSnsesStore.set({
      rootCanisterIds: [rootCanisterId, otherRootCanisterId],
      snses: [sns],
    });
    const po = renderComponent();

    expect(await po.getImportedSnsTexts()).toEqual([
      `Test SNS ${rootCanisterId}`,
      otherRootCanisterId,
    ]);

    const items = await po.getImportedSnsItemPos();
    expect(await items[0].getRemoveLabel()).toBe("Remove Test SNS");
    expect(await items[1].getRemoveLabel()).toBe(
      `Remove ${otherRootCanisterId}`
    );
  });

  it("should remove an imported SNS", async () => {
    importedSnsesStore.add(rootCanisterId);
    importedSnsesStore.add(otherRootCanisterId);
    const po = renderComponent();

    const items = await po.getImportedSnsItemPos();
    await items[1].clickRemove();

    expect(get(importedSnsesStore)).toEqual([rootCanisterId]);
    expect(await po.getImportedSnsTexts()).toEqual([rootCanisterId]);
  });
});
