/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import ProposalCountdown from "../../../../lib/components/proposals/ProposalCountdown.svelte";
import { secondsToDuration } from "../../../../lib/utils/date.utils";
import en from "../../../mocks/i18n.mock";
import { mockProposals } from "../../../mocks/proposals.store.mock";

describe("ProposalCountdown", () => {
  it("should render no countdown", () => {
    const { container } = render(ProposalCountdown, {
      props: {
        proposalInfo: {
          ...mockProposals[0],
          deadlineTimestampSeconds: undefined,
        },
      },
    });

    expect(container.querySelector("p.description")).toBeNull();
  });

  it("should render countdown", () => {
    const { container } = render(ProposalCountdown, {
      props: {
        proposalInfo: mockProposals[0],
      },
    });

    const durationTillDeadline =
      (mockProposals[0].deadlineTimestampSeconds as bigint) -
      BigInt(Math.round(Date.now() / 1000));

    const text = `${secondsToDuration(durationTillDeadline)} ${
      en.proposal_detail.remaining
    }`;

    expect(container.querySelector("p.description")?.textContent).toEqual(text);
  });
});
