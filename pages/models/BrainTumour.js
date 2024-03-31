import React, { useState, useEffect } from 'react';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
const { CohereClient } = require('cohere-ai');

const cohere = new CohereClient({
  token: '4bvLxFQCnCd8dyzwsxRnhu4QUnnsq1EMn5F6dauI', // Replace <<apiKey>> with your actual CoHere API key
});

const BrainTumour = () => {
  // State variables
  const [selectedFile, setSelectedFile] = useState(null);
  const [outputResult, setOutputResult] = useState("");
  const [outputStyle, setOutputStyle] = useState({});
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [generatedText, setGeneratedText] = useState("Wait for generating the response"); // Initial state

  // Function to handle file change
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    // Display the uploaded image
    const imageUrl = URL.createObjectURL(file);
    setUploadedImageUrl(imageUrl);
  };

  // Function to handle file upload and text generation
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please choose a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://127.0.0.1:5002/predict-brain-tumour", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setOutputResult(result.predicted_label);

      // Apply styles based on the result
      setOutputStyle({
        color: result.predicted_label === "Tumour Detected" ? "Red" : "Green",
      });

      // Generate text using CoHere based on the result
      const generateResponse = await cohere.generate({
        prompt: `Start with : Hello, I am MediMate. and ${result.predicted_label} what are the next steps typically taken?`,
      });

      // Extract the generated text from the CoHere response
      const { text } = generateResponse.generations[0];

      // Set the generated text or a message if no text is generated
      setGeneratedText(text || "No advice generated for this condition.");
    } catch (error) {
      console.error("Error detecting brain tumour:", error);
      setOutputResult("Error detecting brain tumour. Please try again.");
      setOutputStyle({
        color: "black",
      });
    }
  };

  // Effect to log generatedText when it changes
  useEffect(() => {
    console.log("Generated Text:", generatedText);
  }, [generatedText]);

  return (
    <>
      {/* Header */}
      <Header />

      {/* Main content */}
      <div className="bg-gray-100 p-8 pt-24 flex flex-col items-center" style={{ minHeight: "100vh" }}>
        <h1 className="text-4xl font-bold mb-4 text-green-800">Brain Tumour Detection</h1>
        
        {/* Input Section */}
        <div style={{ backgroundColor: "#fff" }} className="p-8 mb-8 rounded-md shadow-md flex items-center">
          {/* File input and upload button */}
          <div className="mr-8">
            <h2 className="text-2xl font-semibold mb-4">Upload Image</h2>
            <label htmlFor="fileInput" className="bg-green-500 text-white px-4 py-2 rounded-md cursor-pointer">
              Choose File
            </label>
            <input
              type="file"
              id="fileInput"
              className="hidden"
              onChange={handleFileChange}
            />
            <button className="bg-gray-500 text-white px-4 py-2 rounded-md ml-4" onClick={handleUpload}>
              Detect Tumour
            </button>
          </div>
          
          {/* Display uploaded image */}
          {uploadedImageUrl && (
            <div>
              <img src={uploadedImageUrl} alt="Uploaded" className="max-h-64 max-w-64" />
            </div>
          )}
        </div>
        
        {/* Output Section */}
        <div style={{ backgroundColor: "#fff", width: "1000px", height: "200px" }} className="p-8 rounded-md shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Results</h2>
          <p>
            <strong>Condition:</strong> <span style={outputStyle}>{outputResult}</span>
          </p>
        </div>

        {/* Generated Text Section */}
        <div style={{ backgroundColor: "#fff", width: "1000px", minHeight: "200px", marginTop: "20px", overflow: "auto", wordWrap: "break-word", fontSize: "14px", wordWrap: "break-word" }} className="p-8 rounded-md shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Response from MediMate</h2>
          <pre>{generatedText}</pre>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </>
  );
};

export default BrainTumour;