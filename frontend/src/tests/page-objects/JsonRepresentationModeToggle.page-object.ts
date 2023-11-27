import { TogglePo } from "$tests/page-objects/Toggle.page-object";
import type { PageObjectElement } from "$tests/types/page-object.types";

export class JsonRepresentationModeTogglePo extends TogglePo {
  static readonly TID = "json-representation-mode-toggle-component";

  static under(element: PageObjectElement): TogglePo {
    return new TogglePo(element.byTestId(JsonRepresentationModeTogglePo.TID));
  }
}
