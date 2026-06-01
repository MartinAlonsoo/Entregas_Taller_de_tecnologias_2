# 🛡️ Entrega 2: Contrato MultiSig

**Taller 2 — Universidad ORT Uruguay**

Implementación full-stack de un contrato de firma múltiple (multisig programático) en Solidity, con interfaz React interactuando con la red de pruebas Sepolia.

---

## Descripción

Este proyecto implementa un **multisig programático**: el contrato almacena una lista fija de `signers` autorizados y requiere que al menos `threshold` de ellos aprueben una propuesta antes de que pueda ejecutarse.

> **Decisión de diseño**: El conjunto de signers es **fijo en el despliegue**. Se eligió este enfoque por su simplicidad y menor superficie de ataque.

---

## 📁 Estructura del proyecto

```
entrega_1_taller_2/
├── contracts/
│   └── MultiSig.sol           # Contrato principal
├── scripts/
│   └── deploy.js              # Script de despliegue
├── test/
│   └── MultiSig.test.js       # Suite de tests (25 tests)
├── frontend/
│   ├── src/
│   │   ├── abi/MultiSigABI.ts # ABI del contrato
│   │   ├── components/        # Componentes React
│   │   ├── hooks/
│   │   │   └── useMultisig.ts # Hook principal Web3
│   │   ├── config.ts          # Dirección del contrato
│   │   ├── App.tsx
│   │   └── index.css
│   └── package.json
├── hardhat.config.js
├── package.json
└── .env.example
```

---

## ⚙️ Requisitos

- Node.js ≥ 12 (para el contrato)
- Node.js ≥ 14 (para el frontend con Vite)
- MetaMask instalado en el navegador
- ETH de testnet en Sepolia ([Google Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia))

---

## 🔨 Compilar el contrato

```bash
# Desde la raíz del proyecto
npm install
npm run compile
```

---

## 🧪 Correr los tests

```bash
npm test
```

Suite de 25 tests que cubre: proponer, aprobar, ejecutar, cancelar, rechazo de duplicados y rechazo de non-signers.

---

## 🚀 Desplegar en Sepolia

### 1. Configurar variables de entorno

Copiar `.env.example` como `.env` y completar:

```bash
copy .env.example .env
```

```env
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=tu_clave_privada_sin_0x
SIGNERS=0xDireccion1,0xDireccion2
THRESHOLD=2
```

### 2. Ejecutar el deploy

```bash
npm run deploy:sepolia
```

### 3. Actualizar la dirección en el frontend

Copiar la dirección que imprime el script y pegarla en `frontend/src/config.ts`:

```typescript
export const CONTRACT_ADDRESS = "0x...dirección del contrato...";
```

---

## 🌐 Ejecutar el frontend localmente

```bash
cd frontend
npm install
npm run dev
```

Abrir el navegador en **http://localhost:5173**.

Conectar MetaMask con una de las wallets signer listadas abajo y asegurarse de estar en la red **Sepolia**.

---

## 📋 Contrato desplegado en Sepolia

| Campo | Valor |
|-------|-------|
| **Dirección del contrato** | `0x543B6A85cc2f252D580f6d314110C75D11Ef3b2E` |
| **Red** | Sepolia Testnet (Chain ID: 11155111) |
| **Threshold** | 2 de 2 |
| **Etherscan** | [Ver contrato](https://sepolia.etherscan.io/address/0x543B6A85cc2f252D580f6d314110C75D11Ef3b2E) |

---

## 👛 Wallets para interactuar

Estas son las dos wallets autorizadas como signers del contrato. Ambas deben tener ETH de Sepolia para poder firmar transacciones.

| Signer | Dirección |
|--------|-----------|
| Signer 1 | `0xb9F8D0EDD8028F70555450Ff1dA12b843225820e` |
| Signer 2 | `0xB534FDc6Eb51C5Cb54dC6830A7040e64a0837EF1` |

---

## 🧪 Flujo de prueba en Sepolia

1. Abrir **http://localhost:5173** con el frontend corriendo
2. Conectar MetaMask con **Signer 1** en la red Sepolia
3. Crear una propuesta (dirección destino + valor ETH)
4. Aprobar la propuesta con **Signer 1**
5. Cambiar a **Signer 2** en MetaMask y aprobar la misma propuesta
6. Con cualquiera de los dos signers, ejecutar la propuesta (el botón se habilita al llegar a 2/2 aprobaciones)
7. Verificar la transacción en [Sepolia Etherscan](https://sepolia.etherscan.io/address/0x543B6A85cc2f252D580f6d314110C75D11Ef3b2E)

---

## 👥 Integrantes

- *(completar con nombres del grupo)*