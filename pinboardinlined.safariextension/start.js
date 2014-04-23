$(window).ready(function() {
    // For soundcloud API
    SC.initialize({
        client_id: "17ed55515f71bb2be55e49cc89e2d5aa"
    });

    // Do all the things.
    make_inlines();
});

function make_inlines() {
    $(".bookmark_title").each(function() {
        var link = $(this);
        var bookmark = $(this).parents(".bookmark");
        var url = link.attr("href");
        var data = $.getJSON("https://api.embed.ly/1/oembed?key=1a99a68736604cadb781e68c5cff23c5&url=" + encodeURIComponent(url));
        bookmark.addClass('loading');
        bookmark.append('<div class="loading-cir"></div>');
        data.done(function(data) {
            if (data.html) {
                bookmark.append('<div class="inlined_info">' + data.html + '</div>');
            } else if (data.description) {
                var insides = "";
                if (data.thumbnail_url) {
                    insides += '<img src="' + data.thumbnail_url + '" class="thumbnail" align="right">';
                }
                insides += "<span class='via'>via <strong>" + data.provider_name.toLowerCase() + "</strong></span><br>";
                insides += data.description;
                bookmark.append('<div class="inlined_info">' + insides + '</div>');
            } else {
                fallback(url, bookmark, link);
            }
            bookmark.removeClass('loading');
        });
        data.error(function() {
            fallback(url, bookmark, link);
        });
    });
}

function fallback(url, bookmark, link) {
    var youtube = null;
    var embedly = null;

    if (url.match(/\.png/) || url.match(/\.gif/) || url.match(/\.jpg/) || url.match(/\.jpeg/)) {
        url = url.split("://")[1];
        bookmark.append('<img src="http://' + url +'" class="inline_image">');
    } else if (url.match("youtube.com")) {
        youtube = true;
        var id = getVal(url, "v");
        bookmark.append('<div class="youtube" id="' + id +'"></div>');
    } else if (url.match("imgur.com")) {
        embedly = true;
        url = url.split("://")[1];
        bookmark.append('<a class="embedly-card" href="https://' + url +'">imgur</a>');
    } else if (url.match("vimeo.com")) {
        if (!url.match(/groups/)) {
            if (url.match(/\player\.vimeo/)) {
                id = url.split("video/")[1];
            } else {
                id = url.split(".com/")[1];
            }
            if (id.match(/\?/)) {
                id = id.split(/\?/)[0];
            }
            if (parseFloat(id) > 1) {
                bookmark.append('<object class="video_iframe" width="500" height="281"><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="//vimeo.com/moogaloop.swf?clip_id=' + id + '&amp;force_embed=1&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=1&amp;color=00adef&amp;fullscreen=1&amp;autoplay=0&amp;loop=0" /><embed src="//vimeo.com/moogaloop.swf?clip_id=' + id + '&amp;force_embed=1&amp;server=vimeo.com&amp;show_title=1&amp;show_byline=1&amp;show_portrait=1&amp;color=00adef&amp;fullscreen=1&amp;autoplay=0&amp;loop=0" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="500" height="281"></embed></object>');
            }
        }
    } else if (url.match("soundcloud.com")) {
        SC.oEmbed(url, { auto_play: false, iframe: false }, function(oEmbed) {
            bookmark.append(oEmbed.html);
        });
    } else if (url.match("imdb.com")) {
        var title = null;
        title = link.html().replace("/[^0-9a-zA-Z ]/", "");
        if (url.match(/\/title/)) {
            $.getJSON("http://api.rottentomatoes.com/api/public/v1.0/movies.json?apikey=j2vvrnhqyxtsj3sn8uwadpyn&page_limit=1&page=1&q=" + encodeURIComponent(title),
                function(data) {
                    var movie = data.movies[0];
                    var movie_info = "";
                    movie_info += '<div class="inlined_info">'
                    movie_info += '<img src="' + movie.posters.thumbnail + '" class="movie_thumb" align="left">';
                    movie_info += '<strong>' + movie.title + '</strong><br>';
                    movie_info += 'Critics Rating: ' + movie.ratings.critics_score + ', User Rating: ' + movie.ratings.audience_score + '<br>'
                    movie_info += 'Rated: ' + movie.mpaa_rating + ', Run Time: ' + movie.runtime + '<br>'
                    movie_info += '<p>' + movie.synopsis + '</p>'
                    movie_info += '</div>'

                    bookmark.append(movie_info);
            });
        }
    } else if (url.match("wikipedia.org")) {
        title = link.html().replace("/[^0-9a-zA-Z ]/", "").split(" - Wikipedia")[0].trim();
        function getFirstProp(obj) {
            for (var i in obj) return obj[i];
        }
        $.getJSON("https://en.wikipedia.org/w/api.php?format=json&action=query&titles=" + encodeURIComponent(title) + "&prop=revisions&rvprop=content&exchars=750&prop=extracts",
            function(data) {
                var s = getFirstProp(data.query.pages).extract;
                if (s.length) {
                    var wiki_info = "";
                    wiki_info += '<div class="inlined_info">';
                    wiki_info += s;
                    wiki_info += '</div>';

                    bookmark.append(wiki_info);
                }
        });
    }
    if (embedly) {
        !function(a){var b="embedly-platform",c="script";if(!a.getElementById(b)){var d=a.createElement(c);d.id=b,d.src=("https:"===document.location.protocol?"https":"http")+"://cdn.embedly.com/widgets/platform.js";var e=document.getElementsByTagName(c)[0];e.parentNode.insertBefore(d,e)}}(document);
    }
    if (youtube) {
        do_youtubes();
    }

    bookmark.removeClass('loading');
}

// Grab url param
function getVal(url, name) {
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    if(results == null ) {
        return "";
    } else {
        return results[1];
    }
}

function do_youtubes() {
    var videos = document.getElementsByClassName("youtube");
    for (var i=0; i<videos.length; i++) {

    var youtube = videos[i];

    // Based on the YouTube ID, we can easily find the thumbnail image
    var img = document.createElement("img");
    img.setAttribute("src", "//i.ytimg.com/vi/"
                            + youtube.id + "/hqdefault.jpg");
    img.setAttribute("class", "thumb");


    // Overlay the Play icon to make it look like a video player
    var circle = document.createElement("div");
    circle.setAttribute("class","circle");

    youtube.appendChild(img);
    youtube.appendChild(circle);

    // Attach an onclick event to the YouTube Thumbnail
    youtube.onclick = function() {

        // Create an iFrame with autoplay set to true
        var iframe = document.createElement("iframe");
        iframe.setAttribute("src",
            "//www.youtube.com/embed/" + this.id
            + "?autoplay=1&autohide=1&border=0&wmode=opaque&enablejsapi=1");

        $(iframe).addClass("video_iframe");
        $(iframe).attr("frameborder", 0);

        // Replace the YouTube thumbnail with YouTube HTML5 Player
        this.parentNode.replaceChild(iframe, this);

    };
    }
}

