class View {
  constructor(protected browser: any) {}
}

export class LoginView extends View {
  async waitForDisplay(): Promise<void> {
    await this.browser
      .$("button")
      .waitForDisplayed({ timeout: 10_000 });
  }
}
