/* 小狗音乐 v4 - 脚本文件
   功能：
   - 搜索（歌曲名 + 歌手名），搜索结果只展示前 5 条
   - 播放全部（按当前过滤排序）
   - 随机播放（从当前过滤结果中随机）
   - 近期播放（右侧栏，最多 10 首，点可重播）
   - 示例 songs 数组请根据实际 music 文件名调整
*/

/* ========== 在此定义你的歌曲列表（修改 file 为你的 mp3 路径） ========== */
const songs = [
  { title: "That Girl", file: "https://cdn.jsdelivr.net/gh/dog-music/xiaogou-music/main/music/That Girl.mp3"},
  { title: "QQ飞车手游", file: "https://cdn.jsdelivr.net/gh/dog-music/xiaogou-music/main/music/QQ飞车手游.mp3"}
];
/* ======================================================================== */

const listContainer = document.getElementById('musicList');
const searchInput = document.getElementById('searchInput');
const player = document.getElementById('audioPlayer');
const playAllBtn = document.getElementById('playAllBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const historyList = document.getElementById('historyList');

let currentList = [];    // 当前（过滤后）用于展示与播放的列表（最多5条）
let currentIndex = 0;    // 在 currentList 中的索引
let playHistory = [];    // 近期播放记录（最多10首）

/* 渲染列表：只显示前 5 首匹配歌曲 */
function renderList(filter = '') {
  listContainer.innerHTML = '';
  currentList = songs.filter(song =>
    song.title.toLowerCase().includes(filter.toLowerCase()) ||
    song.artist.toLowerCase().includes(filter.toLowerCase())
  ).slice(0, 5); // 只取前5条

  currentList.forEach((song, index) => {
    const node = document.createElement('div');
    node.className = 'song';
    node.innerHTML = `
      <div class="meta">
        <div class="title">${escapeHtml(song.title)}</div>
        <div class="artist">${escapeHtml(song.artist)}</div>
      </div>
      <div class="actions">
        <span class="duration" aria-hidden="true"></span>
      </div>
    `;
    node.onclick = () => playSong(index);
    listContainer.appendChild(node);
  });
}

/* 播放 currentList 中的指定索引 */
function playSong(index) {
  if (!currentList || currentList.length === 0) return;
  currentIndex = index;
  const song = currentList[index];
  if (!song) return;
  player.src = song.file;
  player.play().catch(err => {
    // 浏览器可能阻止自动播放，用户交互后可播放
    console.warn('播放失败：', err);
  });
  addToHistory(song);
}

/* 顺序播放 currentList（播放全部） */
function playAll() {
  if (!currentList || currentList.length === 0) return;
  playSong(0);
  player.onended = () => {
    currentIndex++;
    if (currentIndex < currentList.length) {
      playSong(currentIndex);
    } else {
      player.onended = null; // 停止继续播放
    }
  };
}

/* 随机播放 currentList 中的一首 */
function shufflePlay() {
  if (!currentList || currentList.length === 0) return;
  const rnd = Math.floor(Math.random() * currentList.length);
  playSong(rnd);
}

/* 添加到近期播放（去重 + 最新放前面 + 限制10条） */
function addToHistory(song) {
  // 以 file 为唯一标识去重
  playHistory = playHistory.filter(item => item.file !== song.file);
  playHistory.unshift(song);
  if (playHistory.length > 10) playHistory.pop();
  renderHistory();
}

/* 渲染历史列表 */
function renderHistory() {
  historyList.innerHTML = '';
  playHistory.forEach((song, idx) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.innerHTML = `<strong>${escapeHtml(song.title)}</strong><small>${escapeHtml(song.artist)}</small>`;
    li.onclick = () => {
      // 点击历史条目播放并把它移动到最新
      player.src = song.file;
      player.play().catch(()=>{});
      addToHistory(song);
    };
    historyList.appendChild(li);
  });
}

/* 助手：简单转义（避免插入 HTML） */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* 事件绑定 */
playAllBtn.addEventListener('click', playAll);
shuffleBtn.addEventListener('click', shufflePlay);

/* 搜索输入时动态渲染（实时） */
searchInput.addEventListener('input', e => {
  renderList(e.target.value.trim());
});

/* 初始渲染（空过滤显示前5首） */
renderList();

/* 可选：在页面刷新后保留播放历史（启用请取消注释）
   此处为非必须功能，若希望启用可打开下面代码块
*/
/*
(function loadHistoryFromStorage(){
  try {
    const raw = localStorage.getItem('xiaogou_play_history_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        playHistory = parsed.slice(0,10);
        renderHistory();
      }
    }
  } catch(e){ console.warn(e); }
})();

function saveHistoryToStorage(){
  try {
    localStorage.setItem('xiaogou_play_history_v1', JSON.stringify(playHistory));
  } catch(e){}
}

// 在 addToHistory 中调用 saveHistoryToStorage() 以保持持久化
// 在 addToHistory() 的末尾加入： saveHistoryToStorage();
*/

