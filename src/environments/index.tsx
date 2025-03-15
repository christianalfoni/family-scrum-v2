import { createContext, useContext } from "react";
import { BrowserEnvironment } from "./Browser";

export type Environment = BrowserEnvironment;

const EnvContext = createContext(null as unknown as Environment);

export function useEnv() {
  return useContext(EnvContext);
}

export function EnvProvider({
  env,
  children,
}: {
  env: Environment;
  children: React.ReactNode;
}) {
  return <EnvContext value={env}>{children}</EnvContext>;
}
