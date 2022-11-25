/**
 * @jest-environment jsdom
 */

import ConfirmSnsDissolveDelay from "$lib/components/sns-neurons/ConfirmSnsDissolveDelay.svelte";
import { SECONDS_IN_DAY } from "$lib/constants/constants";
import { secondsToDuration } from "$lib/utils/date.utils";
import {
  getSnsNeuronIdAsHexString,
  getSnsNeuronStake,
} from "$lib/utils/sns-neuron.utils";
import { formatToken } from "$lib/utils/token.utils";
import { ICPToken } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import en from "../../../mocks/i18n.mock";
import { mockSnsNeuron } from "../../../mocks/sns-neurons.mock";

describe("ConfirmSnsDissolveDelay", () => {
  const delayInSeconds = 12.3 * SECONDS_IN_DAY;

  it("renders a delay", () => {
    const { getByText } = render(ConfirmSnsDissolveDelay, {
      props: {
        delayInSeconds,
        neuron: mockSnsNeuron,
        token: ICPToken,
      },
    });

    expect(
      getByText(secondsToDuration(BigInt(delayInSeconds)))
    ).toBeInTheDocument();
  });

  it("renders a neuron ID", () => {
    const { getByText } = render(ConfirmSnsDissolveDelay, {
      props: {
        delayInSeconds,
        neuron: mockSnsNeuron,
        token: ICPToken,
      },
    });

    expect(
      getByText(getSnsNeuronIdAsHexString(mockSnsNeuron))
    ).toBeInTheDocument();
  });

  it("renders a neuron stake", () => {
    const { getByText } = render(ConfirmSnsDissolveDelay, {
      props: {
        delayInSeconds,
        neuron: mockSnsNeuron,
        token: ICPToken,
      },
    });

    expect(
      getByText(
        formatToken({ value: getSnsNeuronStake(mockSnsNeuron), detailed: true })
      )
    ).toBeInTheDocument();
  });

  it("renders cancel button", () => {
    const { getByText } = render(ConfirmSnsDissolveDelay, {
      props: {
        delayInSeconds,
        neuron: mockSnsNeuron,
        token: ICPToken,
      },
    });
    expect(getByText(en.neurons.edit_delay)).toBeInTheDocument();
  });

  it("renders confirm button", () => {
    const { getByText } = render(ConfirmSnsDissolveDelay, {
      props: {
        delayInSeconds,
        neuron: mockSnsNeuron,
        token: ICPToken,
      },
    });
    expect(getByText(en.neurons.confirm_update_delay)).toBeInTheDocument();
  });
});
