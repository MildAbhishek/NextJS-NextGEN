import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}


const connection: ConnectionObject = {}

// return type will be promise,does not matter of type
async function dbConnect(): Promise<void> {
    if(connection.isConnected) {
        console.log('Already Connnected to DB')
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '', {});

        // console.log(db);

        connection.isConnected = db.connections[0].readyState

        console.log('DB Connected Successfully')
    } catch (error) {
        
        console.log("DB Connection Failed", error)

        process.exit(1)
    }
}

export default dbConnect;