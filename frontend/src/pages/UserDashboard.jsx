import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import api from "../api/api";
import { toast } from 'react-toastify';
import { useWallet } from "../utils/WalletContext";

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

const CertificateDesign = ({ certificate }) => {
    return (
        <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 opacity-50"></div>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
            
            {/* Certificate Content */}
            <div className="relative p-8">
                {/* Certificate Header */}
                <div className="text-center mb-8">
                    <div className="inline-block p-2 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full mb-4">
                        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 mb-2">
                        Certificate of Achievement
                    </h2>
                    <p className="text-gray-600">This is to certify that</p>
                </div>

                {/* Recipient Name */}
                <div className="text-center mb-8">
                    <h3 className="text-4xl font-bold text-gray-900 mb-2">{certificate.recipientName}</h3>
                    <p className="text-gray-600">has successfully completed the course</p>
                </div>

                {/* Course Name */}
                <div className="text-center mb-8">
                    <h4 className="text-2xl font-semibold text-emerald-700 mb-2">{certificate.courseName}</h4>
                    <p className="text-gray-600">issued by</p>
                    <p className="text-xl font-semibold text-gray-900">{certificate.issuer}</p>
                </div>

                {/* Certificate Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Certificate ID</h4>
                            <p className="font-mono text-sm text-gray-900 break-all">{certificate.certificateID}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Issue Date</h4>
                            <p className="font-medium text-gray-900">
                                {new Date(Number(BigInt(certificate.issueDate)) * 1000).toLocaleString().split(",")[0]}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                certificate.isValid 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                                {certificate.isValid ? 'Valid' : 'Revoked'}
                            </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Expiry Date</h4>
                            <p className="font-medium text-gray-900">
                                {new Date(Number(BigInt(certificate.expiryDate)) * 1000).toLocaleString().split(",")[0]}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Certificate Footer */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <div className="text-center">
                            <div className="h-16 w-16 mx-auto mb-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-600">Blockchain Verified</p>
                        </div>
                        <div className="text-center">
                            <div className="h-16 w-16 mx-auto mb-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-600">Secured by Blockchain</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

function UserDashboard() {
    const { walletAddress, isConnected } = useWallet();
    const [contractAddress, setContractAddress] = useState(null);
    const [certificateRegistryABI, setCertificateRegistryABI] = useState(null);
    const [certificates, setCertificates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    async function fetchCertificates() {
        if (!isConnected) return toast.error("Connect wallet first");
        setIsLoading(true);
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

                if (a["recipientAddress"] === walletAddress) {
                    allBlocks.push(a);
                }
            })

            setCertificates(allBlocks);
            toast.success("Certificates fetched successfully!");

        } catch (error) {
            console.error("Error fetching events:", error);
            toast.error("Error fetching certificates");
        } finally {
            setIsLoading(false);
        }
    }

    const openModal = (cert) => {
        setSelectedCertificate(cert);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCertificate(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section with Animated Background */}
                <div className="relative text-center mb-16">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-3xl transform -skew-y-6 animate-gradient-x"></div>
                    <div className="relative">
                        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 mb-4 animate-gradient-x">
                            My Certificates
                        </h1>
                        <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
                            View and manage your blockchain-verified certificates
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
                                Please connect your wallet from the navigation bar to view your certificates
                            </p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center mb-12">
                    <button 
                        onClick={fetchCertificates}
                        disabled={!isConnected || isLoading}
                        className="px-8 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-400 disabled:cursor-not-allowed transform hover:scale-[1.05] font-medium text-lg flex items-center space-x-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Loading...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Fetch My Certificates</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Certificates Display */}
                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/30">
                    {certificates.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-gray-600 text-lg font-medium">No certificates found</p>
                                <p className="text-gray-500 mt-2">Connect your wallet and fetch certificates to view them here</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {certificates.map((cert, index) => (
                                <div key={index} className="mb-8">
                                    <CertificateDesign certificate={cert} />
                                    <div className="mt-4 flex justify-end">
                                        <button 
                                            onClick={() => openModal(cert)}
                                            className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.05] font-medium flex items-center space-x-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            <span>View Details</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Certificate Modal */}
            {isModalOpen && selectedCertificate && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div 
                            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
                            onClick={closeModal}
                        ></div>

                        {/* Modal panel */}
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        {/* Certificate Header */}
                                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 mb-6 border border-emerald-100">
                                            <h3 className="text-2xl font-bold text-emerald-900 mb-2">Certificate Details</h3>
                                            <div className="flex flex-col space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium text-emerald-700">Certificate ID:</span>
                                                    <span className="font-medium text-emerald-900 break-all">{selectedCertificate.certificateID}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium text-emerald-700">Status:</span>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                        selectedCertificate.isValid 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {selectedCertificate.isValid ? 'Valid' : 'Revoked'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Certificate Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Issuer Information</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm font-medium text-gray-500">Name:</span>
                                                            <span className="font-medium text-gray-900">{selectedCertificate.issuer}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm font-medium text-gray-500">Address:</span>
                                                            <span className="font-medium text-gray-900 break-all">{selectedCertificate.issuerAddress}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Course Information</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm font-medium text-gray-500">Course Name:</span>
                                                            <span className="font-medium text-gray-900">{selectedCertificate.courseName}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Recipient Information</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm font-medium text-gray-500">Name:</span>
                                                            <span className="font-medium text-gray-900">{selectedCertificate.recipientName}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm font-medium text-gray-500">Address:</span>
                                                            <span className="font-medium text-gray-900 break-all">{selectedCertificate.recipientAddress}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Validity Period</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm font-medium text-gray-500">Issue Date:</span>
                                                            <span className="font-medium text-gray-900">
                                                                {new Date(Number(BigInt(selectedCertificate.issueDate)) * 1000).toLocaleString().split(",")[0]}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-sm font-medium text-gray-500">Expiry Date:</span>
                                                            <span className="font-medium text-gray-900">
                                                                {new Date(Number(BigInt(selectedCertificate.expiryDate)) * 1000).toLocaleString().split(",")[0]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-base font-medium text-white hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-300 transform hover:scale-[1.05]"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserDashboard;