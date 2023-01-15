/**
 * @jest-environment jsdom
 */

import ProjectBalance from "$lib/components/universe/ProjectAccountsBalance.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { accountsStore } from "$lib/stores/accounts.store";
import { formatToken } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import { render } from "@testing-library/svelte";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";
import { mockSnsCanisterIdText } from "../../../mocks/sns.api.mock";

describe("ProjectBalance", () => {
  describe("no balance", () => {
    beforeAll(() => {
      page.mock({ data: { universe: mockSnsCanisterIdText } });
    });

    afterAll(() => jest.clearAllMocks());

    it("should render skeleton while loading", () => {
      const { container } = render(ProjectBalance);

      expect(container.querySelector(".skeleton")).not.toBeNull();
    });

    it("should render no balance", () => {
      const { getByTestId } = render(ProjectBalance);

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

    beforeAll(() => {
      page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });
    });

    afterAll(() => jest.clearAllMocks());

    it("should render a total balance", () => {
      const { getByTestId } = render(ProjectBalance);

      const icp: HTMLElement | null = getByTestId("token-value-label");

      const totalBalance =
        mockMainAccount.balance.toE8s() +
        mockSubAccount.balance.toE8s() +
        mockHardwareWalletAccount.balance.toE8s();

      expect(icp?.textContent.trim() ?? "").toEqual(
        `${formatToken({
          value: totalBalance,
          detailed: false,
        })} ${en.core.icp}`
      );
    });
  });
});
