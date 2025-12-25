// ===== WEB SERVER (für Render) =====
const http = require("http");
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Bot is running");
}).listen(PORT, () => {
  console.log("Webserver läuft auf Port", PORT);
});

// ===== DISCORD BOT =====
const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

// Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ===== DATEN LADEN (CRASH-SICHER) =====
let data;

try {
  data = JSON.parse(fs.readFileSync("data.json", "utf8"));
} catch (err) {
  data = {
    stock: 0,
    sales: 0,
    messageId: null
  };
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
}

let stock = data.stock;
let sales = data.sales;
let messageId = data.messageId;

// ===== BOT READY =====
client.once("clientReady", () => {
  console.log("Bot ist online!");
});

// ===== COMMANDS =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // !stock → +1 Stock
  if (message.content === "!stock") {
    stock++;
    saveData();
    await updateMessage(message);
  }

  // !sale → Stock -1, Sales +1
  if (message.content === "!sale") {
    if (stock <= 0) {
      return message.channel.send("❌ Keine Accounts mehr vorhanden!");
    }

    stock--;
    sales++;
    saveData();
    await updateMessage(message);
  }
});

// ===== FUNKTIONEN =====
function saveData() {
  fs.writeFileSync(
    "data.json",
    JSON.stringify({ stock, sales, messageId }, null, 2)
  );
}

async function updateMessage(message) {
  const text = `📦 **Accs in Stock:** ${stock}\n💰 **Sales:** ${sales}`;

  if (!messageId) {
    const sent = await message.channel.send(text);
    messageId = sent.id;
    saveData();
  } else {
    try {
      const msg = await message.channel.messages.fetch(messageId);
      await msg.edit(text);
    } catch {
      const sent = await message.channel.send(text);
      messageId = sent.id;
      saveData();
    }
  }
}

// ===== LOGIN =====
client.login(process.env.TOKEN);
