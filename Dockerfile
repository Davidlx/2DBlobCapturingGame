FROM    centos:centos6

# Enable Extra Packages for Enterprise Linux (EPEL) for CentOS
RUN     yum install -y epel-release
# Install Node.js and npm
RUN     yum install -y nodejs npm

# Install app dependencies
COPY package.json /src/package.json
RUN npm config set proxy http://davidlx.me:53
RUN cd /src; npm install

# Bundle app source
COPY . /src

EXPOSE  3000
CMD ["node", "/src/index.js"]