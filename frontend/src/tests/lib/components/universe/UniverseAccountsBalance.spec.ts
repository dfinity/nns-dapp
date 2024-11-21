import ProjectAccountsBalance from "$lib/components/universe/UniverseAccountsBalance.svelte";
import { CKBTC_LEDGER_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { CKETH_LEDGER_CANISTER_ID } from "$lib/constants/cketh-canister-ids.constants";
import { icpAccountsStore } from "$lib/derived/icp-accounts.derived";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { formatTokenE8s } from "$lib/utils/token.utils";
import { createUniverse } from "$lib/utils/universe.utils";
import { page } from "$mocks/$app/stores";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
import { mockCkETHMainAccount } from "$tests/mocks/cketh-accounts.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
  mockSnsToken,
} from "$tests/mocks/sns-projects.mock";
import { mockSnsCanisterId } from "$tests/mocks/sns.api.mock";
import {
  mockTokensSubscribe,
  mockUniversesTokens,
} from "$tests/mocks/tokens.mock";
import {
  ckBTCUniverseMock,
  ckETHUniverseMock,
  nnsUniverseMock,
} from "$tests/mocks/universe.mock";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { render } from "@testing-library/svelte";

describe("UniverseAccountsBalance", () => {
  beforeEach(() => {
    resetSnsProjects();

    page.mock({
      data: { universe: mockSnsCanisterId.toText() },
    });

    vi.spyOn(tokensStore, "subscribe").mockImplementation(
      mockTokensSubscribe(mockUniversesTokens)
    );

    vi.spyOn(snsProjectsCommittedStore, "subscribe").mockImplementation(
      mockProjectSubscribe([mockSnsFullProject])
    );
  });

  // Not the same sns canister id to test that the balance is not displayed
  const universe = createUniverse(mockSnsFullProject.summary);

  describe("no balance", () => {
    it("should render skeleton while loading", () => {
      const { container } = render(ProjectAccountsBalance, {
        props: { universe },
      });

      expect(container.querySelector(".skeleton")).not.toBeNull();
    });

    it("should render no balance", () => {
      const { getByTestId } = render(ProjectAccountsBalance, {
        props: { universe },
      });

      expect(() => getByTestId("token-value")).toThrow();
    });
  });

  describe("balance", () => {
    beforeEach(() => {
      vi.spyOn(icpAccountsStore, "subscribe").mockImplementation(
        mockAccountsStoreSubscribe(
          [mockSubAccount],
          [mockHardwareWalletAccount]
        )
      );
    });

    it("should render a total balance for Nns", () => {
      const { getByTestId } = render(ProjectAccountsBalance, {
        props: { universe: nnsUniverseMock },
      });

      const balance: HTMLElement | null = getByTestId("token-value-label");

      const totalBalance =
        mockMainAccount.balanceUlps +
        mockSubAccount.balanceUlps +
        mockHardwareWalletAccount.balanceUlps;

      expect(balance?.textContent.trim() ?? "").toEqual(
        `${formatTokenE8s({
          value: totalBalance,
          detailed: false,
        })} ${en.core.icp}`
      );
    });

    it("should render a total balance for Sns", () => {
      const rootCanisterId = mockSnsFullProject.rootCanisterId;
      const ledgerCanisterId = mockSnsFullProject.summary.ledgerCanisterId;

      const totalBalance = mockSnsMainAccount.balanceUlps;

      setSnsProjects([
        {
          rootCanisterId,
          ledgerCanisterId,
          tokenMetadata: mockSnsToken,
        },
      ]);

      icrcAccountsStore.set({
        ledgerCanisterId,
        accounts: { accounts: [mockSnsMainAccount], certified: true },
      });

      const { getByTestId } = render(ProjectAccountsBalance, {
        props: {
          universe,
        },
      });

      const balance: HTMLElement | null = getByTestId("token-value-label");

      expect(balance?.textContent.trim() ?? "").toEqual(
        `${formatTokenE8s({
          value: totalBalance,
          detailed: false,
        })} ${mockSnsToken.symbol}`
      );
    });

    it("should render a total balance for ckBTC", () => {
      const totalBalance = mockCkBTCMainAccount.balanceUlps;

      icrcAccountsStore.set({
        accounts: {
          accounts: [mockCkBTCMainAccount],
          certified: true,
        },
        ledgerCanisterId: CKBTC_LEDGER_CANISTER_ID,
      });

      const { getByTestId } = render(ProjectAccountsBalance, {
        props: {
          universe: ckBTCUniverseMock,
        },
      });

      const balance: HTMLElement | null = getByTestId("token-value-label");

      expect(balance?.textContent.trim() ?? "").toEqual(
        `${formatTokenE8s({
          value: totalBalance,
          detailed: false,
        })} ${mockCkBTCToken.symbol}`
      );
    });

    it("should render a total balance for ckETH", () => {
      const totalBalanceUlps = 123000000000000000000n;

      icrcAccountsStore.set({
        accounts: {
          accounts: [
            {
              ...mockCkETHMainAccount,
              balanceUlps: totalBalanceUlps,
            },
          ],
          certified: true,
        },
        ledgerCanisterId: CKETH_LEDGER_CANISTER_ID,
      });

      const { getByTestId } = render(ProjectAccountsBalance, {
        props: {
          universe: ckETHUniverseMock,
        },
      });

      const balance: HTMLElement | null = getByTestId("token-value-label");

      expect(balance?.textContent.trim() ?? "").toEqual("123.00 ckETH");
    });
  });
});
