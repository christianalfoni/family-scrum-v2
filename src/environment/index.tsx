import { createContext, useContext } from "react";
import { Authentication } from "./authentication";
import { Storage } from "./storage";

export interface Environment {
  authentication: Authentication;
  storage: Storage;
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
