# syntax = docker/dockerfile:experimental

ARG flavor=default



##
## deps-resolver
##
FROM node:14-slim AS deps-resolver
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV appDir /opt/growi

WORKDIR ${appDir}
COPY ./package.json ./
COPY ./yarn.lock ./

# setup
RUN yarn config set network-timeout 300000
RUN yarn
# install official plugins
RUN yarn add growi-plugin-lsx growi-plugin-pukiwiki-like-linker growi-plugin-attachment-refs
# install peerDependencies
RUN yarn add -D react-images@1.0.0 react-motion



##
## deps-resolver-prod
##
FROM deps-resolver AS deps-resolver-prod

# shrink dependencies for production
RUN yarn install --production



##
## prebuilder-default
##
FROM node:14-slim AS prebuilder-default
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV appDir /opt/growi

COPY --from=deps-resolver ${appDir}/node_modules ${appDir}/node_modules

# copy all files except the files listed in Dockerfile.dockerignore
COPY . ${appDir}

# overwirte package.json and yarn.lock
COPY --from=deps-resolver ${appDir}/package.json ${appDir}/package.json
COPY --from=deps-resolver ${appDir}/yarn.lock ${appDir}/yarn.lock



##
## prebuilder-nocdn
##
FROM prebuilder-default AS prebuilder-nocdn

# replace env.prod.js for NO_CDN
COPY docker/nocdn/env.prod.js ${appDir}/config/



##
## builder
##
FROM prebuilder-${flavor} AS builder

ENV appDir /opt/growi

WORKDIR ${appDir}

# build
RUN yarn build:prod

# remove except artifacts
WORKDIR /tmp
RUN --mount=target=. sh docker/bin/remove-except-artifacts.sh
WORKDIR ${appDir}



##
## release
##
FROM node:14-alpine
LABEL maintainer Yuki Takei <yuki@weseek.co.jp>

ENV appDir /opt/growi

# install tini
# RUN apk add tini su-exec
# su-execを使わない構成にすることでnon-rootでgrowiコンテナを実行する(具体的な変更点は以下)
RUN apk add tini

# COPY docker/docker-entrypoint.sh /  # 不要
# RUN chmod 700 /docker-entrypoint.sh # 不要

COPY --from=deps-resolver-prod --chown=node:node \
  ${appDir}/node_modules ${appDir}/node_modules
COPY --from=builder --chown=node:node \
  ${appDir} ${appDir}

WORKDIR ${appDir}

VOLUME /data
EXPOSE 3000

### ここが主な変更点 #####

# [問題点]
# docker-entrypoint.sh内の処理は一部root権限を必要とする．
# ただし変更前はENTRYPOINTでdocker-entrypoint.shを起動させているため，
# このDockerfile(変更前)で作成されたDockerイメージをベースにシステムを構築した場合，
# 実行ユーザをrootにしておかないと権限不足で落ちてしまう．

# [解決方法]
# docker-entrypoint.shの処理内容をこのDockerfile内で完了させる．
# そうすればENTRYPOINTつまり"コンテナ実行時"にroot権限は必要なくなる．

# [懸念]
# もしかしたらdocker-entrypoint.sh内のファイルの存在判定(ifのところ)は一種のフラグとして使用しているかも知れない．
# つまりENTRYPOINTに到達するまでにFILE_UPLOADの値に応じてファイルの作成(または作成しない)が行われ，
# ENTRYPOINT実行段階にこれを検知しているかもしれない(そんな雑な実装はしないと思うが...)．
# 仮にそうだとすると上であげた解決方法は場合によってはシステムを落とす可能性がある．
# (まあないと思うけどね！！)

# (変更前)
# ENTRYPOINT ["/sbin/tini", "-e", "143", "--", "/docker-entrypoint.sh"]
# CMD ["yarn", "server:prod"]

# (変更後)
# Support `FILE_UPLOAD=local`   <-- 懸念要素
RUN mkdir -p /data/uploads
RUN if [ ! -e "$appDir/public/uploads" ]; then ln -s /data/uploads $appDir/public/uploads; fi

RUN chown -R node:node /data/uploads
RUN chown -h node:node $appDir/public/uploads

# このDockerfileで作成するコンテナイメージ自体はrootのままにしておく．
# 必要であればこれをpullしUSERをnodeに変えるDockerfileを作成すればよろし．
# USER node

# PID 1 問題にも対応
ENTRYPOINT ["/sbin/tini", "-e", "143", "--"]
CMD ["yarn", "server:prod"]
