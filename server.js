import express, { response } from "express";
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const port = process.env.PORT || 4001;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  //   systemInstruction:
  //     "Detect the user input is it true or false. and you are a rabbit!",
});

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

app.get("/test-ai", async (req, res) => {
  const prompt = req.query?.prompt;

  if (!prompt) {
    return console.log(prompt);
  }

  const result = await model.generateContent(prompt);
  let response_from_gemini = result.response.text();

  res.send({ answer: response_from_gemini });
});

app.get("/generate-json", async (req, res) => {
  const modifiedPrompt = `List a few popular cookie recipes using this JSON schema:

  Recipe = {'recipeName': string}
  Return: Array<Recipe>`;

  const result = await model.generateContent(modifiedPrompt);

  let response_from_gemini = result.response.text();

  res.send({ answer: JSON.parse(response_from_gemini) });
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
