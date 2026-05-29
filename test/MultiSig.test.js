const { expect } = require("chai");
const { ethers } = require("hardhat");

/**
 * Helper: espera que una promesa revierta con cierto mensaje.
 * Necesario porque sin @nomiclabs/hardhat-waffle no hay revertedWith en chai.
 */
async function expectRevert(promise, message) {
  try {
    await promise;
    throw new Error("Se esperaba un revert pero no ocurrió");
  } catch (err) {
    if (!err.message.includes(message)) {
      throw new Error(
        `Se esperaba revert con "${message}" pero se obtuvo: ${err.message}`
      );
    }
  }
}

describe("MultiSig", function () {
  let multisig;
  let owner, signer1, signer2, signer3, nonSigner;
  const THRESHOLD = 2;

  beforeEach(async function () {
    [owner, signer1, signer2, signer3, nonSigner] = await ethers.getSigners();

    const signerAddresses = [owner.address, signer1.address, signer2.address];
    const MultiSig = await ethers.getContractFactory("MultiSig");
    multisig = await MultiSig.deploy(signerAddresses, THRESHOLD);
    await multisig.deployed();

    // Fondear el contrato
    await owner.sendTransaction({
      to: multisig.address,
      value: ethers.utils.parseEther("1.0"),
    });
  });

  // ─────────────────────────── Despliegue ──────────────────────────────

  describe("Despliegue", function () {
    it("debe configurar correctamente los signers", async function () {
      const signers = await multisig.getSigners();
      expect(signers).to.have.lengthOf(3);
      expect(signers).to.include(owner.address);
      expect(signers).to.include(signer1.address);
      expect(signers).to.include(signer2.address);
    });

    it("debe configurar correctamente el threshold", async function () {
      const t = await multisig.threshold();
      expect(t.toNumber()).to.equal(THRESHOLD);
    });

    it("debe reconocer a los signers correctamente", async function () {
      expect(await multisig.isSigner(owner.address)).to.be.true;
      expect(await multisig.isSigner(nonSigner.address)).to.be.false;
    });

    it("debe revertir si threshold > número de signers", async function () {
      const MultiSig = await ethers.getContractFactory("MultiSig");
      await expectRevert(
        MultiSig.deploy([owner.address], 2),
        "MultiSig: threshold invalido"
      );
    });

    it("debe revertir si threshold es 0", async function () {
      const MultiSig = await ethers.getContractFactory("MultiSig");
      await expectRevert(
        MultiSig.deploy([owner.address], 0),
        "MultiSig: threshold invalido"
      );
    });

    it("debe revertir si se pasan signers duplicados", async function () {
      const MultiSig = await ethers.getContractFactory("MultiSig");
      await expectRevert(
        MultiSig.deploy([owner.address, owner.address], 1),
        "MultiSig: signer duplicado"
      );
    });
  });

  // ─────────────────────────── Proponer ────────────────────────────────

  describe("propose()", function () {
    it("un signer puede proponer una transacción", async function () {
      const tx = await multisig
        .connect(owner)
        .propose(signer3.address, ethers.utils.parseEther("0.1"), "0x");

      const receipt = await tx.wait();
      const event = receipt.events.find((e) => e.event === "ProposalCreated");
      expect(event).to.not.be.undefined;
      expect(event.args.proposer).to.equal(owner.address);

      const count = await multisig.proposalCount();
      expect(count.toNumber()).to.equal(1);
    });

    it("un non-signer no puede proponer", async function () {
      await expectRevert(
        multisig.connect(nonSigner).propose(signer3.address, 0, "0x"),
        "MultiSig: no eres signer"
      );
    });

    it("no se puede proponer con dirección destino cero", async function () {
      await expectRevert(
        multisig.connect(owner).propose(ethers.constants.AddressZero, 0, "0x"),
        "MultiSig: destino invalido"
      );
    });

    it("debe incrementar el proposalCount por cada propuesta", async function () {
      await multisig.connect(owner).propose(signer3.address, 0, "0x");
      await multisig.connect(owner).propose(signer3.address, 0, "0x");
      const count = await multisig.proposalCount();
      expect(count.toNumber()).to.equal(2);
    });
  });

  // ─────────────────────────── Aprobar ─────────────────────────────────

  describe("approve()", function () {
    beforeEach(async function () {
      await multisig
        .connect(owner)
        .propose(signer3.address, ethers.utils.parseEther("0.1"), "0x");
    });

    it("un signer puede aprobar una propuesta", async function () {
      const tx = await multisig.connect(owner).approve(0);
      const receipt = await tx.wait();
      const event = receipt.events.find((e) => e.event === "ProposalApproved");
      expect(event.args.signer).to.equal(owner.address);

      const proposal = await multisig.getProposal(0);
      expect(proposal.approvalCount.toNumber()).to.equal(1);
    });

    it("un signer no puede aprobar dos veces la misma propuesta", async function () {
      await multisig.connect(owner).approve(0);
      await expectRevert(
        multisig.connect(owner).approve(0),
        "MultiSig: ya aprobaste esta propuesta"
      );
    });

    it("un non-signer no puede aprobar", async function () {
      await expectRevert(
        multisig.connect(nonSigner).approve(0),
        "MultiSig: no eres signer"
      );
    });

    it("no se puede aprobar una propuesta inexistente", async function () {
      await expectRevert(
        multisig.connect(owner).approve(99),
        "MultiSig: propuesta no existe"
      );
    });

    it("no se puede aprobar una propuesta cancelada", async function () {
      await multisig.connect(owner).cancel(0);
      await expectRevert(
        multisig.connect(owner).approve(0),
        "MultiSig: cancelada"
      );
    });
  });

  // ─────────────────────────── Ejecutar ────────────────────────────────

  describe("execute()", function () {
    beforeEach(async function () {
      await multisig
        .connect(owner)
        .propose(signer3.address, ethers.utils.parseEther("0.1"), "0x");
      await multisig.connect(owner).approve(0);
      await multisig.connect(signer1).approve(0);
    });

    it("se puede ejecutar cuando se alcanza el threshold", async function () {
      const balanceBefore = await ethers.provider.getBalance(signer3.address);
      const amount = ethers.utils.parseEther("0.1");

      const tx = await multisig.connect(owner).execute(0);
      const receipt = await tx.wait();
      const event = receipt.events.find((e) => e.event === "ProposalExecuted");
      expect(event.args.executor).to.equal(owner.address);

      const balanceAfter = await ethers.provider.getBalance(signer3.address);
      expect(balanceAfter.sub(balanceBefore).eq(amount)).to.be.true;

      const proposal = await multisig.getProposal(0);
      expect(proposal.executed).to.be.true;
    });

    it("no se puede ejecutar sin suficientes aprobaciones", async function () {
      await multisig.connect(owner).propose(signer3.address, 0, "0x");
      await expectRevert(
        multisig.connect(owner).execute(1),
        "MultiSig: aprobaciones insuficientes"
      );
    });

    it("no se puede ejecutar dos veces la misma propuesta", async function () {
      await multisig.connect(owner).execute(0);
      await expectRevert(
        multisig.connect(owner).execute(0),
        "MultiSig: ya ejecutada"
      );
    });

    it("un non-signer no puede ejecutar", async function () {
      await expectRevert(
        multisig.connect(nonSigner).execute(0),
        "MultiSig: no eres signer"
      );
    });
  });

  // ─────────────────────────── Cancelar ────────────────────────────────

  describe("cancel()", function () {
    beforeEach(async function () {
      await multisig
        .connect(owner)
        .propose(signer3.address, ethers.utils.parseEther("0.1"), "0x");
    });

    it("el proponente puede cancelar su propuesta", async function () {
      const tx = await multisig.connect(owner).cancel(0);
      const receipt = await tx.wait();
      const event = receipt.events.find((e) => e.event === "ProposalCancelled");
      expect(event.args.proposer).to.equal(owner.address);

      const proposal = await multisig.getProposal(0);
      expect(proposal.cancelled).to.be.true;
    });

    it("un no-proponente no puede cancelar", async function () {
      await expectRevert(
        multisig.connect(signer1).cancel(0),
        "MultiSig: solo el proponente puede cancelar"
      );
    });

    it("no se puede cancelar una propuesta ya ejecutada", async function () {
      await multisig.connect(owner).approve(0);
      await multisig.connect(signer1).approve(0);
      await multisig.connect(owner).execute(0);

      await expectRevert(
        multisig.connect(owner).cancel(0),
        "MultiSig: ya ejecutada"
      );
    });

    it("no se puede cancelar dos veces", async function () {
      await multisig.connect(owner).cancel(0);
      await expectRevert(
        multisig.connect(owner).cancel(0),
        "MultiSig: cancelada"
      );
    });
  });

  // ─────────────────────────── Flujo completo ──────────────────────────

  describe("Flujo completo", function () {
    it("proponer → aprobar (2) → ejecutar transfiere ETH correctamente", async function () {
      const recipient = signer3.address;
      const amount = ethers.utils.parseEther("0.05");

      const balBefore = await ethers.provider.getBalance(recipient);

      await multisig.connect(owner).propose(recipient, amount, "0x");
      await multisig.connect(owner).approve(0);
      await multisig.connect(signer1).approve(0);
      await multisig.connect(signer2).execute(0);

      const balAfter = await ethers.provider.getBalance(recipient);
      expect(balAfter.sub(balBefore).eq(amount)).to.be.true;
    });

    it("getAllProposals devuelve todas las propuestas", async function () {
      await multisig.connect(owner).propose(signer3.address, 0, "0x");
      await multisig.connect(owner).propose(signer3.address, 0, "0x");

      const all = await multisig.getAllProposals();
      expect(all).to.have.lengthOf(2);
    });
  });
});
