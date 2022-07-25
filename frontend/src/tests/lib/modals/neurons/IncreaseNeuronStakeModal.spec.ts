/**
 * @jest-environment jsdom
 */

import { LedgerCanister } from "@dfinity/nns";
import { fireEvent } from "@testing-library/dom";
import { waitFor } from "@testing-library/svelte";
import { NNSDappCanister } from "../../../../lib/canisters/nns-dapp/nns-dapp.canister";
import IncreaseNeuronStakeModal from "../../../../lib/modals/neurons/IncreaseNeuronStakeModal.svelte";
import { reloadNeuron } from "../../../../lib/services/neurons.services";
import { accountsStore } from "../../../../lib/stores/accounts.store";
import {
  mockAccountsStoreSubscribe,
  mockSubAccount,
} from "../../../mocks/accounts.store.mock";
import en from "../../../mocks/i18n.mock";
import { MockLedgerCanister } from "../../../mocks/ledger.canister.mock";
import { renderModal } from "../../../mocks/modal.mock";
import { mockFullNeuron, mockNeuron } from "../../../mocks/neurons.mock";
import { MockNNSDappCanister } from "../../../mocks/nns-dapp.canister.mock";

jest.mock("../../../../lib/services/neurons.services", () => {
  return {
    reloadNeuron: jest.fn(),
  };
});

describe("IncreaseNeuronStakeModal", () => {
  const mockLedgerCanister: MockLedgerCanister = new MockLedgerCanister();
  const mockNNSDappCanister: MockNNSDappCanister = new MockNNSDappCanister();

  beforeAll(() => {
    jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe([mockSubAccount]));

    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation((): LedgerCanister => mockLedgerCanister);

    jest
      .spyOn(NNSDappCanister, "create")
      .mockImplementation((): NNSDappCanister => mockNNSDappCanister);
  });

  afterEach(() => jest.clearAllMocks());

  it("should display modal", async () => {
    const { container } = await renderModal({
      component: IncreaseNeuronStakeModal,
      props: {
        neuron: mockNeuron,
      },
    });

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  const goToStep2 = async ({ container, getByText }) => {
    const mainAccount = container.querySelector(
      'article[role="button"]:first-of-type'
    ) as HTMLButtonElement;
    fireEvent.click(mainAccount);

    await waitFor(() =>
      expect(
        getByText(en.accounts.enter_icp_amount, { exact: false })
      ).toBeInTheDocument()
    );
  };

  const goToStep3 = async ({
    container,
    getByText,
    amount,
  }: {
    container: HTMLElement;
    getByText;
    amount?: string;
  }) => {
    if (amount !== undefined) {
      const input: HTMLInputElement = container.querySelector(
        "input"
      ) as HTMLInputElement;
      await fireEvent.input(input, { target: { value: amount } });
    }

    const button: HTMLButtonElement | null = container.querySelector(
      'button[type="submit"]'
    );

    await waitFor(() => expect(button?.getAttribute("disabled")).toBeNull());

    fireEvent.click(button as HTMLButtonElement);

    await waitFor(() =>
      expect(
        getByText(en.accounts.review_transaction, { exact: false })
      ).toBeInTheDocument()
    );
  };

  const goBack = async ({ container, getByText, title }) => {
    const back = container.querySelector("button.back") as HTMLButtonElement;
    fireEvent.click(back);

    await waitFor(() =>
      expect(getByText(title, { exact: false })).toBeInTheDocument()
    );
  };

  it("should navigate back and forth between steps", async () => {
    const { container, getByText } = await renderModal({
      component: IncreaseNeuronStakeModal,
      props: {
        neuron: mockNeuron,
      },
    });

    // Is step 1 active?
    expect(
      getByText(en.accounts.select_source, { exact: false })
    ).toBeInTheDocument();

    // Go to step 2.
    await goToStep2({ container, getByText });

    // Go back to step 1.
    await goBack({ container, getByText, title: en.accounts.select_source });

    // Go to step 2.
    await goToStep2({ container, getByText });

    // Go to step 3.
    await goToStep3({ container, getByText, amount: "1" });

    // Go back to step 2.
    await goBack({
      container,
      getByText,
      title: en.accounts.enter_icp_amount,
    });
  });

  it("should call reloadNeuron and close wizard once transaction executed", async () => {
    const transferSpy = jest.spyOn(mockLedgerCanister, "transfer");
    const { container, getByText, component } = await renderModal({
      component: IncreaseNeuronStakeModal,
      props: {
        neuron: mockNeuron,
      },
    });

    await goToStep2({ container, getByText });

    await goToStep3({ container, getByText, amount: "1" });

    const onClose = jest.fn();
    component.$on("nnsClose", onClose);
    const button = container.querySelector(
      "button[type='submit']"
    ) as HTMLButtonElement;
    await fireEvent.click(button);

    await waitFor(() => expect(onClose).toBeCalled());
    expect(reloadNeuron).toBeCalled();
    expect(transferSpy).toBeCalled();
  });

  it("should not make the transaction if stake plus amount is less than 1 ICP", async () => {
    const transferSpy = jest.spyOn(mockLedgerCanister, "transfer");
    const neuron = {
      ...mockNeuron,
      fullNeuron: {
        ...mockFullNeuron,
        cachedNeuronStake: BigInt(1_000),
      },
    };
    const { container, getByText, component } = await renderModal({
      component: IncreaseNeuronStakeModal,
      props: { neuron },
    });

    await goToStep2({ container, getByText });

    await goToStep3({ container, getByText, amount: "0.01" });

    const onClose = jest.fn();
    component.$on("nnsClose", onClose);
    const button = container.querySelector(
      "button[type='submit']"
    ) as HTMLButtonElement;
    await fireEvent.click(button);

    await waitFor(() => expect(onClose).toBeCalled());
    expect(reloadNeuron).not.toBeCalled();
    expect(transferSpy).not.toBeCalled();
  });
});
