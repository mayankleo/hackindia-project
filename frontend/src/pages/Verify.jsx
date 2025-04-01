import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from 'react-toastify';
import api from "../api/api";
import { useWallet } from "../utils/WalletContext";

const Verify = () => {
    const { walletAddress, isConnected } = useWallet();
    const [contractAddress, setContractAddress] = useState(null);
    const [certificateRegistryABI, setCertificateRegistryABI] = useState(null);
    const [contract, setContract] = useState(null);
    const [certID, setCertID] = useState("");
    const [certificates, setCertificates] = useState(null);
    const [certificateIds, setCertificateIds] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

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

    // Initialize contract when wallet is connected
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
                    toast.error("Error connecting to blockchain");
                }
            }
        };
        initializeContract();
    }, [isConnected, walletAddress, contractAddress, certificateRegistryABI]);

    async function verifyCertificate(certIDpara) {
        if (!contract || !certIDpara) return toast.error("Enter Certificate ID");
        try {
            let [certificateID, issuerAddress, recipientAddress, recipientName, issuer, courseName, issueDate, expiryDate, isValid] = await contract.verifyCertificate(certIDpara);
            issueDate = new Date(Number(BigInt(issueDate)) * 1000).toLocaleString().split(",")[0];
            if (Number(BigInt(expiryDate)) !== 0) {
                expiryDate = new Date(Number(BigInt(expiryDate)) * 1000).toLocaleString().split(",")[0];
            } else {
                expiryDate = "N/A"
            }
            setCertificates([{ certificateID, issuerAddress, recipientAddress, recipientName, issuer, courseName, issueDate, expiryDate, isValid }]);
        } catch (error) {

            let errorMessage = "Invalid Certificate ID";

            if (error.reason) {
                errorMessage = error.reason;  // Ethers.js errors
            } else if (error.data && error.data.message) {
                errorMessage = error.data.message; // Solidity revert messages
            } else if (error.message) {
                errorMessage = error.message; // General error message
            }

            toast.error(errorMessage);
        }
    }

    async function verifyCertificatesBulk(certIDArray) {
        if (!contract || !certIDArray || certIDArray.length === 0) {
            toast.error("Enter at least one Certificate ID");
            return;
        }

        try {
            const verificationPromises = certIDArray.map(async (certID) => {
                try {
                    let [
                        certificateID, issuerAddress, recipientAddress,
                        recipientName, issuer, courseName, issueDate, expiryDate, isValid
                    ] = await contract.verifyCertificate(certID);

                    issueDate = new Date(Number(issueDate) * 1000).toLocaleDateString();
                    expiryDate = Number(expiryDate) !== 0
                        ? new Date(Number(expiryDate) * 1000).toLocaleDateString()
                        : "N/A";

                    return {
                        certificateID, issuerAddress, recipientAddress,
                        recipientName, issuer, courseName, issueDate, expiryDate, isValid, error: null
                    };
                } catch (error) {
                    console.error(`Error verifying certificate ${certID}:`, error);

                    let errorMessage = "Invalid Certificate ID";
                    if (error.reason) {
                        errorMessage = `Blockchain Error: ${error.reason}`;
                    } else if (error.data?.message) {
                        errorMessage = `Revert: ${error.data.message}`;
                    } else if (error.message) {
                        errorMessage = error.message;
                    }

                    return { certificateID: certID, error: errorMessage };
                }
            });

            // Execute all verification requests in parallel
            const certificates = await Promise.all(verificationPromises);

            // Store verified certificates
            setCertificates(certificates);

            toast.success("Bulk verification completed!");
            // console.log('setCertificates :>> ', certificates);
        } catch (error) {
            console.error("Bulk Verification Error:", error);
            toast.error("An error occurred during bulk verification.");
        }
    }

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === "text/csv") {
                handleFileUpload({ target: { files: [file] } });
            } else {
                toast.error("Please upload a valid CSV file.");
            }
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type === "text/csv") {
            const reader = new FileReader();
            reader.onload = (e) => {
                let ids = [];
                const contents = e.target.result.split(/\r?\n/);
                for (let i = 1; i < contents.length - 1; i++) {
                    let a = contents[i].split(",");
                    ids.push({ "CertificateID": a[0], "IsVerifyed": a[1] });
                }
                setCertificateIds(ids);
                toast.success("CSV file loaded successfully!");
            };
            reader.readAsText(file);
        } else {
            toast.error("Please upload a valid CSV file.");
        }
    };

    const handleSubmit = () => {
        console.log("Submitted Certificate IDs:", certificateIds);
        verifyCertificatesBulk(certificateIds.map(cert => cert.CertificateID));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section with Animated Background */}
                <div className="relative text-center mb-16">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl transform -skew-y-6"></div>
                    <div className="relative">
                        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                            Certificate Verification Portal
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Verify the authenticity of your blockchain certificates with our secure verification system
                        </p>
                        
                        {!isConnected && (
                            <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl shadow-lg max-w-md mx-auto">
                                <div className="flex items-center justify-center space-x-3">
                                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-yellow-800 font-medium">
                                        Please connect your wallet from the navigation bar to verify certificates
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Verification Options with Glass Effect */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {/* Single Certificate Verification */}
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Single Certificate Verification</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Enter Certificate ID" 
                                    onChange={(e) => setCertID(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                                    disabled={!isConnected}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                            </div>
                            <button 
                                onClick={() => verifyCertificate(certID)}
                                disabled={!isConnected}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                {isConnected ? "Verify Certificate" : "Connect Wallet to Verify"}
                            </button>
                        </div>
                    </div>

                    {/* Bulk Verification */}
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Bulk Certificate Verification</h3>
                        </div>
                        <div className="space-y-6">
                            <label 
                                className={`block p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                                    isDragging 
                                    ? 'border-blue-500 bg-blue-50/50' 
                                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
                                } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                <div className="text-center">
                                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <p className="text-lg font-medium text-gray-700">
                                        {isDragging ? "Drop your CSV file here" : "Upload CSV File Here"}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">Click or drag and drop</p>
                                </div>
                                <input 
                                    type="file" 
                                    accept=".csv" 
                                    onChange={handleFileUpload} 
                                    className="hidden" 
                                    disabled={!isConnected}
                                />
                            </label>
                            {certificateIds.length > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <div className="flex items-center space-x-2">
                                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <p className="text-green-700 font-medium">
                                            {certificateIds.length} certificate(s) loaded successfully
                                        </p>
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={handleSubmit}
                                disabled={certificateIds.length === 0 || !isConnected}
                                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                {isConnected ? "Verify Bulk Certificates" : "Connect Wallet to Verify"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                {certificates && certificates.length > 0 && (
                    <div className="space-y-8">
                        {certificates.map((certificate) => (
                            <div key={certificate.certificateID} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/20">
                                {/* Certificate Display */}
                                <div className="p-8 border-b border-gray-100">
                                    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 border-4 border-blue-500 shadow-inner">
                                        <div className="text-center">
                                            <div className="mb-8">
                                                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                                                    Certificate of Completion
                                                </h2>
                                                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                                            </div>
                                            
                                            <p className="text-lg text-gray-600 mb-6">This is to certify that</p>
                                            <h3 className="text-3xl font-semibold text-blue-600 mb-2">{certificate.recipientName}</h3>
                                            <p className="text-lg text-gray-600 mb-2">has successfully completed</p>
                                            <h4 className="text-2xl font-medium text-gray-800 mb-6">{certificate.courseName}</h4>
                                            
                                            <div className="mb-8">
                                                <p className="text-gray-600">Issued by</p>
                                                <h5 className="text-xl font-medium text-gray-800">{certificate.issuer}</h5>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-8 mb-8">
                                                <div className="bg-white/50 rounded-xl p-4">
                                                    <p className="font-semibold text-gray-700 mb-1">Issue Date</p>
                                                    <p className="text-gray-600">{certificate.issueDate}</p>
                                                </div>
                                                <div className="bg-white/50 rounded-xl p-4">
                                                    <p className="font-semibold text-gray-700 mb-1">Expiry Date</p>
                                                    <p className="text-gray-600">{certificate.expiryDate}</p>
                                                </div>
                                            </div>
                                            
                                            <div className={`inline-flex items-center px-6 py-3 rounded-full shadow-lg ${
                                                certificate.isValid 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                                <span className={`h-2 w-2 rounded-full mr-2 ${
                                                    certificate.isValid 
                                                    ? 'bg-green-500' 
                                                    : 'bg-red-500'
                                                }`}></span>
                                                {certificate.isValid ? "Valid Certificate" : "Invalid Certificate"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Certificate Details */}
                                <div className="bg-gray-50/50 px-8 py-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Certificate Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                        <div className="bg-white/50 rounded-xl p-4">
                                            <p className="text-gray-600 mb-1">Certificate ID</p>
                                            <p className="font-medium text-gray-900">{certificate.certificateID}</p>
                                        </div>
                                        <div className="bg-white/50 rounded-xl p-4">
                                            <p className="text-gray-600 mb-1">Issuer Address</p>
                                            <p className="font-medium text-gray-900 break-all">{certificate.issuerAddress}</p>
                                        </div>
                                        <div className="bg-white/50 rounded-xl p-4">
                                            <p className="text-gray-600 mb-1">Recipient Address</p>
                                            <p className="font-medium text-gray-900 break-all">{certificate.recipientAddress}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* No Results Message */}
                {(!certificates || certificates.length === 0) && (
                    <div className="text-center py-16">
                        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto shadow-xl border border-white/20">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-600 text-lg">No certificates found</p>
                            <p className="text-gray-500 mt-2">Please verify a certificate to see results</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Verify;