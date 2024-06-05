---
author: Juan Stoppa
title: Query your database with AI using Langchain and Gradio
summary: This article explains how to setup Langchain and Gradio to create a ChatGPT like app to query your own database.
date: 2024-06-04
description: Writing a ChatGPT like app to query your database using LangChain and Gradio.
draft: true
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

I remember starting in the world of Machine Learning (ML) around eight years ago, doing [Andrew Ng](https://en.wikipedia.org/wiki/Andrew_Ng)'s courses on [Coursera](https://www.coursera.org/specializations/machine-learning-introduction) and jumping into websites like [Kaggle](https://www.kaggle.com) to try to apply the concepts and solve Machine Learning challenges. I personally didn't imagine that in just a few years we would be at a stage where we can chat with a model that has such vast knowledge and, even more, the ability to use tools and bring some level of reasoning around it, like a proper assistant.

That's what we are going to explore in this article: the ability to interact with Large Language Models (LLMs) that can use your own database to extract data, analyse it, and display it back to you, explaining what it means. This article covers the basics of how to set it up. We will write other articles to explore in more detail what is possible

In this article will use two kwy tools:

-   [Langchain](https://www.langchain.com/): a framework for building applications using Large Language Models (LLMs).
-   [Gradio](https://www.gradio.app/): a Python library for creating easy-to-use web interfaces for machine learning models.

If you want to go straight to the final solution, simply navigate to the Git repo that contains a working solution for using LangChain to communicate with an SQLite DB. Alternatively, keep reading to learn how it's built and how it can be configured for different use cases.

What I'd recommend to do if you follow along is to read my article about how to

## LangChain and SQL
