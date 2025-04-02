import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useWallet } from "../utils/WalletContext";

function Register() {
    const { walletAddress, isConnected } = useWallet();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [accountId, setAccountId] = useState("");
    const [error, setError] = useState("");
    const [isuser, setIsuser] = useState(1);
    const navigate = useNavigate();

    // Update accountId when wallet is connected
    useEffect(() => {
        if (walletAddress) {
            setAccountId(walletAddress);
        }
    }, [walletAddress]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Use wallet address if connected, otherwise use manually entered accountId
        const finalAccountId = isConnected ? walletAddress : accountId;

        try {
            const response = await api.post("/register", {
                username,
                password,
                accountId: finalAccountId,
                isuser
            });
            localStorage.setItem("user", JSON.stringify(response.data));
            navigate(response.data.isuser === 1 ? "/user-dashboard" : "/admin-dashboard");
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="blockchain-grid">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="blockchain-node" style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`
                            }}>
                                <div className="node-content">
                                    <div className="node-circle"></div>
                                    <div className="node-lines">
                                        {[...Array(4)].map((_, j) => (
                                            <div key={j} className="node-line" style={{
                                                transform: `rotate(${j * 90}deg)`
                                            }}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full max-w-4xl relative z-10">
                <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/30">
                    <div className="text-center mb-6">
                        <div className="inline-block p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl mb-3">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-1">Create Account</h2>
                        <p className="text-gray-600 text-sm">Join our blockchain certificate platform</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                        Username
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        placeholder="Choose a username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="Create a strong password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                                        Wallet Address
                                        {isConnected && (
                                            <span className="text-sm text-green-600 flex items-center">
                                                <svg className="me-1 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                                            </span>
                                        )}
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter wallet address"
                                            value={accountId}
                                            onChange={(e) => setAccountId(e.target.value)}
                                            required
                                            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm"
                                            disabled={isConnected}
                                        />
                                        <div className={`px-3 py-2 rounded-lg flex items-center justify-center min-w-[100px] ${isConnected ? 'bg-green-500' : 'bg-red-500'
                                            } text-white text-sm font-medium transition-all duration-300`}>
                                            {isConnected ? 'Connected' : 'Disconnected'}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Account Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 ${isuser === 1
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-200'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="isuser"
                                                value={1}
                                                checked={isuser === 1}
                                                onChange={() => setIsuser(1)}
                                                className="sr-only"
                                            />
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isuser === 1 ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                                    }`}>
                                                    {isuser === 1 && (
                                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                                    )}
                                                </div>
                                                <span className={`text-sm font-medium ${isuser === 1 ? 'text-blue-700' : 'text-gray-700'}`}>
                                                    User
                                                </span>
                                            </div>
                                        </label>
                                        <label className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-300 ${isuser === 0
                                                ? 'border-purple-500 bg-purple-50'
                                                : 'border-gray-200 hover:border-purple-200'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="isuser"
                                                value={0}
                                                checked={isuser === 0}
                                                onChange={() => setIsuser(0)}
                                                className="sr-only"
                                            />
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isuser === 0 ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                                                    }`}>
                                                    {isuser === 0 && (
                                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                                    )}
                                                </div>
                                                <span className={`text-sm font-medium ${isuser === 0 ? 'text-purple-700' : 'text-gray-700'}`}>
                                                    Institution
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-medium text-base flex items-center justify-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span>Create Account</span>
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-red-600">
                                    {String(error)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .blockchain-grid {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }

                .blockchain-node {
                    position: absolute;
                    width: 60px;
                    height: 60px;
                    animation: float 6s ease-in-out infinite;
                }

                .node-content {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }

                .node-circle {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 20px;
                    height: 20px;
                    background: linear-gradient(45deg, #3b82f6, #8b5cf6);
                    border-radius: 50%;
                    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
                }

                .node-lines {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }

                .node-line {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 30px;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, #3b82f6, transparent);
                    transform-origin: left center;
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }
            `}</style>
        </div>
    );
}

export default Register;