# Entrega 2: Contrato MultiSig

**Taller 2 - Universidad ORT Uruguay**

[Link al repositorio GitHub](https://github.com/MartinAlonsoo/Entregas_Taller_de_tecnologias_2)

Implementación full-stack de un contrato de firma múltiple (multisig programático) en Solidity, con una interfaz React para operar el contrato en Sepolia.

## Descripción

Este proyecto implementa un **multisig programático**: el contrato almacena una lista fija de `signers` autorizados y requiere que al menos `threshold` de ellos aprueben una propuesta antes de que pueda ejecutarse.

**Decisión de diseño:** el conjunto de signers es fijo en el despliegue. Para esta entrega se trabaja con 2 signers y `threshold = 2`.

## Estructura del proyecto

```text
entrega_1_taller_2/
├── contracts/
│   └── MultiSig.sol              # Contrato principal
├── scripts/
│   └── deploy.js                 # Script de despliegue
├── test/
│   └── MultiSig.test.js          # Suite de tests
├── frontend/
│   ├── src/
│   │   ├── abi/MultiSigABI.ts    # ABI del contrato
│   │   ├── components/           # Componentes React
│   │   ├── hooks/useMultisig.ts  # Hook principal Web3
│   │   ├── config.ts             # Lee VITE_CONTRACT_ADDRESS
│   │   ├── App.tsx
│   │   └── index.css
│   └── package.json
├── .env.example                  # Configuración de deploy y frontend
├── hardhat.config.js
├── package.json
└── README.md
```

## Requisitos

- Node.js (version >= 14) para instalar dependencias, compilar y correr el frontend.
- MetaMask instalado en el navegador.
- Una cuenta con ETH de Sepolia para desplegar y pagar gas.
- Dos cuentas/wallets que se usarán como `signers`.

Si no tenés ETH de Sepolia, se puede usar un faucet. Para esta entrega usamos [Sepolia PoW](https://sepolia-faucet.pk910.de/#/).

## Flujo de instalación, deploy y ejecución

### 1. Instalar dependencias y compilar el contrato

Desde la raíz del proyecto:

```bash
npm install
npm run compile
```

### 2. Correr los tests

```bash
npm test
```

La suite cubre proponer, aprobar, ejecutar, cancelar, rechazo de aprobaciones duplicadas y rechazo de operaciones de non-signers.

### 3. Crear el `.env` del proyecto

El archivo `.env` de la raíz contiene la configuración del deploy y la dirección pública que usa el frontend. No se versiona en Git.

En Linux/macOS o Git Bash:

```bash
cp .env.example .env
```

En Windows CMD:

```cmd
copy .env.example .env
```

En PowerShell:

```powershell
Copy-Item .env.example .env
```

Después, editar `.env` y completar estos valores:

```env
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

PRIVATE_KEY=private_key_Signer1_sin_0x
PRIVATE_KEY_2=private_key_Signer2_sin_0x

SIGNERS=AddressSigner1,AddressSigner2

THRESHOLD=2

VITE_CONTRACT_ADDRESS=0xDireccionDelContratoDesplegado
```

Notas:

- `PRIVATE_KEY` es la cuenta que usa Hardhat para desplegar.
- `PRIVATE_KEY_2` queda como referencia del segundo signer, pero la interacción real del frontend se hace desde MetaMask.
- `SIGNERS` debe contener las direcciones públicas de las wallets autorizadas, separadas por coma.
- `THRESHOLD=2` significa que se necesitan 2 aprobaciones para ejecutar una propuesta.
- Las private keys van sin el prefijo `0x`.
- `VITE_CONTRACT_ADDRESS` queda pendiente hasta después del deploy. Al principio puede dejarse como placeholder.
- Las variables con prefijo `VITE_` son públicas en el navegador. No poner private keys ni secretos en variables `VITE_`.

### 4. Desplegar en Sepolia

Desde la raíz del proyecto:

```bash
npm run deploy:sepolia
```

El deploy consume gas en Sepolia. Al finalizar, la consola imprime una dirección similar a:

```text
MultiSig desplegado en: 0x...
```

Guardá esa dirección: es la dirección pública del contrato desplegado y se usa para configurar el frontend.

Para ejecutar propuestas que envían más de `0 ETH`, el contrato debe tener fondos. Podés enviar ETH de Sepolia a la dirección del contrato desde MetaMask.

### 5. Configurar la dirección del contrato para el frontend

Editar el `.env` de la raíz y reemplazar `VITE_CONTRACT_ADDRESS` con la dirección que imprimió el deploy:

```env
VITE_CONTRACT_ADDRESS=0xDireccionDelContratoDesplegado
```

El frontend lee esta variable desde el `.env` de la raíz. No hace falta tocar `frontend/src/config.ts`.

### 6. Ejecutar el frontend localmente

Desde `frontend/`:

```bash
npm install
npm run dev
```

Abrir en el navegador la URL local que imprime Vite, lo devuelve la consola al hacer el "npm run dev"

Conectar MetaMask con una wallet incluida en `SIGNERS` y asegurarse de estar en la red **Sepolia**.

## Uso básico de la app

1. Conectar MetaMask con una wallet signer.
2. Crear una propuesta indicando destino, valor en ETH y calldata opcional.
3. Aprobar la propuesta con el primer signer.
4. Cambiar a la segunda wallet signer en MetaMask.
5. Aprobar la misma propuesta con el segundo signer.
6. Ejecutar la propuesta cuando llegue a `2 / 2` aprobaciones.
7. Verificar la transacción en Sepolia Etherscan usando la dirección del contrato desplegado.

## Datos del despliegue

Cada usuario genera su propia dirección al correr `npm run deploy:sepolia`.

| Campo | Valor |
|-------|-------|
| Dirección del contrato | La dirección impresa por el deploy |
| Red | Sepolia Testnet (Chain ID: 11155111) |
| Threshold | 2 de 2 |
| Etherscan | `https://sepolia.etherscan.io/address/<direccion_del_contrato>` |

## Wallets para interactuar

Las wallets habilitadas son las direcciones configuradas en `SIGNERS` dentro del `.env` de la raíz. Esas mismas cuentas deben usarse en MetaMask para aprobar y ejecutar propuestas desde el frontend.

## Integrantes

- Juan Carriquiry (310190) y Martín Alonso (291799)
