import NnsNeuronPageHeading from "$lib/components/neuron-detail/NnsNeuronPageHeading.svelte";
import { CKUSDC_UNIVERSE_CANISTER_ID } from "$lib/constants/ckusdc-canister-ids.constants";
import { NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE } from "$lib/constants/neurons.constants";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { icpSwapTickersStore } from "$lib/stores/icp-swap.store";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockIcpSwapTicker } from "$tests/mocks/icp-swap.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsNeuronPageHeadingPo } from "$tests/page-objects/NnsNeuronPageHeading.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import {
  resetAccountsForTesting,
  setAccountsForTesting,
} from "$tests/utils/accounts.test-utils";
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
    resetAccountsForTesting();

    icpSwapTickersStore.set([
      {
        ...mockIcpSwapTicker,
        base_id: CKUSDC_UNIVERSE_CANISTER_ID.toText(),
        last_price: "10.00",
      },
    ]);
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

    expect(await po.getVotingPower()).toEqual("Voting Power: 3.14");
  });

  it("should render no voting power if neuron can't vote", async () => {
    const decidingVotingPower = 314_000_000n;
    const po = renderComponent({
      ...mockNeuron,
      decidingVotingPower,
      dissolveDelaySeconds: BigInt(NNS_MINIMUM_DISSOLVE_DELAY_TO_VOTE - 1),
    });

    expect(await po.getVotingPower()).toEqual("No Voting Power");
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

  it("should not display USD balance if feature flag is disabled", async () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES_FOR_NEURONS", false);

    const stake = 300_000_000n;
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        cachedNeuronStake: stake,
        neuronFees: 0n,
      },
    });

    expect(await po.hasBalanceInUsd()).toBe(false);
  });

  it("should display USD balance if feature flag is enabled", async () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_USD_VALUES_FOR_NEURONS", true);

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
