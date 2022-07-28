/**
 * @jest-environment jsdom
 */
import { fireEvent } from "@testing-library/dom";
import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import {
  getIcpToCyclesExchangeRate,
  topUpCanister,
} from "../../../../lib/services/canisters.services";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import { toastsStore } from "../../../../lib/stores/toasts.store";
import {
  mockAccountsStoreSubscribe,
  mockHardwareWalletAccount,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import { renderModal } from "../../../mocks/modal.mock";
import { clickByTestId } from "../../testHelpers/clickByTestId";
import AddCyclesModalTest from "./AddCyclesModalTest.svelte";

jest.mock("../../../../lib/services/canisters.services", () => {
  return {
    getIcpToCyclesExchangeRate: jest.fn().mockResolvedValue(BigInt(100_000)),
    topUpCanister: jest.fn().mockResolvedValue({ success: true }),
  };
});

jest.mock("../../../../lib/stores/toasts.store", () => {
  return {
    toastsStore: {
      success: jest.fn(),
    },
  };
});

describe("AddCyclesModal", () => {
  jest
    .spyOn(accountsStore, "subscribe")
    .mockImplementation(
      mockAccountsStoreSubscribe([mockSubAccount], [mockHardwareWalletAccount])
    );

  const reloadDetails = jest.fn();
  const props = { reloadDetails };
  afterEach(() => jest.clearAllMocks());
  it("should display modal", () => {
    const { container } = render(AddCyclesModalTest, { props });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should be able to go back", async () => {
    const { queryByTestId, queryAllByTestId, container } = await renderModal({
      component: AddCyclesModalTest,
      props,
    });
    // Wait for the onMount to load the conversion rate
    await waitFor(() => expect(getIcpToCyclesExchangeRate).toBeCalled());
    // wait to update local variable with conversion rate
    await tick();

    // Select Account Screen
    const accountCards = queryAllByTestId("account-card");
    expect(accountCards.length).toBe(2);

    fireEvent.click(accountCards[0]);

    // Select Amount Screen
    await waitFor(() =>
      expect(queryByTestId("select-cycles-screen")).toBeInTheDocument()
    );

    await clickByTestId(queryByTestId, "select-cycles-button-back");

    // Back to: Select Account Screen
    await waitFor(() =>
      expect(queryByTestId("select-account-screen")).toBeInTheDocument()
    );

    const accountCards2 = queryAllByTestId("account-card");

    fireEvent.click(accountCards2[0]);

    // Select Amount Screen
    await waitFor(() =>
      expect(queryByTestId("select-cycles-screen")).toBeInTheDocument()
    );

    const icpInputElement = container.querySelector('input[name="icp-amount"]');
    expect(icpInputElement).not.toBeNull();

    icpInputElement &&
      (await fireEvent.input(icpInputElement, {
        target: { value: 2 },
      }));
    icpInputElement && (await fireEvent.blur(icpInputElement));

    await clickByTestId(queryByTestId, "select-cycles-button");

    // Confirm Create Canister Screen
    await waitFor(() =>
      expect(
        queryByTestId("confirm-cycles-canister-screen")
      ).toBeInTheDocument()
    );

    await clickByTestId(queryByTestId, "confirm-cycles-canister-button-back");

    // Select Amount Screen
    await waitFor(() =>
      expect(queryByTestId("select-cycles-screen")).toBeInTheDocument()
    );
  });

  it("should top up a canister from ICP and close modal", async () => {
    const { queryByTestId, queryAllByTestId, container, component } =
      await renderModal({
        component: AddCyclesModalTest,
        props,
      });
    // Wait for the onMount to load the conversion rate
    await waitFor(() => expect(getIcpToCyclesExchangeRate).toBeCalled());
    // wait to update local variable with conversion rate
    await tick();

    // Select Account Screen
    const accountCards = queryAllByTestId("account-card");
    expect(accountCards.length).toBe(2);

    fireEvent.click(accountCards[0]);

    // Select Amount Screen
    await waitFor(() =>
      expect(queryByTestId("select-cycles-screen")).toBeInTheDocument()
    );

    const icpInputElement = container.querySelector('input[name="icp-amount"]');
    expect(icpInputElement).not.toBeNull();

    icpInputElement &&
      (await fireEvent.input(icpInputElement, {
        target: { value: 2 },
      }));
    icpInputElement && (await fireEvent.blur(icpInputElement));

    await clickByTestId(queryByTestId, "select-cycles-button");

    // Confirm Create Canister Screen
    await waitFor(() =>
      expect(
        queryByTestId("confirm-cycles-canister-screen")
      ).toBeInTheDocument()
    );

    const done = jest.fn();
    component.$on("nnsClose", done);

    await clickByTestId(queryByTestId, "confirm-cycles-canister-button");

    await waitFor(() => expect(done).toBeCalled());
    expect(topUpCanister).toBeCalled();
    expect(reloadDetails).toBeCalled();
    expect(toastsStore.success).toBeCalled();
  });

  // We added the hardware wallet in the accountsStore subscribe mock above.
  it("should not show hardware wallets in the accounts list", async () => {
    const { queryAllByTestId, queryByText } = await renderModal({
      component: AddCyclesModalTest,
      props,
    });
    // Wait for the onMount to load the conversion rate
    await waitFor(() => expect(getIcpToCyclesExchangeRate).toBeCalled());
    // wait to update local variable with conversion rate
    await tick();

    const accountCards = queryAllByTestId("account-card");

    expect(accountCards.length).toBe(2);
    expect(queryByText(mockHardwareWalletAccount.name as string)).toBeNull();
  });
});
