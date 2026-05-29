import { useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import MultiSigABI from "../abi/MultiSigABI";
import { CONTRACT_ADDRESS, SEPOLIA_CHAIN_ID } from "../config";

export interface Proposal {
  id: number;
  to: string;
  value: ethers.BigNumber;
  data: string;
  proposer: string;
  approvalCount: number;
  executed: boolean;
  cancelled: boolean;
}

export interface MultisigState {
  account: string | null;
  isSigner: boolean;
  signers: string[];
  threshold: number;
  proposals: Proposal[];
  loading: boolean;
  txPending: boolean;
  error: string | null;
  contractAddress: string;
  isConnected: boolean;
  chainOk: boolean;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useMultisig() {
  const [state, setState] = useState<MultisigState>({
    account: null,
    isSigner: false,
    signers: [],
    threshold: 0,
    proposals: [],
    loading: false,
    txPending: false,
    error: null,
    contractAddress: CONTRACT_ADDRESS,
    isConnected: false,
    chainOk: false,
  });

  const contractRef = useRef<ethers.Contract | null>(null);
  const providerRef = useRef<ethers.providers.Web3Provider | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Helpers ────────────────────────────────────────────────────────

  const getContract = useCallback((signerOrProvider: any) => {
    return new ethers.Contract(CONTRACT_ADDRESS, MultiSigABI, signerOrProvider);
  }, []);

  const setError = (msg: string) =>
    setState((s) => ({ ...s, error: msg, txPending: false }));

  // ─── Load on-chain data ──────────────────────────────────────────────

  const loadContractData = useCallback(async (account: string) => {
    if (!providerRef.current) return;
    try {
      const contract = getContract(providerRef.current);
      contractRef.current = contract;

      const [signers, threshold, proposals, isSignerResult] = await Promise.all([
        contract.getSigners(),
        contract.threshold(),
        contract.getAllProposals(),
        contract.isSigner(account),
      ]);

      // Check which proposals the current account has approved
      const parsedProposals: Proposal[] = proposals.map((p: any) => ({
        id: p.id.toNumber(),
        to: p.to,
        value: p.value,
        data: p.data,
        proposer: p.proposer,
        approvalCount: p.approvalCount.toNumber(),
        executed: p.executed,
        cancelled: p.cancelled,
      }));

      setState((s) => ({
        ...s,
        signers,
        threshold: threshold.toNumber(),
        proposals: parsedProposals,
        isSigner: isSignerResult,
        loading: false,
        error: null,
      }));
    } catch (err: any) {
      console.error("Error loading contract data:", err);
    }
  }, [getContract]);

  // ─── Connect wallet ──────────────────────────────────────────────────

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask no encontrado. Por favor instala la extensión.");
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      providerRef.current = provider;

      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const account = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainOk = network.chainId === 11155111; // Sepolia

      setState((s) => ({
        ...s,
        account,
        isConnected: true,
        chainOk,
      }));

      if (!chainOk) {
        // Try switching to Sepolia
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
          setState((s) => ({ ...s, chainOk: true }));
        } catch {
          setError("Por favor cambia a la red Sepolia en MetaMask.");
          setState((s) => ({ ...s, loading: false }));
          return;
        }
      }

      await loadContractData(account);

      // Poll every 6 seconds
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => loadContractData(account), 6000);

    } catch (err: any) {
      setError(err.message || "Error al conectar wallet");
      setState((s) => ({ ...s, loading: false }));
    }
  }, [loadContractData]);

  // ─── Account/chain change listeners ─────────────────────────────────

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setState((s) => ({ ...s, account: null, isConnected: false }));
        if (pollRef.current) clearInterval(pollRef.current);
      } else {
        setState((s) => ({ ...s, account: accounts[0] }));
        loadContractData(accounts[0]);
      }
    };

    const handleChainChanged = () => window.location.reload();

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [loadContractData]);

  // ─── Contract write functions ────────────────────────────────────────

  const withTx = async <T>(fn: () => Promise<T>): Promise<T | null> => {
    setState((s) => ({ ...s, txPending: true, error: null }));
    try {
      const result = await fn();
      setState((s) => ({ ...s, txPending: false }));
      if (state.account) await loadContractData(state.account);
      return result;
    } catch (err: any) {
      const msg = err?.data?.message || err?.reason || err?.message || "Transacción fallida";
      setError(msg);
      return null;
    }
  };

  const getSigner = () => {
    if (!providerRef.current) throw new Error("No hay proveedor");
    return providerRef.current.getSigner();
  };

  const propose = async (to: string, valueEth: string, data: string): Promise<boolean> => {
    return !!(await withTx(async () => {
      const signer = getSigner();
      const contract = getContract(signer);
      const value = ethers.utils.parseEther(valueEth || "0");
      const calldata = data && data !== "0x" ? data : "0x";
      const tx = await contract.propose(to, value, calldata);
      await tx.wait();
      if (state.account) await loadContractData(state.account);
    }));
  };

  const approve = async (proposalId: number): Promise<boolean> => {
    return !!(await withTx(async () => {
      const signer = getSigner();
      const contract = getContract(signer);
      const tx = await contract.approve(proposalId);
      await tx.wait();
      if (state.account) await loadContractData(state.account);
    }));
  };

  const execute = async (proposalId: number): Promise<boolean> => {
    return !!(await withTx(async () => {
      const signer = getSigner();
      const contract = getContract(signer);
      const tx = await contract.execute(proposalId);
      await tx.wait();
      if (state.account) await loadContractData(state.account);
    }));
  };

  const cancel = async (proposalId: number): Promise<boolean> => {
    return !!(await withTx(async () => {
      const signer = getSigner();
      const contract = getContract(signer);
      const tx = await contract.cancel(proposalId);
      await tx.wait();
      if (state.account) await loadContractData(state.account);
    }));
  };

  const hasApproved = async (proposalId: number, account: string): Promise<boolean> => {
    if (!providerRef.current) return false;
    try {
      const contract = getContract(providerRef.current);
      return await contract.hasApproved(proposalId, account);
    } catch {
      return false;
    }
  };

  return { state, connect, propose, approve, execute, cancel, hasApproved };
}
