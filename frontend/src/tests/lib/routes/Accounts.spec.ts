import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { AppPath } from "$lib/constants/routes.constants";
import {
  snsProjectsCommittedStore,
  snsProjectsStore,
} from "$lib/derived/sns/sns-projects.derived";
import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
import Accounts from "$lib/routes/Accounts.svelte";
import { uncertifiedLoadCkBTCAccountsBalance } from "$lib/services/ckbtc-accounts-balance.services";
import { uncertifiedLoadSnsAccountsBalances } from "$lib/services/sns-accounts-balance.services";
import { accountsStore } from "$lib/stores/accounts.store";
import { authStore } from "$lib/stores/auth.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { transactionsFeesStore } from "$lib/stores/transaction-fees.store";
import { page } from "$mocks/$app/stores";
import { mockAccountsStoreData } from "$tests/mocks/accounts.store.mock";
import { mockAuthStoreSubscribe } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
  mockSummary,
} from "$tests/mocks/sns-projects.mock";
import { mockSnsSelectedTransactionFeeStoreSubscribe } from "$tests/mocks/transaction-fee.mock";
import { fireEvent, waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";
import { vi } from "vitest";
import WalletTest from "../pages/AccountsTest.svelte";

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

vi.mock("$lib/services/sns-accounts-balance.services", () => {
  return {
    uncertifiedLoadSnsAccountsBalances: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("$lib/services/ckbtc-accounts-balance.services", () => {
  return {
    uncertifiedLoadCkBTCAccountsBalance: vi.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/services/ckbtc-withdrawal-accounts.services", () => {
  return {
    loadCkBTCWithdrawalAccount: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/services/ckbtc-minter.services", () => {
  return {
    updateBalance: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/services/ckbtc-info.services", () => {
  return {
    loadCkBTCInfo: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("$lib/services/worker-transactions.services", () => ({
  initTransactionsWorker: jest.fn(() =>
    Promise.resolve({
      startTransactionsTimer: () => {
        // Do nothing
      },
      stopTransactionsTimer: () => {
        // Do nothing
      },
    })
  ),
}));

jest.mock("$lib/services/worker-balances.services", () => ({
  initBalancesWorker: jest.fn(() =>
    Promise.resolve({
      startBalancesTimer: () => {
        // Do nothing
      },
      stopBalancesTimer: () => {
        // Do nothing
      },
    })
  ),
}));

describe("Accounts", () => {
  beforeAll(() => {
    vi.spyOn(authStore, "subscribe").mockImplementation(mockAuthStoreSubscribe);
  });

  vi.spyOn(snsProjectsCommittedStore, "subscribe").mockImplementation(
    mockProjectSubscribe([mockSnsFullProject])
  );

  vi.spyOn(snsProjectsStore, "subscribe").mockImplementation(
    mockProjectSubscribe([mockSnsFullProject])
  );

  beforeEach(() => {
    vi.spyOn(snsSelectedTransactionFeeStore, "subscribe").mockImplementation(
      mockSnsSelectedTransactionFeeStoreSubscribe()
    );

    // Reset to default value
    page.mock({
      data: { universe: OWN_CANISTER_ID_TEXT },
      routeId: AppPath.Accounts,
    });

    snsAccountsStore.setAccounts({
      rootCanisterId: mockSnsFullProject.rootCanisterId,
      certified: true,
      accounts: [mockSnsMainAccount],
    });

    accountsStore.setForTesting(mockAccountsStoreData);
  });

  it("should render NnsAccounts by default", () => {
    const { queryByTestId } = render(Accounts);
    expect(queryByTestId("accounts-body")).toBeInTheDocument();
  });

  it("should render nns name", () => {
    const { getByTestId } = render(Accounts);

    const titleRow = getByTestId("projects-summary");

    expect(titleRow?.textContent?.includes(en.core.ic)).toBeTruthy();
  });

  it("should render icp project logo", () => {
    const { getByTestId } = render(Accounts);

    const logo = getByTestId("project-logo");
    const img = logo.querySelector('[data-tid="logo"]');

    expect(img?.getAttribute("alt") ?? "").toEqual(en.auth.ic_logo);
  });

  it("should open nns transaction modal", async () => {
    const { getByTestId } = render(Accounts);

    const button = getByTestId("open-new-transaction") as HTMLButtonElement;
    await fireEvent.click(button);

    await waitFor(() => {
      expect(getByTestId("transaction-step-1")).toBeInTheDocument();
    });
  });

  it("should open nns receive modal", async () => {
    const { getByTestId, container } = render(WalletTest, {
      props: { testComponent: Accounts },
    });

    fireEvent.click(getByTestId("receive-icp") as HTMLButtonElement);

    await waitFor(() =>
      expect(container.querySelector("div.modal")).not.toBeNull()
    );
  });

  it("should open add account modal", async () => {
    const { container, getByTestId, getByText } = render(Accounts);

    const button = getByTestId("open-add-account-modal") as HTMLButtonElement;
    await fireEvent.click(button);

    await waitFor(() => {
      expect(container.querySelector("div.modal")).not.toBeNull();

      expect(
        getByText(en.accounts.attach_hardware_title, { exact: false })
      ).toBeInTheDocument();
    });
  });

  it("should render sns accounts when a project is selected", async () => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });

    const { queryByTestId } = render(Accounts);

    expect(queryByTestId("sns-accounts-body")).toBeInTheDocument();

    await waitFor(() =>
      expect(queryByTestId("sns-accounts-body")).toBeInTheDocument()
    );
  });

  it("should open sns transaction modal", async () => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });

    transactionsFeesStore.setFee({
      rootCanisterId: mockSnsFullProject.rootCanisterId,
      fee: BigInt(10_000),
      certified: true,
    });
    const { queryByTestId, getByTestId } = render(Accounts);

    expect(queryByTestId("sns-accounts-body")).toBeInTheDocument();

    await waitFor(() =>
      expect(queryByTestId("open-new-sns-transaction")).toBeInTheDocument()
    );

    const button = getByTestId("open-new-sns-transaction") as HTMLButtonElement;
    await fireEvent.click(button);

    await waitFor(() => {
      expect(getByTestId("transaction-step-1")).toBeInTheDocument();
    });
  });

  it("should open sns receive modal", async () => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });

    const { getByTestId, container } = render(WalletTest, {
      props: { testComponent: Accounts },
    });

    fireEvent.click(getByTestId("receive-sns") as HTMLButtonElement);

    await waitFor(() =>
      expect(container.querySelector("div.modal")).not.toBeNull()
    );
  });

  it("should load Sns accounts balances", async () => {
    render(Accounts);

    await waitFor(() =>
      expect(uncertifiedLoadSnsAccountsBalances).toHaveBeenCalled()
    );
  });

  it("should load ckBTC accounts balances", async () => {
    render(Accounts);

    await waitFor(() =>
      expect(uncertifiedLoadCkBTCAccountsBalance).toHaveBeenCalled()
    );
  });

  it("should not load ckBTC accounts balances", async () => {
    page.mock({
      data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });

    render(Accounts);

    await waitFor(() =>
      expect(uncertifiedLoadCkBTCAccountsBalance).toHaveBeenCalled()
    );
  });

  it("should render sns project name", () => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });

    const { getByTestId } = render(Accounts);

    const titleRow = getByTestId("projects-summary");

    expect(
      titleRow?.textContent?.includes(mockSummary.metadata.name)
    ).toBeTruthy();
  });

  it("should render sns project logo", () => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });

    const { getByTestId } = render(Accounts);

    const logo = getByTestId("project-logo");
    const img = logo.querySelector('[data-tid="logo"]');

    expect(img?.getAttribute("src") ?? "").toEqual(mockSummary.metadata.logo);
  });

  it("should render project title", async () => {
    page.mock({
      data: { universe: mockSnsFullProject.rootCanisterId.toText() },
    });

    const { getByText } = render(Accounts);

    await waitFor(() =>
      expect(
        getByText(mockSnsFullProject.summary.metadata.name)
      ).toBeInTheDocument()
    );
  });

  it("should render ckBTC name", () => {
    page.mock({
      data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });

    const { getByTestId } = render(Accounts);

    const titleRow = getByTestId("projects-summary");

    expect(titleRow?.textContent?.includes(en.ckbtc.title)).toBeTruthy();
  });

  it("should render icp project logo", () => {
    page.mock({
      data: { universe: CKBTC_UNIVERSE_CANISTER_ID.toText() },
      routeId: AppPath.Accounts,
    });

    const { getByTestId } = render(Accounts);

    const logo = getByTestId("project-logo");
    const img = logo.querySelector('[data-tid="logo"]');

    expect(img?.getAttribute("alt") ?? "").toEqual(en.ckbtc.logo);
  });
});
