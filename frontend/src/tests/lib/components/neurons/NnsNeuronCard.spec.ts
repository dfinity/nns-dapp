import NnsNeuronCard from "$lib/components/neurons/NnsNeuronCard.svelte";
import {
  SECONDS_IN_HALF_YEAR,
  SECONDS_IN_YEAR,
} from "$lib/constants/constants";
import { networkEconomicsStore } from "$lib/stores/network-economics.store";
import { formatTokenE8s } from "$lib/utils/token.utils";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockNetworkEconomics } from "$tests/mocks/network-economics.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronCardPo } from "$tests/page-objects/NnsNeuronCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { render } from "$tests/utils/svelte.test-utils";
import type { Neuron } from "@dfinity/nns";
import { NeuronState, NeuronType } from "@dfinity/nns";
import { fireEvent } from "@testing-library/svelte";

describe("NnsNeuronCard", () => {
  const nowInSeconds = 1689843195;
  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(nowInSeconds * 1000);
    resetIdentity();
  });

  it("renders a Card", () => {
    const { container } = render(NnsNeuronCard, {
      props: { neuron: mockNeuron },
    });

    const articleElement = container.querySelector("article");

    expect(articleElement).not.toBeNull();
  });

  it("is clickable", async () => {
    const spyClick = vi.fn();
    const { container } = render(NnsNeuronCard, {
      props: {
        neuron: mockNeuron,
      },
      events: {
        click: spyClick,
      },
    });

    const articleElement = container.querySelector("article");

    articleElement && (await fireEvent.click(articleElement));

    expect(spyClick).toBeCalled();
  });

  it("renders role and aria-label passed", async () => {
    const role = "button";
    const ariaLabel = "test label";
    const { container } = render(NnsNeuronCard, {
      props: {
        neuron: mockNeuron,
        role,
        ariaLabel,
      },
    });

    const articleElement = container.querySelector("article");

    expect(articleElement?.getAttribute("role")).toBe(role);
    expect(articleElement?.getAttribute("aria-label")).toBe(ariaLabel);
  });

  it("renders the neuron stake and identifier", async () => {
    const { getByText } = render(NnsNeuronCard, {
      props: {
        neuron: mockNeuron,
      },
    });

    const stakeText = formatTokenE8s({
      value:
        (mockNeuron.fullNeuron as Neuron).cachedNeuronStake -
        (mockNeuron.fullNeuron as Neuron).neuronFees,
      detailed: true,
    });
    expect(getByText(stakeText)).toBeInTheDocument();
    expect(getByText(mockNeuron.neuronId.toString())).toBeInTheDocument();
  });

  it("doesn't render the neuron stake but the stacked line chart icon", async () => {
    const neuron = {
      ...mockNeuron,
      state: NeuronState.Spawning,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        spawnAtTimesSeconds: BigInt(3600 * 24 * 6 + 3600 * 4),
      },
    };
    const { queryByTestId } = render(NnsNeuronCard, {
      props: {
        neuron,
      },
    });

    expect(queryByTestId("stacked-line-chart")).toBeInTheDocument();
  });

  it("renders the community fund label when neuron part of community fund", async () => {
    const { getByText } = render(NnsNeuronCard, {
      props: {
        neuron: {
          ...mockNeuron,
          joinedCommunityFundTimestampSeconds: 1_000n,
        },
      },
    });

    expect(getByText(en.neurons.community_fund)).toBeInTheDocument();
  });

  it("renders the hotkey_control label when neuron is not controlled by current user but by hotkey", async () => {
    const { getByText } = render(NnsNeuronCard, {
      props: {
        neuron: {
          ...mockNeuron,
          fullNeuron: {
            ...mockFullNeuron,
            hotKeys: [mockIdentity.getPrincipal().toText()],
            controller: "bbbbb-bb",
          },
        },
      },
    });

    expect(getByText(en.neurons.hotkey_control)).toBeInTheDocument();
  });

  it("renders the Ledger device label and not hotkey when neuron is controlled by Ledger device", async () => {
    setAccountsForTesting({
      main: mockMainAccount,
      subAccounts: [],
      hardwareWallets: [mockHardwareWalletAccount],
    });
    const { container } = render(NnsNeuronCard, {
      props: {
        neuron: {
          ...mockNeuron,
          fullNeuron: {
            ...mockFullNeuron,
            hotKeys: [mockIdentity.getPrincipal().toText()],
            controller: mockHardwareWalletAccount.principal.toText(),
          },
        },
      },
    });

    const po = NnsNeuronCardPo.under(new JestPageObjectElement(container));

    expect(await po.getNeuronTags()).toEqual(["Ledger Device Controlled"]);
  });

  it("renders neuron type tag when not default", async () => {
    setAccountsForTesting({
      main: mockMainAccount,
      subAccounts: [],
    });
    const { container } = render(NnsNeuronCard, {
      props: {
        neuron: {
          ...mockNeuron,
          neuronType: NeuronType.Seed,
          fullNeuron: {
            ...mockFullNeuron,
            neuronType: NeuronType.Seed,
          },
        },
      },
    });

    const po = NnsNeuronCardPo.under(new JestPageObjectElement(container));

    expect(await po.getNeuronTags()).toEqual(["Seed"]);
  });

  it("renders 'Missing rewards' tag", async () => {
    networkEconomicsStore.setParameters({
      parameters: mockNetworkEconomics,
      certified: true,
    });
    setAccountsForTesting({
      main: mockMainAccount,
      subAccounts: [],
    });
    const { container } = render(NnsNeuronCard, {
      props: {
        neuron: {
          ...mockNeuron,
          dissolveDelaySeconds: BigInt(SECONDS_IN_HALF_YEAR),
          fullNeuron: {
            ...mockNeuron.fullNeuron,
            votingPowerRefreshedTimestampSeconds: BigInt(
              nowInSeconds - SECONDS_IN_YEAR
            ),
          },
        },
      },
    });
    const po = NnsNeuronCardPo.under(new JestPageObjectElement(container));

    expect(await po.getNeuronTags()).toEqual(["Missing rewards"]);
  });

  it("renders proper text when status is LOCKED", async () => {
    const MORE_THAN_ONE_YEAR = 60 * 60 * 24 * 365 * 1.5;
    const { getByText } = render(NnsNeuronCard, {
      props: {
        neuron: {
          ...mockNeuron,
          dissolveDelaySeconds: BigInt(MORE_THAN_ONE_YEAR),
          state: NeuronState.Locked,
        },
      },
    });

    expect(getByText(en.neuron_state.Locked)).toBeInTheDocument();
    expect(getByText(en.time.year, { exact: false })).toBeInTheDocument();
  });

  it("renders proper text when status is DISSOLVED", async () => {
    const { getByText } = render(NnsNeuronCard, {
      props: {
        neuron: {
          ...mockNeuron,
          state: NeuronState.Dissolved,
        },
      },
    });

    expect(getByText(en.neuron_state.Dissolved)).toBeInTheDocument();
  });

  it("renders proper text when status is SPAWNING", async () => {
    const { getByText } = render(NnsNeuronCard, {
      props: {
        neuron: {
          ...mockNeuron,
          state: NeuronState.Spawning,
          fullNeuron: {
            ...mockFullNeuron,
            spawnAtTimesSeconds: BigInt(3600 * 24 * 6 + 3600 * 4),
          },
        },
      },
    });

    expect(getByText(en.neuron_state.Spawning)).toBeInTheDocument();
  });

  it("renders proper text when status is DISSOLVING", async () => {
    const ONE_YEAR_FROM_NOW = nowInSeconds + SECONDS_IN_YEAR;
    const { getByText } = render(NnsNeuronCard, {
      props: {
        neuron: {
          ...mockNeuron,
          state: NeuronState.Dissolving,
          fullNeuron: {
            ...mockFullNeuron,
            dissolveState: {
              WhenDissolvedTimestampSeconds: BigInt(ONE_YEAR_FROM_NOW),
            },
          },
        },
      },
    });

    expect(getByText(en.neuron_state.Dissolving)).toBeInTheDocument();
    expect(getByText(en.time.year, { exact: false })).toBeInTheDocument();
  });

  it("renders voting power in `proposerNeuron` version", async () => {
    const { getByText } = render(NnsNeuronCard, {
      props: {
        neuron: {
          ...mockNeuron,
          decidingVotingPower: 864_000_000n,
        },
        proposerNeuron: true,
      },
    });
    expect(getByText("8.64")).toBeInTheDocument();
  });
});
