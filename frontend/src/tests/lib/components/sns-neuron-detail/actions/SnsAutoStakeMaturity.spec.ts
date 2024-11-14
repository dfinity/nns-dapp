import SnsAutoStakeMaturity from "$lib/components/sns-neuron-detail/actions/SnsAutoStakeMaturity.svelte";
import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
import * as snsNeuronsServices from "$lib/services/sns-neurons.services";
import { toggleAutoStakeMaturity } from "$lib/services/sns-neurons.services";
import { mockPrincipal, resetIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { mockTokenStore } from "$tests/mocks/sns-projects.mock";
import { toastsStore } from "@dfinity/gix-components";
import { SnsNeuronPermissionType } from "@dfinity/sns";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { get } from "svelte/store";
import SnsNeuronContextTest from "../SnsNeuronContextTest.svelte";

describe("SnsAutoStakeMaturity", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    toastsStore.reset();
    resetIdentity();
    vi.spyOn(snsNeuronsServices, "toggleAutoStakeMaturity").mockResolvedValue({
      success: true,
    });
    vi.spyOn(snsTokenSymbolSelectedStore, "subscribe").mockImplementation(
      mockTokenStore
    );
  });

  it("renders checkbox", () => {
    const { queryByTestId } = render(SnsNeuronContextTest, {
      props: {
        neuron: {
          ...mockSnsNeuron,
        },
        rootCanisterId: mockPrincipal,
        testComponent: SnsAutoStakeMaturity,
      },
    });

    expect(queryByTestId("checkbox")).toBeInTheDocument();
  });

  const testCheckBox = (autoStakeMaturity: boolean | undefined) => {
    const { queryByTestId } = render(SnsNeuronContextTest, {
      props: {
        neuron: {
          ...mockSnsNeuron,
          auto_stake_maturity: [autoStakeMaturity],
        },
        rootCanisterId: mockPrincipal,
        testComponent: SnsAutoStakeMaturity,
      },
    });

    const inputElement = queryByTestId("checkbox") as HTMLInputElement;

    if (autoStakeMaturity === true) {
      expect(inputElement.checked).toBeTruthy();
      return;
    }

    expect(inputElement.checked).toBe(false);
  };

  it("renders checked if auto stake already on", () => testCheckBox(true));

  it("renders unchecked if auto stake already false", () =>
    testCheckBox(false));

  it("renders unchecked if auto stake is undefined", () =>
    testCheckBox(undefined));

  it("renders a disabled checkbox if neuron is not controllable", async () => {
    const { queryByTestId } = render(SnsNeuronContextTest, {
      props: {
        neuron: {
          ...mockSnsNeuron,
          auto_stake_maturity: [true],
          permissions: [],
        },
        rootCanisterId: mockPrincipal,
        testComponent: SnsAutoStakeMaturity,
      },
    });

    const inputElement = queryByTestId("checkbox") as HTMLInputElement;

    expect(inputElement.checked).toBeTruthy();
    expect(inputElement.disabled).toBeTruthy();
  });

  it("renders an enabled checkbox if neuron is controllable", async () => {
    const { queryByTestId } = render(SnsNeuronContextTest, {
      props: {
        neuron: {
          ...mockSnsNeuron,
          auto_stake_maturity: [true],
          permissions: [
            {
              principal: [mockPrincipal],
              permission_type: Int32Array.from([
                SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_STAKE_MATURITY,
              ]),
            },
          ],
        },
        rootCanisterId: mockPrincipal,
        testComponent: SnsAutoStakeMaturity,
      },
    });

    const inputElement = queryByTestId("checkbox") as HTMLInputElement;

    expect(inputElement.checked).toBeTruthy();
    expect(inputElement.disabled).toBeFalsy();
  });

  const toggleAutoStake = async ({
    neuronAutoStakeMaturity,
  }: {
    neuronAutoStakeMaturity: boolean | undefined;
  }) => {
    const { container, queryByTestId } = render(SnsNeuronContextTest, {
      props: {
        neuron: {
          ...mockSnsNeuron,
          auto_stake_maturity: [neuronAutoStakeMaturity],
          permissions: [
            {
              principal: [mockPrincipal],
              permission_type: Int32Array.from([
                SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_STAKE_MATURITY,
              ]),
            },
          ],
        },
        rootCanisterId: mockPrincipal,
        testComponent: SnsAutoStakeMaturity,
      },
    });

    const inputElement = container.querySelector("input[type='checkbox']");
    expect(inputElement).not.toBeNull();

    inputElement && (await fireEvent.click(inputElement));

    const modal = queryByTestId("auto-stake-confirm-modal");
    expect(modal).toBeInTheDocument();

    const confirmButton = queryByTestId("confirm-yes");
    expect(confirmButton).toBeInTheDocument();

    confirmButton && (await fireEvent.click(confirmButton));
  };

  it("should call toggleAutoStakeMaturity neuron service on confirmation", async () => {
    await toggleAutoStake({ neuronAutoStakeMaturity: undefined });
    expect(toggleAutoStakeMaturity).toBeCalled();
  });

  it("should call toggleAutoStakeMaturity neuron service on confirmation", async () => {
    await toggleAutoStake({ neuronAutoStakeMaturity: undefined });
    await waitFor(() => expect(get(toastsStore)[0]).toBeDefined());
    expect(get(toastsStore)[0]).toMatchObject({
      level: "success",
      text: en.neuron_detail.auto_stake_maturity_on_success,
    });
  });

  it("should show success message when disabling", async () => {
    await toggleAutoStake({ neuronAutoStakeMaturity: true });
    await waitFor(() => expect(get(toastsStore)[0]).toBeDefined());
    expect(get(toastsStore)[0]).toMatchObject({
      level: "success",
      text: en.neuron_detail.auto_stake_maturity_off_success,
    });
  });
});
