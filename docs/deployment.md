# Deploying the site

The site is a static build that shares its host with the platform. The web
server answers the site's own paths from the build and passes every other
request to the platform, so a visitor moves between the two without changing
address: the landing page and About come from here, while sign-in, the contact
form, the legal pages and `/software` come from the platform.

The platform redirects `/` to its sign-in page when it has no public site of its
own, so if the site's routes are ever removed, the root still answers.

## Building

```bash
docker compose run --rm node npm ci
docker compose run --rm \
  -e PUBLIC_UMAMI_SRC=https://analytics.example.org/script.js \
  -e PUBLIC_UMAMI_WEBSITE_ID=00000000-0000-0000-0000-000000000000 \
  node npm run build
```

`dist/` is the whole site. The two Umami variables are optional; without them
no analytics tag is rendered. Use the same website ID as the platform's
`UMAMI_WEBSITE_ID`, so both halves of the domain report as one site.

## Routing

These are the paths the site owns. Everything else belongs to the platform.

| Path                                   | What                                                |
| -------------------------------------- | --------------------------------------------------- |
| `/`, `/acerca`                         | Spanish pages                                       |
| `/en`, `/en/…`, `/pt`, `/pt/…`         | English and Portuguese pages                        |
| `/_site/…`                             | Fingerprinted CSS, fonts and images; cache forever  |
| `/site/…`                              | Screenshots, store badges and the link-preview card |
| `/sitemap-index.xml`, `/sitemap-0.xml` | Sitemap                                             |

With nginx, add these to the platform's `server` block, pointing `root` at the
directory holding the current build:

```nginx
# Public site (padiush/website): its own paths, from the static build.
location = / {
    root /var/www/padiush-site/current;
    try_files /index.html =404;
}

location = /acerca {
    root /var/www/padiush-site/current;
    try_files /acerca/index.html =404;
}

location ~ ^/(en|pt)$ {
    root /var/www/padiush-site/current;
    try_files /$1/index.html =404;
}

location ^~ /en/ {
    root /var/www/padiush-site/current;
    rewrite ^(/.+)/$ $1 permanent;
    try_files $uri/index.html $uri =404;
}

location ^~ /pt/ {
    root /var/www/padiush-site/current;
    rewrite ^(/.+)/$ $1 permanent;
    try_files $uri/index.html $uri =404;
}

location ^~ /_site/ {
    root /var/www/padiush-site/current;
    access_log off;
    add_header Cache-Control "public, max-age=31536000, immutable";
    try_files $uri =404;
}

location ^~ /site/ {
    root /var/www/padiush-site/current;
    add_header Cache-Control "public, max-age=86400";
    try_files $uri =404;
}

location ~ ^/sitemap-(index|0)\.xml$ {
    root /var/www/padiush-site/current;
    try_files $uri =404;
}
```

Keep `docker/nginx.conf` and `tests/i18n.test.ts` in step with this table when
a page is added under a new path.

## Releasing a build

Deploy each build into a directory of its own and switch a `current` symlink
to it, so a release is atomic and the previous one stays on disk for a
rollback:

```bash
release="$(date -u +%Y%m%d%H%M%S)-$(git rev-parse --short HEAD)"
tar -C dist -czf "site-$release.tar.gz" .
# copy the archive to the server, then:
sudo mkdir -p "/var/www/padiush-site/releases/$release"
sudo tar -C "/var/www/padiush-site/releases/$release" -xzf "site-$release.tar.gz"
sudo ln -sfn "releases/$release" /var/www/padiush-site/current.next
sudo mv -T /var/www/padiush-site/current.next /var/www/padiush-site/current
```

The site has no version number of its own: it is deployed whenever it changes,
independently of the platform's releases.
