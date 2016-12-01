/**
 * Created by costModel.
 * User: jlharri
 * Date: 5/6/11
 * Time: 3:50 PM
 * To change this template use File | Settings | File Templates.
 */

/**
 * UIForm contains the UI model of the form.
 *
 * UIForm Fields: TYPE	ID	TEXT	TEXT_CLASS	INPUT_CLASS	CALCULATION
 *
 * Type : [section numInput Calculation ]
 * id : Unique identifier for field
 * text : free-form text for field
 * text_class : [section numInput Calculation]
 * input_class : [<null> smallNum percent bigNum]
 * calc : string containing calculation for field
 * concat : 
 * 
 */

// Global to control whether to enable saving cache
var gCacheOn = true;
var UIForm = "global";
var gLoadXML = false;
var gLoadValues = false;

if (gLoadXML) 
    loadUIModel_XML(function(xml) {UIForm = $.xml2json(xml);});
else
    loadUIModel_JSON(function(jsonObj) {UIForm = jsonObj;});

// Utility function: value or zero
function check_value(val) {
    return gLoadValues? val : 0;
}

function hide_loading() {
  $('#loading').hide();
}

function show_loading() {
  $('#loading').show();
}

// section
//   subsectionhdr
//     subsection
//       rowhdr
//         rowdata
//           rowdata
//

var section = {
   parentHook: "",  // class of parent element onto which a new section hooks
   myHook: "section",  // class of section element onto which children are hooked
   numSections: 0,
   
   setParentHook: function (hook) {
     this.parentHook = hook;
     return;
   },
   
   getMyHook: function () {
     var o = $("."+this.myHook+":last");
     return (typeof(o[0]) == 'undefined' ? null : o[0]);
   },
   
   newMarkup: function(row) {
     this.numSections++;
     return '<fieldset class="'+this.myHook+' '+rowhdr.parentHook+'" title="Tab '+this.numSections+'" '+
			    'id="'+this.numSections+'">'+ 
                            '<legend>'+row.text[0]+'</legend></fieldset>';
   },
   
   insert: function(row) {
     var markup = this.newMarkup(row);
     $("."+this.parentHook+":last").append(markup);
   }
};


var subsectionhdr = {
   parentHook: section.myHook,  // class of parent element onto which a new subsectionhdr hooks
   myHook: "subsectionhdr",  // class of section element onto which children are hooked
   
   getMyHook: function () {
     var o = $("."+this.myHook+":last");
     return (typeof(o[0]) == 'undefined' ? null : o[0]);
   },
   
   newMarkup: function(row) {
     return '<div class="'+this.myHook+'"></div>'
   },
   
   insert: function(row) {
     var markup = this.newMarkup(row);
     $("."+this.parentHook+":last").append(markup);
   }
};

var subsection = {
   parentHook: subsectionhdr.myHook,  // class of parent element onto which a new subsection hooks
   myHook: "subsection",  // class of section element onto which children are hooked
   numSubSections: 0,
   
   getMyHook: function () {
     var o = $("."+this.myHook+":last");
     return (typeof(o[0]) == 'undefined' ? null : o[0]);
   },
   
   newMarkup: function(row) {
     this.numSubSections++;
     return '<h3><a href="#">'+row.text[0]+'</a></h3><div class="'+this.myHook+' '+rowhdr.parentHook+'"></div>';
   },
   
   insert: function(row) {
     // Determine if there's a subsectionhdr element created in the last section
     // If not, then create a subsectionhdr first
     var subsectionhdrObj = $('.'+subsectionhdr.parentHook+':last .'+subsectionhdr.myHook+':last')[0];
     if (subsectionhdrObj == undefined) {
	 subsectionhdr.insert(row);
     }
    
     var markup = this.newMarkup(row);
     $("."+this.parentHook+":last").append(markup);
   }
};

// rowhdr.parentHook needs to be used when creating rowhdr parent elements to handle multiple inheritance in a non-OO system
// <tr>...
var rowhdr = {
   parentHook: "rowhdrparent",  // class of parent element onto which a new row hooks
   myHook: "rowhdr",  // class of section element onto which children are hooked
   //lastTable: null,    // last <table>
   //lastRow: [],   // last <tr> created
   
   getMyHook: function () {
     var o = $("."+this.myHook+":last");
     return (typeof(o[0]) == 'undefined' ? null : o[0]);
   },
   
   newMarkup: function(row) {
     return '<tr class="'+this.myHook+'"></tr>';
   },
   
   // TODO: break out insertTable into datahdr or something like that - JLH, June 2011
   insertTable: function(row) {
     //this.lastTable = $('.'+this.parentHook+':last');
     $('.'+this.parentHook+':last').append('<table><tbody class="'+this.parentHook+'"></tbody></table>');
     return;
   },
   
   insert: function(row) {
     // Determine if there's a table element created in the :last :rowheaderparent
     // If not, then create a table first
     var tableObj = $('div.'+this.parentHook+':last table:last')[0];
     if (tableObj == undefined) {
	 this.insertTable(row);
     }
     var markup = this.newMarkup(row);
     $("."+this.parentHook+":last").append(markup);
     //this.lastTable.append(markup);
     //this.lastRow = $('tr', this.lastTable);
   }
};

