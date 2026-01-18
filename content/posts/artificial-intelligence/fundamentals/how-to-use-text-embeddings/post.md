---
author: Juan Stoppa
title: How to use text embeddings?
summary: Discover how text embeddings turn words into numbers and can help developing solutions you wouldn't imagine.
date: 2024-02-09
description: A key part of machine learning, text embeddings can help in developing solutions that understand and interpret human language. Let's dig into how to use them.
draft: true
math: true
tags: ['embeddings', 'llm', 'nlp', 'python']
cover:
    image: 'posts/artificial-intelligence/fundamentals/how-to-use-text-embeddings/text-embeddings.webp'
    caption:
twitter:
    card: summary_large_image
    site: '@juanstoppa'
    title: How Text Embeddings work?
    description: Understanding Embeddings - From Theory to Practice
---

Text embeddings are a technique in Natural Language Processing (NLP) that transforms textual information into numerical vectors. They are designed to capture the semantics, or the meaning, behind the text. The technique analyses the context in which words appear and how they relate to one another. By doing so, it captures nuances and relationships between words, encoding the underline meaning into the numerical vectors.

The understanding of this semantic allows the models to perform tasks like sentiment analysis, language translation, and content recommendation with a degree that mirrors human comprehension. Having tested text embeddings, it's truly magical how models can find information in words. Like everything in Machine Learning, the sky is the limit to what can be achieved when using their capabilities.

In this article I'll explain how to bring the text embeddings to live, show real-life examples and explore the different tools and technologies available for this purpose.

# How do text embeddings work?

At a high level, text is fed into a neural network model to generate the embeddings, and the model returns the text's representation in the form of a numerical vector.

For example, if I provide the following text to a model

```text
This is a text to be embedded
```

The model will encode it with the following number vector

```text
[[0.008607177995145321,0.11310785263776779,-0.05183377489447594  .......  0.020699022337794304]]
```

Once the text has been converted to text vector, it can be stored in any storage means, it can be a database or a simple csv file.

The embeddings are them loaded into a model and we can then query the model to find similarities such as sentiment analyse or simply query search.

To recap, the process of embedding involves the following steps:

1. Get the data that needs to be embedded and store it in a memory array
2. Convert the data to numerical vector (what is called embeddings)
3. The data can be stored in any storage means (database, csv file)
4. The numerical vectors are then loaded into the model
5. The model can be queried, this is performed by converting the text into numerical vector so the model can understand and provide an answer.

The diagram below shows how the process work.

Add more info here

# Testing models

I've put the steps below to analyse two well known tools:

-   OpenAI
-   Hugging Face

NOTE: there are many other models but this will give the general understanding on how to do embedding which can be easily translated to other models.

To test this example, I have downloaded 5000 reviews from Trust Pilot for the internet provider Virgin Media.

## Text embeddings using Open AI APIs

TBC

## Text embeddings Hugging Face APIs

TBC

# Conclusion

TBC
