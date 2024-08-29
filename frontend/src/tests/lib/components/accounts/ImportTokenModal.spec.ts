import * as icrcIndexApi from "$lib/api/icrc-index.api";
import * as ledgerApi from "$lib/api/icrc-ledger.api";
import { CKBTC_LEDGER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import ImportTokenModal from "$lib/modals/accounts/ImportTokenModal.svelte";
import * as busyServices from "$lib/stores/busy.store";
import { importedTokensStore } from "$lib/stores/imported-tokens.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { ImportTokenModalPo } from "$tests/page-objects/ImportTokenModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { get } from "svelte/store";
import type { SpyInstance } from "vitest";

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
    const { container, component } = render(ImportTokenModal);

    const onClose = vi.fn();
    component.$on("nnsClose", onClose);

    const po = ImportTokenModalPo.under(new JestPageObjectElement(container));

    return {
      po,
      formPo: po.getImportTokenFormPo(),
      onClose,
    };
  };
  let queryIcrcTokenSpy: SpyInstance;

  beforeEach(() => {
    vi.restoreAllMocks();
    importedTokensStore.reset();
    resetIdentity();
    resetSnsProjects();
    toastsStore.reset();

    queryIcrcTokenSpy = vi
      .spyOn(ledgerApi, "queryIcrcToken")
      .mockResolvedValue(tokenMetaData);
  });

  it("should display modal title", async () => {
    const { po } = renderComponent();

    expect(await po.getModalTitle()).toEqual("Import Token");
  });

  describe("Form Step", () => {
    it("should catch duplications", async () => {
      const startBusySpy = vi.spyOn(busyServices, "startBusy");
      importedTokensStore.set({
        importedTokens: [
          {
            ledgerCanisterId,
            indexCanisterId: undefined,
          },
        ],
        certified: true,
      });
      const { formPo } = renderComponent();

      await formPo
        .getLedgerCanisterInputPo()
        .typeText(ledgerCanisterId.toText());

      expect(queryIcrcTokenSpy).toBeCalledTimes(0);
      expect(await formPo.isPresent()).toEqual(true);

      await formPo.getSubmitButtonPo().click();

      expect(startBusySpy).toBeCalledTimes(0);
      expectToastError(
        "You have already imported this token, you can find it in the token list."
      );
      expect(queryIcrcTokenSpy).toBeCalledTimes(0);
      // Stays on the form.
      expect(await formPo.isPresent()).toEqual(true);
    });

    it("should catch importing of Snses", async () => {
      const startBusySpy = vi.spyOn(busyServices, "startBusy");
      setSnsProjects([
        {
          ledgerCanisterId,
        },
      ]);

      const { formPo } = renderComponent();

      await formPo
        .getLedgerCanisterInputPo()
        .typeText(ledgerCanisterId.toText());

      expect(queryIcrcTokenSpy).toBeCalledTimes(0);
      expect(await formPo.isPresent()).toEqual(true);

      await formPo.getSubmitButtonPo().click();

      expect(startBusySpy).toBeCalledTimes(0);
      expectToastError(
        "You cannot import SNS tokens, they are added automatically."
      );
      expect(queryIcrcTokenSpy).toBeCalledTimes(0);
      // Stays on the form.
      expect(await formPo.isPresent()).toEqual(true);
    });

    it("should catch importing of an Important token", async () => {
      const startBusySpy = vi.spyOn(busyServices, "startBusy");
      const { formPo } = renderComponent();

      await formPo
        .getLedgerCanisterInputPo()
        .typeText(CKBTC_LEDGER_CANISTER_ID.toText());

      expect(queryIcrcTokenSpy).toBeCalledTimes(0);
      expect(await formPo.isPresent()).toEqual(true);

      await formPo.getSubmitButtonPo().click();

      expect(startBusySpy).toBeCalledTimes(0);
      expectToastError("This token is already in the token list.");
      expect(queryIcrcTokenSpy).toBeCalledTimes(0);
      // Stays on the form.
      expect(await formPo.isPresent()).toEqual(true);
    });

    it("should fetch meta data", async () => {
      const startBusySpy = vi.spyOn(busyServices, "startBusy");
      const { formPo } = renderComponent();

      await formPo
        .getLedgerCanisterInputPo()
        .typeText(ledgerCanisterId.toText());

      expect(queryIcrcTokenSpy).toBeCalledTimes(0);

      await formPo.getSubmitButtonPo().click();

      expect(queryIcrcTokenSpy).toBeCalledTimes(1);
      expect(startBusySpy).toBeCalledTimes(1);
      expect(startBusySpy).toBeCalledWith({
        initiator: "import-token-validation",
        labelKey: "import_token.verifying",
      });
    });

    it("should catch not a ledger canister id", async () => {
      vi.spyOn(console, "error").mockReturnValue();
      const error = new Error("Not a ledger canister");
      vi.spyOn(ledgerApi, "queryIcrcToken").mockRejectedValue(error);
      const { formPo } = renderComponent();

      await formPo
        .getLedgerCanisterInputPo()
        .typeText(ledgerCanisterId.toText());
      await formPo.getSubmitButtonPo().click();

      // Wait for toast error to be called.
      await runResolvedPromises();

      expectToastError(
        "Unable to load token details using the provided Ledger Canister ID. Not a ledger canister"
      );

      // Stays on the form.
      expect(await formPo.isPresent()).toEqual(true);
    });

    it("should catch unmatched ledger to index canister IDs", async () => {
      vi.spyOn(icrcIndexApi, "getLedgerId").mockResolvedValue(principal(666));

      const { formPo } = renderComponent();

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
    const startBusySpy = vi.spyOn(busyServices, "startBusy");
    const stopBusySpy = vi.spyOn(busyServices, "stopBusy");
    const { formPo } = renderComponent();

    await formPo.getLedgerCanisterInputPo().typeText(ledgerCanisterId.toText());
    await formPo.getSubmitButtonPo().click();

    // Wait for toast error to be called.
    await runResolvedPromises();

    expect(startBusySpy).toBeCalledTimes(1);
    expect(stopBusySpy).toBeCalledTimes(1);
    expect(await formPo.isPresent()).toEqual(false);
  });
});
