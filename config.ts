import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { sepolia } from 'wagmi/chains'

const projectId =
    import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? 'YOUR_PROJECT_ID'

export const config = getDefaultConfig({
    appName: 'Entrega 1 UI',
    projectId,
    chains: [sepolia],
    transports: {
        [sepolia.id]: http(),
    },
})
