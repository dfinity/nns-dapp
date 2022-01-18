
describe('Test foo', () => {
    it('Bar', async () => {
        await browser.url('http://localhost:8086/v2/');

        await browser.$('h1').waitForExist();

        await browser["screenshot"]("landing-page");
    });
});

