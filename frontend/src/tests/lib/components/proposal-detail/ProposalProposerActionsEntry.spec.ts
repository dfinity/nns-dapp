/**
 * @jest-environment jsdom
 */

import ProposalProposerActionsEntry from "$lib/components/proposal-detail/ProposalProposerActionsEntry.svelte";
import { render } from "@testing-library/svelte";

describe("ProposalProposerActionsEntry", () => {
  it("should render action key", () => {
    const { getByText } = render(ProposalProposerActionsEntry, {
      props: {
        actionKey: "actionKey",
        actionFields: [],
      },
    });

    expect(getByText("actionKey")).toBeInTheDocument();
  });

  it("should render action fields", () => {
    const key = "key";
    const value = "value";
    const { getByText } = render(ProposalProposerActionsEntry, {
      props: {
        actionKey: "actionKey",
        actionFields: [[key, value]],
      },
    });

    expect(getByText(key)).toBeInTheDocument();
    expect(getByText(value)).toBeInTheDocument();
  });

  it("should render object fields as JSON", () => {
    const key = "key";
    const value = { key: "value" };
    const key2 = "key2";
    const value2 = { key: "value" };
    const nodeProviderActions = render(ProposalProposerActionsEntry, {
      props: {
        actionKey: "actionKey",
        actionFields: [
          [key, value],
          [key2, value2],
        ],
      },
    });

    expect(nodeProviderActions.queryAllByTestId("json").length).toBe(2);
  });

  it("should render text fields as plane text", () => {
    const key = "key";
    const value = "value";
    const motionActions = render(ProposalProposerActionsEntry, {
      props: {
        actionKey: "actionKey",
        actionFields: [[key, value]],
      },
    });

    expect(motionActions.queryAllByTestId("json").length).toBe(0);
  });

  it("should render undefined fields as 'undefined'", () => {
    const key = "key";
    const value = { key: "value", anotherKey: undefined };
    const { getByText } = render(ProposalProposerActionsEntry, {
      props: {
        actionKey: "actionKey",
        actionFields: [[key, value]],
      },
    });

    expect(getByText("undefined")).toBeInTheDocument();
  });
});
