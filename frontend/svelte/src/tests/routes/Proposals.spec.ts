/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import { authStore } from "../../lib/stores/auth.store";
import { mockAuthStoreSubscribe } from "../mocks/auth.store.mock";
import Proposals from "../../routes/Proposals.svelte";

describe("Proposals", () => {
  let authStoreMock;

  beforeEach(() => {
    authStoreMock = jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mockAuthStoreSubscribe);
  });

  it("should render a title", () => {
    const { container } = render(Proposals);

    const title: HTMLHeadingElement | null = container.querySelector("h1");
    expect(title).not.toBeNull();
    expect(title.textContent).toEqual("Voting");
  });

  it("should render a description", () => {
    const { getByText } = render(Proposals);

    expect(
      getByText(
        "The Internet Computer network runs under the control of the Network Nervous System",
        { exact: false }
      )
    ).toBeInTheDocument();
  });

  it("should render filters", () => {
    const { getByText } = render(Proposals);

    expect(getByText("Topics")).toBeInTheDocument();
    expect(getByText("Reward Status")).toBeInTheDocument();
    expect(getByText("Proposal Status")).toBeInTheDocument();
    expect(
      getByText('Hide "Open" proposals', {
        exact: false,
      })
    ).toBeInTheDocument();
  });
});
