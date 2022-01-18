interface I18nNavigation {
  icp: string;
  neurons: string;
  voting: string;
  canisters: string;
}

interface I18nHeader {
  title: string;
  logout: string;
}

interface I18nAuth {
  ic: string;
  network: string;
  nervous: string;
  system: string;
  icp: string;
  and: string;
  governance: string;
  login: string;
  logo: string;
}

interface I18nAccounts {
  title: string;
}

interface I18nNeurons {
  title: string;
  text: string;
  principal_is: string;
}

interface I18n {
  lang: Languages;
  navigation: I18nNavigation;
  header: I18nHeader;
  auth: I18nAuth;
  accounts: I18nAccounts;
  neurons: I18nNeurons;
}
