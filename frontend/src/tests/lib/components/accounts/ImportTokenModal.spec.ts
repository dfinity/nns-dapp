import * as icrcIndexApi from "$lib/api/icrc-index.api";
import * as ledgerApi from "$lib/api/icrc-ledger.api";
import * as importedTokensApi from "$lib/api/imported-tokens.api";
import {
  LEDGER_CANISTER_ID,
  OWN_CANISTER_ID_TEXT,
} from "$lib/constants/canister-ids.constants";
import { CKBTC_LEDGER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import ImportTokenModal from "$lib/modals/accounts/ImportTokenModal.svelte";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { importedTokensStore } from "$lib/stores/imported-tokens.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { page } from "$mocks/$app/stores";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { ImportTokenModalPo } from "$tests/page-objects/ImportTokenModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { busyStore, toastsStore } from "@dfinity/gix-components";
import { get } from "svelte/store";
import type { MockInstance } from "vitest";

const expectToastError = (contained: string) =>
  expect(get(toastsStore)).toMatchObject([
    {
      level: "error",
      text: expect.stringContaining(contained),
    },
  ]);

describe("ImportTokenModal", () => {
  const ledgerCanisterId = principal(0);
  const indexCanisterId = principal(1);
  const tokenMetaData = {
    name: "Tetris",
    symbol: "TET",
    logo: "https://tetris.tet/logo.png",
  } as IcrcTokenMetadata;

  const renderComponent = () => {
    const { container } = render(ImportTokenModal);
    const po = ImportTokenModalPo.under(new JestPageObjectElement(container));

    return po;
  };
  let queryIcrcTokenSpy: MockInstance;

  beforeEach(() => {
    resetIdentity();
    resetSnsProjects();
    busyStore.resetForTesting();

    queryIcrcTokenSpy = vi
      .spyOn(ledgerApi, "queryIcrcToken")
      .mockResolvedValue(tokenMetaData);

    vi.spyOn(icrcIndexApi, "getLedgerId").mockResolvedValue(ledgerCanisterId);
    page.mock({
      routeId: AppPath.Tokens,
    });
  });

  it("should display modal title", async () => {
    const po = renderComponent();

    expect(await po.getModalTitle()).toEqual("Import Token");
  });

  describe("Form Step", () => {
    it("should catch icp", async () => {
      const po = renderComponent();
      const formPo = po.getImportTokenFormPo();

      await formPo
        .getLedgerCanisterInputPo()
        .typeText(LEDGER_CANISTER_ID.toText());

      expect(queryIcrcTokenSpy).toBeCalledTimes(0);
      expect(await formPo.isPresent()).toEqual(true);

      await formPo.getSubmitButtonPo().click();

      expect(get(busyStore)).toEqual([]);
      expectToastError("You cannot import ICP.");
      expect(queryIcrcTokenSpy).toBeCalledTimes(0);
      // Stays on the form.
      expect(await formPo.isPresent()).toEqual(true);
    });

    it("should catch duplications", async () => {
      importedTokensStore.set({
        importedTokens: [
          {
            ledgerCanisterId,
            indexCanisterId: undefined,
          },
        ],
        certified: true,
      });
      const po = renderComponent();
      const formPo = po.getImportTokenFormPo();

      await formPo
        .getLedgerCanisterInputPo()
        .typeText(ledgerCanisterId.toText());

      expect(queryIcrcTokenSpy).toBeCalledTimes(0);
      expect(await formPo.isPresent()).toEqual(true);

      await formPo.getSubmitButtonPo().click();

      expect(get(busyStore)).toEqual([]);
      expectToastError(
        "You have already imported this token, you can find it in the token list."
      );
      expect(queryIcrcTokenSpy).toBeCalledTimes(0);
      // Stays on the form.
      expect(await formPo.isPresent()).toEqual(true);
    });

    it("should catch importing of Snses", async () => {
      setSnsProjects([
        {
          ledgerCanisterId,
        },
      ]);

      const po = renderComponent();
      const formPo = po.getImportTokenFormPo();

      await formPo
        .getLedgerCanisterInputPo()
        .typeText(ledgerCanisterId.toText());

      expect(queryIcrcTokenSpy).toBeCalledTimes(0);
      expect(await formPo.isPresent()).toEqual(true);

      await formPo.getSubmitButtonPo().click();

      expect(get(busyStore)).toEqual([]);
      expectToastError(
        "You cannot import SNS tokens, they are added by the NNS."
      );
      expect(queryIcrcTokenSpy).toBeCalledTimes(0);
      // Stays on the form.
      expect(await formPo.isPresent()).toEqual(true);
    });

    it("should catch importing of an Important token", async () => {
      const po = renderComponent();
      const formPo = po.getImportTokenFormPo();

      await formPo
        .getLedgerCanisterInputPo()
        .typeText(CKBTC_LEDGER_CANISTER_ID.toText());

      expect(queryIcrcTokenSpy).toBeCalledTimes(0);
      expect(await formPo.isPresent()).toEqual(true);

      await formPo.getSubmitButtonPo().click();

      expect(get(busyStore)).toEqual([]);
      expectToastError("This token is already in the token list.");
      expect(queryIcrcTokenSpy).toBeCalledTimes(0);
      // Stays on the form.
      expect(await formPo.isPresent()).toEqual(true);
    });

    it("should fetch meta data", async () => {
      const po = renderComponent();
      const formPo = po.getImportTokenFormPo();

      await formPo
        .getLedgerCanisterInputPo()
        .typeText(ledgerCanisterId.toText());

      expect(queryIcrcTokenSpy).toBeCalledTimes(0);
      expect(get(busyStore)).toEqual([]);

      await formPo.getSubmitButtonPo().click();

      expect(queryIcrcTokenSpy).toBeCalledTimes(1);
    });

    it("should catch not a ledger canister id", async () => {
      vi.spyOn(console, "error").mockReturnValue();
      const error = new Error("Not a ledger canister");
      vi.spyOn(ledgerApi, "queryIcrcToken").mockRejectedValue(error);
      const po = renderComponent();
      const formPo = po.getImportTokenFormPo();

      await formPo
        .getLedgerCanisterInputPo()
        .typeText(ledgerCanisterId.toText());
      await formPo.getSubmitButtonPo().click();

      // Wait for toast error to be called.
      await runResolvedPromises();

      expectToastError(
        "Unable to load token details using the provided ledger canister ID. Not a ledger canister"
      );

      // Stays on the form.
      expect(await formPo.isPresent()).toEqual(true);
    });

    it("should catch unmatched ledger to index canister IDs", async () => {
      vi.spyOn(icrcIndexApi, "getLedgerId").mockResolvedValue(principal(666));

      const po = renderComponent();
      const formPo = po.getImportTokenFormPo();

      await formPo
        .getLedgerCanisterInputPo()
        .typeText(ledgerCanisterId.toText());
      await formPo.getIndexCanisterInputPo().typeText(indexCanisterId.toText());
      await formPo.getSubmitButtonPo().click();

      // Wait for toast error to be called.
      await runResolvedPromises();

      expectToastError(
        "The provided index canister ID does not match the associated ledger canister ID."
      );
      // Stays on the form.
      expect(await formPo.isPresent()).toEqual(true);
    });
  });

  it("should leave the form after successful validation", async () => {
    const po = renderComponent();
    const formPo = po.getImportTokenFormPo();

    await formPo.getLedgerCanisterInputPo().typeText(ledgerCanisterId.toText());
    await formPo.getSubmitButtonPo().click();

    expect(get(busyStore)).toEqual([
      {
        initiator: "import-token-validation",
        text: "Verifying token details...",
      },
    ]);

    // Wait for toast error to be called.
    await runResolvedPromises();

    expect(get(busyStore)).toEqual([]);
    expect(await formPo.isPresent()).toEqual(false);
  });

  it("should display entered canisters info on the review step", async () => {
    const po = renderComponent();
    const formPo = po.getImportTokenFormPo();
    const reviewPo = po.getImportTokenReviewPo();

    await formPo.getLedgerCanisterInputPo().typeText(ledgerCanisterId.toText());
    await formPo.getIndexCanisterInputPo().typeText(indexCanisterId.toText());
    await formPo.getSubmitButtonPo().click();

    // Wait for ModalWizard step animation.
    await runResolvedPromises();

    expect(await reviewPo.isPresent()).toEqual(true);
    expect(await reviewPo.getLedgerCanisterIdPo().getCanisterIdText()).toEqual(
      ledgerCanisterId.toText()
    );
    expect(await reviewPo.getIndexCanisterIdPo().getCanisterIdText()).toEqual(
      indexCanisterId.toText()
    );
    expect(
      await reviewPo.getIndexCanisterIdPo().getCanisterIdFallback().isPresent()
    ).toEqual(false);

    expect(await reviewPo.getTokenName()).toEqual(tokenMetaData.name);
    expect(await reviewPo.getTokenSymbol()).toEqual(tokenMetaData.symbol);
    expect(await reviewPo.getLogoSource()).toEqual(tokenMetaData.logo);
  });

  it("should display a fallback text for the index canister when it's not entered", async () => {
    const po = renderComponent();
    const formPo = po.getImportTokenFormPo();
    const reviewPo = po.getImportTokenReviewPo();

    await formPo.getLedgerCanisterInputPo().typeText(ledgerCanisterId.toText());
    await formPo.getSubmitButtonPo().click();

    // Wait for ModalWizard step animation.
    await runResolvedPromises();

    expect(
      await reviewPo.getIndexCanisterIdPo().getCanisterId().isPresent()
    ).toEqual(false);
    expect(
      await reviewPo.getIndexCanisterIdPo().getCanisterIdFallback().isPresent()
    ).toEqual(true);
    expect(
      await reviewPo.getIndexCanisterIdPo().getCanisterIdFallbackText()
    ).toEqual("Transaction history won't be displayed.");
  });

  it('should navigate back to form on "Back" button click', async () => {
    const po = renderComponent();
    const formPo = po.getImportTokenFormPo();
    const reviewPo = po.getImportTokenReviewPo();

    expect(await formPo.isPresent()).toEqual(true);
    expect(await reviewPo.isPresent()).toEqual(false);

    await formPo.getLedgerCanisterInputPo().typeText(ledgerCanisterId.toText());
    await formPo.getSubmitButtonPo().click();

    // Wait for ModalWizard step animation.
    await runResolvedPromises();

    expect(await formPo.isPresent()).toEqual(false);
    expect(await reviewPo.isPresent()).toEqual(true);

    await reviewPo.getBackButtonPo().click();

    expect(await formPo.isPresent()).toEqual(true);
    expect(await reviewPo.isPresent()).toEqual(false);
  });

  it("should save imported token", async () => {
    const getImportedTokensSpy = vi
      .spyOn(importedTokensApi, "getImportedTokens")
      .mockResolvedValue({
        imported_tokens: [],
      });
    const setImportedTokensSpy = vi
      .spyOn(importedTokensApi, "setImportedTokens")
      .mockResolvedValue();

    importedTokensStore.set({
      importedTokens: [],
      certified: true,
    });
    const po = renderComponent();
    const formPo = po.getImportTokenFormPo();
    const reviewPo = po.getImportTokenReviewPo();

    expect(await formPo.isPresent()).toEqual(true);
    expect(await reviewPo.isPresent()).toEqual(false);

    await formPo.getLedgerCanisterInputPo().typeText(ledgerCanisterId.toText());
    await formPo.getIndexCanisterInputPo().typeText(indexCanisterId.toText());
    await formPo.getSubmitButtonPo().click();

    // Wait for ModalWizard step animation.
    await runResolvedPromises();

    expect(await formPo.isPresent()).toEqual(false);
    expect(getImportedTokensSpy).toBeCalledTimes(0);
    expect(setImportedTokensSpy).toBeCalledTimes(0);

    await reviewPo.getConfirmButtonPo().click();

    expect(get(busyStore)).toEqual([
      {
        initiator: "import-token-importing",
        text: "Importing new token...",
      },
    ]);

    await runResolvedPromises();

    expect(get(busyStore)).toEqual([]);

    expect(setImportedTokensSpy).toBeCalledTimes(1);
    expect(setImportedTokensSpy).toBeCalledWith({
      identity: mockIdentity,
      importedTokens: [
        {
          index_canister_id: [indexCanisterId],
          ledger_canister_id: ledgerCanisterId,
        },
      ],
    });
    expect(getImportedTokensSpy).toBeCalledTimes(2);
    expect(getImportedTokensSpy).toHaveBeenNthCalledWith(1, {
      identity: mockIdentity,
      certified: false,
    });
    expect(getImportedTokensSpy).toHaveBeenNthCalledWith(2, {
      identity: mockIdentity,
      certified: true,
    });
  });

  it("should navigate to the imported token page after saving", async () => {
    vi.spyOn(importedTokensApi, "getImportedTokens").mockResolvedValue({
      imported_tokens: [],
    });
    vi.spyOn(importedTokensApi, "setImportedTokens").mockResolvedValue();
    importedTokensStore.set({
      importedTokens: [],
      certified: true,
    });
    const po = renderComponent();
    const formPo = po.getImportTokenFormPo();
    const reviewPo = po.getImportTokenReviewPo();

    await formPo.getLedgerCanisterInputPo().typeText(ledgerCanisterId.toText());
    await formPo.getSubmitButtonPo().click();

    // Wait for ModalWizard step animation.
    await runResolvedPromises();

    expect(get(pageStore).path).toEqual(AppPath.Tokens);

    await reviewPo.getConfirmButtonPo().click();
    await runResolvedPromises();

    expect(get(pageStore)).toEqual({
      path: AppPath.Wallet,
      universe: ledgerCanisterId.toText(),
    });
  });

  it("should stay on the token page when an error occurs during saving", async () => {
    vi.spyOn(console, "error").mockReturnValue();
    vi.spyOn(importedTokensApi, "getImportedTokens").mockResolvedValue({
      imported_tokens: [],
    });
    vi.spyOn(importedTokensApi, "setImportedTokens").mockRejectedValue(
      new Error("test")
    );
    importedTokensStore.set({
      importedTokens: [],
      certified: true,
    });
    const po = renderComponent();
    const formPo = po.getImportTokenFormPo();
    const reviewPo = po.getImportTokenReviewPo();

    await formPo.getLedgerCanisterInputPo().typeText(ledgerCanisterId.toText());
    await formPo.getSubmitButtonPo().click();

    // Wait for ModalWizard step animation.
    await runResolvedPromises();

    expect(get(pageStore).path).toEqual(AppPath.Tokens);

    await reviewPo.getConfirmButtonPo().click();
    await runResolvedPromises();

    expect(get(pageStore).path).toEqual(AppPath.Tokens);
  });

  describe.only("Import token by URL", () => {
    beforeEach(() => {
      page.mock({
        routeId: AppPath.Tokens,
        data: {
          universe: OWN_CANISTER_ID_TEXT,
          importTokenLedgerId: ledgerCanisterId.toText(),
          importTokenIndexId: indexCanisterId.toText(),
        },
      });
      overrideFeatureFlagsStore.setFlag("ENABLE_IMPORT_TOKEN_BY_URL", true);
    });

    it("imports from URL", async () => {
      vi.spyOn(importedTokensApi, "getImportedTokens").mockResolvedValue({
        imported_tokens: [],
      });
      const setImportedTokensSpy = vi
        .spyOn(importedTokensApi, "setImportedTokens")
        .mockResolvedValue();

      importedTokensStore.set({
        importedTokens: [],
        certified: true,
      });

      const po = renderComponent();
      const formPo = po.getImportTokenFormPo();
      const reviewPo = po.getImportTokenReviewPo();

      await runResolvedPromises();

      // Should be on review step
      expect(await formPo.isPresent()).toEqual(false);
      expect(await reviewPo.isPresent()).toEqual(true);
      // With fetched token data
      expect(
        await reviewPo.getLedgerCanisterIdPo().getCanisterIdText()
      ).toEqual(ledgerCanisterId.toText());
      expect(await reviewPo.getIndexCanisterIdPo().getCanisterIdText()).toEqual(
        indexCanisterId.toText()
      );
      expect(await reviewPo.getTokenName()).toEqual(tokenMetaData.name);
      expect(await reviewPo.getTokenSymbol()).toEqual(tokenMetaData.symbol);
      expect(await reviewPo.getLogoSource()).toEqual(tokenMetaData.logo);
      expect(setImportedTokensSpy).toBeCalledTimes(0);

      await reviewPo.getConfirmButtonPo().click();

      await runResolvedPromises();

      expect(setImportedTokensSpy).toBeCalledTimes(1);
      expect(setImportedTokensSpy).toBeCalledWith({
        identity: mockIdentity,
        importedTokens: [
          {
            index_canister_id: [indexCanisterId],
            ledger_canister_id: ledgerCanisterId,
          },
        ],
      });
    });

    it("should wait for imported tokens to be loaded before validation", async () => {
      const po = renderComponent();
      const formPo = po.getImportTokenFormPo();
      const reviewPo = po.getImportTokenReviewPo();

      await runResolvedPromises();

      expect(await formPo.isPresent()).toEqual(true);
      expect(await reviewPo.isPresent()).toEqual(false);
      expect(await formPo.getLedgerCanisterInputPo().getValue()).toEqual(
        ledgerCanisterId.toText()
      );
      expect(await formPo.getIndexCanisterInputPo().getValue()).toEqual(
        indexCanisterId.toText()
      );

      expect(get(toastsStore)).toMatchObject([]);

      // Return the same token ledger ID
      // (imported tokens are loaded on page load, so we need to mock the store update)
      importedTokensStore.set({
        importedTokens: [
          {
            ledgerCanisterId,
            indexCanisterId: undefined,
          },
        ],
        certified: true,
      });

      await runResolvedPromises();

      expect(await formPo.isPresent()).toEqual(true);
      expect(await reviewPo.isPresent()).toEqual(false);

      expectToastError(
        "You have already imported this token, you can find it in the token list."
      );
    });
  });
});
