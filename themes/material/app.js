document.write('<style>.plyr--full-ui input[type=range]{color: #ff5252!important;}.plyr__control--overlaid {background: rgba(255,82,82,.8);}.plyr--video .plyr__control.plyr__tab-focus, .plyr--video .plyr__control:hover, .plyr--video .plyr__control[aria-expanded=true], .plyr__menu__container .plyr__control[role=menuitemradio][aria-checked=true]::before {background: #ff5252!important;}@media screen and (max-width: 633px){#player {margin-top: 0 !important;}.video{margin-top: 0 !important;}}.video{margin-top: 16px;}.plyr__control.plyr__tab-focus {box-shadow: 0 0 0 5px rgba(225,82,82,.5);}</style>');

// initialize the page and load the necessary resources
mdui.mutation();

function init() {
    document.siteName = $('title').html();
    $('body').addClass("mdui-theme-layout-dark mdui-theme-primary-red mdui-theme-accent-red");
    var html = `
<header class="mdui-appbar"> 
   <div id="nav" class="mdui-toolbar mdui-container"> 
   </div> 
</header>
<div id="content" class="mdui-container"> 
</div>
	`;
    $('body').html(html);
}

function render(path) {
    if (path.indexOf("?") > 0) {
        path = path.substr(0, path.indexOf("?"));
    }
    title(path);
    nav(path);
    if (path.substr(-1) == '/') {
        list(path);
    } else {
        file(path);
    }
}


// 渲染 title
function title(path) {
    path = decodeURI(path);
    $('title').html(document.siteName + ' - ' + path);
}

// 渲染导航栏
function nav(path) {
    var html = "";
    html += `<a href="/" class="mdui-typo-headline folder" style="color: white"><svg aria-hidden="true" focusable="false" data-prefix="fad" data-icon="crown" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" height="28px" style="margin-top: 9px;"><g><path fill="currentColor" d="M544 464v32a16 16 0 0 1-16 16H112a16 16 0 0 1-16-16v-32a16 16 0 0 1 16-16h416a16 16 0 0 1 16 16z" style="opacity: .5"></path><path fill="currentColor" d="M640 176a48 48 0 0 1-48 48 49 49 0 0 1-7.7-.8L512 416H128L55.7 223.2a49 49 0 0 1-7.7.8 48.36 48.36 0 1 1 43.7-28.2l72.3 43.4a32 32 0 0 0 44.2-11.6L289.7 85a48 48 0 1 1 60.6 0l81.5 142.6a32 32 0 0 0 44.2 11.6l72.4-43.4A47 47 0 0 1 544 176a48 48 0 0 1 96 0z"></path></g></svg></a>`;
    var arr = path.trim('/').split('/');
    var p = '/';
    if (arr.length > 0) {
        for (i in arr) {
            var n = arr[i];
            n = decodeURI(n);
            p += n + '/';
            if (n == '') {
                break;
            }
            html += `<i class="mdui-icon material-icons mdui-icon-dark folder" style="margin:0;">chevron_right</i><a class="folder" href="${p}">${n}</a>`;
        }
    }
    $('#nav').html(html);
}

