import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  useAccount,
  useBalance,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { useMutation } from "@tanstack/react-query";
import { formatEther, parseEther, toHex } from "viem";
import Spinner from "../components/Spinner";

export const Route = createFileRoute("/faucet")({
  component: FaucetComponent,
});

function FaucetComponent() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { data: balanceData, refetch } = useBalance({
    address: address,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!address || !walletClient || !publicClient) {
        throw new Error("Wallet not connected");
      }

      const currentBalance = await publicClient.getBalance({
        address,
      });
      const newBalance = currentBalance + parseEther("1");

      const res = await publicClient.request({
        // @ts-ignore (anvil_setBalance is not a standard RPC method)
        method: "anvil_setBalance",
        params: [address, toHex(newBalance)],
      });

      // Refetch the balance after updating it
      await refetch();

      return res;
    },
  });

  return (
    <div className="max-w-md mx-auto p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-2xl">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        Ethereum Faucet
      </h2>
      <button
        onClick={() => mutation.mutate()}
        className="w-full py-3 px-6 bg-white text-purple-600 font-semibold rounded-full hover:bg-opacity-90 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 shadow-lg"
      >
        {mutation.isPending ? (
          <div className="flex justify-center items-center">
            <Spinner className="size-4 text-purple-600" />
          </div>
        ) : (
          "Request 1 ETH"
        )}
      </button>
      {mutation.isSuccess && (
        <p className="mt-4 text-green-300 text-center">
          1 ETH has been added to your wallet!
        </p>
      )}
      {mutation.isError && (
        <p className="mt-4 text-red-300 text-center">
          Error: {mutation.error.message}
        </p>
      )}
      {balanceData && (
        <p className="mt-4 text-white text-center">
          Current Balance: {formatEther(balanceData.value)} ETH
        </p>
      )}
    </div>
  );
}
