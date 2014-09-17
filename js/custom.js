$(document).ready(function(){    
    
    // declare an object literal
    var todo_item = {
        
        // initialize variables with default values
        content         : "",        
        starred         : false,     
        undoStack       : [],
        redoStack       : [],
        
        // initialize the constants
        ENABLED_UNDO_IMAGE_URL     : "images/undo_enabled.png",
		DISABLED_UNDO_IMAGE_URL    : "images/undo_disabled.png",
		ENABLED_REDO_IMAGE_URL     : "images/redo_enabled.png",
		DISABLED_REDO_IMAGE_URL    : "images/redo_disabled.png",
		STAR_IMAGE_URL             : "images/star.png",
        UNSTAR_IMAGE_URL           : "images/unstar.png",
		        
        // functions
        addItem: function(position, content, star, addToUndoStack){
            addItem(position, content, star, addToUndoStack);
        },
        toggleStar: function(element, addToUndoStack){
            toggleStar(element, addToUndoStack);
        },
        editItem: function(element){
            editItem(element);
        },
        markAsDone: function(element, addToUndoStack){        
            markAsDone(element, addToUndoStack);
        },
        renumberItems: function(){        // re-number items after populating from localStorage / marking as done / undo/redo operations
            renumberItems();
        },
        checkLocalStorageBrowserSupport: function(){
            checkLocalStorageBrowserSupport();
        },
        checkLocalStorageExistingData: function(){
            checkLocalStorageExistingData();
        },
        getLocalStorageData: function(){
            getLocalStorageData();
        },
        setLocalStorageData: function(data){
            setLocalStorageData(data);
        },
        undo: function(undoStack){
            undo(undoStack);
        },
        redo: function(redoStack){
            redo(redoStack);
        },
        tweakUI: function(){
            tweakUI();
        }
    };
    
    // setup the UI
    todo_item.checkLocalStorageBrowserSupport();
    todo_item.checkLocalStorageExistingData();
    todo_item.tweakUI();
    todo_item.renumberItems();
    
    // setup event listeners
    $(document).on("click", "#add", function(){           // pass position, text with HTML trimmed (to avoid <script> hacks) and star value (boolean)
		todo_item.addItem($("#todo_items li").size(), $("#new_todo_item").val().replace(/(<([^>]+)>)/ig,""), $("#star").prop('checked'), true);                            
    });
    
    $(document).on("click", ".done",         function(){ todo_item.markAsDone($(this).parent(), true);   });
    $(document).on("click", ".item_content", function(){ todo_item.editItem(this);                       });    
    $(document).on("click", "#undo",         function(){ todo_item.undo(todo_item.undoStack);            });    
    $(document).on("click", "#redo",         function(){ todo_item.redo(todo_item.redoStack);            });
	
	$(document).on("change input propertychange paste", "#new_todo_item", function(){
        if($.trim($("#new_todo_item").val()).length > 0)        // enable add button only when valid text is entered
            $("#add").prop('disabled' , false );
        else
            $("#add").prop('disabled' , true );
    });
        
	var button_number;
	$(document).on("mouseenter", ".done", function(){ 		// on numbered button hover, change button label to "mark as Done"
		button_number = $(this).text();    // copy button number
		$(this).text("Done");
	});
	$(document).on("mouseleave", ".done", function(){ 
		$(this).text(button_number);        // restore button number
	});
	
		
    // custom functions start here
    
    /***************** TWEAK MINOR UI STUFF ***************************/
    function tweakUI(){
        // make teaxtarea height auto-increate and set focus
        $('#new_todo_item').elastic().focus();
        
        // enable iphone-like scrollbar for the list
        $("#todo_list_container").niceScroll({cursorcolor: '#4196c2'});
        
        // manage star clicks
        $(".star, #star").each(function() {
            $(this).hide();
            
            if($(this).is(':checked'))
                var $star_image = $("<img src='"+todo_item.STAR_IMAGE_URL+"' alt='important' title='important' />").insertAfter(this);    
            else
                var $star_image = $("<img src='"+todo_item.UNSTAR_IMAGE_URL+"' alt='not important' title='not important' />").insertAfter(this); 
            
            $star_image.click(function() {
                var $checkbox = $(this).prev();
                $checkbox.prop('checked', !$checkbox.prop('checked'));
                
                if($checkbox.prop("checked")) {
                    $star_image.attr("src", todo_item.STAR_IMAGE_URL);
                    $star_image.attr("alt", "important");
                    $star_image.attr("title", "important");
                } else {
                    $star_image.attr("src", todo_item.UNSTAR_IMAGE_URL);
                    $star_image.attr("alt", "not important");
                    $star_image.attr("title", "important");
                }
                
                if($(this).prev().hasClass("star")) todo_item.toggleStar(this, true);
                
            });
            
        });
        
    }
    
    /***************** CHECK LOCAL STORAGE BROWSER SUPPORT ***********/
    function checkLocalStorageBrowserSupport(){
        if(!window.localStorage) {
            // notify user
            $("#info").text("Your browser does not support the HTML5 feature 'localStorage'. Please use an updated browser for this application to work.");
            // stop
            return false;
        } else
            return true;
    }
    
    /***************** CHECK LOCAL STORAGE EXISTING DATA  **************/
    function checkLocalStorageExistingData(){
        if(localStorage.getItem('todo_items')){
            // fetch data from localStorage
            var todo_items = getLocalStorageData();
            
            // parse
            todo_items.forEach(function(item){
                var CONTENT = 0;        
                var STAR = 1;
                
                var item_content = item[CONTENT];
                var star_check = item[STAR];
                
                var checked = "";
                if(star_check) checked = "checked";
                
                // compose content for new item
                var new_item_content = $("<li>"+
                                         "<button class='done'></button>"+
                                         "<p class='item_content'>"+item_content+"</p>"+
                                         "<input type='checkbox' class='star' "+checked+" />"+
                                         "</li>").append("<hr/>");
                
                // add/append
                $("ul").append(new_item_content.hide());
                
                // animate
                new_item_content.slideDown(500);
                
            });
        }    
    }
    
    /**************************** GET LOCAL STORAGE DATA  **************/
    function getLocalStorageData(){
		// fetch
        var todo_items_json = localStorage.getItem('todo_items');
		// parse
        var todo_items = todo_items_json ? JSON.parse(todo_items_json) : [];
        
        return todo_items;
    }
    
    /**************************** SET LOCAL STORAGE DATA  **************/
    function setLocalStorageData(data){
        localStorage.setItem('todo_items', data);
    }
    
    /**************************** ADD ITEM ******************************/    
    function addItem(position, content, star, addToUndoStack){
        
        //console.log("In addItem: "+position+content+star);
        
        // fetch current items from localStorage
        var todo_items = getLocalStorageData();
        
        // check for duplicate item
        var duplicate = false;
        var original_item_content = "";        // to get the content in proper case
        $.each(todo_items,function(index,item){
            if(content.toLowerCase() === item[0].toLowerCase()){
                duplicate = true;
                original_item_content = item[0];
                
                // cut the loop after detecting duplicate
                return false;
            }
        });
        
        // if new item is a duplicate of an existing item, notify and do not add it
        if(duplicate){
            
            var list_element = $('.item_content').filter(function() {
                return $.trim( $(this).text() ) === original_item_content;
            }).parent();
            
            // scrollTop to show notification
            $("#todo_list_container").animate({ scrollTop: 0 }, 250);
            
            var info_text = "You already have '"+original_item_content+"' in your list!"
            $("#info").text(info_text).hide().slideDown(250).delay(2000).slideUp(250);
            
            // highlight the original item
            $(list_element).effect("highlight", {}, 4000);
            
            return false;
        }
        
        // compose and add new todo item to localStorage
        var new_todo_item = [content,star];
        todo_items.splice(position, 0, new_todo_item);
        
		todo_item.setLocalStorageData(JSON.stringify(todo_items));
        
        // find number of bottom numbered button 
        var new_button_number = position + 1;
        
        // update UI with new todo item
        var checked = "";
        if(star) checked = "checked";
                        
        // compose content for new item
        var new_item_content = $("<li>"+
                                     "<button class='done'>"+new_button_number+"</button>"+
                                     "<p class='item_content'>"+content+"</p>"+
                                     "<input type='checkbox' class='star' "+checked+" style='display: none;'/>"+ 
                                 "</li>").append("<hr/>");
        
        // add/append
        if(position === 0)
            $("ul").prepend(new_item_content.hide());
        else{
            position--;    // because indexing starts from 0
            $("ul li:eq("+position+")").after(new_item_content);
            new_item_content.hide();
        }
        
        // animate
        new_item_content.slideDown(250);
        
        // reset the content of textarea
        $("#new_todo_item").val("");
        
        // disable the add button again
        $("#add").prop('disabled', true);
        
        // unstar
        $("#star").prop('checked', false);
        $("#star").next().attr("src", todo_item.UNSTAR_IMAGE_URL);
        $("#star").next().attr("alt", "not important");
        $("#star").next().attr("title", "not important");
        
        // resize the scrollbar to fit the complete list height
        $("#todo_list_container").getNiceScroll().resize();
        
        if(addToUndoStack){
            // scroll the window to the input textarea
            $("#todo_list_container").animate({ scrollTop: $('#todo_list_container')[0].scrollHeight }, 1000);
            
            // set focus on textbox again
            $("#new_todo_item").focus();

            // add to undo stack
            var todo_item_content = [];            // todo item for undo
            todo_item_content["task"] = "add";
            todo_item_content["text"] = content;
            todo_item_content["star"] = star;
            
            // update undo stack
            todo_item.undoStack.push(todo_item_content);
            
            // enable undo button if disabled
            if($("#undo").is(":disabled")) $("#undo").removeAttr('disabled').prop("src", todo_item.ENABLED_UNDO_IMAGE_URL);
        }

        // manage star clicks for the recently added star
        $(".star").each(function() {

            if($(this).parent().find(".item_content").text() !== content) return;

            //console.log("text: " + $(this).parent().find(".item_content").text());

            $(this).hide();
            
            if($(this).is(':checked'))
                var $star_image = $("<img src='"+todo_item.STAR_IMAGE_URL+"' alt='important' title='important' />").insertAfter(this);    
            else
                var $star_image = $("<img src='"+todo_item.UNSTAR_IMAGE_URL+"' alt='not important' title='not important' />").insertAfter(this); 
            
            $star_image.click(function() {
                var $checkbox = $(this).prev();
                $checkbox.prop('checked', !$checkbox.prop('checked'));
                
                if($checkbox.prop("checked")) {
                    $star_image.attr("src", todo_item.STAR_IMAGE_URL);
                    $star_image.attr("alt", "important");
                    $star_image.attr("title", "important");
                } else {
                    $star_image.attr("src", todo_item.UNSTAR_IMAGE_URL);
                    $star_image.attr("alt", "not important");
                    $star_image.attr("title", "important");
                }
                
                if($(this).prev().hasClass("star")) todo_item.toggleStar(this, true);
                
            });
            
        });
    }
    
    /**************************** RENUMBER ITEMS ***********************/
    function renumberItems(){
        $(".done").each(function(index){
            // change button label according to the item index
            $(this).text(index+1);
        });
    }
    
    /**************************** MARK AS DONE *************************/
    function markAsDone(element, addToUndoStack){
        
        // animate removing the done item
        $(element).slideUp("fast", function(){ 
            // post-animation     
            
            // remove this item from localStorage
            var remove_item_text = $(element).find(".item_content").text();
            
            var todo_items = getLocalStorageData();
            
            var item_index;
            
            $.each(todo_items,function(index,item){
                if(remove_item_text === item[0]){
                    todo_items.splice(index, 1);    // remove 1 item at 'index'
                    item_index = index;
                    return false;
                }
            });
            
			todo_item.setLocalStorageData(JSON.stringify(todo_items));
            
            // remove the <li> item from HTML
            $(element).remove(); 
            
            todo_item.renumberItems();
            
            // if no todo items in the list, set focus to textarea
            if($("#todo_items li").length === 0)
                $("#new_todo_item").focus();
            
            if(addToUndoStack){
                var todo_item_content = [];            // todo item for undo
                todo_item_content["task"] = "done";
                todo_item_content["text"] = remove_item_text;
                todo_item_content["button_number"] = Number(item_index) + 1;
                todo_item_content["star"] = $(element).parent().find(':checkbox').is(':checked');
                //console.log("In done .. added to addToUndoStack: "+todo_item_content["task"]+todo_item_content["text"]+todo_item_content["button_number"]+todo_item_content["star"]);
                
                // update undo stack
                todo_item.undoStack.push(todo_item_content);
                
                if($("#undo").is(":disabled")) $("#undo").removeAttr('disabled').prop("src", todo_item.ENABLED_UNDO_IMAGE_URL);
            }
            
        });        
        
        
    }
    
    /**************************** EDIT ITEM ****************************/
    function editItem(element){
        
        // if no textarea
        if($(element).find('textarea').length === 0) {
            // copy original item content
            var original_text = $(element).text();
            
            // replace it with textarea
            $(element).html("<textarea id='new_data' spellcheck='true'></textarea>");
            
            $('#new_data').elastic();
            
            // set focus and add the copied original item content
            $('#new_data').focus().val(original_text);
            
            // on textarea focusout, update localStorage with edited data
            $('#new_data').on("focusout", function(){
                
                var edited_text = $.trim($("#new_data").val().replace(/(<([^>]+)>)/ig,"")); // trim starting and trailing whitespaces and strip HTML tags   
                
                // update localStorage and UI only when the new data is different than before and not empty
                if( edited_text.length !== 0 && edited_text !== original_text ){
                    
                    // fetch current items from localStorage
                    var todo_items = getLocalStorageData();
                    
                    // check for duplicate item
                    var duplicate = false;
                    $.each(todo_items,function(index,item){
                        if(edited_text.toLowerCase() === item[0].toLowerCase()){
                            duplicate = true;
                            
                            // cut the loop
                            return false;
                        }
                    });
                    
                    // if new item is a duplicate of an existing item, notify and do not add it
                    if(duplicate){
                         // replace textarea with the original text
                        $('#new_data').replaceWith(original_text);
                                               
                        var list_element = $('.item_content').filter(function() {
                            return $.trim( $(this).text() ) === edited_text;
                        }).parent();
                        
                        
                        // notify the user
                        $("#todo_list_container").animate({ scrollTop: 0 }, 250);                       
                   
                        var info_text = "You already have '"+edited_text+"' in your list!"
                        $("#info").text(info_text).hide().slideDown(250).delay(2000).slideUp(250);
                        
                        $(list_element).effect("highlight", {}, 4000);
                        
                        return false;
                        
                    } else{
                        
                        // add new data to the item
                        $.each(todo_items,function(index,item){
                            if(original_text === item[0]){
                                item[0] = edited_text;
                                
                                // cut the loop
                                return false;
                            }
                        });
                    }
                    
                    // update localStorage                
					todo_item.setLocalStorageData(JSON.stringify(todo_items));
                    
                    // replace textarea with the new text
                    $(element).find('textarea').replaceWith(edited_text);                   
                    
                    var todo_item_content = [];
                    todo_item_content["task"] = "edit";
                    todo_item_content["edited_text"] = edited_text;
                    todo_item_content["original_text"] = original_text;
                    
                    // update undo stack
                    todo_item.undoStack.push(todo_item_content);
                    
                    if($("#undo").is(":disabled")) $("#undo").removeAttr('disabled').prop("src", todo_item.ENABLED_UNDO_IMAGE_URL);
                                        
                } else {
                    // replace textarea with the original text
                    $(element).find('textarea').replaceWith(original_text);
                }
                
            });
            
        }
    }
    
    /**************************** TOGGLE STAR **************************/
    function toggleStar(element, pushToUndoStack){
        // fetch this starred item content to locate it in the localStorage
        
        if($(element).parent().find(':checkbox').is(':checked')) {
            $(element).parent().find('img').attr("src", todo_item.STAR_IMAGE_URL);
            $(element).parent().find('img').attr("alt", "important");
            $(element).parent().find('img').attr("title", "important");
        } else {
            $(element).parent().find('img').attr("src", todo_item.UNSTAR_IMAGE_URL);
            $(element).parent().find('img').attr("alt", "not important");
            $(element).parent().find('img').attr("title", "not important");
        }
        
        var starred_item = $(element).parent().find('p').text();
        
        // fetch current items from localStorage
        var todo_items = getLocalStorageData();
        
        // parse to locate 'that' item
        $.each(todo_items,function(index,item){
            if(starred_item.toLowerCase() === item[0].toLowerCase()){
                // toggle starred true/false
                item[1] = !item[1];
                // cut the loop
                return false;
            }
        });
        
        // update localStorage                
		todo_item.setLocalStorageData(JSON.stringify(todo_items));
        
        if(pushToUndoStack){
            
            var todo_item_content = [];
            todo_item_content["task"] = "toggleStar";
            todo_item_content["button_number"] = $(element).parent().find('button').text();
            todo_item_content["value"] = $(element).parent().find('.star').prop('checked');

            //console.log("going to undo stack: " + $(element).parent().find('.star').prop('checked'));
            
            // update undo stack
            todo_item.undoStack.push(todo_item_content);
            
            if($("#undo").is(":disabled")) $("#undo").removeAttr('disabled').prop("src", todo_item.ENABLED_UNDO_IMAGE_URL);
            
        }
    }
    
    /**************************** UNDO *********************************/
    function undo(undoStack){
        
        // get the undo task
        var undo_item = undoStack.pop();
        
        /*
        undo/redo mapping:
        
        undo toggleStar -> redo toggleStar
        undo edit -> redo edit
        undo add -> redo done
        undo done -> redo add        
        */
        
        switch(undo_item["task"]){
                
            case "toggleStar":
                
                // update UI
                $("ul li:nth-child("+undo_item["button_number"]+")").find('.star').prop('checked', !undo_item["value"]);
                
                // toggle star
                todo_item.toggleStar($("ul li:nth-child("+undo_item["button_number"]+")").find('.star'), false);
                
                // push to redoStack
                undo_item["value"] = !undo_item["value"];
                
                break;
                
            case "edit":
                
                // update UI
                $( ".item_content:contains('"+undo_item["edited_text"]+"')" ).text(undo_item["original_text"]);
                
                // update localStorage
                var todo_items = getLocalStorageData();
                
                // parse to locate 'that' item
                $.each(todo_items,function(index,item){
                    if(undo_item["edited_text"].toLowerCase() === item[0].toLowerCase()){
                        // toggle starred true/false
                        item[0] = undo_item["original_text"];
                        // cut the loop
                        return false;
                    }
                });
				todo_item.setLocalStorageData(JSON.stringify(todo_items));
                
                
                // update undo_item item to push to redoStack
                
                // swap original_text and edited_text
                var temp = undo_item["edited_text"];
                undo_item["edited_text"] = undo_item["original_text"];
                undo_item["original_text"] = temp;
                
                break;
                
            case "add":
                
                var list_element = $('.item_content').filter(function() {
                    return $.trim( $(this).text() ) === undo_item["text"];
                }).parent();
                
                todo_item.markAsDone(list_element, false);
                
                undo_item["task"] = "done";
                undo_item["button_number"] = $( ".item_content:contains('"+undo_item["text"]+"')" ).parent().find('button').text();  // .prev() not working
                undo_item["star"] = $( ".item_content:contains('"+undo_item["text"]+"')" ).parent().find('.star').is(':checked');
                
                break;
                
            case "done":
                
                undo_item["button_number"]--;
                
                todo_item.addItem(undo_item["button_number"], undo_item["text"], undo_item["star"], false);

                //console.log("in undo done.." + undo_item["star"]);
                
                todo_item.renumberItems();
                
                undo_item["task"] = "add";
                undo_item["button_number"]++;
                
                break;
        }
        
        // push to redoStack
        todo_item.redoStack.push(undo_item);
        
        // enable redo button
        if($("#redo").is(":disabled")) $("#redo").removeAttr('disabled').prop("src", todo_item.ENABLED_REDO_IMAGE_URL);
            
        // disable undo button if stack is empty
        if(undoStack.length === 0) $("#undo").attr('disabled','disabled').prop("src", todo_item.DISABLED_UNDO_IMAGE_URL);
                        
        
    }
    
    /**************************** REDO *********************************/
    function redo(redoStack){
        
        // get the redo task
        var redo_item = redoStack.pop();
        
        switch(redo_item["task"]){
            case "toggleStar": 
                
                // update UI
                $("ul li:nth-child("+redo_item["button_number"]+")").find('.star').prop('checked', !redo_item["value"]);
                
                // toggle star
                todo_item.toggleStar($("ul li:nth-child("+redo_item["button_number"]+")").find('.star'), false);
                
                // push to undoStack
                redo_item["value"] = !redo_item["value"];
                
                break;
                
            case "edit": 
                
                // update UI
                $( ".item_content:contains('"+redo_item["edited_text"]+"')" ).text(redo_item["original_text"]);
                
                // update localStorage
                var todo_items = getLocalStorageData();
                
                // parse to locate 'that' item
                $.each(todo_items,function(index,item){
                    if(redo_item["edited_text"].toLowerCase() === item[0].toLowerCase()){
                        // toggle starred true/false
                        item[0] = redo_item["original_text"];
                        // cut the loop
                        return false;
                    }
                });
				todo_item.setLocalStorageData(JSON.stringify(todo_items));
                
                // push to redoStack
                // swap original_text and edited_text
                var temp = redo_item["edited_text"];
                redo_item["edited_text"] = redo_item["original_text"];
                redo_item["original_text"] = temp;
                
                break;
                
            case "done": 
                
                redo_item["button_number"]--;
                todo_item.addItem(redo_item["button_number"], redo_item["text"], redo_item["star"], false);
                redo_item["task"] = "add";
                redo_item["button_number"]++;
                
                break;
                
            case "add": 
                
                var list_element = $('.item_content').filter(function() {
                    return $.trim( $(this).text() ) === redo_item["text"];
                }).parent();
                
                todo_item.markAsDone(list_element, false);

                redo_item["task"] = "done";
                
                break;
        }
        
        // add task back to undoStack
        todo_item.undoStack.push(redo_item);
        
        // enable undo button
        if($("#undo").is(":disabled")) $("#undo").removeAttr('disabled').prop("src", todo_item.ENABLED_UNDO_IMAGE_URL);
        
        // disable redo button if no tasks in the stack
        if(redoStack.length === 0) $("#redo").attr('disabled','disabled').prop("src", todo_item.DISABLED_REDO_IMAGE_URL);
        
    }
    
    
});