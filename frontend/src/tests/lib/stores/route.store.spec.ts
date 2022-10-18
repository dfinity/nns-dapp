/**
 * @jest-environment jsdom
 */

// TODO(GIX-1071): delete
describe("route-store", () => {
  it("tmp", () => expect(true).toEqual(true));

  // it("should set referrer path", () => {
  //   routeStore.update({ path: AppPath.LegacyAccounts });
  //
  //   routeStore.navigate({ path: AppPath.Proposals });
  //
  //   let referrerPath = get(routeStore).referrerPath;
  //   expect(referrerPath).toEqual(AppPath.LegacyAccounts);
  //
  //   routeStore.replace({ path: AppPath.LegacyNeurons });
  //
  //   referrerPath = get(routeStore).referrerPath;
  //   expect(referrerPath).toEqual(AppPath.Proposals);
  // });
  //
  // describe("changeContext", () => {
  //   beforeEach(() => {
  //     // TODO: Create a path creator helper
  //     routeStore.update({ path: `${CONTEXT_PATH}/aaaaa-aa/neuron/12344` });
  //   });
  //
  //   it("should change context id correctly", () => {
  //     routeStore.update({ path: `${CONTEXT_PATH}/aaaaa-aa/neuron/12344` });
  //
  //     const newContext = "bbbbb-bb";
  //     routeStore.changeContext(newContext);
  //
  //     const state = get(routeStore);
  //     expect(isContextPath(state.path)).toBe(true);
  //     expect(getContextFromPath(state.path)).toBe(newContext);
  //     expect(
  //       isRoutePath({ paths: [AppPath.NeuronDetail], routePath: state.path })
  //     ).toBe(true);
  //   });
  //
  //   // it("should ignore if current path does not support context", () => {});
  // });
});
