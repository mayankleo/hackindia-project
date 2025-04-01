// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CertificateRegistry {
    struct Certificate {
        bytes32 certificateID;
        address issuerAddress;
        address recipientAddress;
        string recipientName;
        string issuer;
        string courseName;
        uint256 issueDate;
        uint256 expiryDate;
        bool isValid;
    }

    address public owner;
    mapping(bytes32 => Certificate) public certificates;
    mapping(address => bool) public authorizedIssuers;

    event CertificateIssued(
        bytes32 indexed certificateID,
        address indexed issuerAddress,
        address indexed recipientAddress,
        string recipientName,
        string issuer,
        string courseName,
        uint256 issueDate,
        uint256 expiryDate,
        bool isValid
    );
    event CertificateRevoked(bytes32 indexed certID);
    event IssuerAdded(address indexed issuer);
    event IssuerRemoved(address indexed issuer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    modifier onlyIssuer() {
        require(authorizedIssuers[msg.sender], "Not an authorized issuer");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedIssuers[msg.sender] = true;
    }

    function addIssuer(address issuer) public onlyOwner {
        authorizedIssuers[issuer] = true;
        emit IssuerAdded(issuer);
    }

    function removeIssuer(address issuer) public onlyOwner {
        authorizedIssuers[issuer] = false;
        emit IssuerRemoved(issuer);
    }

    function issueCertificate(
        address _recipientAddress,
        string memory _recipientName,
        string memory _issuer,
        string memory _courseName,
        uint256 _issueDate,
        uint256 _expiryDate
    ) public onlyIssuer {
        bytes32 certificateID = keccak256(
            abi.encodePacked(
                msg.sender,
                _recipientAddress,
                _recipientName,
                _issuer,
                _courseName,
                _issueDate,
                _expiryDate
            )
        );
        require(
            certificates[certificateID].issueDate == 0,
            "Certificate already exists"
        );

        certificates[certificateID] = Certificate(
            certificateID,
            msg.sender,
            _recipientAddress,
            _recipientName,
            _issuer,
            _courseName,
            _issueDate,
            _expiryDate,
            true
        );
        emit CertificateIssued(
            certificateID,
            msg.sender,
            _recipientAddress,
            _recipientName,
            _issuer,
            _courseName,
            _issueDate,
            _expiryDate,
            certificates[certificateID].isValid
        );
    }

    function verifyCertificate(
        bytes32 certificateID
    )
        public
        view
        returns (
            bytes32,
            address,
            address,
            string memory,
            string memory,
            string memory,
            uint256,
            uint256,
            bool
        )
    {
        Certificate memory cert = certificates[certificateID];
        require(cert.issueDate != 0, "Certificate does not exist");
        require(
            cert.expiryDate == 0 || block.timestamp <= cert.expiryDate,
            "Certificate has expired"
        );
        require(cert.isValid, "Certificate is revoked");
        return (
            cert.certificateID,
            cert.issuerAddress,
            cert.recipientAddress,
            cert.recipientName,
            cert.issuer,
            cert.courseName,
            cert.issueDate,
            cert.expiryDate,
            cert.isValid
        );
    }

    function revokeCertificate(bytes32 certificateID) public onlyIssuer {
        require(
            certificates[certificateID].isValid,
            "Certificate is already revoked or does not exist"
        );
        require(
            certificates[certificateID].issuerAddress == msg.sender,
            "Only the issuer can revoke this certificate"
        );
        certificates[certificateID].isValid = false;

        emit CertificateRevoked(certificateID);
    }

    function isCertificateOwner(
        bytes32 certificateID
    ) public view returns (bool) {
        require(
            certificates[certificateID].issueDate != 0,
            "Certificate does not exist"
        );
        return certificates[certificateID].recipientAddress == msg.sender;
    }
}
