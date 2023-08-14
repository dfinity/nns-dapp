// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - workaround error "Consider using '--resolveJsonModule' to import module with '.json' extension." displayed in Webstorm and VS Code when the project is opened form root
import * as enGovernance from "$lib/i18n/en.governance.json";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - workaround error "Consider using '--resolveJsonModule' to import module with '.json' extension." displayed in Webstorm and VS Code when the project is opened form root
import * as enCore from "$lib/i18n/en.json";

const en = {
  ...enCore,
  ...enGovernance,
} as I18n;

export default en;
