import * as ledgerApi from "$lib/api/icrc-ledger.api";
import ImportTokenModal from "$lib/modals/accounts/ImportTokenModal.svelte";
import * as busyServices from "$lib/stores/busy.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { principal } from "$tests/mocks/sns-projects.mock";
import { ImportTokenModalPo } from "$tests/page-objects/ImportTokenModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { SpyInstance } from "vitest";

describe("ImportTokenModal", () => {
  const ledgerCanisterId = principal(0);
  const indexCanisterId = principal(1);
  const tokenMetaData = {
    name: "Tetris",
    symbol: "TET",
    logo: "https://tetris.tet/logo.png",
  } as IcrcTokenMetadata;

  const renderComponent = () => {
    const { container, component } = render(ImportTokenModal);

    const onClose = vi.fn();
    component.$on("nnsClose", onClose);

    const po = ImportTokenModalPo.under(new JestPageObjectElement(container));

    return {
      po,
      formPo: po.getImportTokenFormPo(),
      reviewPo: po.getImportTokenReviewPo(),
      onClose,
    };
  };
  let queryIcrcTokenSpy: SpyInstance;

  beforeEach(() => {
    vi.restoreAllMocks();

    queryIcrcTokenSpy = vi
      .spyOn(ledgerApi, "queryIcrcToken")
      .mockResolvedValue(tokenMetaData);
  });

  it("should display modal", async () => {
    const { po } = renderComponent();

    expect(await po.getModalTitle()).toEqual("Import Token");
  });

  it("should call queryIcrcToken to get a token meta data", async () => {
    const { formPo } = renderComponent();

    await formPo.getLedgerCanisterInputPo().typeText(ledgerCanisterId.toText());

    expect(queryIcrcTokenSpy).not.toHaveBeenCalled();

    await formPo.getNextButtonPo().click();

    expect(queryIcrcTokenSpy).toBeCalledTimes(1);
  });

  it("should display a busy screen when fetching meta data", async () => {
    const startBusySpy = vi.spyOn(busyServices, "startBusy");
    const { formPo } = renderComponent();

    await formPo.getLedgerCanisterInputPo().typeText(ledgerCanisterId.toText());
    await formPo.getNextButtonPo().click();

    expect(startBusySpy).toHaveBeenCalledTimes(1);
    expect(startBusySpy).toHaveBeenCalledWith({
      initiator: "import-token-validation",
      labelKey: "import_token.verifying",
    });
  });

  it("should display entered canisters info on the review step", async () => {
    const { formPo, reviewPo } = renderComponent();

    await formPo.getLedgerCanisterInputPo().typeText(ledgerCanisterId.toText());
    await formPo.getIndexCanisterInputPo().typeText(indexCanisterId.toText());
    await formPo.getNextButtonPo().click();

    // Wait for ModalWizard step animation.
    await runResolvedPromises();

    expect(await reviewPo.getLedgerCanisterIdPo().getCanisterIdText()).toEqual(
      ledgerCanisterId.toText()
    );
    expect(await reviewPo.getIndexCanisterIdPo().getCanisterIdText()).toEqual(
      indexCanisterId.toText()
    );
    expect(await reviewPo.getTokenName()).toEqual(tokenMetaData.name);
    expect(await reviewPo.getTokenSymbol()).toEqual(tokenMetaData.symbol);
    expect(await reviewPo.getLogoSource()).toEqual(tokenMetaData.logo);
  });

  it('should navigate back to form on "Back" button click', async () => {
    const { formPo, reviewPo } = renderComponent();

    expect(await formPo.isPresent()).toEqual(true);
    expect(await reviewPo.isPresent()).toEqual(false);

    await formPo.getLedgerCanisterInputPo().typeText(ledgerCanisterId.toText());
    await formPo.getNextButtonPo().click();

    // Wait for ModalWizard step animation.
    await runResolvedPromises();

    expect(await formPo.isPresent()).toEqual(false);
    expect(await reviewPo.isPresent()).toEqual(true);

    await reviewPo.getBackButtonPo().click();

    expect(await formPo.isPresent()).toEqual(true);
    expect(await reviewPo.isPresent()).toEqual(false);
  });
});
