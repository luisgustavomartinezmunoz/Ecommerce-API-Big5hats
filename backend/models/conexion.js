import mongoose from "mongoose";

const MONGO_URI = "mongodb://localhost:27017/big5hats";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error de conexión a MongoDB:"));
db.once("open", () => {
    console.log("Conectado a MongoDB");
});

export default mongoose;