var rowdata = {
   parentHook: "rowhdr",  // class of parent element onto which a new row hooks
   myHook: "rowdata",  // class of section element onto which children are hooked
   fSelect: false,
   fLastRowConcat: false,
   nCellNum: 0,
   
   // logic for col structure:
   // If lastRowConcat is true or currRowConcat is true, use array element [1];
   //    If lastRowConcat is true, use array element [1][1]
   //    Else use array element [1][0]
   // Else, use array element [0][0]
   col: [ [ {col1: "col4-1", col2: "col4-2"} ], 
	  [ {col1: "col4-1", col2: "col4-2"}, {col1: "col4-3", col2: "col4-4"}]
        ],
   
   newCellId: function (prefix) {
    if (prefix == undefined) prefix = 'ZZ';
    return prefix+(++this.nCellNum);
   },
   
   getMyHook: function () {
     var o = $("."+this.myHook+":last");
     return (typeof(o[0]) == 'undefined' ? null : o[0]);
   },
   
   insert: function(row) {
     var markup = "";
     var colCls, fCurrRowConcat;
     
     if (!this.fLastRowConcat && !this.fSelect)
	 rowhdr.insert(row);
     
     // if this.fSelect, then don't use col4 or col4...simply cycle through <option>'s
     if (!this.fSelect) {
	    fCurrRowConcat = (row.concat == "yes");
	    // tip: +(boolean) => 0 (false) or 1 (true)
	    colCls = this.col[+(this.fLastRowConcat||fCurrRowConcat)][+(this.fLastRowConcat)];
	    markup += '<td class="'+colCls.col1+'"> </td> <td class="'+colCls.col2+'"></td>';
	    $("."+this.parentHook+':last').append(markup);
            this.fLastRowConcat = (row.concat == "yes");
     } else
        colCls = this.col[0][0];
     this._insertRowData(row, colCls);
   },
   
// Markup for all the various data types: numInput, calc, select, option, endSelect
   _insertRowData: function (row, colCls) {
     var col1 = $("."+colCls.col1+':last'); // <td>
     var col2 = $("."+colCls.col2+':last'); // <td>
     var trLast = $("tr:last");
//     var trLast = rowhdr.lastRow;
     var txt;
     
     var col1Markup = "", col2Markup = "";
     var helpMarkup = "";
     
     if (col1 == undefined || col2 == undefined)
	return; // error
            
     if (typeof(row.text) == "undefined" || row.text[0] == undefined)
        txt = "";
     else
        txt = row.text[0];
    
     if (typeof(row.help) != 'undefined')
        helpMarkup = newHelpMarkup(row.help);
       
     switch (row.type) {
	case 'unitcost': 
	    var s = $(".rowhdr:last");
            var newCell1 = this.newCellId(), newCell2 = this.newCellId(), newCell3 = this.newCellId();
	    
	    if (typeof(row.text) == "undefined" || row.text[0] == undefined) {
                col1.append('<input class="userInput cell" id="CELL_'+newCell3+'" type="text" value=" "></input>'+helpMarkup);    
            } else {
                col1.addClass('sum1').append(row.text[0]+helpMarkup);
            }
	    col2.removeClass(function() {return col2.attr('class');});
	    col2.addClass('sum2').addClass('numInput').addClass("data")
	             .append('Cost/Unit: <input class="smallNum numInput cell" '+
			     'type="text" id="CELL_'+newCell1+'" value="0"></input>');
	    // copy of numInput markup
	    s.append('<td class="sum2 numInput data">Quantity: <input class="smallNum numInput cell" '+
		     'type="text" id="CELL_'+newCell2+'" value="0"></input>');
	    // copy of numCalc markup
	    s.append('<td class="numCalc smallNum data">Total: <input disabled="disabled" style="border: none;" '+
		     'title="='+newCell1+'*'+newCell2+'" type="text" id="CELL_'+row.id+'" '+
		     'value="'+check_value(row.value)+'" '+ 'class="cell currency '+row.inputClass+' '+row.type+'"></input></td>');
	    break;
	
	case 'numInput': 
//	    if (row.textClass == "hidden")
                col1.addClass(row.textClass);
            col1.append(txt+helpMarkup);
	    col2.addClass(row.type).addClass(row.inputClass).addClass("data").append(
			  '<input type="text" title="'+check_value(row.value)+'" id="CELL_'+row.id+'" value="'+check_value(row.value)+'" '+
                          'class="'+row.inputClass+' '+row.type+'"></input>');
	    break;
            
        case 'numCalc': 
//	    if (row.textClass == "hidden")
                col1.addClass(row.textClass);
	    col1.append(txt+helpMarkup);
            col2.addClass(row.type).addClass(row.inputClass).addClass("data").append(
			'<input disabled="disabled" style="border: none;" title="'+row.calc+'" '+
			'type="text" id="CELL_'+row.id+'" value="'+check_value(row.value)+'" '+
                        'class="cell '+row.inputClass+' '+row.type+'"></input>');
	    break;
	
	case 'label': 
            col1.append(txt+helpMarkup).addClass(row.type).addClass(row.textClass);
            col1.attr('COLSPAN', '2');
            col2.addClass("hidden");
	    break;
            
        case 'select':  // selectStart
            this.fSelect = true;
	    col1.append(txt+helpMarkup);
	    col2.addClass(row.type).append(
                        '<div class="selectDiv"><div class="box"><div class="value">'+
                        '<select class="selectTag" title="'+txt+'">'+
                        '<option>-No Selection-</option>');
            break;
            
        case 'option':
//	    col2.append('<option>'+row.text[0]+'</option>');
	    $('select.selectTag:last').append('<option>'+txt+'</option>');
            break;
            
        case 'endSelect':
            this.fSelect = false;
            break;
     };
     return; 
    }
};

