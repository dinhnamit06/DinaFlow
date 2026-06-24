import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  Activity,
  Bell,
  BookOpen,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  CirclePlus,
  Clock3,
  Coffee,
  Coins,
  Dumbbell,
  Flame,
  Gamepad2,
  Gift,
  Headphones,
  Heart,
  Home,
  Moon,
  Music,
  Pause,
  PenLine,
  Play,
  Plus,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Smile,
  Sparkles,
  Sun,
  Target,
  Trophy,
  Users,
  WalletCards,
  Zap,
  MessageCircle,
  LogOut,
  User,
  Mail,
  Lock, Award
} from "lucide-react";

const STORAGE_KEY = "dinaflow-web-mvp-v2";

const playSound = (type = 'success') => {
  try {
    if (type === 'cute' || type === 'success' || type === 'error') {
      const audio = new Audio('/alert.mp3');
      audio.play().catch(e => console.error("Audio block:", e));
      return;
    }
    
    // Timer completion
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 2);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

const initialTasks = [
  {
    id: "task-1",
    title: "Hoàn thành thiết kế UI",
    category: "Làm việc sâu",
    reward: 25,
    duration: 25,
    status: "pending",
  },
  {
    id: "task-2",
    title: "Học kiến trúc React",
    category: "Học tập",
    reward: 20,
    duration: 30,
    status: "pending",
  },
  {
    id: "task-3",
    title: "Tập thể dục 30 phút",
    category: "Sức khỏe",
    reward: 15,
    duration: 25,
    status: "pending",
  },
  {
    id: "task-4",
    title: "Đọc 20 trang sách",
    category: "Cá nhân",
    reward: 15,
    duration: 20,
    status: "done",
  },
];

const initialRewards = [
  { id: "reward-1", name: "Uống trà sữa", cost: 120, iconKey: "coffee", redeemed: false },
  { id: "reward-2", name: "Xem phim Hàn", cost: 150, iconKey: "headphones", redeemed: false },
  { id: "reward-3", name: "Mua bút mới", cost: 200, iconKey: "pen", redeemed: false },
  { id: "reward-4", name: "Chơi game", cost: 150, iconKey: "gamepad", redeemed: true },
];

const initialLogs = [
  {
    id: "log-1",
    type: "Oxytocin",
    activity: "Giãn cơ buổi tối",
    duration: "20 phút",
    points: 15,
    time: "Hôm nay, 9:15 SA",
  },
  {
    id: "log-2",
    type: "Serotonin",
    activity: "Ngủ sâu",
    duration: "7.5 giờ",
    points: 30,
    time: "Hôm nay, 7:30 SA",
  },
  {
    id: "log-3",
    type: "Endorphin",
    activity: "Tránh xa điện thoại",
    duration: "1 giờ",
    points: 10,
    time: "Hôm qua, 8:45 CH",
  },
];

const navItems = [
  { id: "dashboard", label: "Tổng quan", icon: Home },
  { id: "tasks", label: "Nhiệm vụ", icon: CheckCircle2 },
  { id: "timer", label: "Đồng hồ", icon: Clock3 },
  { id: "leaderboard", label: "Bảng xếp hạng", icon: Trophy },
  { id: "rewards", label: "Phần thưởng", icon: Gift },
  { id: "logs", label: "Nhật ký sinh lý", icon: Activity },
  { id: "arena", label: "Thi đua", icon: Trophy },
  { id: "friends", label: "Bạn bè", icon: Users },
  { id: "mechanism", label: "Cơ chế sinh học", icon: Brain },
  { id: "settings", label: "Cài đặt", icon: Settings },
];

const rewardIconMap = {
  coffee: Coffee,
  headphones: Headphones,
  pen: PenLine,
  gamepad: Gamepad2,
  shield: ShieldCheck,
  gift: Gift,
};

const rewardIconOptions = [
  { key: "gift", label: "Quà" },
  { key: "coffee", label: "Đồ uống" },
  { key: "headphones", label: "Giải trí" },
  { key: "pen", label: "Đồ dùng" },
  { key: "gamepad", label: "Game" },
  { key: "shield", label: "Phục hồi" },
];

const recoveryTypeOptions = [
  { key: "Endorphin", label: "Endorphin", helper: "Vận động, tiếng cười, tập thể dục nhẹ" },
  { key: "Serotonin", label: "Serotonin", helper: "Ngủ đủ giấc, ánh nắng, lòng biết ơn, thói quen lành mạnh" },
  { key: "Oxytocin", label: "Oxytocin", helper: "Kết nối, giãn cơ, nghi thức chăm sóc bản thân" },
];

function normalizeRewards(rewards = initialRewards) {
  return rewards.map((reward) => {
    if (reward.iconKey) {
      return reward;
    }

    const fallbackKeyByName = {
      "Coffee Break": "coffee",
      "Music Time": "headphones",
      "30-min Walk": "shield",
      "No Screens Hour": "shield",
    };

    return {
      ...reward,
      iconKey: fallbackKeyByName[reward.name] ?? "gift",
    };
  });
}

// No longer loading from localStorage in MVP API step
function loadInitialState() {
  return null;
}

function formatTimer(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

async function readApiJson(response, fallbackMessage = "API request failed.") {
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    if (response.status === 401) {
      localStorage.removeItem("dina_token");
      window.location.reload();
    }
    throw new Error(data.error || fallbackMessage);
  }
  return data;
}

const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("dina_token");
  const headers = { ...options.headers };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};

function categoryClass(category) {
  return category.toLowerCase().replace(/\s+/g, "-");
}

