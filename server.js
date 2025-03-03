/**
 * STEPS TO INTEGRATION
 *
 * 1. Look docs and get the class constructor and pass api_key as a argument
 * 2. Define a model with GoogleGenerativeAI instance add systemInstruction(optional)
 *
 *  - Take a input from user
 *  - Call the generativeContent and pass user input
 *  - Response will be this format - result.response.text()
 * */

import express, { response } from "express";
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

const app = express();
const port = process.env.PORT || 4001;

// take thi from:  https://ai.google.dev
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// and the api_key created from:  https://aistudio.google.com/
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  // !!!!  if want to add role or others this which follow and work for only us. !!!!
  systemInstruction:
    "You are a LLMs, your name is keepSeek, created by 'Jubayer Ahmed' a bangladeshi web developer. Your role is only explain Programming language JavaScript explain. If user ask you any other topic just say- 'Sorry,  I'm here only for helping JavaScript related question!' ",
});

// based on user input response will be true or false, if user input true then true : false
app.get("/trueOrFalse", async (req, res) => {
  const prompt = req.query?.prompt;

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Hey! are you weak now?" }],
      },
      {
        role: "user",
        parts: [{ text: "If i told you anything just" }],
      },
      {
        role: "model",
        parts: [{ text: "Hey! are you weak now?" }],
      },
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Hey! are you weak now?" }],
      },
    ],
  });

  const result = await chat.sendMessage(prompt);
  let response_from_gemini = result.response.text();

  res.send({ answer: response_from_gemini });
});

// get demo text response from gemini ai with it instance using query (prompt)
app.get("/chat-ai", async (req, res) => {
  const prompt = req.query?.prompt;

  if (!prompt) {
    return console.log(prompt);
  }

  const result = await model.generateContent(prompt);
  let response_from_gemini = result.response.text();

  res.send({ answer: response_from_gemini });
});

// Input a structured string and allow user to input a specific type of the data, than convert json to object
app.get("/generate-json", async (req, res) => {
  const prompt = req.query.prompt;

  if (!prompt) return;

  const finalPrompt = `generate some data from this prompt ${prompt}  using this JSON schema:
  data = {'datatype': output}
 Return: Array<object>`;

  const result = await model.generateContent(finalPrompt);
  const output = result.response.text().slice(7, -4); // remove extra symbols like (```)
  const jsonData = JSON.parse(output);

  res.send({ answer: jsonData });
});

// image to text ( image explanation from image link);
app.get("/image-details", async (req, res) => {
  const prompt = req.query.prompt;

  if (!prompt) return;

  // get user image buffer array using axios
  const response = await axios.get(prompt, { responseType: "arraybuffer" });
  // make image ai readable and convert sting base64 ( png format )
  const responseData = {
    inlineData: {
      data: Buffer.from(response.data).toString("base64"),
      mimeType: "image/png",
    },
  };
  // now send the response with input
  const result = await model.generateContent([
    "tell the detail of the image",
    responseData,
  ]);

  res.send({ answer: result });
});

// root route
app.get("/", (_, res) => {
  res.send("Ai demo server running...");
});

// Health checking..
app.get("/health", (_, res) => {
  res.send({ _id: "Ok", message: "Server health is ok." });
});

// listening the ai server
app.listen(port, () => {
  console.log(`Ai demo server running port on: ${port}`);
});
