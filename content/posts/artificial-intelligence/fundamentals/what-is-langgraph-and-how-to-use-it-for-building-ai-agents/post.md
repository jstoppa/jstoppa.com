---
author: Juan Stoppa
title: "What is LangGraph and How to Use It for Building AI Agents"
summary: A clear guide to LangGraph and AI agents. LangChain's docs can be overwhelming, so I put this together to help with implementation and deployment of stateful agents.
date: 2025-02-16
description: A practical guide to LangGraph and AI agents. This covers the basics, real examples, and deployment. I wrote it to simplify LangChain's complex docs and help people build stateful AI agents.
draft: false
math: true
tags: ['langgraph', 'ai-agents', 'langchain', 'python']
cover:
    image: 'posts/artificial-intelligence/fundamentals/what-is-langgraph-and-how-to-use-it-for-building-ai-agents/langgraph-agents-cover.png'
    caption: "What is LangGraph and How to Use It for Building AI Agents"
    hidden: true
twitter:
    card: summary_large_image
    site: '@juanstoppa'
    title: "What is LangGraph and How to Use It for Building AI Agents"
    description: A practical guide to LangGraph and AI agents. This covers the basics, real examples, and deployment. I wrote it to simplify LangChain's complex docs and help people build stateful AI agents.
---

I keep finding myself going back to the LangChain documentation to figure out how to use LangGraph. While the documentation is comprehensive, it can be overwhelming to navigate, especially when you're trying to build advanced AI agents.

This guide is my attempt to consolidate the key concepts and practical implementations of LangGraph in one place. Whether you're building a conversational agent that needs to remember context, a multi-step reasoning agent, or a complex workflow that coordinates multiple AI components, LangGraph provides the framework to make it happen. I created this reference for myself but I hope it helps others who want a more straightforward explanation of how to use LangGraph effectively.

## What is LangGraph?

LangGraph is a framework that brings state machines to Large Language Model (LLM) applications. It's particularly useful when you need to build complex, stateful applications with LLMs. The framework allows you to structure your application as a graph, where each node represents a specific task or state, and edges represent transitions between states.

## Basic LangGraph Example

Let's start with a simple example to understand the core concepts: we are developing a simple agent that collects information and  processes it, the actions  of collecting and processing information are just fixed actions but they can be replaced with more complex actions.

