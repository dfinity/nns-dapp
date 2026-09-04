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

  it("should render fields with undefined in raw view", async () => {
    jsonRepresentationStore.setMode("raw");
    const po = renderComponent({ test: undefined });
    expect(await po.getRawText()).toBe(`{\n  "test": undefined\n}`);
  });

  it("should not render expand button when there is no children", async () => {
    jsonRepresentationStore.setMode("tree");
    const po = renderComponent({ hello: "world" });
    expect(await po.getExpandButton().isPresent()).toBe(false);
  });

  // The shape of a real ExecuteNnsFunction payload: the outer structure nests a
  // few levels and one string leaf holds a JSON install argument.
  it("should still expand the string leaves of a real payload shape", async () => {
    jsonRepresentationStore.setMode("tree");
    const po = renderComponent({
      canister_id: "qoctq-giaaa-aaaaa-aaaea-cai",
      arg: '{"controllers":["aaaaa-aa"]}',
      wasm_module_hash: "0f0d0e",
    });
    await po.clickExpand();

    expect(await po.getTreeText()).toBe(
      'canister_id "qoctq-giaaa-aaaaa-aaaea-cai" arg  controllers 0 "aaaaa-aa"wasm_module_hash "0f0d0e"'
    );
  });

  it("should render a payload text that nests JSON thousands of levels deep", async () => {
    jsonRepresentationStore.setMode("tree");
    const deepText = `${"[".repeat(35_000)}${"]".repeat(35_000)}`;
    const po = renderComponent({ comment: deepText });

    expect(await po.getTreeText()).toBe(`comment "${deepText}"`);
    // The text stays a string, so the tree has a single level.
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
