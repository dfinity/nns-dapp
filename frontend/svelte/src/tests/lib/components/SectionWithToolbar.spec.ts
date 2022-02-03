/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import SectionWithToolbar from "../../../lib/components/SectionWithToolbar.svelte";

describe("SectionWithToolbar", () => {
  it("should not render a toolbar if no buttons provided", () => {
    const { container } = render(SectionWithToolbar);
    expect(container.querySelectorAll('[role="toolbar"]').length).toEqual(0);
  });
});