function todayLabel() {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

function weekdayLabel() {
  return new Intl.DateTimeFormat("en", { weekday: "short" }).format(new Date());
}

function coinDelta(tasks) {
  return tasks.filter((task) => task.status === "done").reduce((sum, task) => sum + task.reward, 0);
}

function formatLogTime(value) {
  if (!value) {
    return "Vừa xong";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function scoreBurnout(tasks, logs) {
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const recoveryPoints = logs.reduce((sum, log) => sum + Number(log.points || 0), 0);
  const load = Math.min(85, tasks.length * 12 + doneCount * 8);
  const recovery = Math.min(95, recoveryPoints);
  return Math.max(12, Math.min(88, load - Math.floor(recovery / 2) + 24));
}

function SakuraEffect() {
  const [petals, setPetals] = useState([]);
  useEffect(() => {
    const newPetals = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      animDuration: 5 + Math.random() * 5,
      animDelay: Math.random() * 5,
      width: 10 + Math.random() * 10
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="sakura-container">
      {petals.map(p => (
        <div key={p.id} className="sakura" style={{
          left: `${p.left}vw`,
          width: `${p.width}px`,
          height: `${p.width}px`,
          animationDuration: `${p.animDuration}s`,
          animationDelay: `${p.animDelay}s`
        }} />
      ))}
    </div>
  );
}

function AuthView({ setAuthToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [gender, setGender] = useState("male");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const endpoint = isLogin ? "login" : "register";
    const body = isLogin ? { username, password } : { username, email, password, gender };

    try {
      const res = await fetch(`http://localhost:3000/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");

      localStorage.setItem("dina_token", data.token);
      setAuthToken(data.token);
      window.location.reload();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="animated-bg">
      <div className="glass-panel">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/conan-logo.png" alt="Logo" style={{ height: '80px', marginBottom: '16px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '800', background: 'linear-gradient(90deg, var(--text-main), var(--pink-main))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {isLogin ? "Đăng nhập DinaFlow" : "Tạo tài khoản mới"}
          </h2>
        </div>

        {error && <div className="cost-notice" style={{ color: 'var(--red-main)', marginBottom: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '8px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="glass-input-group">
            <User className="icon" size={20} />
            <input type="text" placeholder="Tên đăng nhập" required value={username} onChange={e => setUsername(e.target.value)} />
          </div>

          {!isLogin && (
            <>
              <div className="glass-input-group">
                <Mail className="icon" size={20} />
                <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)', fontWeight: 'bold', marginLeft: '4px' }}>Giới tính (Chọn Avatar)</label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button type="button" className={`btn-secondary ${gender === "male" ? "active" : ""}`} onClick={() => setGender("male")} style={{ flex: 1, padding: '12px', border: gender === "male" ? "2px solid var(--blue-main)" : "2px solid transparent", background: gender === "male" ? "var(--blue-soft)" : "rgba(255,255,255,0.6)", borderRadius: '12px', transition: 'all 0.3s' }}>👦 Nam (Shinichi)</button>
                  <button type="button" className={`btn-secondary ${gender === "female" ? "active" : ""}`} onClick={() => setGender("female")} style={{ flex: 1, padding: '12px', border: gender === "female" ? "2px solid var(--pink-main)" : "2px solid transparent", background: gender === "female" ? "var(--pink-soft)" : "rgba(255,255,255,0.6)", borderRadius: '12px', transition: 'all 0.3s' }}>👧 Nữ (Ran)</button>
                </div>
              </div>
            </>
          )}

          <div className="glass-input-group">
            <Lock className="icon" size={20} />
            <input type="password" placeholder="Mật khẩu" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <button type="submit" className="glass-btn" style={{ marginTop: '24px' }}>
            {isLogin ? "Đăng nhập" : "Đăng ký ngay"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button onClick={() => setIsLogin(!isLogin)} style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: 'bold', textDecoration: 'underline' }}>
            {isLogin ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const savedState = useMemo(loadInitialState, []);
  const [authToken, setAuthToken] = useState(localStorage.getItem("dina_token") || null);
  const [currentUserId, setCurrentUserId] = useState(null); // Will be set via dashboard API
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [partnerInfo, setPartnerInfo] = useState(null);
  const [partnerStatus, setPartnerStatus] = useState("online");
  const [socket, setSocket] = useState(null);
  const [hearts, setHearts] = useState([]);

  const [activePage, setActivePage] = useState("dashboard");
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [tasks, setTasks] = useState(savedState?.tasks ?? initialTasks);
  const [rewards, setRewards] = useState(savedState?.rewards ?? initialRewards);
  const [logs, setLogs] = useState(savedState?.logs ?? initialLogs);
  const [balance, setBalance] = useState(savedState?.balance ?? 230);
  const [flowStreak, setFlowStreak] = useState(0);
  const [lastFlowTime, setLastFlowTime] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(
    savedState?.activeTaskId ?? initialTasks.find((task) => task.status === "pending")?.id ?? null,
  );
  const [timerSeconds, setTimerSeconds] = useState(savedState?.timerSeconds ?? 18 * 60 + 36);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerCompletePlayedRef = useRef(false);
  const [taskDraft, setTaskDraft] = useState("");
  const [logDraft, setLogDraft] = useState({
    type: "Endorphin",
    activity: "",
    duration: "10 min",
    points: 10,
  });
  const [rewardDraft, setRewardDraft] = useState({ name: "", cost: 100, iconKey: "gift" });
  const [notice, setNotice] = useState("Sẵn sàng cho phiên làm việc hôm nay.");

  // Removed auto-hide notice useEffect per user request

  const [partnerFocusStatus, setPartnerFocusStatus] = useState("active");
  const [viewingProfileId, setViewingProfileId] = useState(null);

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? tasks.find((task) => task.status === "pending") ?? tasks[0],
    [activeTaskId, tasks],
  );

  const completedCount = useMemo(() => tasks.filter((task) => task.status === "done").length, [tasks]);
  const totalMinutes = useMemo(() => tasks.reduce((sum, task) => sum + task.duration, 0), [tasks]);
  const burnoutRisk = useMemo(() => scoreBurnout(tasks, logs), [tasks, logs]);
  const recoveryScore = useMemo(
    () => Math.min(98, 54 + Math.floor(logs.reduce((sum, log) => sum + Number(log.points), 0) / 2)),
    [logs],
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authToken) return;

    apiFetch("http://localhost:3000/api/dashboard")
      .then((res) => readApiJson(res, "Dashboard data unavailable."))
      .then((data) => {
        setCurrentUserId(data.user.id);
        setCurrentUser(data.user);
        setCurrentRoom(data.room);
        setBalance(data.balance || 0);
        setFlowStreak(data.flowStreak || 0);
        setLastFlowTime(data.lastFlowTime || null);
        setPartnerInfo(data.partner || null);
        setTasks(data.tasks || []);
        setRewards(data.rewards ? normalizeRewards(data.rewards) : []);
        setLogs(data.logs || []);
        setNotificationCount(data.notificationsCount || 0);
        setNotifications(data.notifications || []);
      })
      .catch((err) => {
        console.error("API Error", err);
        setNotice("Không thể kết nối với máy chủ API. Đang dùng dữ liệu tạm.");
      })
      .finally(() => {
        setLoading(false);
      });

    const newSocket = io("http://localhost:3000", { query: { token: authToken } });
    setSocket(newSocket);

    newSocket.on("partner_timer_action", (data) => {
      setPartnerStatus(data.action === "started" ? "flowing" : "online");
      setNotice(data.action === "started" ? `🚀 Partner của bạn đang tập trung: ${data.taskTitle}` : "☕ Partner đã kết thúc phiên Flow.");
    });

    newSocket.on("wallet_updated", (data) => {
      setBalance((prev) => prev + data.added);
      setNotice(`💖 Quỹ Tình Yêu thay đổi: ${data.added > 0 ? "+" : ""}${data.added} xu`);
    });

    newSocket.on("partner_rescued", (data) => {
      setNotice(`💖 Partner vừa gửi tặng bạn ${data.points} điểm phục hồi!`);
      setLogs((prev) => [{ id: Date.now().toString(), type: "Oxytocin", activity: "Được Partner cứu trợ", points: data.points, created_at: new Date().toISOString() }, ...prev]);
    });

    newSocket.on("receive_heart", () => {
      const id = Date.now();
      setHearts(prev => [...prev, { id, left: 20 + Math.random() * 60 }]);
      setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 2000);
      playSound('success');
      setNotice("💖 Partner vừa gửi cho bạn một trái tim!");
    });

    newSocket.on("receive_message", (data) => {
      playSound('cute');
      setNotice(`💌 Lời nhắn từ Partner: "${data.message}"`);
      setNotifications(prev => [{ type: "partner", message: `Partner nhắn: "${data.message}"` }, ...prev]);
      setNotificationCount(prev => prev + 1);
    });

    newSocket.on("room_invite_received", () => {
      playSound('cute');
      setNotice("🚪 Bạn vừa nhận được một lời mời vào phòng thi đua! (Xem ở Sảnh chờ)");
      setNotificationCount(prev => prev + 1);
    });

    newSocket.on("partner_invite_received", () => {
      playSound('cute');
      setNotice("💖 Bạn vừa nhận được một lời mời Hẹn hò (Ghép đôi)! (Xem ở tab Bạn Bè)");
      setNotificationCount(prev => prev + 1);
    });

    newSocket.on("race_surrendered", (data) => {
      playSound('error');
      setNotice(`🏳️ ${data.surrenderer} ĐÃ ĐẦU HÀNG! Hình phạt: ${data.penalty}`);
    });

    const fetchInvites = () => { };

    return () => {
      newSocket.disconnect();
    };
  }, [authToken]);

  // Check if cooldown expired
  useEffect(() => {
    if (!lastFlowTime) return;
    const intervalId = window.setInterval(() => {
      if (Date.now() - new Date(lastFlowTime).getTime() > 15 * 60 * 1000) {
        setFlowStreak(0);
      }
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [lastFlowTime]);

  useEffect(() => {
    if (!timerRunning) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setTimerSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          setTimerRunning(false);
          if (!timerCompletePlayedRef.current) {
            timerCompletePlayedRef.current = true;
            playSound('timer');
          }
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [timerRunning]);

  async function addTask(event) {
    event.preventDefault();
    const title = taskDraft.trim();
    if (!title) {
      setNotice("Vui lòng nhập tên nhiệm vụ.");
      return;
    }
    try {
      const res = await apiFetch("http://localhost:3000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: taskDraft, duration: 25, reward: 25, category: "Làm việc sâu" })
      });
      const newTask = await readApiJson(res, "Cannot add task.");
      setTasks((currentTasks) => [newTask, ...currentTasks]);
      setActiveTaskId(newTask.id);
      setTimerSeconds((newTask.duration ?? 25) * 60);
      timerCompletePlayedRef.current = false;
      setTaskDraft("");
      setNotice("Đã thêm nhiệm vụ. Bấm bắt đầu khi bạn sẵn sàng.");
    } catch (err) {
      console.error(err);
      setNotice(err.message || "Lỗi khi thêm nhiệm vụ.");
    }
  }

  async function completeTask(taskId = activeTask?.id) {
    const target = tasks.find((task) => task.id === taskId);
    if (!target) {
      return;
    }

    if (target.status === "done") {
      setNotice("Nhiệm vụ này đã hoàn thành, không được cộng thêm xu.");
      return;
    }

    try {
      const res = await apiFetch(`http://localhost:3000/api/tasks/${taskId}/complete`, {
        method: "PUT"
      });
      const data = await readApiJson(res, "Cannot complete task.");
      if (!data.task || typeof data.newBalance !== "number") {
        throw new Error("Invalid task response.");
      }
      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === taskId ? data.task : task)),
      );
      setBalance(data.newBalance);
      setFlowStreak(data.flowStreak);
      setLastFlowTime(data.lastFlowTime);
      setTimerRunning(false);
      playSound('success');

      if (data.multiplier > 1.0) {
        setNotice(`Đã hoàn thành "${target.title}". Combo x${data.multiplier} mang lại +${data.earned} xu!`);
      } else {
        setNotice(`Đã hoàn thành "${target.title}" và nhận được ${data.earned} xu.`);
      }
    } catch (err) {
      console.error(err);
      setNotice(err.message || "Lỗi kết nối API.");
    }
  }

  function toggleTimer() {
    if (burnoutRisk > 65) {
      setNotice("🚨 Cortisol đang quá cao! Vui lòng sang Nhật ký sinh lý để thư giãn.");
      return;
    }
    if (!activeTask) {
      setNotice("Thêm nhiệm vụ trước khi bắt đầu.");
      return;
    }
    if (activeTask.status === "done") {
      setNotice("Chọn một nhiệm vụ chưa hoàn thành trước.");
      return;
    }
    if (!timerRunning) {
      timerCompletePlayedRef.current = false;
      if (socket) socket.emit("timer_action", { partnerId: partnerInfo?.id, action: "started", taskTitle: activeTask.title });
    } else {
      if (socket) socket.emit("timer_action", { partnerId: partnerInfo?.id, action: "stopped", taskTitle: activeTask.title });
    }
    setTimerRunning((running) => !running);
    setNotice(timerRunning ? "Đã tạm dừng." : `Đã bắt đầu phiên cho "${activeTask.title}".`);
  }

  function selectTask(taskId) {
    const nextTask = tasks.find((task) => task.id === taskId);
    setActiveTaskId(taskId);
    setTimerSeconds((nextTask?.duration ?? 25) * 60);
    setTimerRunning(false);
    timerCompletePlayedRef.current = false;
    setNotice(`Đã chọn "${nextTask?.title ?? "nhiệm vụ"}".`);
  }

  async function redeemReward(rewardId) {
    const reward = rewards.find((item) => item.id === rewardId);
    if (!reward) {
      return;
    }
    if (reward.redeemed) {
      setNotice(`${reward.name} đã được đổi quà trước đó.`);
      return;
    }
    if (balance < reward.cost) {
      setNotice(`Bạn cần thêm ${reward.cost - balance} xu để đổi ${reward.name}.`);
      return;
    }

    try {
      const res = await apiFetch(`http://localhost:3000/api/rewards/${rewardId}/redeem`, {
        method: "POST"
      });
      const data = await readApiJson(res, "Cannot redeem reward.");
      if (!data.reward || typeof data.newBalance !== "number") {
        throw new Error("Invalid reward response.");
      }
      setBalance(data.newBalance);
      setRewards((currentRewards) =>
        currentRewards.map((item) => (item.id === rewardId ? data.reward : item)),
      );
      playSound('success');
      setNotice(`Đã đổi ${reward.name}. Chúc bạn tận hưởng vui vẻ!`);
    } catch (err) {
      console.error(err);
      setNotice(err.message || "Lỗi kết nối API.");
    }
  }

  async function addReward(event) {
    event.preventDefault();
    const name = rewardDraft.name.trim();
    const cost = Number(rewardDraft.cost);
    if (!name) {
      setNotice("Vui lòng nhập tên phần thưởng.");
      return;
    }
    if (!Number.isFinite(cost) || cost <= 0) {
      setNotice("Chi phí phần thưởng phải lớn hơn 0 xu.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": currentUserId },
        body: JSON.stringify({ name, cost, iconKey: rewardDraft.iconKey })
      });
      const newReward = await readApiJson(res, "Cannot add reward.");
      setRewards((currentRewards) => [newReward, ...currentRewards]);
      setRewardDraft({ name: "", cost: 100, iconKey: "gift" });
      setNotice(`Đã thêm ${name} vào Kho phần thưởng.`);
    } catch (err) {
      console.error(err);
      setNotice(err.message || "Lỗi kết nối API.");
    }
  }

  async function addRecoveryLog(event) {
    event.preventDefault();
    const activity = logDraft.activity.trim();
    const duration = logDraft.duration.trim();
    const points = Number(logDraft.points);
    if (!Number.isFinite(points) || points <= 0) {
      setNotice("Recovery points must be greater than 0.");
      return;
    }
    if (!activity) {
      setNotice("Vui lòng nhập tên hoạt động.");
      return;
    }

    try {
      const res = await apiFetch("http://localhost:3000/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: logDraft.type, activity, points, duration })
      });
      const newLog = await readApiJson(res, "Cannot add recovery log.");
      const hydratedLog = { ...newLog, duration: duration || `${points} pts` };
      setLogs((currentLogs) => [hydratedLog, ...currentLogs]);
      setLogDraft({ type: "Endorphin", activity: "", duration: "10 min", points: 10 });
      setNotice(`Đã ghi nhận ${activity} và nhận +${hydratedLog.points} điểm phục hồi.`);
    } catch (err) {
      console.error(err);
      setNotice(err.message || "Lỗi kết nối API.");
    }
  }

  function resetDemo() {
    setTasks(initialTasks);
    setRewards(initialRewards);
    setLogs(initialLogs);
    setBalance(230);
    setActiveTaskId(initialTasks.find((task) => task.status === "pending")?.id ?? null);
    setTimerSeconds(18 * 60 + 36);
    setTimerRunning(false);
    timerCompletePlayedRef.current = false;
    setNotice("Ä ã khôi phục dữ liệu mẫu.");
  }

  function handleLogout() {
    localStorage.removeItem("dina_token");
    setAuthToken(null);
    setCurrentUser(null);
    setCurrentRoom(null);
    window.location.reload();
  }

  if (!authToken) {
    return <AuthView setAuthToken={setAuthToken} />;
  }

  return (
    <div className="app-shell">
      {partnerInfo && <SakuraEffect />}
      {hearts.map(h => (
        <div key={h.id} className="flying-heart" style={{ left: `${h.left}vw`, bottom: '20px' }}>💖</div>
      ))}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        currentRoom={currentRoom}
      />
      <main className="workspace">
        <TopBar
          completedCount={completedCount}
          taskCount={tasks.length}
          totalMinutes={totalMinutes}
          balance={balance}
          recoveryScore={recoveryScore}
          flowStreak={flowStreak}
          partnerInfo={partnerInfo}
          partnerStatus={partnerStatus}
          partnerFocusStatus={partnerFocusStatus}
          currentUser={currentUser}
          currentRoom={currentRoom}
          onAvatarClick={() => { if (partnerInfo) setViewingProfileId(partnerInfo.id); }}
          onPoke={() => {
            if (socket && partnerInfo) {
              socket.emit("send_heart", { partnerId: partnerInfo.id });
              setNotice("Đã gửi Tym 💖");
            }
          }}
          onMessage={() => {
            if (timerRunning || partnerStatus === "flowing") { alert("🔒 Chế độ Flow: Chat đang bị khóa để tránh xao nhãng! Hãy dùng nút Gửi Tym 💖 thay cho lời động viên nhé."); return; } if (socket && partnerInfo) {
              const msg = window.prompt("Nhập lời nhắn gửi cho người thương 💖:");
              if (msg && msg.trim() !== "") {
                socket.emit("send_message", { partnerId: partnerInfo.id, message: msg.trim() });
                setNotice("Đã gửi lời nhắn thành công!");
              }
            }
          }}
          notificationCount={notificationCount}
          setNotificationCount={setNotificationCount}
          notifications={notifications}
          onNavigate={setActivePage}
        />
        <StatusNotice message={notice} onClose={() => setNotice("")} />

        {viewingProfileId && (
          <UserProfileModal
            userId={viewingProfileId}
            onClose={() => setViewingProfileId(null)}
          />
        )}

        {activePage === "dashboard" && (
          <DashboardView
            activeTask={activeTask}
            balance={balance}
            burnoutRisk={burnoutRisk}
            completedCount={completedCount}
            logs={logs}
            onAddRecovery={addRecoveryLog}
            onCompleteTask={completeTask}
            onRedeemReward={redeemReward}
            onSelectTask={selectTask}
            onTaskSubmit={addTask}
            onToggleTimer={toggleTimer}
            rewards={rewards}
            taskDraft={taskDraft}
            tasks={tasks}
            timerRunning={timerRunning}
            timerSeconds={timerSeconds}
            setLogDraft={setLogDraft}
            setTaskDraft={setTaskDraft}
            logDraft={logDraft}
            onNavigate={setActivePage}
            totalMinutes={totalMinutes}
            flowStreak={flowStreak}
          />
        )}
        {activePage === "tasks" && (
          <TasksView
            activeTaskId={activeTask?.id}
            onCompleteTask={completeTask}
            onSelectTask={selectTask}
            onTaskSubmit={addTask}
            taskDraft={taskDraft}
            tasks={tasks}
            setTaskDraft={setTaskDraft}
          />
        )}
        {activePage === "timer" && (
          <TimerView
            activeTask={activeTask}
            onCompleteTask={completeTask}
            onToggleTimer={toggleTimer}
            timerRunning={timerRunning}
            timerSeconds={timerSeconds}
            burnoutRisk={burnoutRisk}
          />
        )}
        {activePage === "rewards" && (
          <RewardsView
            balance={balance}
            onRedeemReward={redeemReward}
            rewards={rewards}
            onAddReward={addReward}
            rewardDraft={rewardDraft}
            setRewardDraft={setRewardDraft}
          />
        )}
        {activePage === "logs" && (
          <LogsView logDraft={logDraft} logs={logs} onAddRecovery={addRecoveryLog} setLogDraft={setLogDraft} />
        )}
        {activePage === "arena" && (
          <ArenaView currentUser={currentUser} socket={socket} notice={notice} setNotice={setNotice} timerRunning={timerRunning} timerSeconds={timerSeconds} activeTask={activeTask} setViewingProfileId={setViewingProfileId} />
        )}
        {activePage === "friends" && (
          <FriendsView currentUser={currentUser} setNotice={setNotice} setViewingProfileId={setViewingProfileId} socket={socket} />
        )}
        {activePage === "leaderboard" && (
          <LeaderboardView currentUser={currentUser} setViewingProfileId={setViewingProfileId} />
        )}
        {activePage === "mechanism" && <MechanismView />}
        {activePage === "settings" && <SettingsView onReset={resetDemo} />}
      </main>
    </div>
  );
}

