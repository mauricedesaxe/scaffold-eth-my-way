import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { mainnet, localhost } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

export const queryClient = new QueryClient();

const projectId = "f980d1e8ac5f60d237a134a726ee17cd";

const metadata = {
  name: "scaffold-eth-my-way",
  description: "AppKit Example",
  url: "https://reown.com/appkit", // origin must match your domain & subdomain
  icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, localhost],
  projectId,
  ssr: true,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, localhost],
  projectId,
  metadata,
  features: {
    analytics: true,
  },
});

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  Wrap: function WrapComponent({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiAdapter.wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    );
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<RouterProvider router={router} />);
}
