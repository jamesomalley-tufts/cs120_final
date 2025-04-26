//Functional imports
import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import fs from "fs";


// Set up for LLM w/ API KEY
//import { Document } from "@langchain/core/documents";
//import { ChatOpenAI } from "@langchain/openai";
//import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Environment variable, don't paste the full key directly here
});

//Trying the file upload info https://platform.openai.com/docs/guides/pdf-file
const file = await client.files.create({
    file: fs.createReadStream("doc2.pdf"),
    purpose: "user_data",
});

// Core chat components https://socket.io/docs/v4/tutorial
const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'my_documents.html'));
});
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('chat message', async (msg) => {
    console.log('message:' + msg);
    io.emit('chat message', msg);

    try {
      // File input
      const response = await client.responses.create({
        model: 'gpt-4o-mini',
        input : [
          {
            role: 'user',
            content: [
              {
                type: 'input_file',
                file_id: file.id,
              },
              {
                type: 'input_text',
                text: msg,
              },
            ],
          },
        ],
      });

      console.log(response.output_text);
      // Standard input
      //const response = await client.responses.create({
        //model: 'gpt-4.1',
        //input: msg
      //});
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
