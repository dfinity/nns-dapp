/**
 * @jest-environment jsdom
 */

import { GovernanceCanister, LedgerCanister } from "@dfinity/nns";
import { fireEvent, render } from "@testing-library/svelte";
import { mock } from "jest-mock-extended";
import CreateNeuronModal from "../../../lib/modals/neurons/CreateNeuronModal.svelte";
import { stakeNeuron } from "../../../lib/services/neurons.services";
import { accountsStore } from "../../../lib/stores/accounts.store";
import { mockAccountsStoreSubscribe } from "../../mocks/accounts.store.mock";

const en = require("../../../lib/i18n/en.json");

jest.mock("../../../lib/services/neurons.services", () => {
  return {
    stakeNeuron: jest.fn().mockResolvedValue(undefined),
  };
});

jest.mock("../../../lib/services/accounts.services", () => {
  return {
    syncAccounts: jest.fn().mockResolvedValue(undefined),
  };
});

describe("CreateNeuronModal", () => {
  beforeEach(() => {
    jest
      .spyOn(accountsStore, "subscribe")
      .mockImplementation(mockAccountsStoreSubscribe());
    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation(() => mock<LedgerCanister>());
    jest
      .spyOn(GovernanceCanister, "create")
      .mockImplementation(() => mock<GovernanceCanister>());
  });

  it("should display modal", () => {
    const { container } = render(CreateNeuronModal);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should display accounts as cards", () => {
    const { container } = render(CreateNeuronModal);

    expect(container.querySelector('article[role="button"]')).not.toBeNull();
  });

  it("should be able to select an account and move to the next view", async () => {
    const { container, queryByText } = render(CreateNeuronModal);

    const accountCard = container.querySelector('article[role="button"]');
    expect(accountCard).not.toBeNull();

    await fireEvent.click(accountCard);

    expect(queryByText(en.neurons.stake_neuron)).not.toBeNull();
  });

  it("should have disabled Create neuron button", async () => {
    const { container, queryByText } = render(CreateNeuronModal);

    const accountCard = container.querySelector('article[role="button"]');
    expect(accountCard).not.toBeNull();

    await fireEvent.click(accountCard);

    expect(queryByText(en.neurons.stake_neuron)).not.toBeNull();

    const createButton = container.querySelector('button[type="submit"]');
    expect(createButton).not.toBeNull();
    expect(createButton.getAttribute("disabled")).not.toBeNull();
  });

  it("should have enabled Create neuron button when entering amount", async () => {
    const { container, queryByText } = render(CreateNeuronModal);

    const accountCard = container.querySelector('article[role="button"]');
    expect(accountCard).not.toBeNull();

    await fireEvent.click(accountCard);

    expect(queryByText(en.neurons.stake_neuron)).not.toBeNull();

    const input = container.querySelector('input[name="amount"]');
    // Svelte generates code for listening to the `input` event
    // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
    await fireEvent.input(input, { target: { value: 22 } });

    const createButton = container.querySelector('button[type="submit"]');
    expect(createButton).not.toBeNull();
    expect(createButton.getAttribute("disabled")).toBeNull();
  });

  it("should be able to create a new neuron", async () => {
    const { container } = render(CreateNeuronModal);

    const accountCard = container.querySelector('article[role="button"]');
    expect(accountCard).not.toBeNull();

    await fireEvent.click(accountCard);

    const input = container.querySelector('input[name="amount"]');
    // Svelte generates code for listening to the `input` event
    // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
    await fireEvent.input(input, { target: { value: 22 } });

    const createButton = container.querySelector('button[type="submit"]');

    await fireEvent.click(createButton);

    expect(stakeNeuron).toBeCalled();
  });
});
