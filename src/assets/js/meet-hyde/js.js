if(!AccessToken){
	$('#setToken').modal('toggle');
	$('body').on('click', '#setToken .modal-footer .create', function () {

			$('#setToken .modal-footer').html('<button type="button" class="btn btn-success use-images" disabled><div class="spinner"><div class="double-bounce1"></div><div class="double-bounce2"></div></div></button>');
			var token = $('#setToken form input').val();
			localStorage.setItem('AccessToken',token);
			location.reload()
	});

	$('#setToken input').on('change', function(){
		if($(this).val().length === 0){
			$('#setToken .modal-footer').html('<button type="button" class="btn btn-success use-images" disabled><i class="fa fa-ban"></i></button>');
		}else if($(this).val().length > 1) {
			$('#setToken .modal-footer').html('<button type="button" class="create btn btn-success use-images"><i class="fa fa-check"></i> Create</button>');
		}
	});
}

function Api(method, url, callback, data, raw) {
  url = 'https://api.github.com' + url;
  url += ((/\?/).test(url) ? '&' : '?');
  url += '&' + (new Date()).getTime();

  if(data && Object.keys(data).length > 1){
    data = JSON.stringify(data)
  }

  $.ajax({
    type: method,
    url: url,
    data: data,
    dataType: 'json',
    beforeSend: function(xhrObj){
      xhrObj.setRequestHeader('Accept','application/vnd.github.v3+json');
      xhrObj.setRequestHeader('Content-Type','application/json;charset=UTF-8');
      xhrObj.setRequestHeader('Authorization', 'token ' + $.trim(AccessToken));
    },
    success: function(data) {
      callback(data)
    },
    error: function(data, argument2, argument3) {
      callback(data.status);
    }
  });

}
//Current user
  function CurrentUser(callback) {
    Api('GET', '/user', callback);
  };

//Show Repos
  function Repos(callback) {
    Api('GET', '/user/repos?type=public&per_page=1000', callback);
  };

//Show Tree
  function Tree(branch, callback){
    Api('GET', RepoPath + 'git/trees/' + branch + '?per_page=1000', function(data) {
      callback(data.tree);
    });
  }

//Show Folders Content
  function Content(path, branch, callback) {
    Api('GET', RepoPath + 'contents' + (path ? '/' + encodeURI(path) : '') + '?per_page=1000', callback, { ref: branch });
  };

//Show Files Content
  function Read(path, branch, callback) {
    Api('GET', RepoPath + 'contents/' + encodeURI(path) + '?ref=' + branch + '&per_page=1000', function(data){
    	callback(window.atob(data.content));
    });
  };

//Get Sha
  function Sha(path, branch, callback) {
    Api("GET", RepoPath + "contents/" + path + "?ref=" + branch, function(data) {
      if(data === 403){//if file is bigger than 1mb it's not returned so look inside the container folder
        cut = path.lastIndexOf('/');
        fname = path.substring(cut + 1);
        findIn = decodeURI(path).replace('/' + fname, '');
        Content(findIn, branch, function(data){
        	if(data === 403){ // If looking in the container folder throws error it's not in a folder but in the root
        		Tree(branch, function(data){
					    $.each(data, function( index, value ){
		            if(value.path === decodeURI(path)){
		              callback(value.sha);
		            }
		          });
				    });
        	}else{
	          $.each(data, function( index, value ){
	            if(value.path === decodeURI(path)){
	              callback(value.sha);
	            }
	          });
        	}
        });
      }else if(data === 404){
        callback(data);
      }else{
        callback(data.sha);
      }
    });
  };

//Update files
  function Write(path, branch, content, CommitMsg, callback) {
    Sha(encodeURI(path), branch, function(data) {
      Api("PUT", RepoPath + "contents/" + encodeURI(path), callback, {
        message: CommitMsg,
        content: content,
        branch: branch,
        sha: data
      });
    });
  };

//Create files
  function Create(path, branch, content, CommitMsg, callback) {
    Api("PUT", RepoPath + "contents/" + encodeURI(path), callback, {
      message: CommitMsg,
      content: content,
      branch: branch
    });
  };

//Remove files
  function Delete(path, branch, callback) {
    Sha(encodeURI(path), branch, function(data) {
      Api('DELETE', RepoPath + 'contents/' + encodeURI(path), callback, {
        message: path + ' is removed',
        sha: data,
        branch: branch
      });
    });
  };

//Rename
  function Rename(path, newName, callback){
    Api('PATCH', path, callback, {
      name: newName,
    });
  }

/*//Fork
  function Fork(forkUser, forkRepo, callback) {
    Api('POST', '/repos/' + forkUser + '/' + forkRepo + '/forks', callback);
  };*/

//Toggle sidebar
	$('#toggle').click(function() {
	  $('body').toggleClass('toggled');
	  $('header + div').toggleClass('row');
	});

//Back button
	$('#back').click(function(){
		if($('header .breadcrumb').children().length === 1){
			ShowWebsites();
		}else{
			$('header .breadcrumb span:last-child span').trigger('click');
		}
	});


var UserLogin;

var RepoName;
var RepoPath;
var RepoOwner;
var RepoBranch;
var RepoUrl;

var CurrentName;
var CurrentPath;

var CommitMsg = 'Changes made by ';
var SaveBtn = '<button type="button" class="btn btn-success" disabled></button>';

var InsertImage;
var FrontMatter;

//Get current user info
	CurrentUser(function(data) {
		UserLogin = data.login;
		$(".avatar").attr('src', data.avatar_url);
		if(data.name === null){
			$(".user-name").html('<a src="' + data.html_url + '">' + data.login + '</a>');
		}else{
			$(".user-name").html('<a src="' + data.html_url + '">' + data.name + '</a>');
		}
		$('#commit').attr('placeholder', CommitMsg + UserLogin);
		ShowWebsites();
	});

