import { app } from './app.js';
// import { openai_llm } from './llm/openai.js';

// openai_llm();

// console.log("LLM is Called");
app.on("error", (error) => {
    console.log("ERROR: ", error);
    throw error;
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`⚙️ Server is running at port: ${PORT}`);
});