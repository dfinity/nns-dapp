import RestoreSaleParticipationModal from "$lib/modals/sns/sale/RestoreSaleParticipationModal.svelte";
import { nanoSecondsToDateTime } from "$lib/utils/date.utils";
import { mockPrincipal } from "$tests/mocks/auth.store.mock";
import { renderModal } from "$tests/mocks/modal.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { snsTicketMock } from "$tests/mocks/sns.mock";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { RestoreSaleParticipationModalPo } from "$tests/page-objects/RestoreSaleParticipationModal.page-object";

describe("RestoreSaleParticipationModal", () => {
  const { ticket } = snsTicketMock({
    rootCanisterId: rootCanisterIdMock,
    owner: mockPrincipal,
  });
  const creationTime =
    BigInt(new Date("2024-03-05T10:00:00Z").getTime()) * 1_000_000n;

  const renderComponent = async ({
    onConfirm,
    onClose,
  }: {
    onConfirm?: () => void;
    onClose?: () => void;
  } = {}) => {
    const { container } = await renderModal({
      component: RestoreSaleParticipationModal,
      props: {
        ticket: {
          ...ticket,
          creation_time: creationTime,
        },
        projectName: "Test Project",
      },
      events: {
        nnsConfirm: onConfirm,
        nnsClose: onClose,
      },
    });
    return RestoreSaleParticipationModalPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should show the ticket amount, project and time", async () => {
    const po = await renderComponent();

    expect(await po.getDescription()).toBe(
      `You started a participation of 10.00 ICP in Test Project on ${nanoSecondsToDateTime(creationTime)}, but it was not completed. Do you want to complete it now?`
    );
  });

  it("should render the action labels", async () => {
    const po = await renderComponent();

    expect(await po.getConfirmYesButton().getText()).toBe(
      "Complete participation"
    );
    expect(await po.getConfirmNoButton().getText()).toBe(
      "Cancel participation"
    );
  });

  it("should dispatch nnsConfirm on complete", async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    const po = await renderComponent({ onConfirm, onClose });

    await po.clickYes();

    expect(onConfirm).toBeCalledTimes(1);
    expect(onClose).not.toBeCalled();
  });

  it("should dispatch nnsClose on cancel", async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    const po = await renderComponent({ onConfirm, onClose });

    await po.clickNo();

    expect(onClose).toBeCalledTimes(1);
    expect(onConfirm).not.toBeCalled();
  });
});
