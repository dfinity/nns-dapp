/**
 * @jest-environment jsdom
 */

import { Vote } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import VoteConfirmationModal from "../../../../lib/modals/proposals/VoteConfirmationModal.svelte";
import en from "../../../mocks/i18n.mock";

describe("VoteConfirmationModal", () => {
  it("should display Adopt state", () => {
    const { container, getByText } = render(VoteConfirmationModal, {
      props: {
        voteType: Vote.Yes,
        votingPower: BigInt(4000000000),
      },
    });
    expect(
      container.querySelector('[data-tid="thumb-up"]')
    ).toBeInTheDocument();
    expect(
      getByText(en.proposal_detail__vote.confirm_adopt_headline)
    ).toBeInTheDocument();
  });

  it("should display Reject state", () => {
    const { container, getByText } = render(VoteConfirmationModal, {
      props: {
        voteType: Vote.No,
        votingPower: BigInt(4000000000),
      },
    });
    expect(
      container.querySelector('[data-tid="thumb-down"]')
    ).toBeInTheDocument();
    expect(
      getByText(en.proposal_detail__vote.confirm_reject_headline)
    ).toBeInTheDocument();
  });

  it("should have formatted votingPower", () => {
    const { getByText } = render(VoteConfirmationModal, {
      props: {
        voteType: Vote.No,
        votingPower: BigInt(4000000000),
      },
    });
    expect(getByText("40.00", { exact: false })).toBeInTheDocument();
  });

  it("should have confirmation buttons", () => {
    const { container } = render(VoteConfirmationModal, {
      props: {
        voteType: Vote.No,
        votingPower: BigInt(4000000000),
      },
    });
    expect(
      container.querySelector('[data-tid="confirm-no"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-tid="confirm-yes"]')
    ).toBeInTheDocument();
  });
});
