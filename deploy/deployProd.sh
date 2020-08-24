#!/bin/bash

TIMESPAN=$(date '+%s')
DEPLOYNAME=yideyun_${TIMESPAN}
DEPLOYFILES=${DEPLOYNAME}.tar.gz
SERVER_1=47.107.72.163
FILEPATH=/home/note-server

#构建成功后打包文件上传到服务器
# 阿里云
# 构建成功后打包文件上传到服务器
scp -r ./package.json ./package-lock.json root@${SERVER_1}:${FILEPATH}
cd dist
tar -zcvf ${DEPLOYFILES} ./*
scp -r ${DEPLOYFILES} root@${SERVER_1}:${FILEPATH}/tarfiles
rm -rf ./*

# 解压文件
ssh -o StrictHostKeyChecking=no root@${SERVER_1} tar xzf ${FILEPATH}/tarfiles/${DEPLOYFILES} -C ${FILEPATH}

ssh -tt root@$SERVER_1   << remotessh  
cd /home/note-server
./reload.sh
exit
remotessh

if [ $? -ne 0 ]; then
    echo "部署失败"
else
    echo "部署成功"
fi