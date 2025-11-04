const { Server } = require("socket.io")

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*", // Configure based on your needs
            methods: ["GET", "POST"]
        }
    })

    console.log("Initializing Sockets")
    io.on("connection", (socket) => {
        console.log("Connected : " + socket.id)

        socket.on("disconnect", () => {
            console.log("Disconnected : " + socket.id)
        })
    })

    return io;
}

module.exports = initializeSocket