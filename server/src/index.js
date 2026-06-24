const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const http = require("http");
const { Server } = require("socket.io");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "dinaflow-secret-super-safe";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }
});
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Helper to extract User ID from JWT Token
const getUserId = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded.userId;
    } catch (err) {
      throw new Error("Unauthorized: Invalid token");
    }
  }
  return req.headers["x-user-id"] || "demo-user-1"; // Fallback for backward compatibility during transition
};

// ----------------------------------------------------------------------
// AI ADVISOR (SAAS LLM INTEGRATION)
// ----------------------------------------------------------------------
app.post("/api/ai/generate", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { context } = req.body;

    // [SAAS INTEGRATION]: OpenRouter API
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (apiKey) {
      try {
        const prompt = `Bạn là chuyên gia cố vấn năng suất DinaFlow. 
Dữ liệu học tập hiện tại: ${JSON.stringify(context)}. 
Nhiệm vụ: Dựa vào dữ liệu trên, hãy phân tích thật kỹ lưỡng và đưa ra lời khuyên theo cấu trúc 2 phần rõ ràng:
- 📊 PHÂN TÍCH CHIẾN LƯỢC: Nhận xét chuyên sâu về sức bền, tốc độ, mức độ căng thẳng hoặc sự trì hoãn dựa trên số liệu.
- 💡 KẾ HOẠCH AI: Đề xuất một chiến thuật cụ thể (vd: Pomodoro 50/10, Batching tác vụ, Deep Work, Micro-steps, vươn vai...).
Yêu cầu: Viết tự nhiên, truyền cảm hứng, và phải luôn có góc nhìn hoặc cách diễn đạt mới mẻ mỗi lần tôi hỏi. (Seed ngẫu nhiên: ${Math.random()})`;
        
        // Dùng fetch mặc định của Node.js >= 18
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173", 
            "X-Title": "DinaFlow",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-free", // Có thể đổi sang anthropic/claude-3-haiku
            messages: [{ role: "user", content: prompt }]
          })
        });

        const aiData = await response.json();
        if (aiData.choices && aiData.choices.length > 0) {
          return res.json({ advice: aiData.choices[0].message.content });
        }
      } catch (err) {
        console.error("OpenRouter API Error:", err);
        // Fallback xuống dưới nếu lỗi API
      }
    }

    // FALLBACK: IF/ELSE CHI TIẾT NHƯ CŨ KHI KHÔNG CÓ API KEY
    await new Promise(r => setTimeout(r, 800)); // Simulate Latency

    let advice = "🤖 ĐÁNH GIÁ TỪ AI: Trạng thái tinh thần của bạn đang rất tuyệt vời! Đây là thời điểm vàng để giải quyết các nhiệm vụ quan trọng. Hãy lên danh sách và chinh phục chúng nhé!";
    
    if (context.timerRunning) {
      advice = "Trí tuệ nhân tạo nhận thấy bạn đang trong phiên Flow. Hãy gác lại mọi thứ, tắt các tab không cần thiết và tập trung tuyệt đối. Bạn đang làm rất tốt! 🚀";
    } else if (context.burnoutRisk > 75) {
      advice = "🚨 CẢNH BÁO TỪ AI: Mức độ căng thẳng của bạn đang ở mức RẤT CAO. Tiếp tục làm việc lúc này sẽ làm giảm 40% hiệu suất.\n\nĐề xuất: Hãy đứng dậy, uống một cốc nước và nghỉ ngơi ít nhất 15 phút ngay bây giờ!";
    } else if (context.burnoutRisk > 40) {
      advice = "💡 ĐÁNH GIÁ THỂ TRẠNG: Bạn đã làm việc một thời gian khá dài. Bộ não cần một khoảng nghỉ ngắn để nạp lại năng lượng.\n\nĐề xuất: Hãy thử một bài tập vươn vai nhẹ nhàng nhé!";
    } else if (context.flowStreak >= 2 && context.totalMinutes > 60) {
      advice = `📊 PHÂN TÍCH CHIẾN LƯỢC: Dữ liệu cho thấy bạn có sức bền rất tốt với chuỗi ${context.flowStreak} ngày duy trì Flow và thời gian tập trung lớn hôm nay.\n\n💡 Kế hoạch AI: Bạn đang ở đỉnh cao phong độ! Hãy thử nâng cấp lên phương pháp Pomodoro 50/10 (Deep Work) thay vì 25/5 thông thường. Ưu tiên "ăn con ếch" (làm việc khó nhất) vào đầu phiên nhé!`;
    } else if (context.completedCount >= 3 && context.totalMinutes <= 60 && context.totalMinutes > 0) {
      advice = `📊 PHÂN TÍCH CHIẾN LƯỢC: Tốc độ xử lý của bạn cực kỳ đáng nể! Bạn đã giải quyết gọn ${context.completedCount} nhiệm vụ trong thời gian ngắn.\n\n💡 Kế hoạch AI: Bạn rất giỏi xử lý việc nhỏ. Hãy áp dụng chiến thuật "Batching": Gộp toàn bộ việc vặt vào một khung giờ 30 phút, sau đó dành riêng một khối thời gian lớn không xao nhãng cho một dự án cốt lõi!`;
    } else if (context.completedCount === 0 && context.totalMinutes === 0) {
      advice = "🌟 GỢI Ý KẾ HOẠCH: Khởi đầu luôn là bước khó nhất. Khối lượng công việc lớn có thể khiến não bộ trì hoãn.\n\n💡 Kế hoạch AI: Hãy chia nhỏ nhiệm vụ lớn nhất của bạn thành 3 bước siêu nhỏ (Micro-steps). Chọn bước đầu tiên, bấm nút đồng hồ và bắt đầu ngay trong 5 giây tới!";
    }

    res.json({ advice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// PARTNER INVITATIONS
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------------------------
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password, gender } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: "Missing required fields" });

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });
    if (existingUser) return res.status(400).json({ error: "Username or Email already exists" });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password_hash,
        gender: gender || "male",
        dopa_balance: 230,
        baseline_energy: 100
      }
    });

    await prisma.reward.createMany({
      data: demoRewards.map((reward) => ({
        user_id: user.id, ...reward,
      })),
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, gender: user.gender } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findFirst({
      where: { OR: [{ username }, { email: username }] }
    });
    if (!user) return res.status(400).json({ error: "User not found" });

    // Handle old hardcoded hashes for demo users
    const validPassword = user.password_hash === "hash" ? password === "123456" : await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, gender: user.gender } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Setup Socket.IO for Real-time Partner Sync
