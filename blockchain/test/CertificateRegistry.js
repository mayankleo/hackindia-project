const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateRegistry", function () {
  let CertificateRegistry, certificateRegistry, owner, issuer, recipient, randomUser;
  let certID;

  before(async function () {
    [owner, issuer, recipient, randomUser] = await ethers.getSigners();

    // Deploy the contract
    CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
    certificateRegistry = await CertificateRegistry.deploy();
    await certificateRegistry.waitForDeployment();
  });

  it("Should set deployer as contract owner and first authorized issuer", async function () {
    expect(await certificateRegistry.owner()).to.equal(owner.address);
    expect(await certificateRegistry.authorizedIssuers(owner.address)).to.be.true;
  });

  it("Should allow the owner to add an authorized issuer", async function () {
    await certificateRegistry.addIssuer(issuer.address);
    expect(await certificateRegistry.authorizedIssuers(issuer.address)).to.be.true;
  });

  it("Should allow an authorized issuer to issue a certificate", async function () {
    const issueDate = Math.floor(Date.now() / 1000);
    const expiryDate = issueDate + 31536000; // 1 year from issue date

    const tx = await certificateRegistry
      .connect(issuer)
      .issueCertificate(recipient.address, "Blockchain University", "Blockchain Development", issueDate, expiryDate);
    
    const receipt = await tx.wait();
    const event = receipt.logs.find((log) => log.fragment.name === "CertificateIssued");
    certID = event.args.certID;

    const cert = await certificateRegistry.certificates(certID);
    expect(cert.owner).to.equal(recipient.address);
    expect(cert.issuer).to.equal("Blockchain University");
    expect(cert.courseName).to.equal("Blockchain Development");
    expect(cert.isValid).to.be.true;
  });

  it("Should not allow unauthorized users to issue certificates", async function () {
    const issueDate = Math.floor(Date.now() / 1000);
    await expect(
      certificateRegistry
        .connect(randomUser)
        .issueCertificate(recipient.address, "Fake University", "Scam Course", issueDate, 0)
    ).to.be.revertedWith("Not an authorized issuer");
  });

  it("Should allow verification of a valid certificate", async function () {
    const cert = await certificateRegistry.verifyCertificate(certID);
    expect(cert[0]).to.equal(recipient.address);
    expect(cert[1]).to.equal("Blockchain University");
    expect(cert[2]).to.equal("Blockchain Development");
    expect(cert[5]).to.be.true; // isValid
  });

  it("Should allow authorized issuers to revoke a certificate", async function () {
    await certificateRegistry.connect(issuer).revokeCertificate(certID);
    const cert = await certificateRegistry.certificates(certID);
    expect(cert.isValid).to.be.false;
  });

  it("Should prevent unauthorized users from revoking certificates", async function () {
    await expect(
      certificateRegistry.connect(randomUser).revokeCertificate(certID)
    ).to.be.revertedWith("Not an authorized issuer");
  });

  it("Should allow owner to remove an issuer", async function () {
    await certificateRegistry.removeIssuer(issuer.address);
    expect(await certificateRegistry.authorizedIssuers(issuer.address)).to.be.false;
  });

  it("Should prevent removed issuers from issuing certificates", async function () {
    const issueDate = Math.floor(Date.now() / 1000);
    await expect(
      certificateRegistry
        .connect(issuer)
        .issueCertificate(recipient.address, "Blockchain University", "New Course", issueDate, 0)
    ).to.be.revertedWith("Not an authorized issuer");
  });
});
