import ProposalCard from "$lib/components/proposals/ProposalCard.svelte";
import { SECONDS_IN_DAY } from "$lib/constants/constants";
import { ProposalStatusColor } from "$lib/constants/proposals.constants";
import en from "$tests/mocks/i18n.mock";
import { render } from "@testing-library/svelte";

describe("ProposalCard", () => {
  const now = 1698139468000;
  const nowSeconds = Math.floor(now / 1000);
  const props = {
    hidden: false,
    statusString: "Open",
    id: BigInt(112),
    heading: "Treasury Proposal",
    title: "Give me my tokens",
    color: ProposalStatusColor.SUCCESS,
    deadlineTimestampSeconds: BigInt(nowSeconds + SECONDS_IN_DAY),
    createdTimestampSeconds: BigInt(nowSeconds - SECONDS_IN_DAY),
    href: "https://nns.ic0.app/proposal/?u=qoctq-giaaa-aaaaa-aaaea-cai&proposal=123786",
  };

  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(now);
  });

  it("should render a heading", () => {
    const { getByText } = render(ProposalCard, {
      props,
    });

    expect(getByText(props.heading)).toBeInTheDocument();
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

  it("should render a proposal id", () => {
    const { getByText } = render(ProposalCard, {
      props,
    });

    expect(getByText(`${props.id}`, { exact: false })).toBeInTheDocument();
  });

  it("should render countdown", () => {
    const { queryByTestId } = render(ProposalCard, {
      props,
    });

    expect(queryByTestId("countdown")).toBeInTheDocument();
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