function FriendsView({ currentUser, setNotice, setViewingProfileId, socket }) {
  const [activeTab, setActiveTab] = useState("list"); // list, requests, search
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [partnerRequests, setPartnerRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sentPartnerInvites, setSentPartnerInvites] = useState([]);

  const [activeTask, setActiveTask] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetchFriends();
    fetchPartnerRequests();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handlePartnerInvite = () => {
      fetchPartnerRequests();
    };
    socket.on("partner_invite_received", handlePartnerInvite);
    return () => socket.off("partner_invite_received", handlePartnerInvite);
  }, [socket]);

  const fetchPartnerRequests = () => {
    apiFetch("http://localhost:3000/api/partners/invites")
      .then(res => res.json())
      .then(data => {
        setPartnerRequests(Array.isArray(data) ? data : []);
      }).catch(err => console.error(err));
  };

  const fetchFriends = () => {
    apiFetch("http://localhost:3000/api/friends")
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setFriends(data.friends || []);
          setRequests(data.pendingRequests || []);
        }
      }).catch(err => console.error(err));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.length < 2) return;
    apiFetch(`http://localhost:3000/api/users/search?q=${searchQuery}`)
      .then(res => res.json())
      .then(data => setSearchResults(data || []))
      .catch(err => console.error(err));
  };

  const sendRequest = (id) => {
    apiFetch("http://localhost:3000/api/friends/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: id })
    })
      .then(res => res.json())
      .then(data => {
        setNotice(data.message || data.error);
      }).catch(err => console.error(err));
  };

  const respondRequest = (friendshipId, action) => {
    apiFetch("http://localhost:3000/api/friends/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ friendshipId, action })
    })
      .then(res => res.json())
      .then(data => {
        setNotice(data.message || data.error);
        fetchFriends();
      }).catch(err => console.error(err));
  };

  const sendPartnerInvite = (friendId) => {
    apiFetch("http://localhost:3000/api/partners/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: friendId })
    })
      .then(res => res.json())
      .then(data => {
        setNotice(data.message || data.error);
        if (data.message === "Đã gửi lời mời hẹn hò" || data.message === "Đã gửi lời mời trước đó") {
          setSentPartnerInvites(prev => [...prev, friendId]);
        }
      }).catch(err => console.error(err));
  };

  const respondPartnerInvite = (invitationId, action) => {
    apiFetch("http://localhost:3000/api/partners/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitationId, action })
    })
      .then(res => res.json())
      .then(data => {
        setNotice(data.message || data.error);
        fetchPartnerRequests();
        // If accept, reload page to get partner_id in App dashboard
        if (action === "accept") {
          setTimeout(() => window.location.reload(), 1500);
        }
      }).catch(err => console.error(err));
  };

  const handleBreakup = () => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy hẹn hò với người này không? Toàn bộ trạng thái cặp đôi sẽ bị xóa!")) return;

    apiFetch("http://localhost:3000/api/partners/breakup", { method: "POST" })
      .then(res => res.json())
      .then(data => {
        setNotice(data.message || data.error);
        setTimeout(() => window.location.reload(), 1500);
      }).catch(err => console.error(err));
  };

  return (
    <section className="page-panel arena-panel">
      <div className="page-heading">
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={28} /> Bạn Bè
          </h2>
          <p>Kết nối với bạn bè để cùng nhau tập trung và tiến bộ!</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <button
          className="glass-btn"
          style={{ background: activeTab === 'list' ? 'var(--blue-main)' : 'var(--surface)', color: activeTab === 'list' ? 'white' : 'var(--text-main)', border: '1px solid var(--border)' }}
          onClick={() => setActiveTab("list")}
        >
          Danh sách ({friends.length})
        </button>
        <button
          className="glass-btn"
          style={{ background: activeTab === 'requests' ? 'var(--blue-main)' : 'var(--surface)', color: activeTab === 'requests' ? 'white' : 'var(--text-main)', border: '1px solid var(--border)' }}
          onClick={() => setActiveTab("requests")}
        >
          Lời mời ({requests.length + partnerRequests.length})
        </button>
        <button
          className="glass-btn"
          style={{ background: activeTab === 'search' ? 'var(--blue-main)' : 'var(--surface)', color: activeTab === 'search' ? 'white' : 'var(--text-main)', border: '1px solid var(--border)' }}
          onClick={() => setActiveTab("search")}
        >
          Tìm kiếm
        </button>
      </div>

      <section className="panel">
        {activeTab === "list" && (
          <div className="leaderboard-list">
            {friends.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <Users size={64} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--text-main)' }}>Chưa có người bạn nào</h3>
                <p>Hãy qua mục "Tìm kiếm" để gửi lời mời kết bạn nhé!</p>
              </div>
            ) :
              friends.map(f => (
                <div key={f.id} className="leaderboard-row" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '12px' }}>
                  <div className="user-col" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <img src={f.gender === "female" ? "/ran-task.png" : "/conan-avatar.png"} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', marginRight: '16px', border: '2px solid var(--blue-main)', cursor: 'pointer' }} onClick={() => setViewingProfileId(f.id)} />
                    <div>
                      <strong style={{ fontSize: '16px', cursor: 'pointer' }} onClick={() => setViewingProfileId(f.id)}>{f.username}</strong>
                      <span className="last-active" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {f.activityStatus === "flowing" ? "🔴 Đang Flow" : (f.activityStatus === "resting" ? "🟡 Đang nghỉ ngơi" : "🟢 Đang rảnh")}
                      </span>
                    </div>
                  </div>
                  <div className="stats-col" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div className="stat-pill" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--red-soft)', color: 'var(--red-main)', padding: '6px 12px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>
                      <Flame size={18} color="var(--red-main)" /> {f.flowStreak} ngày
                    </div>
                    {currentUser?.partner_id === f.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', color: 'var(--pink-main)', fontWeight: 'bold' }}>💖 Đang hẹn hò</span>
                        <button onClick={handleBreakup} className="glass-btn" style={{ padding: '4px 8px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', fontSize: '12px', width: 'auto' }}>
                          💔 Hủy
                        </button>
                      </div>
                    ) : f.partnerId ? (
                      <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>🔒 Đã có chủ</span>
                    ) : currentUser?.partner_id ? (
                      <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Bạn đã có Partner</span>
                    ) : sentPartnerInvites.includes(f.id) ? (
                      <span style={{ fontSize: '14px', color: 'var(--yellow-main)' }}>⏳ Đang chờ...</span>
                    ) : (
                      <button onClick={() => sendPartnerInvite(f.id)} className="glass-btn" style={{ padding: '6px 12px', background: 'rgba(244, 114, 182, 0.1)', color: 'var(--pink-main)', border: '1px solid var(--pink-main)', fontSize: '14px', width: 'auto' }}>
                        💖 Hẹn hò
                      </button>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === "requests" && (
          <div className="leaderboard-list">
            {partnerRequests.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: 'var(--pink-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>💖 Lời Mời Ghép Đôi</h3>
                {partnerRequests.map(r => (
                  <div key={r.id} className="leaderboard-row" style={{ padding: '16px', background: 'var(--surface)', border: '2px solid var(--pink-main)', borderRadius: '12px', marginBottom: '12px' }}>
                    <div className="user-col" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <img src={r.inviter.gender === "female" ? "/ran-task.png" : "/conan-avatar.png"} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', marginRight: '16px', border: '2px solid var(--pink-main)', cursor: 'pointer' }} onClick={() => setViewingProfileId(r.inviter.id)} />
                      <div>
                        <strong style={{ fontSize: '16px', color: 'var(--pink-main)', cursor: 'pointer' }} onClick={() => setViewingProfileId(r.inviter.id)}>{r.inviter.username}</strong>
                        <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-main)', marginTop: '4px' }}>Muốn hẹn hò và trở thành Partner của bạn!</span>
                      </div>
                    </div>
                    <div className="stats-col" style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => respondPartnerInvite(r.id, 'accept')} className="glass-btn" style={{ background: 'var(--pink-main)', color: 'white', padding: '8px 16px', fontSize: '14px' }}>Đồng ý</button>
                      <button onClick={() => respondPartnerInvite(r.id, 'reject')} className="glass-btn" style={{ background: 'transparent', border: '1px solid var(--red-main)', color: 'var(--red-main)', padding: '8px 16px', fontSize: '14px' }}>Từ chối</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 style={{ color: 'var(--blue-main)' }}>Lời Mời Kết Bạn</h3>
            {requests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                <Users size={64} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--text-main)' }}>Không có lời mời nào</h3>
                <p>Bạn chưa nhận được lời mời kết bạn mới.</p>
              </div>
            ) :
              requests.map(r => (
                <div key={r.friendshipId} className="leaderboard-row" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '12px' }}>
                  <div className="user-col" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <img src={r.senderGender === "female" ? "/ran-task.png" : "/conan-avatar.png"} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', marginRight: '16px', border: '2px solid var(--yellow-main)', cursor: 'pointer' }} onClick={() => setViewingProfileId(r.senderId)} />
                    <div>
                      <strong style={{ fontSize: '16px', color: 'var(--text-main)', cursor: 'pointer' }} onClick={() => setViewingProfileId(r.senderId)}>{r.senderName}</strong>
                      <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Muốn kết bạn với bạn</span>
                    </div>
                  </div>
                  <div className="stats-col" style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => respondRequest(r.friendshipId, 'accept')} className="glass-btn" style={{ background: 'var(--green-main)', padding: '8px 16px', fontSize: '14px' }}>Đồng ý</button>
                    <button onClick={() => respondRequest(r.friendshipId, 'reject')} className="glass-btn" style={{ background: 'transparent', border: '1px solid var(--red-main)', color: 'var(--red-main)', padding: '8px 16px', fontSize: '14px' }}>Từ chối</button>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {activeTab === "search" && (
          <div className="lobby-card">
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <input className="lobby-input" style={{ marginBottom: 0, flex: 1, fontSize: '15px' }} type="text" placeholder="Nhập tên người dùng cần tìm..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <button type="submit" className="glass-btn" style={{ width: 'auto', padding: '0 24px', background: 'var(--blue-main)' }}>Tìm kiếm</button>
            </form>
            <div className="leaderboard-list">
              {searchResults.length === 0 && searchQuery.length >= 2 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>Chưa tìm thấy kết quả.</div>
              ) : searchResults.map(u => (
                <div key={u.id} className="leaderboard-row" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '12px' }}>
                  <div className="user-col" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <img src={u.gender === "female" ? "/ran-task.png" : "/conan-avatar.png"} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', marginRight: '16px', border: '2px solid var(--border)', cursor: 'pointer' }} onClick={() => setViewingProfileId(u.id)} />
                    <strong style={{ fontSize: '16px', cursor: 'pointer' }} onClick={() => setViewingProfileId(u.id)}>{u.username}</strong>
                  </div>
                  <div className="stats-col">
                    <button onClick={() => sendRequest(u.id)} className="glass-btn" style={{ padding: '8px 16px', background: 'var(--blue-main)', fontSize: '14px' }}>Gửi lời mời</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </section>
  );
}

function ArenaView({ currentUser, socket, notice, setNotice, timerRunning, timerSeconds, activeTask, setViewingProfileId }) {
  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [joinCode, setJoinCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("group");
  const [raceTargetInput, setRaceTargetInput] = useState("50");
  const [raceRewardInput, setRaceRewardInput] = useState("");
  const [racePenaltyInput, setRacePenaltyInput] = useState("");

  async function handleProposeRace(e) {
    e.preventDefault();
    try {
      const res = await apiFetch("http://localhost:3000/api/rooms/race/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_score: raceTargetInput, race_reward: raceRewardInput, race_penalty: racePenaltyInput })
      });
      await readApiJson(res);
      fetchLeaderboard();
      setNotice("Đã gửi lời đề xuất cuộc đua!");
    } catch (err) {
      setNotice(err.message);
    }
  }

  async function handleRespondRace(action) {
    try {
      const res = await apiFetch("http://localhost:3000/api/rooms/race/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      await readApiJson(res);
      fetchLeaderboard();
      setNotice(action === "accept" ? "Cuộc đua đã bắt đầu!" : "Đã huỷ/từ chối cuộc đua.");
    } catch (err) {
      setNotice(err.message);
    }
  }

  async function handleSurrender() {
    if (!window.confirm("Bạn có chắc chắn muốn đầu hàng không? Hình phạt sẽ được áp dụng!")) return;
    try {
      const res = await apiFetch("http://localhost:3000/api/rooms/race/surrender", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      await readApiJson(res);
      fetchLeaderboard();
      setNotice("Bạn đã đầu hàng.");
    } catch (err) {
      setNotice(err.message);
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const res = await apiFetch("http://localhost:3000/api/rooms/leaderboard");
      const data = await readApiJson(res, "Cannot fetch leaderboard.");
      setRoom(data.room);
      setMembers(data.members || []);

      if (data.room && socket) {
        socket.emit("join_arena", data.room.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const [invites, setInvites] = useState([]);
  const [friendsToInvite, setFriendsToInvite] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const fetchInvites = async () => {
    try {
      const res = await apiFetch("http://localhost:3000/api/rooms/invites");
      const data = await readApiJson(res);
      setInvites(data || []);
    } catch (err) { console.error(err); }
  };

  const fetchFriends = async () => {
    try {
      const res = await apiFetch("http://localhost:3000/api/friends");
      const data = await res.json();
      if (!data.error) setFriendsToInvite(data.friends || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchLeaderboard();
    fetchInvites();
    fetchFriends();
  }, [currentUser]);

  useEffect(() => {
    if (!socket) return;
    const handleArenaUpdate = () => fetchLeaderboard();
    const handleInviteReceived = () => fetchInvites();
    socket.on("arena_update", handleArenaUpdate);
    socket.on("room_invite_received", handleInviteReceived);
    return () => {
      socket.off("arena_update", handleArenaUpdate);
      socket.off("room_invite_received", handleInviteReceived);
    };
  }, [socket, currentUser]);

  async function handleSendInvite(friendId) {
    try {
      const res = await apiFetch("http://localhost:3000/api/rooms/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: friendId })
      });
      const data = await readApiJson(res);
      setNotice(data.message || "Đã gửi lời mời");
    } catch (err) {
      setNotice(err.message);
    }
  }

  async function handleRespondInvite(invitationId, action) {
    try {
      const res = await apiFetch("http://localhost:3000/api/rooms/invites/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId, action })
      });
      const data = await readApiJson(res);
      setNotice(data.message);
      fetchInvites();
      if (action === "accept") fetchLeaderboard();
    } catch (err) {
      setNotice(err.message);
    }
  }

  async function handleCreateRoom(e) {
    e.preventDefault();
    try {
      const res = await apiFetch("http://localhost:3000/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName, type: roomType })
      });
      await readApiJson(res);
      fetchLeaderboard();
      setNotice("Tạo phòng thành công!");
    } catch (err) {
      setNotice(err.message);
    }
  }

  async function handleJoinRoom(e) {
    e.preventDefault();
    try {
      const res = await apiFetch("http://localhost:3000/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: joinCode })
      });
      await readApiJson(res);
      fetchLeaderboard();
      setNotice("Vào phòng thành công!");
    } catch (err) {
      setNotice(err.message);
    }
  }

  async function handleLeaveRoom() {
    try {
      if (socket && room) socket.emit("leave_arena", room.id);
      const res = await apiFetch("http://localhost:3000/api/rooms/leave", {
        method: "POST"
      });
      await readApiJson(res);
      setRoom(null);
      setMembers([]);
      setNotice("Đã rời phòng thi đua.");
    } catch (err) {
      setNotice(err.message);
    }
  }

  if (!room) {
    return (
      <section className="page-panel arena-panel">
        <div className="page-heading">
          <div>
            <h2>Phòng Thi Đua</h2>
            <p>Khởi tạo hoặc tham gia nhóm để thi đua cày cuốc!</p>
          </div>
          <Trophy size={48} color="var(--yellow-main)" />
        </div>

        <div className="rewards-layout">
          {invites.length > 0 && (
            <section className="lobby-card" style={{ gridColumn: '1 / -1', border: '2px solid var(--yellow-main)', background: 'var(--surface)' }}>
              <div className="panel-header"><h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={24} color="var(--yellow-main)" /> Lời Mời Vào Phòng</h2></div>
              <div className="leaderboard-list">
                {invites.map(inv => (
                  <div key={inv.id} className="leaderboard-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={inv.inviter.gender === "female" ? "/ran-task.png" : "/conan-avatar.png"} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <strong>{inv.inviter.username}</strong>
                        <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)' }}>Mời bạn vào: {inv.room.name} ({inv.room.type === 'couple' ? 'Couple' : 'Nhóm'})</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="glass-btn" onClick={() => handleRespondInvite(inv.id, 'accept')} style={{ background: 'var(--green-main)', padding: '6px 12px', fontSize: '14px' }}>Tham gia</button>
                      <button className="glass-btn" onClick={() => handleRespondInvite(inv.id, 'reject')} style={{ background: 'transparent', border: '1px solid var(--red-main)', color: 'var(--red-main)', padding: '6px 12px', fontSize: '14px' }}>Từ chối</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="lobby-card">
            <div className="panel-header"><h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Plus size={24} color="var(--pink-main)" /> <span className="text-neon-pink">Tạo Phòng Mới</span></h2></div>
            <form onSubmit={handleCreateRoom}>
              <div className="field-group">
                <input className="lobby-input" type="text" placeholder="Tên phòng (vd: Hội Thám Tử)" value={roomName} onChange={e => setRoomName(e.target.value)} required />
              </div>
              <div className="field-group" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button type="button" className={`btn-secondary ${roomType === "group" ? "active" : ""}`} onClick={() => setRoomType("group")} style={{ flex: 1, padding: '12px', border: roomType === "group" ? "2px solid var(--blue-main)" : "2px solid transparent", background: roomType === "group" ? "var(--blue-soft)" : "rgba(255,255,255,0.6)", borderRadius: '12px', transition: 'all 0.3s' }}>🏆 Nhóm</button>
                <button type="button" className={`btn-secondary ${roomType === "couple" ? "active" : ""}`} onClick={() => setRoomType("couple")} style={{ flex: 1, padding: '12px', border: roomType === "couple" ? "2px solid var(--pink-main)" : "2px solid transparent", background: roomType === "couple" ? "var(--pink-soft)" : "rgba(255,255,255,0.6)", borderRadius: '12px', transition: 'all 0.3s', animation: roomType === "couple" ? "pulse 2s infinite" : "none" }}>💖 Couple</button>
              </div>
              <button className="glass-btn" type="submit">Khởi Tạo Không Gian</button>
            </form>
          </section>

          <section className="lobby-card">
            <div className="panel-header"><h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={24} color="var(--blue-main)" /> Tham Gia Băng Đảng</h2></div>
            <form onSubmit={handleJoinRoom}>
              <div className="field-group">
                <input className="lobby-input" type="text" placeholder="Mã phòng (vd: DINA)" value={joinCode} onChange={e => setJoinCode(e.target.value)} required style={{ textTransform: "uppercase", letterSpacing: '2px', textAlign: 'center', fontWeight: 'bold' }} />
              </div>
              <button className="glass-btn" type="submit" style={{ background: 'linear-gradient(135deg, var(--blue-main), #8b5cf6)' }}>Đột Nhập</button>
            </form>
          </section>
        </div>
      </section>
    );
  }

  return (
    <section className="page-panel arena-panel">
      <div className="page-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>{room.type === "couple" ? "💖 Phòng Couple" : "🏆 Phòng Nhóm"}: {room.name}</h2>
          <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Mã Phòng: <strong style={{ letterSpacing: '2px', background: 'var(--yellow-soft)', padding: '2px 8px', borderRadius: '4px', color: 'var(--yellow-main)' }}>{room.code}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="glass-btn" onClick={() => setShowInviteModal(!showInviteModal)} style={{ width: 'auto', padding: '8px 16px', background: 'transparent', color: "var(--text-main)", border: '1px solid var(--border)' }}>
            Mời bạn bè
          </button>
          <button className="glass-btn" onClick={handleLeaveRoom} style={{ width: 'auto', padding: '8px 16px', background: 'transparent', color: 'var(--red-main)', border: '1px solid var(--red-soft)' }}>
            Rời phòng
          </button>
        </div>
      </div>

      {showInviteModal && (
        <div className="panel" style={{ background: 'var(--surface)', border: '1px solid var(--blue-main)', padding: '16px', marginBottom: '20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, color: 'var(--blue-main)' }}>Mời bạn bè vào phòng</h3>
            <button className="btn-quick" onClick={() => setShowInviteModal(false)}>Đóng</button>
          </div>
          <div className="leaderboard-list">
            {friendsToInvite.length === 0 ? <p className="panel-meta">Chưa có bạn bè nào để mời.</p> :
              friendsToInvite.map(f => (
                <div key={f.id} className="leaderboard-row" style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={f.gender === "female" ? "/ran-task.png" : "/conan-avatar.png"} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                    <strong>{f.username}</strong>
                  </div>
                  <button className="glass-btn" onClick={() => handleSendInvite(f.id)} style={{ padding: '6px 12px', fontSize: '13px', width: 'auto', background: 'var(--blue-main)' }}>Gửi lời mời</button>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {room.race_status === "running" ? (
        <section className="panel" style={{ background: 'var(--glass-bg)', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
          <div className="panel-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 8px 0' }}><Zap size={20} color="var(--yellow-main)" /> Cuộc Đua {room.target_score} phút</h2>
              {(room.race_reward || room.race_penalty) && (
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', marginTop: '8px' }}>
                  {room.race_reward && <span style={{ color: 'var(--green-main)', background: 'var(--green-soft)', padding: '4px 8px', borderRadius: '8px' }}>🎁 Thưởng: {room.race_reward}</span>}
                  {room.race_penalty && <span style={{ color: 'var(--red-main)', background: 'var(--red-soft)', padding: '4px 8px', borderRadius: '8px' }}>💀 Phạt: {room.race_penalty}</span>}
                </div>
              )}
            </div>
            <button className="glass-btn" onClick={handleSurrender} style={{ padding: '6px 12px', fontSize: '13px', background: 'transparent', color: 'var(--red-main)', border: '1px solid var(--red-main)' }}>🏳️ Đầu hàng</button>
          </div>
          <div className="race-track-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {members.map(member => {
              let liveProgress = member.room_progress;
              if (member.id === currentUser?.id && timerRunning && activeTask) {
                const elapsedMinutes = activeTask.duration - (timerSeconds / 60);
                liveProgress += Math.max(0, elapsedMinutes);
              }
              const progressPct = Math.min(100, Math.max(0, (liveProgress / room.target_score) * 100));
              const isWinner = progressPct >= 100;
              return (
                <div key={member.id} className="race-lane" style={{ position: 'relative', width: '100%', height: '90px' }}>
                  {/* Track background */}
                  <div style={{ position: 'absolute', bottom: '20px', left: 0, right: '32px', height: '16px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }}>
                    <div style={{ width: `${progressPct}%`, height: '100%', background: isWinner ? 'var(--yellow-main)' : 'linear-gradient(90deg, var(--pink-main), var(--blue-main))', borderRadius: '8px', transition: 'width 1s linear', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                  </div>

                  {/* Finish Line Heart */}
                  <div style={{ position: 'absolute', right: 0, bottom: '12px', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '2px solid var(--pink-main)' }}>
                    <Heart size={20} color="var(--pink-main)" fill="var(--pink-main)" />
                  </div>

                  {/* Avatar Car */}
                  <div style={{
                    position: 'absolute',
                    bottom: '34px',
                    left: `calc(${progressPct}% - 28px)`,
                    transition: 'left 1s linear',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 2
                  }}>
                    {isWinner && <Trophy size={28} color="gold" style={{ position: 'absolute', top: '-30px', animation: 'bounce 1s infinite', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />}
                    <img src={member.gender === "female" ? "/ran-task.png" : "/conan-avatar.png"} alt="racer" style={{ width: 56, height: 56, borderRadius: '50%', border: isWinner ? '4px solid gold' : '3px solid var(--text-main)', objectFit: 'cover', background: 'white', boxShadow: '0 4px 8px rgba(0,0,0,0.15)', cursor: 'pointer' }} onClick={() => setViewingProfileId(member.id)} />
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)', whiteSpace: 'nowrap', marginTop: '4px', background: 'rgba(255,255,255,0.9)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                      {Math.floor(liveProgress)} / {room.target_score}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : room.race_status === "pending" ? (
        <section className="panel" style={{ background: 'var(--yellow-soft)', padding: '20px', borderRadius: '16px', marginBottom: '20px', textAlign: 'center', border: '1px solid var(--yellow-main)' }}>
          <h3 style={{ marginTop: 0, color: 'var(--yellow-main)' }}>Thách Đấu Cuộc Đua {room.target_score} phút</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '16px', marginTop: '12px' }}>
            {room.race_reward && <span style={{ color: 'var(--green-main)', fontWeight: 'bold' }}>🎁 Thưởng: {room.race_reward}</span>}
            {room.race_penalty && <span style={{ color: 'var(--red-main)', fontWeight: 'bold' }}>💀 Phạt: {room.race_penalty}</span>}
          </div>

          {room.race_proposer_id === currentUser?.id ? (
            <div>
              <p style={{ color: 'var(--text-main)', marginBottom: '16px' }}>Đang đợi đối phương chấp nhận lời thách đấu...</p>
              <button className="glass-btn" onClick={() => handleRespondRace('reject')} style={{ width: 'auto', padding: '8px 24px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Huỷ đề xuất</button>
            </div>
          ) : (
            <div>
              <p style={{ color: 'var(--text-main)', marginBottom: '16px' }}>Đối phương vừa gửi một lời thách đấu. Bạn có dám nhận?</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="glass-btn" onClick={() => handleRespondRace('accept')} style={{ width: 'auto', padding: '8px 24px', background: 'var(--blue-main)', color: 'white' }}>Nhận Lời</button>
                <button className="glass-btn" onClick={() => handleRespondRace('reject')} style={{ width: 'auto', padding: '8px 24px', background: 'transparent', color: 'var(--red-main)', border: '1px solid var(--red-main)' }}>Từ chối</button>
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="panel" style={{ background: 'var(--glass-bg)', padding: '20px', borderRadius: '16px', marginBottom: '20px', textAlign: 'center' }}>
          <h3 style={{ marginTop: 0, color: 'var(--text-main)' }}>Thiết Lập Lời Thách Đấu</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>Tạo cuộc đua thời gian học để thi xem ai đạt mục tiêu trước. Kèm theo phần thưởng & hình phạt!</p>
          <form onSubmit={handleProposeRace} style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', maxWidth: '400px', margin: '0 auto' }}>
            <input type="number" min="10" max="10000" className="lobby-input" style={{ width: '100%', marginBottom: 0 }} value={raceTargetInput} onChange={e => setRaceTargetInput(e.target.value)} placeholder="Số phút mục tiêu (VD: 50)" required />
            <input type="text" className="lobby-input" style={{ width: '100%', marginBottom: 0 }} value={raceRewardInput} onChange={e => setRaceRewardInput(e.target.value)} placeholder="🎁 Phần thưởng (Tuỳ chọn)" />
            <input type="text" className="lobby-input" style={{ width: '100%', marginBottom: 0 }} value={racePenaltyInput} onChange={e => setRacePenaltyInput(e.target.value)} placeholder="💀 Hình phạt khi đầu hàng (Tuỳ chọn)" />
            <button className="glass-btn" type="submit" style={{ width: '100%', background: 'var(--blue-main)' }}>Đề xuất Cuộc đua</button>
          </form>
        </section>
      )}

      <section className="panel">
        <div className="panel-header">
          <h2><Trophy size={20} color="var(--yellow-main)" /> Bảng Xếp Hạng</h2>
          <span className="panel-meta">{members.length} thành viên</span>
        </div>

        <div className="leaderboard-list">
          {members.map((member, index) => {
            const rankClass = index < 3 ? `rank-${index + 1}` : '';
            return (
              <div key={member.id} className={`leaderboard-row ${member.id === currentUser?.id ? 'is-me' : ''} ${rankClass}`}>
                <div className="rank-col">
                  {index === 0 ? <span className="rank-badge gold" style={{ transform: 'scale(1.2)' }}>1</span> :
                    index === 1 ? <span className="rank-badge silver" style={{ transform: 'scale(1.1)' }}>2</span> :
                      index === 2 ? <span className="rank-badge bronze">3</span> :
                        <span className="rank-badge">{index + 1}</span>}
                </div>
                <div className="user-col" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <img src={member.gender === "female" ? "/ran-task.png" : "/conan-avatar.png"} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', marginRight: '12px', border: index === 0 ? '2px solid gold' : 'none', padding: index === 0 ? '2px' : '0' }} />
                  <div>
                    <strong>{member.username} {member.id === currentUser?.id && "(Bạn)"}</strong>
                    <span className="last-active" style={{ display: 'block' }}>
                      {member.last_flow_time ? `Online ${formatLogTime(member.last_flow_time)}` : "Chưa có dữ liệu"}
                    </span>
                  </div>
                </div>
                <div className="stats-col" style={{ display: 'flex', gap: '10px' }}>
                  <div className="stat-pill" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--red-soft)', color: 'var(--red-main)', padding: '4px 8px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>
                    <Flame size={16} color="var(--red-main)" /> {member.flow_streak}
                  </div>
                  <div className="stat-pill" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--yellow-soft)', color: 'var(--yellow-main)', padding: '4px 8px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>
                    <Coins size={16} color="var(--yellow-main)" /> {member.dopa_balance}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
}

function Sidebar({ activePage, onNavigate, currentRoom, onLogout }) {
  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="brand">
        <img src="/conan-logo.png" alt="DinaFlow Logo" className="brand-logo" />
        <span>DinaFlow</span>
      </div>

      <nav className="nav-list" aria-label="Primary navigation" style={{ flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const label = item.label;
          return (
            <button
              className={`nav-item ${activePage === item.id ? "is-active" : ""}`}
              key={item.id}
              onClick={() => onNavigate(item.id)}
              type="button"
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
      <div style={{ padding: '0 16px', marginBottom: '16px' }}>
        <button className="nav-item" onClick={onLogout} style={{ color: 'var(--red-main)', justifyContent: 'center' }}>
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </div>
      <div className="sidebar-bottom">
        <div className="speech-bubble">
          Hãy tin vào bản thân! ✨<br />Tập trung cao độ nào!
        </div>
        <img src="/conan-mascot.png" alt="Conan Mascot" className="sidebar-mascot" />
        <div className="profile-card">
          <div className="profile-header">
            <img src="/conan-avatar.png" alt="Avatar" className="profile-avatar" />
            <div className="profile-info">
              <strong>Học giả</strong>
              <span>Lv. 12</span>
            </div>
          </div>
          <div className="profile-streak">Chuỗi tập trung: 7 🔥</div>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ completedCount, taskCount, totalMinutes, balance, recoveryScore, flowStreak, partnerInfo, partnerStatus, partnerFocusStatus, currentUser, currentRoom, onPoke, onMessage, onAvatarClick, notificationCount, setNotificationCount, notifications, onNavigate }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const isCouple = currentRoom?.type === "couple";
  let multiplier = 1.0;
  if (flowStreak === 2) multiplier = 1.2;
  if (flowStreak === 3) multiplier = 1.5;
  if (flowStreak >= 4) multiplier = 2.0;

  return (
    <>
      <header className="topbar">
        <div className="greeting">
          <h1>Xin chào, {currentUser?.username || "Bạn"}! {currentUser?.gender === "female" ? "👧" : "🕵️"}</h1>
          <p>Sẵn sàng chinh phục mục tiêu hôm nay chưa?</p>
        </div>
        <div className="top-actions">
          {flowStreak > 1 && (
            <div className="pill-sm yellow" style={{ padding: "8px 12px", fontSize: "14px", marginRight: "10px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Flame size={16} /> Combo x{multiplier}
            </div>
          )}
          <div className="date-widget">
            <Calendar size={20} />
            <div className="date-text">
              <strong>{todayLabel()}</strong>
              <span>{weekdayLabel()}</span>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <button className="icon-btn" onClick={() => { setShowNotifications(!showNotifications); setNotificationCount(0); }}>
              <Bell size={20} />
              {notificationCount > 0 && (
                <span style={{ position: 'absolute', top: '2px', right: '4px', background: 'var(--red-main)', color: 'white', borderRadius: '10px', fontSize: '10px', padding: '1px 5px', fontWeight: 'bold' }}>
                  {notificationCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div style={{ position: 'absolute', top: '40px', right: '0', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', width: '280px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', zIndex: 100 }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)' }}>
                  Thông báo
                  <button onClick={() => setShowNotifications(false)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '8px 0' }}>
                  {notifications?.length > 0 ? notifications.map((n, i) => (
                    <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => { setShowNotifications(false); onNavigate(n.type === 'room' ? 'arena' : 'friends'); }}>
                      <span style={{ fontSize: '20px' }}>{n.type === 'friend' ? '👋' : n.type === 'partner' ? '💖' : '🚪'}</span>
                      <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>{n.message}</span>
                    </div>
                  )) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>Không có thông báo nào</div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {partnerInfo && (
              <>
                <button className="btn-poke" onClick={onMessage} title="Gửi lời nhắn cho Partner!" style={{ background: 'var(--blue-soft)', color: 'var(--blue-main)' }}><MessageCircle size={18} /></button>
                <button className="btn-poke" onClick={onPoke} title="Gửi Tym cho Partner!">💖</button>
                <div className="partner-avatar" onClick={onAvatarClick} style={{ position: "relative", cursor: "pointer", border: partnerFocusStatus === "away" ? "2px solid var(--red-main)" : (partnerStatus === "flowing" ? "2px solid var(--blue-main)" : "2px solid var(--green-main)"), borderRadius: "50%", padding: "2px" }} title={`Xem hồ sơ của ${partnerInfo.username}`}>
                  <img src={partnerInfo?.gender === "female" ? "/ran-task.png" : "/conan-avatar.png"} alt="Partner" style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", opacity: partnerFocusStatus === "away" ? 0.5 : 1 }} />
                  <span style={{ position: "absolute", bottom: -5, right: -5, background: partnerFocusStatus === "away" ? "var(--red-main)" : (partnerStatus === "flowing" ? "var(--blue-main)" : "var(--green-main)"), width: 12, height: 12, borderRadius: "50%", border: "2px solid white" }}></span>
                  {partnerFocusStatus === "away" && <span style={{ position: 'absolute', top: -10, right: -10, fontSize: '16px' }}>💤</span>}
                </div>
              </>
            )}
            <div className="avatar-btn" title="Hồ sơ">
              <img src={currentUser?.gender === "female" ? "/ran-task.png" : "/conan-avatar.png"} alt="Profile" />
            </div>
          </div>
        </div>
      </header>

      <div className="summary-grid">
        <section className={`summary-card ${isCouple ? 'yellow' : 'pink'}`}>
          <div className="icon-wrap">{isCouple ? <Heart /> : <Zap />}</div>
          <div className="summary-content">
            <span>{isCouple ? "Quỹ Tình Yêu" : "Xu"}</span>
            <strong>{balance.toLocaleString()} {isCouple ? "💖" : "💎"}</strong>
          </div>
          <div className={`pill-sm ${isCouple ? 'pink' : 'blue'}`}>{isCouple ? "Vun đắp tình cảm" : "Nỗ lực bản thân"}</div>
        </section>

        <section className="summary-card blue">
          <div className="icon-wrap"><Flame /></div>
          <div className="summary-content">
            <span>Thời gian tập trung</span>
            <strong>2h 35m</strong>
          </div>
          <div className="pill-sm blue">+2 phiên hôm nay</div>
        </section>

        <section className="summary-card pink">
          <div className="icon-wrap"><Heart /></div>
          <div className="summary-content">
            <span>Độ tập trung</span>
            <strong>92%</strong>
          </div>
          <div className="pill-sm pink">Tuyệt vời!</div>
        </section>

        <section className="summary-card yellow">
          <div className="icon-wrap"><Zap /></div>
          <div className="summary-content">
            <span>Chuỗi ngày</span>
            <strong>7</strong>
          </div>
          <div className="pill-sm yellow">Đang cháy! 🔥</div>
        </section>
      </div>
    </>
  );
}

function StatusNotice({ message, onClose }) {
  if (!message || message === "Sẵn sàng cho phiên làm việc hôm nay.") return null;

  return (
    <div style={{
      position: "fixed",
      top: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "var(--yellow-soft)",
      color: "var(--yellow-main)",
      padding: "16px 24px",
      borderRadius: "12px",
      fontWeight: "bold",
      border: "2px solid var(--yellow-main)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      zIndex: 9999,
      animation: "bounce 0.5s ease",
      display: "flex",
      alignItems: "center",
      gap: "16px"
    }}>
      <span>{message}</span>
      <button 
        onClick={onClose}
        style={{
          background: "rgba(0,0,0,0.05)",
          border: "none",
          color: "var(--yellow-main)",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "14px",
          padding: "6px 12px",
          borderRadius: "8px",
          transition: "all 0.2s"
        }}
      >
        ✕
      </button>
    </div>
  );
}

function AiAdvisor({ burnoutRisk, completedCount, timerRunning, totalMinutes, flowStreak }) {
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAdvice = () => {
    setLoading(true);
    apiFetch("http://localhost:3000/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context: { burnoutRisk, completedCount, timerRunning, totalMinutes, flowStreak }
      })
    })
      .then(res => res.json())
      .then(data => {
        setAdvice(data.advice);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setAdvice("Đã xảy ra lỗi khi kết nối với máy chủ AI.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAdvice();
  }, [timerRunning, completedCount]); // Re-fetch on major state changes

  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))', padding: '16px', borderRadius: '16px', border: '1px solid rgba(139,92,246,0.3)', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--blue-main)' }}>
          <Brain size={20} />
          <strong style={{ fontSize: '14px' }}>AI Phân Tích & Kế Hoạch</strong>
        </div>
        <button onClick={fetchAdvice} disabled={loading} style={{ background: 'transparent', border: 'none', color: 'var(--blue-main)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Activity size={14} className={loading ? "spin" : ""} /> {loading ? "Đang xử lý..." : "Làm mới"}
        </button>
      </div>
      <div style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
        {loading ? (
          <span style={{ color: 'var(--text-muted)' }}>Mô hình AI đang phân tích dữ liệu học tập của bạn...</span>
        ) : (
          advice
        )}
      </div>
    </div>
  );
}

function DashboardView({ activeTask, balance, burnoutRisk, completedCount, logs, onAddRecovery, onCompleteTask, onRedeemReward, onSelectTask, onTaskSubmit, onToggleTimer, tasks, timerRunning, timerSeconds, socket, partnerInfo, setLogDraft, setTaskDraft, logDraft, taskDraft, onNavigate, rewards, totalMinutes, flowStreak }) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedRewardId, setSelectedRewardId] = useState(null);

  return (
    <>
      <div className="dashboard-main">
        {/* Left Column */}
        <div className="col-stack">
          <TasksPanel
            activeTaskId={activeTask?.id}
            completedCount={completedCount}
            onCompleteTask={onCompleteTask}
            onSelectTask={onSelectTask}
            onTaskSubmit={onTaskSubmit}
            setTaskDraft={setTaskDraft}
            taskDraft={taskDraft}
            tasks={tasks}
            isAdding={isAddingTask}
            setIsAdding={setIsAddingTask}
          />
          <section className="panel">
            <div className="panel-header">
              <h2><Heart size={20} color="var(--pink-main)" /> Nhật ký phục hồi</h2>
            </div>
            <LogList logs={logs.slice(0, 3)} />
          </section>

          <AiAdvisor burnoutRisk={burnoutRisk} completedCount={completedCount} timerRunning={timerRunning} totalMinutes={totalMinutes} flowStreak={flowStreak} />
        </div>

        {/* Center Column */}
        <div className="col-stack">
          <FocusPanel
            activeTask={activeTask}
            onCompleteTask={onCompleteTask}
            onToggleTimer={onToggleTimer}
            timerRunning={timerRunning}
            timerSeconds={timerSeconds}
          />
          <div className="sticky-note">
            <div className="sticky-tape" />
            <img src="/heiji-note.png" alt="Note mascot" className="note-mascot-img" />
            <div className="sticky-text">
              Một vụ án khó cũng có lời giải.<br />Nghỉ ngơi cũng là chiến lược! 🔍
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-stack">
          <section className="panel">
            <div className="panel-header">
              <h2><Gift size={20} color="var(--text-main)" /> Kho phần thưởng</h2>
              <button className="link-btn-sub" onClick={() => onNavigate("rewards")}>Xem tất cả</button>
            </div>
            <div className="reward-list">
              {rewards.slice(0, 4).map((reward, i) => {
                const colors = ["pink", "blue", "yellow", "purple"];
                const color = colors[i % colors.length];
                const Icon = rewardIconMap[reward.iconKey] || Gift;

                return (
                  <div
                    key={reward.id}
                    className="reward-item"
                    style={{
                      cursor: "pointer",
                      background: selectedRewardId === reward.id ? "var(--pink-soft)" : "transparent",
                      padding: selectedRewardId === reward.id ? "8px" : "12px 0",
                      margin: selectedRewardId === reward.id ? "4px -8px" : "0",
                      borderRadius: "8px",
                      opacity: reward.redeemed ? 0.5 : 1
                    }}
                    onClick={() => !reward.redeemed && setSelectedRewardId(reward.id)}
                  >
                    <div className="reward-info">
                      <div className={`reward-icon ${color}`}>
                        <Icon size={18} />
                      </div>
                      <span className="reward-name" style={{ textDecoration: reward.redeemed ? "line-through" : "none" }}>{reward.name}</span>
                    </div>
                    <div className="reward-cost">{reward.cost} <span style={{ color: "var(--yellow-main)" }}>🪙</span></div>
                  </div>
                );
              })}
            </div>
            <button
              className="btn-redeem"
              onClick={() => {
                if (selectedRewardId) {
                  onRedeemReward(selectedRewardId);
                  setSelectedRewardId(null);
                }
              }}
              style={{ opacity: selectedRewardId ? 1 : 0.5 }}
              disabled={!selectedRewardId}
            >
              Đổi thưởng <Sparkles size={18} />
            </button>
          </section>

          <RiskPanel burnoutRisk={burnoutRisk} socket={socket} partnerInfo={partnerInfo} />

          <section className="panel">
            <div className="panel-header">
              <h2><Calendar size={20} /> Thao tác nhanh</h2>
            </div>
            <button className="btn-quick green" onClick={onToggleTimer}><Play size={18} /> Bắt đầu Flow</button>
            <button className="btn-quick purple" onClick={() => setIsAddingTask(true)}><Plus size={18} /> Thêm nhiệm vụ</button>
            <button className="btn-quick pink" onClick={() => onNavigate("logs")}><Heart size={18} /> Ghi phục hồi</button>
            <button className="btn-quick blue" onClick={() => onNavigate("logs")}><Activity size={18} /> Xem nhật ký</button>
          </section>
        </div>
      </div>
    </>
  );
}

function TasksPanel({ activeTaskId, completedCount, onCompleteTask, onSelectTask, onTaskSubmit, setTaskDraft, taskDraft, tasks, isAdding, setIsAdding }) {
  return (
    <section className="panel" style={{ display: "flex", flexDirection: "column" }}>
      <div className="panel-header">
        <h2><CheckSquare size={20} /> Nhiệm vụ hôm nay</h2>
        <button className="link-btn" onClick={() => setIsAdding(!isAdding)}>+ Thêm</button>
      </div>

      {isAdding && (
        <form onSubmit={(e) => { onTaskSubmit(e); setIsAdding(false); }} style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          <input
            type="text"
            value={taskDraft}
            onChange={(e) => setTaskDraft(e.target.value)}
            placeholder="Thêm nhiệm vụ mới..."
            style={{ flex: 1, padding: "10px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}
            autoFocus
          />
          <button type="submit" className="pill-sm green" style={{ border: "none", cursor: "pointer", fontSize: "14px", alignSelf: "center", padding: "8px 16px" }}>
            Thêm
          </button>
        </form>
      )}

      <div className="task-list">
        {tasks.map(task => {
          let pillClass = "purple";
          if (task.category.includes("Sức khỏe")) pillClass = "green";
          else if (task.category.includes("Học tập")) pillClass = "blue";
          else if (task.category.includes("Cá nhân")) pillClass = "pink";

          return (
            <div
              key={task.id}
              className={`task-item ${task.status === "done" ? "completed" : ""} ${activeTaskId === task.id ? "active" : ""}`}
              onClick={() => onSelectTask(task.id)}
              style={{ cursor: "pointer", background: activeTaskId === task.id && task.status !== "done" ? "var(--purple-soft)" : "transparent", padding: activeTaskId === task.id && task.status !== "done" ? "8px" : "6px 0", borderRadius: "8px", margin: activeTaskId === task.id && task.status !== "done" ? "0 -8px" : "0" }}
            >
              <div className="check-circle" onClick={(e) => { e.stopPropagation(); onCompleteTask(task.id); }}>
                {task.status === "done" && <Check size={14} />}
              </div>
              <span className="task-title">{task.title}</span>
              <span className={`pill-sm ${pillClass}`}>{task.category}</span>
              <span className="task-reward" style={{ marginLeft: "auto" }}>+{task.reward} 🪙</span>
            </div>
          );
        })}
      </div>

      <div className="task-progress">
        <div className="progress-info">
          <span className="progress-text">{completedCount} trong {tasks.length} hoàn thành</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }} />
          </div>
        </div>
        <img src="/ran-task.png" alt="Task Mascot" className="task-mascot-img" />
      </div>
    </section>
  );
}

function FocusPanel({ activeTask, onCompleteTask, onToggleTimer, timerRunning, timerSeconds, burnoutRisk }) {
  const progress = activeTask ? Math.max(0, Math.min(100, 100 - (timerSeconds / (activeTask.duration * 60)) * 100)) : 0;

  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const isLocked = burnoutRisk > 65;

  return (
    <section className="panel timer-panel">
      <div className="panel-header" style={{ width: "100%", marginBottom: 0 }}>
        <h2><span style={{ color: "var(--red-main)" }}>🔍</span> Flow điều tra</h2>
        <button className="icon-btn" style={{ border: "none" }}><Music size={20} /></button>
      </div>

      <div className="timer-circle-wrapper">
        <svg width="240" height="240" viewBox="0 0 240 240" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="120" cy="120" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
          <circle cx="120" cy="120" r={radius} fill="none" stroke="var(--red-main)" strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear" }} />
        </svg>
        <img src="/ai-timer.png" alt="Timer Mascot" className="timer-mascot-img" />
        <div className="timer-inner">
          <span className="timer-label">Thời gian tập trung</span>
          <span className="timer-time">{formatTimer(timerSeconds)}</span>
          <div className="timer-category">
            {activeTask?.category || "Chưa chọn"} <ChevronDown size={14} />
          </div>
        </div>
      </div>

      {isLocked && (
        <div style={{ color: "var(--red-main)", fontSize: "14px", fontWeight: "600", marginBottom: "8px", textAlign: "center" }}>
          ⚠️ Bị khóa do Cortisol cao!
        </div>
      )}

      <div className="timer-actions">
        <button
          className={`btn-start ${isLocked ? "disabled" : ""}`}
          onClick={onToggleTimer}
          disabled={isLocked}
          style={isLocked ? { background: "var(--text-muted)", color: "white" } : {}}
        >
          {timerRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          {timerRunning ? "Tạm dừng" : "Bắt đầu Flow"}
        </button>
        <button className="btn-settings"><SlidersHorizontal size={20} /></button>
      </div>
    </section>
  );
}

function RiskPanel({ burnoutRisk, socket, partnerInfo }) {
  let status = "Thấp";
  let statusColor = "var(--green-main)";
  let markerPos = "20%";
  if (burnoutRisk > 35) { status = "Vừa"; statusColor = "var(--yellow-main)"; markerPos = "50%"; }
  if (burnoutRisk > 65) { status = "Cao"; statusColor = "var(--red-main)"; markerPos = "80%"; }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2><Heart size={20} color="var(--red-main)" /> Nguy cơ kiệt sức</h2>
        <img src="/kid-risk.png" alt="Cloud Mascot" className="cloud-mascot-img" style={{ width: "36px" }} />
      </div>
      <div className="burnout-status" style={{ color: statusColor }}>{status}</div>
      <div className="burnout-bar">
        <div className="burnout-marker" style={{ left: markerPos, borderColor: statusColor }} />
      </div>
      <div className="burnout-msg" style={{ marginBottom: "12px" }}>{burnoutRisk <= 35 ? "Tốt lắm! Tiếp tục nhé 🔍" : burnoutRisk <= 65 ? "Cẩn thận, nghỉ ngơi đi! ⚠️" : "Cần nghỉ ngơi ngay! 🚨"}</div>

      {partnerInfo && (
        <button
          className="btn-quick pink"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={() => {
            if (socket) {
              socket.emit("partner_rescue", { partnerId: partnerInfo.id, points: 20 });
              alert(`Đã truyền 20 điểm Phục hồi sang cho ${partnerInfo.username}!`);
            }
          }}
        >
          <Heart size={18} /> Cứu trợ Partner
        </button>
      )}
    </section>
  );
}

function RewardList({ rewards, onRedeemReward, limit }) {
  const displayRewards = limit ? rewards.slice(0, limit) : rewards;
  return (
    <div className="reward-list" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {displayRewards.map((reward, i) => {
        const bgClasses = ["pink", "blue", "orange"];
        const bgClass = bgClasses[i % bgClasses.length];

        return (
          <div className="reward-item" key={reward.id}>
            <div className={`reward-icon-bg ${bgClass}`}>
              <Gift size={20} />
            </div>
            <div className="reward-info">{reward.name}</div>
            <div className="reward-cost">{reward.cost} 🪙</div>
          </div>
        );
      })}
    </div>
  );
}

function LogList({ logs }) {
  return (
    <div className="logs-list">
      {logs.map((log, i) => {
        const bgClasses = ["green", "purple", "pink"];
        const bgClass = bgClasses[i % bgClasses.length];
        const emojiMap = {
          "Oxytocin": "🧘",
          "Serotonin": "🌙",
          "Endorphin": "💗"
        };
        const detail = log.duration || `+${Number(log.points || 0)} recovery pts`;

        return (
          <div className="log-item" key={log.id}>
            <div className={`log-icon ${bgClass}`}>{emojiMap[log.type] || "😊"}</div>
            <div className="log-content">
              <strong>{log.activity}</strong>
              <span>{detail} / {log.type}</span>
            </div>
            <div className="log-meta">
              <span>{formatLogTime(log.time || log.date)}</span>
              <Smile size={16} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Fallback Views for other sidebar tabs */
function TasksView(props) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  return (
    <section className="page-panel">
      <div className="page-heading">
        <h2>Nhiệm vụ</h2>
        <p>Chia dự án thành các việc nhỏ có thưởng.</p>
      </div>
      <TasksPanel
        completedCount={props.tasks.filter((t) => t.status === "done").length}
        isAdding={isAddingTask}
        setIsAdding={setIsAddingTask}
        {...props}
      />
    </section>
  );
}

function TimerView({ activeTask, onCompleteTask, onToggleTimer, timerRunning, timerSeconds, burnoutRisk }) {
  return (
    <section className="page-panel">
      <div className="page-heading">
        <h2>Đồng hồ</h2>
        <p>Bảo vệ từng phiên làm việc tập trung.</p>
      </div>
      <div style={{ maxWidth: "400px" }}>
        <FocusPanel activeTask={activeTask} onCompleteTask={onCompleteTask} onToggleTimer={onToggleTimer} timerRunning={timerRunning} timerSeconds={timerSeconds} burnoutRisk={burnoutRisk} />
      </div>
    </section>
  );
}

function RewardsView({ balance, rewards, onRedeemReward, onAddReward, rewardDraft, setRewardDraft }) {
  const [selectedRewardId, setSelectedRewardId] = useState(null);
  const selectedReward = rewards.find((reward) => reward.id === selectedRewardId);
  const canRedeem = Boolean(selectedReward && !selectedReward.redeemed && balance >= selectedReward.cost);
  const selectedShortfall = selectedReward ? Math.max(0, selectedReward.cost - balance) : 0;

  async function handleRedeemSelected() {
    if (!selectedReward || !canRedeem) {
      return;
    }

    await onRedeemReward(selectedReward.id);
    setSelectedRewardId(null);
  }

  function handleAddReward(event) {
    onAddReward(event);
    setSelectedRewardId(null);
  }

  return (
    <section className="page-panel">
      <div className="page-heading">
        <div>
          <h2>Tặng quà</h2>
          <p>Dành Quỹ tình yêu để mang lại niềm vui cho nhau.</p>
        </div>
        <div className="wallet-pill" style={{ color: "var(--red-main)", borderColor: "var(--red-soft)" }}>
          <Heart size={18} />
          {balance.toLocaleString()} 💖
        </div>
      </div>

      <div className="rewards-layout">
        <section className="panel rewards-list-panel">
          <div className="panel-header">
            <h2><Gift size={20} /> Cửa hàng Quà tặng</h2>
            <span className="panel-meta">{rewards.length} mục</span>
          </div>

          <div className="reward-full-list">
            {rewards.map((reward, index) => {
              const colors = ["pink", "blue", "yellow", "purple"];
              const color = colors[index % colors.length];
              const Icon = rewardIconMap[reward.iconKey] || Gift;
              const isSelected = selectedRewardId === reward.id;

              return (
                <button
                  className={`reward-row ${isSelected ? "is-selected" : ""} ${reward.redeemed ? "is-redeemed" : ""}`}
                  disabled={reward.redeemed}
                  key={reward.id}
                  onClick={() => setSelectedRewardId(reward.id)}
                  type="button"
                >
                  <span className="reward-info">
                    <span className={`reward-icon ${color}`}>
                      <Icon size={18} />
                    </span>
                    <span className="reward-copy">
                      <span className="reward-name">{reward.name}</span>
                      <span>{reward.redeemed ? "Đã đổi" : "Sẵn sàng đổi"}</span>
                    </span>
                  </span>
                  <span className="reward-cost">{reward.cost} 💖</span>
                </button>
              );
            })}
          </div>

          <div className="reward-action-bar">
            <div>
              <strong>{selectedReward ? selectedReward.name : "Chọn một phần thưởng"}</strong>
              <span>
                {selectedReward
                  ? selectedShortfall > 0
                    ? `Cần thêm ${selectedShortfall} 💖`
                    : `${selectedReward.cost} 💖 sẽ được trừ khỏi Quỹ Tình Yêu`
                  : "Danh sách này đồng bộ với Reward Vault ở dashboard"}
              </span>
            </div>
            <button className="btn-redeem" disabled={!canRedeem} onClick={handleRedeemSelected} type="button">
              Đổi thưởng <Sparkles size={18} />
            </button>
          </div>
        </section>

        <section className="panel rewards-form-panel">
          <div className="panel-header">
            <h2><CirclePlus size={20} /> Thêm phần thưởng</h2>
          </div>
          <form className="reward-form" onSubmit={handleAddReward}>
            <label className="field-group">
              <span>Tên phần thưởng</span>
              <input
                className="text-input"
                onChange={(event) => setRewardDraft((draft) => ({ ...draft, name: event.target.value }))}
                placeholder="Ví dụ: Đi cafe 30 phút"
                type="text"
                value={rewardDraft.name}
              />
            </label>

            <label className="field-group">
              <span>Chi phí xu</span>
              <input
                className="text-input"
                min="1"
                onChange={(event) => setRewardDraft((draft) => ({ ...draft, cost: event.target.value }))}
                type="number"
                value={rewardDraft.cost}
              />
            </label>

            <label className="field-group">
              <span>Biểu tượng</span>
              <select
                className="text-input"
                onChange={(event) => setRewardDraft((draft) => ({ ...draft, iconKey: event.target.value }))}
                value={rewardDraft.iconKey}
              >
                {rewardIconOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button className="btn-quick purple reward-submit" type="submit">
              <Plus size={18} /> Thêm phần thưởng
            </button>
          </form>
        </section>
      </div>
    </section>
  );
}

function LogsView({ logDraft, logs, onAddRecovery, setLogDraft }) {
  const totalPoints = logs.reduce((sum, log) => sum + Number(log.points || 0), 0);
  const latestType = logs[0]?.type ?? "No logs yet";

  return (
    <section className="page-panel">
      <div className="page-heading">
        <div>
          <h2>Nhật ký sinh lý</h2>
          <p>Lưu lại thói quen phục hồi để cân bằng hệ thống.</p>
        </div>
        <div className="wallet-pill recovery-pill">
          <Heart size={18} />
          {totalPoints} recovery pts
        </div>
      </div>

      <div className="logs-layout">
        <section className="panel logs-list-panel">
          <div className="panel-header">
            <h2><Activity size={20} /> Lịch sử phục hồi</h2>
            <span className="panel-meta">{logs.length} nhật ký</span>
          </div>
          <div className="logs-summary-strip">
            <div>
              <span>Tổng điểm</span>
              <strong>{totalPoints}</strong>
            </div>
            <div>
              <span>Loại gần nhất</span>
              <strong>{latestType}</strong>
            </div>
          </div>
          <LogList logs={logs} />
        </section>

        <section className="panel logs-form-panel">
          <div className="panel-header">
            <h2><CirclePlus size={20} /> Thêm nhật ký phục hồi</h2>
          </div>
          <form className="log-form" onSubmit={onAddRecovery}>
            <label className="field-group">
              <span>Hoạt động</span>
              <input
                className="text-input"
                onChange={(event) => setLogDraft((draft) => ({ ...draft, activity: event.target.value }))}
                placeholder="Giãn cơ, đi bộ, ngủ sâu..."
                type="text"
                value={logDraft.activity}
              />
            </label>

            <label className="field-group">
              <span>Loại hormone</span>
              <select
                className="text-input"
                onChange={(event) => setLogDraft((draft) => ({ ...draft, type: event.target.value }))}
                value={logDraft.type}
              >
                {recoveryTypeOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
              <small>{recoveryTypeOptions.find((option) => option.key === logDraft.type)?.helper}</small>
            </label>

            <div className="log-form-grid">
              <label className="field-group">
                <span>Thời lượng</span>
                <input
                  className="text-input"
                  onChange={(event) => setLogDraft((draft) => ({ ...draft, duration: event.target.value }))}
                  placeholder="10 phút"
                  type="text"
                  value={logDraft.duration}
                />
              </label>

              <label className="field-group">
                <span>Điểm</span>
                <input
                  className="text-input"
                  min="1"
                  onChange={(event) => setLogDraft((draft) => ({ ...draft, points: event.target.value }))}
                  type="number"
                  value={logDraft.points}
                />
              </label>
            </div>

            <button className="btn-quick pink log-submit" type="submit">
              <Plus size={18} /> Thêm nhật ký
            </button>
          </form>
        </section>
      </div>
    </section>
  );
}

function SettingsView({ onReset }) {
  return (
    <section className="page-panel">
      <div className="page-heading">
        <h2>Cài đặt</h2>
        <p>Thông tin và tùy chọn hệ thống.</p>
      </div>
      <button className="btn-quick pink" onClick={onReset} style={{ width: "fit-content" }}>
        Khôi phục dữ liệu mẫu
      </button>
    </section>
  );
}

function MechanismView() {
  return (
    <section className="page-panel">
      <div className="page-heading">
        <h2>Cơ chế Sinh học của DinaFlow</h2>
        <p>Tìm hiểu cách ứng dụng này vận hành dựa trên các hormone của não bộ.</p>
      </div>

      <div className="mechanism-grid" style={{ display: "grid", gap: "20px" }}>

        <div className="quote-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginBottom: "8px" }}>
            <Zap size={20} color="var(--blue-main)" />
            <h3 style={{ margin: 0, color: "var(--text-main)" }}>Dopamine - Quản lý Động lực và "Bập bênh Khoái lạc - Đau đớn"</h3>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6", fontWeight: "normal", fontStyle: "normal" }}>
            <strong>Cơ chế bổ sung:</strong> Não bộ có một cơ chế tự cân bằng gọi là Homeostasis (trạng thái nội môi). Khi bạn nhận quá nhiều dopamine từ các kích thích tức thời (như mạng xã hội), não sẽ tự tạo ra cảm giác "đau đớn" (sụt giảm mức nền) để cân bằng lại, khiến bạn thấy chán nản và trống rỗng sau đó.<br /><br />
            <strong>Cách DinaFlow ứng dụng:</strong><br />
            • <em>Giữ mức Dopamine nền (Baseline):</em> DinaFlow giúp bạn bảo vệ mức dopamine nền bằng cách khuyến khích "Giờ học không đối thủ" vào buổi sáng – thời điểm không chạm vào điện thoại để tránh cú sốc dopamine làm hỏng khả năng tập trung cả ngày.<br />
            • <em>Vòng lặp Dopamine lành mạnh:</em> Thay vì dopamine "rẻ tiền" từ thông báo điện thoại, "Xu" được thiết kế như một phần thưởng chậm, giúp não bộ làm quen với việc nỗ lực trước, phần thưởng sau.
          </p>
        </div>

        <div className="quote-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginBottom: "8px" }}>
            <Smile size={20} color="var(--pink-main)" />
            <h3 style={{ margin: 0, color: "var(--text-main)" }}>Endorphin - Chiến lược "Ấn về phía nỗi đau"</h3>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6", fontWeight: "normal", fontStyle: "normal" }}>
            <strong>Cơ chế bổ sung:</strong> Endorphin được tiết ra như một loại "thuốc giảm đau tự nhiên" khi cơ thể hoặc tâm trí vượt qua một ngưỡng khó chịu nhất định. Khi con người chủ động đối mặt với "nỗi đau" (như tập trung cường độ cao), lượng dopamine tiết ra sau đó sẽ bền vững và cao hơn nhiều giờ so với khoái lạc tức thời.<br /><br />
            <strong>Cách DinaFlow ứng dụng:</strong><br />
            • <em>Vượt qua 15 phút đầu tiên:</em> DinaFlow ghi nhận sự nỗ lực trong giai đoạn đầu của phiên Flow. Đây là lúc endorphin bắt đầu làm việc để làm dịu sự chán nản ban đầu, giúp bạn tiến vào trạng thái Deep Work mà không còn cảm thấy nặng nề.<br />
            • <em>Thử thách mức độ vừa phải:</em> Điều chỉnh độ khó của nhiệm vụ để bạn luôn cảm thấy bị "kéo căng" khả năng của mình nhưng không gây choáng ngợp, từ đó kích hoạt endorphin một cách tối ưu.
          </p>
        </div>

        <div className="quote-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginBottom: "8px" }}>
            <Sun size={20} color="var(--yellow-main)" />
            <h3 style={{ margin: 0, color: "var(--text-main)" }}>Serotonin & Oxytocin - Hệ thống Phục hồi bền vững</h3>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6", fontWeight: "normal", fontStyle: "normal" }}>
            <strong>Cơ chế bổ sung:</strong> Serotonin và Oxytocin là những chất dẫn truyền giúp chúng ta cảm thấy hạnh phúc bền vững và an toàn, khác với sự phấn khích ngắn hạn của Dopamine. Sự thiếu hụt các hormone này do làm việc quá sức thường dẫn đến trầm cảm và kiệt sức.<br /><br />
            <strong>Cách DinaFlow ứng dụng:</strong><br />
            • <em>Ranh giới giữa Công việc và Đời sống:</em> DinaFlow khuyến khích việc "rút phích cắm" và dành thời gian cho gia đình, bạn bè. Sự kết nối này (Oxytocin) là một rào cản tự nhiên giúp ngăn chặn chứng nghiện công việc (Workaholism).<br />
            • <em>Ghi nhận giá trị tự thân:</em> Việc hoàn thành nhiệm vụ và nhận được sự tự hào về sự phát triển bản thân (Serotonin) giúp bạn thấy mình có giá trị mà không cần phải làm việc đến mức kiệt quệ để tìm kiếm sự công nhận bên ngoài.
          </p>
        </div>

        <div className="quote-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginBottom: "8px" }}>
            <Flame size={20} color="var(--red-main)" />
            <h3 style={{ margin: 0, color: "var(--text-main)" }}>Cortisol - Ngăn ngừa "Cơn nghiện thế kỷ" và Kiệt sức</h3>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6", fontWeight: "normal", fontStyle: "normal" }}>
            <strong>Cơ chế bổ sung:</strong> Stress kéo dài làm tăng Cortisol, dẫn đến suy giảm chức năng não bộ, mất ngủ và thậm chí là tử vong sớm do làm việc quá sức (Karoshi). Những người nghiện việc thường dùng công việc để trốn chạy các vấn đề tâm lý, khiến Cortisol luôn ở mức cao.<br /><br />
            <strong>Cách DinaFlow ứng dụng:</strong><br />
            • <em>Phân tích nguy cơ:</em> DinaFlow tích hợp bảng đánh giá nguy cơ kiệt sức để cảnh báo khi bạn đang chuyển từ "Say mê công việc" sang "Nghiện việc".<br />
            • <em>Cơ chế nghỉ ngơi chủ động:</em> Khi hệ thống nhận diện số điểm tiêu hao quá lớn, nó sẽ cưỡng chế hoặc nhắc nhở cực mạnh bạn thực hiện "Nhật ký phục hồi" để hạ mức Cortisol xuống trước khi quá muộn.
          </p>
        </div>

      </div>

      <div style={{ marginTop: "32px", padding: "20px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "16px", textAlign: "center" }}>
        <p style={{ color: "var(--text-main)", fontSize: "15px", lineHeight: "1.6", margin: 0, fontWeight: "500" }}>
          Bằng cách tích hợp các lý thuyết về <strong>Self-binding (Rào cản tự thân)</strong> và <strong>Cân bằng bập bênh khoái lạc - đau đớn</strong>, DinaFlow không chỉ là một ứng dụng quản lý thời gian mà còn là một người bạn đồng hành bảo vệ sức khỏe tâm thần cho người dùng.
        </p>
      </div>
    </section>
  );
}

function UserProfileModal({ userId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`http://localhost:3000/api/users/${userId}/profile`);
        if (!res.ok) {
          const e = await res.json();
          throw new Error(e.error || "Lỗi tải hồ sơ");
        }
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [userId]);

  if (loading) return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ textAlign: 'center', padding: '40px' }}>
        <h3>Đang tải hồ sơ mật... 🔍</h3>
      </div>
    </div>
  );

  if (error || !profile) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Lỗi: {error}</h3>
        <button className="glass-btn" onClick={onClose} style={{ marginTop: '20px' }}>Đóng</button>
      </div>
    </div>
  );

  const { user, stats } = profile;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '24px', padding: '32px', background: 'var(--surface)', border: '2px solid var(--blue-main)' }}>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>❌</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <img src={user.gender === "female" ? "/ran-task.png" : "/conan-avatar.png"} alt="Avatar" style={{ width: 100, height: 100, borderRadius: '50%', border: '4px solid var(--yellow-main)', marginBottom: '16px', objectFit: 'cover' }} />
          <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: 'var(--blue-main)' }}>{user.username}</h2>

          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            <div className="stat-pill" style={{ background: 'var(--red-soft)', color: 'var(--red-main)' }}>
              <Flame size={18} /> Combo x{user.flow_streak}
            </div>
            <div className="stat-pill" style={{ background: 'var(--yellow-soft)', color: 'var(--yellow-main)' }}>
              <Coins size={18} /> {user.dopa_balance} Xu
            </div>
            <div className="stat-pill" style={{ background: 'var(--purple-soft)', color: 'var(--purple-main)' }}>
              🧠 Cortisol: {user.cortisol_level}%
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px dashed var(--border)', textAlign: 'center' }}>
          {user.cortisol_level > 80 || (user.cortisol_level > 65 && stats.total_minutes > 180) ? (
            <span style={{ color: 'var(--red-main)', fontWeight: 'bold' }}>🚨 BÁO ĐỘNG ĐỎ: {user.username} có dấu hiệu "nghiện học/làm việc" (Workaholism)! Hãy gọi họ đi chơi hoặc bắt họ nghỉ ngơi ngay lập tức trước khi kiệt sức!</span>
          ) : user.cortisol_level > 65 ? (
            <span style={{ color: 'var(--orange-main)', fontWeight: 'bold' }}>⚠️ Cảnh báo: Cortisol của {user.username} đang khá cao! Bạn nên khuyên họ đi nghỉ ngơi và thư giãn ngay nhé.</span>
          ) : user.cortisol_level > 35 ? (
            <span style={{ color: 'var(--yellow-main)' }}>🟡 Mức Cortisol của {user.username} đang ở ngưỡng vừa phải. Nhắc họ thỉnh thoảng đứng dậy vươn vai nhé!</span>
          ) : (
            <span style={{ color: 'var(--green-main)' }}>🟢 {user.username} đang có trạng thái tâm lý rất tốt! Cortisol ở mức an toàn.</span>
          )}
        </div>

        <div style={{ marginBottom: '24px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <div style={{ background: 'var(--glass-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--blue-main)', textAlign: 'center', flex: 1 }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 8px 0' }}>Đã hoàn thành</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--blue-main)' }}>{stats.total_tasks} <span style={{ fontSize: '16px' }}>vụ án</span></div>
          </div>
          <div style={{ background: 'var(--glass-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--green-main)', textAlign: 'center', flex: 1 }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 8px 0' }}>Tổng thời lượng</h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--green-main)' }}>{stats.total_minutes} <span style={{ fontSize: '16px' }}>phút</span></div>
          </div>
        </div>

      </div>
    </div>
  );
}

function LeaderboardView({ currentUser, setViewingProfileId }) {
  const [activeTab, setActiveTab] = useState("server"); // "server" or "friends"
  const [globalData, setGlobalData] = useState([]);
  const [friendsData, setFriendsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("http://localhost:3000/api/leaderboard");
      const data = await res.json();
      setGlobalData(data.global || []);
      setFriendsData(data.friends || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const currentData = activeTab === "server" ? globalData : friendsData;

  return (
    <section className="dashboard-content">
      <header className="topbar">
        <div className="greeting">
          <h1>Bảng Xếp Hạng 🎖️</h1>
          <p>Tôn vinh những thám tử chăm chỉ nhất!</p>
        </div>
      </header>
      <section className="lobby-card" style={{ marginTop: '24px' }}>
        <div className="lobby-tabs" style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
          <button
            className="glass-btn"
            style={{ flex: 1, background: activeTab === 'server' ? 'var(--blue-main)' : 'var(--surface)', color: activeTab === 'server' ? 'white' : 'var(--text-main)', border: '1px solid var(--border)' }}
            onClick={() => setActiveTab("server")}
          >
            Toàn Server
          </button>
          <button
            className="glass-btn"
            style={{ flex: 1, background: activeTab === 'friends' ? 'var(--blue-main)' : 'var(--surface)', color: activeTab === 'friends' ? 'white' : 'var(--text-main)', border: '1px solid var(--border)' }}
            onClick={() => setActiveTab("friends")}
          >
            Trong Bạn Bè
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Đang tải...</div>
        ) : (
          <div className="leaderboard-list">
            {currentData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Chưa có dữ liệu.</div>
            ) : (
              currentData.map((u, index) => {
                let rankStyle = { color: 'var(--text-muted)' };
                if (index === 0) rankStyle = { color: '#FFD700', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' };
                if (index === 1) rankStyle = { color: '#C0C0C0' };
                if (index === 2) rankStyle = { color: '#CD7F32' };

                return (
                  <div key={u.id} className="leaderboard-row" style={{ padding: '16px', background: u.id === currentUser?.id ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)', border: u.id === currentUser?.id ? '1px solid var(--blue-main)' : '1px solid var(--border)', borderRadius: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '40px', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', ...rankStyle }}>
                      #{index + 1}
                    </div>
                    <div className="user-col" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: '16px' }}>
                      <img src={u.gender === "female" ? "/ran-task.png" : "/conan-avatar.png"} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', marginRight: '16px', border: '2px solid var(--border)', cursor: 'pointer' }} onClick={() => setViewingProfileId(u.id)} />
                      <strong style={{ fontSize: '16px', cursor: 'pointer', color: u.id === currentUser?.id ? 'var(--blue-main)' : 'var(--text-main)' }} onClick={() => setViewingProfileId(u.id)}>
                        {u.username} {u.id === currentUser?.id && "(Bạn)"}
                      </strong>
                    </div>
                    <div className="stats-col" style={{ display: 'flex', gap: '10px' }}>
                      <div className="stat-pill" style={{ background: 'var(--red-soft)', color: 'var(--red-main)', padding: '6px 12px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>
                        🔥 {u.flow_streak} ngày
                      </div>
                      <div className="stat-pill" style={{ background: 'var(--yellow-soft)', color: 'var(--yellow-main)', padding: '6px 12px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>
                        🪙 {u.dopa_balance} Xu
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>
    </section>
  );
}

export default App;
