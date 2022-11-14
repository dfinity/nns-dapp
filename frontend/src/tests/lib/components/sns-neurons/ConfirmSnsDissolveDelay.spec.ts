/**
 * @jest-environment jsdom
 */

import ConfirmSnsDissolveDelay from "$lib/components/sns-neurons/ConfirmSnsDissolveDelay.svelte";
import { SECONDS_IN_DAY } from "$lib/constants/constants";
import { secondsToDuration } from "$lib/utils/date.utils";
import { formatVotingPower, votingPower } from "$lib/utils/neuron.utils";
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
        confirmButtonText: en.neurons.confirm_update_delay,
        token: ICPToken,
        reloadNeuron: jest.fn(),
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
        confirmButtonText: en.neurons.confirm_update_delay,
        token: ICPToken,
        reloadNeuron: jest.fn(),
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
        confirmButtonText: en.neurons.confirm_update_delay,
        token: ICPToken,
        reloadNeuron: jest.fn(),
      },
    });

    expect(
      getByText(
        formatToken({ value: getSnsNeuronStake(mockSnsNeuron), detailed: true })
      )
    ).toBeInTheDocument();
  });

  it("renders a voting power", () => {
    const { getByText } = render(ConfirmSnsDissolveDelay, {
      props: {
        delayInSeconds,
        neuron: mockSnsNeuron,
        confirmButtonText: en.neurons.confirm_update_delay,
        token: ICPToken,
        reloadNeuron: jest.fn(),
      },
    });
    const value = formatVotingPower(
      votingPower({
        stake: getSnsNeuronStake(mockSnsNeuron),
        dissolveDelayInSeconds: delayInSeconds,
      })
    );

    expect(getByText(value)).toBeInTheDocument();
  });

  it("renders cancel button", () => {
    const { getByText } = render(ConfirmSnsDissolveDelay, {
      props: {
        delayInSeconds,
        neuron: mockSnsNeuron,
        confirmButtonText: en.neurons.confirm_update_delay,
        token: ICPToken,
        reloadNeuron: jest.fn(),
      },
    });
    expect(getByText(en.neurons.edit_delay)).toBeInTheDocument();
  });

  it("renders confirm button", () => {
    const { getByText } = render(ConfirmSnsDissolveDelay, {
      props: {
        delayInSeconds,
        neuron: mockSnsNeuron,
        confirmButtonText: en.neurons.confirm_update_delay,
        token: ICPToken,
        reloadNeuron: jest.fn(),
      },
    });
    expect(getByText(en.neurons.confirm_update_delay)).toBeInTheDocument();
  });
});
