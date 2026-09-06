import { RouterProvider } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProviders } from "./providers";
import { router } from "./router";

export default function App() {
  return (
    <AppProviders>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </AppProviders>
  );
}
