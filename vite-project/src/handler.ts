import { OpenAI } from "openai";
import type {
	ChatCompletionSystemMessageParam,
	ChatCompletionUserMessageParam,
	ChatCompletionAssistantMessageParam,
} from "openai/resources/chat/completions";

interface Env {
	OPENAI_KEY: string;
}

interface Message {
	text: string;
	sender: "ai" | "user";
}

interface RequestBody {
	messages: Message[];
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		// Handle CORS preflight
		if (request.method === "OPTIONS") {
			return new Response(null, {
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "POST, OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type",
				},
			});
		}

		if (request.method !== "POST") {
			return new Response("Method not allowed", {
				status: 405,
				headers: { "Access-Control-Allow-Origin": "*" },
			});
		}

		try {
			const body = (await request.json()) as RequestBody;
			const { messages } = body;

			const openai = new OpenAI({ apiKey: env.OPENAI_KEY });

			// Properly typed messages using satisfies
			const openaiMessages = [
				{
					role: "system",
					content:
						"You are a helpful pirate assistant. Use pirate slang like 'Arrr!' and 'Matey!'",
				} satisfies ChatCompletionSystemMessageParam,
				...messages.map(
					(
						message
					):
						| ChatCompletionUserMessageParam
						| ChatCompletionAssistantMessageParam => ({
						role: message.sender === "ai" ? "assistant" : "user",
						content: message.text,
					})
				),
			];

			const gptResponse = await openai.chat.completions.create({
				model: "gpt-3.5-turbo",
				messages: openaiMessages,
			});

			const aiResponse = gptResponse.choices[0].message.content;

			return new Response(JSON.stringify({ text: aiResponse }), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
				},
			});
		} catch (error) {
			console.error("Error:", error);
			return new Response(JSON.stringify({ error: "Internal Server Error" }), {
				status: 500,
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*",
				},
			});
		}
	},
};
