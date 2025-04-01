const hre = require("hardhat");

async function main() {
    // Attach to the deployed contract
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Change if needed
    const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry");
    const contract = await CertificateRegistry.attach(contractAddress);
    console.log("Contract attached at:", contractAddress);

    // Define certificate details
    const recipient = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Update recipient address
    const issuer = "TestIssuer";
    const courseName = "TestCourse";
    const issueDate = 1711891200; // Example timestamp
    const expiryDate = 0; // No expiry

    console.log("Issuing certificate...");
    
    // Issue certificate
    const tx = await contract.issueCertificate(recipient, issuer, courseName, issueDate, expiryDate);
    console.log("Transaction sent:", tx.hash);
    
    // Wait for transaction to be mined
    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    console.log("Gas Used:", receipt.gasUsed.toString());

    // Debug the receipt structure
    console.log("Receipt structure:", JSON.stringify(receipt, null, 2));
    
    // Check if events exist before trying to access them
    if (receipt.events && receipt.events.length > 0) {
        console.log("Events found:", receipt.events.length);
        
        // Try to find the CertificateIssued event
        const certificateIssuedEvent = receipt.events.find(event => 
            event.event === "CertificateIssued");
        
        if (certificateIssuedEvent) {
            console.log("CertificateIssued event found!");
            console.log("Event data:", certificateIssuedEvent);
            
            // Extract certificate ID and details
            const certID = certificateIssuedEvent.args.certID;
            console.log("Certificate ID:", certID);
            
            // Verify the issued certificate
            const cert = await contract.verifyCertificate(certID);
            console.log("Verified Certificate Details:", cert);
        } else {
            console.log("CertificateIssued event not found by name.");
            
            // Check for unnamed events
            for (let i = 0; i < receipt.events.length; i++) {
                console.log(`Event ${i}:`, receipt.events[i]);
                if (receipt.events[i].args) {
                    console.log(`Event ${i} args:`, receipt.events[i].args);
                }
            }
        }
    } else {
        console.log("No events found in receipt.");
        
        // Try alternative method to get the logs
        console.log("Trying to access logs directly...");
        if (receipt.logs && receipt.logs.length > 0) {
            console.log("Logs found:", receipt.logs.length);
            console.log("First log:", receipt.logs[0]);
            
            try {
                // Try to parse the raw logs with contract interface
                const eventInterface = contract.interface;
                for (const log of receipt.logs) {
                    try {
                        const parsedLog = eventInterface.parseLog(log);
                        console.log("Parsed log:", parsedLog);
                        
                        if (parsedLog.name === "CertificateIssued") {
                            console.log("Found CertificateIssued from logs!");
                            console.log("Certificate ID:", parsedLog.args.certID);
                            
                            // Verify the issued certificate
                            const cert = await contract.verifyCertificate(parsedLog.args.certID);
                            console.log("Verified Certificate Details:", cert);
                            break;
                        }
                    } catch (e) {
                        console.log("Failed to parse log:", e.message);
                    }
                }
            } catch (e) {
                console.error("Error parsing logs:", e);
            }
        } else {
            console.log("No logs found in receipt either.");
        }
    }

    // Try to get events the direct way
    console.log("\nAttempting to query events directly from contract...");
    const filter = contract.filters.CertificateIssued();
    const events = await contract.queryFilter(filter);
    
    if (events.length > 0) {
        console.log(`Found ${events.length} CertificateIssued events directly from contract`);
        const latestEvent = events[events.length - 1];
        console.log("Latest event:", latestEvent);
        console.log("Latest certificate ID:", latestEvent.args.certID);
    } else {
        console.log("No CertificateIssued events found directly from contract");
    }
}

// Run the script and handle errors
main().catch((error) => {
    console.error("Error:", error);
    process.exitCode = 1;
});