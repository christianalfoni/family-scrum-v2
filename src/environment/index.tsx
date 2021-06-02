import { createContext, useContext } from "react";
import { Authentication } from "./authentication";
import { PreventScreenSleep } from "./preventScreenSleep";
import { Storage } from "./storage";
import { Version } from "./version";

export interface Environment {
  authentication: Authentication;
  storage: Storage;
  preventScreenSleep: PreventScreenSleep;
  version: Version;
}

const context = createContext({} as Environment);

export const useEnvironment = () => useContext(context);

export const EnvironmentProvider = ({
  children,
  environment,
}: {
  children: React.ReactNode;
  environment: Partial<Environment>;
}) => (
  <context.Provider value={environment as Environment}>
    {children}
  </context.Provider>
);
