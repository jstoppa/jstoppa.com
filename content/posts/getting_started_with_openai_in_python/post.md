---
author: Juan Stoppa
title: Getting started with OpenAI in Python
summary: A beginner's guide to install Python and start using OpenAI in Windows
date: 2023-04-19
description: A beginner's guide to get started using OpenAI using Python in Windows
draft: false
math: true
tags: ["openai", "python", "chatgpt", "gpt"]
cover:
    image: "posts/getting_started_with_openai_in_python/openai_python.png"
twitter:
    card: summary_large_image
    site: "@juanstoppa"
    title: Getting started with OpenAI in Python
    description: All you need to know to understand OpenAI and start using it
ShowCodeCopyButtons: true
ShowReadingTime: true
---


## Introduction

Welcome to this beginner's guide on setting up your Windows environment for OpenAI development! In this article, I will cover the basics of installing Python, using pip, creating virtual environments, and debugging code in VSCode. By the end of this article, you will have a solid foundation to start your OpenAI journey using the GPT API and understand how ChatGPT works behind the scene.

NOTE: This post is specifically dedicated to the folks that use Windows, I haven't added the steps to do it in other operating systems.

## 1. How to Install Python on Windows

To get started, you'll need to install Python on your Windows machine. Follow these steps:

1. Go to the official Python website (https://www.python.org/downloads/windows/) and download the latest Python installer for Windows.
2. Run the installer and make sure to check the box that says "Add Python to PATH" before clicking the "Install Now" button. This will make it easier to use Python from the command prompt.
3. Once the installation is complete, open a new command prompt and type `python --version` to verify that Python is installed correctly. You should see the version number you just installed.

## 2. How to Install Pip

Pip is the default package manager for Python and is used to install and manage Python packages. It is included with Python, so if you followed the steps above, pip should already be installed on your system.

To confirm pip is installed, open a command prompt and type `pip --version`. You should see the version number of pip.

## 3. How to Create a Virtual Environment

A virtual environment is an isolated Python environment that allows you to manage dependencies for a specific project, without affecting other projects or the global Python installation. To create a virtual environment, follow these steps:

1. Open a command prompt and navigate to your project directory.
2. Run the following command to create a new virtual environment named `venv_test`:
```console
python -m venv venv_test
```
3. Activate the virtual environment using the appropriate command for your shell:

For Command Prompt:
```console
venv_test\Scripts\activate.bat
```

For PowerShell:
```console
./venv_test/Scripts/activate.ps1
```

Once activated, you should see `(venv_test)` at the beginning of your command prompt, indicating that you are in the virtual environment. I recorded the steps I've done in my machine

![Steps to create Virtual Environment in Python](/posts/getting_started_with_openai_in_python/create_virtual_environment.gif)  

## 4. How to Use VSCode to Debug the Code

Visual Studio Code (VSCode) is a popular code editor that offers powerful debugging features. To get started, follow these steps:

1. Install Visual Studio Code from https://code.visualstudio.com/download.
2. Launch VSCode and open your project folder by clicking on "File" > "Open Folder" and selecting your project directory.
3. Install the "Python" extension by Microsoft from the Extensions Marketplace (Ctrl + Shift + X).
4. Configure your virtual environment in VSCode by clicking on the "Python" label in the status bar at the bottom left of the window and selecting your virtual environment from the list.
5. Create a new Python file (e.g., `main.py`) and write some sample code.
6. Set a breakpoint by clicking on the left margin next to the line number where you want the debugger to pause execution.
7. Click on the "Run" menu > "Start Debugging" or press F5 to start debugging.
8. VSCode will now pause at the breakpoint, allowing you to step through your code, inspect variables, and more. See example below


![Steps to debug code in VSCode](/posts/getting_started_with_openai_in_python/debugging_code_vscode.gif)  


## 5. Creating a Hello World App with OpenAI

Now that you have your environment set up, let's create a simple "Hello World" application using the OpenAI API. For this example, we'll use the OpenAI GPT-4 language model to generate a creative greeting.

Follow these steps:

1. Install the `openai` package inside the virtual environment using pip:

```bash
pip install openai
```
2. Sign up for an API key on the OpenAI website (https://beta.openai.com/signup/), once logged in you can get your keys from (https://platform.openai.com/account/api-keys)
![Creating an OpenAI key](/posts/getting_started_with_openai_in_python/creating_openai_key.png)

3. Save your API key as an environment variable named `OPENAI_API_KEY`. 
![Save the OPEN API Key to environment variable](/posts/getting_started_with_openai_in_python/setting_openapi_key.png)  

4. Create a new Python file (e.g., openai_hello_world.py) and add the following code:

```python
import openai
import os

# Load your API key from the environment variable
openai.api_key = os.environ.get("OPENAI_API_KEY")

# Set up the prompt for the GPT-4 model
prompt = "Create a creative greeting:"

# Call the OpenAI API to generate a response
response = openai.Completion.create(
    engine="text-davinci-002",
    prompt=prompt,
    max_tokens=10,
    n=1,
    stop=None,
    temperature=0.5,
)

# Print the generated greeting
print(response.choices[0].text.strip())
```
5. Run the openai_hello_world.py script in your virtual environment, the script will call the OpenAI API, generate a creative greeting, and print it to the console.

![Running OpenAI code](/posts/getting_started_with_openai_in_python/running_openai_code.gif) 

## Conclusion

Congratulations! You have successfully set up your Windows environment for OpenAI development. You've learned how to install Python and pip, create virtual environments, and debug code in VSCode using the openai library. Now you're ready to dive into the world of OpenAI and start building exciting projects!