io.on("connection", (socket) => {
  let userId = socket.handshake.query.userId;
  const token = socket.handshake.query.token;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.userId;
    } catch (e) {
      console.log("Socket auth failed");
    }
  }

  if (userId) {
    socket.join(userId);
    console.log(`User ${userId} joined room for Socket sync`);
  }

  socket.on("timer_action", async (data) => {
    const { partnerId, action, taskTitle } = data; // action: 'started', 'stopped'
    if (userId) {
       const newStatus = action === "started" ? "flowing" : "online";
       await prisma.user.update({ where: { id: userId }, data: { activity_status: newStatus } });
    }
    if (partnerId) {
      io.to(partnerId).emit("partner_timer_action", { action, taskTitle });
    }
  });
  
  socket.on("partner_rescue", async (data) => {
    const { partnerId, points } = data;
    if (partnerId) {
      io.to(partnerId).emit("partner_rescued", { points });
    }
  });

  socket.on("send_heart", (data) => {
    const { partnerId } = data;
    if (partnerId) {
      io.to(partnerId).emit("receive_heart");
    }
  });

  socket.on("send_message", (data) => {
    const { partnerId, message } = data;
    if (partnerId) {
      io.to(partnerId).emit("receive_message", { message });
    }
  });

  socket.on("focus_changed", (data) => {
    const { partnerId, status } = data; // status: 'away', 'active'
    if (partnerId) {
      io.to(partnerId).emit("partner_focus_changed", { status });
    }
  });

  socket.on("join_arena", (roomId) => {
    if (roomId) socket.join(`room_${roomId}`);
  });

  socket.on("leave_arena", (roomId) => {
    if (roomId) socket.leave(`room_${roomId}`);
  });
});

