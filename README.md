# SUNGJUNYOUNG.GITHUB.IO

## DEVELOP
```
git submodule update --init
hugo serve --buildDrafts --disableFastRender
```

## DEPLOY
```bash
docker build --platform=linux/amd64 -t public.ecr.aws/b0k0p6t5/blog:latest .           
docker push public.ecr.aws/b0k0p6t5/blog:latest
 
helm upgrade blog ./helm -n live
```