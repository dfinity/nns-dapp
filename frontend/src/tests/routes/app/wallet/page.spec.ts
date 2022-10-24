/**
 * @jest-environment jsdom
 */
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { authStore } from "$lib/stores/auth.store";
import { page } from "$mocks/$app/stores";
import Wallet from "$routes/(app)/wallet/+page.svelte";
import { render } from "@testing-library/svelte";
import { mockAuthStoreSubscribe } from "../../../mocks/auth.store.mock";
import { principal } from "../../../mocks/sns-projects.mock";
import { mockSnsCanisterIdText } from "../../../mocks/sns.api.mock";

jest.mock("$lib/services/sns-accounts.services", () => {
  return {
    syncSnsAccounts: jest.fn().mockResolvedValue(undefined),
  };
});

describe("Wallet", () => {
  // TODO(GIX-1071): should render sign-in if not logged in

  beforeAll(() =>
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe)
  );

  describe("nns context", () => {
    it("should render NnsWallet", () => {
      const { getByTestId } = render(Wallet, {
        props: {
          data: {
            account: OWN_CANISTER_ID_TEXT,
          },
        },
      });
      expect(getByTestId("nns-wallet")).toBeInTheDocument();
    });
  });

  describe("sns context", () => {
    it("should render SnsWallet", () => {
      page.mock({ data: { universe: mockSnsCanisterIdText } });

      const { getByTestId } = render(Wallet, {
        props: {
          data: {
            account: principal(0).toText(),
          },
        },
      });
      expect(getByTestId("sns-wallet")).toBeInTheDocument();
    });
  });
});
