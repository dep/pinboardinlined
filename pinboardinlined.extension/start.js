$(document).ready(function() {
    // For soundcloud API
    SC.initialize({
        client_id: "17ed55515f71bb2be55e49cc89e2d5aa"
    });

    // Do all the things.
    make_inlines();
});

function make_inlines() {
    var youtube = null;

    $(".bookmark a").each(function() {
        var link = $(this);
        var bookmark = $(this).parents(".bookmark");
        var url = link.attr("href");
        if (url.match(/\.png/) || url.match(/\.gif/) || url.match(/\.jpg/) || url.match(/\.jpeg/)) {
            url = url.split("://")[1];
            bookmark.append('<img src="http://' + url +'" class="inline_image">');
        } else if (url.match("youtube.com")) {
            youtube = true;
            var id = getVal(url, "v");
            bookmark.append('<div class="youtube" id="' + id +'"></div>');
        } else if (url.match("soundcloud.com")) {
            var track_url = url;
            SC.oEmbed(track_url, { auto_play: false, iframe: false }, function(oEmbed) {
                bookmark.append(oEmbed.html);
            });
        } else {
            /*if (link.hasClass("bookmark_title")) {
                url = url.split("://")[1];
            }*/
        }
    });
    if (youtube) {
        do_youtubes();
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
