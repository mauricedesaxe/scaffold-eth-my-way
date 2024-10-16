import * as React from "react";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <div className="p-2 flex justify-between gap-2 text-lg mx-auto max-w-screen-xl">
        <div className="flex gap-4">
          <Link
            to="/"
            activeProps={{
              className: "font-bold",
            }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>
        </div>
        <div className="flex justify-end gap-4">
          <w3m-button balance="hide" />
        </div>
      </div>
      <hr />
      <div className="max-w-screen-xl mx-auto py-4 rounded-xl bg-slate-100 dark:bg-slate-900 my-4 px-4 border border-dashed border-slate-300 text-slate-800 dark:text-slate-200">
        <Outlet />
      </div>
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
