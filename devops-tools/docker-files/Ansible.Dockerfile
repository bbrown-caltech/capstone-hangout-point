FROM python:3.9.6

RUN echo "deb http://ppa.launchpad.net/ansible/ansible/ubuntu trusty main" >> /etc/apt/sources.list
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 93C4A3FD7BB9C367
RUN apt update && apt upgrade -y
RUN apt install -y ansible openssh-server sudo git sshpass

RUN useradd -rm -d /home/debian -s /bin/bash -g root -G sudo -u 1000 caltech 

RUN  echo 'caltech:caltech' | chpasswd

RUN mkdir -p /playbooks

COPY ./config/ansible/ansible.cfg /etc/ansible/ansible.cfg

RUN service ssh start

EXPOSE 22

CMD /usr/sbin/sshd -D