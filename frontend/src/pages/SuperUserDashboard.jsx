import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from 'react-toastify';
import api from "../api/api";
import { useWallet } from "../utils/WalletContext";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

function SuperUserDashboard() {
    const { walletAddress, isConnected } = useWallet();
    const [contractAddress, setContractAddress] = useState(null);
    const [certificateRegistryABI, setCertificateRegistryABI] = useState(null);
    const [contract, setContract] = useState(null);
    const [showDashboard, setShowDashboard] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [allInstitute, setAllInstitute] = useState("");
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
                } catch (error) {
                    console.error("Error initializing contract:", error);
                    toast.error("Error initializing contract");
                }
            }
        };
        initializeContract();
    }, [isConnected, walletAddress, contractAddress, certificateRegistryABI]);

    async function addIssuerid(accountid) {
        if (!contract) return toast.error("Please connect your wallet from the navigation bar");
        try {
            const tx = await contract.addIssuer(accountid);
            toast.info("Transaction sent! Waiting for confirmation...");
            const receipt = await tx.wait();
            const event = receipt.logs.find(log => log.fragment?.name === "IssuerAdded");
            if (!event) {
                console.error("Issuer Added event not found in receipt!");
                return toast.error("Issuer Added, but event missing!");
            }
            console.log("Issuer Added successfully:", event.args[0]);
            toast.success(`Issuer Added successfully!`);
        } catch (error) {
            toast.error("Error Adding Issuer");
            console.error("Error:", error);
        }
    }

    async function removeIssuerid(accountid) {
        if (!contract) return toast.error("Please connect your wallet from the navigation bar");
        try {
            const tx = await contract.removeIssuer(accountid);
            toast.info("Transaction sent! Waiting for confirmation...");
            const receipt = await tx.wait();
            const event = receipt.logs.find(log => log.fragment?.name === "IssuerRemoved");
            if (!event) {
                console.error("Issuer Removed event not found in receipt!");
                return toast.error("Issuer Removed, but event missing!");
            }
            console.log("Issuer Removed successfully:", event.args[0]);
            toast.success(`Issuer Removed successfully!`);
        } catch (error) {
            toast.error("Error Removing Issuer");
            console.error("Error:", error);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const response = await api.post("/login-superuser", { username, password });
            if (response.data.issuperuser) {
                setShowDashboard(true);
            } else {
                setShowDashboard(false);
                toast.error("You are not a superuser!");
            }
        } catch (err) {
            setError(err);
        }
    };

    const fetchAllInstitut = async () => {
        try {
            const response = await api.get("/get-all-institute");
            setAllInstitute(response.data)
        } catch (err) {
            setError(err);
        }
    }

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
                } else {
                    a["isValid"] = true
                }

                allBlocks.push(a);
            })

            setCertificates(allBlocks);

        } catch (error) {
            console.error("Error fetching events:", error);
            toast.error("Error fetching certificates");
        }
    }

    const BlockchainVisualization = ({ certificates }) => {
        return (
            <div className="mt-12">
                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/30">
                    <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Blockchain Visualization</h2>
                            <button
                                onClick={fetchCertificates}
                                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-[1.05] font-medium flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Refresh Chain</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {certificates.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
                                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    <p className="text-gray-600 text-lg font-medium">No certificates found</p>
                                    <p className="text-gray-500 mt-2">Click the refresh button to fetch certificate data</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {certificates.map((cert, index) => (
                                    <div key={index} className="relative">
                                        {/* Chain Link */}
                                        {index < certificates.length - 1 && (
                                            <div className="absolute left-1/2 top-full w-0.5 h-6 bg-gradient-to-b from-purple-500 to-indigo-500 transform -translate-x-1/2"></div>
                                        )}
                                        
                                        {/* Certificate Block */}
                                        <div className={`relative bg-white rounded-xl border-2 p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${
                                            cert.isValid 
                                            ? 'border-green-500 hover:border-green-600' 
                                            : 'border-red-500 hover:border-red-600'
                                        }`}>
                                            {/* Block Header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-3 h-3 rounded-full ${
                                                        cert.isValid ? 'bg-green-500' : 'bg-red-500'
                                                    }`}></div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        Block #{certificates.length - index}
                                                    </h3>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    cert.isValid 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {cert.isValid ? 'Valid' : 'Revoked'}
                                                </span>
                                            </div>

                                            {/* Certificate Details */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <p className="text-sm text-gray-500">Certificate ID</p>
                                                        <p className="font-mono text-sm text-gray-900 break-all">{cert.certificateID}</p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <p className="text-sm text-gray-500">Issuer</p>
                                                        <p className="font-medium text-gray-900">{cert.issuer}</p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <p className="text-sm text-gray-500">Recipient</p>
                                                        <p className="font-medium text-gray-900">{cert.recipientName}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <p className="text-sm text-gray-500">Course</p>
                                                        <p className="font-medium text-gray-900">{cert.courseName}</p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <p className="text-sm text-gray-500">Issue Date</p>
                                                        <p className="font-medium text-gray-900">
                                                            {new Date(Number(BigInt(cert.issueDate)) * 1000).toLocaleString().split(",")[0]}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-lg p-3">
                                                        <p className="text-sm text-gray-500">Expiry Date</p>
                                                        <p className="font-medium text-gray-900">
                                                            {new Date(Number(BigInt(cert.expiryDate)) * 1000).toLocaleString().split(",")[0]}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section with Animated Background */}
                <div className="relative text-center mb-16">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-blue-500/20 rounded-3xl transform -skew-y-6 animate-gradient-x"></div>
                    <div className="relative">
                        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 mb-4 animate-gradient-x">
                            SuperUser Dashboard
                        </h1>
                        <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
                            Manage and authorize certificate issuers
                        </p>
                    </div>
                </div>

                {showDashboard ? (
                    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/30">
                        {/* Wallet Connection Status */}
                        {!isConnected && (
                            <div className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full">
                                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">Wallet Not Connected</h2>
                                        <p className="text-sm text-gray-600">Please connect your wallet from the navigation bar to manage institutes</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Institute List Section */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-900">Institute Management</h2>
                                    <button
                                        onClick={fetchAllInstitut}
                                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-[1.05] font-medium flex items-center space-x-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span>Refresh List</span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {allInstitute.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
                                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                            <p className="text-gray-600 text-lg font-medium">No institutes found</p>
                                            <p className="text-gray-500 mt-2">Click the refresh button to fetch institute data</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {allInstitute.map((account, index) => (
                                            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">{account.username}</h3>
                                                        <p className="text-sm text-gray-600 font-mono break-all">{account.accountid}</p>
                                                    </div>
                                                    <div className="flex space-x-3">
                                                        <button
                                                            onClick={() => addIssuerid(account.accountid)}
                                                            disabled={!isConnected}
                                                            className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 transform hover:scale-[1.05] ${
                                                                isConnected
                                                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            }`}
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span>Authorize</span>
                                                        </button>
                                                        <button
                                                            onClick={() => removeIssuerid(account.accountid)}
                                                            disabled={!isConnected}
                                                            className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all duration-300 transform hover:scale-[1.05] ${
                                                                isConnected
                                                                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
                                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            }`}
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            <span>Revoke</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Add the blockchain visualization */}
                        <BlockchainVisualization certificates={certificates} />
                    </div>
                ) : (
                    <div className="max-w-md mx-auto">
                        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/30">
                            <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-8">
                                SuperUser Login
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                        placeholder="Enter your username"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                        {String(error)}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] font-medium"
                                >
                                    Login
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SuperUserDashboard;