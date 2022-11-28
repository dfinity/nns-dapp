/**
 * @jest-environment jsdom
 */

import TransactionReview from "$lib/modals/accounts/NewTransaction/TransactionReview.svelte";
import { authStore } from "$lib/stores/auth.store";
import { ICPToken, TokenAmount } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import { mockMainAccount } from "../../../../mocks/accounts.store.mock";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "../../../../mocks/auth.store.mock";

describe("TransactionReview", () => {
  jest
    .spyOn(authStore, "subscribe")
    .mockImplementation(mutableMockAuthStoreSubscribe);

  const icp1 = TokenAmount.fromString({
    amount: "1",
    token: ICPToken,
  }) as TokenAmount;

  const props = {
    props: {
      transaction: {
        sourceAccount: mockMainAccount,
        destinationAddress: "1234",
        amount: 1234,
      },
      disableSubmit: false,
      transactionFee: icp1,
      token: ICPToken,
    },
  };

  describe("signed in", () => {
    beforeAll(() => {
      authStoreMock.next({
        identity: mockIdentity,
      });
    });

    it("should render transaction execute button", () => {
      const { getByTestId } = render(TransactionReview, props);
      expect(getByTestId("transaction-button-execute")).not.toBeNull();
    });

    it("should render a sign in button", () => {
      const { getByTestId } = render(TransactionReview, props);
      expect(() => getByTestId("login-button")).toThrow();
    });
  });

  describe("not signed in", () => {
    beforeAll(() => {
      authStoreMock.next({
        identity: undefined,
      });
    });

    it("should not render transaction execute button", () => {
      const { getByTestId } = render(TransactionReview, props);
      expect(() => getByTestId("transaction-button-execute")).toThrow();
    });

    it("should render a sign in button", () => {
      const { getByTestId } = render(TransactionReview, props);
      expect(getByTestId("login-button")).not.toBeNull();
    });
  });
});
