import NnsAvailableMaturityItemAction from "$lib/components/neuron-detail/NnsAvailableMaturityItemAction.svelte";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import NeuronContextActionsTest from "$tests/lib/components/neuron-detail/NeuronContextActionsTest.svelte";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockCanisterId } from "$tests/mocks/canisters.mock";
import {
  mockHardwareWalletAccount,
  mockMainAccount,
} from "$tests/mocks/icp-accounts.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { NnsAvailableMaturityItemActionPo } from "$tests/page-objects/NnsAvailableMaturityItemAction.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import type { NeuronInfo } from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("NnsAvailableMaturityItemAction", () => {
  const renderComponent = (neuron: NeuronInfo) => {
    const { container } = render(NeuronContextActionsTest, {
      props: {
        neuron,
        testComponent: NnsAvailableMaturityItemAction,
      },
    });

    return NnsAvailableMaturityItemActionPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    resetIdentity();
  });

  it("should render available maturity", async () => {
    const neuron: NeuronInfo = {
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        maturityE8sEquivalent: 314000000n,
      },
    };
    const po = renderComponent(neuron);

    expect(await po.getMaturity()).toBe("3.14");
  });

  it("should render buttons", async () => {
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: mockIdentity.getPrincipal().toText(),
      },
    });

    expect(await po.hasSpawnButton()).toBe(true);
    expect(await po.hasStakeButton()).toBe(true);
  });

  it("should render buttons if controlled by attached Ledger device", async () => {
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
      },
    });

    expect(await po.hasSpawnButton()).toBe(true);
    expect(await po.hasStakeButton()).toBe(true);
  });

  // TODO: Remove this once the ENABLE_DISBURSE_MATURITY feature flag is no longer needed.
  it("should not render buttons if user is not the controller", async () => {
    const po = renderComponent({
      ...mockNeuron,
      fullNeuron: {
        ...mockNeuron.fullNeuron,
        controller: mockCanisterId.toText(),
      },
    });

    expect(await po.hasSpawnButton()).toBe(false);
    expect(await po.hasStakeButton()).toBe(false);
  });

  it("should have an appropriate tooltip ID", async () => {
    const po = renderComponent(mockNeuron);

    expect(await po.getTooltipIconPo().getTooltipPo().getTooltipId()).toBe(
      "available-maturity-tooltip"
    );
  });

  describe("when ENABLE_DISBURSE_MATURITY flag enabled", () => {
    beforeEach(() => {
      overrideFeatureFlagsStore.setFlag("ENABLE_DISBURSE_MATURITY", true);
    });

    it("should render Disburse button", async () => {
      const po = renderComponent({
        ...mockNeuron,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          controller: mockIdentity.getPrincipal().toText(),
        },
      });

      expect(await po.hasStakeButton()).toBe(true);
      expect(await po.hasSpawnButton()).toBe(false);
      expect(await po.hasDisburseMaturityButton()).toBe(true);
    });

    it("should disable Disburse button when active disbursements limit reached", async () => {
      const po = renderComponent({
        ...mockNeuron,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          controller: mockIdentity.getPrincipal().toText(),
          maturityE8sEquivalent: 900_000_000n,
          maturityDisbursementsInProgress: new Array(10).fill({
            amountE8s: 100_000_000n,
            timestampOfDisbursementSeconds: undefined,
            accountToDisburseTo: undefined,
            finalizeDisbursementTimestampSeconds: undefined,
            accountIdentifierToDisburseTo: undefined,
          }),
        },
      });

      expect(await po.hasDisburseMaturityButton()).toBe(true);
      expect(await po.getDisburseMaturityButton().isDisabled()).toBe(true);
      expect(await po.getDisburseMaturityButton().getTooltipText()).toBe(
        "The maximum of 10 active maturity disbursements for this neuron has been reached. Please wait for a disbursement to complete before initiating a new one."
      );
    });

    // TODO: Remove this once the ENABLE_DISBURSE_MATURITY feature flag is no longer needed.
    it("should not render Disburse button w/o the feature flag", async () => {
      overrideFeatureFlagsStore.setFlag("ENABLE_DISBURSE_MATURITY", false);
      const po = renderComponent({
        ...mockNeuron,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          controller: mockIdentity.getPrincipal().toText(),
        },
      });

      expect(await po.hasStakeButton()).toBe(true);
      expect(await po.hasSpawnButton()).toBe(true);
      expect(await po.hasDisburseMaturityButton()).toBe(false);
    });

    it("should render Spawn button if controlled by attached Ledger device", async () => {
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
        },
      });

      expect(await po.hasStakeButton()).toBe(true);
      expect(await po.hasSpawnButton()).toBe(true);
      expect(await po.hasDisburseMaturityButton()).toBe(false);
    });

    it("should render no buttons when the user is not the controller", async () => {
      const po = renderComponent({
        ...mockNeuron,
        fullNeuron: {
          ...mockNeuron.fullNeuron,
          controller: mockCanisterId.toText(),
        },
      });

      expect(await po.hasStakeButton()).toBe(false);
      expect(await po.hasDisburseMaturityButton()).toBe(false);
      expect(await po.hasSpawnButton()).toBe(false);
    });
  });
});
