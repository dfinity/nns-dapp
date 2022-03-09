/**
 * @jest-environment jsdom
 */

import { GovernanceCanister, LedgerCanister, NeuronInfo } from "@dfinity/nns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { mock } from "jest-mock-extended";
import { E8S_PER_ICP } from "../../../lib/constants/icp.constants";
import * as en from "../../../lib/i18n/en.json";
import CreateNeuronModal from "../../../lib/modals/neurons/CreateNeuronModal.svelte";
import {
  stakeNeuron,
  updateDelay,
} from "../../../lib/services/neurons.services";
import { accountsStore } from "../../../lib/stores/accounts.store";
import { authStore } from "../../../lib/stores/auth.store";
import { neuronsStore } from "../../../lib/stores/neurons.store";
import { mockAccountsStoreSubscribe } from "../../mocks/accounts.store.mock";
import { mockAuthStoreSubscribe } from "../../mocks/auth.store.mock";
import {
  buildMockNeuronsStoreSubscibe,
  fullNeuronMock,
  neuronMock,
} from "../../mocks/neurons.mock";

jest.mock("../../../lib/services/neurons.services", () => {
  return {
    // need to return the same neuron id as mockNeuron.neuronId
    stakeNeuron: jest.fn().mockResolvedValue(BigInt(1)),
    updateDelay: jest.fn().mockResolvedValue(undefined),
    listNeuron: jest.fn().mockResolvedValue(undefined),
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
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
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

    accountCard && (await fireEvent.click(accountCard));

    expect(queryByText(en.neurons.stake_neuron)).not.toBeNull();
  });

  it("should have disabled Create neuron button", async () => {
    const { container, queryByText } = render(CreateNeuronModal);

    const accountCard = container.querySelector('article[role="button"]');
    expect(accountCard).not.toBeNull();

    accountCard && (await fireEvent.click(accountCard));

    expect(queryByText(en.neurons.stake_neuron)).not.toBeNull();

    const createButton = container.querySelector('button[type="submit"]');
    expect(createButton?.getAttribute("disabled")).not.toBeNull();
  });

  it("should have enabled Create neuron button when entering amount", async () => {
    const { container, queryByText } = render(CreateNeuronModal);

    const accountCard = container.querySelector('article[role="button"]');
    expect(accountCard).not.toBeNull();

    accountCard && (await fireEvent.click(accountCard));

    expect(queryByText(en.neurons.stake_neuron)).not.toBeNull();

    const input = container.querySelector('input[name="amount"]');
    // Svelte generates code for listening to the `input` event
    // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
    input && (await fireEvent.input(input, { target: { value: 22 } }));

    const createButton = container.querySelector('button[type="submit"]');
    expect(createButton?.getAttribute("disabled")).toBeNull();
  });

  it("should be able to create a new neuron", async () => {
    const { container } = render(CreateNeuronModal);

    const accountCard = container.querySelector('article[role="button"]');
    expect(accountCard).not.toBeNull();

    accountCard && (await fireEvent.click(accountCard));

    const input = container.querySelector('input[name="amount"]');
    // Svelte generates code for listening to the `input` event
    // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
    input && (await fireEvent.input(input, { target: { value: 22 } }));

    const createButton = container.querySelector('button[type="submit"]');

    createButton && (await fireEvent.click(createButton));

    expect(stakeNeuron).toBeCalled();
  });

  it("should move to update dissolve delay after creating a neuron", async () => {
    jest
      .spyOn(neuronsStore, "subscribe")
      .mockImplementation(buildMockNeuronsStoreSubscibe([neuronMock]));
    const { container } = render(CreateNeuronModal);

    const accountCard = container.querySelector('article[role="button"]');
    expect(accountCard).not.toBeNull();

    accountCard && (await fireEvent.click(accountCard));

    const input = container.querySelector('input[name="amount"]');
    // Svelte generates code for listening to the `input` event
    // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
    input && (await fireEvent.input(input, { target: { value: 22 } }));

    const createButton = container.querySelector('button[type="submit"]');

    createButton && (await fireEvent.click(createButton));

    await waitFor(() =>
      expect(
        container.querySelector("[data-tid='update-button']")
      ).not.toBeNull()
    );
  });

  it("should have the update delay button disabled", async () => {
    jest
      .spyOn(neuronsStore, "subscribe")
      .mockImplementation(buildMockNeuronsStoreSubscibe([neuronMock]));
    const { container } = render(CreateNeuronModal);

    const accountCard = container.querySelector('article[role="button"]');
    expect(accountCard).not.toBeNull();

    accountCard && (await fireEvent.click(accountCard));

    const input = container.querySelector('input[name="amount"]');
    // Svelte generates code for listening to the `input` event
    // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
    input && (await fireEvent.input(input, { target: { value: 22 } }));

    const createButton = container.querySelector('button[type="submit"]');

    createButton && (await fireEvent.click(createButton));

    await waitFor(() =>
      expect(
        container.querySelector("[data-tid='update-button']")
      ).not.toBeNull()
    );
    const updateDelayButton = container.querySelector(
      '[data-tid="update-button"]'
    );
    expect(updateDelayButton?.getAttribute("disabled")).not.toBeNull();
  });

  it("should have disabled button for dissolve less than six months", async () => {
    jest
      .spyOn(neuronsStore, "subscribe")
      .mockImplementation(buildMockNeuronsStoreSubscibe([neuronMock]));
    const { container } = render(CreateNeuronModal);

    const accountCard = container.querySelector('article[role="button"]');
    expect(accountCard).not.toBeNull();

    accountCard && (await fireEvent.click(accountCard));

    const input = container.querySelector('input[name="amount"]');
    // Svelte generates code for listening to the `input` event
    // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
    input && (await fireEvent.input(input, { target: { value: 22 } }));

    const createButton = container.querySelector('button[type="submit"]');

    createButton && (await fireEvent.click(createButton));

    await waitFor(() =>
      expect(container.querySelector('input[type="range"]')).not.toBeNull()
    );
    const inputRange = container.querySelector('input[type="range"]');

    const FIVE_MONTHS = 60 * 60 * 24 * 30 * 5;
    inputRange &&
      (await fireEvent.input(inputRange, { target: { value: FIVE_MONTHS } }));

    const updateDelayButton = container.querySelector(
      '[data-tid="update-button"]'
    );
    expect(updateDelayButton?.getAttribute("disabled")).not.toBeNull();
  });

  it("should be able to change dissolve delay value", async () => {
    jest
      .spyOn(neuronsStore, "subscribe")
      .mockImplementation(buildMockNeuronsStoreSubscibe([neuronMock]));

    const { container } = render(CreateNeuronModal);

    const accountCard = container.querySelector('article[role="button"]');
    expect(accountCard).not.toBeNull();

    accountCard && (await fireEvent.click(accountCard));

    const input = container.querySelector('input[name="amount"]');
    // Svelte generates code for listening to the `input` event
    // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
    input && (await fireEvent.input(input, { target: { value: 22 } }));

    const createButton = container.querySelector('button[type="submit"]');

    createButton && (await fireEvent.click(createButton));

    await waitFor(() =>
      expect(container.querySelector('input[type="range"]')).not.toBeNull()
    );
    const inputRange = container.querySelector('input[type="range"]');

    const ONE_YEAR = 60 * 60 * 24 * 365;
    inputRange &&
      (await fireEvent.input(inputRange, { target: { value: ONE_YEAR } }));

    const updateDelayButton = container.querySelector(
      '[data-tid="update-button"]'
    );
    await waitFor(() =>
      expect(updateDelayButton?.getAttribute("disabled")).toBeNull()
    );

    updateDelayButton && (await fireEvent.click(updateDelayButton));
    await waitFor(() => expect(updateDelay).toBeCalled());
  });

  it("should be able to create a neuron and see the stake of the new neuron in the dissolve modal", async () => {
    const neuronStake = 2.2;
    const newNeuron: NeuronInfo = {
      ...neuronMock,
      fullNeuron: {
        ...fullNeuronMock,
        cachedNeuronStake: BigInt(Math.round(neuronStake * E8S_PER_ICP)),
      },
    };
    jest
      .spyOn(neuronsStore, "subscribe")
      .mockImplementation(buildMockNeuronsStoreSubscibe([newNeuron]));

    const { container, getByText } = render(CreateNeuronModal);

    const accountCard = container.querySelector('article[role="button"]');
    expect(accountCard).not.toBeNull();

    accountCard && (await fireEvent.click(accountCard));

    const input = container.querySelector('input[name="amount"]');
    // Svelte generates code for listening to the `input` event
    // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
    input && (await fireEvent.input(input, { target: { value: neuronStake } }));

    const createButton = container.querySelector('button[type="submit"]');

    createButton && (await fireEvent.click(createButton));

    await waitFor(() =>
      expect(container.querySelector('input[type="range"]')).not.toBeNull()
    );

    expect(getByText(neuronStake, { exact: false })).not.toBeNull();
  });
});
