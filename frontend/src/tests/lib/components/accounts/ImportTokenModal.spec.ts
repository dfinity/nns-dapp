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
import { importedTokensStore } from "$lib/stores/imported-tokens.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { page } from "$mocks/$app/stores";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { ImportTokenModalPo } from "$tests/page-objects/ImportTokenModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { busyStore, toastsStore } from "@dfinity/gix-components";
import { tick } from "svelte";
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
      expect(get(pageStore)).toMatchObject({
        path: AppPath.Tokens,
        universe: OWN_CANISTER_ID_TEXT,
      });

      await formPo.getSubmitButtonPo().click();

      expect(get(pageStore)).toMatchObject({
        path: AppPath.Wallet,
        universe: ledgerCanisterId.toText(),
      });
      expect(get(busyStore)).toEqual([]);
      expect(get(toastsStore)).toMatchObject([
        {
          level: "warn",
          text: "You have already imported this token, you can find it in the token list.",
        },
      ]);
      expect(queryIcrcTokenSpy).toBeCalledTimes(0);
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
    let resolveQueryIcrcToken: () => void;
    vi.spyOn(ledgerApi, "queryIcrcToken").mockImplementation(
      () =>
        new Promise(
          (resolve) => (resolveQueryIcrcToken = () => resolve(tokenMetaData))
        )
    );

    const po = renderComponent();
    const formPo = po.getImportTokenFormPo();

    await formPo.getLedgerCanisterInputPo().typeText(ledgerCanisterId.toText());
    await formPo.getSubmitButtonPo().click();
    await runResolvedPromises();

    expect(get(busyStore)).toEqual([
      {
        initiator: "import-token-validation",
        text: "Verifying token details...",
      },
    ]);

    // Wait for toast error to be called.
    resolveQueryIcrcToken();
    await runResolvedPromises();
    await tick();

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
    await tick();

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
    await tick();

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
    await tick();

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
    let resolveSetImportedTokens: () => void;
    const setImportedTokensSpy = vi
      .spyOn(importedTokensApi, "setImportedTokens")
      .mockImplementation(
        () => new Promise((resolve) => (resolveSetImportedTokens = resolve))
      );

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
    await tick();

    expect(await formPo.isPresent()).toEqual(false);
    expect(getImportedTokensSpy).toBeCalledTimes(0);
    expect(setImportedTokensSpy).toBeCalledTimes(0);

    await reviewPo.getConfirmButtonPo().click();
    await runResolvedPromises();

    expect(get(busyStore)).toEqual([
      {
        initiator: "import-token-importing",
        text: "Importing new token...",
      },
    ]);

    resolveSetImportedTokens();
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
    await tick();

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
    await tick();

    expect(get(pageStore).path).toEqual(AppPath.Tokens);

    await reviewPo.getConfirmButtonPo().click();
    await runResolvedPromises();

    expect(get(pageStore).path).toEqual(AppPath.Tokens);
  });

  describe("Import token by URL", () => {
    beforeEach(() => {
      page.mock({
        routeId: AppPath.Tokens,
        data: {
          universe: OWN_CANISTER_ID_TEXT,
          importTokenLedgerId: ledgerCanisterId.toText(),
          importTokenIndexId: indexCanisterId.toText(),
        },
      });
    });

    it("imports from URL", async () => {
      vi.spyOn(importedTokensApi, "getImportedTokens").mockResolvedValue({
        imported_tokens: [],
      });
      const setImportedTokensSpy = vi
        .spyOn(importedTokensApi, "setImportedTokens")
        .mockResolvedValue();

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

      // it should wait for the imported tokens to be loaded before validating
      importedTokensStore.set({
        importedTokens: [],
        certified: true,
      });
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

    it("removes the URL parameters on cancel click", async () => {
      vi.spyOn(console, "error").mockReturnValue();
      queryIcrcTokenSpy = vi
        .spyOn(ledgerApi, "queryIcrcToken")
        .mockRejectedValue(new Error());

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

      await runResolvedPromises();

      expect(await formPo.isPresent()).toEqual(true);
      expect(await reviewPo.isPresent()).toEqual(false);

      expect(get(pageStore)).toMatchObject({
        path: AppPath.Tokens,
        universe: OWN_CANISTER_ID_TEXT,
        importTokenLedgerId: ledgerCanisterId.toText(),
        importTokenIndexId: indexCanisterId.toText(),
      });

      await formPo.getCancelButtonPo().click();
      await runResolvedPromises();

      expect(get(pageStore)).toMatchObject({
        path: AppPath.Tokens,
        universe: OWN_CANISTER_ID_TEXT,
        importTokenLedgerId: undefined,
        importTokenIndexId: undefined,
      });
    });

    it("should navigate to the imported token page when importing a duplicate", async () => {
      importedTokensStore.set({
        importedTokens: [
          {
            // same ledger canister ID
            ledgerCanisterId,
            indexCanisterId: undefined,
          },
        ],
        certified: true,
      });

      renderComponent();
      await runResolvedPromises();

      expect(get(pageStore)).toMatchObject({
        importTokenLedgerId: undefined,
        importTokenIndexId: undefined,
        path: AppPath.Wallet,
        universe: ledgerCanisterId.toText(),
      });

      expect(get(toastsStore)).toMatchObject([
        {
          level: "warn",
          text: "You have already imported this token, you can find it in the token list.",
        },
      ]);
    });

    it("should navigate to tokens on close w/o query params", async () => {
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

      await runResolvedPromises();

      expect(get(pageStore)).toMatchObject({
        importTokenLedgerId: ledgerCanisterId.toText(),
        importTokenIndexId: indexCanisterId.toText(),
        path: AppPath.Tokens,
      });

      expect(await formPo.isPresent()).toEqual(false);
      expect(await reviewPo.isPresent()).toEqual(true);

      await po.closeModal();
      expect(get(pageStore)).toMatchObject({
        importTokenLedgerId: undefined,
        importTokenIndexId: undefined,
        path: AppPath.Tokens,
      });
    });

    it("catches duplications", async () => {
      importedTokensStore.set({
        importedTokens: [
          {
            // same ledger canister ID
            ledgerCanisterId,
            indexCanisterId: undefined,
          },
        ],
        certified: true,
      });

      renderComponent();
      await runResolvedPromises();

      expect(get(pageStore)).toMatchObject({
        importTokenLedgerId: undefined,
        importTokenIndexId: undefined,
        path: AppPath.Wallet,
        universe: ledgerCanisterId.toText(),
      });

      expect(get(toastsStore)).toMatchObject([
        {
          level: "warn",
          text: "You have already imported this token, you can find it in the token list.",
        },
      ]);
    });

    it("catches invalid canister ID formats from URL", async () => {
      const pageData = {
        routeId: AppPath.Tokens,
        data: {
          universe: OWN_CANISTER_ID_TEXT,
          importTokenLedgerId: "INVALID_CANISTER_ID",
          importTokenIndexId: indexCanisterId.toText(),
        },
      };
      page.mock(pageData);

      const consoleErrorSpy = vi.spyOn(console, "error").mockReturnValue();
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

      await runResolvedPromises();

      // Imitate the second page emission
      page.mock(pageData);
      await runResolvedPromises();

      // Should stay on the form
      expect(await formPo.isPresent()).toEqual(true);
      expect(await reviewPo.isPresent()).toEqual(false);

      expect(consoleErrorSpy).toBeCalledTimes(1);
      expectToastError(
        'Importing the token was unsuccessful because "INVALID_CANISTER_ID" is not a valid canister ID. Please verify the ID and retry.'
      );
      expect(consoleErrorSpy).toBeCalledWith(
        new Error(`Invalid character: "_"`)
      );
    });
  });
});
