# Contributing

This is the public website of Padiush. It describes the hosted instance at
padiushbio.com and the people behind it, so most changes come from the
maintainers; corrections are still welcome. Changes to the platform itself
belong in [padiush/platform](https://github.com/padiush/platform).

## Signing your work

Contributions must be signed off under the
[Developer Certificate of Origin](https://developercertificate.org/). This is a
statement that you wrote the patch, or otherwise have the right to submit it
under the project's licence. It is not a copyright assignment — you keep your
copyright.

Add the sign-off by committing with `-s`:

```bash
git commit -s -m "fix: ..."
```

That appends a line to your commit message:

```
Signed-off-by: Your Name <your.email@example.com>
```

Use your real name. Anonymous or pseudonymous sign-offs cannot be accepted,
because the certificate has to mean something.

The full text of the certificate:

```
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.

Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same license (unless I am permitted to submit
    under a different license), as indicated in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

## Working on the site

Setup is in the [README](README.md). The conventions:

- **Every string in all three languages.** Copy lives in `src/i18n/`, Spanish
  first, then English and Portuguese, with the same keys in each; the tests fail
  when a language is missing a key. Write it the way people say it, in full
  sentences.
- **Check it in a browser** at desktop, tablet and mobile widths, in both
  themes, before calling a change done.
- **Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/)**
  without a scope, and describe the outcome rather than the mechanics.
- **Screenshots come from the example study only**, through
  `scripts/capture-screenshots.mjs`. Never photograph a real project.
