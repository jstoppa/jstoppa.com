# [jstoppa.com](http://jstoppa.com/)

Juan Stoppa's personal blog

## Deployment steps

Deploy changes to the blog

```
git push --mirror https://github.com/jstoppa/jstoppa.com.git
```

## Run blog locally

1. Install hugo locally (if it's not already installed)

```
winget install Hugo.Hugo.Extended
```

2. Execute the following command

```
hugo serve
```

## Upgrade PaperMod

1. Delete themes/PaperMod
2. Check in changes
3. Add ParerMode submodule

```
git submodule add --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
```

NOTE: if you get an error that the module already exist, run this command

```
git rm --cached .\themes\PaperMod\
```

4. Start the submodule

```
git submodule update --init --recursive
```

Blog powered by [Hugo](https://gohugo.io/) using [hugo-PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme.
