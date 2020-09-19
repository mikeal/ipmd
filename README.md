# InterPlanetary MarkDown++

IPMD is a system for creating and publishing decentralized
websites using GitHub and DagDB.

You can publish markdown content as well as structured data
attached to each page. You can also follow and repost pages
from other sites into your "feed."

IPMD is like a hybrid between a blog, personal wiki, a social
network like twitter or facebook, and an old fashioned *webring*.

You can create new pages wherever you like on your site. These
pages are published as soon as you push them to GitHub. You can
then decide to broadcast the creation or update of any
page to your "feed."

You can also follow other IPMD sites. GitHub Actions will pull
the database of each of those sites into your site, presenting
a unified feed of all the sites you follow.

## Setup

First, create a git repository locally and on GitHub.

```
$ mkdir newsite
$ git init
$ git remote add origin https://github.com/{username}/{repo}.git
```

You need to have a repository that has its remote origin set because
we need to use GitHub's LFS service as a block store for your site's
database.

We'll also end up using GitHub Actions for building and publishing
your site and for regularly pulling the feeds of the sites that
you follow.

Next, initialize IPMD.

```
$ npx ipmd init
```

You'll be prompted for a GitHub Personal Access Token which will then be cached
in a local `.auth` file. Several other base files will be created, including a
`.gitignore` that will ignore the `.auth` file. If you have your own `.gitignore`
make sure you avoid checking in the `.auth` file since it contains you private
authentication token.

Finally, you'll need to check everthing in infor it to be published.

```
$ git add -A
$ git commit -m "init: setting up ipmd"
```

## Creating Pages
