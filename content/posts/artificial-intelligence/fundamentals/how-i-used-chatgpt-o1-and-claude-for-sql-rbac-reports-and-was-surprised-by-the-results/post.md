---
author: Juan Stoppa
title: How I used ChatGPT o1 and Claude for generating a SQL RBAC report and was surprised by the results
summary: I used an LLM to generate a Role Based Access Control (RBAC) report for a given user in SQL
date: 2024-09-22
description: I gave ChatGPT o1 and Claude Sonnet 3.5 the same prompt to generate a SQL report for a Role Base Access Control (RBAC) system and you won't believe the results
draft: false
math: true
tags: ['chatgpt-o1', 'claude-sonnet', 'rbac', 'sql']
cover:
    image: "posts/artificial-intelligence/fundamentals/how-i-used-chatgpt-o1-and-claude-for-sql-rbac-reports-and-was-surprised-by-the-results/generating-sql-rbac-report-with-chatgpt-and-claud.png"
    caption: How I used ChatGPT o1 and Claude for generating a SQL RBAC report and was surprised by the results
    hidden: true
twitter:
    card: summary_large_image
    site: "@juanstoppa"
    title: How I used ChatGPT o1 and Claude for generating a SQL RBAC report and was surprised by the results
    description: I gave ChatGPT o1 and Claude Sonnet 3.5 the same prompt to generate a SQL report for a Role Base Access Control (RBAC) system and you won't believe the results.
---

