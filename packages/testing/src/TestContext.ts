import {
  createExpressApplication,
  createHttpServer,
  createHttpsServer,
  IDIConfigurationOptions,
  PlatformTest,
  ServerLoader,
  TokenProvider
} from "@tsed/common";
import {Env, Type} from "@tsed/core";
import {InjectorService} from "@tsed/di";

export interface IInvokeOptions {
  token?: TokenProvider;
  /**
   * @deprecated
   */
  provide?: TokenProvider;
  use: any;
}

export class TestContext extends PlatformTest {
  /**
   * Load the server silently without listening port and configure it on test profile.
   * @decorator
   * @param mod
   * @param options
   * @returns {Promise<void>}
   */
  static bootstrap(mod: Type<ServerLoader>, options: Partial<IDIConfigurationOptions> = {}): () => Promise<void> {
    return async function before(): Promise<void> {
      const instance = await ServerLoader.bootstrap(mod, {
        logger: {
          level: "off"
        },
        ...options
      });

      await instance.callHook("$beforeListen");
      await instance.callHook("$afterListen");
      await instance.ready();

      // used by inject method
      PlatformTest._injector = instance.injector;
    };
  }

  static invoke<T = any>(target: TokenProvider, providers: IInvokeOptions[]): T | Promise<T> {
    providers = providers.map((p) => {
      return {
        token: p.token || p.provide,
        use: p.use
      };
    });

    return super.invoke(target, providers);
  }
}
