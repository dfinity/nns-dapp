/**
 * @jest-environment jsdom
 */

import CkBTCReceiveModal from "$lib/modals/accounts/CkBTCReceiveModal.svelte";
import {
  mockCkBTCAddress,
  mockCkBTCMainAccount,
} from "../../../mocks/ckbtc-accounts.mock";
import { renderModal } from "../../../mocks/modal.mock";

describe("CkBTCReceiveModal", () => {
  const renderTransactionModal = () =>
    renderModal({
      component: CkBTCReceiveModal,
      props: {
        data: {
          account: mockCkBTCMainAccount,
          btcAddress: mockCkBTCAddress,
        },
      },
    });

  it("should render BTC address", async () => {
    const { getByText } = await renderTransactionModal();

    expect(getByText(mockCkBTCAddress)).toBeInTheDocument();
  });

  it("should render account identifier (without being shortened)", async () => {
    const { getByText } = await renderTransactionModal();

    expect(getByText(mockCkBTCMainAccount.identifier)).toBeInTheDocument();
  });
});
