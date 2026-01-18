---
author: Juan Stoppa
title: Open Banking - what is it and how does it work?
summary: Open Banking has become the latest buzzword in FinTech, it's set to revolutionise the financial industry but what is it and how does it work?
date: 2020-11-19
description: All you need to know to understand open banking and start using it.
draft: false
math: true
tags: ['openbanking', 'fintech', 'api', 'technology']
cover:
    image: 'posts/open_banking_what_is_it_and_how_does_it_work/openbanking.jpg'
    caption: Photo by Austin Distel on Unsplash
    hidden: true
twitter:
    card: summary_large_image
    site: '@juanstoppa'
    title: Open Banking - what is it and how does it work?
    description: All you need to know to understand open banking and start using it
---

Open Banking has become the latest buzzword in FinTech, it's set to revolutionise the financial industry but what is it and how does it work? This article covers all the basics and gives you some insights on how to use it.

## The basics

Open Banking is a secure way to give providers access to your financial information. It all began when the European Parliament adopted the revised [Payment Service Directive (PSD2)](https://ec.europa.eu/commission/presscorner/detail/en/QANDA_19_5555) which aims at promoting innovation, competition and efficiency in payment services. This also triggered the UK to issue a ruling that required the nine-biggest UK banks to allow providers access to their data and many other banks followed suit.

Open Banking takes the same approach as [OpenID](https://openid.net/) took a decade or so ago when most of the major tech companies joined the initiative. This brought the ability to sign in into a service with an identity provider without having to create a new account. In practical terms, OpenID is the mechanism used for most websites nowadays where the user can sign in using an existing account such as Google, Microsoft, Auth0, etc.

This is also how Open Banking works, users can sign in into a website or mobile app by authenticating through your bank provider. But unlike OpenID, giving bank and transaction details to third party companies is something anyone would be hesitant to do, this is the reason why (at least in UK/Europe) the government regulates the providers. We are going to cover this in the next section.

## The regulation

Any company or person that wants to make use of Open Banking in Europe and the UK need go through a process to become a provider.

There are three types of providers:

-   **Third Party Provider (TPP)**: these are organisations or persons that can use the Open Banking APIs to access customer's accounts.
    There are two subtypes of TPPs: - **Account Information Service Provider (AISP)**: allows the provider to access account information from different bank accounts, commonly used by budgeting apps or comparison websites. - **Payment Initiation Service Provider (PISP)**: this type of license allows the provider to initiate payments through a bank.

        It's also possible to use Open Banking through an [agent model](https://www.fca.org.uk/firms/agency-models-under-psd2). In this way a company or person using the a TPP service doesn't need to apply for an AISP/PISP license. This model makes sense for a company that wants to access the Open Banking APIs but doesn't have the time, funding or specialism to create an integration to every possible bank and would rather use a service that handles that complexity.

-   **Account Servicing Payment Service Providers (ASPSP)**: these are banks, building societies and payment companies, they provide and maintain payments accounts for users as well as enabling third party providers to access the service through Open Banking APIs. Examples of ASPSP are the nine-biggest UK Banks and any other bank that provides Open Banking APIs.
-   **Technical Service Providers (TSP)**: firms that work with regulated providers to deliver open banking products or services. These companies are not directly accessing Open Banking APIs and are not regulated by the FCA in the UK, they provide products and services to TPPs to implement Open Banking.

More information on how to become a provider in the UK can be found [here](https://www.fca.org.uk/firms/apply/become-registered-account-information-service-provider). Also, the Open Banking website provides a [functionality to find registered providers](https://www.openbanking.org.uk/customers/regulated-providers/) if you are already given your details to an existing provider and want to make sure it has a license.

## How to use the Open Banking APIs?

![Photo by Kevin Ku on Unsplash](/posts/open_banking_what_is_it_and_how_does_it_work/how_to_use_open_banking.jpg)

If the previous section about regulation didn't put you off then here are good news: you don't need to complete a form application to the FCA to start exploring Open Banking APIs, there are a few options depending on what you are looking to do.

There are two options when it comes to test and use Open Banking APIs:

-   **Use a TPP provider**: this is the quickest way to start since it just needs signing up for getting access to a sandbox environment which simulates the access to bank's data. You can find providers on the [Open Banking website](https://www.openbanking.org.uk/customers/regulated-providers) and select the filter **third party providers**.
-   **Use an ASPSP provider**: this is connecting directly to a bank APIs, it's a similar process as the above but these APIs will only give access to their own customer bank information. Some banks may request to be either an AISP or be in the process of becoming one to give access to their APIs. You can find banks in the [Open Banking website](https://www.openbanking.org.uk/customers/regulated-providers) and select the filter **account providers**. There is also an [ASPSP Documentation website](https://openbanking.atlassian.net/wiki/spaces/AD/overview) with all providers and their respective developer portals.

Most providers will give a **Postman collection** to test the APIs and a **client SDK** to handle the authentication flow to connect to the bank.

## Authentication flow and access to data

When using a TPP, the user (known as well as Payment Service User (PSU)) begins the journey by logging into an application that will contact the TPP provider to get a token. This token is then used to contact the bank selected by the user and trigger the authentication which returns an access token. This access token is what the TPP uses to exchange information with the bank on behalf of the user. The diagram below describes the authentication flow.

![Authentication flow in Open Banking](/posts/open_banking_what_is_it_and_how_does_it_work/authentication_flow_open_banking.jpg)

The application can then use the access token to retrieve the following data depending on the type of TPP:

-   **Account and Transactions**: enables an AISP to access Account information and transactions (see the API spec [here](https://openbanking.atlassian.net/wiki/spaces/DZ/pages/1077805296/Account+and+Transaction+API+Specification+-+v3.1.2)).

-   **Payment Initiation**: enables a PISP to handle payments (see the API spec [here](https://openbanking.atlassian.net/wiki/spaces/DZ/pages/1077805743/Payment+Initiation+API+Specification+-+v3.1.2)).

-   **Event Notification**: enables an ASPSP to deliver event notification to a TPP (see the API spec [here](https://openbanking.atlassian.net/wiki/spaces/DZ/pages/1077806617/Event+Notification+API+Specification+-+v3.1.2)).

Swagger specification for all APIs can be found [here](https://github.com/OpenBankingUK/read-write-api-specs).

Once a AISP application gains access to user's data, it can retain access for a period of 90 days. After this period the user will need to reconnect to the bank provider to request a new consent (find more details [here](https://standards.openbanking.org.uk/customer-experience-guidelines/ais-core-journeys/refreshing-aisp-access/latest/)). This is very important when building applications that use Open Banking, it needs to be designed in way to make this process as easy as possible.

It's also extremely important to understand that accessing this data is subject to General Data Protection Regulation (GDPR) compliance.

## Conclusion

Open Banking brings a standard across the financial industry and makes the data accessible to everyone, from startups to the corporate world, this will naturally drive innovation. Security could be a major concern, however the regulated model through providers will bring transparency on who have access to the data and make it easy to identify any irregularity or fraud. End users in the other hand will benefit from having an already large number of applications to bring more transparency of their financial data and empower them to make the right decision about their finance.

## Glossary

**AISP** - Account Information Service Provider

**ASPSP** - Account Servicing Payment Service Providers

**GDPR** - General Data Protection Regulation

**PISP** - Payment Initiation Service Provider

**PSD2** - Revised Payment Service Directive

**PSU** - Payment Service User

**TSP** - Technical Service Providers

**TPP** - Third Party Provider
