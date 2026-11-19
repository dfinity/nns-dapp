import Html from "$lib/gix/components/Html.svelte";
import { sanitize } from "$lib/gix/utils/html.utils";
import { render } from "@testing-library/svelte";

vi.mock("$lib/gix/utils/html.utils", () => ({
  sanitize: vi.fn().mockImplementation((text: string) => text),
}));

describe("Html", () => {
  beforeEach(vi.mocked(sanitize).mockClear);

  afterAll(vi.clearAllMocks);

  it("should render plane text", () => {
    const { getByText } = render(Html, {
      props: {
        text: "test",
      },
    });

    expect(getByText("test")).toBeInTheDocument();
  });

  it("should render HTML content", () => {
    const { container, getByText } = render(Html, {
      props: {
        text: "<a href='#'>test link</a>",
      },
    });

    expect(getByText("test link")).toBeInTheDocument();
    expect(container.querySelector("a")).toBeInTheDocument();
    expect(container.querySelector("a")?.getAttribute("href")).toEqual("#");
  });

  it("should call sanitize", () => {
    render(Html, {
      props: {
        text: "test",
      },
    });

    expect(sanitize).toHaveBeenCalledOnce();
  });
});
