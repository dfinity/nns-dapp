export const onIntersection = (element: HTMLElement) => {
    // IntersectionObserverInit is not recognized by the linter
    // eslint-disable-next-line no-undef
    const options: IntersectionObserverInit = {
        threshold: 0.5,
    };

    const intersectionCallback = (
        entries: IntersectionObserverEntry[]
    ) => {
        const intersecting: boolean = entries.find(
            ({ isIntersecting }: IntersectionObserverEntry) => isIntersecting
        ) !== undefined;

        const $event = new CustomEvent("nnsIntersecting", {detail: {intersecting}, bubbles: false});
        element.dispatchEvent($event);
    }

    const observer: IntersectionObserver = new IntersectionObserver(
        intersectionCallback,
        options
    );

    observer.observe(element);

    return {
        destroy() {
            observer.disconnect();
        }
    }
}