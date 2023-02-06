/**
 * @jest-environment jsdom
 */

import CkBTCAccountsFooter from "$lib/components/accounts/CkBTCAccountsFooter.svelte";
import { ckBTCAccountsStore } from "$lib/stores/ckbtc-accounts.store";
import { tokensStore } from "$lib/stores/tokens.store";
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { mockCkBTCMainAccount } from "../../../mocks/ckbtc-accounts.mock";
import { mockTokens } from "../../../mocks/tokens.mock";

describe("CkBTCAccountsFooter", () => {
  afterEach(() => {
    jest.clearAllMocks();

    ckBTCAccountsStore.reset();
    tokensStore.reset();
  });

  describe("not loaded", () => {
    it("should not render action if data not loaded", () => {
      const { getByTestId } = render(CkBTCAccountsFooter);

      expect(() => expect(getByTestId("open-ckbtc-transaction"))).toThrow();
    });

    it("should not render action if only accounts loaded", () => {
      ckBTCAccountsStore.set({
        accounts: [mockCkBTCMainAccount],
        certified: true,
      });

      const { getByTestId } = render(CkBTCAccountsFooter);

      expect(() => expect(getByTestId("open-ckbtc-transaction"))).toThrow();
    });

    it("should not render action if only token loaded", () => {
      tokensStore.setTokens(mockTokens);

      const { getByTestId } = render(CkBTCAccountsFooter);

      expect(() => expect(getByTestId("open-ckbtc-transaction"))).toThrow();
    });
  });

  describe("loaded", () => {
    beforeEach(() => {
      ckBTCAccountsStore.set({
        accounts: [mockCkBTCMainAccount],
        certified: true,
      });

      tokensStore.setTokens(mockTokens);
    });

    it("should render action if all required data loaded", () => {
      const { getByTestId } = render(CkBTCAccountsFooter);

      expect(getByTestId("open-ckbtc-transaction")).not.toBeNull();
    });

    it("should open modal", async () => {
      const { getByTestId, container } = render(CkBTCAccountsFooter);

      fireEvent.click(
        getByTestId("open-ckbtc-transaction") as HTMLButtonElement
      );

      await waitFor(() =>
        expect(container.querySelector("div.modal")).not.toBeNull()
      );
    });
  });
});
