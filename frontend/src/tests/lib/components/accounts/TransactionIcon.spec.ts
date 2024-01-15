import TransactionIcon from "$lib/components/accounts/TransactionIcon.svelte";
import type { TransactionIconType } from "$lib/types/transaction";
import { TransactionIconPo } from "$tests/page-objects/TransactionIcon.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("TransactionIcon", () => {
  const renderComponent = (props: {
    type: TransactionIconType;
    isPending?: boolean;
  }) => {
    const { container } = render(TransactionIcon, { props });
    return TransactionIconPo.under(new JestPageObjectElement(container));
  };

  it("renders sent icon", async () => {
    const po = renderComponent({
      type: "sent",
      isPending: false,
    });

    expect(await po.isSentIcon()).toBe(true);
    expect(await po.isPendingSendIcon()).toBe(false);
    expect(await po.isReceivedIcon()).toBe(false);
    expect(await po.isPendingReceiveIcon()).toBe(false);
    expect(await po.isReimbursementIcon()).toBe(false);
    expect(await po.isFailedIcon()).toBe(false);
  });

  it("renders pending sent icon", async () => {
    const po = renderComponent({
      type: "sent",
      isPending: true,
    });

    expect(await po.isPendingSendIcon()).toBe(true);
    expect(await po.isSentIcon()).toBe(false);
    expect(await po.isReceivedIcon()).toBe(false);
    expect(await po.isPendingReceiveIcon()).toBe(false);
    expect(await po.isReimbursementIcon()).toBe(false);
    expect(await po.isFailedIcon()).toBe(false);
  });

  it("renders received icon", async () => {
    const po = renderComponent({
      type: "received",
      isPending: false,
    });

    expect(await po.isReceivedIcon()).toBe(true);
    expect(await po.isPendingReceiveIcon()).toBe(false);
    expect(await po.isSentIcon()).toBe(false);
    expect(await po.isPendingSendIcon()).toBe(false);
    expect(await po.isReimbursementIcon()).toBe(false);
    expect(await po.isFailedIcon()).toBe(false);
  });

  it("renders pending received icon", async () => {
    const po = renderComponent({
      type: "received",
      isPending: true,
    });

    expect(await po.isPendingReceiveIcon()).toBe(true);
    expect(await po.isReceivedIcon()).toBe(false);
    expect(await po.isSentIcon()).toBe(false);
    expect(await po.isPendingSendIcon()).toBe(false);
    expect(await po.isReimbursementIcon()).toBe(false);
    expect(await po.isFailedIcon()).toBe(false);
  });

  it("renders failed icon", async () => {
    const po = renderComponent({
      type: "failed",
    });

    expect(await po.isFailedIcon()).toBe(true);
    expect(await po.isSentIcon()).toBe(false);
    expect(await po.isPendingSendIcon()).toBe(false);
    expect(await po.isReceivedIcon()).toBe(false);
    expect(await po.isPendingReceiveIcon()).toBe(false);
    expect(await po.isReimbursementIcon()).toBe(false);
  });

  it("renders reimbursed icon", async () => {
    const po = renderComponent({
      type: "reimbursed",
    });

    expect(await po.isReimbursementIcon()).toBe(true);
    expect(await po.isSentIcon()).toBe(false);
    expect(await po.isPendingSendIcon()).toBe(false);
    expect(await po.isReceivedIcon()).toBe(false);
    expect(await po.isPendingReceiveIcon()).toBe(false);
    expect(await po.isFailedIcon()).toBe(false);
  });
});
