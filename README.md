# Entrega 1 - UI

Aplicacion React + TypeScript que se conecta a una wallet Ethereum en Sepolia y muestra:
- Panel de cuenta (ENS o address abreviada, saldo ETH, bloque actual).
- Saldos de 2 tokens ERC-20 (nombre, simbolo y balance).

## Link al Repo

 - https://github.com/MartinAlonsoo/entrega_1_taller_2.git

 Importante ver que el codigo de esta entrega se encuentra en la rama "entrega_1", no en main

## Requisitos

- Node.js 18+
- npm

## Instalacion

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en la raiz con:

```env
VITE_WALLETCONNECT_PROJECT_ID=tu_project_id
```

Ejemplo usado al testear:

```env
VITE_WALLETCONNECT_PROJECT_ID=dc0506fa3f56be33830aa626e1e89207
```

## Ejecutar en desarrollo

```bash
npm run dev
```

## Verificar TypeScript

```bash
npx tsc --noEmit
```

## Build de produccion

```bash
npm run build
```

## Tokens usados en Sepolia

- USDC: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- LINK: `0x779877A7B0D9E8603169DdbD7836e478b4624789`

## Integrantes:

Martin Alonso (291799)
Juan Carriquiry (310190)