//Show user websites
	function ShowWebsites() {
		$('body').attr('data-content', 'sites').attr('data-pages', '0');
		$('header .title').text('My websites').removeAttr('data-site');
		$('header .url, aside .list .title, aside ul, main .content, main .images').empty();
		$('.breadcrumb .fa-home').nextAll().remove();
		if($('.loading').is(':hidden')){
			$('.loading, .noclick').toggle();
		}

		Repos(function(data) {
			var _totalPages = 0;
			$.each(data, function( index, value ) {
				if(value.has_pages === true){
					if(value.name === value.owner.login.toLowerCase() + '.github.io'){
	      		var _url = value.html_url;
	      		var _repoUrl = value.name;
	      		var _branch = 'master'
	      	}else {
	      		var _url = value.html_url + '/tree/'+branchName;
	      		var _repoUrl = UserLogin.toLowerCase() + '.github.io' + '/' + value.name;
	      		var _branch = branchName;
	      	}
	      	$('main .content').append('<div class="card"><div class="card-block"><a href="' + _url + '" target="_blank"><i class="fa fa-github-square"></i></a> ' + value.name + '</div><div data-site="' + value.name + '" data-owner="' + value.owner.login.toLowerCase() + '" data-branch="' + _branch + '" data-url="' + _repoUrl + '" class="card-footer">Manage <i class="fa fa-arrow-circle-o-right"></i></div></div>');
	      	_totalPages += 1;
	      }
	    });
			$('aside .my-websites .label').text(_totalPages);
			if(data.length < 1){
				$('main .content').append('<div class="alert alert-danger" role="alert"><strong>Oh oh!</strong> It seems like there are no public repositories in your account. Meet Hyde only tracks pubic repositories because websites are meant to be public right?"</div>');
			}else if(_totalPages < 1){
				$('main .content').append('<div class="alert alert-danger" role="alert"><strong>Oh oh!</strong> It seems like there are no websites in any of your repositories. Meet Hyde only tracks repositories with "gh-pages" branches and user pages which are repositories named this way: "user-name.github.io"</div>');
			}
			if($('.loading').is(':visible')){
				$('.loading, .noclick').toggle();
			}
		});

		//Append option to create a new website (in progress)
			//$('main .content').append('<div id="fork" class="card" data-toggle="modal" data-target="#Fork"><div class="card-block"><i class="fa fa-plus-circle"></i> New</div><div class="card-footer">Create a new website <i class="fa fa-arrow-circle-o-right"></i></div></div>');
	}

	//Call the function (its called on load or on click of .my-websites)
		$('.my-websites').click(function(){
			ShowWebsites();

		});

//Show the tree for a website
	function Root(_repoName, _repoOwner, _repoBranch, _repoUrl, _showPages ){
		RepoName = _repoName;
		RepoOwner = _repoOwner;
		RepoPath = '/repos/' + RepoOwner + '/' + RepoName + '/';
		RepoBranch = _repoBranch;
		RepoUrl = _repoUrl;

		$('.loading, .noclick').toggle();
		$('body').attr('data-content', 'tree');
		$('main .content, main .images, aside ul, #FTitle').empty();
		$('.title').text(RepoName).attr('data-site', RepoName).attr('data-owner', RepoOwner).attr('data-branch', RepoBranch).attr('data-url', RepoUrl);
		if(!_showPages){
			$('header .url').html('(<a href="http://' + RepoUrl + '" target="_blank">' + RepoUrl + '</a>)');
			$('body').attr('data-pages', '0');
		}else{
			$('body').attr('data-pages', '1');
		}

		Tree(RepoBranch, function(data) {
			var _name;
			$.each(data, function( index, value ) {
				_name = value.path.toLowerCase();

				if (_name.match('.md$') && _name !== 'readme.md' || _name.match('.html$') || _name.match('.htm$') || _name.match('.markdown$')){
					if(_showPages){
						$('#FTitle').text('Pages');
						$('main .content').append('<div class="card" data-icon="' + value.type + '" ><div class="card-block"><i class="fa"> </i><div class="options"><span class="delete" data-path="' + value.path + '">delete</span></div></div><div class="card-footer" data-type="' + value.type + '" data-path="' + value.path + '" data-name="' + value.path + '" >' + value.path + ' <i class="fa"></i></div></div>');
					}
				}else{
					if(!_showPages){
						if(_name.match('.jpg$') || _name.match('.png$') || _name.match('.gif$') || _name.match('.svg$')){
							$('main .images').append('<div class="card image" data-name="' + value.name + '" data-path="' + value.path + '"><img src="https://raw.githubusercontent.com/' + RepoOwner + '/' + RepoName + '/' + RepoBranch + '/' + value.path + '"><div class="options"><span class="name">' + value.path + '</span><span class="delete" data-path="' + value.path + '">delete</span></div></div>');
						}else if (_name !== '.ds_store' || _name !== '_site'){
							$('main .content').append('<div class="card" data-icon="' + value.type + '" ><div class="card-block"><i class="fa"> </i><div class="options"><span class="delete" data-path="' + value.path + '">delete</span></div></div><div class="card-footer" data-type="' + value.type + '" data-path="' + value.path + '" data-name="' + value.path + '" >' + value.path + ' <i class="fa"></i></div></div>');

						}
					}
					$('aside ul').append('<li data-type="' + value.type + '" data-path="' + value.path + '" data-name="' + value.path + '"><i class="fa"></i> ' + value.path + '</li>');
				}

				if (value.path === 'CNAME') {
					Read('CNAME', RepoBranch, function(data) {
						if(data.indexOf('.') != -1){
							$('header .url').html('(<a href="http://' + data + '" target="_blank">' + data + '</a>)');
						}
					});
				}
			});

			if(!_showPages){
				$('main .content').append('<div class="card" data-icon="tree" ><div class="card-block"><i class="fa"> </i></div><div class="card-footer" data-site="' + RepoName +'" data-owner="' + RepoOwner + '" data-branch="' + RepoBranch + '" data-url="' + _repoUrl + '" data-pages="' + true + '">Pages <i class="fa"></i></div></div>');
			}

			$('aside ul').append('<li data-site="' + RepoName +'" data-owner="' + RepoOwner + '" data-branch="' + RepoBranch + '" data-url="'+ RepoName + '" data-pages="' + true + '"><i class="fa fa-folder-open-o"></i> Pages</li>');

			$('aside ul').each(function () {
		    $('[data-type="blob"]', this).prependTo(this);
		    $('[data-type="tree"]', this).appendTo(this);
			});
		});
		$('.loading, .noclick').toggle();
	}
	//Call the function (Header repo name, sidebar repo name, breadcrumb repo name)
		$('body').on('click', '[data-site]', function(){
			$('.breadcrumb .fa-home').nextAll().remove();
			if($(this).attr('data-pages')){
				$('.breadcrumb').append('<span class="repo"><i class="fa fa-angle-double-right"></i> <span data-site="' + RepoName + '" data-owner="' + RepoOwner + '" data-branch="' + RepoBranch + '" data-url=' + RepoUrl + '>' + RepoName + '</span></span>');
			}
			Root($(this).attr('data-site'), $(this).attr('data-owner'), $(this).attr('data-branch'), $(this).attr('data-url'), $(this).attr('data-pages'));
		});


