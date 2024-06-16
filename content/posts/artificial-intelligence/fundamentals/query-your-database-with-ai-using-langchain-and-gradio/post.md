---
author: Juan Stoppa
title: Query your database with AI using LangChain and Gradio
summary: This article explains how to setup LangChain and Gradio to create a ChatGPT like app to query your own database.
date: 2024-06-16
description: Writing a ChatGPT like app to query your database using LangChain and Gradio.
draft: false
math: true
tags: ['langchain', 'gradio', 'python', 'chatgpt']
cover:
    image: 'posts/artificial-intelligence/fundamentals/query-your-database-with-ai-using-langchain-and-gradio/query-your-database-with-ai.png'
    caption: Query your database with AI
    hidden: true
twitter:
    card: summary_large_image
    site: '@juanstoppa'
    title: Query your database with AI using LangChain and Gradio
    description: Writing a ChatGPT like app to query your database using LangChain and Gradio
---

I remember starting in the world of Machine Learning (ML) around eight years ago, doing [Andrew Ng](https://en.wikipedia.org/wiki/Andrew_Ng)'s courses on [Coursera](https://www.coursera.org/specializations/machine-learning-introduction) and jumping into websites like [Kaggle](https://www.kaggle.com) to apply the concepts and solve Machine Learning challenges. I didn't personally imagine that in just a few years we would reach a stage where we can chat with a model that has such vast knowledge and, even more impressively, the ability to augment its knowledge with your own data and bring some level of reasoning around it, like a proper assistant.

That's what we are going to explore in this article: the ability to interact with Large Language Models (LLMs) that can use your own database to extract data, analyse it, and display it back to you, explaining what it means. This article covers the basics of how to set it up. I will covert in more details what is possible in future articles.

In this article we will use two key tools:

-   **[LangChain](https://www.langchain.com/)**: a framework for building applications using Large Language Models (LLMs).
-   **[Gradio](https://www.gradio.app/)**: a Python library for creating easy-to-use web interfaces for machine learning models.

If you want to go straight to the final solution, simply navigate to [the Github repo](https://github.com/jstoppa/langchain_sql_gradio) that contains a working solution for using LangChain to communicate with an SQLite DB and rendering a Gradio UI interface.

Alternatively, keep reading to learn how it's built and how it can be configured for different use cases.

## LangChain and SQL

With LangChain, you can pretty much make the application to reason as they describe it in [their website](https://www.langchain.com/) and they have built an interface that allows you to connect to a SQL databases.

We'll use the well known sample database called Northwind created by [Microsoft](https://learn.microsoft.com/en-us/dotnet/framework/data/adonet/sql/linq/downloading-sample-databases#get-the-northwind-sample-database-for-sql-server), it represents the sales data for a fictitious company called "Northwind Trades". I'm using the SQLLite3 version to make things simpler and avoid the need to install a SQL Server, I found the SQLLite version in [this Github repo](https://github.com/jpwhite3/northwind-SQLite3/tree/main/dist).

To start with, we need to create the llm model, LangChain support a long list of models, for this use case we need one that supports streaming since we want the results to be streamed to the Gradio UI. For this article, we'll use the OpenAI LLM (gpt-3.5-turbo API) but you can check the full list of models supported by LangChain in [here](https://python.langchain.com/v0.1/docs/integrations/llms/).

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0, api_key=os.environ.get("OPENAI_API_KEY"), streaming=True)
```

NOTE: You can get more details on how to setup the OPENAI_API_KEY in [this article](https://jstoppa.com/posts/getting_started_with_openai_in_python/post/#5-creating-a-hello-world-app-with-openai)

We now need to connect to the DB and create the chain.

```python
from langchain_community.utilities import SQLDatabase
from langchain.chains import create_sql_query_chain
from langchain_community.tools.sql_database.tool import QuerySQLDataBaseTool

db = SQLDatabase.from_uri("sqlite:///northwind.db")

execute_query = QuerySQLDataBaseTool(db=db)
write_query = create_sql_query_chain(llm, db)
chain = create_sql_query_chain(llm, db)
chain = write_query | execute_query
```

This is what each item above does:

-   **execute_query**: initialises the QuerySQLDataBaseTool which is designed to execute SQL queries on a database. It acts as an intermediary that takes SQL queries, runs them against the connected database and returns the results.
-   **write_query**: creates a query chain using a language model (llm) and the database connection (db). The create_sql_query_chain function sets up a pipeline to generate SQL queries.

The chain then combines the write_query chain and the execute_query tool into a single pipeline. The | operator is used to denote a sequence where the output of write_query is passed to execute_query.

The next step is to create a Prompt Template and create the final chain to combine all together.

```python
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from operator import itemgetter

answer_prompt = PromptTemplate.from_template(
    """Given the following user question, corresponding SQL query, and SQL result, answer the user question.
Question: {question}
SQL Query: {query}
SQL Result: {result}
Answer: """)

answer = answer_prompt | llm | StrOutputParser()
chain = (RunnablePassthrough.assign(query=write_query).assign(result=itemgetter("query") | execute_query) | answer )
```

And this is the explanation:

-   **answer_prompt**: creates a template for generating the prompt that will be fed to the language model. The template includes placeholders for the user question, the SQL query and the SQL result.
-   **answer**: sets up a pipeline where answer_prompt generates a prompt based on the template, llm processes the prompt to generate an answer and StrOutputParser parses the output from the language model.
-   **chain**: sets up a complete chain of operations using RunnablePassthrough to pass inputs unchanged, assign the query and return the results.

In summary the code above:

-   Generate an SQL query from a user question.
-   Execute the SQL query on the database.
-   Use the results of the query to generate a natural language answer to the user question.

## Plugin the chain into Gradio

We'll now plugin the chain created above to the Gradio UI, this will allow the user to have a user interface to interact with the model which will translate into SQL queries, retrieve the information and return the details to the user.

We'll first create a stream_response function that will be used for the Gradio interface

```python
from langchain.schema import AIMessage, HumanMessage

def stream_response(input_text, history):
    history = history or []
    history_langchain_format = []
    for human, ai in history:
        history_langchain_format.append(HumanMessage(content=human))
        history_langchain_format.append(AIMessage(content=ai))

    if input_text is not None:
        history_langchain_format.append(HumanMessage(content=input_text))
        partial_message = ""
        for response in chain.stream({"question": input_text}):
            if (response != ""):
                partial_message += response

            yield partial_message
```

The code above defines a function called stream_response that streams responses from a chain. The function handles both the input text and the conversation history. Worth noting the HumanMessage and AIMessage used to identify where the responses are coming from.

In summary, the code above does the following:

-   Converts the conversation history into the LangChain message format.
-   Adds the new input text to the history.
-   Streams responses from the AI, yielding partial responses as they are generated which allows for real time or incremental updates to the user.

And finally, we put it all together into a Gradio Chat Interface

```python
import gradio as gr

iface = gr.ChatInterface( stream_response, textbox=gr.Textbox(placeholder="Ask a question about the database...", container=False, scale=7),)

iface.launch(share=True)
```

When the entire code is executed, a new web interface will be triggered (normally in http://127.0.0.1:7860) where you can start interacting with the database

Here's a demo video with a user asking questions, note that I have misspelled words like London in some prompts in purpose however the models understood the mistake and executed the queries correctly against the database.

{{< rawhtml >}}
<video width="650" height="480" style="display: block; margin: 0 auto" controls>

  <source src="/posts/artificial-intelligence/fundamentals/query-your-database-with-ai-using-langchain-and-gradio/demo_langchain_sql_gradio.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
<br>
{{< /rawhtml >}}

I hope you like this tutorial, if you want to hear more follow me on X at [@juanstoppa](https://x.com/juanstoppa) where I regularly write about AI.
