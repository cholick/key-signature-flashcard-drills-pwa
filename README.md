# key-signature-flashcard-drills-pwa
## Description

The program that I used to learn key signatures ([imusicbuddy](http://www.imusicbuddy.com/)) disappeared from the Android store between phones.
There are many alternatives, but I quite liked how it worked and decided to recreate the key signature drills as an installable
progressive web app (as I hadn't gotten to fully learning the minor key signatures yet).

The app will display random signatures for 5 minutes and can be started for a series of signatures in Major, Minor, or both.

This was mostly written by AI. My front-end skills are extremely rusty and I was curious to see if I could get to something fully working
mostly via chat prompts. It works testing on my phone, but I'm sure it has some edge missed cases.

The app is available at https://key-signature.cholick.com/

---

<img src="docs/screenshot.png" width="200" >

## Deployment

[Cloudflare pages](https://developers.cloudflare.com/pages/) will [auto-deploy commits](https://developers.cloudflare.com/pages/get-started/git-integration/) and uses `./site` as the root for what it deploys. As of now there's no [build command](https://developers.cloudflare.com/pages/get-started/git-integration/#configure-your-build-settings); Pages will just deploy the directory.

## To-do

- [ ] The old app seemed to favor pulling in what you recently got wrong, add logic for that
- [ ] Non-manual way to increment cache
- [ ] Use local storage to track progress
