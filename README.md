# Entrega 2: Contrato MultiSig

**Taller 2 — Universidad ORT Uruguay**

[Link al repositorio github](https://github.com/MartinAlonsoo/entrega_1_taller_2.git)

Implementación full-stack de un contrato de firma múltiple (multisig programático) en Solidity, con interfaz React interactuando con la red de pruebas Sepolia.

---

## Descripción

Para esta entrega se nos pidio implementar un **multisig** en solidity, en este caso es **pragmático**: el contrato almacena una lista fija de `signers` autorizados y requiere que al menos una cantidad de `threshold` de ellos aprueben una propuesta antes de que pueda ejecutarse.

> **Decisión de diseño**: El conjunto de signers es fijo en el despliegue. En este caso van a ser 2.
---

## Estructura del proyecto

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

##  Requisitos

- Node.js ≥ 12 para el contrato
- Node.js ≥ 14 para el frontend con Vite
- La extension de MetaMask instalado en el navegador
- En el caso de no tener Eth en tus wallets para pagar el gas, se puede usar faucets online nosotros usamos [Sepolia PoW](https://sepolia-faucet.pk910.de/#/)

---

##  Compilar el contrato

Desde la raíz del proyecto

```bash
npm install
npm run compile
```

---

##  Correr los tests

```bash
npm test
```

Suite de 25 tests que cubre: proponer, aprobar, ejecutar, cancelar, rechazo de duplicados y rechazo de non-signers.

---

## Desplegar en Sepolia

### 1. Configurar variables de entorno

Dentro de .env.example vamos a tener el siguiente formato

```env
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

PRIVATE_KEY=private_key_Signer1_sin_0x
PRIVATE_KEY_2=private_key_Signer2_sin_0x

SIGNERS=AddressSigner1,AddressSigner2

THRESHOLD=2

```
Donde las variables de private key van a ser las claves privadas de los signers , en signers va el address de nuestras wallets (o accounts) y threshold es la cantidad de aprobaciones necesitadas por signers para ejecutar la transacción.


### 2. Ejecutar el deploy

```bash
npm run deploy:sepolia
```
Esto usará gas, entonces gastará etherium al correrlo.

### 3. Actualizar la dirección en el frontend

Copiar la dirección que imprime se imprime al correr el script de deploy y pegarla en `frontend/src/config.ts`:

```typescript
export const CONTRACT_ADDRESS = "0x...dirección del contrato...";
```
Esta direccion aqui es en donde vive nuestro contrato en el blockchain. Para poder ejecutar transacciones que "mueven" más de 0 Eth, el contrato debe tener algún Eth.

---

## Ejecutar el frontend localmente

```bash
cd frontend
npm install
npm run dev
```

Abrir el navegador en el localhost que retorna en la consola.

Conectar MetaMask con una de las wallets signer listadas en tu .env y asegurarse de estar en la red **Sepolia**.

---

## Contrato desplegado en Sepolia

| Campo | Valor |
|-------|-------|
| **Dirección del contrato** | `El que retorna el deploy` |
| **Red** | Sepolia Testnet (Chain ID: 11155111) |
| **Threshold** | 2 de 2 |
| **Etherscan** | https://sepolia.etherscan.io/address/address_del_contrato |

---

## Wallets para interactuar

Eso queda al criterio de la persona (usar wallet propia, crear más de un account y de esos accounts asignar uno como signer)

---

## Flujo de prueba en Sepolia

1. Abrir localhost retornado al correr npm run dev, con el frontend corriendo
2. Conectar MetaMask con **Signer 1** en la red Sepolia
3. Crear una propuesta (dirección destino + valor ETH)
4. Aprobar la propuesta con **Signer 1**
5. Cambiar a **Signer 2** en MetaMask y aprobar la misma propuesta
6. Con cualquiera de los dos signers, ejecutar la propuesta (el botón se habilita al llegar a 2/2 aprobaciones)
7. Verificar la transacción en https://sepolia.etherscan.io/address/address_del_contrato

---

## Integrantes

- Juan Carriquiry (310190) y Martín Alonso (291799)