// Show folder contents
	function Open(_currentName, _currentPath){
		CurrentName = _currentName;
		CurrentPath = _currentPath;
		$('.loading, .noclick').toggle();
		$('body').attr('data-content', 'dir').attr('data-pages', '0');
		$('#FTitle').text(CurrentName);
		$('main .content, main .images').empty();

		Content(CurrentPath, RepoBranch, function(data) {
			var _name;
			if(data !== 404){//if the function retrieves contents (when deleting files if the folder is left empty the folder is deleted too so the function returns error)
				$.each(data, function( index, value ){
					_name = value.path.toLowerCase();
					if(!value.path.match('.ds_store$')){
						if(value.path.match('.jpg$') || value.path.match('.png$') || value.path.match('.gif$') || value.path.match('.svg$')){
							$('main .images').append('<div class="card image" data-name="' + value.name + '" data-path="' + value.path + '"><div class="card-block"><img src="' + value.download_url + '"><div class="options"><span class="name">' + value.name + '</span><span class="delete" data-path="' + value.path + '">delete</span></div></div></div>');
						}else{
							$('main .content').append('<div class="card" data-icon="' + value.type + '"><div class="card-block"><i class="fa"></i><div class="options"><span class="delete" data-path="' + value.path + '">delete</span></div></div><div class="card-footer" data-type="' + value.type + '" data-path="' + value.path + '" data-name="' + value.name + '" >' + value.name + ' <i class="fa"></i></div></div>');
						}
					}
				});
			}else{//in this case go to the preceding folder
				$('header .breadcrumb span:last-child span').trigger('click');
			}
			$('.loading, .noclick').toggle();
		});
	}
	//Call the function
		$('body').on('click', '[data-type="tree"], [data-type="dir"], [data-type="breadcrumb"]', function(){
			if($(this).attr('data-type') === "tree"){
				$('.breadcrumb .fa-home').nextAll().remove();
				$('.breadcrumb').append('<span class="repo"><i class="fa fa-angle-double-right"></i> <span data-site="' + RepoName + '" data-owner="' + RepoOwner + '" data-branch="' + RepoBranch + '" data-url="' + RepoUrl + '">' + RepoName + '</span></span>');
			}else if($(this).attr('data-type') === "breadcrumb"){
				$(this).parent('.folder').nextAll().remove();
				$(this).parent('.folder').remove();
			}else{//if click in a dir
				$('.breadcrumb').append('<span class="folder"><i class="fa fa-angle-double-right"></i> <span data-type="breadcrumb" data-path="' + CurrentPath + '" data-name="' + CurrentName + '">' + CurrentName + '</span></span>');
			}

			Open($(this).attr('data-name'), $(this).attr('data-path'));
		});

