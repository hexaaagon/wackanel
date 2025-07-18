"use client";

import { StoreProvider } from "easy-peasy";
import { store } from "./index";
import { useEffect } from "react";

interface StoreProviderWrapperProps {
  children: React.ReactNode;
}

export function StoreProviderWrapper({ children }: StoreProviderWrapperProps) {
  useEffect(() => {
    store.getActions().auth.initializeAuth();
  }, []);

  return <StoreProvider store={store}>{children}</StoreProvider>;
}
