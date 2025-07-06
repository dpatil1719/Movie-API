// Import the necessary built-in modules
const http = require('http');  // to create the server
const url = require('url');    // to parse the URL
const fs = require('fs');      // to read files
const path = require('path');  // to handle file paths correctly

// Create the HTTP server
const server = http.createServer((request, response) => {

     // ----------- NEW LOGGING CODE STARTS HERE -----------
  const timestamp = new Date().toISOString(); // Current date & time
  const logMessage = `${timestamp} - Requested URL: ${request.url}\n`; // Example: 2025-07-05T23:00:00.000Z - Requested URL: /documentation

  // Append the log message to log.txt
  fs.appendFile('log.txt', logMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
  // ----------- NEW LOGGING CODE ENDS HERE -------------

  
  // Parse the request URL
  const parsedUrl = url.parse(request.url, true);

  // Check if the pathname contains 'documentation'
  let filePath;
  if (parsedUrl.pathname.includes('documentation')) {
    filePath = path.join(__dirname, 'documentation.html');
  } else {
    filePath = path.join(__dirname, 'index.html');
  }

  // Read and serve the chosen file
  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end('404 - File Not Found');
    } else {
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end(data);
    }
  });
});

// Start the server on port 8080
server.listen(8080, () => {
  console.log('Server is running on http://localhost:8080/');
});
