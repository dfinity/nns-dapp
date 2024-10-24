import TransactionReview from "$lib/components/transaction/TransactionReview.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { ICPToken, TokenAmount } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("TransactionReview", () => {
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
    beforeEach(() => {
      resetIdentity();
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
    beforeEach(() => {
      setNoIdentity();
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
