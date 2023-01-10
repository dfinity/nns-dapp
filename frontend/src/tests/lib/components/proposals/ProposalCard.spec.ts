/**
 * @jest-environment jsdom
 */

import ProposalCard from "$lib/components/proposals/ProposalCard.svelte";
import { ProposalStatusColor } from "$lib/constants/proposals.constants";
import { nowInSeconds } from "$lib/utils/date.utils";
import { ProposalStatus } from "@dfinity/nns";
import { render } from "@testing-library/svelte";
import en from "../../../mocks/i18n.mock";

describe("ProposalCard", () => {
  const nowSeconds = Math.floor(nowInSeconds());
  const props = {
    hidden: false,
    status: ProposalStatus.Open,
    id: BigInt(112),
    title: "Test Proposal",
    color: ProposalStatusColor.PRIMARY,
    topic: "Test Topic",
    proposer: "1233444",
    type: "Test Type",
    deadlineTimestampSeconds: BigInt(nowSeconds + 3600),
  };
  it("should render a title", () => {
    const { getByText } = render(ProposalCard, {
      props,
    });

    expect(getByText(props.title)).toBeInTheDocument();
  });

  it("should render a proposal status", () => {
    const { getByText } = render(ProposalCard, {
      props,
    });

    expect(getByText(en.status.Open)).toBeInTheDocument();
  });

  it("should render a proposer", () => {
    const { getByText } = render(ProposalCard, {
      props,
    });

    expect(getByText(props.proposer, { exact: false })).toBeInTheDocument();
  });

  it("should render a proposal id", () => {
    const { getByText } = render(ProposalCard, {
      props,
    });

    expect(getByText(`${props.id}`, { exact: false })).toBeInTheDocument();
  });

  it("should render a proposal topic", () => {
    const { getByText } = render(ProposalCard, {
      props,
    });

    expect(getByText(props.topic, { exact: false })).toBeInTheDocument();
  });

  it("should render a proposal a type", () => {
    const { getByText } = render(ProposalCard, {
      props,
    });

    expect(getByText(props.type)).toBeInTheDocument();
  });

  it("should render countdown", () => {
    const { queryByTestId } = render(ProposalCard, {
      props,
    });

    expect(queryByTestId("countdown")).toBeInTheDocument();
  });

  it("should render accessible info without label", () => {
    const { container } = render(ProposalCard, {
      props,
    });

    expect(
      container.querySelector(`[aria-label="${en.proposal_detail.id_prefix}"]`)
    ).not.toBeNull();
    expect(
      container.querySelector(
        `[aria-label="${en.proposal_detail.type_prefix}"]`
      )
    ).not.toBeNull();
  });

  it("should render a specific color for the status", () => {
    const { container } = render(ProposalCard, {
      props: {
        ...props,
        color: ProposalStatusColor.SUCCESS,
      },
    });

    expect(container.querySelector(".success")).not.toBeNull();
  });
});
