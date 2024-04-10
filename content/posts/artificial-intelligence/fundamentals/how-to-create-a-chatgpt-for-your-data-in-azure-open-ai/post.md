---
author: Juan Stoppa
title: Creating a Custom ChatGPT with Azure OpenAI - A Quick Guide
summary: Step by step guide to create a Custom GPT to chat with your own data using Azure Open AI  
date: 2024-03-14
description: This article describes how you can configure a Custom GPT to chat with your own data, using Azure AI search and deploying it to the Azure infrastructure. 
draft: false
math: true
tags: ["embeddings", "llm", "nlp", "python"]
cover:
    image: "posts/artificial-intelligence/fundamentals/how-to-create-a-chatgpt-for-your-data-in-azure-open-ai/custom-GPT-Azure-OpenAI.webp"
    caption: Custom GPT with Azure OpenAI
twitter:
    card: summary_large_image
    site: "@juanstoppa"
    title: Creating a Custom ChatGPT Model with Azure OpenAI - A Quick Guide
    description: This article describes how you can configure a Custom GPT to chat with your own data, using Azure AI search and deploying it to the Azure infrastructure. 
---

I've been exploring different ways to use AI in my day-to-day job. I personally use Azure and want to leverage as much as possible the partnership they have with OpenAI.

What you will learn in this article is how to use your own data to create a ChatGPT-like agent using Azure OpenAI API.

What I'm using in this post includes:

- [Azure Open AI studio](https://oai.azure.com/): a platform where Microsoft teamed up with OpenAI to give you access to their API directly from the Azure infrastructure. It's designed for developers and businesses that want to integrate AI into their apps or services, making them smarter and more intuitive.
- [Azure AI Search](https://azure.microsoft.com/en-gb/products/ai-services/ai-search): a service designed to retrieve information across user-generated content, both in traditional search scenarios and in applications powered by generative AI. Whether you're developing applications that require conventional search functionalities or generative AI capabilities, this service delivers that for you.
- [Azure APP service](https://azure.microsoft.com/en-gb/products/app-service): a service that allows you to quickly build, deploy and scale web apps and APIs. Work with most programming languages and runs on Windows or Linux.

## Signing up for Open AI Studio

First things first, you'll need to create a Microsoft account and sign up for Azure Open AI Studio, best way if you don't have one already is to navigate to https://oai.azure.com/ and create a new account

![Creating a Microsoft Account](/posts/artificial-intelligence/fundamentals/how-to-create-a-chatgpt-for-your-data-in-azure-open-ai/sign-up-for-microsoft-account.png)  

At the time of writing this post, the Azure Open AI studio was in preview mode, if this is still valid you need to request access by submitting this form in customer voice https://customervoice.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR7en2Ais5pxKtso_Pz4b1_xUNTZBNzRKNlVQSFhZMU9aV09EVzYxWFdORCQlQCN0PWcu


## Using the Open AI studio 

Once the account is created, you can access the studio by navigating to the URL https://oai.azure.com/, you'll be presented with some options on how to get started
![Azure Open AI Studio main page](/posts/artificial-intelligence/fundamentals/how-to-create-a-chatgpt-for-your-data-in-azure-open-ai/azure-open-ai-studio-main-page.png)  

In the interest of this post, we'll be using the Chat functionality in the Playground area where I defined the fundamental areas:
1. **Playground**: this gives you the ability to test all the different tools Azure Open AI Studio has, chat functionality, completions, DALL-E for generating images and assistants which are in preview mode at the time of creating this post.
2. **Prompts**: this area is where you define your prompts, you can start them from templates or create your own prompts from scratch.
3. **Test the assistant**: you can directly test your assistant in the playground by writing questions and interacting with it.

![Azure Open AI Studio - Testing the assistant](/posts/artificial-intelligence/fundamentals/how-to-create-a-chatgpt-for-your-data-in-azure-open-ai/azure-open-ai-studio-chat-playground.png)  


For instance, I have a created an assistant that can help me working and analysing the Open Banking API.









