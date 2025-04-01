import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export function WalletProvider({ children }) {
    const [walletAddress, setWalletAddress] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    // Helper function to normalize Ethereum addresses to checksum format
    const normalizeAddress = (address) => {
        try {
            return address ? ethers.getAddress(address) : '';
        } catch (error) {
            console.error('Error normalizing address:', error);
            return address || '';
        }
    };

    useEffect(() => {
        // Check if wallet is already connected on component mount
        const checkWalletConnection = async () => {
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        const checksumAddress = normalizeAddress(accounts[0]);
                        setWalletAddress(checksumAddress);
                        setIsConnected(true);
                    }
                } catch (error) {
                    console.error('Error checking wallet connection:', error);
                }
            }
        };
        
        // checkWalletConnection();
    }, []);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const checksumAddress = normalizeAddress(accounts[0]);
                setWalletAddress(checksumAddress);
                setIsConnected(true);
            } catch (error) {
                console.error('Error connecting wallet:', error);
            }
        } else {
            alert('Please install MetaMask or another Web3 wallet!');
        }
    };

    const disconnectWallet = () => {
        setWalletAddress('');
        setIsConnected(false);
    };

    return (
        <WalletContext.Provider value={{ walletAddress, isConnected, connectWallet, disconnectWallet }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
} 