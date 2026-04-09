import type { ReactNode } from "react";
import { AllItemsStateProvider } from "./state/AllItemsStateProvider";
import { ListingsStateProvider } from "./state/ListingsStateProvider";

export default function ListingsLayout({ children }: { children: ReactNode }) {
  return (
    <ListingsStateProvider>
      <AllItemsStateProvider>{children}</AllItemsStateProvider>
    </ListingsStateProvider>
  );
}