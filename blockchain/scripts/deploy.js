const hre = require("hardhat");

async function main() {
  const Certificate = await hre.ethers.getContractFactory("CertificateRegistry");
  const certificate = await Certificate.deploy();

  await certificate.waitForDeployment();

  console.log("Certificate contract deployed to:", await certificate.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// 0x5FbDB2315678afecb367f032d93F642f64180aa3