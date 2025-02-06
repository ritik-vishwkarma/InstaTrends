import { app } from './app.js';

app.on("error", (error) => {
    console.log("ERROR: ", error);
    throw error;
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`⚙️ Server is running at port: ${PORT}`);
});