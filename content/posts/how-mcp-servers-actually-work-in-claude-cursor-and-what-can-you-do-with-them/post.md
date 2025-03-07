---
author: Juan Stoppa
title: "How MCP servers actually work in Claude / Cursor and what can you do with them"
summary: Everyone is talking about how MCP will drive the future of agentic AI so I sat down and setup one end to end.
date: 2025-03-07
description: MCP is everywhere in agentic AI conversations so I setup one end to end in Claude and Cursor. I'm breaking down exactly how it works and share practical ideas on what you can build.
draft: false
math: true
tags: ['mcp', 'claude', 'cursor', 'agentic-ai']
cover:
    image: 'posts/how-mcp-servers-actually-work-in-claude-cursor-and-what-can-you-do-with-them/mcp-claude-cursor-cover.png'
    caption: "How MCP servers actually work in Claude / Cursor and what can you do with them"
    hidden: true
twitter:
    card: summary_large_image
    site: '@juanstoppa'
    title: "How MCP servers actually work in Claude / Cursor and what can you do with them"
    description: MCP is everywhere in agentic AI conversations so I setup one end to end in Claude and Cursor. I'm breaking down exactly how it works and share practical ideas on what you can build.
---

I recently wrote an article about [How to Create a Model Context Protocol (MCP) to give context to an LLM](https://jstoppa.com/posts/how-to-create-a-model-context-protocol-mcp-to-give-context-to-an-llm/post/) but it didn't have any practical example, it explained the theory and how the client/server protocol works but it didn't show how to use it. So I sat down and used an existing MCP server called [Sequential Thinking](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking) and made it work with [Claude](https://claude.ai/) Desktop and [Cursor](https://www.cursor.com/), keep reading to see how it works.

## How are MCP servers hosted?

MCP servers are mostly Node.js apps and they can be hosted anywhere, I've seen MCP marketplaces emerging like [Cline MCP Marketplace](https://cline.bot/mcp-marketplace), and there will likely be many more of them in the future but for now we are only going to host it locally. I still need to figure out how authentication will work, according to Cline they use an API key, but there is definitely a need for a more robust authentication.
{{< x user="cline" id="1897168379678744979" class="center">}}

 The MCP I've chosen for this example doesn't requires to make any external API calls, it simply guides the model on how to do sequential thinking.

 ## Setting it up in Claude Desktop
 This is the easier part and we have two options:

 1. **Use an npx command**: best option since you simply need to add JSON structure below to the Claude Desktop config (all steps on how to do that below)
 ```json
 {
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sequential-thinking"
      ]
    }
  }
}
 ```
 2. **Use a docker command**: this is probably a bit more convoluted since you need to download the  [Sequential Thinking](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking) repo locally and get the Dockerfile working, etc (it didn't work first time around for me). 
 ```json
 {
  "mcpServers": {
    "sequentialthinking": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "mcp/sequentialthinking"
      ]
    }
  }
}
 ```
There must be other options since the command will simply run it in your local machine.

To setup this in Claude Desktop:
1. Go to Settings 
2. Select Developer 
3. Edit Config and paste the json mentioned before
{{< rawhtml >}}
<p align="center">
<img src="/posts/how-mcp-servers-actually-work-in-claude-cursor-and-what-can-you-do-with-them/mcp-setup-claude.png" alt="Claude Desktop MCP Edit Config" loading="lazy" />
</p>
{{< /rawhtml >}}
4. Restart Claude Desktop

if you go to Settings > Developer you should see the MCP server added

{{< rawhtml >}}
<p align="center">
<img src="/posts/how-mcp-servers-actually-work-in-claude-cursor-and-what-can-you-do-with-them/mcp-installed-claude.png" alt="Claude Desktop MCP Installed" loading="lazy" />
</p>
{{< /rawhtml >}}

you'll also see there is a little hammer icon in the prompt text box

{{< rawhtml >}}
<p align="center">
<img src="/posts/how-mcp-servers-actually-work-in-claude-cursor-and-what-can-you-do-with-them/mcp-installed-prompt-claude.png" alt="Claude Desktop MCP Installed Prompt" loading="lazy" />
</p>
{{< /rawhtml >}}

Now let's try to run it, I asked Claude to...

> Plan a trip to Italy using sequential thinking

{{< rawhtml >}}
<video width="650" height="480" style="display: block; margin: 0 auto" controls>
  <source src="/posts/how-mcp-servers-actually-work-in-claude-cursor-and-what-can-you-do-with-them/mcp-claude-running-sequential-thinking.mov" type="video/mp4">
  Your browser does not support the video tag.
</video>
<br>
{{< /rawhtml >}}

The result took a bit of time to generate but it worked and they were much better than the default Claude response with no MCP server. This is an interesting point to consider, we could also use MCP servers to make the LLM think step by step, adding external sources can even make it more accurate.

## Setting it up in Cursor

With cursor is pretty much the same process, you need to 

1. Open Cursor settings
2. Click on MCP and then add new MCP server
3. Paste the command below
`npx -y @modelcontextprotocol/server-sequential-thinking`

{{< rawhtml >}}
<p align="center">
<img src="/posts/how-mcp-servers-actually-work-in-claude-cursor-and-what-can-you-do-with-them/mcp-cursor-add-server.png" alt="Cursor Add MCP Server" loading="lazy" />
</p>
{{< /rawhtml >}}

Once added, it should look like this 
{{< rawhtml >}}
<p align="center">
<img src="/posts/how-mcp-servers-actually-work-in-claude-cursor-and-what-can-you-do-with-them/mcp-cursor-installed-server.png" alt="Cursor installed MCP Server" loading="lazy" />
</p>
{{< /rawhtml >}}

Now let's try to run it, make sure you are in Cursor agent mode to use MCP servers, I asked Cursor to...

> Plan a trip to Italy using sequential thinking

and this is the result:
{{< rawhtml >}}
<video width="650" height="480" style="display: block; margin: 0 auto" controls>
  <source src="/posts/how-mcp-servers-actually-work-in-claude-cursor-and-what-can-you-do-with-them/mcp-cusor-running-sequential-thinking.mov" type="video/mp4">
  Your browser does not support the video tag.
</video>
<br>
{{< /rawhtml >}}

This is a very simple example but it's running end to end, the entire code to run this MCP server is [here](https://github.com/modelcontextprotocol/servers/blob/main/src/sequentialthinking/index.ts) but I also pasted below. This can be used as a starting point to build more complex MCP servers.

```ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
// Fixed chalk import for ESM
import chalk from 'chalk';

interface ThoughtData {
  thought: string;
  thoughtNumber: number;
  totalThoughts: number;
  isRevision?: boolean;
  revisesThought?: number;
  branchFromThought?: number;
  branchId?: string;
  needsMoreThoughts?: boolean;
  nextThoughtNeeded: boolean;
}

class SequentialThinkingServer {
  private thoughtHistory: ThoughtData[] = [];
  private branches: Record<string, ThoughtData[]> = {};

  private validateThoughtData(input: unknown): ThoughtData {
    const data = input as Record<string, unknown>;

    if (!data.thought || typeof data.thought !== 'string') {
      throw new Error('Invalid thought: must be a string');
    }
    if (!data.thoughtNumber || typeof data.thoughtNumber !== 'number') {
      throw new Error('Invalid thoughtNumber: must be a number');
    }
    if (!data.totalThoughts || typeof data.totalThoughts !== 'number') {
      throw new Error('Invalid totalThoughts: must be a number');
    }
    if (typeof data.nextThoughtNeeded !== 'boolean') {
      throw new Error('Invalid nextThoughtNeeded: must be a boolean');
    }

    return {
      thought: data.thought,
      thoughtNumber: data.thoughtNumber,
      totalThoughts: data.totalThoughts,
      nextThoughtNeeded: data.nextThoughtNeeded,
      isRevision: data.isRevision as boolean | undefined,
      revisesThought: data.revisesThought as number | undefined,
      branchFromThought: data.branchFromThought as number | undefined,
      branchId: data.branchId as string | undefined,
      needsMoreThoughts: data.needsMoreThoughts as boolean | undefined,
    };
  }

  private formatThought(thoughtData: ThoughtData): string {
    const { thoughtNumber, totalThoughts, thought, isRevision, revisesThought, branchFromThought, branchId } = thoughtData;

    let prefix = '';
    let context = '';

    if (isRevision) {
      prefix = chalk.yellow('🔄 Revision');
      context = ` (revising thought ${revisesThought})`;
    } else if (branchFromThought) {
      prefix = chalk.green('🌿 Branch');
      context = ` (from thought ${branchFromThought}, ID: ${branchId})`;
    } else {
      prefix = chalk.blue('💭 Thought');
      context = '';
    }

    const header = `${prefix} ${thoughtNumber}/${totalThoughts}${context}`;
    const border = '─'.repeat(Math.max(header.length, thought.length) + 4);

    return `
┌${border}┐
│ ${header} │
├${border}┤
│ ${thought.padEnd(border.length - 2)} │
└${border}┘`;
  }

  public processThought(input: unknown): { content: Array<{ type: string; text: string }>; isError?: boolean } {
    try {
      const validatedInput = this.validateThoughtData(input);

      if (validatedInput.thoughtNumber > validatedInput.totalThoughts) {
        validatedInput.totalThoughts = validatedInput.thoughtNumber;
      }

      this.thoughtHistory.push(validatedInput);

      if (validatedInput.branchFromThought && validatedInput.branchId) {
        if (!this.branches[validatedInput.branchId]) {
          this.branches[validatedInput.branchId] = [];
        }
        this.branches[validatedInput.branchId].push(validatedInput);
      }

      const formattedThought = this.formatThought(validatedInput);
      console.error(formattedThought);

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            thoughtNumber: validatedInput.thoughtNumber,
            totalThoughts: validatedInput.totalThoughts,
            nextThoughtNeeded: validatedInput.nextThoughtNeeded,
            branches: Object.keys(this.branches),
            thoughtHistoryLength: this.thoughtHistory.length
          }, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
            status: 'failed'
          }, null, 2)
        }],
        isError: true
      };
    }
  }
}

const SEQUENTIAL_THINKING_TOOL: Tool = {
  name: "sequentialthinking",
  description: `A detailed tool for dynamic and reflective problem-solving through thoughts.
This tool helps analyze problems through a flexible thinking process that can adapt and evolve.
Each thought can build on, question, or revise previous insights as understanding deepens.

When to use this tool:
- Breaking down complex problems into steps
- Planning and design with room for revision
- Analysis that might need course correction
- Problems where the full scope might not be clear initially
- Problems that require a multi-step solution
- Tasks that need to maintain context over multiple steps
- Situations where irrelevant information needs to be filtered out

Key features:
- You can adjust total_thoughts up or down as you progress
- You can question or revise previous thoughts
- You can add more thoughts even after reaching what seemed like the end
- You can express uncertainty and explore alternative approaches
- Not every thought needs to build linearly - you can branch or backtrack
- Generates a solution hypothesis
- Verifies the hypothesis based on the Chain of Thought steps
- Repeats the process until satisfied
- Provides a correct answer

Parameters explained:
- thought: Your current thinking step, which can include:
* Regular analytical steps
* Revisions of previous thoughts
* Questions about previous decisions
* Realizations about needing more analysis
* Changes in approach
* Hypothesis generation
* Hypothesis verification
- next_thought_needed: True if you need more thinking, even if at what seemed like the end
- thought_number: Current number in sequence (can go beyond initial total if needed)
- total_thoughts: Current estimate of thoughts needed (can be adjusted up/down)
- is_revision: A boolean indicating if this thought revises previous thinking
- revises_thought: If is_revision is true, which thought number is being reconsidered
- branch_from_thought: If branching, which thought number is the branching point
- branch_id: Identifier for the current branch (if any)
- needs_more_thoughts: If reaching end but realizing more thoughts needed

You should:
1. Start with an initial estimate of needed thoughts, but be ready to adjust
2. Feel free to question or revise previous thoughts
3. Don't hesitate to add more thoughts if needed, even at the "end"
4. Express uncertainty when present
5. Mark thoughts that revise previous thinking or branch into new paths
6. Ignore information that is irrelevant to the current step
7. Generate a solution hypothesis when appropriate
8. Verify the hypothesis based on the Chain of Thought steps
9. Repeat the process until satisfied with the solution
10. Provide a single, ideally correct answer as the final output
11. Only set next_thought_needed to false when truly done and a satisfactory answer is reached`,
  inputSchema: {
    type: "object",
    properties: {
      thought: {
        type: "string",
        description: "Your current thinking step"
      },
      nextThoughtNeeded: {
        type: "boolean",
        description: "Whether another thought step is needed"
      },
      thoughtNumber: {
        type: "integer",
        description: "Current thought number",
        minimum: 1
      },
      totalThoughts: {
        type: "integer",
        description: "Estimated total thoughts needed",
        minimum: 1
      },
      isRevision: {
        type: "boolean",
        description: "Whether this revises previous thinking"
      },
      revisesThought: {
        type: "integer",
        description: "Which thought is being reconsidered",
        minimum: 1
      },
      branchFromThought: {
        type: "integer",
        description: "Branching point thought number",
        minimum: 1
      },
      branchId: {
        type: "string",
        description: "Branch identifier"
      },
      needsMoreThoughts: {
        type: "boolean",
        description: "If more thoughts are needed"
      }
    },
    required: ["thought", "nextThoughtNeeded", "thoughtNumber", "totalThoughts"]
  }
};

const server = new Server(
  {
    name: "sequential-thinking-server",
    version: "0.2.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const thinkingServer = new SequentialThinkingServer();

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [SEQUENTIAL_THINKING_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "sequentialthinking") {
    return thinkingServer.processThought(request.params.arguments);
  }

  return {
    content: [{
      type: "text",
      text: `Unknown tool: ${request.params.name}`
    }],
    isError: true
  };
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Sequential Thinking MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
```

Anyway, this exercise really helped me understand MCP servers and how they work. I hope it clarifies many concepts for you too.

If you liked this post, you can follow me on [𝕏](https://x.com/juanstoppa) for more content like this.









