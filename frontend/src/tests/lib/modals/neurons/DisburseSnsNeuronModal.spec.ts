import * as snsGovernanceApi from "$lib/api/sns-governance.api";
import DisburseSnsNeuronModal from "$lib/modals/neurons/DisburseSnsNeuronModal.svelte";
import * as authServices from "$lib/services/auth.services";
import { syncSnsAccounts } from "$lib/services/sns-accounts.services";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { snsQueryStore } from "$lib/stores/sns.store";
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
import { snsResponseFor } from "$tests/mocks/sns-response.mock";
import type { SnsNeuron } from "@dfinity/sns";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { fireEvent, waitFor, type RenderResult } from "@testing-library/svelte";
import type { SvelteComponent } from "svelte";

vi.mock("$lib/api/sns-governance.api");
vi.mock("$lib/services/sns-accounts.services");

const testIdentity = createMockIdentity(37373);

describe("DisburseSnsNeuronModal", () => {
  const principalString = `${mockSnsMainAccount.principal}`;
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

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(authServices, "getAuthenticatedIdentity").mockResolvedValue(
      testIdentity
    );

    snsAccountsStore.setAccounts({
      rootCanisterId: mockPrincipal,
      accounts: [mockSnsMainAccount, mockSnsSubAccount],
      certified: true,
    });

    snsQueryStore.setData(
      snsResponseFor({
        principal: mockSnsMainAccount.principal,
        lifecycle: SnsSwapLifecycle.Committed,
      })
    );
  });

  it("should display modal", async () => {
    const { container } = await renderDisburseModal(mockSnsNeuron);

    expect(container.querySelector("div.modal")).not.toBeNull();
  });

  it("should render a confirmation screen", async () => {
    page.mock({ data: { universe: principalString, neuron: "12344" } });

    const { queryByTestId } = await renderDisburseModal(mockSnsNeuron);

    await waitFor(() =>
      expect(queryByTestId("confirm-disburse-screen")).not.toBeNull()
    );
  });

  it("should call disburse service", async () => {
    page.mock({ data: { universe: principalString, neuron: "12344" } });

    const { queryByTestId } = await renderDisburseModal(mockSnsNeuron);

    expect(queryByTestId("confirm-disburse-screen")).not.toBeNull();

    const confirmButton = queryByTestId("disburse-neuron-button");
    expect(confirmButton).not.toBeNull();

    confirmButton && (await fireEvent.click(confirmButton));
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
    const { queryByTestId } = await renderDisburseModal(
      mockSnsNeuron,
      reloadNeuron
    );

    expect(queryByTestId("confirm-disburse-screen")).not.toBeNull();

    const confirmButton = queryByTestId("disburse-neuron-button");
    expect(confirmButton).not.toBeNull();

    confirmButton && (await fireEvent.click(confirmButton));

    await waitFor(() => expect(reloadNeuron).toBeCalled());
  });

  it("should trigger the project account load", async () => {
    snsAccountsStore.reset();

    page.mock({ data: { universe: principalString, neuron: "12344" } });

    const reloadNeuron = vi.fn().mockResolvedValue(null);
    await renderDisburseModal(mockSnsNeuron, reloadNeuron);

    await waitFor(() => expect(syncSnsAccounts).toBeCalled());
  });

  it("should not trigger the project account load if already available", async () => {
    page.mock({ data: { universe: principalString, neuron: "12344" } });

    const reloadNeuron = vi.fn().mockResolvedValue(null);
    const { queryByTestId } = await renderDisburseModal(
      mockSnsNeuron,
      reloadNeuron
    );

    await waitFor(() =>
      expect(queryByTestId("disburse-neuron-button")).not.toBeNull()
    );

    await fireEvent.click(queryByTestId("disburse-neuron-button") as Element);

    await waitFor(() => expect(syncSnsAccounts).not.toBeCalled());
  });
});
