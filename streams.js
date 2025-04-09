import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, 'uploads', 'Book 1(Sheet1) (1).csv');

const readStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
const rl = readline.createInterface({ input: readStream });
let headers = [];
const validUsers = [];
const invalidUsers = [];

rl.on('line',(line)=>{
    const values=line.split(",");
    console.log(values)
    if (!headers.length) {
        headers = values;
        return;
    }
    const user = Object.fromEntries(headers.map((key, i) => [key.trim(), values[i]?.trim()]));
    if (user.Email.includes('@')) {
        validUsers.push(user);
      } else {
        invalidUsers.push(user);
      }
    })

readStream.on('data', (chunk) => {
    console.log('🔹 Received Chunk:', chunk);
});

rl.on('close', () => {
    console.log('✅ Finished Processing File');
    console.log('Valid Users:', validUsers);
    console.log('Invalid Users (Missing/Wrong Emails):', invalidUsers);
  });
  
readStream.on('error', (error) => {
  console.error('❌ Error:', error);
});
