import express from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dbConnect from "./utils/db.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/admin/categoryRoutes.js";
import agentRoutes from "./routes/dashboard/agentRoutes.js";
import boRoutes from "./routes/bo/boRoutes.js";

import { Server } from "socket.io";
import http from "http";
import boChatRoutes from "./routes/bo/boChatRoutes.js";
import sellerChatRoutes from "./routes/seller/sellerChatRoutes.js";

const server = http.createServer(app);

// app.use((req, res, next) => {
//   res.header(
//     "Access-Control-Allow-Origin",
//     "https://onboardai-five.vercel.app/"
//   ); // Your frontend URL
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Content-Type, Authorization, X-Requested-With"
//   );
//   next();
// });

app.use(
  cors({
    origin: ["https://onboardai-32df.onrender.com"], // Your frontend URL
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,Authorization",
  })
);

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

var allBO = [];
var allSeller = [];

const addBoUser = (boId, socketId, userInfo) => {
  const checkBoUser = allBO.some((u) => u.boId === boId);
  if (!checkBoUser) {
    allBO.push({
      boId,
      socketId,
      userInfo,
    });
  }
};

const addSeller = (sellerId, socketId, userInfo) => {
  const checkBoUser = allSeller.some((u) => u.sellerId === sellerId);
  if (!checkBoUser) {
    allSeller.push({
      sellerId,
      socketId,
      userInfo,
    });
  }
};

const findBO = (boId) => {
  return allBO.find((b) => b.boId === boId);
};

const findSeller = (sellerId) => {
  return allSeller.find((c) => c.sellerId === sellerId);
};

const remove = (socketId) => {
  allBO = allBO.filter((b) => b.socketId !== socketId);
};

io.on("connection", (soc) => {
  console.log("Socket server running...");

  soc.on("add_boUser", (boId, userInfo) => {
    addBoUser(boId, soc.id, userInfo);
    io.emit("activeSeller", allSeller);
  });

  soc.on("add_seller", (sellerId, userInfo) => {
    addSeller(sellerId, soc.id, userInfo);
    io.emit("activeSeller", allSeller);
  });

  soc.on("send_seller_message", (msg) => {
    const bo = findBO(msg.receiverId);
    if (bo !== undefined) {
      soc.to(bo.socketId).emit("seller_message", msg);
    }
  });

  soc.on("send_bo_message", (msg) => {
    const seller = findSeller(msg.receiverId);
    if (seller !== undefined) {
      soc.to(seller.socketId).emit("bo_message", msg);
    }
  });

  soc.on("disconnect", () => {
    // console.log("user disconnect");
    remove(soc.id);
    io.emit("activeSeller", allSeller);
  });
});

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api", authRoutes);
app.use("/api", categoryRoutes);
app.use("/api", agentRoutes);
app.use("/api", boRoutes);
app.use("/api", boChatRoutes);
app.use("/api", sellerChatRoutes);

app.get("/", (req, res) => res.send("My backend"));
const port = process.env.PORT;
dbConnect();
server.listen(port, () => console.log(`Server is running on port: ${port}`));
