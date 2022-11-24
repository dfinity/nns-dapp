/**
 * @jest-environment jsdom
 */

import { snsProjectParametersStore } from "$lib/derived/sns/sns-project-parameters.derived";
import { snsParametersStore } from "$lib/stores/sns-parameters.store";
import { page } from "$mocks/$app/stores";
import { get } from "svelte/store";
import { mockPrincipal } from "../../../mocks/auth.store.mock";
import { snsNervousSystemParametersMock } from "../../../mocks/sns-neurons.mock";

describe("sns-project-parameters store", () => {
  beforeEach(() => {
    page.mock({ data: { universe: mockPrincipal.toText() } });
  });

  it("should return undefined if project is not set in the store", () => {
    snsParametersStore.reset();
    const value = get(snsProjectParametersStore);
    expect(value).toBeUndefined();
  });

  it("should return parameters of the selected project", () => {
    snsParametersStore.setParameters({
      rootCanisterId: mockPrincipal,
      parameters: snsNervousSystemParametersMock,
      certified: true,
    });
    const value = get(snsProjectParametersStore);
    expect(value).toEqual(
      expect.objectContaining({ parameters: snsNervousSystemParametersMock })
    );
  });
});
