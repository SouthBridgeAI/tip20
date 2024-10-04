export const tip20Models: {
  name: string;
  provider: "anthropic";
  nickName: string;
  outputCPM: number;
  inputCPM: number;
  outputLength: number;
  contextWindow: number;
}[] = [
  {
    name: "claude-3-5-sonnet-20240620",
    provider: "anthropic",
    nickName: "sonnet35",
    outputCPM: 15,
    inputCPM: 3,
    outputLength: 8092,
    contextWindow: 200000,
  },
  {
    name: "claude-3-haiku-20240307",
    provider: "anthropic",
    nickName: "haiku",
    outputCPM: 1.25,
    inputCPM: 0.25,
    outputLength: 4096,
    contextWindow: 200000,
  },
];
