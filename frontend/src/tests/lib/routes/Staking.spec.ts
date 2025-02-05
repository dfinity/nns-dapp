import * as governanceApi from "$lib/api/governance.api";
import * as ledgerApi from "$lib/api/icp-ledger.api";
import * as icrcLedgerApi from "$lib/api/icrc-ledger.api";
import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import * as snsApi from "$lib/api/sns.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { SECONDS_IN_HALF_YEAR } from "$lib/constants/constants";
import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import Staking from "$lib/routes/Staking.svelte";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import { networkEconomicsStore } from "$lib/stores/network-economics.store";
import { neuronsStore } from "$lib/stores/neurons.store";
import { snsNeuronsStore } from "$lib/stores/sns-neurons.store";
import { nowInSeconds } from "$lib/utils/date.utils";
import { page } from "$mocks/$app/stores";
import {
  mockIdentity,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockAccountsStoreData } from "$tests/mocks/icp-accounts.store.mock";
import { mockNetworkEconomics } from "$tests/mocks/network-economics.mock";
import { mockFullNeuron, mockNeuron } from "$tests/mocks/neurons.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { mockToken, principal } from "$tests/mocks/sns-projects.mock";
import { StakingPo } from "$tests/page-objects/Staking.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import {
  resetAccountsForTesting,
  setAccountsForTesting,
} from "$tests/utils/accounts.test-utils";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { Principal } from "@dfinity/principal";
import { fromNullable } from "@dfinity/utils";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Staking", () => {
  const snsTitle = "SNS-1";
  const snsCanisterId = principal(1112);

  beforeEach(() => {
    resetIdentity();
    resetAccountsForTesting();

    page.mock({
      routeId: AppPath.Staking,
    });
  });

  const renderComponent = () => {
    const { container } = render(Staking);
    return StakingPo.under(new JestPageObjectElement(container));
  };

  it("should render the page banner and login button when not signed in", async () => {
    setNoIdentity();
    const po = renderComponent();
    expect(await po.getPageBannerPo().isPresent()).toBe(true);
    expect(await po.getSignInPo().isPresent()).toBe(true);
  });

  it("should not render banner and login button when signed in but NNS neurons still loading", async () => {
    resetIdentity();
    const po = renderComponent();
    expect(await po.getPageBannerPo().isPresent()).toBe(false);
    expect(await po.getSignInPo().isPresent()).toBe(false);
  });

  it("should not render banner and login button when signed in but SNS neurons still loading", async () => {
    resetIdentity();

    neuronsStore.setNeurons({
      neurons: [],
      certified: true,
    });

    setSnsProjects([
      {
        projectName: snsTitle,
        rootCanisterId: snsCanisterId,
      },
    ]);
    snsNeuronsStore.reset();

    const po = renderComponent();
    expect(await po.getPageBannerPo().isPresent()).toBe(false);
    expect(await po.getSignInPo().isPresent()).toBe(false);
  });

  it("should render banner but no login button when signed in without neurons", async () => {
    resetIdentity();

    neuronsStore.setNeurons({
      neurons: [],
      certified: true,
    });

    setSnsProjects([
      {
        projectName: snsTitle,
        rootCanisterId: snsCanisterId,
      },
    ]);
    snsNeuronsStore.setNeurons({
      rootCanisterId: snsCanisterId,
      neurons: [],
      certified: true,
    });

    const po = renderComponent();
    expect(await po.getPageBannerPo().isPresent()).toBe(true);
    expect(await po.getSignInPo().isPresent()).toBe(false);
  });

  it("should not render banner or login button when signed in with NNS neurons", async () => {
    resetIdentity();
    neuronsStore.setNeurons({
      neurons: [mockNeuron],
      certified: true,
    });
    const po = renderComponent();
    expect(await po.getPageBannerPo().isPresent()).toBe(false);
    expect(await po.getSignInPo().isPresent()).toBe(false);
  });

  it("should not render banner or login button when signed in with SNS neurons", async () => {
    resetIdentity();

    neuronsStore.setNeurons({
      neurons: [],
      certified: true,
    });

    setSnsProjects([
      {
        projectName: snsTitle,
        rootCanisterId: snsCanisterId,
      },
    ]);
    snsNeuronsStore.setNeurons({
      rootCanisterId: snsCanisterId,
      neurons: [mockSnsNeuron],
      certified: true,
    });

    const po = renderComponent();
    expect(await po.getPageBannerPo().isPresent()).toBe(false);
    expect(await po.getSignInPo().isPresent()).toBe(false);
  });

  describe("Stake ICP button", () => {
    beforeEach(() => {
      setAccountsForTesting(mockAccountsStoreData);
      neuronsStore.setNeurons({
        neurons: [],
        certified: true,
      });

      vi.spyOn(governanceApi, "stakeNeuron").mockImplementation(async () => {
        neuronsStore.setNeurons({ neurons: [mockNeuron], certified: true });
        return mockNeuron.neuronId;
      });
      vi.spyOn(governanceApi, "queryNeuron").mockResolvedValue(mockNeuron);
      vi.spyOn(ledgerApi, "queryAccountBalance").mockResolvedValue(
        200_000_000n
      );
    });

    it("should open NNS stake neuron modal", async () => {
      const po = renderComponent();

      const rows = await po.getProjectsTablePo().getProjectsTableRowPos();
      expect(rows).toHaveLength(1);

      expect(await po.getNnsStakeNeuronModalPo().isPresent()).toBe(false);
      await rows[0].click();
      expect(await po.getNnsStakeNeuronModalPo().isPresent()).toBe(true);
    });

    it("should go to NNS neurons table after staking", async () => {
      const po = renderComponent();

      const rows = await po.getProjectsTablePo().getProjectsTableRowPos();
      await rows[0].click();
      const modal = po.getNnsStakeNeuronModalPo();

      await modal.getNnsStakeNeuronPo().getAmountInputPo().enterAmount(1);
      await modal.getNnsStakeNeuronPo().clickCreate();
      await runResolvedPromises();
      expect(await modal.getSetDissolveDelayPo().isPresent()).toBe(true);
      expect(get(pageStore).path).toBe(AppPath.Staking);
      await modal.closeModal();
      expect(await modal.isPresent()).toBe(false);
      expect(get(pageStore)).toEqual({
        path: AppPath.Neurons,
        universe: OWN_CANISTER_ID_TEXT,
      });
    });

    it("should not go to neurons table when closing without staking", async () => {
      const po = renderComponent();

      const rows = await po.getProjectsTablePo().getProjectsTableRowPos();
      await rows[0].click();
      const modal = po.getNnsStakeNeuronModalPo();

      await modal.getNnsStakeNeuronPo().getAmountInputPo().enterAmount(1);
      await modal.closeModal();
      expect(await modal.isPresent()).toBe(false);
      await runResolvedPromises();
      expect(get(pageStore).path).toBe(AppPath.Staking);
    });
  });

  describe("Stake SNS token button", () => {
    const snsGovernanceIdText = "73vho-mf5gq-aq";
    const snsGovernanceId = Principal.fromText(snsGovernanceIdText);
    const snsLedgerId = principal(54651);
    const snsTokenSymbol = "KLM";
    const snsTransactionFee = 123_000n;
    const snsAccountBalance = 200_000_000n;
    const snsAccountBalanceFormatted = "2.00";
    const snsMinimumStake = 0.5;
    const snsMinimumStakeE8s = BigInt(snsMinimumStake * 100_000_000);
    let queryIcrcBalanceSpy;
    let stakeNeuronSpy;

    beforeEach(() => {
      setSnsProjects([
        {
          projectName: snsTitle,
          rootCanisterId: snsCanisterId,
          governanceCanisterId: snsGovernanceId,
          ledgerCanisterId: snsLedgerId,
          tokenMetadata: {
            ...mockToken,
            symbol: snsTokenSymbol,
            fee: snsTransactionFee,
          },
          neuronMinimumStakeE8s: snsMinimumStakeE8s,
        },
      ]);
      snsNeuronsStore.setNeurons({
        rootCanisterId: snsCanisterId,
        neurons: [],
        certified: true,
      });

      queryIcrcBalanceSpy = vi
        .spyOn(icrcLedgerApi, "queryIcrcBalance")
        .mockResolvedValue(snsAccountBalance);
      stakeNeuronSpy = vi
        .spyOn(snsApi, "stakeNeuron")
        .mockResolvedValue(fromNullable(mockSnsNeuron.id));
      vi.spyOn(snsGovernanceApi, "querySnsNeurons").mockResolvedValue([
        mockSnsNeuron,
      ]);
    });

    it("should open SNS stake neuron modal", async () => {
      const po = renderComponent();

      const rows = await po.getProjectsTablePo().getProjectsTableRowPos();
      expect(rows).toHaveLength(2);

      expect(await po.getSnsStakeNeuronModalPo().isPresent()).toBe(false);
      await rows[1].click();
      await runResolvedPromises();
      expect(await po.getSnsStakeNeuronModalPo().isPresent()).toBe(true);
    });

    it("should load account balance", async () => {
      const po = renderComponent();

      const rows = await po.getProjectsTablePo().getProjectsTableRowPos();

      expect(queryIcrcBalanceSpy).not.toBeCalled();
      await rows[1].click();
      await runResolvedPromises();
      expect(
        await po
          .getSnsStakeNeuronModalPo()
          .getTransactionFormPo()
          .getTransactionFromAccountPo()
          .getAmountDisplayPo()
          .getAmount()
      ).toBe(snsAccountBalanceFormatted);

      expect(queryIcrcBalanceSpy).toBeCalledTimes(2);
      const expectedQueryBalanceParams = {
        account: {
          owner: mockIdentity.getPrincipal(),
        },
        canisterId: snsLedgerId,
        identity: mockIdentity,
      };
      expect(queryIcrcBalanceSpy).toBeCalledWith({
        ...expectedQueryBalanceParams,
        certified: false,
      });
      expect(queryIcrcBalanceSpy).toBeCalledWith({
        ...expectedQueryBalanceParams,
        certified: true,
      });
    });

    it("should go to SNS neurons table after staking", async () => {
      const po = renderComponent();

      const rows = await po.getProjectsTablePo().getProjectsTableRowPos();
      await rows[1].click();
      const modal = po.getSnsStakeNeuronModalPo();

      expect(stakeNeuronSpy).not.toBeCalled();
      expect(get(pageStore).path).toBe(AppPath.Staking);
      await modal.stake(1);
      await runResolvedPromises();
      expect(await modal.isPresent()).toBe(false);
      expect(get(pageStore)).toEqual({
        path: AppPath.Neurons,
        universe: snsCanisterId.toText(),
      });
      expect(stakeNeuronSpy).toBeCalledTimes(1);
      expect(stakeNeuronSpy).toBeCalledWith({
        controller: mockIdentity.getPrincipal(),
        fee: snsTransactionFee,
        identity: mockIdentity,
        rootCanisterId: snsCanisterId,
        source: {
          owner: mockIdentity.getPrincipal(),
        },
        stakeE8s: 100_000_000n,
      });
    });

    it("should not go to neurons table when closing without staking", async () => {
      const po = renderComponent();

      const rows = await po.getProjectsTablePo().getProjectsTableRowPos();
      await rows[1].click();
      const modal = po.getSnsStakeNeuronModalPo();

      expect(get(pageStore).path).toBe(AppPath.Staking);
      await modal.closeModal();
      await runResolvedPromises();
      expect(await modal.isPresent()).toBe(false);
      expect(get(pageStore).path).toBe(AppPath.Staking);
    });

    it("should pass correct SNS details to stake modal", async () => {
      const po = renderComponent();

      const rows = await po.getProjectsTablePo().getProjectsTableRowPos();
      await rows[1].click();
      const modal = po.getSnsStakeNeuronModalPo();

      expect(
        await modal
          .getTransactionFormPo()
          .getTransactionFormFeePo()
          .getAmountDisplayPo()
          .getAmount()
      ).toBe("0.00123000");

      await modal.getTransactionFormPo().enterAmount(1);
      expect(await modal.getTransactionFormPo().isContinueButtonEnabled()).toBe(
        true
      );
      await modal.getTransactionFormPo().clickContinue();

      expect(await modal.getTransactionReviewPo().isPresent()).toBe(true);
      expect(await modal.getTransactionReviewPo().getDestinationAddress()).toBe(
        `Subaccount of ${snsGovernanceIdText}`
      );
      expect(
        await modal.getTransactionReviewPo().getTransactionDescription()
      ).toBe(`Stake ${snsTokenSymbol}`);
    });

    it("should enforce minimum stake", async () => {
      const po = renderComponent();

      const rows = await po.getProjectsTablePo().getProjectsTableRowPos();
      await rows[1].click();
      const modal = po.getSnsStakeNeuronModalPo();
      const form = modal.getTransactionFormPo();

      await form.enterAmount(snsMinimumStake - 0.0001);
      expect(await form.getAmountInputPo().hasError()).toBe(true);
      expect(await form.getAmountInputPo().getErrorMessage()).toBe(
        "Sorry, the amount is too small. You need to stake a minimum of 0.5 KLM."
      );
      expect(await form.isContinueButtonEnabled()).toBe(false);

      await form.enterAmount(snsMinimumStake);
      expect(await form.getAmountInputPo().hasError()).toBe(false);
      expect(await form.isContinueButtonEnabled()).toBe(true);
    });
  });

  describe("LosingRewardsBanner", () => {
    beforeEach(() => {
      neuronsStore.setNeurons({
        neurons: [
          {
            ...mockNeuron,
            dissolveDelaySeconds: BigInt(SECONDS_IN_HALF_YEAR),
            fullNeuron: {
              ...mockFullNeuron,
              votingPowerRefreshedTimestampSeconds: BigInt(
                nowInSeconds() - SECONDS_IN_HALF_YEAR
              ),
            },
          },
        ],
        certified: true,
      });

      networkEconomicsStore.setParameters({
        parameters: mockNetworkEconomics,
        certified: true,
      });
    });

    it("should not display LosingRewardsBanner by default", async () => {
      const po = await renderComponent();
      // It should be behind the feature flag
      expect(await po.getLosingRewardsBannerPo().isPresent()).toBe(false);
    });

    it("should display LosingRewardsBanner", async () => {
      overrideFeatureFlagsStore.setFlag(
        "ENABLE_PERIODIC_FOLLOWING_CONFIRMATION",
        true
      );
      const po = await renderComponent();

      expect(await po.getLosingRewardsBannerPo().isPresent()).toBe(true);
      expect(await po.getLosingRewardsBannerPo().isVisible()).toBe(true);
    });

    it("should not display LosingRewardsBanner w/o voting power economics", async () => {
      networkEconomicsStore.setParameters({
        parameters: undefined,
        certified: undefined,
      });
      overrideFeatureFlagsStore.setFlag(
        "ENABLE_PERIODIC_FOLLOWING_CONFIRMATION",
        true
      );
      const po = await renderComponent();

      expect(await po.getLosingRewardsBannerPo().isPresent()).toBe(true);
      expect(await po.getLosingRewardsBannerPo().isVisible()).toBe(false);
    });
  });
});
