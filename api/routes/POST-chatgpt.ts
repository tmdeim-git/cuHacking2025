import { RouteHandler } from "gadget-server";
import OpenAI from "openai";

/**
 * Route handler for GET chatgpt
 *
 * See: https://docs.gadget.dev/guides/http-routes/route-configuration#route-context
 */
const route: RouteHandler<{ Body: { prompt: string; }; }> = async ({ request, reply, api, logger, connections, body, }) => {
  try {
    // Get the prompt from the request body
    const { prompt } = request.body;

    if (!prompt || typeof prompt !== "string") {
      return reply.status(400).send({ error: "Prompt is required." });
    }

    const chatCompletion = await connections.openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
        You are a medical agent whose role is to know the patient's current worries and to provide facts about
        the patient's worries. 
        
        For example, if the patient is worried about his son's fever, you should provide
        information about how easily fevers are treated with statistics. 
        
        If the patient asks about when will he see his doctor, you should tell him that the application
        `
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4o-mini", // Corrected model name
      max_tokens: 256,
    });

    const responseContent = chatCompletion.choices[0].message.content;

    await reply.type("application/json").send({ response: responseContent });
  } catch (error) {
    logger.error("Error generating AI response:", error);
    if (error instanceof OpenAI.APIError) {
      logger.error("OpenAI API Error Details:", {
        status: error.status,
        message: error.message,
        code: error.code,
        type: error.type,
        param: error.param,
      });
      return reply.status(error.status).send({ error: error.message });
    }
    return reply.status(500).send({ error: "Failed to generate AI response." });
  }
};

export default route;
