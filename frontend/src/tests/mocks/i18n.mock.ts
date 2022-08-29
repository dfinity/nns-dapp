// @ts-ignore - workaround error "Consider using '--resolveJsonModule' to import module with '.json' extension." displayed in Webstorm and VS Code when the project is opened form root
import * as enCore from "../../lib/i18n/en.json";
// @ts-ignore - workaround error "Consider using '--resolveJsonModule' to import module with '.json' extension." displayed in Webstorm and VS Code when the project is opened form root
import * as enGovernance from "../../lib/i18n/en.governance.json";

const en = {
    ...enCore,
    ...enGovernance
};

export default en;
