import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import DisburseSnsNeuronModal from "$lib/modals/neurons/DisburseSnsNeuronModal.svelte";
import * as authServices from "$lib/services/auth.services";
import { loadSnsAccounts } from "$lib/services/sns-accounts.services";
import { icrcAccountsStore } from "$lib/stores/icrc-accounts.store";
import { page } from "$mocks/$app/stores";
import {
  createMockIdentity,
  mockPrincipal,
} from "$tests/mocks/auth.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import {
  mockSnsMainAccount,
  mockSnsSubAccount,
} from "$tests/mocks/sns-accounts.mock";
import { mockSnsNeuron, mockSnsNeuronId } from "$tests/mocks/sns-neurons.mock";
import { principal } from "$tests/mocks/sns-projects.mock";
import { DisburseSnsNeuronModalPo } from "$tests/page-objects/DisburseSnsNeuronModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { SnsNeuron } from "@dfinity/sns";
import { SnsSwapLifecycle } from "@dfinity/sns";
import type { RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

vi.mock("$lib/api/sns-governance.api");
vi.mock("$lib/services/sns-accounts.services");

const testIdentity = createMockIdentity(37373);

describe("DisburseSnsNeuronModal", () => {
  const rootCanisterId = principal(1);
  const ledgerCanisterId = principal(2);
  const principalString = rootCanisterId.toText();

  const renderDisburseModal = async (
    neuron: SnsNeuron,
    reloadNeuron: () => Promise<void> = () => Promise.resolve()
  ): Promise<RenderResult<SvelteComponent>> => {
    return renderModal({
      component: DisburseSnsNeuronModal,
      props: {
        rootCanisterId: mockPrincipal,
        neuron,
        reloadNeuron: reloadNeuron,
      },
    });
  };

  const renderComponent = async ({
    neuron,
    reloadNeuron,
  }: {
    neuron: SnsNeuron;
    reloadNeuron?: () => Promise<void>;
  }): Promise<DisburseSnsNeuronModalPo> => {
    const { container } = await renderDisburseModal(neuron, reloadNeuron);

    return DisburseSnsNeuronModalPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vi.spyOn(authServices, "getAuthenticatedIdentity").mockResolvedValue(
      testIdentity
    );

    icrcAccountsStore.set({
      ledgerCanisterId,
      accounts: {
        accounts: [mockSnsMainAccount, mockSnsSubAccount],
        certified: true,
      },
    });

    setSnsProjects([
      {
        rootCanisterId,
        ledgerCanisterId,
        lifecycle: SnsSwapLifecycle.Committed,
      },
    ]);
  });

  it("should display modal", async () => {
    page.mock({ data: { universe: principalString, neuron: "12344" } });

    const po = await renderComponent({ neuron: mockSnsNeuron });

    expect(await po.isPresent()).toBe(true);
  });

  it("should render a confirmation screen", async () => {
    page.mock({ data: { universe: principalString, neuron: "12344" } });

    const po = await renderComponent({ neuron: mockSnsNeuron });

    expect(await po.getConfirmDisburseNeuronPo().isPresent()).toBe(true);
  });

  it("should call disburse service", async () => {
    page.mock({ data: { universe: principalString, neuron: "12344" } });

    const po = await renderComponent({ neuron: mockSnsNeuron });

    expect(await po.getConfirmDisburseNeuronPo().isPresent()).toBe(true);

    expect(snsGovernanceApi.disburse).toBeCalledTimes(0);

    await po.getConfirmDisburseNeuronPo().clickConfirm();

    expect(snsGovernanceApi.disburse).toBeCalledTimes(1);
    expect(snsGovernanceApi.disburse).toBeCalledWith({
      rootCanisterId: mockSnsMainAccount.principal,
      identity: testIdentity,
      neuronId: mockSnsNeuronId,
    });
  });

  it("should call reloadNeuron", async () => {
    page.mock({ data: { universe: principalString, neuron: "12344" } });

    const reloadNeuron = vi.fn().mockResolvedValue(null);
    const po = await renderComponent({ neuron: mockSnsNeuron, reloadNeuron });

    expect(await po.getConfirmDisburseNeuronPo().isPresent()).toBe(true);

    expect(reloadNeuron).toBeCalledTimes(0);

    await po.getConfirmDisburseNeuronPo().clickConfirm();

    expect(reloadNeuron).toBeCalledTimes(1);
  });

  it("should trigger the project account load", async () => {
    icrcAccountsStore.reset();

    page.mock({ data: { universe: principalString, neuron: "12344" } });

    expect(loadSnsAccounts).toBeCalledTimes(0);

    const reloadNeuron = vi.fn().mockResolvedValue(null);
    await renderComponent({ neuron: mockSnsNeuron, reloadNeuron });

    await runResolvedPromises();
    expect(loadSnsAccounts).toBeCalledTimes(1);
  });

  it("should not trigger the project account load if already available", async () => {
    // Here we don't reset icrcAccountsStore.

    page.mock({ data: { universe: principalString, neuron: "12344" } });

    expect(loadSnsAccounts).toBeCalledTimes(0);

    const reloadNeuron = vi.fn().mockResolvedValue(null);
    await renderComponent({ neuron: mockSnsNeuron, reloadNeuron });

    await runResolvedPromises();
    expect(loadSnsAccounts).toBeCalledTimes(0);
  });
});
