<h1 align="center">
  tip20
</h1>

<h3 align="center" style="padding-bottom:2rem">Stop tipping AIs who won't spend it wisely. Extract any kind of data using prefix completion.</h3>

## Usage

```bash
npm install tip20
```

[Bun](https://bun.sh/) is still the preferred runtime (`bun install tip20`).

tip20 includes both a streaming and a regular async function for output. 

```typescript
import fs from "fs";
import { tip20streaming } from "tip20";

const tip20stream = await tip20streaming(
  "typescript",
  "Some mixed response",
  "claude-3-haiku-20240307"
);

for await (const token of tip20stream) {
  console.log("Got packet ", token);
}
```

[The tests folder](https://github.com/SouthBridgeAI/tip20/tree/master/tests) has more examples.

Tip20 is named after the (half serious) joke that tipping LLMs results in better performance. Using prefix completion (on supported LLMs - currently for the package that's Haiku and Sonnet) you can get streaming results of extracted data from almost any input.

![image](https://github.com/user-attachments/assets/40ddf4e1-c509-42bc-ac5d-b37654567944)

[from @voooooogel
](https://x.com/voooooogel/status/1730726744314069190)


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. TODOs.md is a good place to start.
