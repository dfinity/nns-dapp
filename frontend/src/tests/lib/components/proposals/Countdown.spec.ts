/**
 * @jest-environment jsdom
 */

import Countdown from "$lib/components/proposals/Countdown.svelte";
import { nowInSeconds, secondsToDuration } from "$lib/utils/date.utils";
import { render } from "@testing-library/svelte";
import en from "../../../mocks/i18n.mock";
import { mockProposals } from "../../../mocks/proposals.store.mock";

describe("Countdown", () => {
  beforeEach(() => {
    const now = Date.now();
    jest.useFakeTimers().setSystemTime(now);
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