const demoRewards = [
  { reward_name: "Uống trà sữa", dopa_cost: 120, icon_key: "coffee" },
  { reward_name: "Xem phim Hàn", dopa_cost: 150, icon_key: "headphones" },
  { reward_name: "Mua bút mới", dopa_cost: 200, icon_key: "pen" },
  { reward_name: "Chơi game", dopa_cost: 150, icon_key: "gamepad" },
];

// Helper to ensure demo user and starter rewards exist
async function ensureDemoData() {
  const user1 = await prisma.user.findUnique({ where: { id: "demo-user-1" } });
  if (!user1) {
    await prisma.user.create({
      data: {
        id: "demo-user-1",
        username: "Shinichi",
        email: "shinichi@dinaflow.app",
        password_hash: "hash",
        dopa_balance: 230,
        partner_id: "demo-user-2"
      },
    });
  }

  const user2 = await prisma.user.findUnique({ where: { id: "demo-user-2" } });
  if (!user2) {
    await prisma.user.create({
      data: {
        id: "demo-user-2",
        username: "Ran",
        email: "ran@dinaflow.app",
        password_hash: "hash",
        dopa_balance: 230,
        partner_id: "demo-user-1"
      },
    });
  }

  for (const uid of ["demo-user-1", "demo-user-2"]) {
    const count = await prisma.reward.count({ where: { user_id: uid } });
    if (count === 0) {
      await prisma.reward.createMany({
        data: demoRewards.map((reward) => ({
          user_id: uid, ...reward,
        })),
      });
    }
  }
}

// Mappers to match frontend expectations
const mapTask = (t) => ({ id: t.id, title: t.title, category: t.category, duration: t.duration_minutes, reward: t.reward_dopa, status: t.status });
const mapReward = (r) => ({ id: r.id, name: r.reward_name, cost: r.dopa_cost, iconKey: r.icon_key, redeemed: r.is_redeemed });
const mapLog = (l) => ({ id: l.id, type: l.hormone_type, activity: l.activity_name, points: l.points_earned, time: l.created_at });

