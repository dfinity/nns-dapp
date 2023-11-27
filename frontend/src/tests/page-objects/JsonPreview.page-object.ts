import { jsonRepresentationModeStore } from "$lib/derived/json-representation.derived";
import { jsonRepresentationStore } from "$lib/stores/json-representation.store";
import type { ButtonPo } from "$tests/page-objects/Button.page-object";
import { BasePageObject } from "$tests/page-objects/base.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { get } from "svelte/store";

export class JsonPreviewPo extends BasePageObject {
  static readonly TID = "json-preview-component";

  static under(element: PageObjectElement): JsonPreviewPo {
    return new JsonPreviewPo(element.byTestId(JsonPreviewPo.TID));
  }

  getTreeJson(): PageObjectElement {
    return this.root.byTestId("tree-json");
  }

  getRawJson(): PageObjectElement {
    return this.root.byTestId("raw-json");
  }

  getExpandButton(): ButtonPo {
    return this.getButton("expand-tree");
  }

  clickExpand(): Promise<void> {
    return this.getExpandButton().click();
  }

  async getTreeText(): Promise<string> {
    return (await this.getTreeJson().getText())?.trim();
  }

  async getExpandedTreeText(): Promise<string> {
    const mode = get(jsonRepresentationModeStore);
    // switch to raw mode to simplify data validation
    jsonRepresentationStore.setMode("tree");
    await runResolvedPromises();

    await this.clickExpand();

    const result = (await this.getTreeText())?.trim();

    // restore mode
    jsonRepresentationStore.setMode(mode);
    await runResolvedPromises();

    return result;
  }

  async getRawText(): Promise<string> {
    return (await this.getRawJson().getText())?.trim();
  }

  async getRawObject(): Promise<object> {
    const mode = get(jsonRepresentationModeStore);
    // switch to raw mode to simplify data validation
    jsonRepresentationStore.setMode("raw");
    await runResolvedPromises();

    try {
      const text = (await this.getRawText())?.trim();
      return JSON.parse(text);
    } catch (e) {
      console.error("Error parsing JSON: ", e);
    } finally {
      // restore mode
      jsonRepresentationStore.setMode(mode);
      await runResolvedPromises();
    }
  }
}
