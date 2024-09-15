import * as importedTokensApi from "$lib/api/imported-tokens.api";
import ImportTokenRemoveConfirmation from "$lib/components/accounts/ImportTokenRemoveConfirmation.svelte";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { importedTokensStore } from "$lib/stores/imported-tokens.store";
import { tokensStore } from "$lib/stores/tokens.store";
import type { Universe } from "$lib/types/universe";
import { page } from "$mocks/$app/stores";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockIcrcMainAccount } from "$tests/mocks/icrc-accounts.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { mockUniversesTokens } from "$tests/mocks/tokens.mock";
import { ImportTokenRemoveConfirmationPo } from "$tests/page-objects/ImportTokenRemoveConfirmation.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { busyStore } from "@dfinity/gix-components";
import { Principal } from "@dfinity/principal";
import { get } from "svelte/store";

describe("ImportTokenRemoveConfirmation", () => {
  const ledgerCanisterId = principal(0);
  const ledgerCanisterId2 = principal(1);
  const tokenLogo = "data:image/svg+xml;base64,PHN2ZyB3...";
  const tokenName = "ckTest";
  const mockUniverse: Universe = {
    canisterId: ledgerCanisterId.toText(),
    title: tokenName,
    logo: tokenLogo,
  };
  const renderComponent = (
    props: {
      ledgerCanisterId: Principal;
      universe: Universe;
    } = {
      ledgerCanisterId: ledgerCanisterId,
      universe: mockUniverse,
    }
  ) => {
    const { container, component } = render(ImportTokenRemoveConfirmation, {
      props,
    });

    const nnsClose = vi.fn();
    component.$on("nnsClose", nnsClose);

    return {
      po: ImportTokenRemoveConfirmationPo.under(
        new JestPageObjectElement(container)
      ),
      nnsClose,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    vi.restoreAllMocks();
    resetIdentity();
    busyStore.resetForTesting();
    page.mock({
      data: { universe: ledgerCanisterId.toText() },
      routeId: AppPath.Wallet,
    });
    tokensStore.setTokens(mockUniversesTokens);
    icrcAccountsStore.set({
      accounts: {
        accounts: [mockIcrcMainAccount],
        certified: true,
      },
      ledgerCanisterId,
    });

    importedTokensStore.set({
      importedTokens: [
        {
          ledgerCanisterId,
          indexCanisterId: undefined,
        },
        {
          ledgerCanisterId: ledgerCanisterId2,
          indexCanisterId: undefined,
        },
      ],
      certified: true,
    });
    icrcAccountsStore.set({
      accounts: {
        accounts: [mockIcrcMainAccount],
        certified: true,
      },
      ledgerCanisterId,
    });
  });

  it("should render token logo", async () => {
    const { po } = renderComponent();
    expect(await po.getUniverseSummaryPo().getLogoUrl()).toEqual(tokenLogo);
  });

  it("should render token name", async () => {
    const { po } = renderComponent();
    expect(await po.getUniverseSummaryPo().getTitle()).toEqual(tokenName);
  });

  it("should dispatch events", async () => {
    const { po, nnsClose } = renderComponent();

    expect(nnsClose).not.toBeCalled();
    await po.clickNo();
    expect(nnsClose).toBeCalledTimes(1);

    nnsClose.mockClear();
  });

  it("should work w/o universe", async () => {
    const { po, nnsClose } = renderComponent({
      ledgerCanisterId,
      universe: undefined,
    });
    expect(await po.getUniverseSummaryPo().isPresent()).toEqual(false);
    expect(nnsClose).not.toBeCalled();
    await po.clickNo();
    expect(nnsClose).toBeCalledTimes(1);
  });

  it("should remove imported tokens", async () => {
    let resolveSetImportedTokens;
    const spyOnSetImportedTokens = vi
      .spyOn(importedTokensApi, "setImportedTokens")
      .mockImplementation(
        () =>
          new Promise<void>((resolve) => (resolveSetImportedTokens = resolve))
      );
    const spyOnGetImportedTokens = vi
      .spyOn(importedTokensApi, "getImportedTokens")
      .mockResolvedValue({
        imported_tokens: [
          {
            ledger_canister_id: ledgerCanisterId2,
            index_canister_id: [],
          },
        ],
      });

    const { po, nnsClose } = await renderComponent();

    expect(get(pageStore).path).toEqual(AppPath.Wallet);
    expect(nnsClose).toBeCalledTimes(0);
    expect(get(busyStore)).toEqual([]);
    await po.clickYes();
    expect(get(importedTokensStore).importedTokens).toEqual([
      {
        ledgerCanisterId,
        indexCanisterId: undefined,
      },
      {
        ledgerCanisterId: ledgerCanisterId2,
        indexCanisterId: undefined,
      },
    ]);
    expect(get(busyStore)).toEqual([
      {
        initiator: "import-token-removing",
        text: "Removing imported token...",
      },
    ]);

    resolveSetImportedTokens();
    await runResolvedPromises();

    // The token should be removed.
    expect(spyOnSetImportedTokens).toBeCalledTimes(1);
    expect(spyOnSetImportedTokens).toHaveBeenCalledWith({
      identity: mockIdentity,
      importedTokens: [
        {
          ledger_canister_id: ledgerCanisterId2,
          index_canister_id: [],
        },
      ],
    });
    expect(spyOnGetImportedTokens).toBeCalledTimes(2);

    expect(get(busyStore)).toEqual([]);
    expect(get(pageStore).path).toEqual(AppPath.Tokens);
    expect(get(importedTokensStore).importedTokens).toEqual([
      {
        ledgerCanisterId: ledgerCanisterId2,
        indexCanisterId: undefined,
      },
    ]);
    expect(nnsClose).toBeCalledTimes(1);
  });

  it("should stay on the same page when removal is unsuccessful", async () => {
    vi.spyOn(console, "error").mockReturnValue();
    const spyOnSetImportedTokens = vi
      .spyOn(importedTokensApi, "setImportedTokens")
      .mockRejectedValue(new Error());
    const spyOnGetImportedTokens = vi.spyOn(
      importedTokensApi,
      "getImportedTokens"
    );
    const { po } = await renderComponent();
    expect(get(importedTokensStore).importedTokens).toEqual([
      {
        ledgerCanisterId,
        indexCanisterId: undefined,
      },
      {
        ledgerCanisterId: ledgerCanisterId2,
        indexCanisterId: undefined,
      },
    ]);
    await po.clickYes();
    await runResolvedPromises();
    expect(spyOnSetImportedTokens).toBeCalledTimes(1);
    // should stay on wallet page
    expect(get(pageStore).path).toEqual(AppPath.Wallet);
    // without data change
    expect(spyOnGetImportedTokens).toBeCalledTimes(0);
    expect(get(importedTokensStore).importedTokens).toEqual([
      {
        ledgerCanisterId,
        indexCanisterId: undefined,
      },
      {
        ledgerCanisterId: ledgerCanisterId2,
        indexCanisterId: undefined,
      },
    ]);
  });
});