// first round to 2 decimal places
// then format percentages if element has "percent" class
// if not percentage, then fix to 2 decimal places except if there is no decimal
function formatNumbers () {
    $("input.numInput").add("input.numCalc").add("input.unitcost").each(function () {
        var n, txt;
        if ($(this).hasClass('numInput'))
            n = parseFloat($(this).attr('title'));
        else
            n = parseFloat($(this).attr('value'));
        if (isNaN(n)) return;
        n = Math.round(100*n);
        if ($(this).hasClass('percent'))
            $(this).attr('value', n.toFixed(0)+"%");            
        else {
            n = n/100;
            //if (n == Math.round(n))
            if (n == 0)
                txt = n;
            else
                txt = n.toFixed(2);
        if ($(this).hasClass('currency'))
            txt = '$'+txt;
        $(this).attr('value', txt);
        }
    });
}

// defunct
//function formatPercentages() {
//    $("input.percent.numInput").each(function() {
//        var n=parseFloat($(this).attr('title'));
//        $(this).attr('value', n*100+"%");
//    });
//    $("input.percent.numCalc").each(function() {
//        var n=parseFloat($(this).attr('value'));
//        $(this).attr('value', n*100+"%");
//    });
//};
         
// forceNumeric() plug-in implementation
jQuery.fn.forceNumeric = function () {
    return this.each(function () {
        $(this).keydown(function (e) {
            var key = e.which || e.keyCode;

            if (!e.shiftKey && !e.altKey && !e.ctrlKey &&
                // numbers   
                key >= 48 && key <= 57 ||
                // Numeric keypad
                key >= 96 && key <= 105 ||
                // comma, period and minus
                key == 190 || key == 188 || key == 109 ||
                // Backspace and Tab and Enter
                key == 8 || key == 9 || key == 13 ||
                // Home and End
                key == 35 || key == 36 ||
                // left and right arrows
                key == 37 || key == 39 ||
                // Del and Ins
                key == 46 || key == 45)
                return true;

            return false;
        });
    });
}

function test_chunks() {
    var str;
    build_cache("input");
    str = JSON.stringify(cells_cache);
    save_cookie_chunks("test", str);
    restore_cookie_chunks('test');
    
}
function save_cookie_chunks(prefix, str) {
    var l = 0, h, cname;
    var chunk = 350;
    var new_str = str.replace(/,/g, '\\,');
    var len = new_str.length;
    var iters = Math.floor(len/chunk) + (len%chunk == 0 ? 0 : 1);
    for (var i = 0; i< iters; i++) {
        cname = prefix+i;
        h = chunk;
        if (new_str[l+h-1] == '\\')
            h--;
        $.cookie(cname, new_str.substring(l, l+h-1), {raw: true, expires: 14});
//        $.cookie(cname, new_str.substr(l, h-1), {raw: true, expires: 14});
        l += h-1;
    }
}