[![Run example in Hugging Face](https://img.shields.io/badge/🤗%20Run%20in-Hugging%20Face-blue)](https://huggingface.co/spaces/jstoppa/langgraph_basic_example)


```python
from langgraph.graph import StateGraph
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages
from langchain_core.runnables.graph import MermaidDrawMethod

class State(TypedDict):
    messages: Annotated[list[str], add_messages]
    current_step: str

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

# Set entry and finish points
workflow.set_entry_point("collect")
workflow.set_finish_point("process")

app = workflow.compile()

# Run workflow
print("\nStarting workflow...")
initial_state = State(messages=["Starting"], current_step="collect")
final_state = app.invoke(initial_state)
print(f"\nFinal messages: {final_state['messages']}")

# Save the graph visualization as PNG
png_data = app.get_graph().draw_mermaid_png(draw_method=MermaidDrawMethod.API)
with open("workflow_graph.png", "wb") as f:
    f.write(png_data)
print("\nGraph visualization saved as 'workflow_graph.png'")
```

This example shows the basic structure of a LangGraph application:
1. Define your state using TypedDict, it contains the information that the workflow will need to keep track of.
2. Create functions for each state, these functions are the actions that the workflow will perform.
3. Build a graph with nodes and edges, the nodes are the states and the edges are the transitions between them.
4. Compile the graph into a runnable application, this will create a callable object that can be invoked with an initial state.
5. I also added a simple way to save the graph visualization as a PNG file, this will work if you are running this example locally and should save a file that will show the graph structure like below.

The graph is a good way to understand the workflow, it shows the nodes and the edges between them, the entry and finish points and the state of the workflow.

{{< rawhtml >}}
<p align="center">
<img src="/posts/artificial-intelligence/fundamentals/what-is-langgraph-and-how-to-use-it-for-building-ai-agents/langgraph-agents-workflow.png" alt="LangGraph Workflow" loading="lazy" />
</p>
{{< /rawhtml >}}

This particular example is not very useful but it shows the core concepts of LangGraph, you can simply replace the fixed actions with more complex ones and build a useful agent.

## Serving LangGraph as a Web Service

While LangGraph itself doesn't include built-in server capabilities, you can easily create a web service using [FastAPI](https://fastapi.tiangolo.com/) to serve your LangGraph workflows. Below I have modified the previous example to add a simple FastAPI server that allows you to run the workflow from a web interface.

[![Run example in Hugging Face](https://img.shields.io/badge/🤗%20Run%20in-Hugging%20Face-blue)](https://huggingface.co/spaces/jstoppa/langgraph_basic_example_api)


```python
from fastapi import FastAPI
from langgraph.graph import StateGraph
from typing import TypedDict, Annotated, List
from langgraph.graph.message import add_messages
from pydantic import BaseModel

# Initialize FastAPI app
app = FastAPI(title="LangGraph Agent API")

class State(TypedDict):
    messages: Annotated[list[str], add_messages]
    current_step: str

class AgentInput(BaseModel):
    messages: List[str]

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

# Set entry and finish points
workflow.set_entry_point("collect")
workflow.set_finish_point("process")

# Compile the workflow
agent = workflow.compile()


@app.post("/run-agent")
async def run_agent(input_data: AgentInput):
    """
    Run the agent with the provided input messages.
    """
    initial_state = State(messages=input_data.messages, current_step="collect")
    final_state = agent.invoke(initial_state)
    return {"messages": final_state["messages"]}

@app.get("/")
async def root():
    """
    Root endpoint that returns basic API information.
    """
    return {"message": "LangGraph Agent API is running", "endpoints": ["Navigate to https://jstoppa-langgraph-basic-example-api.hf.space/docs#/default/run_agent_run_agent_post to run the example"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
```

You can run this locally or using the [Hugging Face](https://huggingface.co/) space below, this is the URL to access the swagger API for this example https://jstoppa-langgraph-basic-example-api.hf.space/docs, the API has an end point to run the agent and it returns the messages we've seen in our previous example (see below the results). In simple words, the API has an end point to run the agent and it returns the messages we've seen in our previous example.

{{< rawhtml >}}
<p align="center">
<img src="/posts/artificial-intelligence/fundamentals/what-is-langgraph-and-how-to-use-it-for-building-ai-agents/langgraph-agents-api.png" alt="LangGraph Agent API" loading="lazy" />
</p>
{{< /rawhtml >}}


## Making it all work with a more interesting example

We are now going to create a more interesting example, an AI agent that does code reviews, this is far from a production-ready agent but it will give us a better understanding of how to use LangGraph.

The screenshot below shows the interface for the code review agent, the user can enter a code and the agent will return a report with the code analysis. This interface uses the [Gradio library](https://www.gradio.app/) to create a simple web interface, this saves a lot of time compared to building a full web app.


{{< rawhtml >}}
<p align="center">
<img src="/posts/artificial-intelligence/fundamentals/what-is-langgraph-and-how-to-use-it-for-building-ai-agents/langgraph-agents-code-review.png" alt="LangGraph Agent API" loading="lazy" />
</p>
{{< /rawhtml >}}

The full code is provided after this but the most impportant part of the example is the graph, it shows the nodes and the edges between them, the entry and finish points and the state of the workflow, this is how the graph will look through the code and analyse the code with different agents that are especialised on different aspects. This is a very similar apporach we've seen in the previous example but it contains more actions and the actions do use LLMs to analyse the code.

```python
# Create and setup graph
workflow = StateGraph(State)

# Add nodes
workflow.add_node("style", analyze_code_style)
workflow.add_node("security", analyze_security)
workflow.add_node("performance", analyze_performance)
workflow.add_node("architecture", analyze_architecture)
workflow.add_node("recommendations", generate_final_recommendations)

# Add edges
workflow.add_edge("style", "security")
workflow.add_edge("security", "performance")
workflow.add_edge("performance", "architecture")
workflow.add_edge("architecture", "recommendations")

# Set entry and finish points
workflow.set_entry_point("style")
workflow.set_finish_point("recommendations")

# Compile the workflow
agent = workflow.compile()
```

the full code for the agent is below and it can also be found in Hugging Face below.
[![Run example in Hugging Face](https://img.shields.io/badge/🤗%20Run%20in-Hugging%20Face-blue)](https://huggingface.co/spaces/jstoppa/langgraph_agent_code_reviewer)

```python
import gradio as gr
from langgraph.graph import StateGraph
from typing import TypedDict, Annotated, List, Dict
from langgraph.graph.message import add_messages
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
import json
import requests
import os
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

# Define the state structure
class State(TypedDict):
    messages: Annotated[list[SystemMessage | HumanMessage | AIMessage], add_messages]
    current_step: str
    code: str
    style_analysis: Dict
    security_analysis: Dict
    performance_analysis: Dict
    architecture_analysis: Dict
    final_recommendations: Dict

def call_huggingface_api(prompt: str, max_retries=3) -> Dict:
    """Call Hugging Face API with retry logic and proper error handling."""
    api_key = os.getenv("HUGGINGFACE_API_KEY")
    if not api_key:
        raise ValueError("HUGGINGFACE_API_KEY not found in environment variables")
    
    # You can change this to any model you prefer
    API_URL = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1"
    headers = {"Authorization": f"Bearer {api_key}"}
    
    for attempt in range(max_retries):
        try:
            response = requests.post(
                API_URL,
                headers=headers,
                json={
                    "inputs": prompt,
                    "parameters": {
                        "max_new_tokens": 1000,
                        "temperature": 0.7,
                        "top_p": 0.95,
                        "return_full_text": False
                    }
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    # Extract the generated text
                    text = result[0].get('generated_text', '')
                    # Try to parse as JSON if it contains JSON
                    try:
                        # Find JSON content between triple backticks if present
                        if "```json" in text:
                            json_str = text.split("```json")[1].split("```")[0].strip()
                        else:
                            json_str = text.strip()
                        return json.loads(json_str)
                    except json.JSONDecodeError:
                        return {"error": "Failed to parse JSON from response", "raw_text": text}
                
            # If model is loading, wait and retry
            if response.status_code == 503:
                wait_time = 2 ** attempt
                time.sleep(wait_time)
                continue
                
        except Exception as e:
            if attempt == max_retries - 1:
                return {"error": f"API call failed: {str(e)}"}
            time.sleep(2 ** attempt)
    
    return {"error": "Maximum retries reached"}

def analyze_code_style(state: State) -> dict:
    """Analyze code style and best practices."""
    code = state["code"]
    prompt = f"""You are a senior code reviewer focused on code style and best practices. Analyze this code:

{code}

Focus on:
1. Code readability and clarity
2. Adherence to common style guides
3. Variable/function naming
4. Code organization
5. Documentation quality

Provide your response in JSON format with these exact keys:
{{
    "issues": ["list of identified style issues"],
    "suggestions": ["list of improvement suggestions"],
    "overall_rating": "1-10 score as a number",
    "primary_concerns": ["list of main style concerns"]
}}"""

    analysis = call_huggingface_api(prompt)
    if "error" in analysis:
        analysis = {
            "issues": ["Error analyzing code style"],
            "suggestions": ["Try again later"],
            "overall_rating": 0,
            "primary_concerns": ["Analysis failed"]
        }
    
    messages = state["messages"] + [AIMessage(content="Completed code style analysis")]
    return {**state, "messages": messages, "style_analysis": analysis, "current_step": "security"}

def analyze_security(state: State) -> dict:
    """Analyze security vulnerabilities."""
    code = state["code"]
    prompt = f"""You are a security expert. Analyze this code for security vulnerabilities:

{code}

Focus on:
1. Input validation
2. Authentication/Authorization
3. Data exposure
4. Common vulnerabilities
5. Security best practices

Provide your response in JSON format with these exact keys:
{{
    "vulnerabilities": ["list of potential security issues"],
    "risk_levels": {{"vulnerability": "risk level"}},
    "recommendations": ["list of security improvements"],
    "overall_security_score": "1-10 score as a number"
}}"""

    analysis = call_huggingface_api(prompt)
    if "error" in analysis:
        analysis = {
            "vulnerabilities": ["Error analyzing security"],
            "risk_levels": {"Error": "High"},
            "recommendations": ["Try again later"],
            "overall_security_score": 0
        }
    
    messages = state["messages"] + [AIMessage(content="Completed security analysis")]
    return {**state, "messages": messages, "security_analysis": analysis, "current_step": "performance"}

def analyze_performance(state: State) -> dict:
    """Analyze code performance."""
    code = state["code"]
    prompt = f"""You are a performance optimization expert. Analyze this code for performance issues:

{code}

Focus on:
1. Time complexity
2. Space complexity
3. Resource usage
4. Bottlenecks
5. Optimization opportunities

Provide your response in JSON format with these exact keys:
{{
    "bottlenecks": ["list of identified performance bottlenecks"],
    "complexity_analysis": {{
        "time_complexity": "Big O notation",
        "space_complexity": "Big O notation",
        "critical_sections": ["list of critical sections"]
    }},
    "optimization_suggestions": ["list of performance improvements"],
    "performance_score": "1-10 score as a number"
}}"""

    analysis = call_huggingface_api(prompt)
    if "error" in analysis:
        analysis = {
            "bottlenecks": ["Error analyzing performance"],
            "complexity_analysis": {
                "time_complexity": "Unknown",
                "space_complexity": "Unknown",
                "critical_sections": []
            },
            "optimization_suggestions": ["Try again later"],
            "performance_score": 0
        }
    
    messages = state["messages"] + [AIMessage(content="Completed performance analysis")]
    return {**state, "messages": messages, "performance_analysis": analysis, "current_step": "architecture"}

def analyze_architecture(state: State) -> dict:
    """Analyze code architecture patterns."""
    code = state["code"]
    prompt = f"""You are a software architect. Analyze this code's architectural patterns:

{code}

Focus on:
1. Design patterns used
2. Code modularity
3. Component relationships
4. Architectural anti-patterns
5. System design principles

Provide your response in JSON format with these exact keys:
{{
    "patterns_identified": ["list of design patterns found"],
    "architectural_issues": ["list of architectural concerns"],
    "improvement_suggestions": ["list of architectural improvements"],
    "architecture_score": "1-10 score as a number"
}}"""

    analysis = call_huggingface_api(prompt)
    if "error" in analysis:
        analysis = {
            "patterns_identified": ["Error analyzing architecture"],
            "architectural_issues": ["Analysis failed"],
            "improvement_suggestions": ["Try again later"],
            "architecture_score": 0
        }
    
    messages = state["messages"] + [AIMessage(content="Completed architecture analysis")]
    return {**state, "messages": messages, "architecture_analysis": analysis, "current_step": "recommendations"}

def generate_final_recommendations(state: State) -> dict:
    """Generate final recommendations based on all analyses."""
    code = state["code"]
    prompt = f"""Analyze all previous results and provide final recommendations for this code:

Style Analysis: {json.dumps(state.get('style_analysis', {}))}
Security Analysis: {json.dumps(state.get('security_analysis', {}))}
Performance Analysis: {json.dumps(state.get('performance_analysis', {}))}
Architecture Analysis: {json.dumps(state.get('architecture_analysis', {}))}

Provide your response in JSON format with these exact keys:
{{
    "critical_issues": ["list of most critical issues"],
    "priority_improvements": ["list of high-priority improvements"],
    "quick_wins": ["list of easy-to-implement improvements"],
    "long_term_suggestions": ["list of long-term improvements"],
    "overall_health_score": "1-10 score as a number"
}}"""

    recommendations = call_huggingface_api(prompt)
    if "error" in recommendations:
        recommendations = {
            "critical_issues": ["Error generating recommendations"],
            "priority_improvements": ["Try again later"],
            "quick_wins": [],
            "long_term_suggestions": [],
            "overall_health_score": 0
        }
    
    messages = state["messages"] + [AIMessage(content="Generated final recommendations")]
    return {**state, "messages": messages, "final_recommendations": recommendations, "current_step": "end"}

def format_output(state: State) -> str:
    """Format the analysis results into a readable output."""
    output = """🔍 Code Analysis Report

🎨 Style & Best Practices
"""
    style = state.get("style_analysis", {})
    output += f"Rating: {style.get('overall_rating', 'N/A')}/10\n"
    output += "Issues:\n" + "\n".join([f"• {issue}" for issue in style.get("issues", [])]) + "\n\n"

    output += """🔒 Security Analysis
"""
    security = state.get("security_analysis", {})
    output += f"Score: {security.get('overall_security_score', 'N/A')}/10\n"
    vulnerabilities = security.get("vulnerabilities", [])
    risk_levels = security.get("risk_levels", {})
    output += "Vulnerabilities:\n" + "\n".join([f"• {v} ({risk_levels.get(v, 'Unknown')})" for v in vulnerabilities]) + "\n\n"

    output += """⚡ Performance Analysis
"""
    perf = state.get("performance_analysis", {})
    output += f"Score: {perf.get('performance_score', 'N/A')}/10\n"
    output += "Bottlenecks:\n" + "\n".join([f"• {b}" for b in perf.get("bottlenecks", [])]) + "\n\n"

    output += """🏗️ Architecture Analysis
"""
    arch = state.get("architecture_analysis", {})
    output += f"Score: {arch.get('architecture_score', 'N/A')}/10\n"
    output += "Patterns:\n" + "\n".join([f"• {p}" for p in arch.get("patterns_identified", [])]) + "\n\n"

    output += """📋 Final Recommendations
"""
    final = state.get("final_recommendations", {})
    output += f"Overall Health Score: {final.get('overall_health_score', 'N/A')}/10\n\n"
    output += "Critical Issues:\n" + "\n".join([f"• {i}" for i in final.get("critical_issues", [])]) + "\n\n"
    output += "Priority Improvements:\n" + "\n".join([f"• {i}" for i in final.get("priority_improvements", [])])

    return output

# Create and setup graph
workflow = StateGraph(State)

# Add nodes
workflow.add_node("style", analyze_code_style)
workflow.add_node("security", analyze_security)
workflow.add_node("performance", analyze_performance)
workflow.add_node("architecture", analyze_architecture)
workflow.add_node("recommendations", generate_final_recommendations)

# Add edges
workflow.add_edge("style", "security")
workflow.add_edge("security", "performance")
workflow.add_edge("performance", "architecture")
workflow.add_edge("architecture", "recommendations")

# Set entry and finish points
workflow.set_entry_point("style")
workflow.set_finish_point("recommendations")

# Compile the workflow
agent = workflow.compile()

def analyze_code(code: str) -> str:
    """Analyze the provided code using multiple perspectives."""
    initial_state = State(
        messages=[SystemMessage(content="Starting code analysis...")],
        current_step="style",
        code=code,
        style_analysis={},
        security_analysis={},
        performance_analysis={},
        architecture_analysis={},
        final_recommendations={}
    )
    
    final_state = agent.invoke(initial_state)
    return format_output(final_state)

# Create Gradio interface
iface = gr.Interface(
    fn=analyze_code,
    inputs=gr.Code(
        label="Enter your code for analysis",
        language="python",
        lines=20
    ),
    outputs=gr.Textbox(
        label="Analysis Results",
        lines=25
    ),
    title="🔍 Code Architecture Critic",
    description="Paste your code to get a comprehensive analysis of style, security, performance, and architecture.",
    examples=[
        ['''def process_data(data):
    result = []
    for i in range(len(data)):
        for j in range(len(data)):
            if data[i] + data[j] == 10:
                result.append((data[i], data[j]))
    return result

def save_to_db(user_input):
    query = "INSERT INTO users VALUES ('" + user_input + "')"
    db.execute(query)

API_KEY = "sk_test_123456789"''']
    ],
    theme=gr.themes.Soft()
)

if __name__ == "__main__":
    iface.launch() 
```

## Conclusion

LangGraph makes it easier to build AI agents that need to manage complex workflows. The graph-based approach keeps things organised and flexible, especially when dealing with multi-step processes or memory.

Even though LangGraph doesn’t come with built-in server features, it works well with FastAPI and other frameworks to serve agents as APIs. Whether you’re building a chatbot, a code reviewer, or something else entirely, it gives you a solid foundation to work with.

I’m still experimenting and learning, so I’ll keep updating this post as I find better ways to use LangGraph. If you’ve built something cool with it or have any questions, let me know—happy to chat!

## Resources

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/tutorials/introduction/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [LangChain](https://python.langchain.com/) (LangGraph is part of the LangChain ecosystem)

I hope you like this article, if you want to hear more follow me on X at [@juanstoppa](https://x.com/juanstoppa) where I regularly post about AI 
