import ConfirmSnsDissolveDelay from "$lib/components/sns-neurons/ConfirmSnsDissolveDelay.svelte";
import { SECONDS_IN_DAY } from "$lib/constants/constants";
import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
import { formatVotingPower } from "$lib/utils/neuron.utils";
import {
  getSnsNeuronIdAsHexString,
  getSnsNeuronStake,
  snsNeuronVotingPower,
} from "$lib/utils/sns-neuron.utils";
import { formatTokenE8s } from "$lib/utils/token.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import type { SnsNeuron } from "@dfinity/sns";
import { ICPToken, secondsToDuration } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("ConfirmSnsDissolveDelay", () => {
  const delayInSeconds = Math.round(12.3 * SECONDS_IN_DAY);
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
    vi.useFakeTimers().setSystemTime(Date.now());

    setSnsProjects([
      {
        rootCanisterId: mockPrincipal,
      },
    ]);
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("renders a delay", () => {
    const { getByText } = render(ConfirmSnsDissolveDelay, {
      props: {
        rootCanisterId: mockPrincipal,
        delayInSeconds,
        neuron,
        token: ICPToken,
      },
    });

    expect(
      getByText(secondsToDuration({ seconds: BigInt(delayInSeconds) }))
    ).toBeInTheDocument();
  });

  it("renders a neuron ID", () => {
    const { getAllByText } = render(ConfirmSnsDissolveDelay, {
      props: {
        rootCanisterId: mockPrincipal,
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
        rootCanisterId: mockPrincipal,
        delayInSeconds,
        neuron,
        token: ICPToken,
      },
    });

    expect(
      getByText(
        formatTokenE8s({
          value: getSnsNeuronStake(mockSnsNeuron),
          detailed: true,
        })
      )
    ).toBeInTheDocument();
  });

  it("renders a voting power", () => {
    const { getByText } = render(ConfirmSnsDissolveDelay, {
      props: {
        rootCanisterId: mockPrincipal,
        delayInSeconds,
        neuron,
        token: ICPToken,
      },
    });
    const value = formatVotingPower(
      snsNeuronVotingPower({
        neuron,
        newDissolveDelayInSeconds: BigInt(delayInSeconds),
        snsParameters: snsNervousSystemParametersMock,
      })
    );

    expect(getByText(value)).toBeInTheDocument();
  });

  it("renders cancel button", () => {
    const { getByText } = render(ConfirmSnsDissolveDelay, {
      props: {
        rootCanisterId: mockPrincipal,
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
        rootCanisterId: mockPrincipal,
        delayInSeconds,
        neuron,
        token: ICPToken,
      },
    });
    expect(getByText(en.neurons.confirm_update_delay)).toBeInTheDocument();
  });
});
