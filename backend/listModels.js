import dotenv from "dotenv";
dotenv.config();

async function main() {
  try {
    console.log("USING KEY:", process.env.GOOGLE_API_KEY);
    if (!process.env.GOOGLE_API_KEY) {
      console.error("❌ GOOGLE_API_KEY not set in environment");
      return;
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      console.error(`❌ Request failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(errorText);
      return;
    }

    const data = await response.json();
    const models = data.models || [];

    const geminiModels = models.filter((model) => model.name.includes('gemini'));

    console.log('🔍 Gemini models detected:');
    geminiModels.forEach((model) => {
      console.log(`• ${model.name} -> methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
    });

    if (models.length > 0) {
      console.log('\n📦 Full API response (first 20 entries):');
      console.log(JSON.stringify(models.slice(0, 20), null, 2));
    } else {
      console.log('⚠️ No models returned. Check API access/billing.');
    }

  } catch (err) {
    console.error("LIST MODELS ERROR:");
    console.error(err);
  }
}

main();
