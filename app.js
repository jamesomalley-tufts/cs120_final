//Functional imports
import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';

// Set up for LLM w/ API KEY
import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Environment variable, don't paste the full key directly here
});



const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'my_documents.html'));
});
// https://socket.io/docs/v4/tutorial
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('chat message', async (msg) => {
    console.log('message:' + msg);
    io.emit('chat message', msg);

    try {
      const response = await openai.responses.create({
        model: 'gpt-4.1',
        input: msg
      });
      console.log('Full LLM Response:', JSON.stringify(response, null, 2));

        if (response) {
          io.emit('chat message', response.output_text); // Emit LLM's response
          console.log('LLM response sent:', response.output_text);
        } else {
          io.emit('chat message', "The AI didn't provide a valid text response.");
        }

      //io.emit('chat message', response.text());
      //console.log('LLM response', response.text())
      } catch (error) {
      console.error("Error generating content" + error);
      console.error("Result object on error:", JSON.stringify(result, null, 2)); // Log the result even in error
      io.emit('chat message',"Error processing your request.")
    }
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  })
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});








//var query = "Explain how machine learning works in a few words";


//async function main() {
  //const response = await ai.models.generateContent({
    //model: "gemini-2.0-flash",
    //contents: query,
  //});
  //console.log(response.text);
//}

//await main();
