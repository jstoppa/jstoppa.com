# [jstoppa.com](http://jstoppa.com/)

Juan Stoppa's personal blog 

### Development step
- Deploy changes to the blog => `git push --mirror https://github.com/jstoppa/jstoppa.com.git`

### Run blog locally

- Install hugo locally => `winget install Hugo.Hugo.Extended` from the command line 

- Upgrade PaperMod =>
```
git submodule add --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
git submodule update --init --recursive
```
- Run Hugo locally => `hugo serve`

Blog powered by [Hugo](https://gohugo.io/) using [hugo-PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme
