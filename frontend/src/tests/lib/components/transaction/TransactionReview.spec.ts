import TransactionReview from "$lib/components/transaction/TransactionReview.svelte";
import { authStore } from "$lib/stores/auth.store";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "$tests/mocks/auth.store.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { render } from "@testing-library/svelte";
import { vi } from "vitest";

describe("TransactionReview", () => {
  vi.spyOn(authStore, "subscribe").mockImplementation(
    mutableMockAuthStoreSubscribe
  );

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
