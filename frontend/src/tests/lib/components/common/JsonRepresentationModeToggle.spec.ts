import JsonRepresentationModeToggle from "$lib/components/proposal-detail/JsonRepresentationModeToggle.svelte";
import { jsonRepresentationModeStore } from "$lib/derived/json-representation.derived";
import { jsonRepresentationStore } from "$lib/stores/json-representation.store";
import { JsonRepresentationModeTogglePo } from "$tests/page-objects/JsonRepresentationModeToggle.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("JsonRepresentationModeToggle", () => {
  const renderComponent = (): JsonRepresentationModeTogglePo => {
    const { container } = render(JsonRepresentationModeToggle);
    return JsonRepresentationModeTogglePo.under(
      new JestPageObjectElement(container)
    );
  };

  it("should update the store", async () => {
    jsonRepresentationStore.setMode("tree");
    const po = renderComponent();
    expect(await po.isPresent()).toBe(true);

    await po.toggle();
    expect(get(jsonRepresentationModeStore)).toBe("raw");

    await po.toggle();
    expect(get(jsonRepresentationModeStore)).toBe("tree");
  });
});
