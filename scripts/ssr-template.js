const title = 'todo | GitHub App'
const description = 'A GitHub App that creates new issues from actionable comments in your code.'

module.exports = ssrString => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" />
    <link href="main.min.css" rel="stylesheet" />
    <link rel="shortcut icon" href="assets/favicon.png">
    <meta name="theme-color" content="#00B0D8" />

    <meta property="og:title" content="${title}" />
    <meta property='og:site_name' content="todo by @JasonEtco" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://todo.jasonet.co/assets/card.png" />
    <meta property="og:image:url" content="https://todo.jasonet.co/assets/card.png" />
    <meta property="og:image:width" content="1280" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:alt" content="${title}" />
  
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:title" content="${title}" />
    <meta property="twitter:image" content="https://todo.jasonet.co/assets/card.png" />
    <meta property="twitter:creator" content="@jasonetco" />
    <meta property="twitter:description" content="${description}" />
    <meta property="twitter:image:alt" content="${title}" />

    <script>
        (function(p,r,o,b,t,h,i){p['GoogleAnalyticsObject']=t;p[t]=p[t]||function(){
        (p[t].q=p[t].q||[]).push(arguments)},p[t].l=1*new Date();h=r.createElement(o),
        i=r.getElementsByTagName(o)[0];h.async=1;h.src=b;i.parentNode.insertBefore(h,i)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
      
        ga('create', 'UA-72564268-3', 'auto');
        ga('send', 'pageview');
    </script>
</head>
<body>
    <noscript>
        <div class="no-script">
            <h1>You must enable JavaScript to use try out todo.</h1>
            <a href="https://github.com/JasonEtco/todo/issues" target="_blank" rel="noopener noreferrer">Need help?</a>
        </div>
    </noscript>
    <div class="mount">${ssrString}</div>
    <script src="https://cdn.polyfill.io/v2/polyfill.min.js"></script>
    <script src="main.min.js"></script>
</body>
</html>`
