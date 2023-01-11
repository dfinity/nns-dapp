/**
 * @jest-environment jsdom
 */

import { IC_LOGO } from "$lib/constants/icp.constants";
import NnsAccounts from "$lib/pages/NnsAccounts.svelte";
import { accountsStore, type AccountsStore } from "$lib/stores/accounts.store";
import { formatToken } from "$lib/utils/token.utils";
import { render } from "@testing-library/svelte";
import type { Subscriber } from "svelte/store";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "../../mocks/accounts.store.mock";
import en from "../../mocks/i18n.mock";

describe("NnsAccounts", () => {
  afterEach(() => jest.clearAllMocks());

  describe("when there are accounts", () => {
    let accountsStoreMock: jest.SpyInstance;

    it("should render title", () => {
      accountsStoreMock = jest
        .spyOn(accountsStore, "subscribe")
        .mockImplementation(mockAccountsStoreSubscribe());
      const { getByTestId } = render(NnsAccounts);

      const titleRow = getByTestId("projects-summary");
      expect(titleRow?.textContent?.includes(en.core.ic)).toBeTruthy();
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
        'article > div[data-tid="token-value-label"]'
      );

      expect(cardTitleRow?.textContent.trim()).toEqual(
        `${formatToken({ value: mockMainAccount.balance.toE8s() })} ICP`
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
      render(NnsAccounts);

      expect(accountsStoreMock).toHaveBeenCalled();
    });
  });

  describe("summary", () => {
    beforeAll(() =>
      jest
        .spyOn(accountsStore, "subscribe")
        .mockImplementation(
          mockAccountsStoreSubscribe(
            [mockSubAccount],
            [mockHardwareWalletAccount]
          )
        )
    );

    afterAll(jest.clearAllMocks);

    it("should render nns name", () => {
      const { getByTestId } = render(NnsAccounts);

      const titleRow = getByTestId("projects-summary");

      expect(titleRow?.textContent?.includes(en.core.ic)).toBeTruthy();
    });

    it("should render icp project logo", () => {
      const { getByTestId } = render(NnsAccounts);

      const logo = getByTestId("project-logo");
      const img = logo.querySelector('[data-tid="logo"]');

      expect(img?.getAttribute("src") ?? "").toEqual(IC_LOGO);
    });

    it("should contain a tooltip", () => {
      const { container } = render(NnsAccounts);

      expect(container.querySelector(".tooltip-wrapper")).toBeInTheDocument();
    });
  });

  describe("when no accounts", () => {
    beforeEach(() => {
      jest
        .spyOn(accountsStore, "subscribe")
        .mockImplementation((run: Subscriber<AccountsStore>): (() => void) => {
          run({
            main: undefined,
            subAccounts: undefined,
            hardwareWallets: undefined,
          });

          return () => undefined;
        });
    });
    it("should not render a token amount component nor zero", () => {
      const { container } = render(NnsAccounts);

      // The tooltip wraps the total amount
      expect(
        container.querySelector(".tooltip-wrapper")
      ).not.toBeInTheDocument();
    });
  });
});
