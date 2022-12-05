/**
 * @jest-environment jsdom
 */

import SnsNeuronMaturityCard from "$lib/components/sns-neuron-detail/SnsNeuronMaturityCard.svelte";
import {
  SELECTED_SNS_NEURON_CONTEXT_KEY,
  type SelectedSnsNeuronContext,
  type SelectedSnsNeuronStore,
} from "$lib/types/sns-neuron-detail.context";
import {
  formattedSnsTotalMaturity,
  getSnsNeuronIdAsHexString,
} from "$lib/utils/sns-neuron.utils";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import { writable } from "svelte/store";
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

  it("renders maturity title", () => {
    const { queryByText } = renderSnsNeuronMaturityCard({ ...mockSnsNeuron });

    expect(queryByText(en.neuron_detail.maturity_title)).toBeInTheDocument();
  });

  it("renders formatted total maturity", () => {
    const { queryByText } = renderSnsNeuronMaturityCard({ ...mockSnsNeuron });
    expect(queryByText(en.neuron_detail.maturity_title)).toBeInTheDocument();

    const formatted = formattedSnsTotalMaturity({ ...mockSnsNeuron });

    expect(queryByText(formatted)).toBeInTheDocument();
  });

  it("should not render staked formatted maturity if not provided", () => {
    const { getByTestId } = renderSnsNeuronMaturityCard({ ...mockSnsNeuron, staked_maturity_e8s_equivalent: [] });

    expect(() => getByTestId("staked-maturity")).toThrow();
  });

  it("should render staked formatted maturity if provided", () => {
    const { getByTestId } = renderSnsNeuronMaturityCard({ ...mockSnsNeuron });

    expect(getByTestId("staked-maturity")).not.toBeNull();
  });
});
