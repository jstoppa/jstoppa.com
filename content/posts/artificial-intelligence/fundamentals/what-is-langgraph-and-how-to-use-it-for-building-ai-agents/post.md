---
author: Juan Stoppa
title: "What is LangGraph and How to Use It for Building AI Agents"
summary: A clear guide to LangGraph and AI agents. LangChain's docs can be overwhelming, so I put this together to help with implementation and deployment of stateful agents.
date: 2025-02-16
description: A practical guide to LangGraph and AI agents. This covers the basics, real examples, and deployment. I wrote it to simplify LangChain's complex docs and help people build stateful AI agents with error handling and production-ready features.
draft: false
math: true
tags: ['langgraph', 'ai-agents', 'langchain', 'python']
cover:
    image: 'posts/artificial-intelligence/fundamentals/what-is-langgraph-and-how-to-use-it-for-building-ai-agents/langgraph-agents-cover'
    caption: "What is LangGraph and How to Use It for Building AI Agents"
    hidden: true
twitter:
    card: summary_large_image
    site: '@juanstoppa'
    title: "Code Smarter, Not Harder: Developing with Cursor and Claude Sonnet"
    description: Cursor is a code editor that helps you speed up your development process by using AI to write code for you.
---

I keep finding myself going back to the LangChain documentation to figure out how to use LangGraph. While the documentation is comprehensive, it can be overwhelming to navigate, especially when you're trying to build advanced AI agents.

This guide is my attempt to consolidate the key concepts and practical implementations of LangGraph in one place. Whether you're building a conversational agent that needs to remember context, a multi-step reasoning agent, or a complex workflow that coordinates multiple AI components, LangGraph provides the framework to make it happen. I created this reference for myself but I hope it helps others who want a more straightforward explanation of how to use LangGraph effectively.

## What is LangGraph?

LangGraph is a framework that brings state machines to Large Language Model (LLM) applications. It's particularly useful when you need to build complex, stateful applications with LLMs. The framework allows you to structure your application as a graph, where each node represents a specific task or state, and edges represent transitions between states.

## Basic LangGraph Example

Let's start with a simple example to understand the core concepts: we are developing a simple agent that collects information and  processes it, the actions  of collecting and processing information are just example but they can be replaced with more complex actions.

[![Run example in Hugging Face](https://img.shields.io/badge/🤗%20Run%20in-Hugging%20Face-blue)](https://huggingface.co/spaces/jstoppa/langgraph_basic_example)


```python
from langgraph.graph import StateGraph
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages

# Define the state type
class State(TypedDict):
    messages: Annotated[list[str], add_messages]
    current_step: str

# Define the collect_info function
def collect_info(state: State) -> dict:
    print("\n--> In collect_info")
    print(f"Messages before: {state['messages']}")
    
    messages = state["messages"] + ["Information collected"]
    print(f"Messages after: {messages}")
    
    return {
        "messages": messages,
        "current_step": "process"
    }

def process_info(state: State) -> dict:
    print("\n--> In process_info")
    print(f"Messages before: {state['messages']}")
    
    messages = state["messages"] + ["Information processed"]
    print(f"Messages after: {messages}")
    
    return {
        "messages": messages,
        "current_step": "end"
    }

# Create and setup graph
workflow = StateGraph(State)

# Add nodes
workflow.add_node("collect", collect_info)
workflow.add_node("process", process_info)

# Add edges
workflow.add_edge("collect", "process")

# Set entry point
workflow.set_entry_point("collect")

# Compile the workflow
app = workflow.compile()

# Run workflow
print("\nStarting workflow...")
initial_state = State(messages=["Starting"], current_step="collect")
final_state = app.invoke(initial_state)
print(f"\nFinal messages: {final_state['messages']}")
```

This example shows the basic structure of a LangGraph application:
1. Define your state using TypedDict, it contains the information that the workflow will need to keep track of.
2. Create functions for each state, these functions are the actions that the workflow will perform.
3. Build a graph with nodes and edges, the nodes are the states and the edges are the transitions between them.
4. Compile the graph into a runnable application, this will create a callable object that can be invoked with an initial state.




## Serving LangGraph as a Web Service

While LangGraph itself doesn't include built-in server capabilities, you can easily create a web service using FastAPI to serve your LangGraph workflows:

```python
from fastapi import FastAPI
from pydantic import BaseModel

# Create FastAPI app
app = FastAPI()

# Define input model
class WorkflowInput(BaseModel):
    messages: list[str]
    current_step: str

# Create endpoint to run workflow
@app.post("/run-workflow")
async def run_workflow(input_data: WorkflowInput):
    try:
        result = workflow.invoke({
            "messages": input_data.messages,
            "current_step": input_data.current_step
        })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

You can run this server using uvicorn:

```bash
uvicorn server:app --reload --port 8000
```

## Making It Production-Ready

For production deployment, you'll want to add some additional features:

1. Error Handling:
```python
from fastapi import HTTPException
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"message": str(exc)}
    )
```

2. Authentication (if needed):
```python
from fastapi.security import APIKeyHeader
from fastapi import Security, HTTPException

api_key_header = APIKeyHeader(name="X-API-Key")

@app.post("/secure-workflow")
async def secure_workflow(
    input_data: WorkflowInput,
    api_key: str = Security(api_key_header)
):
    if api_key != "your-secret-key":
        raise HTTPException(status_code=403)
    return await run_workflow(input_data)
```

3. Logging:
```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    return response
```

## Deployment Options

You can deploy your LangGraph service in several ways:

1. Using Docker:
```dockerfile
FROM python:3.9
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["gunicorn", "server:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker"]
```

2. Cloud Platforms:
- AWS Lambda
- Google Cloud Run
- Azure Container Apps
- Kubernetes clusters

## Testing Your Service

You can test your deployed service using curl:

```bash
curl -X POST http://localhost:8000/run-workflow \
  -H "Content-Type: application/json" \
  -d '{"messages": [], "current_step": "start"}'
```

## Best Practices I've Learned

Through my exploration of LangGraph, I've found these practices to be helpful:

1. State Management
   - Keep your state objects small and focused
   - Use clear naming conventions for state fields
   - Document the expected structure of your state

2. Error Handling
   - Implement proper error handling at both the graph and server level
   - Use appropriate HTTP status codes
   - Provide meaningful error messages

3. Testing
   - Test individual node functions
   - Test the complete workflow
   - Test API endpoints
   - Include integration tests

4. Monitoring
   - Implement logging
   - Add metrics collection
   - Set up alerting for critical failures

## Conclusion

As I continue to learn about LangGraph, I'm impressed by its approach to building stateful LLM applications. The graph-based structure helps keep code organized and maintainable, especially for complex workflows. While it doesn't include built-in server capabilities, it pairs well with FastAPI for creating production-ready services.

I'll keep updating this post as I learn more about LangGraph and discover new patterns and best practices. If you have any insights or experiences with LangGraph, I'd love to hear about them!

## Resources

- [LangGraph Documentation](https://python.langchain.com/docs/langchain_api/graphs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [LangChain](https://python.langchain.com/) (LangGraph is part of the LangChain ecosystem)

I hope you like this article, if you want to hear more follow me on X at [@juanstoppa](https://x.com/juanstoppa) where I regularly post about AI 
