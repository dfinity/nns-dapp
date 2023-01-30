/**
 * @jest-environment jsdom
 */

import ProjectAccountsBalance from "$lib/components/universe/UniverseAccountsBalance.svelte";
import {
  CKBTC_UNIVERSE,
  NNS_UNIVERSE,
} from "$lib/derived/selectable-universes.derived";
import { snsProjectsCommittedStore } from "$lib/derived/sns/sns-projects.derived";
import { accountsStore } from "$lib/stores/accounts.store";
import { ckBTCAccountsStore } from "$lib/stores/ckbtc-accounts.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import type { Universe } from "$lib/types/universe";
import { formatToken } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import { render } from "@testing-library/svelte";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import { mockCkBTCMainAccount } from "../../../mocks/ckbtc-accounts.mock";
import en from "../../../mocks/i18n.mock";
import { mockSnsMainAccount } from "../../../mocks/sns-accounts.mock";
import {
  mockProjectSubscribe,
  mockSnsFullProject,
} from "../../../mocks/sns-projects.mock";
import { mockSnsCanisterId } from "../../../mocks/sns.api.mock";

describe("UniverseAccountsBalance", () => {
  beforeAll(() => {
    page.mock({
      data: { universe: mockSnsCanisterId.toText() },
    });

    jest
      .spyOn(snsProjectsCommittedStore, "subscribe")
      .mockImplementation(mockProjectSubscribe([mockSnsFullProject]));
  });

  afterAll(() => jest.clearAllMocks());

  // Not the same sns canister id to test that the balance is not displayed
  const universe: Universe = {
    canisterId: mockSnsCanisterId.toText(),
    summary: mockSnsFullProject.summary,
  };

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
    jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(
        mockAccountsStoreSubscribe(
          [mockSubAccount],
          [mockHardwareWalletAccount]
        )
      );

    afterAll(() => jest.clearAllMocks());

    it("should render a total balance for Nns", () => {
      const { getByTestId } = render(ProjectAccountsBalance, {
        props: { universe: NNS_UNIVERSE },
      });

      const balance: HTMLElement | null = getByTestId("token-value-label");

      const totalBalance =
        mockMainAccount.balance.toE8s() +
        mockSubAccount.balance.toE8s() +
        mockHardwareWalletAccount.balance.toE8s();

      expect(balance?.textContent.trim() ?? "").toEqual(
        `${formatToken({
          value: totalBalance,
          detailed: false,
        })} ${en.core.icp}`
      );
    });

    it("should render a total balance for Sns", () => {
      const rootCanisterId = mockSnsFullProject.rootCanisterId;

      const totalBalance = mockSnsMainAccount.balance;

      snsAccountsStore.setAccounts({
        rootCanisterId,
        accounts: [mockSnsMainAccount],
        certified: true,
      });

      const { getByTestId } = render(ProjectAccountsBalance, {
        props: {
          universe: {
            canisterId: rootCanisterId.toText(),
          },
        },
      });

      const balance: HTMLElement | null = getByTestId("token-value-label");

      expect(balance?.textContent.trim() ?? "").toEqual(
        `${formatToken({
          value: totalBalance.toE8s(),
          detailed: false,
        })} ${mockSnsMainAccount.balance.token.symbol}`
      );
    });

    it("should render a total balance for ckBTC", () => {
      const totalBalance = mockCkBTCMainAccount.balance;

      ckBTCAccountsStore.set({
        accounts: [mockCkBTCMainAccount],
        certified: true,
      });

      const { getByTestId } = render(ProjectAccountsBalance, {
        props: {
          universe: CKBTC_UNIVERSE,
        },
      });

      const balance: HTMLElement | null = getByTestId("token-value-label");

      expect(balance?.textContent.trim() ?? "").toEqual(
        `${formatToken({
          value: totalBalance.toE8s(),
          detailed: false,
        })} ${mockCkBTCMainAccount.balance.token.symbol}`
      );
    });
  });
});
