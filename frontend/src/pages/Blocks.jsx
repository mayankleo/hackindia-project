import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import api from "../api/api";
import { toast } from 'react-toastify';

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

function Blocks() {

  const [contractAddress, setContractAddress] = useState(null);
  const [certificateRegistryABI, setCertificateRegistryABI] = useState(null);
  const [myAddress, setMyAddress] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const fetchContractAddress = async () => {
      try {
        const response = await api.get("/getContractAddress");
        setContractAddress(response.data.contractAddress);
      } catch (error) {
        console.error("Error fetching contract address:", error);
        toast.error("Error fetching contract address");
      }
      try {
        const response = await api.get("/getABI");
        setCertificateRegistryABI(response.data);
      } catch (error) {
        console.error("Error fetching CertificateRegistry ABI:", error);
        toast.error("Error fetching CertificateRegistry ABI");
      }
    };
    fetchContractAddress();
  }, []);

  async function connectWallet() {
    if (window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, certificateRegistryABI, signer);
      setMyAddress(await signer.getAddress());
      setContract(contract);
      toast.success("Wallet Connected!");
    } else {
      toast.error("MetaMask is required!");
    }
  }

  const [certificates, setCertificates] = useState([]);

  async function fetchCertificates() {
    try {
      const contract = new ethers.Contract(contractAddress, certificateRegistryABI, provider);

      const filterIssued = contract.filters.CertificateIssued();
      const issuedEvents = await contract.queryFilter(filterIssued, 0, "latest");

      const filterRevoked = contract.filters.CertificateRevoked();
      const revokedEvents = await contract.queryFilter(filterRevoked, 0, "latest");

      let allRevokedEventsBlocks = []
      revokedEvents.forEach((event) => {
        allRevokedEventsBlocks.push(event.args[0]);
      })

      let allBlocks = []

      issuedEvents.forEach((event) => {
        let a = {}
        for (let i = 0; i < event.args.length; i++) {
          a[event.fragment.inputs[i].name] = event.args[i]
        }
        if (allRevokedEventsBlocks.includes(a["certificateID"])) {
          a["isValid"] = false
        }

        allBlocks.push(a);


      })

      setCertificates(allBlocks);

    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }


  async function revokeCertificate(certificateID) {
    if (!contract) return toast.error("Connect wallet first");
    try {
      const tx = await contract.revokeCertificate(certificateID);
      toast.info("Transaction sent! Waiting for confirmation...");
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment?.name === "CertificateRevoked");
      if (!event) {
        console.error("CertificateRevoke event not found in receipt!");
        return toast.error("Certificate revoke, but event missing!");
      }
      console.log("Certificate revoked succefully:", event.args[0]);
      toast.success(`Certificate Revoked succefully!`);
      fetchCertificates();
    } catch (error) {
      toast.error("Error Revoking certificate");
      console.error("Error:", error);
    }
  }

  return (
    <div>
      <h3>All Issued Certificates</h3>
      <button onClick={fetchCertificates}>fetch</button>
      <button onClick={connectWallet}>{myAddress ? "Connected" : "Connect Wallet"}</button>
      {certificates.length === 0 ? (
        <p>No certificates found.</p>
      ) : (
        <ul>
          {certificates.map((cert, index) => (
            <li key={index}>
              <strong>Certificate ID:</strong> {cert.certificateID} <br />
              <strong>Issuer Address:</strong> {cert.issuerAddress}<br />
              <strong>Recipient Address:</strong> {cert.recipientAddress}<br />
              <strong>Recipient Name:</strong> {cert.recipientName}<br />
              <strong>Issuer Name:</strong> {cert.issuer}<br />
              <strong>Course Name:</strong> {cert.courseName} <br />
              <strong>Issue Date:</strong> {new Date(Number(BigInt(cert.issueDate)) * 1000).toLocaleString().split(",")[0]} <br />
              <strong>Expiry Date:</strong> {new Date(Number(BigInt(cert.expiryDate)) * 1000).toLocaleString().split(",")[0]} <br />
              <strong>Valid:</strong> {cert.isValid ? "Yes" : "No"}<br />
              <button onClick={() => revokeCertificate(cert.certificateID)} disabled={!cert.isValid}>Revoke</button>
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Blocks;