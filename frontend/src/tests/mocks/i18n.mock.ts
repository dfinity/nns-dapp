// @ts-ignore - workaround error "Consider using '--resolveJsonModule' to import module with '.json' extension." displayed in Webstorm and VS Code when the project is opened form root
// @ts-ignore - workaround error "Consider using '--resolveJsonModule' to import module with '.json' extension." displayed in Webstorm and VS Code when the project is opened form root
import * as enGovernance from "../../lib/i18n/en.governance.json";
import * as enCore from "../../lib/i18n/en.json";

const en = {
  ...enCore,
  ...enGovernance,
};

export default en;
