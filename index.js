const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Daten laden
let data = JSON.parse(fs.readFileSync("data.json", "utf8"));

let stock = data.stock;
let sales = data.sales;
let messageId = data.messageId;

client.once("clientReady", () => {
  console.log("Bot ist online!");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content === "!stock") {
    stock++;
    saveData();
    await updateMessage(message);
  }

  if (message.content === "!sale") {
    if (stock <= 0) {
      return message.channel.send("❌ Keine Accounts mehr vorhanden!(RESTOCK DAVID GRR)");
    }

    stock--;
    sales++;
    saveData();
    await updateMessage(message);
  }
});

function saveData() {
  fs.writeFileSync(
    "data.json",
    JSON.stringify({ stock, sales, messageId }, null, 2)
  );
}

async function updateMessage(message) {
  const text = `📦 Accs in Stock: ${stock}\n💰 Sales $: ${sales}`;

  if (!messageId) {
    const sent = await message.channel.send(text);
    messageId = sent.id;
    saveData();
  } else {
    try {
      const msg = await message.channel.messages.fetch(messageId);
      msg.edit(text);
    } catch {
      const sent = await message.channel.send(text);
      messageId = sent.id;
      saveData();
    }
  }
}

client.login(process.env.TOKEN);