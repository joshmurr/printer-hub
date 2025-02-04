// Replace this with your actual server IP/hostname
const SERVER_URL = 'http://192.168.1.21:3001';

async function sendToPrinter(command) {
  const statusDiv = document.getElementById('status');
  try {
    console.log('Sending command:', command);
    statusDiv.textContent = 'Sending print command...';

    const response = await fetch(`${SERVER_URL}/print`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: command,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.text();
    console.log('Server response:', result);
    statusDiv.textContent = 'Print command sent successfully';
  } catch (error) {
    console.error('Full error:', error);
    statusDiv.textContent = `Error: ${error.message}`;
    statusDiv.className = 'error';
  }
}

async function printText() {
  const text = document.getElementById('printText').value;
  if (!text) {
    alert('Please enter some text to print');
    return;
  }
  const command = '\x1B\x40' + text + '\x0A\x1D\x56\x41';
  await sendToPrinter(command);
}

async function printTest() {
  const command = '\x1B\x40\x1B\x21\x00Test Print\x0A\x1D\x56\x41';
  await sendToPrinter(command);
}

async function feedAndCut() {
  const command = '\x1B\x40\x0A\x0A\x0A\x0A\x1D\x56\x41';
  await sendToPrinter(command);
}
