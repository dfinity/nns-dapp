
describe('Test foo', () => {
    it('Bar', async () => {

        // TODO: source the values from somewhere
        await browser.url('http://localhost:8086/v2/');

        await browser.$('h1').waitForExist();

        await browser["screenshot"]("landing-page");
    });
});

