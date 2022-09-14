/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import NnsAccounts from "../../../lib/pages/NnsAccounts.svelte";
import { accountsStore } from "../../../lib/stores/accounts.store";
import { authStore } from "../../../lib/stores/auth.store";
import { replacePlaceholders } from "../../../lib/utils/i18n.utils";
import { formatICP } from "../../../lib/utils/icp.utils";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "../../mocks/accounts.store.mock";
import { mockAuthStoreSubscribe } from "../../mocks/auth.store.mock";
import en from "../../mocks/i18n.mock";

describe("NnsAccounts", () => {
  let accountsStoreMock: jest.SpyInstance;

  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render title and account icp", () => {
    accountsStoreMock = jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe());
    const { container } = render(NnsAccounts);

    const titleRow = container.querySelector("section > div");

    expect(
      titleRow?.textContent?.startsWith(
        `Accounts ${formatICP({ value: mockMainAccount.balance.toE8s() })} ICP`
      )
    ).toBeTruthy();
  });

  it("should render a main card", () => {
    accountsStoreMock = jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe());
    const { container } = render(NnsAccounts);

    const article = container.querySelector("article");
    expect(article).not.toBeNull();
  });

  it("should render account icp in card too", () => {
    accountsStoreMock = jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe());
    const { container } = render(NnsAccounts);

    const cardTitleRow = container.querySelector(
      "article > div div:last-of-type"
    );

    expect(cardTitleRow?.textContent).toEqual(
      `${formatICP({ value: mockMainAccount.balance.toE8s() })} ICP`
    );
  });

  it("should render account identifier", () => {
    accountsStoreMock = jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe());
    const { getByText } = render(NnsAccounts);
    getByText(mockMainAccount.identifier);
  });

  it("should render subaccount cards", () => {
    accountsStoreMock = jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe([mockSubAccount]));
    const { container } = render(NnsAccounts);

    const articles = container.querySelectorAll("article");

    expect(articles).not.toBeNull();
    expect(articles.length).toBe(2);
  });

  it("should render hardware wallet account cards", () => {
    accountsStoreMock = jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(
        mockAccountsStoreSubscribe([], [mockHardwareWalletAccount])
      );
    const { container } = render(NnsAccounts);

    const articles = container.querySelectorAll("article");

    expect(articles).not.toBeNull();
    expect(articles.length).toBe(2);
  });

  it("should subscribe to store", () => {
    accountsStoreMock = jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe());
    expect(accountsStoreMock).toHaveBeenCalled();
  });

  describe("Total ICPs", () => {
    const totalBalance =
      mockMainAccount.balance.toE8s() +
      mockSubAccount.balance.toE8s() +
      mockHardwareWalletAccount.balance.toE8s();

    beforeAll(
      () =>
        (accountsStoreMock = jest
          .spyOn(accountsStore, "subscribe")
          .mockImplementation(
            mockAccountsStoreSubscribe(
              [mockSubAccount],
              [mockHardwareWalletAccount]
            )
          ))
    );

    afterAll(jest.clearAllMocks);

    it("should render total accounts icp", () => {
      const { container } = render(NnsAccounts);

      const titleRow = container.querySelector("section > div");

      expect(
        titleRow?.textContent?.startsWith(
          `Accounts ${formatICP({ value: totalBalance })} ICP`
        )
      ).toBeTruthy();
    });

    it("should contain a tooltip", () => {
      const { container } = render(NnsAccounts);

      expect(container.querySelector(".tooltip-wrapper")).toBeInTheDocument();
    });

    it("should render a total balance in a tooltip", () => {
      const { container } = render(NnsAccounts);

      const icp: HTMLDivElement | null =
        container.querySelector("#wallet-total-icp");

      const totalBalance =
        mockMainAccount.balance.toE8s() +
        mockSubAccount.balance.toE8s() +
        mockHardwareWalletAccount.balance.toE8s();

      expect(icp?.textContent).toEqual(
        replacePlaceholders(en.accounts.current_balance_total, {
          $amount: `${formatICP({
            value: totalBalance,
            detailed: true,
          })}`,
        })
      );
    });
  });
});
