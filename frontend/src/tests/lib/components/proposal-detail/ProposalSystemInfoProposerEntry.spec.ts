/**
 * @jest-environment jsdom
 */

import ProposalSystemInfoProposerEntry from "$lib/components/proposal-detail/ProposalSystemInfoProposerEntry.svelte";
import { fireEvent, render, waitFor } from "@testing-library/svelte";
import { mockProposalInfo } from "../../../mocks/proposal.mock";
import {authStore} from "$lib/stores/auth.store";
import {authStoreMock, mockIdentity, mutableMockAuthStoreSubscribe} from "../../../mocks/auth.store.mock";

describe("ProposalMeta", () => {
  jest.spyOn(console, "error").mockImplementation(jest.fn);

  jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mutableMockAuthStoreSubscribe);

  const props = {
    proposer: mockProposalInfo.proposer,
  };

  // Proposer description display in tested in ProposalSystemInfoSection.spec.ts

  it("should render proposer id", () => {
    const { getByText } = render(ProposalSystemInfoProposerEntry, {
      props,
    });
    expect(
      getByText(new RegExp(`${mockProposalInfo.proposer?.toString()}$`))
    ).toBeInTheDocument();
  });

  describe("signed in", () => {
    beforeAll(() => {
      authStoreMock.next({
        identity: mockIdentity,
      });
    });

    it("should open proposer modal", async () => {
      const { container } = render(ProposalSystemInfoProposerEntry, {
        props,
      });

      const button = container.querySelector("button.text");
      expect(button).not.toBeNull();
      button && (await fireEvent.click(button));

      await waitFor(() =>
          expect(container.querySelector("div.modal")).not.toBeNull()
      );
    });
  });

  describe("not signed in", () => {
    beforeAll(() => {
      authStoreMock.next({
        identity: undefined,
      });
    });

    it("should render a static proposer information", async () => {
      const { getByTestId } = render(ProposalSystemInfoProposerEntry, {
        props,
      });

      expect(getByTestId("proposal-system-info-proposer-value").nodeName.toLowerCase()).toEqual("span");
    });
  });
});
