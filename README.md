# SUNGJUNYOUNG.GITHUB.IO

## DEVELOP
```
git submodule update --init
hugo serve --buildDrafts --disableFastRender
```

## DEPLOY
```bash
docker build --platform=linux/amd64 -t 153178401710.dkr.ecr.ap-northeast-2.amazonaws.com/blog:latest .           
docker push 153178401710.dkr.ecr.ap-northeast-2.amazonaws.com/blog:latest
 
helm upgrade blog ./helm -n live
```