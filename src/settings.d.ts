
import { type Theme } from "@/hooks/use-theme";

declare module "@/hooks/use-theme" {
  export type Theme = "light" | "dark" | "system";
}
