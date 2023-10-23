import ProposalCard from "$lib/components/proposals/ProposalCard.svelte";
import { ProposalStatusColor } from "$lib/constants/proposals.constants";
import { nowInSeconds } from "$lib/utils/date.utils";
import en from "$tests/mocks/i18n.mock";
import { render } from "@testing-library/svelte";

describe("ProposalCard", () => {
  vi.useFakeTimers().setSystemTime(Date.now());

  const nowSeconds = Math.floor(nowInSeconds());
  const props = {
    hidden: false,
    statusString: "Open",
    id: BigInt(112),
    title: "Test Proposal",
    color: ProposalStatusColor.PRIMARY,
    topic: "Test Topic",
    proposer: "1233444",
    type: "Test Type",
    deadlineTimestampSeconds: BigInt(nowSeconds + 3600),
    href: "https://nns.ic0.app/proposal/?u=qoctq-giaaa-aaaaa-aaaea-cai&proposal=123786",
  };

  afterAll(() => {
    vi.useRealTimers();
  });

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

  it("should render an url", () => {
    const { getByTestId } = render(ProposalCard, {
      props,
    });

    const card = getByTestId("proposal-card");
    expect(card).not.toBeNull();
    expect(card.hasAttribute("href")).toBeTruthy();
    expect(card.getAttribute("href")).toEqual(props.href);
  });
});
