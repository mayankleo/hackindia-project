function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Blockchain Background Animation */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Animated blockchain nodes */}
                <div className="absolute inset-0 opacity-10">
                    <div className="blockchain-grid">
                        {[...Array(20)].map((_, i) => (
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
                
                {/* Floating particles */}
                <div className="absolute inset-0">
                    {[...Array(15)].map((_, i) => (
                        <div key={i} className="floating-particle" style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`
                        }}></div>
                    ))}
                </div>
            </div>

            <div className="text-center space-y-6 animate-fade-in mb-12 relative z-10">
                <div className="relative inline-block">
                    <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-6 animate-slide-down relative">
                        Blockchain-Based Certificate
                    </h1>
                    <div className="absolute -top-4 -right-4 text-4xl animate-spin-slow text-blue-400">⚡</div>
                </div>
                <h2 className="text-3xl md:text-5xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-8 animate-slide-up">
                    Generation & Validation
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto animate-fade-in">
                    Secure, transparent, and verifiable digital certificates powered by blockchain technology
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full relative z-10">
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 animate-fade-in group border border-gray-700/50">
                    <div className="text-blue-400 text-4xl mb-4 animate-bounce-slow">🔒</div>
                    <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2 group-hover:text-blue-300 transition-colors">Secure</h3>
                    <p className="text-gray-400">Immutable and tamper-proof certificate storage on the blockchain</p>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 animate-fade-in group border border-gray-700/50" style={{ animationDelay: '0.2s' }}>
                    <div className="text-purple-400 text-4xl mb-4 animate-pulse-slow">✨</div>
                    <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2 group-hover:text-purple-300 transition-colors">Transparent</h3>
                    <p className="text-gray-400">Public verification of certificate authenticity and validity</p>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 animate-fade-in group border border-gray-700/50" style={{ animationDelay: '0.4s' }}>
                    <div className="text-pink-400 text-4xl mb-4 animate-float">🌐</div>
                    <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-blue-400 mb-2 group-hover:text-pink-300 transition-colors">Global</h3>
                    <p className="text-gray-400">Accessible worldwide with instant verification capabilities</p>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-900 to-transparent"></div>
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-900 to-transparent"></div>

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

                .floating-particle {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: #3b82f6;
                    border-radius: 50%;
                    animation: float-particle 8s linear infinite;
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }

                @keyframes float-particle {
                    0% {
                        transform: translateY(100vh) scale(0);
                        opacity: 0;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100px) scale(1);
                        opacity: 0;
                    }
                }

                @keyframes animate-gradient-x {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }

                @keyframes animate-slide-down {
                    from {
                        transform: translateY(-20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                @keyframes animate-slide-up {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                @keyframes animate-fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes animate-spin-slow {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }

                @keyframes animate-bounce-slow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }

                @keyframes animate-pulse-slow {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                }

                @keyframes animate-float {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
            `}</style>
        </div>
    );
}

export default Home;

