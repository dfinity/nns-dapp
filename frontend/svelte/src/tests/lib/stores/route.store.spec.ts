/**
 * @jest-environment jsdom
 */

import { get } from "svelte/store";
import { AppPath } from "../../../lib/constants/routes.constants";
import { routeStore } from "../../../lib/stores/route.store";

describe("route-store", () => {
  it("should set referrer path", () => {
    routeStore.update({ path: AppPath.Accounts });

    routeStore.navigate({ path: AppPath.Proposals });

    let referrerPath = get(routeStore).referrerPath;
    expect(referrerPath).toEqual(AppPath.Accounts);

    routeStore.replace({ path: AppPath.Neurons });

    referrerPath = get(routeStore).referrerPath;
    expect(referrerPath).toEqual(AppPath.Proposals);
  });
});