function restore_cookie_chunks(prefix) {
   var str = "", ts, i = 0;
   var wFlag = true;
   while (wFlag) {
    ts = $.cookie(prefix+i);
    if (ts == null)
        wFlag = false;
    else 
        str += ts;
    i++;
   }
   return str.replace(/\\/g,'');
}

function read_cookie_chunks(prefix) {
    
}

function build_and_save_cache() {
    var str;
    build_cache("input");
    str = JSON.stringify(cells_cache);
    if (str == undefined) return;
    // now store in cookie
//    $.cookie('cells_cache', str, {expires: 14});
    save_cookie_chunks('cells', str);
    
    // Now save values for all <select> options
    var val_cache = [];
    $(".selectTag").each( function (indx, valOfEl) {
      var rVal;
      if (jQuery.browser.msie == undefined)
        rVal = $(this).linkselect('val');
      else
        rVal = valOfEl.value;
      if (rVal != undefined && typeof(rVal) == 'string')
        val_cache.push(rVal);
    });
    str = JSON.stringify(val_cache);
    $.cookie("select_cache", str, {expires: 14});
    return;
};

function restore_cache() {
    var str = undefined;
    var out = [], i = 0;
    // get str from cookie
//    str = $.cookie("cells_cache");
    str = restore_cookie_chunks('cells');
    if (str != undefined && typeof(str) == "string" && str != "") 
        try {
            jQuery.each(JSON.parse(str), function( cell, value) { set_cell_value(cell, value);});
        } catch (err) { }
    
    // Now restore values for all <select> options
    str = $.cookie("select_cache");
    if (str == "" || !str) return;
    out = JSON.parse(str);
    $(".selectTag").each( function () { $(this).linkselect('val', out[i++]);});
};

function show_hidden() {
    $('.hidden').each( function () {$(this).removeClass('hidden');});
}

function CreateUIForm(eId) {

    var numSections = 0, eSection = "";
    var numSubSections = 0, fSubSectionHeader = true;
    var row, newMarkup = "", fTableHdr = true;
    var output, optCount = 0, selectRow = undefined;

    section.setParentHook(eId);
    
    for (var i = 0; i< UIForm.UIElement.length; i++) {
        row = UIForm.UIElement[i];
        if (typeof(row) == 'undefined') continue;
        if (typeof(row.value) == 'undefined') row.value = 0.0;
        
        // Process row type
        switch (row.type) {
            case 'section': 
              section.insert(row);
              break;
            
            case 'subsection':
              subsection.insert(row);
              break;
            
            default:  // numInput, numCalc, select, option, endSelect, sum
	      rowdata.insert(row);              
              break;
        }
    }
    
    
    // activate accordion
    $('.'+subsectionhdr.myHook).accordion({ autoHeight: false});

    // activate custom link selection
    $("select.selectTag").linkselect();

//    if (null) {
    $('#tabs').stepy({
        titleClick:    true
    });
//    };
   
   hide_loading();
   setTimeout(setup_part2, 500);
   return;
}
    
function setup_part2() {
    
    //remove title from fieldsets to avoid unnecessary tooltips
    $("fieldset[title]").each( function () {
        $(this).removeAttr('title');
    });
    
    // activate tooltip
    $(".help, img[title]").tooltip({position: 'top right', opacity: 0.7});
    
    // restrict numInput fields to numeric input only
    $(".numInput").forceNumeric();
    
    // attach onBlur events
    $(".numInput").add(".numCalc").blur( function () {
        var txt = this.value;
        this.title = txt.replace(/,/g,'');
        evaluate_cells("input");
        formatNumbers();
      return;
    });
    
    $(".userInput").blur( function () {
        this.title = this.value;
    });
        
    if (gCacheOn) {
        //test_chunks();
        restore_cache();
        // save the values as cookies every 15 seconds or so
        setInterval( build_and_save_cache, 15000);
    }
    
    $(".numInput").add(".numCalc").focus( function() {
        this.value = this.title;
        return;
    
    });
    // calc all values and re-format percentages
    show_loading();
    evaluate_cells("input");
    formatNumbers();
    hide_loading();
    return;
}
 
function newHelpMarkup(text) {
    return '   <img width="30" height="20" class="help" src="images/small_question_mark.jpg" title="'+text+'" />';
}
