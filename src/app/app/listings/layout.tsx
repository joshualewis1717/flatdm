import type { ReactNode } from "react";
import { ListingsStateProvider } from "./state/ListingsStateProvider";

export default function ListingsLayout({ children }: { children: ReactNode }) {
  return <ListingsStateProvider>{children}</ListingsStateProvider>;
}