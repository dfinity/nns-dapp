/**
 * @jest-environment jsdom
 */

import SnsNeuronAge from "$lib/components/sns-neurons/SnsNeuronAge.svelte";
import { SECONDS_IN_MONTH } from "$lib/constants/constants";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { SnsNeuronAgePo } from "$tests/page-objects/SnsNeuronAge.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("SnsNeuronAge", () => {
  const now = 1686806749421;
  const nowSeconds = Math.floor(now / 1000);
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
  });

  const renderComponent = (neuron: SnsNeuron) => {
    const { container } = render(SnsNeuronAge, { props: { neuron } });

    return SnsNeuronAgePo.under(new JestPageObjectElement(container));
  };

  it("should render neuron age if greater than 0", async () => {
    const neuronWithPositiveAge: SnsNeuron = {
      ...mockSnsNeuron,
      aging_since_timestamp_seconds: BigInt(nowSeconds - SECONDS_IN_MONTH),
    };

    const po = renderComponent(neuronWithPositiveAge);

    expect(await po.getNeuronAge()).toBe("30 days, 10 hours");
  });

  it("should render not neuron age if lower than 0", async () => {
    const neuronWithAge0: SnsNeuron = {
      ...mockSnsNeuron,
      aging_since_timestamp_seconds: BigInt(nowSeconds + SECONDS_IN_MONTH),
    };

    const po = renderComponent(neuronWithAge0);

    expect(await po.hasAge()).toBe(false);
  });
});
