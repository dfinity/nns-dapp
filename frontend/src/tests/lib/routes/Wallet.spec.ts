import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import Wallet from "$lib/routes/Wallet.svelte";
import { accountsStore } from "$lib/stores/accounts.store";
import { authStore } from "$lib/stores/auth.store";
import { snsQueryStore } from "$lib/stores/sns.store";
import { page } from "$mocks/$app/stores";
import { mockAccountsStoreData } from "$tests/mocks/accounts.store.mock";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import { mockSnsFullProject, principal } from "$tests/mocks/sns-projects.mock";
import { snsResponseFor } from "$tests/mocks/sns-response.mock";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

vi.mock("$lib/services/sns-accounts.services", () => {
  return {
    syncSnsAccounts: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/services/ckbtc-accounts.services", () => {
  return {
    syncCkBTCAccounts: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/services/ckbtc-transactions.services", () => {
  return {
    loadCkBTCAccountNextTransactions: vi.fn().mockResolvedValue(undefined),
    loadCkBTCAccountTransactions: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/services/ckbtc-info.services", () => {
  return {
    loadCkBTCInfo: vi.fn().mockResolvedValue(undefined),
  };
});

describe("Wallet", () => {
  beforeEach(() => {
    snsQueryStore.reset();
    snsQueryStore.setData(
      snsResponseFor({
        principal: mockSnsFullProject.rootCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
      })
    );
    accountsStore.setForTesting(mockAccountsStoreData);
  });

  beforeAll(() =>
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe)
  );

  describe("nns context", () => {
    it("should render NnsWallet", () => {
      page.mock({ routeId: AppPath.Wallet });

      const { getByTestId } = render(Wallet, {
        props: {
          accountIdentifier: OWN_CANISTER_ID_TEXT,
        },
      });
      expect(getByTestId("nns-wallet")).toBeInTheDocument();
    });
  });

  describe("sns context", () => {
    beforeAll(() => {
      page.mock({
        data: { universe: mockSnsFullProject.rootCanisterId.toText() },
        routeId: AppPath.Wallet,
      });
    });

    it("should render SnsWallet", async () => {
      const { getByTestId } = render(Wallet, {
        props: {
          accountIdentifier: principal(0).toText(),
        },
      });
      expect(getByTestId("sns-wallet")).toBeInTheDocument();
    });
  });

  it("should render ckBTC wallet", () => {
    page.mock({
      data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Wallet,
    });

    const { getByTestId } = render(Wallet, {
      props: {
        accountIdentifier: principal(0).toText(),
      },
    });
    expect(getByTestId("ckbtc-wallet")).toBeInTheDocument();
  });
});
