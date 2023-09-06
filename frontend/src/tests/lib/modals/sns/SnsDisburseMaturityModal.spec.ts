/**
 * @jest-environment jsdom
 */

import { disburseMaturity } from "$lib/api/sns-governance.api";
import SnsDisburseMaturityModal from "$lib/modals/sns/neurons/SnsDisburseMaturityModal.svelte";
import { authStore } from "$lib/stores/auth.store";
import { snsAccountsStore } from "$lib/stores/sns-accounts.store";
import { getSnsNeuronIdAsHexString } from "$lib/utils/sns-neuron.utils";
import { page } from "$mocks/$app/stores";
import {
  createMockIdentity,
  mockPrincipal,
} from "$tests/mocks/auth.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockSnsMainAccount } from "$tests/mocks/sns-accounts.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import { mockSnsFullProject } from "$tests/mocks/sns-projects.mock";
import { DisburseMaturityModalPo } from "$tests/page-objects/DisburseMaturityModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import { decodeIcrcAccount } from "@dfinity/ledger";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { fromDefinedNullable } from "@dfinity/utils";
import { waitFor } from "@testing-library/svelte";

jest.mock("$lib/api/sns-governance.api");

describe("SnsDisburseMaturityModal", () => {
  const reloadNeuron = jest.fn();
  const testIdentity = createMockIdentity(37373);

  const props = {
    neuron: mockSnsNeuron,
    neuronId: fromDefinedNullable(mockSnsNeuron.id),
    rootCanisterId: mockPrincipal,
    reloadNeuron,
  };

  const renderSnsDisburseMaturityModal =
    async (): Promise<DisburseMaturityModalPo> => {
      const { container } = await renderModal({
        component: SnsDisburseMaturityModal,
        props,
      });
      const po = DisburseMaturityModalPo.under(
        new JestPageObjectElement(container)
      );
      await po.waitFor();
      return po;
    };
  beforeEach(() => {
    jest.resetAllMocks();
    authStore.setForTesting(testIdentity);
    snsAccountsStore.setAccounts({
      rootCanisterId: mockPrincipal,
      accounts: [mockSnsMainAccount],
      certified: true,
    });
    setSnsProjects([
      {
        rootCanisterId: mockSnsMainAccount.principal,
        lifecycle: SnsSwapLifecycle.Committed,
      },
    ]);

    page.mock({
      data: {
        universe: mockSnsFullProject.rootCanisterId.toText(),
        neuron: getSnsNeuronIdAsHexString(mockSnsNeuron),
      },
    });
  });

  it("should display total maturity", async () => {
    const po = await renderSnsDisburseMaturityModal();
    expect(await po.getTotalMaturity()).toBe("1.00");
  });

  it("should disable next button when 0 selected", async () => {
    const po = await renderSnsDisburseMaturityModal();
    await po.setPercentage(0);
    expect(await po.isNextButtonDisabled()).toBe(true);
  });

  it("should enable next button when not 0 selected", async () => {
    const po = await renderSnsDisburseMaturityModal();
    await po.setPercentage(1);
    expect(await po.isNextButtonDisabled()).toBe(false);
  });

  it("should disable next button when destination address is not provided", async () => {
    const po = await renderSnsDisburseMaturityModal();
    await po.setPercentage(1);
    await po.setDestinationAddress("");
    expect(await po.isNextButtonDisabled()).toBe(true);
  });

  it("should display selected percentage", async () => {
    const po = await renderSnsDisburseMaturityModal();
    await po.setPercentage(13);
    await po.clickNextButton();

    expect(await po.getConfirmPercentage()).toBe("13%");
  });

  it("should display selected amount", async () => {
    const po = await renderSnsDisburseMaturityModal();
    await po.setPercentage(10);
    await po.clickNextButton();

    expect(await po.getConfirmAmount()).toBe("~0.10");
  });

  it("should display selected tokens 95%-105%", async () => {
    const po = await renderSnsDisburseMaturityModal();
    await po.setPercentage(100);
    await po.clickNextButton();

    expect(await po.getConfirmTokens()).toBe("0.95-1.05");
  });

  it("should display selected destination", async () => {
    const po = await renderSnsDisburseMaturityModal();
    await po.setPercentage(10);
    await po.clickNextButton();

    expect(await po.getConfirmDestination()).toBe(
      "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe"
    );
  });

  it("should call disburse maturity api and reloadNeuron", async () => {
    const po = await renderSnsDisburseMaturityModal();
    await po.setPercentage(50);
    await po.clickNextButton();

    // precondition
    expect(disburseMaturity).not.toBeCalled();
    expect(reloadNeuron).not.toBeCalled();

    await po.clickConfirmButton();

    expect(disburseMaturity).toBeCalledTimes(1);
    expect(disburseMaturity).toBeCalledWith({
      neuronId: fromDefinedNullable(mockSnsNeuron.id),
      rootCanisterId: mockPrincipal,
      percentageToDisburse: 50,
      identity: testIdentity,
      toAccount: decodeIcrcAccount(
        "xlmdg-vkosz-ceopx-7wtgu-g3xmd-koiyc-awqaq-7modz-zf6r6-364rh-oqe"
      ),
    });
    await waitFor(() => expect(reloadNeuron).toBeCalledTimes(1));
  });
});