// ----------------------------------------------------------------------
// GET DASHBOARD SUMMARY
// ----------------------------------------------------------------------
app.get("/api/dashboard", async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tasks: { orderBy: { created_at: "desc" } },
        rewards: { orderBy: { created_at: "desc" } },
        logs: { orderBy: { created_at: "desc" } },
        room: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    let partnerInfo = null;
    if (user.partner_id) {
      const partner = await prisma.user.findUnique({ where: { id: user.partner_id } });
      if (partner) {
        partnerInfo = { id: partner.id, username: partner.username, gender: partner.gender, flowStreak: partner.flow_streak || 0 };
      }
    }

    const friendRequests = await prisma.friendship.findMany({ where: { friend_id: userId, status: "pending" }, include: { user: { select: { username: true } } } });
    const partnerRequests = await prisma.partnerInvitation.findMany({ where: { invitee_id: userId, status: "pending" }, include: { inviter: { select: { username: true } } } });
    const roomRequests = await prisma.roomInvitation.findMany({ where: { invitee_id: userId, status: "pending" }, include: { inviter: { select: { username: true } } } });

    const notifications = [
      ...friendRequests.map(r => ({ id: r.id, type: "friend", message: `${r.user.username} muốn kết bạn` })),
      ...partnerRequests.map(r => ({ id: r.id, type: "partner", message: `${r.inviter.username} mời hẹn hò` })),
      ...roomRequests.map(r => ({ id: r.id, type: "room", message: `${r.inviter.username} mời vào phòng` })),
    ];
    const notificationsCount = notifications.length;

    res.json({
      user: { id: user.id, username: user.username, gender: user.gender, partner_id: user.partner_id },
      room: user.room ? { id: user.room.id, type: user.room.type } : null,
      balance: user.dopa_balance,
      flowStreak: user.flow_streak || 0,
      lastFlowTime: user.last_flow_time,
      partner: partnerInfo,
      tasks: user.tasks.map(mapTask),
      rewards: user.rewards.map(mapReward),
      logs: user.logs.map(mapLog),
      notificationsCount,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// LEADERBOARD (XẾP HẠNG)
// ----------------------------------------------------------------------
app.get("/api/leaderboard", async (req, res) => {
  try {
    const userId = getUserId(req);

    // Global
    const globalUsers = await prisma.user.findMany({
      select: { id: true, username: true, gender: true, flow_streak: true, dopa_balance: true },
      orderBy: [
        { flow_streak: "desc" },
        { dopa_balance: "desc" }
      ],
      take: 50
    });

    // Friends
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { user_id: userId, status: "accepted" },
          { friend_id: userId, status: "accepted" }
        ]
      },
      include: {
        user: true,
        friend: true
      }
    });

    const friendIds = friendships.map(f => f.user_id === userId ? f.friend_id : f.user_id);
    friendIds.push(userId); // include self

    const friendUsers = await prisma.user.findMany({
      where: { id: { in: friendIds } },
      select: { id: true, username: true, gender: true, flow_streak: true, dopa_balance: true },
      orderBy: [
        { flow_streak: "desc" },
        { dopa_balance: "desc" }
      ]
    });

    res.json({ global: globalUsers, friends: friendUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// FRIENDS (BẠN BÈ)
// ----------------------------------------------------------------------

// 1. Lấy danh sách bạn bè và lời mời kết bạn
app.get("/api/friends", async (req, res) => {
  try {
    const userId = getUserId(req);
    
    // Bạn bè (đã được accept)
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { user_id: userId, status: "accepted" },
          { friend_id: userId, status: "accepted" }
        ]
      },
      include: {
        user: true,
        friend: true
      }
    });
    
    const friendsList = friendships.map(f => {
      const isSender = f.user_id === userId;
      const targetUser = isSender ? f.friend : f.user;
      return {
        id: targetUser.id,
        username: targetUser.username,
        gender: targetUser.gender,
        flowStreak: targetUser.flow_streak,
        lastFlowTime: targetUser.last_flow_time,
        partnerId: targetUser.partner_id,
        activityStatus: targetUser.activity_status,
        friendshipId: f.id
      };
    });

    // Lời mời kết bạn (gửi cho mình và đang chờ)
    const requests = await prisma.friendship.findMany({
      where: { friend_id: userId, status: "pending" },
      include: { user: true }
    });
    
    const pendingRequests = requests.map(r => ({
      friendshipId: r.id,
      senderId: r.user.id,
      senderName: r.user.username,
      senderGender: r.user.gender
    }));

    res.json({ friends: friendsList, pendingRequests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// User Profile (Public/Friends)
// ==========================================
app.get("/api/users/:id/profile", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        gender: true,
        flow_streak: true,
        partner_id: true,
        activity_status: true,
        dopa_balance: true,
        last_flow_time: true
      }
    });

    if (!user) return res.status(404).json({ error: "Không tìm thấy người dùng" });

    // Privacy-protected aggregation: Only count total tasks and total minutes
    const tasksAggr = await prisma.microTask.aggregate({
      where: { user_id: id, status: "done" },
      _count: { id: true },
      _sum: { duration_minutes: true }
    });

    const total_tasks = tasksAggr._count.id || 0;
    const total_minutes = tasksAggr._sum.duration_minutes || 0;
    
    // Simulate a cortisol level for the profile based on tasks and balance
    user.cortisol_level = Math.max(12, Math.min(88, total_tasks * 5 + 24 - Math.floor((user.dopa_balance || 0) / 10)));

    res.json({ 
      success: true, 
      user, 
      stats: {
        total_tasks,
        total_minutes
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Tìm kiếm người dùng để kết bạn
app.get("/api/users/search", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);

    const users = await prisma.user.findMany({
      where: {
        username: { contains: q },
        id: { not: userId }
      },
      take: 10
    });

    res.json(users.map(u => ({ id: u.id, username: u.username, gender: u.gender })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Gửi lời mời kết bạn
app.post("/api/friends/request", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { targetUserId } = req.body;
    
    if (userId === targetUserId) return res.status(400).json({ error: "Không thể tự kết bạn với chính mình" });

    // Kiểm tra xem đã có chưa
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user_id: userId, friend_id: targetUserId },
          { user_id: targetUserId, friend_id: userId }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ error: "Đã có lời mời kết bạn hoặc đã là bạn bè." });
    }

    const friendship = await prisma.friendship.create({
      data: {
        user_id: userId,
        friend_id: targetUserId,
        status: "pending"
      }
    });

    res.json({ message: "Đã gửi lời mời", friendship });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Chấp nhận/Từ chối lời mời
app.post("/api/friends/accept", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { friendshipId, action } = req.body; // action: 'accept' or 'reject'

    const friendship = await prisma.friendship.findUnique({ where: { id: friendshipId } });
    if (!friendship || friendship.friend_id !== userId) {
      return res.status(404).json({ error: "Không tìm thấy lời mời." });
    }

    if (action === "accept") {
      await prisma.friendship.update({
        where: { id: friendshipId },
        data: { status: "accepted" }
      });
      res.json({ message: "Đã chấp nhận kết bạn." });
    } else {
      await prisma.friendship.delete({
        where: { id: friendshipId }
      });
      res.json({ message: "Đã từ chối lời mời." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// TASKS
// ----------------------------------------------------------------------
app.post("/api/tasks", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { title, category, duration, reward } = req.body;
    const task = await prisma.microTask.create({
      data: {
        user_id: userId,
        title,
        category: category || "Work",
        duration_minutes: Number(duration),
        reward_dopa: Number(reward),
        status: "pending",
      },
    });
    res.json(mapTask(task));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/tasks/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    
    // Check task
    const task = await prisma.microTask.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: "Task not found" });
    if (task.status === "done") return res.status(400).json({ error: "Already completed" });

    // Calculate streak and multiplier
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const now = new Date();
    
    let newStreak = user.flow_streak || 0;
    // Cooldown is 15 minutes
    if (user.last_flow_time && (now.getTime() - new Date(user.last_flow_time).getTime()) <= 15 * 60 * 1000) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    let multiplier = 1.0;
    if (newStreak === 2) multiplier = 1.2;
    if (newStreak === 3) multiplier = 1.5;
    if (newStreak >= 4) multiplier = 2.0;

    const finalReward = Math.round(task.reward_dopa * multiplier);

    const transactions = [
      prisma.microTask.update({
        where: { id },
        data: { status: "done", completed_at: now }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { 
          dopa_balance: { increment: finalReward },
          room_progress: { increment: task.duration_minutes || 0 },
          flow_streak: newStreak,
          last_flow_time: now
        }
      })
    ];

    if (user.partner_id) {
      transactions.push(
        prisma.user.update({
          where: { id: user.partner_id },
          data: { dopa_balance: { increment: finalReward } }
        })
      );
    }

    const results = await prisma.$transaction(transactions);
    const updatedTask = results[0];
    const updatedUser = results[1];

    if (user.partner_id) {
      io.to(user.partner_id).emit("wallet_updated", { added: finalReward, reason: "task_completed" });
    }
    
    if (user.room_id) {
      io.to(`room_${user.room_id}`).emit("arena_update");
    }

    res.json({ 
      task: mapTask(updatedTask), 
      newBalance: updatedUser.dopa_balance,
      flowStreak: updatedUser.flow_streak,
      lastFlowTime: updatedUser.last_flow_time,
      earned: finalReward,
      multiplier: multiplier
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// REWARDS
// ----------------------------------------------------------------------
app.post("/api/rewards", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { name, cost, iconKey } = req.body;
    const reward = await prisma.reward.create({
      data: {
        user_id: userId,
        reward_name: name,
        dopa_cost: Number(cost),
        icon_key: iconKey || "gift",
      },
    });
    res.json(mapReward(reward));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/rewards/:id/redeem", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    
    // Fetch reward and user balance
    const reward = await prisma.reward.findUnique({ where: { id } });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!reward) return res.status(404).json({ error: "Reward not found" });
    if (reward.is_redeemed) return res.status(400).json({ error: "Already redeemed" });
    if (user.dopa_balance < reward.dopa_cost) return res.status(400).json({ error: "Insufficient coins" });

    // Redeem atomically
    const transactions = [
      prisma.reward.update({
        where: { id },
        data: { is_redeemed: true, redeemed_at: new Date() }
      }),
      prisma.user.update({
        where: { id: userId },
        data: { dopa_balance: { decrement: reward.dopa_cost } }
      })
    ];

    if (user.partner_id) {
      transactions.push(
        prisma.user.update({
          where: { id: user.partner_id },
          data: { dopa_balance: { decrement: reward.dopa_cost } }
        })
      );
    }

    const results = await prisma.$transaction(transactions);
    const updatedReward = results[0];
    const updatedUser = results[1];

    if (user.partner_id) {
      io.to(user.partner_id).emit("wallet_updated", { added: -reward.dopa_cost, reason: "reward_redeemed" });
    }

    res.json({ reward: mapReward(updatedReward), newBalance: updatedUser.dopa_balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------
// BIO LOGS
// ----------------------------------------------------------------------
app.post("/api/logs", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { type, activity, points } = req.body;
    const log = await prisma.bioLog.create({
      data: {
        user_id: userId,
        hormone_type: type,
        activity_name: activity,
        points_earned: Number(points),
      },
    });
    await prisma.user.update({
      where: { id: userId },
      data: { activity_status: "resting" }
    });
    res.json(mapLog(log));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// ----------------------------------------------------------------------
// ROOMS (ARENA)
// ----------------------------------------------------------------------
function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

app.post("/api/rooms", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { name, type } = req.body;
    if (!name) return res.status(400).json({ error: "Room name required" });
    
    // Check if user is already in a room
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.room_id) {
      return res.status(400).json({ error: "Bạn đã ở trong một phòng thi đua rồi. Vui lòng rời phòng cũ trước." });
    }

    let code = generateRoomCode();
    // Ensure uniqueness (simple retry)
    while (await prisma.room.findUnique({ where: { code } })) {
      code = generateRoomCode();
    }

    const room = await prisma.room.create({
      data: {
        code,
        name: name || "Phòng Thi Đua",
        type: type || "group",
        users: {
          connect: { id: userId }
        }
      }
    });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/rooms/join", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { code } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.room_id) {
      return res.status(400).json({ error: "Bạn đã ở trong một phòng thi đua rồi." });
    }

    const room = await prisma.room.findUnique({ 
      where: { code: code.toUpperCase() },
      include: { _count: { select: { users: true } } }
    });
    if (!room) {
      return res.status(404).json({ error: "Mã phòng không tồn tại." });
    }

    if (room.type === "couple" && room._count.users >= 2) {
      return res.status(400).json({ error: "Phòng Couple đã đủ 2 người." });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { room_id: room.id }
    });
    
    // Notify room
    io.to(`room_${room.id}`).emit("arena_update");

    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/rooms/leave", async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user.room_id) return res.json({ success: true });

    const roomId = user.room_id;

    await prisma.user.update({
      where: { id: userId },
      data: { room_id: null }
    });

    io.to(`room_${roomId}`).emit("arena_update");
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PARTNER INVITATIONS ---

app.post("/api/partners/invite", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { targetUserId } = req.body;
    if (!targetUserId) return res.status(400).json({ error: "Missing targetUserId" });

    // Check existing invite
    const existing = await prisma.partnerInvitation.findFirst({
      where: { inviter_id: userId, invitee_id: targetUserId, status: "pending" }
    });

    if (existing) {
      return res.json({ message: "Đã gửi lời mời trước đó" });
    }

    await prisma.partnerInvitation.create({
      data: {
        inviter_id: userId,
        invitee_id: targetUserId,
      }
    });

    io.to(targetUserId).emit("partner_invite_received");
    res.json({ message: "Đã gửi lời mời hẹn hò" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/partners/invites", async (req, res) => {
  try {
    const userId = getUserId(req);
    const invites = await prisma.partnerInvitation.findMany({
      where: { invitee_id: userId, status: "pending" },
      include: {
        inviter: { select: { username: true, gender: true } }
      },
      orderBy: { created_at: "desc" }
    });
    res.json(invites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/partners/respond", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { invitationId, action } = req.body;

    const invite = await prisma.partnerInvitation.findUnique({ where: { id: invitationId } });
    if (!invite || invite.invitee_id !== userId) return res.status(404).json({ error: "Invite not found" });

    if (action === "accept") {
      await prisma.partnerInvitation.update({ where: { id: invitationId }, data: { status: "accepted" } });
      
      // Update partner_id for both users
      await prisma.user.update({
        where: { id: userId },
        data: { partner_id: invite.inviter_id }
      });
      await prisma.user.update({
        where: { id: invite.inviter_id },
        data: { partner_id: userId }
      });
      
      // Reject any other pending partner invites for both
      await prisma.partnerInvitation.updateMany({
        where: {
          OR: [
            { invitee_id: userId, status: "pending" },
            { invitee_id: invite.inviter_id, status: "pending" }
          ]
        },
        data: { status: "rejected" }
      });

      res.json({ message: "Đã ghép đôi thành công!" });
    } else {
      await prisma.partnerInvitation.update({ where: { id: invitationId }, data: { status: "rejected" } });
      res.json({ message: "Đã từ chối" });
    }
    
    // Notify both to reload dashboard/friends
    io.to(userId).emit("partner_invite_received");
    io.to(invite.inviter_id).emit("partner_invite_received");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- END PARTNER INVITATIONS ---

app.post("/api/partners/breakup", async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user.partner_id) return res.status(400).json({ error: "Bạn chưa có Partner" });

    const partnerId = user.partner_id;

    await prisma.user.update({
      where: { id: userId },
      data: { partner_id: null }
    });
    
    await prisma.user.update({
      where: { id: partnerId },
      data: { partner_id: null }
    });

    // Notify both clients to update their UI
    io.to(userId).emit("partner_invite_received"); 
    io.to(partnerId).emit("partner_invite_received");

    res.json({ message: "Đã hủy hẹn hò thành công!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ROOM INVITATIONS ---

app.post("/api/rooms/invite", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { targetUserId } = req.body;
    if (!targetUserId) return res.status(400).json({ error: "Missing targetUserId" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user.room_id) return res.status(400).json({ error: "Bạn chưa vào phòng nào" });

    // Check existing invite
    const existing = await prisma.roomInvitation.findFirst({
      where: { room_id: user.room_id, invitee_id: targetUserId, status: "pending" }
    });

    if (existing) {
      return res.json({ message: "Đã gửi lời mời trước đó" });
    }

    await prisma.roomInvitation.create({
      data: {
        room_id: user.room_id,
        inviter_id: userId,
        invitee_id: targetUserId,
      }
    });

    // Notify target user via socket
    // They will just get a trigger to refetch invites
    io.to(targetUserId).emit("room_invite_received");
    res.json({ message: "Đã gửi lời mời vào phòng" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/rooms/invites", async (req, res) => {
  try {
    const userId = getUserId(req);
    const invites = await prisma.roomInvitation.findMany({
      where: { invitee_id: userId, status: "pending" },
      include: {
        inviter: { select: { username: true, gender: true } },
        room: { select: { name: true, type: true } }
      },
      orderBy: { created_at: "desc" }
    });
    res.json(invites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/rooms/invites/respond", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { invitationId, action } = req.body;

    const invite = await prisma.roomInvitation.findUnique({ where: { id: invitationId } });
    if (!invite || invite.invitee_id !== userId) return res.status(404).json({ error: "Invite not found" });

    if (action === "accept") {
      await prisma.roomInvitation.update({ where: { id: invitationId }, data: { status: "accepted" } });
      await prisma.user.update({
        where: { id: userId },
        data: { room_id: invite.room_id, room_progress: 0 } // Reset progress when joining new room
      });
      // Notify new room
      io.to(`room_${invite.room_id}`).emit("arena_update");
      res.json({ message: "Đã tham gia phòng" });
    } else {
      await prisma.roomInvitation.update({ where: { id: invitationId }, data: { status: "rejected" } });
      res.json({ message: "Đã từ chối" });
    }
    // Update local UI
    io.to(userId).emit("room_invite_received");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- END ROOM INVITATIONS ---

app.get("/api/rooms/leaderboard", async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { room: { include: { users: { select: { id: true, username: true, flow_streak: true, dopa_balance: true, room_progress: true, last_flow_time: true, gender: true } } } } } });
    
    if (!user.room) {
      return res.json({ room: null, members: [] });
    }

    const members = user.room.users.sort((a, b) => {
      // Sort by flow_streak first, then dopa_balance
      if (b.flow_streak !== a.flow_streak) return b.flow_streak - a.flow_streak;
      return b.dopa_balance - a.dopa_balance;
    });

    res.json({ room: user.room, members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/rooms/race/propose", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { target_score, race_reward, race_penalty } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user.room_id) return res.status(400).json({ error: "Không ở trong phòng" });

    const room = await prisma.room.update({
      where: { id: user.room_id },
      data: { 
        target_score: Number(target_score),
        race_reward: race_reward || null,
        race_penalty: race_penalty || null,
        race_status: "pending",
        race_proposer_id: userId
      }
    });

    io.to(`room_${room.id}`).emit("arena_update");
    res.json({ success: true, room });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/rooms/race/respond", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { action } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user.room_id) return res.status(400).json({ error: "Không ở trong phòng" });

    const room = await prisma.room.findUnique({ where: { id: user.room_id } });
    if (room.race_status !== "pending") return res.status(400).json({ error: "Không có đề xuất nào" });

    if (action === "accept") {
      await prisma.room.update({
        where: { id: user.room_id },
        data: { race_status: "running" }
      });
      await prisma.user.updateMany({
        where: { room_id: user.room_id },
        data: { room_progress: 0 }
      });
    } else {
      await prisma.room.update({
        where: { id: user.room_id },
        data: { 
          race_status: "idle",
          target_score: null,
          race_reward: null,
          race_penalty: null,
          race_proposer_id: null
        }
      });
    }

    io.to(`room_${user.room_id}`).emit("arena_update");
    res.json({ success: true, action });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/rooms/race/surrender", async (req, res) => {
  try {
    const userId = getUserId(req);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user.room_id) return res.status(400).json({ error: "Không ở trong phòng" });

    const room = await prisma.room.findUnique({ where: { id: user.room_id } });
    if (room.race_status !== "running") return res.status(400).json({ error: "Không có cuộc đua nào đang chạy" });

    await prisma.room.update({
      where: { id: user.room_id },
      data: { 
        race_status: "idle",
        target_score: null,
        race_reward: null,
        race_penalty: null,
        race_proposer_id: null
      }
    });

    io.to(`room_${user.room_id}`).emit("arena_update");
    io.to(`room_${user.room_id}`).emit("race_surrendered", {
      surrenderer: user.username,
      penalty: room.race_penalty || "Mất mặt vì bỏ cuộc!"
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
async function startServer() {
  await ensureDemoData();
  server.listen(PORT, () => {
    console.log(`DinaFlow Backend MVP running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start DinaFlow Backend MVP", error);
  process.exit(1);
});
