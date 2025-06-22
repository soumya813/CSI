//ORIGINAL CALLBACK BASED CODE
// const fs = require('fs');

// function readFileCallback(filePath) {
//   fs.readFile(filePath, 'utf8', (err, data) => {
//     if (err) {
//       console.error('Error reading file:', err);
//       return;
//     }
//     console.log('File contents:', data);
//   });
// }

// readFileCallback('./example.txt');


//WITH PROMISES ASYNC/AWAIT
const fs = require('fs').promises;

async function readFileAsync(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    console.log('File contents:', data);
  } catch (err) {
    console.error('Error reading file:', err);
  }
}

readFileAsync('./example.txt');
