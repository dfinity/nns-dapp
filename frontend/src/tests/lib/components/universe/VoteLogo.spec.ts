import VoteLogo from "$lib/components/universe/VoteLogo.svelte";
import { VoteLogoPo } from "$tests/page-objects/VoteLogo.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";
import { describe } from "vitest";

describe("VoteLogo", () => {
  const renderComponent = (props) => {
    const { container } = render(VoteLogo, props);
    return VoteLogoPo.under(new JestPageObjectElement(container));
  };

  it("should pass size to logo wrapper", async () => {
    for (const size of ["huge", "big", "medium", "small"]) {
      const po = renderComponent({ size });
      expect(await po.getSize()).toBe(size);
    }
  });

  it("should pass framed to logo wrapper", async () => {
    for (const framed of [true, false]) {
      const po = renderComponent({ framed });
      expect(await po.isFramed()).toBe(framed);
    }
  });
});
