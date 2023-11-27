import JsonPreview from "$lib/components/common/JsonPreview.svelte";
import { jsonRepresentationStore } from "$lib/stores/json-representation.store";
import { JsonPreviewPo } from "$tests/page-objects/JsonPreview.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("JsonPreview", () => {
  const renderComponent = (json: unknown): JsonPreviewPo => {
    const { container } = render(JsonPreview, {
      props: { json },
    });
    return JsonPreviewPo.under(new JestPageObjectElement(container));
  };

  it("should render tree view when it is enabled in store", async () => {
    jsonRepresentationStore.setMode("tree");
    const po = renderComponent({});
    expect(await po.getTreeJson().isPresent()).toBe(true);
    expect(await po.getRawJson().isPresent()).toBe(false);
  });

  it("should render raw view when it is enabled in store", async () => {
    jsonRepresentationStore.setMode("raw");
    const po = renderComponent({});
    expect(await po.getTreeJson().isPresent()).toBe(false);
    expect(await po.getRawJson().isPresent()).toBe(true);
  });

  it("should render data in tree view", async () => {
    jsonRepresentationStore.setMode("tree");
    const po = renderComponent({ test: "hello world" });
    expect(await po.getTreeText()).toBe('test "hello world"');
  });

  it("should render data in raw view", async () => {
    jsonRepresentationStore.setMode("raw");
    const po = renderComponent({ test: "hello world" });
    expect(await po.getRawObject()).toEqual({
      test: "hello world",
    });
  });

  it("should render expand button in tree view", async () => {
    jsonRepresentationStore.setMode("tree");
    const po = renderComponent({ test: { hello: "world" } });
    expect(await po.getExpandButton().isPresent()).toBe(true);
  });

  it("should not render expand button in raw view", async () => {
    jsonRepresentationStore.setMode("raw");
    const po = renderComponent({ test: { hello: "world" } });
    expect(await po.getExpandButton().isPresent()).toBe(false);
  });

  it("should not render expand button when there is no children", async () => {
    jsonRepresentationStore.setMode("tree");
    const po = renderComponent({ hello: "world" });
    expect(await po.getExpandButton().isPresent()).toBe(false);
  });

  it("should expand and collapse in tree view", async () => {
    jsonRepresentationStore.setMode("tree");
    const po = renderComponent({ data: { test: "hello world" } });
    expect(await po.getTreeText()).toBe("data");
    // expand
    await po.clickExpand();
    expect(await po.getTreeText()).toBe('data test "hello world"');
    // collapse
    await po.clickExpand();
    expect(await po.getTreeText()).toBe("data");
  });
});
