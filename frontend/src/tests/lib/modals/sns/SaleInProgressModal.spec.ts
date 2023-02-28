/**
 * @jest-environment jsdom
 */

import SaleInProgressModal from "$lib/modals/sns/sale/SaleInProgressModal.svelte";
import { SaleStep } from "$lib/types/sale";
import { waitFor } from "@testing-library/svelte";
import { renderModal } from "../../../mocks/modal.mock";

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

    await waitFor(expect(getByTestId("sale-in-progress-warning")).not.toBeNull);
  });
});
