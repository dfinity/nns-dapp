import * as governanceApi from "$lib/api/governance.api";
import * as icpLedgerApi from "$lib/api/icp-ledger.api";
import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
import NnsNeuronDetail from "$lib/pages/NnsNeuronDetail.svelte";
import * as knownNeuronsServices from "$lib/services/known-neurons.services";
import { checkedNeuronSubaccountsStore } from "$lib/stores/checked-neurons.store";
import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
import * as fakeGovernanceApi from "$tests/fakes/governance-api.fake";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockVoteRegistration } from "$tests/mocks/proposal.mock";
import { NnsNeuronDetailPo } from "$tests/page-objects/NnsNeuronDetail.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";

vi.mock("$lib/api/governance.api");

describe("NeuronDetail", () => {
  fakeGovernanceApi.install();

  const neuronId = 314n;
  const neuronStake = 300_000_000n;
  const latestRewardEventTimestamp = Math.floor(
    new Date("1992-05-22T21:00:00").getTime() / 1000
  );
  let spyQueryAccountBalance;

  const renderComponent = async (neuronId: string) => {
    const { container } = render(NnsNeuronDetail, {
      props: {
        neuronIdText: neuronId,
      },
    });

    await runResolvedPromises();

    return NnsNeuronDetailPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetIdentity();
    voteRegistrationStore.reset();
    checkedNeuronSubaccountsStore.reset();
    fakeGovernanceApi.addNeuronWith({ neuronId, stake: neuronStake });
    fakeGovernanceApi.addNeuronWith({ neuronId: 1234n });
    fakeGovernanceApi.setLatestRewardEvent({
      rounds_since_last_distribution: [3n] as [bigint],
      actual_timestamp_seconds: BigInt(latestRewardEventTimestamp),
    });

    // Used when NeuronFollowingCard is mounted
    vi.spyOn(knownNeuronsServices, "listKnownNeurons").mockResolvedValue(
      undefined
    );

    spyQueryAccountBalance = vi
      .spyOn(icpLedgerApi, "queryAccountBalance")
      .mockResolvedValue(neuronStake);
  });

  it("renders new sections", async () => {
    const po = await renderComponent(`${neuronId}`);

    expect(await po.getVotingPowerSectionPo().isPresent()).toBe(true);
    expect(await po.getMaturitySectionPo().isPresent()).toBe(true);
    expect(await po.getAdvancedSectionPo().isPresent()).toBe(true);
  });

  it("should display skeletons", async () => {
    fakeGovernanceApi.pause();
    const { container } = render(NnsNeuronDetail, {
      props: {
        neuronIdText: `${neuronId}`,
      },
    });

    const po = NnsNeuronDetailPo.under(new JestPageObjectElement(container));

    expect((await po.getSkeletonCardPos()).length).toBeGreaterThan(0);
  });

  it("should hide skeletons after neuron data are available", async () => {
    fakeGovernanceApi.pause();
    const { container } = render(NnsNeuronDetail, {
      props: {
        neuronIdText: `${neuronId}`,
      },
    });

    const po = NnsNeuronDetailPo.under(new JestPageObjectElement(container));

    expect((await po.getSkeletonCardPos()).length).toBeGreaterThan(0);

    fakeGovernanceApi.resume();

    await po.getSkeletonCardPo().waitForAbsent();
  });

  it("should show the proper neuron id", async () => {
    const po = await renderComponent(`${neuronId}`);

    expect(await po.getNeuronId()).toEqual(`${neuronId}`);
  });

  it("should render nns project name", async () => {
    const po = await renderComponent(`${neuronId}`);

    expect(await po.getUniverse()).toBe("Internet Computer");
  });

  it("should show skeletons when neuron is in voting process", async () => {
    const po = await renderComponent(`${neuronId}`);

    expect((await po.getSkeletonCardPos()).length).toBe(0);

    voteRegistrationStore.add({
      ...mockVoteRegistration,
      neuronIdStrings: [`${neuronId}`],
      canisterId: OWN_CANISTER_ID,
    });

    await po.getSkeletonCardPo().waitFor();
  });

  it("should render last maturity distribution", async () => {
    const po = await renderComponent(`${neuronId}`);

    expect(await po.getAdvancedSectionPo().lastRewardsDistribution()).toEqual(
      "May 19, 1992"
    );
  });

  it("should not refresh neuron if stake is equal to account balance", async () => {
    expect(spyQueryAccountBalance).toBeCalledTimes(0);

    await renderComponent(`${neuronId}`);
    await runResolvedPromises();

    expect(spyQueryAccountBalance).toBeCalledTimes(1);
    expect(governanceApi.claimOrRefreshNeuron).toBeCalledTimes(0);

    const newNeuron = fakeGovernanceApi.getNeuron({
      identity: mockIdentity,
      neuronId,
    });
    expect(newNeuron.fullNeuron.cachedNeuronStake).toEqual(neuronStake);
  });

  it("should refresh neuron if stake is less than account balance", async () => {
    const stakeIncrease = 100_000_000n;
    spyQueryAccountBalance.mockResolvedValue(neuronStake + stakeIncrease);

    expect(spyQueryAccountBalance).toBeCalledTimes(0);

    const oldNeuron = fakeGovernanceApi.getNeuron({
      identity: mockIdentity,
      neuronId,
    });
    expect(oldNeuron.fullNeuron.cachedNeuronStake).toEqual(neuronStake);

    await renderComponent(`${neuronId}`);
    await runResolvedPromises();

    // The balance is queried once by the service and once by the fake
    // governance API.
    expect(spyQueryAccountBalance).toBeCalledTimes(2);
    expect(governanceApi.claimOrRefreshNeuron).toBeCalledTimes(1);

    const newNeuron = fakeGovernanceApi.getNeuron({
      identity: mockIdentity,
      neuronId,
    });
    expect(newNeuron.fullNeuron.cachedNeuronStake).toEqual(
      neuronStake + stakeIncrease
    );
  });
});
