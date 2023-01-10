/**
 * @jest-environment jsdom
 */

import Summary from "$lib/components/summary/Summary.svelte";
import { snsProjectSelectedStore } from "$lib/derived/selected-project.derived";
import { render } from "@testing-library/svelte";
import { mockStoreSubscribe } from "../../../mocks/commont.mock";
import en from "../../../mocks/i18n.mock";
import { mockSnsFullProject } from "../../../mocks/sns-projects.mock";

describe("Summary", () => {
  it("should render a property size", () => {
    const { container } = render(Summary, { props: { size: "small" } });
    expect(container.querySelector(".small")).not.toBeNull();
  });

  it("should render a logo", () => {
    const { getByTestId } = render(Summary);
    expect(getByTestId("project-logo")).not.toBeNull();
  });

  it("should render a logo", () => {
    const { getByTestId } = render(Summary);
    expect(getByTestId("project-logo")).not.toBeNull();
  });

  it("should render internet computer if none", () => {
    const { container } = render(Summary, {
      props: { displayProjects: false },
    });
    expect(
      container?.querySelector("h1")?.textContent?.includes(en.core.ic)
    ).toBeTruthy();
  });

  describe("nns", () => {
    beforeAll(() =>
      jest
        .spyOn(snsProjectSelectedStore, "subscribe")
        .mockImplementation(mockStoreSubscribe(undefined))
    );

    afterAll(() => jest.clearAllMocks());

    it("should render internet computer", () => {
      const { container } = render(Summary);

      expect(
        container?.querySelector("h1")?.textContent?.includes(en.core.ic)
      ).toBeTruthy();
    });
  });

  describe("sns", () => {
    beforeAll(() =>
      jest
        .spyOn(snsProjectSelectedStore, "subscribe")
        .mockImplementation(mockStoreSubscribe(mockSnsFullProject))
    );

    afterAll(() => jest.clearAllMocks());

    it("should render project", () => {
      const { container } = render(Summary);
      expect(
        container
          ?.querySelector("h1")
          ?.textContent?.includes(mockSnsFullProject.summary.metadata.name)
      ).toBeTruthy();
    });
  });
});