// 渲染文件列表
function list(path) {
    var content = `
	<div id="head_md" class="mdui-typo" style="display:none;padding: 20px 0;"></div>

	 <div class="mdui-row">
	 <div class="search mdui-textfield mdui-textfield-expandable mdui-float-right">
        <button class="mdui-textfield-icon mdui-btn mdui-btn-icon"><i class="mdui-icon material-icons">search</i></button>
        <input id="search" class="mdui-textfield-input" type="text" placeholder="Search" onkeyup="search()">
        <button class="mdui-textfield-close mdui-btn mdui-btn-icon"><i class="mdui-icon material-icons">close</i></button>
    </div>
	  <ul class="mdui-list"> 
	   <li class="mdui-subheader"> 
	    <div class="mdui-col-xs-12 mdui-col-sm-8 file-name">
	     File
	    </div> 
	    <div class="mdui-col-sm-3 mdui-text-right file-date">
	     Last modified
	    </div> 
	    <div class="mdui-col-sm-1 mdui-text-right file-size">
	     Size
	    </div> 
	    </li> 
	  </ul> 
	 </div> 
	 <div class="mdui-row"> 
	  <ul id="list" class="mdui-list file-list"> 
	  </ul> 
	 </div>
	 <div id="readme_md" class="mdui-typo" style="display:none; padding: 20px 0;"></div>
	`;
    $('#content').html(content);

    var password = localStorage.getItem('password' + path);
    $('#list').html(`<div class="mdui-progress"><div class="mdui-progress-indeterminate"></div></div>`);
    $('#readme_md').hide().html('');
    $('#head_md').hide().html('');
    $.post(path, '{"password":"' + password + '"}', function(data, status) {
        var obj = jQuery.parseJSON(data);
        if (typeof obj != 'null' && obj.hasOwnProperty('error') && obj.error.code == '401') {
            var pass = prompt("Please enter password:");
            localStorage.setItem('password' + path, pass);
            if (pass != null && pass != "") {
                list(path);
            } else {
                history.go(-1);
            }
        } else if (typeof obj != 'null') {
            list_files(path, obj.files);
        }
    });
}

function list_files(path, files) {
    html = "";
    for (i in files) {
        var item = files[i];
        var p = path + item.name + '/';
        if (item['size'] == undefined) {
            item['size'] = "";
        }

        item['modifiedTime'] = utc2beijing(item['modifiedTime']);
        item['size'] = humanFileSize(item['size'], false);
        if ((item['mimeType'] == 'application/vnd.google-apps.folder') && (item.name != "hidden")) {
            html += `<li class="mdui-list-item mdui-ripple"><a href="${p}" class="folder">
	            <div class="mdui-col-xs-12 mdui-col-sm-8 mdui-text-truncate file-name"><i class="mdui-icon material-icons">folder_open</i> ${item.name}</div>
	            <div class="mdui-col-sm-3 mdui-text-right file-date">${item['modifiedTime']}</div>
	            <div class="mdui-col-sm-1 mdui-text-right file-size">${item['size']}</div>
	            </a>
	        </li>`;
        } else {
            var p = path + item.name;
            var c = "file";
            if (item.name == "README.md") {
                get_file(p, item, function(data) {
                    markdown("#readme_md", data);
                });
            }
            if (item.name == "HEAD.md") {
                get_file(p, item, function(data) {
                    markdown("#head_md", data);
                });
            }
            var ext = p.split('.').pop();
            if ("|html|php|css|go|java|js|json|txt|sh|md|mp4|webm|avi|m4v|bmp|jpg|jpeg|png|gif|m4a|mp3|wav|ogg|mpg|mpeg|mkv|rm|rmvb|mov|wmv|asf|ts|flv|flac|".indexOf(`|${ext}|`) >= 0) {
                p += "?a=view";
                c += " view";
            }
            var icon = "insert_drive_file";
            if (("|mp4|webm|avi|mpg|mpeg|mkv|rm|rmvb|mov|wmv|asf|ts|flv|".indexOf(`|${ext}|`) >= 0)) {
                icon = "movie_creation";
            }
            if (("|mp3|wav|ogg|m4a|flac|".indexOf(`|${ext}|`) >= 0)) {
                icon = "music_note";
            }
            if (("|bmp|jpg|jpeg|png|gif|".indexOf(`|${ext}|`) >= 0)) {
                icon = "photo";
            }
            html += `<li class="mdui-list-item file mdui-ripple" target="_blank"><a gd-type="${item.mimeType}" href="${p}" class="${c}">
	          <div class="mdui-col-xs-12 mdui-col-sm-8 mdui-text-truncate file-name">
	          <i class="mdui-icon material-icons">${icon}</i>
	            ${item.name}
	          </div>
	          <div class="mdui-col-sm-3 mdui-text-right file-date">${item['modifiedTime']}</div>
	          <div class="mdui-col-sm-1 mdui-text-right file-size">${item['size']}</div>
	          </a>
	      </li>`;
        }
    }
    $('#list').html(html);
}


