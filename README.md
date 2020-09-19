# InterPlanetary MarkDown++

IPMD is a system for creating and publishing decentralized
websites using GitHub and DagDB.

You can publish markdown content as well as structured data
attached to each page. You can also follow and repost pages
from other sites into your "feed."

IPMD is like a hybrid between a blog, personal wiki, and social
network like twitter or facebook.

You can create new pages wherever you like on your site. These
pages are published as soon as you push them to GitHub. You can
then decide to broadcast the publishing or updated of each
page to your "feed."

You can also follow other IPMD sites. GitHub Actions will pull
the database of each of those sites into your site, presenting
a unified feed of all the sites you follow.

## Setup

First, create a git repository.

```
$ mkdir newsite
$ git init
```

Next, initialize IPMD.

```
$ npx ipmd init
```

You'll be prompted for a GitHub Personal Access Token which will then be cached
in a local `.auth` file. Several other base files will be created, including a
`.gitignore` that will ignore the `.auth` file. If you have your own `.gitignore`
make sure you avoid checking in the `.auth` file since it contains you private
authentication token.

Finally, you'll need to check everthing in for it to be published.

```
$ git add -A
$ git commit -m "init: setting up ipmd"
```

## Creating Pages
