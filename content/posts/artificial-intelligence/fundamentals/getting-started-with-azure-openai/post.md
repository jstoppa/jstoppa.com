---
author: Juan Stoppa
title: Getting started with Azure OpenAI
summary: Step by step guide on how to get started with using Azure Open AI and build ChatGPT like apps.
date: 2024-04-14
description: This article describes how to get started with Azure Open AI and build ChatGPT like apps.
draft: false
math: true
tags: ['azure-ai', 'openai', 'chatgpt', 'azure-ai-search']
cover:
    image: 'posts/artificial-intelligence/fundamentals/getting-started-with-azure-openai/azure-ai-open-ai.png'
    caption: Custom GPT with Azure OpenAI
twitter:
    card: summary_large_image
    site: '@juanstoppa'
    title: Getting started with Azure OpenAI
    description: This article describes how to get started with Azure Open AI and build ChatGPT like apps.
---

I've been exploring ways to use AI in my day-to-day job. I personally use Azure and want to leverage as much as possible the partnership they have with OpenAI.

What you will learn in this article is how to use your own data to create a ChatGPT-like agent using Azure OpenAI API.

What I'm using in this post includes:

-   [Azure Open AI studio](https://oai.azure.com/): a platform where Microsoft teamed up with OpenAI to give you access to their API directly from the Azure infrastructure. It's designed for developers and businesses that want to integrate AI into their apps or services, making them smarter and more intuitive.
-   [Azure AI Search](https://azure.microsoft.com/en-gb/products/ai-services/ai-search): a service designed to retrieve information across user-generated content, both in traditional search scenarios and in applications powered by generative AI. Whether you're developing applications that require conventional search functionalities or generative AI capabilities, this service delivers that for you.
-   [Azure APP service](https://azure.microsoft.com/en-gb/products/app-service): a service that allows you to quickly build, deploy and scale web apps and APIs. Work with most programming languages and runs on Windows or Linux.

## Signing up for Open AI Studio

First things first, you'll need to create a Microsoft account and sign up for Azure Open AI Studio, best way if you don't have one already is to navigate to https://oai.azure.com/ and create a new account

![Creating a Microsoft Account](/posts/artificial-intelligence/fundamentals/getting-started-with-azure-openai/sign-up-for-microsoft-account.png)

At the time of writing this post, the Azure Open AI studio was in preview mode, if this is still valid you need to request access by submitting this form in customer voice https://customervoice.microsoft.com/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR7en2Ais5pxKtso_Pz4b1_xUNTZBNzRKNlVQSFhZMU9aV09EVzYxWFdORCQlQCN0PWcu

## Using the Open AI studio

Once the account is created, you can access the studio by navigating to the URL https://oai.azure.com/, you'll be presented with some options on how to get started
![Azure Open AI Studio main page](/posts/artificial-intelligence/fundamentals/getting-started-with-azure-openai/azure-open-ai-studio-main-page.png)

In the interest of this post, we'll be using the Chat functionality in the Playground area which I define below:

1. **Playground**: this gives you the ability to test all the tools Azure Open AI Studio has, chat functionality, completions, DALL-E for generating images and assistants which are in preview mode at the time of creating this post.
2. **Prompts**: this area is where you define your prompts, you can start them from templates or create your own prompts from scratch.
3. **Test the assistant**: you can directly test your assistant in the playground by writing questions and interacting with it.

![Azure Open AI Studio - Testing the assistant](/posts/artificial-intelligence/fundamentals/getting-started-with-azure-openai/azure-open-ai-studio-chat-playground.png)

To test its capability, I will use the [Microsoft Annual Report from 2023](https://view.officeapps.live.com/op/view.aspx?src=https%3A%2F%2Fc.s-microsoft.com%2Fen-us%2FCMSFiles%2F2023_Annual_Report.docx%3Fversion%3Ddfd6ff7f-0999-881d-bedf-c6d9dadab40b&wdOrigin=BROWSELINK), I have a [version in PDF format](/posts/artificial-intelligence/fundamentals/getting-started-with-azure-openai/Microsoft_2023_Annual_Report.pdf). For this I will use the Azure AI Search capability from Microsoft that allows us to store the document and get the agent to search information on it.

> NOTE: To add your data in the steps below, you'll first need to create an Azure AI Search service, follow the steps in [this Microsoft article](https://learn.microsoft.com/en-us/azure/search/search-create-service-portal).

> NOTE 2: It's also important that you create the resource in a [region where the Open AI service is available](https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/use-your-data?tabs=ai-search#regional-availability-and-model-support)

Follow the steps below to add your data

1. Click on "Add your data"
2. Followed by "Add a data source"

![Azure Open AI Studio - Adding you own data in Open AI Studio](/posts/artificial-intelligence/fundamentals/getting-started-with-azure-openai/adding-your-data-in-azure-open-ai-studio.png)

This will take you to a wizard where you need to complete the following:

1. Select data source: this should be set to "Upload files"
2. Subscription where the Azure AI Search has been created
3. Select Azure Blob storage resource: a blob storage where the file can be uploaded
4. Select Azure AI Search resource: selectable from the list, it's the service mentioned in the NOTE above
5. Enter Index name: index to be created to search the data

![Azure Open AI Studio - Adding Azure AI resource in Chat Playground](/posts/artificial-intelligence/fundamentals/getting-started-with-azure-openai/adding-azure-ai-to-azure-open-ai-chat-playground.png)

Add the file in the next page in the wizard and click on Upload files
![Azure Open AI Studio - Adding PDF into Azure AI resource in Chat Playground](/posts/artificial-intelligence/fundamentals/getting-started-with-azure-openai/adding-pdf-azure-open-ai-chat-playground.png)

The next step is to select the type of search (Keyword) and then the chunk size which is 1024 by default
![Azure Open AI Studio - Adding Keyword and chunk size into Azure AI resource in Chat Playground](/posts/artificial-intelligence/fundamentals/getting-started-with-azure-openai/adding-your-data-azure-open-ai-keyword-size.png)

Once finished, the ingestion progress will start which should take a few minutes

# Querying the data

You can now ask any question to the document and it should come with an answer about the document, for instance I have asked to give a summary of Microsoft 2023 Annual report and returned the following
![Azure Open AI Studio - Adding Keyword and chunk size into Azure AI resource in Chat Playground](/posts/artificial-intelligence/fundamentals/getting-started-with-azure-openai/querying-data-in-auzre-open-ai-studio.png)

When answering the question, the chat result will show links to the sources which can be opened on the right hand side.
![Azure Open AI Studio - Showing reference in Azure AI Studio within the Chat Playground](/posts/artificial-intelligence/fundamentals/getting-started-with-azure-openai/showing-references-in-azure-open-ai-studio.png)

Another interesting feature is the ability to View the Code, this can be helpful to understand how the chat works and how the context is passed back and forth which enriches the conversation with the LLM.
![Azure Open AI Studio - Showing code in Azure AI Studio within the Chat Playground](/posts/artificial-intelligence/fundamentals/getting-started-with-azure-openai/showing-code-azure-ai-studio-open-ai-chat-playground.png)

# Deploying the app

With the Azure AI Studio is quite easy to deploy the APP in azure, you simply need to click on "Deploy to" > "A new web app...", you can either create a new app or select an existing.
![Azure Open AI Studio - Showing code in Azure AI Studio within the Chat Playground](/posts/artificial-intelligence/fundamentals/getting-started-with-azure-openai/deploying-app-from-azure-ai-studio.png)

Once deployed, a link will show in the notification which will redirect you to the app
![Azure Open AI Studio - App deployed from Azure AI Studio within the Chat Playground](/posts/artificial-intelligence/fundamentals/getting-started-with-azure-openai/app-deployed-to-azure-from-azure-open-ai-studio.png)

It's also possible to customise the app to your needs using environments variables in Azure, you can check the possible options in [this article](https://github.com/microsoft/sample-app-aoai-chatGPT/tree/ea7a94a7979fc62f56ffac553401d483ff6d807e?tab=readme-ov-file#environment-variables), this should allow you to change the logo and some of the wording in the page

And that's all, you should have the app running now!

If you like the article, please follow me on X at [@juanstoppa](https://twitter.com/juanstoppa) where a regularly post about AI.
