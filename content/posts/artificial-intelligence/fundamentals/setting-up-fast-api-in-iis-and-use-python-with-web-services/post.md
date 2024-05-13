---
author: Juan Stoppa
title: Setting up Fast API in IIS
summary: This article demonstrates how to setup Fast API in Internet Information Serine (IIS) to use Python as web services
date: 2024-04-10
description: In this article you'll learn how to setup IIS to run Fast API and create web services for your Python app.
draft: true
math: true
tags: ['python', 'fast-api', 'langchain', 'openai']
cover:
    image: 'posts/artificial-intelligence/fundamentals/setting-up-fast-api-iis/using-rag-azure-openai.webp'
    caption: Azure Open AI
    hidden: true
twitter:
    card: summary_large_image
    site: '@juanstoppa'
    title: Setting up Fast API in IIS
    description: This article demonstrates how to setup Fast API in Internet Information Serine (IIS) to use Python as web services
---

Many folks I meet are trying to figure out how to implement AI at their work or corporate infrastructure, I've seen many that end up frustrated because of their company setup being mostly on prem and windows while the AI industry work primarily in the Cloud. They are able to call apis such as ChatGPT and Azure Open AI but as soon as they try to dig a bit deeper, they find themselves blocked by the lack of support. One of them is the ability to host Python apps in a mostly dominated by .NET.

This article aims at that, how you can run and host python in IIS, and why not eventually running your own local models and expand into use an on prem AI infra without having to risk exposing any of client info

## Install IIS

Make you have IIS installed
document steps

## add wfastcgi to your Python project

pip install wfastcgi

and enable
wfastcgi-enable

you might need to isntall the URL re write module

Http plarform handlers
https://iis-umbraco.azurewebsites.net/downloads/microsoft/url-rewrite

https://www.iis.net/downloads/microsoft/httpplatformhandler
