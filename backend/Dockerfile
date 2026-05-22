FROM ubuntu:20.04

# setup user
RUN useradd -ms /bin/bash sandbox

# steup working dir
WorkDIR /home/sandbox

# update the ubunut machine
RUN apt update && apt upgrade -y

# install nano and curl
RUN apt install nano curl -y

# install node js
Run curl -fsSL https://nodesource.com | bash - && \
    apt-get install -y nodejs

# configuring terminal to display current working dir
RUN echo "PS1='\w'" >> /home/sandbox/.bashrc

# setup final working dir
WORKDIR /home/sandbox/app