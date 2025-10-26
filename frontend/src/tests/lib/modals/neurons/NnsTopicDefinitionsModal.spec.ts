import NnsTopicDefinitionsModal from "$lib/modals/neurons/NnsTopicDefinitionsModal.svelte";
import { renderModal } from "$tests/mocks/modal.mock";
import { NnsTopicDefinitionsModalPo } from "$tests/page-objects/NnsTopicDefinitionsModal.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";

describe("NnsTopicDefinitionsModal", () => {
  const renderComponent = async ({ onClose }: { onClose?: () => void }) => {
    const { container } = await renderModal({
      component: NnsTopicDefinitionsModal,
      props: {
        onClose: onClose ?? vi.fn(),
      },
    });

    return NnsTopicDefinitionsModalPo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should display required topics with correct titles", async () => {
    const po = await renderComponent({});

    const requiredTopicTitles = await po.getRequiredTopicTitles();
    expect(requiredTopicTitles).toEqual([
      "Governance",
      "SNS & Neurons' Fund",
      "All Except Governance, and SNS & Neurons' Fund",
    ]);
  });

  it("should display other topics", async () => {
    const po = await renderComponent({});

    const otherTopicTitles = await po.getOtherTopicTitles();
    expect(otherTopicTitles.length).toBeGreaterThan(0);
    expect(otherTopicTitles).not.toContain("Governance");
    expect(otherTopicTitles).not.toContain("SNS & Neurons' Fund");
    expect(otherTopicTitles).not.toContain(
      "All Except Governance, and SNS & Neurons' Fund"
    );
  });

  it("should call onClose when close button is clicked", async () => {
    const onClose = vi.fn();
    const po = await renderComponent({ onClose });

    await po.clickCloseButton();

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
