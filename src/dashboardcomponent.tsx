import {
    useAccount,
    useBalance,
    useBlockNumber,
    useEnsName,
    useReadContract,
} from 'wagmi'
import { formatUnits, type Address } from 'viem'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

const TOKEN_1_ADDRESS: Address = ZERO_ADDRESS
const TOKEN_2_ADDRESS: Address = ZERO_ADDRESS

const erc20Abi = [
    {
        type: 'function',
        name: 'name',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'string' }],
    },
    {
        type: 'function',
        name: 'symbol',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'string' }],
    },
    {
        type: 'function',
        name: 'decimals',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'uint8' }],
    },
    {
        type: 'function',
        name: 'balanceOf',
        stateMutability: 'view',
        inputs: [{ name: 'account', type: 'address' }],
        outputs: [{ type: 'uint256' }],
    },
] as const

export default function DashboardComponent() {
    const { address, isConnected } = useAccount()
    const hasConnectedWallet = Boolean(address)
    const hasToken1Address = TOKEN_1_ADDRESS !== ZERO_ADDRESS
    const hasToken2Address = TOKEN_2_ADDRESS !== ZERO_ADDRESS

    const { data: ensName } = useEnsName({
        address,
    })

    const { data: ethBalance } = useBalance({
        address,
    })

    const { data: blockNumber } = useBlockNumber({
        watch: true,
    })

    const { data: token1Name } = useReadContract({
        address: TOKEN_1_ADDRESS,
        abi: erc20Abi,
        functionName: 'name',
        query: {
            enabled: hasToken1Address,
        },
    })

    const { data: token1Symbol } = useReadContract({
        address: TOKEN_1_ADDRESS,
        abi: erc20Abi,
        functionName: 'symbol',
        query: {
            enabled: hasToken1Address,
        },
    })

    const { data: token1Decimals } = useReadContract({
        address: TOKEN_1_ADDRESS,
        abi: erc20Abi,
        functionName: 'decimals',
        query: {
            enabled: hasToken1Address,
        },
    })

    const { data: token1Balance } = useReadContract({
        address: TOKEN_1_ADDRESS,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: hasConnectedWallet && hasToken1Address,
        },
    })

    const { data: token2Name } = useReadContract({
        address: TOKEN_2_ADDRESS,
        abi: erc20Abi,
        functionName: 'name',
        query: {
            enabled: hasToken2Address,
        },
    })

    const { data: token2Symbol } = useReadContract({
        address: TOKEN_2_ADDRESS,
        abi: erc20Abi,
        functionName: 'symbol',
        query: {
            enabled: hasToken2Address,
        },
    })

    const { data: token2Decimals } = useReadContract({
        address: TOKEN_2_ADDRESS,
        abi: erc20Abi,
        functionName: 'decimals',
        query: {
            enabled: hasToken2Address,
        },
    })

    const { data: token2Balance } = useReadContract({
        address: TOKEN_2_ADDRESS,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
        query: {
            enabled: hasConnectedWallet && hasToken2Address,
        },
    })

    if (!isConnected) {
        return null
    }

    const formattedToken1Balance =
        token1Balance !== undefined && token1Decimals !== undefined
            ? formatUnits(token1Balance, Number(token1Decimals))
            : 'Pendiente'

    const formattedToken2Balance =
        token2Balance !== undefined && token2Decimals !== undefined
            ? formatUnits(token2Balance, Number(token2Decimals))
            : 'Pendiente'

    return (
        <section>
            <h1>Dashboard</h1>

            <div>
                <h2>Panel de cuenta</h2>
                <p>Wallet: {ensName ?? address}</p>
                <p>Saldo ETH: {ethBalance?.formatted}</p>
                <p>Bloque actual: {blockNumber?.toString()}</p>
            </div>

            <div>
                <h2>Saldos de tokens</h2>

                <div>
                    <p>Nombre: {token1Name}</p>
                    <p>Símbolo: {token1Symbol}</p>
                    <p>Saldo: {formattedToken1Balance}</p>
                </div>

                <div>
                    <p>Nombre: {token2Name}</p>
                    <p>Símbolo: {token2Symbol}</p>
                    <p>Saldo: {formattedToken2Balance}</p>
                </div>
            </div>
        </section>
    )
}
