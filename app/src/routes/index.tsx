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

  const { writeContract } = useWriteContract();

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
    <>
      <div className="mx-auto py-8">
        <h1 className="text-4xl font-bold text-center">Counter</h1>
        <p className="mt-6 text-2xl text-center">
          The counter is one of those "hello world" type projects that you see
          all over the place. This one is a bit different though, because it's
          deployed on the blockchain.
        </p>
      </div>
      <div className="flex flex-col items-center space-y-4 p-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg shadow-lg">
        <p className="text-4xl font-bold text-white">{number?.toString()}</p>
        <button
          onClick={() =>
            writeContract({
              address: deployments.Counter as `0x${string}`,
              abi: CounterABI,
              functionName: "increment",
            })
          }
          className="px-6 py-2 bg-white text-purple-600 font-semibold rounded-full hover:bg-opacity-90 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
        >
          +1
        </button>
      </div>
    </>
  );
}
