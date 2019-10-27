# Polkastats backend v2

> Polkadot Kusama network statistics backend


## Polkadot Kusama full node

You will need a [kusama](https://kusama.network) full node listening at localhost:9944. You can setup one following this guide: https://blog.colmenalabs.org/running-polkadot-kusama/

## Build backend (run as root)

``` bash
# Change dir
$ cd /usr/local

# Clone this repo
$ git clone https://github.com/Colm3na/polkastats-backend-v2.git

# Change dir
$ cd polkastats-backend-v2

# Install dependencies
$ npm install

# Serve with nodejs
$ node index.js

# Or start with forever (recommended)
$ forever start /usr/local/polkastats-backend-v2/index.js
```

### Setup backend as systemd service:

Create file `/etc/systemd/system/polkastats.service`:

``` bash
nano /etc/systemd/system/polkastats.service
```

File contents:

``` bash
[Unit]
Description=PolkaStats v2 backend

[Service]
ExecStart=/usr/bin/node /usr/local/polkastats-backend-v2/index.js
Restart=always
# Restart service after 10 seconds if node service crashes
RestartSec=10
# Output to syslog
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=polkastats-backend
#User=<alternate user>
#Group=<alternate group>
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable backend service:

``` bash
systemctl enable polkastats
```

Start backend:

``` bash
systemctl start polkastats
```

Backend status:

``` bash
systemctl status polkastats
```

Output:

``` bash
# 
● polkastats.service - PolkaStats v2 backend
   Loaded: loaded (/etc/systemd/system/polkastats.service; enabled; vendor preset: enabled)
   Active: active (running) since Sun 2019-10-27 11:06:05 CET; 2min 45s ago
 Main PID: 30449 (node)
    Tasks: 11 (limit: 4915)
   CGroup: /system.slice/polkastats.service
           └─30449 /usr/bin/node /usr/local/polkastats-backend-v2/index.js

oct 27 11:06:05 vps714213 systemd[1]: polkastats.service: Service hold-off time over, scheduling restart.
oct 27 11:06:05 vps714213 systemd[1]: polkastats.service: Scheduled restart job, restart counter is at 4.
oct 27 11:06:05 vps714213 systemd[1]: Stopped PolkaStats v2 backend.
oct 27 11:06:05 vps714213 systemd[1]: Started PolkaStats v2 backend.
oct 27 11:06:06 vps714213 polkastats-backend[30449]: HTTPS Server running on port 8443

```

### Setup backend MySQL database

Create database, user, permissions and tables:

``` bash
$ echo sql/polkastats.sql | mysql -u root -p'your_mysql_root_password'
```

### Run crawlers via cron

Add this to your /etc/crontab file:

``` bash
## PolkaStats backend v2 crawlers

* *  * * *   root     node /usr/local/polkastats-backend-v2/crawlers/intention.js
* *  * * *   root     node /usr/local/polkastats-backend-v2/crawlers/validator.js

# Execute every 10s

* *  * * *   root     node /usr/local/polkastats-backend-v2/crawlers/chain.js
* *  * * *   root     sleep 10 && node /usr/local/polkastats-backend-v2/crawlers/chain.js
* *  * * *   root     sleep 20 && node /usr/local/polkastats-backend-v2/crawlers/chain.js
* *  * * *   root     sleep 30 && node /usr/local/polkastats-backend-v2/crawlers/chain.js
* *  * * *   root     sleep 40 && node /usr/local/polkastats-backend-v2/crawlers/chain.js
* *  * * *   root     sleep 50 && node /usr/local/polkastats-backend-v2/crawlers/chain.js

# Execute every 5m

*/5 *  * * *   root     node /usr/local/polkastats-backend-v2/crawlers/intention_bonded.js
*/5 *  * * *   root     node /usr/local/polkastats-backend-v2/crawlers/validator_bonded.js
*/5 *  * * *   root     sleep 25 && node /usr/local/polkastats-backend-v2/crawlers/system.js
```