function get_file(path, file, callback) {
    var key = "file_path_" + path + file['modifiedTime'];
    var data = localStorage.getItem(key);
    if (data != undefined) {
        return callback(data);
    } else {
        $.get(path, function(d) {
            localStorage.setItem(key, d);
            callback(d);
        });
    }
}



// 文件展示 ?a=view
function file(path) {
    var name = path.split('/').pop();
    var ext = name.split('.').pop().toLowerCase().replace(`?a=view`, "");
    if ("|html|php|css|go|java|js|json|txt|sh|md|".indexOf(`|${ext}|`) >= 0) {
        return file_code(path);
    }

    if ("|mp4|webm|avi|".indexOf(`|${ext}|`) >= 0) {
        return file_video(path);
    }

    if ("|mpg|mpeg|mkv|rm|rmvb|mov|wmv|asf|ts|flv|m4v|".indexOf(`|${ext}|`) >= 0) {
        return file_video(path);
    }

    if ("|mp3|wav|ogg|m4a|flac|".indexOf(`|${ext}|`) >= 0) {
        return file_audio(path);
    }

    if ("|bmp|jpg|jpeg|png|gif|".indexOf(`|${ext}|`) >= 0) {
        return file_image(path);
    }
}

// 文件展示 |html|php|css|go|java|js|json|txt|sh|md|
function file_code(path) {
    var type = {
        "html": "html",
        "php": "php",
        "css": "css",
        "go": "golang",
        "java": "java",
        "js": "javascript",
        "json": "json",
        "txt": "text",
        "sh": "sh",
        "md": "markdown",
    };
    var name = path.split('/').pop();
    var ext = name.split('.').pop();
    var href = window.location.origin + path;
    href = encodeURI(href);
    var content = `
<div class="code-editor">
<pre id="editor"></pre>
</div>
<div class="mdui-textfield">
	<label class="mdui-textfield-label">Direct donwload link</label>
	<input readonly class="mdui-textfield-input" type="text" value="${href}"/>
</div>
<a href="${href}" class="mdui-fab mdui-fab-fixed mdui-ripple mdui-color-theme-accent"><i class="mdui-icon material-icons">file_download</i></a>

<script src="https://cdn.staticfile.org/ace/1.4.8/ace.js"></script>
<script src="https://cdn.staticfile.org/ace/1.4.8/ext-language_tools.js"></script>
	`;
    $('#content').html(content);

    $.get(path, function(data) {
        $('#editor').html($('<div/>').text(data).html());
        var code_type = "Text";
        if (type[ext] != undefined) {
            code_type = type[ext];
        }
        var editor = ace.edit("editor");
        editor.setTheme("ace/theme/dracula");
        editor.setFontSize(16);
        editor.session.setMode("ace/mode/" + code_type);
        editor.setReadOnly(true);

        //Autocompletion
        editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
            maxLines: Infinity
        });
    });
}

