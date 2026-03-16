import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import "./main.css";
import "@mantine/core/styles.css";
import { theme } from "./theme";
import { MantineProvider } from "@mantine/core";
import {
  //   MutationCache,
  //   QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
const router = createRouter({ routeTree });
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient({
  //   queryCache: new QueryCache({
  //     onError: handleApiError,
  //   }),
  //   mutationCache: new MutationCache({
  //     onError: handleApiError,
  //   }),
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        {/* <ColorModeProvider initialColorScheme="light"> */}
        <RouterProvider router={router} />
        {/* </ColorModeProvider> */}
      </QueryClientProvider>
    </MantineProvider>
  </StrictMode>,
);
