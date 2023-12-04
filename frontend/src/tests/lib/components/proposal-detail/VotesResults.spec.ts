import VotesResults from "$lib/components/proposal-detail/VotesResults.svelte";
import { nowInSeconds } from "$lib/utils/date.utils";
import { VotesResultPo } from "$tests/page-objects/VotesResults.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";
import { describe } from "vitest";

const now = nowInSeconds();

describe("VotesResults", () => {
  const yesCount = 2;
  const noCount = 3;
  const totalValue = 5;
  const renderComponent = (
    { deadlineTimestampSeconds }: { deadlineTimestampSeconds: bigint } = {
      deadlineTimestampSeconds: 0n,
    }
  ) => {
    const { container } = render(VotesResults, {
      props: {
        yes: yesCount,
        no: noCount,

        total: totalValue,
        deadlineTimestampSeconds,
      },
    });

    return VotesResultPo.under(new JestPageObjectElement(container));
  };

  it('should render "Adopt" value', async () => {
    const votesResultPo = renderComponent();
    expect(await votesResultPo.getAdoptVotingPower()).toEqual(yesCount);
  });

  it('should render "Reject" value', async () => {
    const votesResultPo = renderComponent();
    expect(await votesResultPo.getRejectVotingPower()).toEqual(noCount);
  });

  it("should render progressbar", async () => {
    const votesResultPo = renderComponent();

    expect(await votesResultPo.getProgressMinValue()).toBe(0);
    expect(await votesResultPo.getProgressNowValue()).toBe(yesCount);
    expect(await votesResultPo.getProgressMaxValue()).toBe(totalValue);
  });

  it("should render Expiration date", async () => {
    const votesResultPo = renderComponent({
      deadlineTimestampSeconds: BigInt(now + 100000),
    });
    expect(await votesResultPo.getExpirationDateText()).toEqual(
      "Expiration date 1 day, 3 hours remaining"
    );
  });

  it("should hide Expiration date when deadline in past", async () => {
    const votesResultPo = renderComponent({
      deadlineTimestampSeconds: BigInt(now - 1),
    });
    expect(await votesResultPo.getExpirationDateText()).toBe("");
  });
});