// 文件展示 视频 |mp4|webm|avi|
function file_video(path) {
    var url = window.location.origin + path;
    url = encodeURI(url);
    var playBtn = `<a class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent" href="potplayer://${url}"><i class="mdui-icon material-icons">play_circle_filled</i> Potplayer</a>`;
    if (/(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent)) { //移动端
        playBtn = `<a class="mdui-btn mdui-btn-raised mdui-ripple mdui-color-theme-accent" href="vlc://${url}"><i class="mdui-icon material-icons">play_circle_outline</i> VLC Player</a>`;
    }
    var content = `
	<div class="mdui-row video">
	<video id="player" class="mdui-video-fluid mdui-center" preload playsinline controls>
	</video>
	</div>
	<div class="mdui-container-fluid">
	<br>${playBtn}
	<!-- 固定标签 -->
	<div class="mdui-textfield">
	  <label class="mdui-textfield-label">Direct download link</label>
	  <input readonly class="mdui-textfield-input" type="text" value="${url}"/>
	</div>
	<div class="mdui-textfield">
	  <label class="mdui-textfield-label">Embed code</label>
	  <textarea readonly class="mdui-textfield-input"><video><source src="${url}" type="video/mp4"></video></textarea>
	</div>
</div>
<a download href="${url}" class="mdui-fab mdui-fab-fixed mdui-ripple mdui-color-theme-accent"><i class="mdui-icon material-icons">file_download</i></a>
	`;
    $('#content').html(content);
	
	const player = new Plyr('#player');
    
    var quality = 1080;
    if (url.includes("2160")){
        quality = 2160;
    }else if (url.includes("1440")){
        quality = 1440;
    }
    
    var vid720 = window.location.origin + "/res/720" + path;
    
    if (isThere(vid720)){
        player.source = {
            type: 'video',
            sources: [
                {
                    src: url,
                    type: 'video/mp4',
                    size: quality,
                },
                {
                    src: vid720,
                    type: 'video/mp4',
                    size: 720,
                },
            ],
            previewThumbnails: {enabled: false},
            poster: 'https://cdn.jsdelivr.net/gh/aykuxt/goindex@red/assets/thumb1280x720-black-min.png',
        };
    }else{
        player.source = {
            type: 'video',
            sources: [
                {
                    src: url,
                    type: 'video/mp4',
                    size: quality,
                },
            ],
            previewThumbnails: {enabled: false},
            poster: 'https://cdn.jsdelivr.net/gh/aykuxt/goindex@red/assets/thumb1280x720-black-min.png',
        };
    }
}

function isThere(url) {
	var req= new AJ(); // XMLHttpRequest object
	try {
		req.open("HEAD", url, false);
		req.send(null);		
		return req.status== 200 ? true : false;
	}
	catch (er) {
		return false;
	}
}

