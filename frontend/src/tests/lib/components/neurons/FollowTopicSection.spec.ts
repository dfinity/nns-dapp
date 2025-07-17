import FollowTopicsSectionTest from "$tests/lib/components/neurons/FollowTopicSectionTest.svelte";
import { render } from "$tests/utils/svelte.test-utils";
import { fireEvent } from "@testing-library/svelte";

describe("FollowTopicsSection", () => {
  const title = "title";
  const subtitle = "subtitle";

  it("renders data", () => {
    const { getByText } = render(FollowTopicsSectionTest, {
      props: {
        title,
        subtitle,
        id: "3",
        count: 4,
      },
    });
    expect(getByText(title)).toBeInTheDocument();
    expect(getByText(subtitle)).toBeInTheDocument();
  });

  it("renders children", () => {
    const { queryByTestId } = render(FollowTopicsSectionTest, {
      props: {
        title,
        subtitle,
        id: "3",
        count: 4,
      },
    });
    expect(queryByTestId("followee-children")).toBeInTheDocument();
  });

  it("triggers open event", async () => {
    const openSpy = vi.fn();

    const { queryByTestId } = render(FollowTopicsSectionTest, {
      props: {
        id: "3",
        count: 4,
        openNewFolloweeModal: openSpy,
      },
    });

    const button = queryByTestId("open-new-followee-modal");
    button && fireEvent.click(button);

    expect(openSpy).toBeCalled();
  });

  it("should not render currently following label ", () => {
    const { getByTestId } = render(FollowTopicsSectionTest, {
      props: {
        title,
        subtitle,
        id: "3",
        count: 0,
      },
    });
    expect(() => getByTestId("current-followees-label")).toThrow();
  });
});
