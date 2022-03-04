/**
 * @jest-environment jsdom
 */

import { GovernanceCanister, LedgerCanister } from "@dfinity/nns";
import { fireEvent, render } from "@testing-library/svelte";
import { mock } from "jest-mock-extended";
import { tick } from "svelte";
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
    expect(createButton).not.toBeNull();
    createButton &&
      expect(createButton.getAttribute("disabled")).not.toBeNull();
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
    expect(createButton).not.toBeNull();
    createButton && expect(createButton.getAttribute("disabled")).toBeNull();
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
    const { container, queryByText } = render(CreateNeuronModal);

    const accountCard = container.querySelector('article[role="button"]');
    expect(accountCard).not.toBeNull();

    accountCard && (await fireEvent.click(accountCard));

    const input = container.querySelector('input[name="amount"]');
    // Svelte generates code for listening to the `input` event
    // https://github.com/testing-library/svelte-testing-library/issues/29#issuecomment-498055823
    input && (await fireEvent.input(input, { target: { value: 22 } }));

    const createButton = container.querySelector('button[type="submit"]');

    createButton && (await fireEvent.click(createButton));

    // create neuron tick
    await tick();
    expect(queryByText(en.neurons.set_dissolve_delay)).not.toBeNull();
  });

  it("should have the update delay button disabled", async () => {
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

    // create neuron tick
    await tick();

    const updateDelayButton = container.querySelector(
      '[data-test="update-button"]'
    );
    updateDelayButton &&
      expect(updateDelayButton.getAttribute("disabled")).not.toBeNull();
  });

  it("should have disabled button for dissolve less than six months", async () => {
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

    // create neuron tick
    await tick();

    const inputRange = container.querySelector('input[type="range"]');
    const FIVE_MONTHS = 60 * 60 * 24 * 30 * 5;
    inputRange &&
      (await fireEvent.input(inputRange, { target: { value: FIVE_MONTHS } }));

    const updateDelayButton = container.querySelector(
      '[data-test="update-button"]'
    );
    updateDelayButton &&
      expect(updateDelayButton.getAttribute("disabled")).not.toBeNull();
  });

  it("should be able to change dissolve delay value and enable button", async () => {
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

    // create neuron tick
    await tick();

    const inputRange = container.querySelector('input[type="range"]');
    const ONE_YEAR = 60 * 60 * 24 * 365;
    inputRange &&
      (await fireEvent.input(inputRange, { target: { value: ONE_YEAR } }));

    const updateDelayButton = container.querySelector(
      '[data-test="update-button"]'
    );
    updateDelayButton &&
      expect(updateDelayButton.getAttribute("disabled")).toBeNull();
  });
});
