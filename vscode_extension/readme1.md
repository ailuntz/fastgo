
### 创建插件框架
容器或wsl 中 yo 在root 下有问题
usermod -aG sudo ubuntu #授予权限
su - ubuntu #切换用户

sudo apt update #更新
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22

npm install --global yo generator-code 
yo code

### 笔记
在工作区根目录打开新生成的文件夹，否则没有HelloWorld命令

### 插件名称
fastgo

