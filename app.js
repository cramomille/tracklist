async function loadCSV(url) {
  const response = await fetch(url);
  if (!response.ok) return [];

  const text = await response.text();
  const lines = text.trim().split('\n');

  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');

    data.push({
      date: new Date(cols[0].trim()),
      track: cols[1].trim(),
      artist: cols[2].trim(),
      album: cols[3].trim(),
      plays: Number(cols[4]) || 1,
      minutes: Number(cols[5]) || 0
    });
  }
  return data;
}

function computeTop(data, mode) {
  const now = new Date();
  const sevenDaysAgo = new Date(now - 7*24*3600*1000);

  const recent = data.filter(x => x.date >= sevenDaysAgo);

  const counts = {};
  for (const e of recent) {
    const key =
      mode === "track" ? e.track :
      mode === "artist" ? e.artist :
      e.album;

    if (!counts[key])
      counts[key] = { plays: 0, minutes: 0, artist: e.artist, album: e.album };

    counts[key].plays += e.plays;
    counts[key].minutes += e.minutes;
  }

  const sorted = Object.entries(counts)
    .sort((a,b) => b[1].plays - a[1].plays)
    .slice(0, 9);

  return sorted.map(([key, val]) => {
    if (mode === "track") {
      return {
        line1: key,
        line2: val.artist,
        line3: val.plays + " écoutes"
      };
    }

    if (mode === "artist") {
      return {
        line1: key,
        line2: val.minutes + " minutes écoutées"
      };
    }

    return {
      line1: key,
      line2: val.artist,
      line3: val.minutes + " minutes écoutées"
    };
  });
}

const app = Vue.createApp({
  data() {
    return { raw: [], mode: "track", top9: [] };
  },
  methods: {
    switchMode(m) {
      this.mode = m;
      this.top9 = computeTop(this.raw, this.mode);
    }
  },
  async mounted() {
    const now = new Date();
    const month = now.toISOString().slice(0, 7);
    const data = await loadCSV(`data/${month}.csv`);

    this.raw = data;
    this.top9 = computeTop(data, this.mode);
  }
});

app.mount("#app");
