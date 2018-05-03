FROM centos:7

ENV lversion 1
RUN yum -y erase vim-minimal && \
    yum -y update && \
    yum -y install epel-release && \
    yum -y update && \
    yum clean all

RUN yum -y install --setopt=tsflags=nodocs nginx supervisor tar wget unzip libgomp && \
    yum clean all && \
    wget https://github.com/Z3Prover/z3/releases/download/z3-4.6.0/z3-4.6.0-x64-ubuntu-14.04.zip -O /z3.zip && \
    unzip -d / /z3.zip && \
    rm /z3.zip && \
    mv /z3-4.6.0-x64-ubuntu-14.04/bin/z3 /bin/z3 && \
    rm -rf /z3-4.6.0-x64-ubuntu-14.04 && \
    cd /etc/nginx && openssl dhparam -out dhparams.pem 2048

ENV PATH "/bin:/sbin:/usr/bin:/usr/sbin:/z3-4.5.0-x64-ubuntu-14.04/bin"

ADD https://nodejs.org/dist/v8.9.4/node-v8.9.4-linux-x64.tar.gz /node.tar.gz
RUN cd /usr && tar -xf /node.tar.gz --strip-components=1 && rm /node.tar.gz

ADD nginx.conf /etc/nginx/nginx.conf
ADD supervisord.conf /etc/supervisord.conf

ADD site.tar.gz /srv/esverify-web

EXPOSE 80
EXPOSE 443

CMD [ "supervisord", "-n" ]
