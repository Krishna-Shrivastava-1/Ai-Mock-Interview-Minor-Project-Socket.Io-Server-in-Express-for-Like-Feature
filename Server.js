import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import axios from 'axios'
const port = 5500 || process.env.PORT
const app = express()
app.use(cors())
app.use(express.json())
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:3000','https://skillsync-ebon.vercel.app'],
        methods: ['POST', 'GET', "PUT"]
    }
})

io.on('connection', (socket) => {
    console.log("User connected:", socket.id)

    socket.on("likePost", async ({ postId, userId }) => {
        try {
            console.log('postId',postId)
            console.log('userId',userId)
            // Call Next.js API
            const response = await axios.put("https://skillsync-ebon.vercel.app/api/post/addlikeanddislike", {
                userId: userId,
                postId: postId
            });

            const updatedPost = response?.data

            // Emit updated post to all clients
            io.emit("postLiked", updatedPost);

        } catch (err) {
            console.error("Error liking post:", err);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
})

app.get("/", (req, res) => {
    res.send("Backend is running...");
});

httpServer.listen(port, () => {
    console.log(`Server is listen on port - ${port}`)
})