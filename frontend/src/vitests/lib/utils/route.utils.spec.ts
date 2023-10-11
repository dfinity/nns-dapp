import { replaceHistory } from "$lib/utils/route.utils";

describe("route-utils", () => {
  const baseUrl = "https://nns.internetcomputer.org/";

  it("should replace location", () => {
    const historyIndex = window.history.length - 1;
    replaceHistory(new URL(baseUrl));
    expect(window.location.href).toEqual(baseUrl);
    expect(window.history.length).toEqual(historyIndex + 1);
  });
});
