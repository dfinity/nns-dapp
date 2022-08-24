/**
 * @jest-environment jsdom
 */

import {render, waitFor} from "@testing-library/svelte";
import ProposalSystemInfoEntry from "../../../../lib/components/proposal-detail/ProposalSystemInfoEntry.svelte";
import en from "../../../mocks/i18n.mock";

jest.mock("../../../../lib/utils/html.utils", () => ({
  sanitizeHTML: (value) => Promise.resolve(value),
}));

describe("ProjectSystemInfoEntry", () => {
  it("should render a description placeholder if no description", async () => {
    const renderResult = render(ProposalSystemInfoEntry, {
      props: {
        labelKey: "test",
        testId: "test",
        value: "",
        description: undefined,
      },
    });

    const { getByTestId } = renderResult;
    await waitFor(() => expect(getByTestId(`test-description`)?.textContent).toEqual(
        en.proposal_detail.no_more_info
    ));
  });
});
