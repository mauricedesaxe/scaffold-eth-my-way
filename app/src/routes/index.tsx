import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useReadContract, useWriteContract } from "wagmi";
import CounterABI from "../contracts/Counter.abi.json";
import deployments from "../contracts/deployments.json";
import Spinner from "../components/Spinner";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="p-2">
      <Counter />
    </div>
  );
}

function Counter() {
  const {
    data: number,
    isError,
    isLoading,
  } = useReadContract({
    address: deployments.Counter as `0x${string}`,
    abi: CounterABI,
    functionName: "number",
  });

  const { writeContract: increment } = useWriteContract();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-6">
        <Spinner className="size-10 text-blue-400" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex justify-center items-center py-6">
        <p className="text-red-500">Error fetching counter value</p>
      </div>
    );
  }

  return (
    <div>
      <p>Counter: {number?.toString()}</p>
      <button
        onClick={() =>
          increment({
            address: deployments.Counter as `0x${string}`,
            abi: CounterABI,
            functionName: "increment",
          })
        }
      >
        Increment
      </button>
    </div>
  );
}