//Show file contents
	function Edit(_currentName, _currentPath, _editor, FrontMatter){
CurrentName = _currentName;
		CurrentPath = _currentPath;
		$('.loading, .noclick').toggle();
		$('body').attr('data-content', 'file').attr('data-pages', '0');
		$('#FTitle').text(CurrentName);
		$('main .content, main .images').empty();

		Read(CurrentPath, RepoBranch, function(data) {
			if(_editor === 'md'){
				if(data.substring(0, 4) === "---\n"){ //Extract Front Matter
					FrontMatter = $.trim(data.split('---')[1].split('---')[0]);
					data = data.replace(FrontMatter , '');
					data = data.replace('---' , '');
					data = $.trim(data.replace('---' , ''));
				}
				mdEditor(data, FrontMatter);
			}else{
				htmlEditor(data, 'main .content');
			}
			$('.loading, .noclick').toggle();
		});
	}
	//Call the function
	 	$('body').on('click', '[data-type="blob"], [data-type="file"]', function(){
	 		if($(this).attr('data-type') === "blob"){
	 			if($(this).attr('data-name') === 'CNAME' || $(this).attr('data-name').match('.yml$') || $(this).attr('data-name').match('.xml$')){
	 				$('.breadcrumb .fa-home').nextAll().remove();
					$('.breadcrumb').append('<span class="repo"><i class="fa fa-angle-double-right"></i> <span data-site="' + RepoName + '" data-owner="' + RepoOwner + '" data-branch="' + RepoBranch + '" data-url="' + RepoUrl + '">' + RepoName + '</span></span>');
		 		}
			}else if(!$(this).attr('data-name').match('.html$') && !$(this).attr('data-name').match('.md$') && !$(this).attr('data-name').match('.htm$') && !$(this).attr('data-name').match('.markdown$')){
				$('.breadcrumb').append('<span class="folder"><i class="fa fa-angle-double-right"></i> <span data-type="breadcrumb" data-path="' + CurrentPath + '" data-name="' + CurrentName + '">' + CurrentName + '</span></span>');
		 	}

	 		if($(this).attr('data-name').match('.html$') || $(this).attr('data-name').match('.md$') || $(this).attr('data-name').match('.htm$') || $(this).attr('data-name').match('.markdown$')){
	 			//$('#Editors .modal-footer .btn').attr('data-type', $(this).attr('data-type')).attr('data-name', $(this).attr('data-name')).attr('data-path', $(this).attr('data-path')).attr('data-class', $(this).attr('data-class'));
	 			//$('#Editors').modal('toggle');
				 Edit($(this).attr('data-name'), $(this).attr('data-path'),'md');
	 		}else if ($(this).attr('data-name') === 'CNAME'){
	 			$('#CNAME').modal('toggle');
	 			Read('CNAME', RepoBranch, function(data) {
					$('#CustomDomain').val($.trim(data));
				});
	 		}else{
	 			Edit($(this).attr('data-name'), $(this).attr('data-path'), 'html')
	 		}
		});

		$('#Editors .modal-footer .btn').click(function(){
			if($(this).attr('data-type') === "blob"){
				$('.breadcrumb .fa-home').nextAll().remove();//update the breadcrumb
				$('.breadcrumb').append('<span class="repo"><i class="fa fa-angle-double-right"></i> <span data-site="' + RepoName + '" data-owner="' + RepoOwner + '" data-branch="' + RepoBranch + '" data-url="' + RepoUrl + '">' + RepoName + '</span></span>');
				if($(this).attr('data-name').match('.md$') && $(this).attr('data-name') !== 'README.md' || $(this).attr('data-name').match('.html$') || $(this).attr('data-name').match('.htm$') || $(this).attr('data-name').match('.markdown$')){
					$('.breadcrumb').append('<span class="repo"><i class="fa fa-angle-double-right"></i> <span data-site="' + RepoName + '" data-owner="' + RepoOwner + '" data-branch="' + RepoBranch + '" data-url="' + RepoUrl + '" data-pages="' + true + '">Pages</span></span>');
				}
 			}else{
				$('.breadcrumb').append('<span class="folder"><i class="fa fa-angle-double-right"></i> <span data-type="breadcrumb" data-path="' + CurrentPath + '" data-name="' + CurrentName + '">' + CurrentName + '</span></span>');
		 	}

			Edit($(this).attr('data-name'), $(this).attr('data-path'), $(this).attr('data-editor'));
		});

//Html editor
	function htmlEditor(_data, _location){
		$(_location).html('<pre id="editor"></pre>');
		$('main .content').append('<div class="fileActions">' + SaveBtn + '</div>');
		$('.fileActions .btn').html('<i class="fa fa-check"></i> Up to date');

		var editor = ace.edit("editor");
		editor.$blockScrolling = Infinity;
		editor.session.setMode("ace/mode/html");
		editor.setOption("enableEmmet", true);
		editor.renderer.setScrollMargin(10, 10);
		editor.setOptions({
		  autoScrollEditorIntoView: true
		});

		editor.setValue(_data, -1);
		editor.getSession().setTabSize(htmlEditorTabSize);

		editor.on('input', function() {
			if(_data === editor.getValue()){
				$('.fileActions .btn').html('<i class="fa fa-check"></i> Up to date').attr('disabled', true);
			}else{
				$('.fileActions .btn').html('<i class="fa fa-save"></i> Save').attr('disabled', false);
			}
		});
		$(document).one('click', '.fileActions .btn', function(){
			if(_location === 'main .content'){
				saveChanges(editor.getValue());
			}else{
				FrontMatter = editor.getValue();
				$('#saveInMd').trigger('click');
			}
		});

	}

