/**
 * @jest-environment jsdom
 */

import * as ledgerApi from "$lib/api/ledger.api";
import * as nnsDappApi from "$lib/api/nns-dapp.api";
import { SYNC_ACCOUNTS_RETRY_SECONDS } from "$lib/constants/accounts.constants";
import NnsAccounts from "$lib/pages/NnsAccounts.svelte";
import { cancelPollAccounts } from "$lib/services/accounts.services";
import { accountsStore } from "$lib/stores/accounts.store";
import { formatToken } from "$lib/utils/token.utils";
import { render, waitFor } from "@testing-library/svelte";
import {
  mockAccountDetails,
  mockHardwareWalletAccount,
  mockMainAccount,
  mockSubAccount,
} from "../../mocks/accounts.store.mock";

jest.mock("$lib/api/nns-dapp.api");
jest.mock("$lib/api/ledger.api");

describe("NnsAccounts", () => {
  const goToWallet = async () => {
    // Do nothing
  };

  afterEach(() => jest.clearAllMocks());

  describe("when there are accounts", () => {
    beforeEach(() => {
      accountsStore.set({
        main: mockMainAccount,
        subAccounts: [],
        hardwareWallets: [],
        certified: true,
      });
      cancelPollAccounts();
    });

    it("should render a main card", () => {
      const { queryByTestId } = render(NnsAccounts, { props: { goToWallet } });

      expect(queryByTestId("account-card")).not.toBeNull();
    });

    it("should render account icp in card too", () => {
      const { container } = render(NnsAccounts, { props: { goToWallet } });

      const cardTitleRow = container.querySelector(
        'article > div[data-tid="token-value-label"]'
      );

      expect(cardTitleRow?.textContent.trim()).toEqual(
        `${formatToken({ value: mockMainAccount.balance.toE8s() })} ICP`
      );
    });

    it("should render account identifier", () => {
      const { getByText } = render(NnsAccounts, { props: { goToWallet } });
      getByText(mockMainAccount.identifier);
    });

    it("should render subaccount cards", () => {
      accountsStore.set({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [],
        certified: true,
      });
      const { queryAllByTestId } = render(NnsAccounts, {
        props: { goToWallet },
      });

      const articles = queryAllByTestId("account-card");

      expect(articles).not.toBeNull();
      expect(articles.length).toBe(2);
    });

    it("should render hardware wallet account cards", () => {
      accountsStore.set({
        main: mockMainAccount,
        subAccounts: [],
        hardwareWallets: [mockHardwareWalletAccount],
        certified: true,
      });
      const { queryAllByTestId } = render(NnsAccounts, {
        props: { goToWallet },
      });

      const articles = queryAllByTestId("account-card");

      expect(articles).not.toBeNull();
      expect(articles.length).toBe(2);
    });
  });

  describe("summary", () => {
    beforeAll(() => {
      jest.clearAllMocks();
      accountsStore.set({
        main: mockMainAccount,
        subAccounts: [mockSubAccount],
        hardwareWallets: [mockHardwareWalletAccount],
        certified: true,
      });
    });

    it("should contain a tooltip", () => {
      const { container } = render(NnsAccounts, { props: { goToWallet } });

      expect(container.querySelector(".tooltip-wrapper")).toBeInTheDocument();
    });
  });

  describe("when no accounts", () => {
    beforeEach(() => {
      accountsStore.reset();
      const mainBalanceE8s = BigInt(10_000_000);
      jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      jest
        .spyOn(nnsDappApi, "queryAccount")
        .mockResolvedValue(mockAccountDetails);
    });
    it("should not render a token amount component nor zero", () => {
      const { container } = render(NnsAccounts, { props: { goToWallet } });

      // The tooltip wraps the total amount
      expect(
        container.querySelector(".tooltip-wrapper")
      ).not.toBeInTheDocument();
    });

    it("should load accounts", async () => {
      const { queryByTestId } = render(NnsAccounts, { props: { goToWallet } });

      expect(queryByTestId("account-card")).toBeNull();

      await waitFor(() => expect(queryByTestId("account-card")).not.toBeNull());
    });
  });

  describe("when no accounts and user navigates away", () => {
    let spyQueryAccount: jest.SpyInstance;
    beforeEach(() => {
      accountsStore.reset();
      jest.clearAllTimers();
      jest.clearAllMocks();
      cancelPollAccounts();
      const now = Date.now();
      jest.useFakeTimers().setSystemTime(now);
      const mainBalanceE8s = BigInt(10_000_000);
      jest
        .spyOn(ledgerApi, "queryAccountBalance")
        .mockResolvedValue(mainBalanceE8s);
      spyQueryAccount = jest
        .spyOn(nnsDappApi, "queryAccount")
        .mockRejectedValue(new Error("connection error"));
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });

    it("should stop polling", async () => {
      const { unmount } = render(NnsAccounts, { props: { goToWallet } });

      let counter = 0;
      let retryDelay = SYNC_ACCOUNTS_RETRY_SECONDS * 1000;
      const retriesBeforeLeaving = 3;
      const extraRetries = 4;
      while (counter < retriesBeforeLeaving + extraRetries) {
        expect(spyQueryAccount).toBeCalledTimes(
          Math.min(counter, retriesBeforeLeaving)
        );
        counter += 1;
        // Make sure the timers are set before we advance time.
        await null;
        await null;
        await null;
        jest.advanceTimersByTime(retryDelay);
        retryDelay *= 2;
        await waitFor(() =>
          expect(spyQueryAccount).toBeCalledTimes(
            Math.min(counter, retriesBeforeLeaving)
          )
        );

        if (counter === retriesBeforeLeaving) {
          unmount();
        }
      }

      expect(counter).toBe(retriesBeforeLeaving + extraRetries);

      expect(spyQueryAccount).toHaveBeenCalledTimes(retriesBeforeLeaving);
    });
  });
});
