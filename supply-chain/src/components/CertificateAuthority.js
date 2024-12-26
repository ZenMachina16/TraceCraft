import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { PinataSDK } from "pinata-web3";
import { Container, Typography, TextField, Button, Box, CircularProgress, Card, CardContent, Grid, Alert } from "@mui/material";
import Web3 from "web3";

const CertificateAuthority = () => {
  const [productId, setProductId] = useState("");
  const [productDetails, setProductDetails] = useState(null);
  const [certificateProvider, setCertificateProvider] = useState("");
  const [digitalSignature, setDigitalSignature] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [docHash, setDocHash] = useState("");
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null); // Store web3 instance

    // Hardcoded Contract Address and ABI
    const CONTRACT_ADDRESS = "0x5518F881c4a20D86Ec92CD46e22a5e35621fB1d9"; // Replace with your contract address
    const CONTRACT_ABI = [
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "uint256",
            name: "productId",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "string",
            name: "manufacturerName",
            type: "string",
          },
          {
            indexed: false,
            internalType: "string",
            name: "manufacturerDetails",
            type: "string",
          },
          {
            indexed: false,
            internalType: "string",
            name: "longitude",
            type: "string",
          },
          {
            indexed: false,
            internalType: "string",
            name: "latitude",
            type: "string",
          },
          {
            indexed: false,
            internalType: "string",
            name: "category",
            type: "string",
          },
        ],
        name: "ProductAdded",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "uint256",
            name: "productId",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "address",
            name: "logisticsPartner",
            type: "address",
          },
        ],
        name: "ProductAssignedToCourier",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "uint256",
            name: "productId",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "address",
            name: "customer",
            type: "address",
          },
        ],
        name: "ProductAssignedToCustomer",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "uint256",
            name: "productId",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "string",
            name: "certificateAuthority",
            type: "string",
          },
          {
            indexed: false,
            internalType: "string",
            name: "certificateDocHash",
            type: "string",
          },
        ],
        name: "ProductCertified",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "uint256",
            name: "productId",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "string",
            name: "deliveryStatus",
            type: "string",
          },
          {
            indexed: false,
            internalType: "address",
            name: "logisticsPartner",
            type: "address",
          },
        ],
        name: "ProductDelivered",
        type: "event",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "_id",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "_name",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "_price",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "_manufacturerName",
            type: "string",
          },
          {
            internalType: "string",
            name: "_manufacturerDetails",
            type: "string",
          },
          {
            internalType: "string",
            name: "_longitude",
            type: "string",
          },
          {
            internalType: "string",
            name: "_latitude",
            type: "string",
          },
          {
            internalType: "string",
            name: "_category",
            type: "string",
          },
        ],
        name: "addProduct",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "_productId",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "_certificateAuthority",
            type: "string",
          },
          {
            internalType: "string",
            name: "_digitalSignature",
            type: "string",
          },
          {
            internalType: "string",
            name: "_certificateDocHash",
            type: "string",
          },
        ],
        name: "certifyProduct",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "_productId",
            type: "uint256",
          },
        ],
        name: "assignCourier",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "_productId",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "_deliveryStatus",
            type: "string",
          },
        ],
        name: "markAsDelivered",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "_productId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "_customer",
            type: "address",
          },
        ],
        name: "assignToCustomer",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "_id",
            type: "uint256",
          },
        ],
        name: "getProduct",
        outputs: [
          {
            components: [
              {
                internalType: "uint256",
                name: "id",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "name",
                type: "string",
              },
              {
                internalType: "uint256",
                name: "price",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "manufacturerName",
                type: "string",
              },
              {
                internalType: "string",
                name: "manufacturerDetails",
                type: "string",
              },
              {
                internalType: "string",
                name: "longitude",
                type: "string",
              },
              {
                internalType: "string",
                name: "latitude",
                type: "string",
              },
              {
                internalType: "string",
                name: "category",
                type: "string",
              },
              {
                internalType: "address",
                name: "manufacturer",
                type: "address",
              },
              {
                internalType: "address",
                name: "logisticsPartner",
                type: "address",
              },
              {
                internalType: "address",
                name: "customer",
                type: "address",
              },
              {
                internalType: "string",
                name: "deliveryStatus",
                type: "string",
              },
              {
                internalType: "string",
                name: "certificateAuthority",
                type: "string",
              },
              {
                internalType: "string",
                name: "digitalSignature",
                type: "string",
              },
              {
                internalType: "string",
                name: "certificateDocHash",
                type: "string",
              },
              {
                internalType: "bool",
                name: "isCertified",
                type: "bool",
              },
            ],
            internalType: "struct ProductNewTrack.Product",
            name: "",
            type: "tuple",
          },
        ],
        stateMutability: "view",
        type: "function",
        constant: true,
      },
      {
        inputs: [],
        name: "getAllProductIds",
        outputs: [
          {
            internalType: "uint256[]",
            name: "",
            type: "uint256[]",
          },
        ],
        stateMutability: "view",
        type: "function",
        constant: true,
      },
    ];

  const pinata = new PinataSDK({
    pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjMWJjNTkwZS1mZTkzLTQ5NGItOGI3OC0wY2EyNGMyZDlkNWEiLCJlbWFpbCI6IjIwMjIuYXRoYXJ2YS5waGFkdGFyZUB2ZXMuYWMuaW4iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZTNjZmIwMzNiZTYzN2M5OGJmOWMiLCJzY29wZWRLZXlTZWNyZXQiOiJiMGI1NGRjNDJjNzQ5Y2FjMzk4MjkwY2RiNzUyMGUzMTdjZTVmM2QwYTljNzc1NmIyNDZhZjk3ODQ5N2YwNTZmIiwiZXhwIjoxNzY2NjY5NTUzfQ.TMH-iRepirf7f1Ei3OlywU_0pob13gLZXnbd-W4ZCyo",
    pinataGateway: "your-gateway.mypinata.cloud",
  });

  useEffect(() => {
    const initializeWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance); // Set web3 instance in state
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3Instance.eth.getAccounts();
          setAccount(accounts[0]);
          const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
          setContract(contractInstance);
          console.log("Web3 initialized successfully");
        } catch (error) {
          setStatusMessage("Error connecting to MetaMask");
          console.error("Error initializing web3:", error);
        }
      } else {
        setStatusMessage("MetaMask is not installed. Please install MetaMask and refresh the page.");
      }
    };
    initializeWeb3();
  }, []);
  

  const fetchProductDetails = async () => {
    if (!productId) {
      setStatusMessage("Please enter a valid product ID");
      return;
    }
    setLoading(true);
    try {
      const product = await contract.methods.getProduct(productId).call();
      setProductDetails(product);
      setStatusMessage("Product details fetched successfully");
    } catch (error) {
      setStatusMessage("Error fetching product details");
    }
    setLoading(false);
  };

  const signCertificateDetails = async () => {
    try {
      const message = `Product ID: ${productId}\nCertificate Provider: ${certificateProvider}`;
      const privateKey = "0x90b0f4cee2cc31645e677b5257a7c4fb42539f75effe5fd10d4ffb3b5bfabe05"; // Replace with the actual private key (store securely).
      const signature = web3.eth.accounts.sign(message, privateKey);
      setDigitalSignature(signature.signature);
    } catch (error) {
      console.error("Error signing certificate:", error);
      setStatusMessage("Error generating digital signature");
    }
  };

  const handleGeneratePDF = async () => {
    const doc = new jsPDF();

    // Add Product and Certificate details to the PDF
    doc.text(`Product Details:`, 10, 10);
    doc.text(`Product ID: ${productDetails.id}`, 10, 20);
    doc.text(`Name: ${productDetails.name}`, 10, 30);
    doc.text(`Price: ${productDetails.price}`, 10, 40);
    doc.text(`Manufacturer: ${productDetails.manufacturerName}`, 10, 50);
    doc.text(`Category: ${productDetails.category}`, 10, 60);
    doc.text(`Manufacturer Details: ${productDetails.manufacturerDetails}`, 10, 70);
    doc.text(`Certificate Authority: ${certificateProvider}`, 10, 80);
    doc.setFontSize(5);
    doc.text(`Digital Signature: ${digitalSignature}`, 10, 90);

    const pdfBlob = doc.output("blob");
    const file = new File([pdfBlob], "Certificate.pdf", { type: "application/pdf" });

    uploadToPinata(file);
  };

  const uploadToPinata = async (file) => {
    setLoading(true);
    try {
      const response = await pinata.upload.file(file);
      const uploadedDocHash = response.IpfsHash;
      setDocHash(uploadedDocHash);

      await contract.methods.certifyProduct(productId, certificateProvider, digitalSignature, uploadedDocHash).send({ from: account });
      setStatusMessage("Product certified successfully, document uploaded to IPFS");
    } catch (error) {
      console.error("Error uploading document:", error);
      setStatusMessage("Error uploading document to IPFS");
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="md" style={{ paddingTop: "20px" }}>
      <Typography variant="h4" gutterBottom align="center">
        Certificate Authority
      </Typography>
      <Box display="flex" justifyContent="center" flexDirection="column" gap={2}>
        <TextField
          label="Enter Product ID"
          variant="outlined"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          onClick={fetchProductDetails}
          disabled={loading}
          fullWidth
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Get Product Details"}
        </Button>

        {statusMessage && (
          <Alert severity={statusMessage.includes("success") ? "success" : "error"}>{statusMessage}</Alert>
        )}

        {productDetails && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Product Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Product ID:</strong> {productDetails.id}</Typography>
                  <Typography><strong>Name:</strong> {productDetails.name}</Typography>
                  <Typography><strong>Price:</strong> {productDetails.price}</Typography>
                  <Typography><strong>Manufacturer:</strong> {productDetails.manufacturerName}</Typography>
                  <Typography><strong>Category:</strong> {productDetails.category}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography><strong>Manufacturer Details:</strong> {productDetails.manufacturerDetails}</Typography>
                </Grid>
              </Grid>

              <TextField
                label="Certificate Provider"
                variant="outlined"
                value={certificateProvider}
                onChange={(e) => setCertificateProvider(e.target.value)}
                fullWidth
                margin="normal"
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={signCertificateDetails}
                fullWidth
                disabled={loading}
              >
                Generate Digital Signature
              </Button>

              {digitalSignature && (
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Digital Signature: {digitalSignature}
                </Typography>
              )}

              <Button
                variant="contained"
                color="secondary"
                onClick={handleGeneratePDF}
                fullWidth
                disabled={loading || !digitalSignature}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Generate PDF and Certify"}
              </Button>

              {docHash && (
                <Box mt={2}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${docHash}`, "_blank")}
                  >
                    View Certificate
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    style={{ marginLeft: "10px" }}
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = `https://gateway.pinata.cloud/ipfs/${docHash}`;
                      link.download = "Certificate.pdf";
                      link.click();
                    }}
                  >
                    Download Certificate
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default CertificateAuthority;
