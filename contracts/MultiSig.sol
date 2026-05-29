// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @title MultiSig
 * @notice Contrato de firma múltiple programático.
 * @dev Los signers se definen en el despliegue (fijos). Para ejecutar una
 *      transacción se requiere que al menos `threshold` signers la aprueben.
 */
contract MultiSig {
    // ─────────────────────────────── Tipos ────────────────────────────────

    struct Proposal {
        uint256 id;
        address to;
        uint256 value;
        bytes data;
        address proposer;
        uint256 approvalCount;
        bool executed;
        bool cancelled;
    }

    // ─────────────────────────────── Estado ───────────────────────────────

    address[] public signers;
    uint256 public threshold;
    uint256 public proposalCount;

    mapping(address => bool) public isSigner;
    mapping(uint256 => Proposal) public proposals;
    /// @dev proposalId => signer => ¿aprobó?
    mapping(uint256 => mapping(address => bool)) public hasApproved;

    // ─────────────────────────────── Eventos ──────────────────────────────

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        address to,
        uint256 value,
        bytes data
    );

    event ProposalApproved(
        uint256 indexed proposalId,
        address indexed signer,
        uint256 approvalCount
    );

    event ProposalExecuted(
        uint256 indexed proposalId,
        address indexed executor
    );

    event ProposalCancelled(
        uint256 indexed proposalId,
        address indexed proposer
    );

    // ─────────────────────────────── Modificadores ────────────────────────

    modifier onlySigner() {
        require(isSigner[msg.sender], "MultiSig: no eres signer");
        _;
    }

    modifier proposalExists(uint256 proposalId) {
        require(proposalId < proposalCount, "MultiSig: propuesta no existe");
        _;
    }

    modifier notExecuted(uint256 proposalId) {
        require(!proposals[proposalId].executed, "MultiSig: ya ejecutada");
        _;
    }

    modifier notCancelled(uint256 proposalId) {
        require(!proposals[proposalId].cancelled, "MultiSig: cancelada");
        _;
    }

    // ─────────────────────────────── Constructor ──────────────────────────

    /**
     * @param _signers Lista de direcciones autorizadas.
     * @param _threshold Cantidad mínima de aprobaciones para ejecutar.
     */
    constructor(address[] memory _signers, uint256 _threshold) {
        require(_signers.length > 0, "MultiSig: se necesita al menos un signer");
        require(
            _threshold > 0 && _threshold <= _signers.length,
            "MultiSig: threshold invalido"
        );

        for (uint256 i = 0; i < _signers.length; i++) {
            address s = _signers[i];
            require(s != address(0), "MultiSig: signer invalido");
            require(!isSigner[s], "MultiSig: signer duplicado");
            isSigner[s] = true;
            signers.push(s);
        }

        threshold = _threshold;
    }

    // ─────────────────────────────── Funciones principales ────────────────

    /**
     * @notice Propone una nueva transacción.
     * @param to Dirección destino.
     * @param value Valor en wei a enviar.
     * @param data Calldata opcional (0x para ETH puro).
     * @return proposalId ID de la propuesta creada.
     */
    function propose(
        address to,
        uint256 value,
        bytes calldata data
    ) external onlySigner returns (uint256 proposalId) {
        require(to != address(0), "MultiSig: destino invalido");

        proposalId = proposalCount;
        proposalCount++;

        proposals[proposalId] = Proposal({
            id: proposalId,
            to: to,
            value: value,
            data: data,
            proposer: msg.sender,
            approvalCount: 0,
            executed: false,
            cancelled: false
        });

        emit ProposalCreated(proposalId, msg.sender, to, value, data);
    }

    /**
     * @notice Aprueba una propuesta pendiente.
     * @param proposalId ID de la propuesta.
     */
    function approve(uint256 proposalId)
        external
        onlySigner
        proposalExists(proposalId)
        notExecuted(proposalId)
        notCancelled(proposalId)
    {
        require(
            !hasApproved[proposalId][msg.sender],
            "MultiSig: ya aprobaste esta propuesta"
        );

        hasApproved[proposalId][msg.sender] = true;
        proposals[proposalId].approvalCount++;

        emit ProposalApproved(
            proposalId,
            msg.sender,
            proposals[proposalId].approvalCount
        );
    }

    /**
     * @notice Ejecuta una propuesta que alcanzó el threshold.
     * @param proposalId ID de la propuesta.
     */
    function execute(uint256 proposalId)
        external
        onlySigner
        proposalExists(proposalId)
        notExecuted(proposalId)
        notCancelled(proposalId)
    {
        Proposal storage proposal = proposals[proposalId];
        require(
            proposal.approvalCount >= threshold,
            "MultiSig: aprobaciones insuficientes"
        );

        proposal.executed = true;

        (bool success, ) = proposal.to.call{value: proposal.value}(
            proposal.data
        );
        require(success, "MultiSig: transaccion fallida");

        emit ProposalExecuted(proposalId, msg.sender);
    }

    /**
     * @notice Cancela una propuesta. Solo puede hacerlo el proponente original.
     * @param proposalId ID de la propuesta.
     */
    function cancel(uint256 proposalId)
        external
        proposalExists(proposalId)
        notExecuted(proposalId)
        notCancelled(proposalId)
    {
        Proposal storage proposal = proposals[proposalId];
        require(
            msg.sender == proposal.proposer,
            "MultiSig: solo el proponente puede cancelar"
        );

        proposal.cancelled = true;

        emit ProposalCancelled(proposalId, msg.sender);
    }

    // ─────────────────────────────── Vistas ───────────────────────────────

    /**
     * @notice Devuelve todos los signers del contrato.
     */
    function getSigners() external view returns (address[] memory) {
        return signers;
    }

    /**
     * @notice Devuelve los detalles de una propuesta.
     */
    function getProposal(uint256 proposalId)
        external
        view
        returns (Proposal memory)
    {
        require(proposalId < proposalCount, "MultiSig: propuesta no existe");
        return proposals[proposalId];
    }

    /**
     * @notice Devuelve todas las propuestas.
     */
    function getAllProposals() external view returns (Proposal[] memory) {
        Proposal[] memory all = new Proposal[](proposalCount);
        for (uint256 i = 0; i < proposalCount; i++) {
            all[i] = proposals[i];
        }
        return all;
    }

    // ─────────────────────────────── Recepción de ETH ─────────────────────

    receive() external payable {}

    fallback() external payable {}
}