//Markdown editor
	function mdEditor(_data, _fm){
		$('main .content').html('<ul class="nav nav-tabs" role="tablist"><li class="nav-item"><a class="nav-link active" href="#editContent" role="tab" data-toggle="tab">Content</a></li><li class="nav-item"><a class="nav-link" href="#editFm" role="tab" data-toggle="tab">Front Matter</a></li></ul><div class="tab-content"><div role="tabpanel" class="tab-pane active" id="editContent"><textarea class="form-control" id="mdEditor"></textarea></div><div role="tabpanel" class="tab-pane" id="editFm"></div></div><div id="saveInMd" class="hidden"></div>');

		htmlEditor(_fm, '#editFm');

		var simplemde = new SimpleMDE({
					element: document.getElementById("mdEditor"),
					spellChecker: false,
					tabSize: 4,
					toolbar: ["bold", "italic", "strikethrough",
										"|",
										"heading", "heading-smaller", "heading-bigger",
										"|",
										"code", "quote", "unordered-list", "ordered-list", "horizontal-rule",
										"|",
										"link",
										{
					            name: "image",
					            className: "search-image fa fa-picture-o",
					            action: searchImage,
					            title: "Insert Image",
					          },
					          {
					            name: "image2",
					            className: "insert-image fa fa-times",
					            action: _drawImage,
					            title: "Insert Image",
					          },
										{
					            name: "attach",
					            className: "fa fa-paperclip",
					            action: searchFile,
					            title: "Attach File",
					          },
										"|" ,
										"side-by-side",
										{
					            name: "expand",
					            action: mdexpand,
					            className: "expand fa fa-arrows-alt",
					            title: "Toggle Fullscreen",
			        			},
			        			"fullscreen", "preview"
			        		 ]
				});

		function _drawImage(editor) {
			var cm = editor.codemirror;
			var stat = _getState(cm);
			_replaceselection(cm, stat.image, '\n' + InsertImage + '\n' , "");
			InsertImage = "";
		}
		SimpleMDE._drawImage = _drawImage;
		SimpleMDE.prototype._drawImage = function() {
			_drawImage(this);
		};
		function _getState(cm, pos) {
			pos = pos || cm.getCursor("start");
			var stat = cm.getTokenAt(pos);
			if(!stat.type) return {};

			var types = stat.type.split(" ");

			var ret = {},
				data, text;
			for(var i = 0; i < types.length; i++) {
				data = types[i];
				if(data === "strong") {
					ret.bold = true;
				} else if(data === "variable-2") {
					text = cm.getLine(pos.line);
					if(/^\s*\d+\.\s/.test(text)) {
						ret["ordered-list"] = true;
					} else {
						ret["unordered-list"] = true;
					}
				} else if(data === "atom") {
					ret.quote = true;
				} else if(data === "em") {
					ret.italic = true;
				} else if(data === "quote") {
					ret.quote = true;
				} else if(data === "strikethrough") {
					ret.strikethrough = true;
				} else if(data === "comment") {
					ret.code = true;
				}
			}
			return ret;
		}
		function _replaceselection(cm, active, start, end) {
			if(/editor-preview-active/.test(cm.getWrapperElement().lastChild.className))
				return;

			var text;
			var startPoint = cm.getCursor("start");
			var endPoint = cm.getCursor("end");
			if(active) {
				text = cm.getLine(startPoint.line);
				start = text.slice(0, startPoint.ch);
				end = text.slice(startPoint.ch);
				cm.replaceRange(start + end, {
					line: startPoint.line,
					ch: 0
				});
			} else {
				text = cm.getSelection();
				cm.replaceSelection(start + text + end);

				startPoint.ch += start.length;
				if(startPoint !== endPoint) {
					endPoint.ch += start.length;
				}
			}
			cm.setSelection(startPoint, endPoint);
			cm.focus();
		}

		simplemde.value(_data);

		$('.editor-toolbar .fa-columns').trigger( 'click' );
		$('.fa-arrows-alt:not(.expand)').hide();
		$('main .content').wrapInner('<div id="md-editor" class="nofull" />');
		$('.editor-toolbar').append('<div class="fileActions">' + SaveBtn + '</div>');
		$('.editor-toolbar .actions').toggle();

		simplemde.codemirror.on("change", function(){
			if(_data === simplemde.value()){
				$('.fileActions .btn').html('<i class="fa fa-check"></i> Up to date').attr('disabled', true);
			}else{
				$('.fileActions .btn').html('<i class="fa fa-save"></i> Save').attr('disabled', false);
			}
		});

		$(document).one('click', '#saveInMd', function(){
			saveChanges(FrontMatter, simplemde.value())
		});
	}

	//Editor full screen
		function mdexpand(){
			$('.expand').toggleClass('isactive');
			$('#md-editor').toggleClass('nofull');
			$('.editor-toolbar .actions').toggle();
		}

	//Open the image manager
		function searchImage(){
			$('#MdImage').modal('toggle');
			MdImage();
		}
		function searchFile(editor){
			$('#attachFile').modal('toggle');
			$('#attachFile').data('editor',editor)
		}

	//Markdown image manager
		function MdImage(_path){
			$('#MdImage .folders, #MdImage .files').empty();
			$('#MdImage .loading, .noclick').toggle();
			if(_path){
				$('#MdImage .breadcrumb').attr('data-current-path', _path)
				Content(_path, RepoBranch, function(data) {
					if(data !== 404){//if the function retrieves contents (when deleting files if the folder is left empty the folder is deleted too so the function returns error)
						$.each(data, function( index, value ){
							if(!value.path.match('.DS_Store$')){
								if(value.path.match('.jpg$') || value.path.match('.png$') || value.path.match('.JPG$') || value.path.match('.PNG$') || value.path.match('.gif$') || value.path.match('.GIF$') || value.path.match('.svg$') || value.path.match('.SVG$')){
									$('#MdImage .files').append('<div class="image"><img class="cardSelect" src="https://raw.githubusercontent.com/' + RepoOwner + '/' + RepoName + '/' + RepoBranch + '/' + value.path + '"><div class="options"><span class="name">' + value.path + '</span></div><div data-name="' + value.name + '" data-url="https://raw.githubusercontent.com/' + RepoOwner + '/' + RepoName + '/' + RepoBranch + '/' + value.path + '" class="btn btn-success btn-block"><i class="fa fa-check"></i>Add</div></div>');
								}else{
									$('#MdImage .folders').append('<div class="folder" data-path="' + value.path + '"><i class="fa fa-folder-open-o"></i><div>' + value.name + '</div></div>');
								}
							}
						});
					}else{//in this case go to the preceding folder
						$('header .breadcrumb span:last-child span').trigger('click');
					}
					$('#MdImage .loading, .noclick').toggle();
				});
			}else{
				$('#MdImage .breadcrumb').html('<span data-path="">' + RepoName + '</span>');
				Tree(RepoBranch, function(data) {
					$.each(data, function( index, value ) {
						if(value.type === 'tree'){
							$('#MdImage .folders').append('<div class="folder" data-path="' + value.path + '"><i class="fa fa-folder-open-o"></i><div>' + value.path + '</div></div>');
						}else if(value.path.match('.jpg$') || value.path.match('.png$') || value.path.match('.JPG$') || value.path.match('.PNG$') || value.path.match('.gif$') || value.path.match('.GIF$') || value.path.match('.svg$') || value.path.match('.SVG$')){
							$('#MdImage .files').append('<div class="image"><img class="cardSelect" src="https://raw.githubusercontent.com/' + RepoOwner + '/' + RepoName + '/' + RepoBranch + '/' + value.path + '"><div class="options"><span class="name">' + value.path + '</span></div><div data-name="' + value.name + '" data-url="https://raw.githubusercontent.com/' + RepoOwner + '/' + RepoName + '/' + RepoBranch + '/' + value.path + '" class="btn btn-success btn-block"><i class="fa fa-check"></i>Add</div></div>');
						}
					});
					$('#MdImage .loading, .noclick').toggle();
				});
			}
		}

		//Navigate through folders
			$('body').on('click', '#MdImage [data-path]', function(){
				MdImage($(this).attr('data-path'));
				if ($(this).hasClass('folder')){
					$('#MdImage .breadcrumb').append('<i class="fa fa-angle-double-right"></i><span class="image-path" data-path="' + $(this).attr('data-path') + '">' + $(this).children('div').html() + '</span>');
				}else{
					$(this).nextAll().remove();
				}
			});

		//Attach mousewheel to horizontal folders
			$("#MdImage .folders").mousewheel(function(event, delta) {
				this.scrollLeft -= (delta * 30);
		  	event.preventDefault();
			});

		//Insert images on mdeditor
			$('body').on('click', '#MdImage .image > .btn', function(){
				InsertImage = '![' + $(this).attr('data-name') + '](' + $(this).attr('data-url') + ')';
				$('.editor-toolbar .insert-image').trigger('click');
				$('#MdImage').modal('toggle');
			});
			$('body').on('click', '#insertUrl .modal-footer .btn', function(){
				InsertImage = '![](' + $('#insertUrl input').val() + ')';
				$('.editor-toolbar .insert-image').trigger('click');
				$('#MdImage').modal('toggle');
			});

		//Top bar
			//upload
				$('body').on('click', '#Upload', function(){
					$('#MdImage .uploader, #MdImage .folders, #MdImage .files').toggle();
				});
				//Remove image from upload que
					$('body').on('click', '.dz-remove', function(){
						$(this).closest('.dz-preview').remove();
					});
				//Close the dropbox
					$('body').on('click', '.uploader .btn-danger', function(){
						$('#MdImage .uploader, #MdImage .folders, #MdImage .files').toggle();
						$('form.dropzone .dz-preview').remove();
						$('form.dropzone').removeClass('dz-started');
					});
				//Upload the images
					$('body').on('click', '#MdImage .uploader .btn-success', function(){
						_path = $('#MdImage .breadcrumb').attr('data-current-path');
						if(_path){
							_saveIn = _path + '/';
						}else{
							_saveIn = '';
						}
						_imagesToUpload = ($('#MdImage .manager-drop img').length); //# of images to upload
						_augmentIn = 100 / _imagesToUpload;
						_imagesUploaded = 0;
						if (_imagesToUpload === 0) {
						  alert('There are no images to upload');
						}else {
							$('#MdImage .uploading, .noclick').toggle();
							$('#MdImage .manager-drop img').each(function(){
								_base = $(this).attr('src');
								_baseClean = _base.replace('data:image/png;base64,','');
								_imgName = $(this).attr('alt');
								Create(_saveIn + _imgName, RepoBranch, _baseClean, 'uploaded by' + UserLogin, function(err) {
									$('#MdImage .uploading .progress').attr('value', parseFloat($('#MdImage .progress').attr('value')) + parseFloat(_augmentIn));
									$('#MdImage .uploading .percent').text(Math.floor(parseInt($('#MdImage .uploading .percent').prev().attr('value'))) + ' %');
									_imagesUploaded += 1;
									if(_imagesUploaded ===  _imagesToUpload){
										MdImage(_path);
										$('#MdImage .uploader, #MdImage .folders, #MdImage .files').toggle();
										$('#MdImage form.manager-drop .dz-preview').remove();
										$('#MdImage form.manager-drop').removeClass('dz-started');
										$('#MdImage .uploading .progress').attr('value', '0');
										$('#MdImage .uploading .percent').text('0');
										$('#MdImage .uploading, .noclick').toggle();
									}
								});
							});
						}
					});

				//Insert from url
					$('#FromUrl').click(function(){
						$('#insertUrl').modal('toggle');
					});
					$('body').on('input', '#insertUrl input', function(){
						_imageUrl = $(this).val();
						$(this).parent().next().children().attr('src', _imageUrl);
					});
					$('#insertUrl').on('hidden.bs.modal', function () {
					  $('#insertUrl input').val('');
					  $('#insertUrl img').attr('src', '');
					});

		//Clear data on close
		  $('#MdImage').on('hidden.bs.modal', function () {
			  $('#MdImage .folders, #MdImage .files, #MdImage .images').empty();
			});