function AJ() {
	var obj;
	if (window.XMLHttpRequest) obj= new XMLHttpRequest(); 
	else if (window.ActiveXObject){
		try{
			obj= new ActiveXObject('MSXML2.XMLHTTP.3.0');
		}
		catch(er){
			try{
				obj= new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch(er){
				obj= false;
			}
		}
	}
	return obj;
}

// 文件展示 音频 |mp3|m4a|wav|ogg|
function file_audio(path) {
    var url = window.location.origin + path;
    url = encodeURI(url);
    var content = `
<div class="mdui-container-fluid">
	<br>
	<audio class="mdui-center" preload controls>
	  <source src="${url}"">
	</audio>
	<br>
	<!-- 固定标签 -->
	<div class="mdui-textfield">
	  <label class="mdui-textfield-label">Direct download link</label>
	  <input readonly class="mdui-textfield-input" type="text" value="${url}"/>
	</div>
	<div class="mdui-textfield">
	  <label class="mdui-textfield-label">Embed code</label>
	  <textarea readonly class="mdui-textfield-input"><audio><source src="${url}"></audio></textarea>
	</div>
</div>
<a href="${url}" class="mdui-fab mdui-fab-fixed mdui-ripple mdui-color-theme-accent"><i class="mdui-icon material-icons">file_download</i></a>
	`;
    $('#content').html(content);
}


// 图片展示
function file_image(path) {
    var url = window.location.origin + path;
    url = encodeURI(url);
    var content = `
<div class="mdui-container-fluid">
	<br>
	<img class="mdui-img-fluid mdui-center" src="${url}"/>
	<br>
	<div class="mdui-textfield">
	  <label class="mdui-textfield-label">Direct download link</label>
	  <input readonly class="mdui-textfield-input" type="text" value="${url}"/>
	</div>
	<div class="mdui-textfield">
	  <label class="mdui-textfield-label">Embed code</label>
	  <input readonly class="mdui-textfield-input" type="text" value="<img src='${url}' />"/>
	</div>
        <div class="mdui-textfield">
	  <label class="mdui-textfield-label">Markdown</label>
	  <input readonly class="mdui-textfield-input" type="text" value="![](${url})"/>
	</div>
        <br>
</div>
<a href="${url}" class="mdui-fab mdui-fab-fixed mdui-ripple mdui-color-theme-accent"><i class="mdui-icon material-icons">file_download</i></a>
	`;
    $('#content').html(content);
}


//时间转换
function utc2beijing(utc_datetime) {
    // 转为正常的时间格式 年-月-日 时:分:秒
    var T_pos = utc_datetime.indexOf('T');
    var Z_pos = utc_datetime.indexOf('Z');
    var year_month_day = utc_datetime.substr(0, T_pos);
    var hour_minute_second = utc_datetime.substr(T_pos + 1, Z_pos - T_pos - 1);
    var new_datetime = year_month_day + " " + hour_minute_second; // 2017-03-31 08:02:06

    // 处理成为时间戳
    timestamp = new Date(Date.parse(new_datetime));
    timestamp = timestamp.getTime();
    timestamp = timestamp / 1000;

    // 增加8个小时，北京时间比utc时间多八个时区
    var unixtimestamp = timestamp + 8 * 60 * 60;

    // 时间戳转为时间
    var unixtimestamp = new Date(unixtimestamp * 1000);
    var year = 1900 + unixtimestamp.getYear();
    var month = "0" + (unixtimestamp.getMonth() + 1);
    var date = "0" + unixtimestamp.getDate();
    var hour = "0" + unixtimestamp.getHours();
    var minute = "0" + unixtimestamp.getMinutes();
    var second = "0" + unixtimestamp.getSeconds();
    return year + "-" + month.substring(month.length - 2, month.length) + "-" + date.substring(date.length - 2, date.length) +
        " " + hour.substring(hour.length - 2, hour.length) + ":" +
        minute.substring(minute.length - 2, minute.length) + ":" +
        second.substring(second.length - 2, second.length);
}

// bytes自适应转换到KB,MB,GB
function formatFileSize(bytes) {
    if (bytes >= 1000000000) { bytes = (bytes / 1000000000).toFixed(2) + ' GB'; } else if (bytes >= 1000000) { bytes = (bytes / 1000000).toFixed(2) + ' MB'; } else if (bytes >= 1000) { bytes = (bytes / 1000).toFixed(2) + ' KB'; } else if (bytes > 1) { bytes = bytes + ' bytes'; } else if (bytes == 1) { bytes = bytes + ' byte'; } else { bytes = ''; }
    return bytes;
}

function humanFileSize(bytes, si) {
    if (!bytes) {
        bytes = '';
        return bytes;
    } else {
        var thresh = si ? 1000 : 1024;
        if (Math.abs(bytes) < thresh) {
            return bytes + ' B';
        }
        var units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        var u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while (Math.abs(bytes) >= thresh && u < units.length - 1);

        return bytes.toFixed(1) + ' ' + units[u];
    }
}

String.prototype.trim = function(char) {
    if (char) {
        return this.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '');
    }
    return this.replace(/^\s+|\s+$/g, '');
};


// README.md HEAD.md 支持
function markdown(el, data) {
    if (window.md == undefined) {
        //$.getScript('https://cdn.jsdelivr.net/npm/markdown-it@10.0.0/dist/markdown-it.min.js',function(){
        window.md = window.markdownit();
        markdown(el, data);
        //});
    } else {
        var html = md.render(data);
        $(el).show().html(html);
    }
}

// 监听回退事件
window.onpopstate = function() {
    var path = window.location.pathname;
    render(path);
}


$(function() {
    init();
    var path = window.location.pathname;
    $("body").on("click", '.folder', function() {
        var url = $(this).attr('href');
        history.pushState(null, null, url);
        render(url);
        return false;
    });

    $("body").on("click", '.view', function() {
        var url = $(this).attr('href');
        history.pushState(null, null, url);
        render(url);
        return false;
    });

    render(path);
});

function search() {
    var e, t, n, l;
    for (e = document.getElementById("search").value.toUpperCase(), t = document.getElementById("list").getElementsByTagName("li"), l = 0; l < t.length; l++)((n = t[l].getElementsByTagName("a")[0]).textContent || n.innerText).toUpperCase().indexOf(e) > -1 ? t[l].style.display = "" : t[l].style.display = "none"
}
