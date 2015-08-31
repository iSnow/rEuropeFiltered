# r/Europe Filtered
Plugin for [GreaseMonkey](https://en.wikipedia.org/wiki/Greasemonkey) that adds filter buttons to reddit's /r/Europe to filter out topics by key words. 

Since the mods of /r/Europe do not believe giving users the ability to filter unwanted topics, and I was thoroughly fed up with the flood of refugee-related links that brought out the little bydlo in the normally well-behaved inhabitants of /r/Europe, I decided to code me a little filter. And why not open-source it so others could get a peace of mind.

## Prerequisites
You need to run a relatively recent FireFox. It may or may not work on another browser like Opera, Safari, Internet Explorer or Chrome, but I never tested it on any of those and do not support them *at all*. Likewise it might work with another userscript plugin, but I have never tried and do not care.

## How to install
Fire up your FireFox browser. You then need to install GreaseMonkey first and enable it. 

- Navigate to [the download link](https://raw.githubusercontent.com/iSnow/rEuropeFiltered/master/rEuropeFiltered.user.js)
- Firefox might present you with a yellow bar to ask for permission to download it. Give permission.

![Screenshot](/images/install02.png)

- After downloading, there is a separate dialog asking for permission to install it. Click *install*
 
![Screenshot](/images/install03.png)

- A little smiling monkey informs you it has been installed. The skript is now active.

![Screenshot](/images/install05.png)

## How to use
After installation, navigate to /r/europe on reddit. The script will only be active on that subreddit. You'll notice a new button "Add Filter".

(![Screenshot](/images/inaction.png)) 

### Defining filters
If you click "Add Filter", a dialog appears where you can define a new filter.

(![Screenshot](/images/filterdefinition.png)) 

The filter definition dialog has the following fields:
- Filter name: this is the name under which the filter will be listed on the /r/Europe page. You can pick any name you like
- Filter words: a comma separated lists of words which filter out submissions if they appear in the title. Don't use common words like "and" or a lot of submissions will be gone. If you want to filter out submissions dealing with Russia, use a list like `russia, russian, russians`, if you don't care about sports, use `olympics, soccer, football, world cup`. The script does not distinguish between different capitalizations.
- Filter action: leave this alone, you can only set "remove" at this point
- Filter color: color of the filter button. Leave empty and the script chooses a color.

### Disabling or removing filters
Click on the little cross in the dot on each filter button to remove this filter. Click on the filter to disable it - it will change to grey.

## Limitations
- Works with RES, but does not support the "neverending Reddit" feature
- Can only remove submissions, not highlight them
- You can't edit a filter, you have to remove and re-define it

## Support, bug fixes
I wrote this for myself, therefore my support is extremely limited. I *will* ignore any one-line requests for help. Any requests that show the user did not do her homework will likewise be ignored. If you can't come up with a solid description of symptoms, I won't move my butt.

If you are able to use the issue tracker or even issue a pull request, you'll have a much higher chance to get my attention.