//Save files
	function saveChanges(_html, _md){
		var _saveContent;

		if ($("#commit").val()) {
		  CommitMsg = $("#commit").val();
		}

		$('.fileActions .btn').html('<div class="spinner"><div class="double-bounce1"></div><div class="double-bounce2"></div></div>').attr('disabled', true);//content for the button

		if (_md){//If the editing is being made with MarkDown
			if (_html.indexOf("Replace this text with your Front Matter block.") >= 0){
				_saveContent = _md;
			}else if (_html.substring(0, 4) === "---\n"){
				_saveContent = '---\n' + $.trim(_html.split('---')[1].split('---')[0]) + '\n---\n' + _md;
			}else{
				_saveContent = '---\n' + $.trim(_html) + '\n---\n' + _md;
			}
		}else { //If the editing is being made with Html
			_saveContent = _html;
		}

		Write(CurrentPath, RepoBranch, window.btoa(_saveContent), CommitMsg, function(data) {
			$('main .content').empty();
			if(_md){
				mdEditor(_md, _html)
			}else{
				htmlEditor(_html, 'main .content')
			}
			CommitMsg = 'Changes made by ' + UserLogin;
			$("#commit").val('');
		});
	}

//Delete files
	$(document).on('click', '.options .delete', function(){
		$('#confirmDelete').modal('toggle');
		$('#confirmDelete #Confirm').attr('data-path', $(this).attr('data-path'));
	});

	$(document).on('click', '#confirmDelete #Confirm', function(){
		$('.deleting, .noclick').toggle();
		var _remove = $(this).attr('data-path');
		Delete($(this).attr('data-path'), RepoBranch, function() {
			$('main .card .delete').each(function(){
				if($(this).attr('data-path') === _remove){
					$(this).closest('.card').remove();
					$('	.deleting, .noclick').toggle();
					return false;
				}
			});
		});
  });

