import Countdown from "$lib/components/proposals/Countdown.svelte";
import { nowInSeconds, secondsToDuration } from "$lib/utils/date.utils";
import en from "$tests/mocks/i18n.mock";
import { mockProposals } from "$tests/mocks/proposals.store.mock";
import { render } from "@testing-library/svelte";
import { vi } from "vitest";

describe("Countdown", () => {
  beforeEach(() => {
    const now = Date.now();
    vi.useFakeTimers().setSystemTime(now);
  });
  it("should render no countdown", () => {
    const { container } = render(Countdown, {
      props: {
        deadlineTimestampSeconds: undefined,
      },
    });

    expect(container.querySelector("p.description")).toBeNull();
  });

  it("should render countdown", () => {
    const { container } = render(Countdown, {
      props: {
        deadlineTimestampSeconds: mockProposals[0].deadlineTimestampSeconds,
      },
    });

    const now = nowInSeconds();
    const durationTillDeadline =
      (mockProposals[0].deadlineTimestampSeconds as bigint) - BigInt(now);

    const text = `${secondsToDuration(durationTillDeadline)} ${
      en.proposal_detail.remaining
    }`;

    expect(container.querySelector("p.description")?.textContent).toEqual(text);
  });
});
