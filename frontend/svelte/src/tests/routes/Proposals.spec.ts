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
    const { getByText } = render(Proposals);

    expect(getByText("Voting")).toBeInTheDocument();
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
});
