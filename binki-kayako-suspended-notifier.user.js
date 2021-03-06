// ==UserScript==
// @name binki-kayako-suspended-notifier
// @version 1.0
// @author Nathan Phillip Brink (binki) (@ohnobinki)
// @homepageURL https://github.com/binki/binki-kayako-suspended-notifier/
// @match https://*.kayako.com/agent/*
// @require https://github.com/binki/binki-userscript-delay-async/raw/252c301cdbd21eb41fa0227c49cd53dc5a6d1e58/binki-userscript-delay-async.js
// @require https://github.com/binki/binki-userscript-when-element-changed-async/raw/88cf57674ab8fcaa0e86bdf5209342ec7780739a/binki-userscript-when-element-changed-async.js
// ==/UserScript==

(async () => {
  const permission = await navigator.permissions.query({
    name: 'notifications',
  });
  while (true) {
    while (permission.state !== 'granted') {
      console.log('Waiting for notification permission…');
      await new Promise(resolve => permission.onchange = resolve);
      permission.onchange = null;
    }
    {
      let loggedIn = false;
      const loginPromise = (async () => {
        while (document.location.pathname.startsWith('/agent/login')) {
          // You are not yet logged in!
          console.log('Waiting for login…');
          await whenElementChangedAsync(document.body);
          await delayAsync(200);
        }
        loggedIn = true;
      })();
      (async () => {
        while (!loggedIn) {
          new Notification(`Please login to Kayako`, {
            requireInteraction: true,
            tag: 'kayako-suspended-notifier',
          });
          // Bug the user occasionally.
          await delayAsync(5*60*1000);
        }
      })();
      await loginPromise;
    }
    // fetch() will throw on errors or if the request initializer is wrong. So construct the Request() object manually outside of the try{}catch{}
    // to try to detect programming errors.
    const request = new Request(new URL('/api/v1/mails?is_suspended=true&limit=20&offset=0&include=*', document.location.href).href, {
      headers: {
        // Prevent Basic authentication dialog from popping up for user: https://stackoverflow.com/a/9872582
        'Authorization': 'X-Do-Not-Prompt-User',
      },
    });
    const fetchResult = await (async () => {
      try {
      	return await fetch(request);
      } catch (ex) {
        console.log('Unable to fetch suspended tickets.', ex);
        return {
          status: 0,
        };
      }
    })();
    if (fetchResult.status === 200) {
      const totalCount = (await fetchResult.json()).total_count;
      if (typeof totalCount !== 'number') {
        throw new Error(`Unhandled data schema.`);
      }
      if (totalCount) {
        new Notification(`${totalCount} Suspended Messages`, {
          requireInteraction: true,
          tag: 'kayako-suspended-notifier',
        });
      }
    } else {
      // Likely some issue. Could be transient.
      console.log('Checking for suspended tickets failed.', fetchResult);
    }
    // Don’t check too frequently. Every 5 minutes is probably more than sufficient.
    await delayAsync(5*60*1000);
  }
})();
