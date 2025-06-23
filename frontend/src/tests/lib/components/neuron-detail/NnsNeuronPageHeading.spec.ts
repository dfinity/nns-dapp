import NnsNeuronPageHeading from "$lib/components/neuron-detail/NnsNeuronPageHeading.svelte";
import {
  SECONDS_IN_HALF_YEAR,
  SECONDS_IN_YEAR,
} from "$lib/constants/constants";
import { NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE } from "$lib/constants/neurons.constants";
import { networkEconomicsStore } from "$lib/stores/network-economics.store";
import { nowInSeconds } from "$lib/utils/date.utils";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockNetworkEconomics } from "$tests/mocks/network-economics.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronPageHeadingPo } from "$tests/page-objects/NnsNeuronPageHeading.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { setIcpPrice } from "$tests/utils/icp-swap.test-utils";
import type { NeuronInfo } from "@dfinity/nns";
import { NeuronType } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("NnsNeuronPageHeading", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NnsNeuronPageHeading, { props: { neuron } });

    return NnsNeuronPageHeadingPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    resetIdentity();

    setIcpPrice(10);
  });

  it("should render the neuron's stake", async () => {
    const stake = 314_560_000n;
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        cachedNeuronStake: stake,
        neuronFees: 0n,
      },
    });

    expect(await po.getStake()).toEqual("3.1456");
  });

  it("should render neuron's voting power", async () => {
    const decidingVotingPower = 314_000_000n;
    const po = renderComponent({
      ...mockNeuron,
      decidingVotingPower,
      dissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE),
    });

    expect(await po.getVotingPower()).equals("Voting Power: 3.14");
  });

  it("should render no voting power if neuron can't vote", async () => {
    const decidingVotingPower = 314_000_000n;
    const po = renderComponent({
      ...mockNeuron,
      decidingVotingPower,
      dissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE - 1),
    });

    expect(await po.getVotingPower()).equals("No Voting Power");
  });

  it("should render neuron's fund tag if belongs part of neurons fund", async () => {
    const po = renderComponent({
      ...mockNeuron,
      joinedCommunityFundTimestampSeconds: 12_333_444n,
    });

    expect(await po.getNeuronTags()).toEqual(["Neurons' fund"]);
  });

  it("should render hotkey tag if user is a hotkey and not controlled by a Ledger device", async () => {
    setAccountsForTesting({
      main: mockMainAccount,
      subAccounts: [],
      hardwareWallets: [],
    });
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: "not-current-principal",
        hotKeys: [mockIdentity.getPrincipal().toText()],
      },
    });

    expect(await po.getNeuronTags()).toEqual(["Hotkey control"]);
  });

  it("should render hotkey and Neurons' Fund tag", async () => {
    setAccountsForTesting({
      main: mockMainAccount,
      subAccounts: [],
      hardwareWallets: [],
    });
    const po = renderComponent({
      ...mockNeuron,
      joinedCommunityFundTimestampSeconds: 12_333_444n,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: "not-current-principal",
        hotKeys: [mockIdentity.getPrincipal().toText()],
      },
    });

    expect(await po.getNeuronTags()).toEqual([
      "Neurons' fund",
      "Hotkey control",
    ]);
  });

  it("should render Ledger device tag and not hotkey if neuron is controlled by a Ledger device", async () => {
    setAccountsForTesting({
      main: mockMainAccount,
      subAccounts: [],
      hardwareWallets: [mockHardwareWalletAccount],
    });
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: mockHardwareWalletAccount.principal.toText(),
        hotKeys: [mockIdentity.getPrincipal().toText()],
      },
    });

    expect(await po.getNeuronTags()).toEqual(["Ledger Device Controlled"]);
  });

  it("should render neuron type tag", async () => {
    setAccountsForTesting({
      main: mockMainAccount,
      subAccounts: [],
    });
    const po = renderComponent({
      ...mockNeuron,
      neuronType: NeuronType.Ect,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        neuronType: NeuronType.Ect,
      },
    });

    expect(await po.getNeuronTags()).toEqual(["Early Contributor Token"]);
  });

  it("should render 'Missing rewards' tag", async () => {
    networkEconomicsStore.setParameters({
      parameters: mockNetworkEconomics,
      certified: true,
    });
    const po = renderComponent({
      ...mockNeuron,
      dissolveDelaySeconds: BigInt(SECONDS_IN_HALF_YEAR),
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        votingPowerRefreshedTimestampSeconds: BigInt(
          nowInSeconds() - SECONDS_IN_YEAR
        ),
      },
    });

    expect(await po.getNeuronTags()).toEqual(["Missing rewards"]);
  });

  it("should display USD balance ", async () => {
    const stake = 300_000_000n;
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        cachedNeuronStake: stake,
        neuronFees: 0n,
      },
    });

    expect(await po.hasBalanceInUsd()).toBe(true);
    expect(await po.getBalanceInUsd()).toBe("$30.00");
  });
});
