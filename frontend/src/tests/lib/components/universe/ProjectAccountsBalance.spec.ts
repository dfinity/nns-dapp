/**
 * @jest-environment jsdom
 */

import ProjectAccountsBalance from "$lib/components/universe/ProjectAccountsBalance.svelte";
import { accountsStore } from "$lib/stores/accounts.store";
import { formatToken } from "$lib/utils/token.utils";
import { render } from "@testing-library/svelte";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";
import { mockSnsMainAccount } from "../../../mocks/sns-accounts.mock";
import { mockSnsFullProject } from "../../../mocks/sns-projects.mock";
import { mockSnsCanisterId } from "../../../mocks/sns.api.mock";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";

describe("ProjectAccountsBalance", () => {
  describe("no balance", () => {
    it("should render skeleton while loading", () => {
      const { container } = render(ProjectAccountsBalance, {
        props: { rootCanisterId: mockSnsCanisterId },
      });

      expect(container.querySelector(".skeleton")).not.toBeNull();
    });

    it("should render no balance", () => {
      const { getByTestId } = render(ProjectAccountsBalance, {
        props: { rootCanisterId: mockSnsCanisterId },
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
        props: { rootCanisterId: undefined },
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
        props: { rootCanisterId },
      });

      const balance: HTMLElement | null = getByTestId("token-value-label");

      expect(balance?.textContent.trim() ?? "").toEqual(
        `${formatToken({
          value: totalBalance.toE8s(),
          detailed: false,
        })} ${mockSnsMainAccount.balance.token.symbol}`
      );
    });
  });
});
