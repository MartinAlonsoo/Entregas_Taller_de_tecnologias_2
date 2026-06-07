require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  console.log("Desplegando contrato MultiSig en Sepolia...\n");

  const signerEnv = process.env.SIGNERS;
  const thresholdEnv = process.env.THRESHOLD;

  if (!signerEnv || !thresholdEnv) {
    throw new Error(
      "Debes definir SIGNERS y THRESHOLD en tu archivo .env\n" +
      "Ejemplo: SIGNERS=0xAddr1,0xAddr2,0xAddr3  THRESHOLD=2"
    );
  }

  const signerAddresses = signerEnv.split(",").map((s) => s.trim());
  const threshold = parseInt(thresholdEnv);

  console.log("Configuración:");
  console.log(`   Signers (${signerAddresses.length}):`, signerAddresses);
  console.log(`   Threshold: ${threshold}\n`);

  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();
  console.log(`Deployer: ${deployer.address}`);
  console.log(`   Balance: ${ethers.utils.formatEther(balance)} ETH\n`);

  const MultiSig = await ethers.getContractFactory("MultiSig");
  const multisig = await MultiSig.deploy(signerAddresses, threshold);
  await multisig.deployed();

  console.log(`MultiSig desplegado en: ${multisig.address}`);
  console.log(`\n Verificar en Etherscan:`);
  console.log(`   https://sepolia.etherscan.io/address/${multisig.address}`);
  console.log(`\n Agrega esta dirección en el .env de la raíz:`);
  console.log(`   VITE_CONTRACT_ADDRESS=${multisig.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error en despliegue:", error);
    process.exit(1);
  });
