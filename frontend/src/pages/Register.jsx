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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 p-4">
            <div className="w-full max-w-md form-container">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                    <p className="mt-2 text-gray-600">Join our blockchain certificate platform</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Wallet Address
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter wallet address"
                                    value={accountId}
                                    onChange={(e) => setAccountId(e.target.value)}
                                    required
                                    className="flex-1"
                                    disabled={isConnected}
                                />
                                {isConnected ? (
                                    <div className="px-4 py-2 bg-green-500 text-white rounded-lg">
                                        Connected
                                    </div>
                                ) : (
                                    <div className="px-4 py-2 bg-red-500 text-white rounded-lg">
                                        Disconnected
                                    </div>
                                )}
                            </div>
                            {isConnected && (
                                <p className="mt-1 text-sm text-green-600">
                                    Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Type
                            </label>
                            <div className="flex gap-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="isuser"
                                        value={1}
                                        checked={isuser === 1}
                                        onChange={() => setIsuser(1)}
                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-700">User</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="isuser"
                                        value={0}
                                        checked={isuser === 0}
                                        onChange={() => setIsuser(0)}
                                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-gray-700">Institution/University</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full">
                        Create Account
                    </button>
                </form>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600 text-center">
                            {String(error)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Register;