import ProjectAccountsBalance from "$lib/components/universe/UniverseAccountsBalance.svelte";
import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckbtc-canister-ids.constants";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { icpAccountsStore } from "$lib/stores/icp-accounts.store";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { formatToken } from "$lib/utils/token.utils";
import { createUniverse } from "$lib/utils/universe.utils";
import { page } from "$mocks/$app/stores";
import {
  mockCkBTCMainAccount,
  mockCkBTCToken,
} from "$tests/mocks/ckbtc-accounts.mock";
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
import { ckBTCUniverseMock, nnsUniverseMock } from "$tests/mocks/universe.mock";
import { render } from "@testing-library/svelte";

describe("UniverseAccountsBalance", () => {
  beforeAll(() => {
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

  afterAll(() => {
    vi.clearAllMocks();
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
    vi.spyOn(icpAccountsStore, "subscribe").mockImplementation(
      mockAccountsStoreSubscribe([mockSubAccount], [mockHardwareWalletAccount])
    );

    afterAll(() => {
      vi.clearAllMocks();
    });

    it("should render a total balance for Nns", () => {
      const { getByTestId } = render(ProjectAccountsBalance, {
        props: { universe: nnsUniverseMock },
      });

      const balance: HTMLElement | null = getByTestId("token-value-label");

      const totalBalance =
        mockMainAccount.balanceE8s +
        mockSubAccount.balanceE8s +
        mockHardwareWalletAccount.balanceE8s;

      expect(balance?.textContent.trim() ?? "").toEqual(
        `${formatToken({
          value: totalBalance,
          detailed: false,
        })} ${en.core.icp}`
      );
    });

    it("should render a total balance for Sns", () => {
      const rootCanisterId = mockSnsFullProject.rootCanisterId;

      const totalBalance = mockSnsMainAccount.balanceE8s;

      snsAccountsStore.setAccounts({
        rootCanisterId,
        accounts: [mockSnsMainAccount],
        certified: true,
      });

      const { getByTestId } = render(ProjectAccountsBalance, {
        props: {
          universe,
        },
      });

      const balance: HTMLElement | null = getByTestId("token-value-label");

      expect(balance?.textContent.trim() ?? "").toEqual(
        `${formatToken({
          value: totalBalance,
          detailed: false,
        })} ${mockSnsToken.symbol}`
      );
    });

    it("should render a total balance for ckBTC", () => {
      const totalBalance = mockCkBTCMainAccount.balanceE8s;

      icrcAccountsStore.set({
        accounts: {
          accounts: [mockCkBTCMainAccount],
          certified: true,
        },
        universeId: CKBTC_UNIVERSE_CANISTER_ID,
      });

      const { getByTestId } = render(ProjectAccountsBalance, {
        props: {
          universe: ckBTCUniverseMock,
        },
      });

      const balance: HTMLElement | null = getByTestId("token-value-label");

      expect(balance?.textContent.trim() ?? "").toEqual(
        `${formatToken({
          value: totalBalance,
          detailed: false,
        })} ${mockCkBTCToken.symbol}`
      );
    });
  });
});
