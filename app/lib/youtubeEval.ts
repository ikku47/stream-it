import { Platform } from "youtubei.js";

declare global {
  // eslint-disable-next-line no-var
  var __ytjsEvalInstalled: boolean | undefined;
}

if (!globalThis.__ytjsEvalInstalled) {
  Platform.shim.eval = async (data, env) => {
    const properties: string[] = [];

    if (env.n) {
      properties.push(`n: exportedVars.nFunction(${JSON.stringify(env.n)})`);
    }

    if (env.sig) {
      properties.push(`sig: exportedVars.sigFunction(${JSON.stringify(env.sig)})`);
    }

    const code = `${data.output}\nreturn { ${properties.join(", ")} };`;
    // eslint-disable-next-line no-new-func
    return new Function(code)();
  };

  globalThis.__ytjsEvalInstalled = true;
}
