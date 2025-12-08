async function loadCSV(url) {
const response = await fetch(url);
if (!response.ok) {
return [];
}
const text = await response.text();
const lines = text.trim().split('\n');


const data = [];
for (let i = 1; i < lines.length; i++) {
const [date, track] = lines[i].split(',');
data.push({ date: new Date(date.trim()), track: track.trim() });
}
return data;
}


function topOfWeek(data) {
const now = new Date();
const sevenDaysAgo = new Date(now - 7 * 24 * 3600 * 1000);


const recent = data.filter(x => x.date >= sevenDaysAgo);


const counts = {};
for (const e of recent) {
counts[e.track] = (counts[e.track] || 0) + 1;
}


const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
return sorted.length ? sorted[0][0] : "Aucune donnée cette semaine";
}


const app = Vue.createApp({
data() {
return {
top: "Chargement..."
};
},
async mounted() {
const now = new Date();
const month = now.toISOString().slice(0, 7); // "2025-12"


const url = `data/${month}.csv`;
const data = await loadCSV(url);
this.top = topOfWeek(data);
}
});


app.mount('#app');