---
author: Juan Stoppa
title: How to use text embeddings?
summary: Discover how text embeddings turn words into numbers and can help developing solutions you wouldn't imagine.  
date: 2024-02-09
description: A key part of machine learning, text embeddings can help in developing solutions that understand and interpret human language. Let's dig into how to use them.
draft: false
math: true
tags: ["embeddings", "llm", "nlp", "python"]
cover:
    image: "posts/artificial-intelligence/fundamentals/how-to-use-text-embeddings/text-embeddings.webp"
    caption: 
twitter:
    card: summary_large_image
    site: "@juanstoppa"
    title: How Text Embeddings work?
    description: Understanding Embeddings - From Theory to Practice
---

Text embeddings are a technique in Natural Language Processing (NLP) that transforms textual information into numerical vectors, they are designed to to capture the semantics, or the meaning, behind the text. The technique analyses the context in which words appear and how they relate to one another. By doing so, it captures nuances and relationships between words, encoding the underline meaning into the numerical vectors.

The understanding of this semantic allows the models to perform tasks like sentiment analysis, language translation, and content recommendation with a degree that mirrors human comprehension.

# How does it work?
At a very high level, text can be pass to the model to generate the emmbeddings adn the model returns the represenation of that text in numerical vector.

For instance, if I provide the following to a model such as 

```
This is a text to be encoded
``` 

The model will encode it with the following number vector

```
[ 0.12123, 0.32122, 0.23123, 0.23212, 0.23232, 0.1231]
```

I'm going to show how you can do in 3 technologies