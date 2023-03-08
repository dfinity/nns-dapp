/**
 * @jest-environment jsdom
 */

import SaleInProgressModal from "$lib/modals/sns/sale/SaleInProgressModal.svelte";
import { SaleStep } from "$lib/types/sale";
import { renderModal } from "$tests/mocks/modal.mock";
import { waitFor } from "@testing-library/svelte";

describe("SaleInProgressModal", () => {
  const renderSaleInProgressModal = () =>
    renderModal({
      component: SaleInProgressModal,
      props: {
        progressStep: SaleStep.NOTIFY,
      },
    });

  it("should render progress in a modal", async () => {
    const { getByTestId } = await renderSaleInProgressModal();

    await waitFor(expect(getByTestId("in-progress-warning")).not.toBeNull);
  });
});
