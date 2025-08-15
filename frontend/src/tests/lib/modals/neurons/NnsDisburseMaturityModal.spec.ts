import * as api from "$lib/api/governance.api";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { MIN_DISBURSEMENT_WITH_VARIANCE } from "$lib/constants/neurons.constants";
import NnsDisburseMaturityModal from "$lib/modals/neurons/NnsDisburseMaturityModal.svelte";
import { neuronsStore } from "$lib/stores/neurons.store";
import { page } from "$mocks/$app/stores";
import { mockIdentity, resetIdentity } from "$tests/mocks/auth.store.mock";
import en from "$tests/mocks/i18n.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import { DisburseMaturityModalPo } from "$tests/page-objects/DisburseMaturityModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { setAccountsForTesting } from "$tests/utils/accounts.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { extractHrefFromText } from "$tests/utils/utils.test-utils";
import { busyStore, toastsStore } from "@dfinity/gix-components";
import type { NeuronInfo } from "@dfinity/nns";
import { get } from "svelte/store";

vi.mock("$lib/api/governance.api");

describe("NnsDisburseMaturityModal", () => {
  const minMaturityForDisbursement = MIN_DISBURSEMENT_WITH_VARIANCE;
  const enoughMaturityToDisburse1Percent = minMaturityForDisbursement * 100n;
  const testNeuron = (
    maturityE8sEquivalent: bigint = enoughMaturityToDisburse1Percent
  ): NeuronInfo => ({
    ...mockNeuron,
    fullNeuron: {
      ...mockNeuron.fullNeuron,
      maturityE8sEquivalent,
      controller: mockIdentity.getPrincipal().toText(),
    },
  });

  beforeEach(() => {
    resetIdentity();
    setAccountsForTesting({
      main: mockMainAccount,
      hardwareWallets: [],
    });
  });

  const renderNnsDisburseMaturityModal = async ({
    neuron,
    close,
  }: {
    neuron: NeuronInfo;
    close?: () => void;
  }): Promise<DisburseMaturityModalPo> => {
    const { container } = await renderModal({
      component: NnsDisburseMaturityModal,
      props: {
        neuron,
        neuronId: neuron.neuronId,
        close,
      },
    });
    return DisburseMaturityModalPo.under(new JestPageObjectElement(container));
  };

  it("should display total maturity", async () => {
    const po = await renderNnsDisburseMaturityModal({
      neuron: testNeuron(minMaturityForDisbursement),
    });
    // MINIMUM_DISBURSEMENT / MATURITY_MODULATION_VARIANCE_PERCENTAGE
    expect(await po.getTotalMaturity()).toBe("1.05");
  });

  it("should display Nns description", async () => {
    page.mock({ data: { universe: OWN_CANISTER_ID_TEXT } });

    const po = await renderNnsDisburseMaturityModal({
      neuron: testNeuron(minMaturityForDisbursement),
    });
    const href = extractHrefFromText(await po.getDescriptionHtml());

    expect(href).toBeDefined();
    expect(href).toEqual(
      extractHrefFromText(en.neuron_detail.disburse_maturity_description_2_nns)
    );
  });

  it("should disable next button when 0 selected", async () => {
    const po = await renderNnsDisburseMaturityModal({ neuron: testNeuron() });
    await po.setPercentage(100);
    expect(await po.isNextButtonDisabled()).toBe(false);
    await po.setPercentage(0);
    expect(await po.isNextButtonDisabled()).toBe(true);
  });

  it("should enable next button when enough maturity is selected", async () => {
    const po = await renderNnsDisburseMaturityModal({ neuron: testNeuron() });
    await po.setPercentage(1);
    expect(await po.isNextButtonDisabled()).toBe(false);
  });

  it("should the main address be selected by default", async () => {
    const po = await renderNnsDisburseMaturityModal({ neuron: testNeuron() });
    await po.setPercentage(10);
    await po.clickNextButton();
    expect(await po.getConfirmPercentage()).toEqual("10%");
    expect(await po.getConfirmDestination()).toEqual("Main");
  });

  it("should disable next button if amount of maturity is less than enough", async () => {
    const po = await renderNnsDisburseMaturityModal({
      neuron: testNeuron(minMaturityForDisbursement),
    });
    await po.setPercentage(99);
    expect(await po.isNextButtonDisabled()).toBe(true);
    await po.setPercentage(100);
    expect(await po.isNextButtonDisabled()).toBe(false);
  });

  it("should display summary information in the last step", async () => {
    const po = await renderNnsDisburseMaturityModal({ neuron: testNeuron() });
    await po.setPercentage(50);
    await po.clickNextButton();
    expect(await po.getConfirmPercentage()).toEqual("50%");
    expect(await po.getConfirmTokens()).toBe("50.00-55.27 ICP");
    expect(await po.getConfirmDestination()).toEqual("Main");
  });

  // FIXME: This test makes other tests fail if it runs first.
  it("should successfully disburse maturity", async () => {
    const neuron = testNeuron();
    const close = vi.fn();
    let resolveDisburseMaturity;
    const spyDisburseMaturity = vi
      .spyOn(api, "disburseMaturity")
      .mockImplementation(
        () => new Promise((resolve) => (resolveDisburseMaturity = resolve))
      );
    const spyQueryNeurons = vi
      .spyOn(api, "queryNeurons")
      .mockResolvedValue([neuron]);
    // Add the neuron to the store to avoid extra query from getIdentityOfControllerByNeuronId
    neuronsStore.setNeurons({
      neurons: [neuron],
      certified: true,
    });
    const po = await renderNnsDisburseMaturityModal({ neuron, close });

    await po.setPercentage(100);
    await po.clickNextButton();

    expect(
      await po.getNeuronConfirmActionScreenPo().getConfirmButton().isDisabled()
    ).toEqual(false);
    expect(spyDisburseMaturity).toHaveBeenCalledTimes(0);
    expect(spyQueryNeurons).toHaveBeenCalledTimes(0);
    expect(get(busyStore)).toEqual([]);
    expect(get(toastsStore)).toEqual([]);

    await po.clickConfirmButton();
    await runResolvedPromises();

    expect(spyQueryNeurons).toHaveBeenCalledTimes(0);
    expect(spyDisburseMaturity).toHaveBeenCalledTimes(1);
    expect(spyDisburseMaturity).toHaveBeenCalledWith({
      neuronId: neuron.neuronId,
      percentageToDisburse: 100,
      identity: mockIdentity,
      toAccountIdentifier: mockMainAccount.identifier,
    });
    expect(close).toHaveBeenCalledTimes(0);
    expect(get(busyStore)).toEqual([
      {
        initiator: "disburse-maturity",
        text: undefined,
      },
    ]);
    expect(get(toastsStore)).toEqual([]);

    resolveDisburseMaturity();
    await runResolvedPromises();

    expect(spyQueryNeurons).toHaveBeenCalledTimes(2);
    expect(spyQueryNeurons).toHaveBeenCalledWith(
      expect.objectContaining({
        certified: false,
      })
    );
    expect(spyQueryNeurons).toHaveBeenCalledWith(
      expect.objectContaining({
        certified: true,
      })
    );
    expect(get(busyStore)).toEqual([]);
    expect(get(toastsStore)).toMatchObject([
      {
        level: "success",
        text: "Maturity disbursing.",
      },
    ]);
    expect(close).toHaveBeenCalledTimes(1);
  });
});
