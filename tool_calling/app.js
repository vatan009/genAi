import Groq from "groq-sdk";
import { tavily } from "@tavily/core";
import readline from 'node:readline/promises'
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const tvly = new tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

const model = "llama-3.1-8b-instant";

const tools = [
  {
    type: "function",
    function: {
      name: "webSearch",
      description: "Search the web for current information",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query",
          },
        },
        required: ["query"],
      },
    },
  },
];

async function main() {
  const rl=readline.createInterface({input:process.stdin,output:process.stdout})
  const messages = [
    {
      role: "system",
      content:
        `You are a helpful assistant. Use webSearch whenever current information is needed.current date and time : ${new Date().toUTCString()}`,
    },

  ];

  while (true) {
    const question = await rl.question('You:');
    if (question === 'bye') {
      break;
    }
      messages.push({
        role: 'user',
        content:question
    })


      while (true) {
        let completion = await groq.chat.completions.create({
          model,
          temperature: 0,
          tools,
          tool_choice: "auto",
          messages,
        });

        messages.push(completion.choices[0].message);

        let response = completion.choices[0].message;
        // console.log(completion2.choices[0].message, "-------------------------res");
        if (!response.tool_calls) {
          console.log(response.content);
          break;
        }

        while (response.tool_calls?.length) {
          messages.push(response);

          for (const toolCall of response.tool_calls) {
            const args = JSON.parse(toolCall.function.arguments);

            const result = await webSearch(args.query);

            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(result),
            });
          }

          completion = await groq.chat.completions.create({
            model,
            temperature: 0,
            tools,
            messages,
          });

          response = completion.choices[0].message;
        }
      }

  }

  rl.close();


}

async function webSearch(query) {
  const result = await tvly.search(query, { max_results: 20 });
  // console.log(result)
  let temp = result.results.map((e) => e.content).join("\n\n");
  // console.log(temp);

  return temp;
}

main().catch(console.error);
