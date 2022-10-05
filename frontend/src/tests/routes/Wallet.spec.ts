/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/svelte";
import { OWN_CANISTER_ID } from "../../lib/constants/canister-ids.constants";
import { CONTEXT_PATH } from "../../lib/constants/routes.constants";
import { routeStore } from "../../lib/stores/route.store";
import Wallet from "../../routes/Wallet.svelte";
import { principal } from "../mocks/sns-projects.mock";

jest.mock("../../lib/services/sns-accounts.services", () => {
  return {
    loadSnsAccounts: jest.fn().mockResolvedValue(undefined),
  };
});

describe("Wallet", () => {
  describe("nns context", () => {
    it("should render NnsWallet", () => {
      const snsWalletPath = `${CONTEXT_PATH}/${OWN_CANISTER_ID.toText()}/wallet/1234`;
      routeStore.update({ path: snsWalletPath });
      const { getByTestId } = render(Wallet);
      expect(getByTestId("nns-wallet")).toBeInTheDocument();
    });
  });

  describe("sns context", () => {
    it("should render NnsWallet", () => {
      const snsWalletPath = `${CONTEXT_PATH}/${principal(0)}/wallet/1234`;
      routeStore.update({ path: snsWalletPath });
      const { getByTestId } = render(Wallet);
      expect(getByTestId("sns-wallet")).toBeInTheDocument();
    });
  });
});
