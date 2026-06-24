const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');
const lines = content.split('\n');
const replacement = [
  '  { id: "dashboard", label: "Tổng quan", icon: Home },',
  '  { id: "tasks", label: "Nhiệm vụ", icon: CheckCircle2 },',
  '  { id: "timer", label: "Đồng hồ", icon: Clock3 },',
  '  { id: "leaderboard", label: "Bảng xếp hạng", icon: Trophy },',
  '  { id: "rewards", label: "Tặng quà", icon: Gift },',
  '  { id: "logs", label: "Nhật ký sinh lý", icon: Activity },',
  '  { id: "arena", label: "Thi đua", icon: Trophy },',
  '  { id: "friends", label: "Bạn bè", icon: Users },',
  '  { id: "mechanism", label: "Cơ chế sinh học", icon: Brain },',
  '  { id: "settings", label: "Cài đặt", icon: Settings },'
];

lines.splice(153, 9, ...replacement);
fs.writeFileSync('src/App.jsx', lines.join('\n'), 'utf8');
console.log('Fixed navItems');
