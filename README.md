# SUNGJUNYOUNG.GITHUB.IO

## DEVELOP
```
git submodule update --init
hugo serve --buildDrafts --disableFastRender
```

## DEPLOY
```bash
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws
docker build --platform=linux/aarch64 -t public.ecr.aws/b0k0p6t5/blog:latest .           
docker push public.ecr.aws/b0k0p6t5/blog:latest
 
helm upgrade blog ./helm -n live
```