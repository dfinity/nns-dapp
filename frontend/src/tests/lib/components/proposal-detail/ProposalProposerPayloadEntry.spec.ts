import ProposalProposerPayloadEntry from "$lib/components/proposal-detail/ProposalProposerPayloadEntry.svelte";
import { JsonPreviewPo } from "$tests/page-objects/JsonPreview.page-object";
import { JsonRepresentationModeTogglePo } from "$tests/page-objects/JsonRepresentationModeToggle.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";

describe("ProposalProposerPayloadEntry", () => {
  const payload = { b: "c" };

  it("should render payload", async () => {
    const { container } = render(ProposalProposerPayloadEntry, {
      props: {
        payload,
      },
    });

    await runResolvedPromises();

    const po = JsonPreviewPo.under(new JestPageObjectElement(container));
    expect(await po.getRawObject()).toEqual({
      b: "c",
    });
  });

  it("should render json mode toggle", async () => {
    const { container } = render(ProposalProposerPayloadEntry, {
      props: {
        payload,
      },
    });

    expect(
      await JsonRepresentationModeTogglePo.under(
        new JestPageObjectElement(container)
      ).isPresent()
    ).toBe(true);
  });
});
