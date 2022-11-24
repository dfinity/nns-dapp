/**
 * @jest-environment jsdom
 */

import ConfirmSnsDissolveDelay from "$lib/components/sns-neurons/ConfirmSnsDissolveDelay.svelte";
import { SECONDS_IN_DAY } from "$lib/constants/constants";
import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import { nowInSeconds, secondsToDuration } from "$lib/utils/date.utils";
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import { formatVotingPower } from "$lib/utils/neuron.utils";
import {
  getSnsNeuronIdAsHexString,
  getSnsNeuronStake,
  snsVotingPower,
} from "$lib/utils/sns-neuron.utils";
import { formatToken } from "$lib/utils/token.utils";
import { page } from "$mocks/$app/stores";
import { ICPToken } from "@dfinity/nns";
import type { SnsNeuron } from "@dfinity/sns";
import { render } from "@testing-library/svelte";
import { mockPrincipal } from "../../../mocks/auth.store.mock";
import en from "../../../mocks/i18n.mock";
import {
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "../../../mocks/sns-neurons.mock";

describe("ConfirmSnsDissolveDelay", () => {
  const delayInSeconds = 12.3 * SECONDS_IN_DAY;
  const neuron: SnsNeuron = {
    ...mockSnsNeuron,
    dissolve_state: [
      {
        DissolveDelaySeconds: 0n,
      },
    ],
  };

  // freeze time
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(Date.now());

    page.mock({ data: { universe: mockPrincipal.toText() } });

    snsParametersStore.setParameters({
      certified: true,
      rootCanisterId: mockPrincipal,
      parameters: snsNervousSystemParametersMock,
    });
  });

  afterAll(() => {
    jest.useRealTimers();
    snsParametersStore.reset();
  });

  it("renders a delay", () => {
    const { getByText } = render(ConfirmSnsDissolveDelay, {
      props: {
        delayInSeconds,
        neuron,
        token: ICPToken,
      },
    });

    expect(
      getByText(secondsToDuration(BigInt(delayInSeconds)))
    ).toBeInTheDocument();
  });

  it("renders a neuron ID", () => {
    const { getAllByText } = render(ConfirmSnsDissolveDelay, {
      props: {
        delayInSeconds,
        neuron,
        token: ICPToken,
      },
    });
    const id = shortenWithMiddleEllipsis(
      getSnsNeuronIdAsHexString(mockSnsNeuron)
    );

    expect(getAllByText(id).length).toBeGreaterThan(0);
  });

  it("renders a neuron stake", () => {
    const { getByText } = render(ConfirmSnsDissolveDelay, {
      props: {
        delayInSeconds,
        neuron,
        token: ICPToken,
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
        neuron,
        token: ICPToken,
      },
    });
    const value = formatVotingPower(
      snsVotingPower({
        nowSeconds: nowInSeconds(),
        neuron,
        dissolveDelayInSeconds: delayInSeconds,
        snsParameters: snsNervousSystemParametersMock,
      })
    );

    expect(getByText(value)).toBeInTheDocument();
  });

  it("renders cancel button", () => {
    const { getByText } = render(ConfirmSnsDissolveDelay, {
      props: {
        delayInSeconds,
        neuron,
        token: ICPToken,
      },
    });
    expect(getByText(en.neurons.edit_delay)).toBeInTheDocument();
  });

  it("renders confirm button", () => {
    const { getByText } = render(ConfirmSnsDissolveDelay, {
      props: {
        delayInSeconds,
        neuron,
        token: ICPToken,
      },
    });
    expect(getByText(en.neurons.confirm_update_delay)).toBeInTheDocument();
  });
});
