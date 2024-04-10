---
author: Juan Stoppa
title: Creating a ChatGPT like app to read your own data using RAG in Azure Open AI
summary: Quick and easy to setup ChatGPT like app using Retrieval Augmented Generation (RAG) pattern in Azure Open AI
date: 2024-02-07
description: In this article you'll learn how to create a ChatGPT like app using Retrieval Augmented Generation (RAG) pattern on your own data
draft: false
math: true
tags: ['azure', 'openai', 'chatgpt', 'rag']
cover:
    image: 'posts/artificial-intelligence/fundamentals/creating-a-chatgpt-like-app-to-read-your-own-data-using-rag-in-azure-open-ai/azure-ai-open-ai.png'
    caption: Azure Open AI
twitter:
    card: summary_large_image
    site: '@juanstoppa'
    title: Creating a ChatGPT like app to read your own data using RAG in Azure Open AI
    description: Quick and easy to setup ChatGPT like app using Retrieval Augmented Generation (RAG) pattern in Azure Open AI
---

You probably heard about all the fuss about Retrieval Augmented Generation (RAG) pattern when using Large Language Models (LLM), in this article we'll dig into the details to understand how it works, get a ChatGPT like app working in Azure Open AI and finally get the app to read and understand your own data.

# What is RAG?

# Using the Azure Search OpenAI Demo

Microsoft has build an example that gets the app up and runing very quickly as long as you have already setup the subscription.

Before you carry on, please make sure you have followed the [prerequisites](https://learn.microsoft.com/en-us/azure/developer/python/get-started-app-chat-template?tabs=github-codespaces#prerequisites), once you've have that setup you can follow the next step which is getting the app runing.

You can choose to either deploy it in [GitHub Codespaces](https://learn.microsoft.com/en-us/azure/developer/python/get-started-app-chat-template?tabs=github-codespaces#open-development-environment) or [Visual Studio Code](https://learn.microsoft.com/en-us/azure/developer/python/get-started-app-chat-template?tabs=visual-studio-code#open-development-environment), I'd personally recommend running using Visual Studio Code, it's what I followed in this example.

The purpose of this article is not about installing the app but going straight to the point once the app is fully workng, ideally locally so you don't need to host it.
