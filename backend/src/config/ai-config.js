const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const analyzeJobDescription = async (description) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a service pricing expert. Analyze job descriptions and extract key information for pricing estimation."
        },
        {
          role: "user",
          content: `Analyze this job description: "${description}". Provide:
          1. Estimated complexity level (1-5)
          2. Required skills
          3. Estimated time required
          4. Potential materials needed
          Return as JSON.`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return null;
  }
};

module.exports = {
  analyzeJobDescription,
  openai
};