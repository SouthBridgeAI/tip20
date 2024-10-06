// The primary intent here is to use a prefix completion model (we're starting with Haiku) to extract exactly one type of structured data from some response, presumably from an LLM.

import Anthropic from "@anthropic-ai/sdk";
import { countTokens } from "@anthropic-ai/tokenizer";
import { tip20Models } from "./models";

export type Tip20TokenPacket =
  | {
      type: "token";
      token: string;
    }
  | {
      type: "fullMessage";
      message: string;
    }
  | {
      type: "error";
      error: string;
    };

export async function tip20(
  outputType: string,
  inputData: string,
  modelName: (typeof tip20Models)[number]["name"],
  shortCircuit?: boolean,
  key?: string // or use env var
) {
  const tip20stream = tip20streaming(
    outputType,
    inputData,
    modelName,
    shortCircuit,
    key
  );

  for await (const token of tip20stream) {
    if (token.type === "error") {
      throw new Error(token.error);
    }
    if (token.type === "fullMessage") {
      return token.message;
    }
  }
}

export function countOccurrences(str, substr) {
  const regex = new RegExp(substr, "g");
  const matches = str.match(regex);
  return matches ? matches.length : 0;
}

export async function* tip20streaming(
  outputType: string,
  inputData: string,
  modelName: (typeof tip20Models)[number]["name"],
  shortCircuit?: boolean,
  key?: string // or use env var
): AsyncGenerator<Tip20TokenPacket, void, undefined> {
  try {
    const client = new Anthropic(
      key
        ? {
            apiKey: key,
          }
        : {}
    );

    const inputTokens = countTokens(inputData);

    const model = tip20Models.find((m) => m.name === modelName);

    if (!model) {
      throw new Error(`Tip20: Model ${modelName} not found`);
    }

    if (model.contextWindow < inputTokens) {
      throw new Error(
        `Tip20: Model ${modelName} context window is too small for input data`
      );
    }

    const responseStream = await client.messages.create({
      model: model.name,
      system: `DATA: \`\`\`\n${inputData}\`\`\``,
      messages: [
        {
          role: "user",
          content: `Extract only ${outputType} without any changes from DATA.`,
        },
        {
          role: "assistant",
          content: `Sure thing. Here is the data extracted: \n\`\`\`${outputType}`,
        },
      ],
      max_tokens: model.outputLength,
      stream: true,
    });

    let fullMessage = "",
      partialToken = "";

    for await (const chunk of responseStream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta?.type === "text_delta"
      ) {
        // Remove leading whitespace
        const token = !!fullMessage
          ? chunk.delta.text
          : chunk.delta.text.trimStart();

        partialToken += token;
        fullMessage += token;

        if (
          shortCircuit &&
          inputData.includes("```") &&
          inputData.includes(fullMessage) &&
          countOccurrences(inputData, fullMessage) === 1
        ) {
          const restOfResponse = inputData
            .substring(inputData.indexOf(fullMessage) + fullMessage.length)
            .split("```")[0]
            .trimEnd();

          yield {
            type: "token",
            token: partialToken,
          };

          fullMessage += restOfResponse;

          yield {
            type: "fullMessage",
            message: fullMessage,
          };

          return;
        }

        if (fullMessage.includes("```")) {
          yield {
            type: "token",
            token: partialToken.includes("```")
              ? partialToken.split("```")[0]
              : partialToken.split("`")[0],
          };

          yield {
            type: "fullMessage",
            message: fullMessage.split("```")[0],
          };

          break;
        } else if (fullMessage.endsWith("`")) {
          // hold on to the token for now, don't emit anything yet
        } else {
          yield {
            type: "token",
            token: partialToken,
          };

          partialToken = "";
        }
      }
    }
  } catch (err) {
    yield {
      type: "error",
      error: (err as Error).message,
    };
  }
}
