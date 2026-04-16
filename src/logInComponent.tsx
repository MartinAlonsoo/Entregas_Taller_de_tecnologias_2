import { useState } from 'react'

type MyButtonProps = {
    onClick: () => void
}

type MyLogInProps = {
    // Definimos que el padre espera recibir un bool luego de que este componente llame a la libreria que se encargue de esto
    onLogin: (isLoggedIn: boolean, wallet: string) => void
}

export default function MyLogInComponent({ onLogin }: MyLogInProps) {
    // 1. Estado para capturar lo que se escribe (cada vez que escriba esto se actualiza, es dinamico)
    const [walletAddress, setWalletAddress] = useState("")

    function handleClick() {
        let retorno = true; // aqui llamariamos a la funcion que pase el walletAdress a la libreria y procese devolviendo si esta bien o no
        // 2. Al hacer click, le pasamos al "coso" (padre) el valor del input
        onLogin(retorno, walletAddress)
    }

    return (
        <div>
            <h1>Introduzca billetera y luego dele a log in</h1>
            <input
                type="text"
                placeholder="Tu wallet aquí..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
            />
            <MyButton onClick={handleClick} />
        </div>
    )
}

function MyButton({ onClick }: MyButtonProps) {
    return <button onClick={onClick}>Logueando</button>
}