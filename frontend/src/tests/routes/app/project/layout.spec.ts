import { AppPath } from "$lib/constants/routes.constants";
import { pageStore } from "$lib/derived/page.derived";
import { referrerPathStore } from "$lib/stores/routes.store";
import { page } from "$mocks/$app/stores";
import ProjectLayout from "$routes/(app)/(nns)/project/+layout.svelte";
import { fireEvent, render } from "@testing-library/svelte";
import { get } from "svelte/store";

describe("Project layout", () => {
  describe("back button", () => {
    it("should navigate to Portfolio page if previous page was Portfolio page", async () => {
      page.mock({
        routeId: AppPath.Project,
      });
      referrerPathStore.pushPath(AppPath.Portfolio);

      const { queryByTestId } = render(ProjectLayout);

      expect(get(pageStore).path).toEqual(AppPath.Project);
      await fireEvent.click(queryByTestId("back"));

      expect(get(pageStore).path).toEqual(AppPath.Portfolio);
    });

    it("should navigate to Launchpad", async () => {
      page.mock({
        routeId: AppPath.Project,
      });
      const { queryByTestId } = render(ProjectLayout);

      expect(get(pageStore).path).toEqual(AppPath.Project);
      await fireEvent.click(queryByTestId("back"));

      expect(get(pageStore).path).toEqual(AppPath.Launchpad);
    });
  });
});
