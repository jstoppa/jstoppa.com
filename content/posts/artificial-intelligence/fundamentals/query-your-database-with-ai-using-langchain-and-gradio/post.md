---
author: Juan Stoppa
title: Query your database with AI using Langchain and Gradio
summary: This article explains how to setup Langchain and Gradio to create a ChatGPT like app to query your own database.
date: 2024-06-04
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
    title: Query your database with AI using Langchain and Gradio
    description: Writing a ChatGPT like app to query your database using LangChain and Gradio
---

I remember starting into the world of Machine Learning (ML) around 8 years ago, doing [Andrew Ng](https://en.wikipedia.org/wiki/Andrew_Ng)'s courses in  (Coursera)[https://www.coursera.org/specializations/machine-learning-introduction] and jumping into websites like [Kaggle](https://www.kaggle.com) to try to apply the concepts to resolve Machine Learning challenges. I personally didn't imagine that in just about 8 years we would be at a stage where we can chat with a model that will have such vast knowledge and even more, to have the ability to use tools that allows you to interact with your own databases and bringing some level or reasoning, like a proper assistant. 

That's exactly what we are going to explore in this article, the ability to interact with a Large Language Models (LLMs) that will use your own database to extract the data, analyse it and display it back to you

In this article will use two important tools:
- [Langchain](https://www.langchain.com/): a tool to create application using LLMs 
- [Gradio](https://www.gradio.app/): a framework to create web-based GUI that work with LLMs

If you want to go straight to the final solution simply navigate to the git repo that contains a working solution to use LangChain to communicate to a SQLLite DB or keep reading to learn about how it's built and how it can be configured for different use cases.

## Langchain and SQL
Let's 
