import { SECONDS_IN_HALF_YEAR } from "$lib/constants/constants";
import NnsActiveDisbursementsModal from "$lib/modals/neurons/NnsActiveDisbursementsModal.svelte";
import { mockPrincipalText } from "$tests/mocks/auth.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import {
  mockMaturityDisbursement,
  mockNeuron,
} from "$tests/mocks/neurons.mock";
import { NnsActiveDisbursementsModalPo } from "$tests/page-objects/NnsActiveDisbursementsModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import type { NeuronInfo } from "@dfinity/nns";

describe("NnsActiveDisbursementsModal", () => {
  const maturityDisbursementAmount1 = 100_000_000n;
  const maturityDisbursementAmountIcp1 = 1;
  const maturityDisbursementAmount2 = 200_000_000n;
  const maturityDisbursementAmountIcp2 = 2;
  const testNeuron: NeuronInfo = {
    ...mockNeuron,
    fullNeuron: {
      ...mockNeuron.fullNeuron,
      maturityDisbursementsInProgress: [
        {
          ...mockMaturityDisbursement,
          amountE8s: maturityDisbursementAmount1,
          timestampOfDisbursementSeconds: 0n,
        },
        {
          ...mockMaturityDisbursement,
          amountE8s: maturityDisbursementAmount2,
          timestampOfDisbursementSeconds: BigInt(SECONDS_IN_HALF_YEAR),
        },
      ],
    },
  };
  const renderComponent = async (close = () => {}) => {
    const { container } = await renderModal({
      component: NnsActiveDisbursementsModal,
      props: {
        neuron: testNeuron,
        close,
      },
    });
    return NnsActiveDisbursementsModalPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should display total disbursement maturity", async () => {
    const po = await renderComponent();

    expect(await po.getTotalMaturity()).toBe(
      maturityDisbursementAmountIcp1 + maturityDisbursementAmountIcp2
    );
  });

  it("should display disbursement in progress entries", async () => {
    const po = await renderComponent();

    const entries = await po.getActiveDisbursementEntryPos();
    expect(entries).toHaveLength(2);

    // first entry
    expect(await entries[0].getMaturity()).toBe(
      `${maturityDisbursementAmountIcp1}.00`
    );
    expect(await entries[0].getDestination()).toBe(mockPrincipalText);
    expect(await entries[0].getTimestamp()).toBe("Jan 1, 1970 12:00 AM");

    // second entry
    expect(await entries[1].getMaturity()).toBe(
      `${maturityDisbursementAmountIcp2}.00`
    );
    expect(await entries[1].getDestination()).toBe(mockPrincipalText);
    expect(await entries[1].getTimestamp()).toBe("Jul 2, 1970 3:00 PM");
  });

  it("should call close", async () => {
    const close = vi.fn();
    const po = await renderComponent(close);

    await po.getCloseButtonPo().click();

    expect(close).toHaveBeenCalledTimes(1);
  });
});
