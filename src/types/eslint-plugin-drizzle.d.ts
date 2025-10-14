declare module "eslint-plugin-drizzle" {
  import { Linter } from "eslint";

  declare namespace Configs {
    declare const recommended: Linter.Config;
  }

  declare namespace Plugin {
    declare const configs: Configs;
  }

  export = Plugin;
}
