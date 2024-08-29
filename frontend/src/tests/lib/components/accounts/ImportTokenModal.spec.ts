import * as icrcIndexApi from "$lib/api/icrc-index.api";
import * as ledgerApi from "$lib/api/icrc-ledger.api";
import { CKBTC_LEDGER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import ImportTokenModal from "$lib/modals/accounts/ImportTokenModal.svelte";
import * as busyServices from "$lib/stores/busy.store";
import { importedTokensStore } from "$lib/stores/imported-tokens.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { IcrcTokenMetadata } from "$lib/types/icrc";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { ImportTokenModalPo } from "$tests/page-objects/ImportTokenModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { SpyInstance } from "vitest";
import {
  resetSnsProjects,
  setSnsProjects,
} from "../../../utils/sns.test-utils";

vi.mock("$lib/stores/toasts.store", () => {
  return {
    toastsError: vi.fn(),
  };
});

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
    (toastsError as undefined as SpyInstance).mockReset();
    resetIdentity();

    queryIcrcTokenSpy = vi
      .spyOn(ledgerApi, "queryIcrcToken")
      .mockResolvedValue(tokenMetaData);
  });

  it("should display modal title", async () => {
    const { po } = renderComponent();

    expect(await po.getModalTitle()).toEqual("Import Token");
  });

  describe("Form Step", () => {
    beforeEach(() => {
      resetSnsProjects();
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
      const { formPo } = renderComponent();

      await formPo
        .getLedgerCanisterInputPo()
        .typeText(ledgerCanisterId.toText());

      expect(toastsError).toBeCalledTimes(0);
      expect(queryIcrcTokenSpy).toHaveBeenCalledTimes(0);
      expect(await formPo.isPresent()).toEqual(true);

      await formPo.getSubmitButtonPo().click();

      expect(toastsError).toBeCalledTimes(1);
      expect(toastsError).toBeCalledWith({
        labelKey: "error__imported_tokens.is_duplication",
      });
      expect(queryIcrcTokenSpy).toHaveBeenCalledTimes(0);
      // Stays on the form.
      expect(await formPo.isPresent()).toEqual(true);
    });

    it("should catch importing of Snses", async () => {
      setSnsProjects([
        {
          ledgerCanisterId,
        },
      ]);

      const { formPo } = renderComponent();

      await formPo
        .getLedgerCanisterInputPo()
        .typeText(ledgerCanisterId.toText());

      expect(toastsError).toBeCalledTimes(0);
      expect(queryIcrcTokenSpy).toHaveBeenCalledTimes(0);
      expect(await formPo.isPresent()).toEqual(true);

      await formPo.getSubmitButtonPo().click();

      expect(toastsError).toBeCalledTimes(1);
      expect(toastsError).toBeCalledWith({
        labelKey: "error__imported_tokens.is_sns",
      });
      expect(queryIcrcTokenSpy).toHaveBeenCalledTimes(0);
      // Stays on the form.
      expect(await formPo.isPresent()).toEqual(true);
    });

    it("should catch importing of an Important token", async () => {
      const { formPo } = renderComponent();

      await formPo
        .getLedgerCanisterInputPo()
        .typeText(CKBTC_LEDGER_CANISTER_ID.toText());

      expect(toastsError).toBeCalledTimes(0);
      expect(queryIcrcTokenSpy).toHaveBeenCalledTimes(0);
      expect(await formPo.isPresent()).toEqual(true);

      await formPo.getSubmitButtonPo().click();

      expect(toastsError).toBeCalledTimes(1);
      expect(toastsError).toBeCalledWith({
        labelKey: "error__imported_tokens.is_important",
      });
      expect(queryIcrcTokenSpy).toHaveBeenCalledTimes(0);
      // Stays on the form.
      expect(await formPo.isPresent()).toEqual(true);
    });

    it("should fetch meta data", async () => {
      const startBusySpy = vi.spyOn(busyServices, "startBusy");
      const { formPo } = renderComponent();

      await formPo
        .getLedgerCanisterInputPo()
        .typeText(ledgerCanisterId.toText());

      expect(queryIcrcTokenSpy).toHaveBeenCalledTimes(0);

      await formPo.getSubmitButtonPo().click();

      expect(queryIcrcTokenSpy).toHaveBeenCalledTimes(1);
      expect(startBusySpy).toHaveBeenCalledTimes(1);
      expect(startBusySpy).toHaveBeenCalledWith({
        initiator: "import-token-validation",
        labelKey: "import_token.verifying",
      });
    });

    it("should catch not a ledger canister id", async () => {
      const error = new Error("Not a ledger canister");
      vi.spyOn(ledgerApi, "queryIcrcToken").mockRejectedValue(error);
      const { formPo } = renderComponent();

      expect(toastsError).not.toBeCalled();

      await formPo
        .getLedgerCanisterInputPo()
        .typeText(ledgerCanisterId.toText());
      await formPo.getSubmitButtonPo().click();

      // Wait for toast error to be called.
      await runResolvedPromises();

      expect(toastsError).toBeCalledTimes(1);
      expect(toastsError).toBeCalledWith({
        labelKey: "error__imported_tokens.ledger_canister_loading",
        err: error,
      });

      // Stays on the form.
      expect(await formPo.isPresent()).toEqual(true);
    });

    it("should catch unmatched ledger to index canister IDs", async () => {
      // vi.spyOn(console, "error").mockReturnValue();
      vi.spyOn(icrcIndexApi, "getLedgerId").mockResolvedValue(principal(666));

      const { formPo } = renderComponent();

      expect(toastsError).toBeCalledTimes(0);

      await formPo
        .getLedgerCanisterInputPo()
        .typeText(ledgerCanisterId.toText());
      await formPo.getIndexCanisterInputPo().typeText(indexCanisterId.toText());
      await formPo.getSubmitButtonPo().click();

      // Wait for toast error to be called.
      await runResolvedPromises();

      expect(toastsError).toBeCalledTimes(1);
      expect(toastsError).toBeCalledWith({
        labelKey: "error.invalid_ledger_index_pair",
      });

      // Stays on the form.
      expect(await formPo.isPresent()).toEqual(true);
    });
  });

  it("should leave the form after successful validation", async () => {
    const { formPo } = renderComponent();

    await formPo.getLedgerCanisterInputPo().typeText(ledgerCanisterId.toText());
    await formPo.getSubmitButtonPo().click();

    // Wait for toast error to be called.
    await runResolvedPromises();

    expect(toastsError).toBeCalledTimes(0);
    expect(await formPo.isPresent()).toEqual(false);
  });
});
