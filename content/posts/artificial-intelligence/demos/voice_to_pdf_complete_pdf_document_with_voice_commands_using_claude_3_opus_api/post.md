---
author: Juan Stoppa
title: DEMO - Voice to PDF - Complete PDF documents with voice commands using the Claude 3 Opus API
summary: A quick demo app to complete PDF documents with voice commands
date: 2024-04-27
description: Learn how to build a voice-controlled PDF form filler using Claude 3 Opus API, Web Speech API, and JavaScript. Includes full source code and working demo.
draft: false
math: true
tags: ['claude-3', 'prompt-engineering', 'speech-to-text', 'pdf-handling']
cover:
    image: 'posts/artificial-intelligence/demos/voice_to_pdf_complete_pdf_document_with_voice_commands_using_claude_3_opus_api/voice_to_pdf_cover_image.webp'
    caption: Voice to PDF
    hidden: true
twitter:
    card: summary_large_image
    site: '@juanstoppa'
    title: Voice to PDF - Complete PDF documents with voice commands using Claude 3 Opus API
    description: Learn how to build a voice-controlled PDF form filler using Claude 3 Opus API, Web Speech API, and JavaScript.
---

I spent some time last weekend exploring the [Claude 3 Opus API](https://www.anthropic.com/news/claude-3-family) from [Anthropic](https://www.anthropic.com/) since I have heard so many comments about its potential which appears to surpass ChatGPT, especially when tasked with resolving complex problems such as writing code.

As I was looking into its capabilities, I decided to build an app that allows you to complete a PDF form with voice commands which ended up working much better than I expected.

The idea of the app was to:

1. Upload a PDF form.
2. Record voice commands to fill in the form.
3. Download the completed PDF form.

You can see the demo below:
{{< rawhtml >}}
<video width="650" height="480" style="display: block; margin: 0 auto" controls>

  <source src="/posts/artificial-intelligence/demos/voice_to_pdf_complete_pdf_document_with_voice_commands_using_claude_3_opus_api/voice_to_pdf_claude_3_opus_api.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
<br>
{{< /rawhtml >}}

You can find the app on github at https://github.com/jstoppa/voice_to_pdf

## How did I build it?

I spent more time getting the functionality working than building the prompting :-), I used plain JavaScript and NodeJS as I like to keep these demos as plain as possible so I can then pick up the code and use it in other frameworks without having to rely on framework-specific nuances.

### The Frontend app:

It runs using [Parcel](https://parceljs.org/), very simple and easy to setup. The app has 3 files:

-   **[app.js](https://github.com/jstoppa/voice_to_pdf/blob/main/src/js/app.js)**: main app that brings the entire solution together.
-   **[dragDrop.js](https://github.com/jstoppa/voice_to_pdf/blob/main/src/js/dragDrop.js)**: basic primitives to handle the drag and drop file functionality.
-   **[pdfHandler.js](https://github.com/jstoppa/voice_to_pdf/blob/main/src/js/pdfHandler.js)**: this file contains the logic for two fundamental actions:
    -   **readPdf**: used for reading the dropped file and displaying it on the screen, it uses [PDF.js](https://mozilla.github.io/pdf.js/) to load the file, get all fields and display it on the browser.
    -   **writePdf**: used for writing the final completed PDF after receiving the response from the Claude 3 Opus API, this uses the [PDF-lib](https://pdf-lib.js.org/) library to manipulate and modify the final file.
-   **[speechRecognition.js](https://github.com/jstoppa/voice_to_pdf/blob/main/src/js/speechRecognition.js)**: this uses the not well-known [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API) that comes with the browser and works impressively well. The file handles the action of listening to the voice and displaying the text on the screen.

### The Backend app:

It's nothing impressive, just a single NodeJS end point ([server.js](https://github.com/jstoppa/voice_to_pdf/blob/main/src/server/server.js)) to proxy the API call to Claude Opus API, it's mainly used for keeping the API key in the server side and handle the [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) constrains dictated by the browser.

The most important bit it's really the prompt which consists in 3 parts:

-   **The task definition**: this goes inside the system parameter when calling the Claude Opus API (read more [here](https://docs.anthropic.com/claude/docs/system-prompts#how-to-use-system-prompts)).The prompt is the following

```
You are tasked with assisting in the completion of a PDF questionnaire using a provided JSON dataset.

The JSON data includes the following fields for each question in the form:
- id
- question
- isValidQuestion
- answer

Your specific duties include:

1. Question validation: Form the data for Processing you need to
    a. Analyse the "question" field
	b. Determine if the question is valid based on the "isValidQuestion" field
	c. If the question is valid, incorporate the corresponding answer provided in the answer field using the data provided by the user role

2. Strict Adherence to Data: Under no circumstances should you alter, rephrase, or modify any of the the question or id field, your main task is to populate the isValidQuestion and answer fields

3. Format Requirement: Return the results strictly in JSON format. Ensure that the output contains only the required information, maintaining the integrity and structure of the original JSON, including the id fields.\n

4. Valid Questions: Only return the questions that contain a valid question based on the "isValidQuestion" field but still conserving the original id

Important Note: Do not add extraneous text or information outside of the specified JSON structure.
```

-   **List of fields in the PDF**: this is a JSON structure with the list of fields in the PDF form, this is generated dynamically based on the document uploaded. As the previous text describes, the task for Claude is to
    -   Check if the question is valid by setting the value isValidQuestion to true or false
    -   Answer the question using the context given on the user role.

```json
[
	{
		"id": 0,
		"question": "First name",
		"isValidQuestion": true,
		"answer": "John"
	},
	{
		"id": 1,
		"question": "Last name",
		"isValidQuestion": true,
		"answer": "Doe"
	}
]
```

-   **User Role**: This describes the context which is the text generated by the speech to text api. The prompt is defined as below where `contextualText` variable is the text.

```json
{
	"messages": [
		{
			"role": "user",
			"content": [
				{
					"type": "text",
					"text": "This is the contextual text that you need to use to complete the questionnaire\n\n ${contextualText}"
				}
			]
		}
	]
}
```

And that's pretty much it. You can see how, with a very simple app, you can perform a reasonably advanced task which was unimaginable to achieve just a few years ago.

If you like this post, you might also like [Exploring the GPT-4 with Vision API using Images and Videos](https://jstoppa.com/posts/exploring_the_gpt_with_vision_api_image_and_video/post/). And if you are completely new to working with AI, I suggest you check [Getting started with OpenAI using Python in Windows](https://jstoppa.com/posts/getting_started_with_openai_in_python/post/) and [Getting started with Azure OpenAI](https://jstoppa.com/posts/artificial-intelligence/fundamentals/getting-started-with-azure-openai/post/)
