import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from 'react-toastify';
import api from "../api/api";
import { useWallet } from "../utils/WalletContext";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

function AdminDashboard() {
    const { walletAddress, isConnected } = useWallet();
    const [contractAddress, setContractAddress] = useState(null);
    const [certificateRegistryABI, setCertificateRegistryABI] = useState(null);
    const [contract, setContract] = useState(null);

    const [recipientAddress, setRecipientAddress] = useState("");
    const [recipientName, setRecipientName] = useState("");
    const [issuer, setIssuer] = useState("");
    const [courseName, setCourseName] = useState("");
    const [issueDate, setIssueDate] = useState(0);
    const [expiryDate, setExpiryDate] = useState(0);
    const [certificates, setCertificates] = useState([]);

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

    useEffect(() => {
        const initializeContract = async () => {
            if (isConnected && walletAddress && contractAddress && certificateRegistryABI) {
                try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, certificateRegistryABI, signer);
            setContract(contract);
                    fetchCertificates();
                } catch (error) {
                    console.error("Error initializing contract:", error);
                    toast.error("Error connecting to contract");
                }
            }
        };
        initializeContract();
    }, [isConnected, walletAddress, contractAddress, certificateRegistryABI]);

    async function issueCertificate() {
        if (!contract) return toast.error("Connect wallet first");
        try {
            const tx = await contract.issueCertificate(recipientAddress, recipientName, issuer, courseName, issueDate, expiryDate);
            toast.info("Transaction sent! Waiting for confirmation...");

            const receipt = await tx.wait();
            console.log("Transaction receipt:", receipt);
            console.log("Transaction receipt logs:", receipt.logs);

            const event = receipt.logs.find(log => log.fragment?.name === "CertificateIssued");

            if (!event) {
                console.error("CertificateIssued event not found in receipt!");
                return toast.error("Certificate issued, but event missing!");
            }
            console.log('event.args[0] :>> ', event.args);
            const certID = event.args[0];
            console.log("Certificate ID:", certID);
            toast.success(`Certificate Issued! ID: ${certID}`);
            fetchCertificates();

        } catch (error) {
            toast.error("Error issuing certificate");
            console.error("Error:", error);
        }
    }

    async function fetchCertificates() {
        try {
            if (!walletAddress) return toast.error("Connect wallet first");
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

                if (a["issuerAddress"] === walletAddress) {
                    allBlocks.push(a);
                }
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
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section with Animated Background */}
                <div className="relative text-center mb-16">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl transform -skew-y-6 animate-gradient-x"></div>
                    <div className="relative">
                        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-4 animate-gradient-x">
                            Admin Dashboard
                        </h1>
                        <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
                            Manage and issue blockchain certificates with ease
                        </p>
                    </div>
                </div>

                {/* Wallet Connection Status */}
                {!isConnected && (
                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/30 mb-12 transform hover:scale-[1.02] transition-all duration-300">
                        <div className="flex items-center justify-center space-x-3">
                            <div className="p-3 bg-yellow-100 rounded-full animate-pulse">
                                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <p className="text-yellow-800 font-medium text-lg">
                                Please connect your wallet from the navigation bar to manage certificates
                            </p>
                        </div>
                    </div>
                )}

                {/* Issue Certificate Section */}
                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/30 mb-12 transform hover:scale-[1.01] transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">Issue New Certificate</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="transform hover:scale-[1.02] transition-all duration-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter recipient address" 
                                    onChange={(e) => setRecipientAddress(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed bg-white/80 backdrop-blur-sm"
                                    disabled={!isConnected}
                                />
                            </div>
                            <div className="transform hover:scale-[1.02] transition-all duration-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter recipient name" 
                                    onChange={(e) => setRecipientName(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed bg-white/80 backdrop-blur-sm"
                                    disabled={!isConnected}
                                />
                            </div>
                            <div className="transform hover:scale-[1.02] transition-all duration-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Issuer Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter issuer name" 
                                    onChange={(e) => setIssuer(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed bg-white/80 backdrop-blur-sm"
                                    disabled={!isConnected}
                                />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="transform hover:scale-[1.02] transition-all duration-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter course name" 
                                    onChange={(e) => setCourseName(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed bg-white/80 backdrop-blur-sm"
                                    disabled={!isConnected}
                                />
                            </div>
                            <div className="transform hover:scale-[1.02] transition-all duration-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Issue Date</label>
                                <input 
                                    type="date" 
                                    onChange={(e) => setIssueDate(Math.floor(new Date(e.target.value).getTime() / 1000))}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed bg-white/80 backdrop-blur-sm"
                                    disabled={!isConnected}
                                />
                            </div>
                            <div className="transform hover:scale-[1.02] transition-all duration-200">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                                <input 
                                    type="date" 
                                    onChange={(e) => setExpiryDate(Math.floor(new Date(e.target.value).getTime() / 1000))}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed bg-white/80 backdrop-blur-sm"
                                    disabled={!isConnected}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={issueCertificate}
                        disabled={!isConnected}
                        className="mt-8 w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white py-4 rounded-xl hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all duration-300 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-medium text-lg"
                    >
                        {isConnected ? "Issue Certificate" : "Connect Wallet to Issue"}
                    </button>
                </div>

                {/* Issued Certificates Section */}
                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/30">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">Issued Certificates</h2>
                        </div>
                        <button 
                            onClick={fetchCertificates}
                            disabled={!isConnected}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-[1.05]"
                        >
                            Refresh List
                        </button>
            </div>

                    {certificates.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-gray-600 text-lg font-medium">No certificates found</p>
                                <p className="text-gray-500 mt-2">Issue a certificate to see it here</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {certificates.map((cert, index) => (
                                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                                    {/* Certificate ID in a prominent section at the top */}
                                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                        <div className="grid grid-cols-1">
                                            <div className="col-span-1">
                                                <div className="flex gap-2 items-center">
                                                    <span className="text-medium font-medium text-blue-700">Certificate ID:</span>
                                                    <span className="font-medium text-blue-900 break-all">{cert.certificateID}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                                <span className="text-sm font-medium text-gray-500">Recipient:</span>
                                                <span className="font-medium text-gray-900">{cert.recipientName}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                                <span className="text-sm font-medium text-gray-500">Course:</span>
                                                <span className="font-medium text-gray-900">{cert.courseName}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                                <span className="text-sm font-medium text-gray-500">Issue Date:</span>
                                                <span className="font-medium text-gray-900">
                                                    {new Date(Number(BigInt(cert.issueDate)) * 1000).toLocaleString().split(",")[0]}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                                <span className="text-sm font-medium text-gray-500">Expiry Date:</span>
                                                <span className="font-medium text-gray-900">
                                                    {new Date(Number(BigInt(cert.expiryDate)) * 1000).toLocaleString().split(",")[0]}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                                <span className="text-sm font-medium text-gray-500">Status:</span>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                    cert.isValid 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {cert.isValid ? 'Valid' : 'Revoked'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 flex justify-end">
                                        <button 
                                            onClick={() => revokeCertificate(cert.certificateID)} 
                                            disabled={!cert.isValid || !isConnected}
                                            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.05] ${
                                                cert.isValid && isConnected
                                                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800' 
                                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            } shadow-md hover:shadow-lg`}
                                        >
                                            Revoke Certificate
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;