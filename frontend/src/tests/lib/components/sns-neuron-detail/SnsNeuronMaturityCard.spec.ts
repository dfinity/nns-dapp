/**
 * @jest-environment jsdom
 */

import SnsNeuronMaturityCard from "$lib/components/sns-neuron-detail/SnsNeuronMaturityCard.svelte";
import { authStore } from "$lib/stores/auth.store";
import {
  SELECTED_SNS_NEURON_CONTEXT_KEY,
  type SelectedSnsNeuronContext,
  type SelectedSnsNeuronStore,
} from "$lib/types/sns-neuron-detail.context";
import {
  formattedTotalMaturity,
  getSnsNeuronIdAsHexString,
} from "$lib/utils/sns-neuron.utils";
import type { SnsNeuron } from "@dfinity/sns";
import { SnsNeuronPermissionType } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import { writable } from "svelte/store";
import {
  mockAuthStoreSubscribe,
  mockIdentity,
} from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";
import { mockSnsNeuron } from "../../../mocks/sns-neurons.mock";
import ContextWrapperTest from "../ContextWrapperTest.svelte";

describe("SnsNeuronMaturityCard", () => {
  const renderSnsNeuronMaturityCard = (neuron: SnsNeuron) =>
    render(ContextWrapperTest, {
      props: {
        contextKey: SELECTED_SNS_NEURON_CONTEXT_KEY,
        contextValue: {
          store: writable<SelectedSnsNeuronStore>({
            selected: {
              neuronIdHex: getSnsNeuronIdAsHexString(neuron),
              rootCanisterId: null,
            },
            neuron,
          }),
        } as SelectedSnsNeuronContext,
        Component: SnsNeuronMaturityCard,
      },
    });

  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("renders maturity title", () => {
    const { queryByText } = renderSnsNeuronMaturityCard({ ...mockSnsNeuron });

    expect(queryByText(en.neuron_detail.maturity_title)).toBeInTheDocument();
  });

  it("renders formatted total maturity", () => {
    const { queryByText } = renderSnsNeuronMaturityCard({ ...mockSnsNeuron });
    expect(queryByText(en.neuron_detail.maturity_title)).toBeInTheDocument();

    const formatted = formattedTotalMaturity({ ...mockSnsNeuron });

    expect(queryByText(formatted)).toBeInTheDocument();
  });

  it("should not render staked formatted maturity if not provided", () => {
    const { getByTestId } = renderSnsNeuronMaturityCard({
      ...mockSnsNeuron,
      staked_maturity_e8s_equivalent: [],
    });

    expect(() => getByTestId("staked-maturity")).toThrow();
  });

  it("should render staked formatted maturity if provided", () => {
    const { getByTestId } = renderSnsNeuronMaturityCard({ ...mockSnsNeuron });

    expect(getByTestId("staked-maturity")).not.toBeNull();
  });

  it("should hide stake maturity actions if no permission to stake the maturity", () => {
    const { getByTestId } = renderSnsNeuronMaturityCard({ ...mockSnsNeuron });

    expect(() => getByTestId("stake-maturity-actions")).toThrow();
  });

  it("should display stake maturity actions if permission to stake the maturity is set", () => {
    const neuron = {
      ...mockSnsNeuron,
      permissions: [
        {
          principal: [mockIdentity.getPrincipal()],
          permission_type: [
            SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_STAKE_MATURITY,
          ],
        },
      ],
    };
    const { getByTestId } = renderSnsNeuronMaturityCard(
      neuron as unknown as SnsNeuron
    );

    expect(getByTestId("stake-maturity-actions")).toBeInTheDocument();
  });
});
