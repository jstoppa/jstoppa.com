---
author: Juan Stoppa
title: "How to Create a Model Context Protocol (MCP) to give context to an LLM"
summary: Learn how to build a Model Context Protocol (MCP) server and client to give context to an LLM.
date: 2025-02-23
description: A step-by-step guide for creating MCP server and client that gives context to an LLM to generate task descriptions.
draft: false
math: true
tags: ['mcp', 'llm', 'python', 'hugging-face']
cover:
    image: 'posts/how-to-create-a-model-context-protocol-mcp-to-give-context-to-an-llm/mcp-cover.png'
    caption: "Building MCP Server and Client to give context to an LLM"
    hidden: true
twitter:
    card: summary_large_image
    site: '@juanstoppa'
    title: "How to Create a Model Context Protocol (MCP) to give context to an LLM"
    description: Learn how to build a Model Context Protocol (MCP) server and client to give context to an LLM.
---

I recently noticed a post on [𝕏](https://x.com) from [Jeff Weinstein](https://x.com/jeff_weinstein) discussing the potential for creating a marketplace for the Model Context Protocol (MCP) on [Stripe](https://stripe.com), targeting a growing number of developers that are building AI agents. 

{{< x user="jeff_weinstein" id="1893064226899665056" class="center">}}

This really got me into looking at MCPs, particularly its integration with a Large Language Model (LLM). To do this, I created an MCP server and a client to communicate to each other, this is a very simple example but still gives the foundation. Worth metioning that LLMs like ChatGPT or Claude are not very familiar with it since it's very new.  

## What is MCP?
The Model Context Protocol (MCP), developed by [Anthropic](https://www.anthropic.com/news/model-context-protocol), is a standard that enables AI models to interact with external systems. It works using a client-server model: servers provide resources or tools and clients (such as AI models) access them. 

One important concept to understand is how these MCP servers provide functionality to their clients, they do it by exposing three different interfaces:

- **Prompts**: structured instructions that guide the LLM in generating responses. These act as templates that clients can use to standardise or influence outputs based on their requirements.
- **Tools**: functions that can be called by the client to perform specific operations beyond text generation. These may include API calls, database queries, calculations or interactions with external systems.
- **Resources**: functions designed to provide structured data or contextual information to the LLM. They supply relevant facts, references or domain-specific knowledge that help the model generate more informed responses.

In this guide I'm building an MCP server that provides a list of tasks (resource), the ability add tasks (tool) and a structured template with the information the LLM can use to generate a description for any given task title (prompt).

## The Server Code
Here's the complete server code, written in Python using the FastMCP library described in the [modelcontextprotocol](https://github.com/modelcontextprotocol) library 

```python
from mcp.server.fastmcp import FastMCP
import json

# Sample tasks with titles and descriptions
tasks = [
    {"title": "Plan meeting", "description": "Schedule team sync meeting"},
    {"title": "Write report", "description": "Complete quarterly report"},
    {"title": "Call client", "description": "Follow up on project requirements"}
]

# Create a FastMCP server instance
mcp = FastMCP(name="TaskServer")

# Define a prompt: template for task creation
@mcp.prompt("task_description")
def task_description(task_title="Unnamed task"):
    return f"Based on the task title '{task_title}', generate a detailed description"

# Define a tool: add a new task to the list
@mcp.tool("add_task")
def add_task(params):
    task_title = params.get("task_title", "Unnamed task")
    task_description = params.get("description", "No description provided")
    new_task = {"title": task_title, "description": task_description}
    tasks.append(new_task)
    return {"task": new_task, "success": True}

# Define a resource: expose a list of task titles to the client
@mcp.resource("tasks://list")
def get_task_titles():
    return {
        "meta": None,
        "contents": [{
            "uri": "tasks://list",
            "mime_type": "application/json",
            "text": json.dumps({"tasks": tasks, "count": len(tasks)})
        }]
    }

if __name__ == "__main__":
    mcp.run()
```
The code above does the following:
- **Server Setup**: Named "TaskServer", it has:
  - A prompt ("task_description") that guides the LLM in generating a description.
  - A tool ("add_task") that takes a task title and adds it to the list.
  - A resource ("tasks://list") returning the task list and count.
- **Execution**: The server runs waiting for client requests.

## The Client Code
The client connects to the server, retrieves the task titles and generates a description for one task using the LLM tool. Here's the code:

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import json, asyncio

async def run():
    # Connect to the task server
    async with stdio_client(StdioServerParameters(command="python", args=["mcp_task_server.py"])) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            
            # Get task description suggestion using prompt
            print("Getting prompt...")
            prompt_result = await session.get_prompt("task_description", {"task_title": "Do shopping"})
            print(f"Suggested description: {prompt_result.messages[0].content.text}")
            
            # Display all tasks
            print("\nDisplaying all tasks...")
            response = await session.read_resource("tasks://list")
            tasks = json.loads(json.loads(response.contents[0].text)['contents'][0]['text'])
            for task in tasks['tasks']:
                print(f"• {task['title']}: {task['description']}")
            
            
            print("\nAdding new task....")
            # Add a new task
            await session.call_tool("add_task", {
                "params": {
                    "task_title": "Order food",
                    "description": "Order lunch from the local restaurant"
                }
            })
            print("Task added!")


            print("\nDisplaying all tasks again...")
            # Display again all tasks
            response = await session.read_resource("tasks://list")
            tasks = json.loads(json.loads(response.contents[0].text)['contents'][0]['text'])
            for task in tasks['tasks']:
                print(f"• {task['title']}: {task['description']}")

if __name__ == "__main__":
    asyncio.run(run())
```

How It Works:
- **Client Initialisation**: the client launch the server and connects to it. In real life the client wouldn't be launching the server but in this example we are doing it to avoid having to run the server in a separate terminal.
- **Server Connection**: it connects to the server, it uses the `stdio_client` to connect to the server.
- **Prompt**: it retrieves the "task_description" prompt to generate a description.
- **Resource**: it retrieves the "tasks://list" resource to list the tasks.
- **Tool**: it uses the "add_task" tool to add a new task to the list.
at the end it displays all the tasks again to show the new task has been added.

{{< rawhtml >}}
<p align="center">
<img src="/posts/how-to-create-a-model-context-protocol-mcp-to-give-context-to-an-llm/mcp-example-result.png" alt="MCP Example result" loading="lazy" />
</p>
{{< /rawhtml >}}


[![Run example in Hugging Face](https://img.shields.io/badge/🤗%20Run%20in-Hugging%20Face-blue)](https://huggingface.co/spaces/jstoppa/mcp_example)

You can see the complete code in this [GitHub repository](https://github.com/jstoppa/mcp_example).

## Why This Matters

This example shows how MCP provides a protocol for data communication and gives context to an LLM. This has been a hot topic recently, with more developers using it to build agents. I can see the potential for developers to create MCPs that handle specialised tasks and commercialise them, as any MCP client could easily connect due to a shared pattern. If a platform like Stripe were to implement a marketplace for MCPs, it could open up a new way for developers to build and sell their MCPs.

## What to do next
This is a very simple example but there are many more functionality that comes with the protocol, like the ability to pass structured data, handle errors and more (you can read more about it [here](https://modelcontextprotocol.io/docs/concepts/architecture#message-types)). What I haven't seen yet a strong protocol to standarise how the UI reanders data from LLM clients, maybe the closest is [Vercel's AI Sdk UI](https://sdk.vercel.ai/docs/ai-sdk-ui) but I personally haven't explored them yet in details.

I hope you like this article and helps to understand how MCP works!

If you liked this post, you can follow me on [𝕏](https://x.com/juanstoppa) for more content like this.