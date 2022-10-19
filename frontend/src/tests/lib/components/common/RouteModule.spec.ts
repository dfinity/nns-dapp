/**
 * @jest-environment jsdom
 */

import RouteModule from "$lib/components/common/RouteModule.svelte";
import { AppPathLegacy } from "$lib/constants/routes.constants";
import { routeStore } from "$lib/stores/route.store";
import { render } from "@testing-library/svelte";
import en from "../../../mocks/i18n.mock";
import { mockRouteStoreSubscribe } from "../../../mocks/route.store.mock";

describe("RouteModule", () => {
  describe("Layout", () => {
    beforeAll(() =>
      jest
        .spyOn(routeStore, "subscribe")
        .mockImplementation(mockRouteStoreSubscribe(`/#/canisters`))
    );

    afterAll(() => jest.clearAllMocks());

    it("should render title", () => {
      const { getByText } = render(RouteModule, {
        props: { path: AppPathLegacy.Canisters },
      });

      expect(getByText(en.navigation.canisters)).toBeInTheDocument();
    });

    it("should render a spinner while loading", () => {
      const { getByTestId } = render(RouteModule, {
        props: { path: AppPathLegacy.Canisters },
      });

      expect(getByTestId("spinner")).toBeInTheDocument();
    });

    it("should not render the auth layout", () => {
      const { getByTestId } = render(RouteModule, {
        props: { path: AppPathLegacy.Canisters },
      });

      const call = () => getByTestId("auth-layout");
      expect(call).toThrow();
    });
  });
});
