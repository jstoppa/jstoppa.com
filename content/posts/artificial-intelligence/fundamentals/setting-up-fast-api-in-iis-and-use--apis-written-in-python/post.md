---
author: Juan Stoppa
title: Setting up Fast API in IIS and run APIs in Python
summary: This article demonstrates how to setup Fast API in Internet Information Serine (IIS) to use Python as web services.
date: 2024-05-26
description: In this article you'll learn how to setup IIS to run Fast API and create web services using Python code.
draft: false
math: true
tags: ['python', 'fast-api', 'langchain', 'openai']
cover:
    image: 'posts/artificial-intelligence/fundamentals/setting-up-fast-api-in-iis-and-use--apis-written-in-python/fast-api-python-logo.webp'
    caption: Setting up Fast API in IIS and run APIs in Python
    hidden: true
twitter:
    card: summary_large_image
    site: '@juanstoppa'
    title: Setting up Fast API in IIS and run APIs in Python
    description: In this article you'll learn how to setup IIS to run Fast API and create web services using Python code.
---

Many clients I meet struggle to implement AI within their corporate infrastructure. They often become frustrated because their companies are mostly on-premises and use Windows, while the AI industry largely operates in the cloud. Although they can call APIs like ChatGPT and Azure OpenAI, they face problems when attempting to integrate more advanced AI features into solutions primarily written in Java and .NET.

This is where I see Python playing a crucial role. The AI industry predominantly uses it to develop solutions, making it easier to get up to speed with any AI example. The real question is whether you can integrate Python into your existing tech stack if it's already based on Windows.

This article will show you how to setup an API written in Python using an amazing framework called [FastAPI](https://fastapi.tiangolo.com/). This article is an introduction on how to use the framework, I blog later on more advanced use cases.

## Setting up the app example in IIS

Follow the steps below to start with

> NOTE: you'll need to have Python and PIP installed for this, follow [these steps](http://localhost:1313/posts/getting_started_with_openai_in_python/post/#1-how-to-install-python-on-windows) if you haven't installed it already

1. Create the website in IIS as shown in the image, note I'm using the port 8080
   ![Image example for GPT-Vision](/posts/artificial-intelligence/fundamentals/setting-up-fast-api-in-iis-and-use--apis-written-in-python/fast-api-setting-up-webstie-in-iis.png)

2. Copy the code example below into a main.py code (the example was taken from the [Fast API website](https://fastapi.tiangolo.com/#example))

```python
from typing import Union
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}
```

3. Install Fast API using the pip command `pip install fastapi`
   ![Install FastAPI using PIP](/posts/artificial-intelligence/fundamentals/setting-up-fast-api-in-iis-and-use--apis-written-in-python/install-fast-api-with-pip.gif)

## Configuring the HttpPlatformHandler

The next step is to get the `HttpPlatformHandler` working in IIS, this is a handler that passes socket connections directly to the Python process (more info [here](https://learn.microsoft.com/en-us/visualstudio/python/configure-web-apps-for-iis-windows?view=vs-2022#configure-the-httpplatformhandler)).

1. Create a `web.config` file inside the website folder with the following content, make sure you change the folder to point at the location where python is installed in your local machine

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
    <system.webServer>
        <handlers accessPolicy="Read, Execute, Script">
            <add name="FastAPIHttpPlatformHandler" path="*" verb="*" modules="httpPlatformHandler"
                resourceType="Unspecified" />
        </handlers>
        <httpPlatform processPath="C:\Users\<username>\AppData\Local\Programs\Python\Python312\python.exe"
            arguments="-m uvicorn --port %HTTP_PLATFORM_PORT% main:app"
            stdoutLogEnabled="true" stdoutLogFile="C:\logs\python.log" startupTimeLimit="120" requestTimeout="00:05:00">
        </httpPlatform>
        <httpErrors errorMode="Detailed" />
    </system.webServer>
</configuration>
```

2. Navigate to the [http://localhost:8080/](http://localhost:8080/) which should load the API already

![Load Fast API locally](/posts/artificial-intelligence/fundamentals/setting-up-fast-api-in-iis-and-use--apis-written-in-python/load-fast-api-locally.png)

Fast API also comes with swagger already installed, you can simply navigate to [http://localhost:8080/docs](http://localhost:8080/docs)

![Load Fast API swagger](/posts/artificial-intelligence/fundamentals/setting-up-fast-api-in-iis-and-use--apis-written-in-python/load-fast-api-swagger.png)

## Other considerations

You might find some recommendations to use [hypercorn](https://pgjones.gitlab.io/hypercorn/) rather than [uvicorn](https://www.uvicorn.org/), I tried that initially but I couldn't resolve an issue with socket permission, I raised it as a bug in [their GitHub repo](https://github.com/pgjones/hypercorn/issues/231).

You might also find issues where the API loads and hangs forever. In that case, you'll most likely need to grant `IIS_IUSRS` read access to the folder where the app and Python are located, as mentioned in [here](https://docs.lextudio.com/blog/running-flask-web-apps-on-iis-with-httpplatformhandler/#the-infinite-loading).