One of the most comprehensive Role Based Access Control (RBAC) I ever worked with is the one that comes with [Microsoft Dynamics 365](https://learn.microsoft.com/en-us/dynamics365/customerengagement/on-premises/developer/security-dev/how-role-based-security-control-access-entities?view=op-9-1), the security model is very granular and embedded deep in the SQL tables making it very hard to understand the access permissions for a given user but at the same time it's very powerful and flexible, giving the ability to model any security structure you can imagine.

Microsoft Dynamics 365 has the concept that records in the SQL table are owned by a user or a team. Access to these records is given through security roles which can be assigned to a user or team, these security roles define what actions a user can perform on a record, such as reading, creating, deleting, assigning, etc. At the same time, a user can belong to one or multiple teams inheriting all the security permissions, this makes it extremely hard to understand the access permissions for a given user. You can see below a screenshot of the interface to configure a single security role.

![Dynamics 365 Security Roles](/posts/artificial-intelligence/fundamentals/how-i-used-chatgpt-o1-and-claude-for-sql-rbac-reports-and-was-surprised-by-the-results/dynamics-365-security-roles.png)    


Dynamics 365 provides an API to check the access for a single table and access type but I've never seen anyone that knows the deep details of how the tables in the database provide this access so I was wondering if [ChatGPT](https://chatgpt.com/) or [Claude](https://claude.ai/) would be able to provide a report for such an obscure and complex area I've never seen anyone being able to crack. The whole iteration was pretty fascinating because both LLMs understood the system much more than I expected, there is very little documentation on how the tables work and still the LLMs were able to provide a lot of information that would be hard to find in any Microsoft documentation.

# Generating the prompt

I started by generating a prompt that asks for the information I needed, I used the following prompt:

```prompts
Generate a SQL query for Microsoft Dynamics 365 that retrieves all security privileges for each entity accessible to a specific user. 
The query should:
1. Accept a username as an input parameter
2. Include all entities the user has access to
3. Show the specific privileges (Create, Read, Update, Delete, Append, AppendTo, Assign, Share) for each entity
4. Consider privileges granted through the user's security roles and team memberships
5. Specify the level of access for each privilege using the following scale:
   * No Access
   * User Level
   * Business Unit Level
   * Parent: Child Business Unit Level
   * Organization Level
6. Display results in a format similar to: Entity | Create | Read | Update | Delete | Append | AppendTo | Assign | Share
7. For each privilege, instead of a simple 'Yes/No' or binary indicator, show the highest level of access granted to the user across all their roles and teams.
8. The query should join relevant CRM tables like SystemUserPrincipals, RolePrivileges, TeamPrivileges, and PrincipalObjectAccess. 
9. Use appropriate system views if available.
10. Ensure the query accounts for the hierarchical nature of access levels, where Organization Level access supersedes Business Unit Level, which in turn supersedes User Level access.
11. The query should be optimized for performance, as it may need to process a large number of records in a production CRM environment.
Example desired output: 
Entity          | Create        | Read          | Update        | Delete        | Append        | AppendTo      | Assign        | Share  
Account         | Organization  | User          | No Access     | Parent: Child | Business Unit | Organization  | User Contact  | Organization 
Activity        | User          | User          | User          | No Access     | Business Unit | Organization  | User Contact  | Organization 
Connection      | User          | User          | User          | No Access     | No Access     | Parent: Child | Parent: Child | Organization 
```
I think this prompt gives a pretty good idea of what I needed, it's a bit complex what I'm asking the model to do but I was really hoping to get some super human results.

# Testing the prompt on Claude and ChatGPT

Now with the prompt ready I can test it by asking the same to Claude and ChatGPT

## Claude first attempt 

Starting with [Claude Sonnet 3.5](https://www.anthropic.com/news/claude-3-5-sonnet), this was the first result:

```SQL
-- Declare input parameter for username
DECLARE @Username NVARCHAR(100) = 'example.user@domain.com';

WITH UserRoles AS (
    -- Get all roles for the user, including those from team memberships
    SELECT DISTINCT sr.RoleId
    FROM SystemUserPrincipals sup
    JOIN SystemUserRoles sur ON sup.PrincipalId = sur.SystemUserId
    JOIN SecurityRole sr ON sur.RoleId = sr.RoleId
    WHERE sup.SystemUserId = (SELECT SystemUserId FROM SystemUser WHERE DomainName = @Username)
    UNION
    SELECT DISTINCT sr.RoleId
    FROM SystemUserPrincipals sup
    JOIN TeamMembership tm ON sup.PrincipalId = tm.SystemUserId
    JOIN TeamRoles tr ON tm.TeamId = tr.TeamId
    JOIN SecurityRole sr ON tr.RoleId = sr.RoleId
    WHERE sup.SystemUserId = (SELECT SystemUserId FROM SystemUser WHERE DomainName = @Username)
),
UserPrivileges AS (
    -- Aggregate privileges from all roles
    SELECT 
        rp.PrivilegeId,
        e.Name AS EntityName,
        MAX(rp.PrivilegeDepthMask) AS MaxPrivilegeDepthMask
    FROM UserRoles ur
    JOIN RolePrivileges rp ON ur.RoleId = rp.RoleId
    JOIN [Privilege] p ON rp.PrivilegeId = p.PrivilegeId
    JOIN EntityType e ON p.EntityTypeMask = e.EntityTypeMask
    GROUP BY rp.PrivilegeId, e.Name
),
AccessLevels AS (
    -- Define access levels
    SELECT 0 AS Mask, 'No Access' AS AccessLevel
    UNION SELECT 1, 'User'
    UNION SELECT 2, 'Business Unit'
    UNION SELECT 4, 'Parent: Child Business Unit'
    UNION SELECT 8, 'Organization'
)
SELECT 
    up.EntityName,
    MAX(CASE WHEN p.PrivilegeName = 'prvCreateEntity' THEN al.AccessLevel ELSE 'No Access' END) AS [Create],
    MAX(CASE WHEN p.PrivilegeName = 'prvReadEntity' THEN al.AccessLevel ELSE 'No Access' END) AS [Read],
    MAX(CASE WHEN p.PrivilegeName = 'prvUpdateEntity' THEN al.AccessLevel ELSE 'No Access' END) AS [Update],
    MAX(CASE WHEN p.PrivilegeName = 'prvDeleteEntity' THEN al.AccessLevel ELSE 'No Access' END) AS [Delete],
    MAX(CASE WHEN p.PrivilegeName = 'prvAppendEntity' THEN al.AccessLevel ELSE 'No Access' END) AS [Append],
    MAX(CASE WHEN p.PrivilegeName = 'prvAppendToEntity' THEN al.AccessLevel ELSE 'No Access' END) AS [AppendTo],
    MAX(CASE WHEN p.PrivilegeName = 'prvAssignEntity' THEN al.AccessLevel ELSE 'No Access' END) AS [Assign],
    MAX(CASE WHEN p.PrivilegeName = 'prvShareEntity' THEN al.AccessLevel ELSE 'No Access' END) AS [Share]
FROM UserPrivileges up
CROSS APPLY (
    SELECT PrivilegeId, PrivilegeName 
    FROM [Privilege] 
    WHERE PrivilegeName IN ('prvCreateEntity', 'prvReadEntity', 'prvUpdateEntity', 'prvDeleteEntity', 
                            'prvAppendEntity', 'prvAppendToEntity', 'prvAssignEntity', 'prvShareEntity')
) p
LEFT JOIN AccessLevels al ON up.MaxPrivilegeDepthMask & al.Mask = al.Mask
GROUP BY up.EntityName
ORDER BY up.EntityName;
```
pretty impressive with the initial results, the model definitely knows about the table structure in Microsoft Dynamics 365 but when running the query in the SQL Server you can see Claude didn't quite get the table names right.

![Claude SQL Query](/posts/artificial-intelligence/fundamentals/how-i-used-chatgpt-o1-and-claude-for-sql-rbac-reports-and-was-surprised-by-the-results/claude-first-attempt-query.png)
The were a few issues:
- it references a table called `SecurityRole` which doesn't exist, I suspect the name is `TeamRoles`
- it tries to use a table called `EntityType` which again doesn't exist, it's probably trying to use`EntityView`
- it knows about the table `Privilege` which does exist in the DB but the column `PrivilegeName` doesn't exist, the column is called `Name` 

Once I made the changes, the query worked but it didn't return any result, it probably needs a bit more thought on how the tables are linked to each other

## ChatGPT first attempt 

I then tried the same prompt on [ChatGPT o1-preview](https://openai.com/index/introducing-openai-o1-preview/) and got the following result:

```SQL
DECLARE @username NVARCHAR(256) = 'your_username_here';
DECLARE @systemuserid UNIQUEIDENTIFIER;

-- Get the SystemUserId for the specified username
SELECT @systemuserid = su.SystemUserId
FROM SystemUser su
WHERE su.DomainName = @username;

-- CTE to get all RoleIds assigned to the user directly or via team memberships
WITH UserRoleIds AS (
    SELECT sur.RoleId
    FROM SystemUserRoles sur
    WHERE sur.SystemUserId = @systemuserid
    UNION
    SELECT tr.RoleId
    FROM TeamRoles tr
    INNER JOIN TeamMembership tm ON tr.TeamId = tm.TeamId
    WHERE tm.SystemUserId = @systemuserid
),
-- CTE to get the highest PrivilegeDepthMask for each PrivilegeId
UserPrivileges AS (
    SELECT
        rp.PrivilegeId,
        MAX(rp.PrivilegeDepthMask) AS MaxPrivilegeDepthMask
    FROM RolePrivilegesBase rp
    WHERE rp.RoleId IN (SELECT RoleId FROM UserRoleIds)
    GROUP BY rp.PrivilegeId
),
-- CTE to get Privilege details along with ObjectTypeCode
PrivilegesWithAccessRights AS (
    SELECT
        up.PrivilegeId,
        up.MaxPrivilegeDepthMask,
        p.Name,
        p.AccessRight,
        potc.ObjectTypeCode
    FROM UserPrivileges up
    INNER JOIN Privilege p ON up.PrivilegeId = p.PrivilegeId
    LEFT JOIN PrivilegeObjectTypeCodes potc ON p.PrivilegeId = potc.PrivilegeId
),
-- CTE to get Entity names
PrivilegesWithEntityName AS (
    SELECT
        pwac.PrivilegeId,
        pwac.Name,
        pwac.AccessRight,
        pwac.MaxPrivilegeDepthMask,
        pwac.ObjectTypeCode,
        ev.LogicalName AS EntityLogicalName,
        ev.OriginalLocalizedName AS EntityDisplayName
    FROM PrivilegesWithAccessRights pwac
    LEFT JOIN EntityView ev ON pwac.ObjectTypeCode = ev.ObjectTypeCode
),
-- CTE to map AccessRight and PrivilegeDepthMask to readable formats
PrivilegesWithAccessLevels AS (
    SELECT
        COALESCE(pwcn.EntityDisplayName, 'Global Privilege') AS EntityName,
        CASE pwcn.AccessRight
            WHEN 1 THEN 'Create'
            WHEN 2 THEN 'Read'
            WHEN 4 THEN 'Update'
            WHEN 16 THEN 'Delete'
            WHEN 32 THEN 'Assign'
            WHEN 64 THEN 'Share'
            WHEN 128 THEN 'Append'
            WHEN 256 THEN 'AppendTo'
            ELSE 'Unknown'
        END AS AccessRightName,
        CASE
            WHEN pwcn.MaxPrivilegeDepthMask = 8 THEN 'Organization Level'
            WHEN pwcn.MaxPrivilegeDepthMask = 4 THEN 'Parent: Child Business Unit Level'
            WHEN pwcn.MaxPrivilegeDepthMask = 2 THEN 'Business Unit Level'
            WHEN pwcn.MaxPrivilegeDepthMask = 1 THEN 'User Level'
            ELSE 'No Access'
        END AS AccessLevel
    FROM PrivilegesWithEntityName pwcn
    WHERE pwcn.AccessRight IN (1,2,4,16,32,64,128,256)
)
-- Final SELECT with PIVOT to display privileges per entity
SELECT
    EntityName,
    ISNULL([Create], 'No Access') AS [Create],
    ISNULL([Read], 'No Access') AS [Read],
    ISNULL([Update], 'No Access') AS [Update],
    ISNULL([Delete], 'No Access') AS [Delete],
    ISNULL([Append], 'No Access') AS [Append],
    ISNULL([AppendTo], 'No Access') AS [AppendTo],
    ISNULL([Assign], 'No Access') AS [Assign],
    ISNULL([Share], 'No Access') AS [Share]
FROM
    (
        SELECT
            EntityName,
            AccessRightName,
            AccessLevel
        FROM
            PrivilegesWithAccessLevels
    ) AS SourceTable
PIVOT
(
    MAX(AccessLevel)
    FOR AccessRightName IN ([Create], [Read], [Update], [Delete], [Append], [AppendTo], [Assign], [Share])
) AS PivotTable
ORDER BY EntityName;
```
It took 47 seconds for ChatGPT o1-review to generate a result, the query returned wasn't valid but the structure seems to be much more comprehensive than Claude's query and the table and columns names were almost correct. 

The were only two issues in the query:
- it referenced a table `RolePrivilege` which is called `RolePrivilegesBase` instead
- it referenced a column name `DisplayName` in the `EntiyView` table which doesn't exist, it should be `OriginalLocalizedName`

After changing the table and column names, the query worked but it didn't return any result

![ChatGPT SQL Query](/posts/artificial-intelligence/fundamentals/how-i-used-chatgpt-o1-and-claude-for-sql-rbac-reports-and-was-surprised-by-the-results/chatgpt-first-attempt-query.png)

## Claude further attempts

I played back the modified query to Claude, it gave some reasonable comments but then it went back to generate queries referencing the table names that I previously highlighted as incorrect.

I tried a few back and forward prompts but Claude kept going into a loop without offering a valid query. I eventually asked to use [Chain of Thought prompting](https://arxiv.org/abs/2201.11903) which helped because Claude started to systematically ask me questions about the table structure to validate the query that is being generated.

![Claude's Chain of Thought prompting](/posts/artificial-intelligence/fundamentals/how-i-used-chatgpt-o1-and-claude-for-sql-rbac-reports-and-was-surprised-by-the-results/claude-chain-of-thought.png)

This unfortunately didn't lead to a valid query either, Claude seems to get lost with so many details. I didn't try to start a completely new conversation with the best query generated but I suspect it will still struggle to generate a valid query.

## ChatGPT further attempts

I played back the modified query to ChatGPT o1, it gave some reasonable comments on how we can move forward. I like because this new model seems to be implementing chain of thought prompting internally, it goes step by step and tries to understand what went wrong by asking me to gather more information.

![ChatGPT's Chain of Thought prompting](/posts/artificial-intelligence/fundamentals/how-i-used-chatgpt-o1-and-claude-for-sql-rbac-reports-and-was-surprised-by-the-results/chatgpt-chain-of-thought.png)

What I also like about ChatGPT is that it gives very clear steps on what to do next, using a pattern like if Yes do this, if No do that.

![ChatGPT's Chain of Thought prompting with next steps](/posts/artificial-intelligence/fundamentals/how-i-used-chatgpt-o1-and-claude-for-sql-rbac-reports-and-was-surprised-by-the-results/chatgpt-chain-of-thought-next-steps.png)

I went back and forth providing as much information as possible, each response takes close to a minute to generate but their findings are very insightful and doesn't seem to go into a loop like what happens with Claude.

# Conclusion

Both models are very impressive but neither manage to generate a valid report, I'd say that ChatGPT o1 did better than Claude Sonnet 3.5 but both are still very far from being able to generate a valid SQL report just by reading the documentation.

ChatGPT got very close and I think I need to spend more time answering all the questions it asks, I think the advantage is that ChatGPT doesn't seem to go into a loop like Claude does when it has too many details and is able to break down the problem in smaller steps, something that Claude doesn't do that well at least for this particular task.

You can see the full conversation for both models in 
- Claude - I don't seem to be able to share the entire conversation, I thought Claude was able, I'll update the blog once I find it
- ChatGPT - https://chatgpt.com/share/66f01a99-e63c-8003-84f6-544c34e9d11b

I hope you like this article, if you want to hear more follow me on X at [@juanstoppa](https://x.com/juanstoppa) where I regularly post about AI 