//Get current date
	function CurrentDate(){
		var d = new Date();
		var month = d.getMonth()+1;
		var day = d.getDate();

		return d.getFullYear() + '-' +
		    (month<10 ? '0' : '') + month + '-' +
		    (day<10 ? '0' : '') + day + '-';
	}

//Create files
	$('.create').on('click', function () {
		if($('body').attr('data-content') === 'dir'){
			$('#createFile form label').text(RepoName + '/' + CurrentPath + '/');
		}
		else if($('body').attr('data-pages') === '1'){
			$('#createFile form label').text(RepoName + '/Pages/');
		}else{
			$('#createFile form label').text(RepoName + '/');
		}
	});

	$('#createFile input').on('input', function(){
		if($(this).val().length === 0){
			$('#createFile .modal-footer').html('<button type="button" class="btn btn-success use-images" disabled><i class="fa fa-ban"></i></button>');
		}else if($(this).val().length === 1) {
			$('#createFile .modal-footer').html('<button type="button" class="create btn btn-success use-images"><i class="fa fa-check"></i> Create</button>');
		}
	});

$('body').on('click', '#createFile .modal-footer .create', function () {
		var _newFile;

		$('#createFile .modal-footer').html('<button type="button" class="btn btn-success use-images" disabled><div class="spinner"><div class="double-bounce1"></div><div class="double-bounce2"></div></div></button>');

		if($('body').attr('data-content') === 'dir'){
			if(CurrentPath.indexOf('_posts') >= 0){
				_newFile = CurrentPath + '/' + CurrentDate() + $('#createFile form input').val();
			}else{
				_newFile = CurrentPath + '/' + $('#createFile form input').val();
			}
		}
		else{
			_newFile = $('#createFile form input').val();
		}

		Create(_newFile, RepoBranch, window.btoa(''), 'created by' + UserLogin, function(data) {
			$('#createFile').modal('toggle');
			if($('body').attr('data-content') === 'dir'){
				Open(CurrentName, CurrentPath);
			}
			else if($('body').attr('data-pages') === '1'){
				Root(RepoName, RepoOwner, RepoBranch, RepoUrl, true);
			}else{
				Root(RepoName, RepoOwner, RepoBranch, RepoUrl);
			}

			$('#createFile .modal-footer').html('<button type="button" class="btn btn-success use-images" disabled><i class="fa fa-ban"></i></button>');
		});
	});
	$('#createFile').on('hidden.bs.modal', function () { //Clear values on modal close
	  $('#createFile .modal-footer').html('<button type="button" class="btn btn-success use-images" disabled><i class="fa fa-ban"></i></button>');
	  $('#createFile input').val('');
	});

	$('body').on('click', '#createPost .modal-footer .create', function () {

		$('#createPost .modal-footer').html('<button type="button" class="btn btn-success use-images" disabled><div class="spinner"><div class="double-bounce1"></div><div class="double-bounce2"></div></div></button>');
			var title = $('#createPost form input').val();
			var category = $('#createPost form select').val();
			var	_newFile = '_posts/' + CurrentDate() + title+'.md';
			var frontMatter = 'layout:post\ntitle : '+title+'\ncategory:'+category;

		Create(_newFile, RepoBranch, window.btoa(''), 'created by' + UserLogin, function(data) {
			$('#createPost').modal('toggle');
			Edit(title,_newFile, 'md',frontMatter);
		

			$('#createPost .modal-footer').html('<button type="button" class="btn btn-success use-images" disabled><i class="fa fa-ban"></i></button>');
		});
	});
	$('#createPost').on('hidden.bs.modal', function () { //Clear values on modal close
	  $('#createFile .modal-footer').html('<button type="button" class="btn btn-success use-images" disabled><i class="fa fa-ban"></i></button>');
	  $('#createFile input').val('');
	});


	$('#createPost input').on('input', function(){
		if($(this).val().length === 0){
			$('#createPost .modal-footer').html('<button type="button" class="btn btn-success use-images" disabled><i class="fa fa-ban"></i></button>');
		}else if($(this).val().length === 1) {
			$('#createPost .modal-footer').html('<button type="button" class="create btn btn-success use-images"><i class="fa fa-check"></i> Create</button>');
		}
	});

//Upload files
	Dropzone.options.addFromFolder = { //Disable image resize
	  thumbnailWidth: null,
	  thumbnailHeight: null,
	  init: function() {
	    this.on("thumbnail", function(file, dataUrl) {
	    	$('img[alt="' + file.name + '"]').parent().next().append('<div class="dz-remove"><i class="fa fa-times-circle"></i> Remove</div>');
	    });
	  }
	}
	Dropzone.options.attachFile = { //Disable image resize
		addedfile: function(file) {
			console.log(file);
			 var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = function(e) {
          Create('uploads/' + file.name, RepoBranch, window.btoa(e.target.result), 'uploaded by' + UserLogin, function(res) {
						
							if(res === 422){
								alert('File already exists, change the filename or delete the existing file if you want to update it');
							}else if(!res.commit){
								alert('Unable to upload',res);
								return;
							}
							
							var editor = $('#attachFile').data('editor');
							var cm = editor.codemirror;
							var doc = cm.getDoc();
							var cursor = doc.getCursor(); // gets the line number in the cursor position
							var line = doc.getLine(cursor.line); // get the line contents
							var pos = { // create a new object to avoid mutation of the original selection
									line: cursor.line,
									ch: line.length - 1 // set the character position to the end of the line
							}
							doc.replaceRange('\n['+file.name+'](/uploads/' + file.name + ')\n', pos); // adds a new line
						
							$('#attachFile').modal('toggle');
						
					});
      };
			// Read in the image file as a data URL.
      reader.readAsBinaryString(file);
		}
	}
	Dropzone.options.MdUploader = { //Disable image resize
	  thumbnailWidth: null,
	  thumbnailHeight: null,
	}
	Dropzone.prototype.submitRequest = function(xhr, formData, files) { //Disable auto-uploads
  };

	$('.upload').on('click', function () {
		if($('body').attr('data-content') === 'dir'){
			$('#uploadFile form label').text(RepoName + '/' + CurrentPath + '/');
		}
		else if($('body').attr('data-pages') === '1'){
			$('#uploadFile form label').text(RepoName + '/Pages/');
		}else{
			$('#uploadFile form label').text(RepoName + '/');
		}
	});

	$('body').on('click', '#uploadFile .uploader .btn-success', function(){
		var _filesToUpload = ($('#uploadFile .addimage-drop img').length);
		var _augmentIn = 100 / _filesToUpload;
		var _imagesUploaded = 0;
		var _saveIn;
		var _content;
		var _imgName;
		var _currentName = CurrentName;
		$('.upload').attr('disabled', true);
		$('#uploadFile, #Uploading').modal('toggle');

		if (_filesToUpload === 0) {
		  alert('There are no images to upload');
		}else {
			if($('body').attr('data-content') === 'dir'){
				if ($('#uploadFile input').val()){
					_saveIn = CurrentPath + '/' + $('#uploadFile form input').val() + '/';
				}else{
					_saveIn = CurrentPath + '/';
				}
			}
			else{
				if ($('#uploadFile input').val()){
					_saveIn = $('#uploadFile form input').val() + '/';
				}else{
					_saveIn = '';
				}
			}

			$('#uploadFile .addimage-drop img').each(function(){
				_content = $(this).attr('src') ? $(this).attr('src').replace('data:image/png;base64,','') : '';
				_imgName = $(this).attr('alt');
				Create(_saveIn + _imgName, RepoBranch, _content, 'uploaded by' + UserLogin, function(err) {
					$('#Uploading .progress').attr('value', parseFloat($('#Uploading .progress').attr('value')) + parseFloat(_augmentIn));
					$('#Uploading .percent').text(Math.floor(parseInt($('#Uploading .progress').attr('value'))) + ' %');
					_imagesUploaded += 1;
					if(_imagesUploaded === _filesToUpload){
						if(_currentName === CurrentName){
							if($('body').attr('data-content') === 'dir'){
								Open(CurrentName, CurrentPath);
							}
							else if($('body').attr('data-pages') === '1'){
								Root(RepoName, RepoOwner, RepoBranch, RepoUrl, true );
							}else{
								Root(RepoName, RepoOwner, RepoBranch, RepoUrl);
							}
						}

						$('#UploadSuccess, #Uploading').modal('toggle');
						$('.upload').attr('disabled', false);
						$('#uploadFile form.addimage-drop .dz-preview').remove();
						$('#uploadFile #filename').val('');
						$('#uploadFile form.addimage-drop').removeClass('dz-started');
						$('#Uploading .progress').attr('value', '0');
						$('#Uploading .percent').text('0');
						$('#uploadFile input').val('')
					}
				});
			});
		}
	});
	$('#uploadFile').on('hidden.bs.modal', function () {
		$('#uploadFile form.addimage-drop .dz-preview').remove();
		$('#uploadFile #filename').val('');
	});
	$('#Uploading button').click(function(){
		$('#Uploading .noclick').toggle();
		$('#Uploading').toggleClass('minimized');
		$('#Uploading button i').toggleClass('fa-minus').toggleClass('fa-plus');
	});

/*/Fork repos
	$('#Fork input').on('input', function(){
		if($('#Fork .newname').val().length === 0 || $('#Fork .username').val().length === 0 || $('#Fork .reponame').val().length === 0){
			$('#Fork .modal-footer').html('<button type="button" class="btn btn-success fork" disabled><i class="fa fa-ban"></i></button>');
		}else{
			$('#Fork .modal-footer').html('<button type="button" class="create btn btn-success fork"><i class="fa fa-check"></i> Create</button>');
		}
	});

	$(document).on('click', '#Fork .btn.fork', function(){
		Fork($('#Fork .username').val(), $('#Fork .reponame').val(), function(data){
		  rename('/repos/' + data.full_name, $('#Fork .newname').val(), function(data){
		    Repos(function(data) {//data is an array of objects, each object is a repo
					$.each(data, function( index, value ) { //iterate through each data(each repo) on the data array
						if(value.name === $('#Fork .username').val() && value.has_pages === false){

						}
					});
				});
			});
		});
	});*/
