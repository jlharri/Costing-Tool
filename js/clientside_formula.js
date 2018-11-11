var cell_errors = {};

function evaluate_cell(cell_id) {
	this_ = $('#CELL_' + cell_id);
	try {
		_new_value = formula_single_cell_value(cell_id);

		this_.removeClass('cell_error');
		cell_errors[cell_id] = '';
		if (this_[0].nodeName == "INPUT")
			$(this_).attr('value', _new_value);  // uncomment for CostingModel
		else
			$(this_).html(_new_value);
	} catch (_error) {
		this_.addClass('cell_error');
		cell_errors[cell_id] = _error;
		var _formula = $('#CELL_' + cell_id).attr('title');
		if (this_[0].nodeName == "INPUT")
			$(this_).attr('value', "Err");  //uncomment for CostingModel
		else
			$(this_).html(_formula);
	};
};

function is_array(obj) { return obj.constructor.toString().indexOf("Array") != -1; };

function formula_eval(_formula) {
	if (_formula.match(/^=/)) {
		/* check safety */
		if (!_formula.match(/^=["A-Za-z0-9\.\(\)\*/:+-]+$/)) { throw ('Formula has unsafe characters'); }
		if (_formula.match(/(\/\*|\/\/)/)) { throw ('Formula has unsafe characters // or /*'); }

		var strings = (_formula.replace(/".*?"/g, '') + ' ').match(/[a-z]{3,}/gi);
		if (strings) {
			for (var i = 0; i < strings.length; i++) {
				if (!strings[i].match(/^(SUM|MAX|MIN|AVG)$/)) {
					throw ('Formula has unknown string: "' + strings[i] + '"');
				};
			};
		};

		// A1 -> formula_single_cell_value('A1')
		_eval_formula = _formula.replace(/\b([A-Z]{1,2}[0-9]{1,3})\b/g, 'formula_single_cell_value(\'$1\')');

		// A1:C1 -> formula_single_cell_value('A1'):formula_single_cell_value('C1') -> formula_range_value('A1','C1')
		_eval_formula = _eval_formula.replace(/\bformula_single_cell_value\(\'([A-Z]{1,2}[0-9]{1,3})\'\):formula_single_cell_value\(\'([A-Z]{1,2}[0-9]{1,3})\'\)/g, 'formula_range_value(\'$1\', \'$2\')');


		// SUM( -> formula_sum(
		_eval_formula = _eval_formula.replace(/\bSUM\(/g, 'formula_sum(');

		// AVG( -> formula_avg(
		//		_eval_formula = _eval_formula.replace(/\bAVG\(/g, 'formula_avg('); 

		// MAX( -> formula_max(
		//		_eval_formula = _eval_formula.replace(/\bMAX\(/g, 'formula_max('); 

		// MIN( -> formula_min(
		//		_eval_formula = _eval_formula.replace(/\bMIN\(/g, 'formula_min('); 

		_eval_formula = _eval_formula.replace(/^=/, '');

		// evaluate
		var _new_value = '';
		try {
			_new_value = eval(_eval_formula);
			if (is_array(_new_value)) {
				_new_value = _new_value.join(',');
			};
		} catch (err) {
			throw ('Can not evaluate formula.' /*+ _eval_formula + err*/);
		};
		return _new_value;
	} else {
		return _formula; // raw text
	};

};

function formula_sum(x) {
	if (!is_array(x)) { return parseFloat(x); };
	var ret = 0;
	for (var i = 0; i < x.length; i++) {
		if (parseFloat(x[i])) {
			ret += parseFloat(x[i]);
		};
	};
	return ret;
};

function formula_avg(x) {
	var cnt = 0;
	if (!is_array(x)) { return parseFloat(x); };
	var ret = 0;
	for (var i = 0; i < x.length; i++) {
		if (parseFloat(x[i])) {
			ret += parseFloat(x[i]);
			cnt++;
		};
	};
	return Math.round((ret / cnt) * 100) / 100;
};

function formula_max(x) {
	var ret = null;
	for (var i = 0; i < x.length; i++) {
		if (parseFloat(x[i])) {
			if ((parseFloat(x[i]) > ret) || (ret == null)) {
				ret = parseFloat(x[i]);
			};
		};
	};
	return Math.round(ret * 100) / 100;
};

function formula_min(x) {
	var ret = null;
	for (var i = 0; i < x.length; i++) {
		if (parseFloat(x[i])) {
			if ((parseFloat(x[i]) < ret) || (ret == null)) {
				ret = parseFloat(x[i]);
			};
		};
	};
	return Math.round(ret * 100) / 100;
};

function formula_range_value(cell1, cell2) {
	var letter1 = cell1.match(/^([A-Z]+)/)[0].charCodeAt(0);
	var letter2 = cell2.match(/^([A-Z]+)/)[0].charCodeAt(0);
	var x = [];
	var num1 = parseInt(cell1.match(/([0-9]+)$/)[0]);
	var num2 = parseInt(cell2.match(/([0-9]+)$/)[0]);
	for (var i = letter1; (i <= letter2) && (i <= 90); i++) {
		for (var j = num1; j <= num2; j++) {
			x.push(formula_single_cell_value(String.fromCharCode(i) + j));
		};
	};
	return x;
};

hits = 0;
calcs = 0;

function formula_single_cell_value(cell_id) {
	calcs++;
	if (cells_cache[cell_id] == 'calculating_34#43') { throw ('Cyclic reference (A depends on B, while B depends on A)'); };
	if (cells_cache[cell_id]) { hits++; window.status = 'Stats: Cache hits: ' + hits + '; total calcs: ' + calcs; return cells_cache[cell_id]; };

	if (!cell_id.match(/^[A-Z]{1,2}[0-9]+$/)) {
		cells_cache[cell_id] = '';
		return '';
	};
	var _formula = $('#CELL_' + cell_id).attr('title');
	if (_formula == null) { return ''; };
	if (_formula.match(/^([0-9]+\.[0-9]*|[0-9]*\.[0-9]+)$/)) { // is float
		return parseFloat(_formula);
	};
	if (_formula.match(/^([0-9]+)$/)) { // is float
		return parseInt(_formula);
	};

	cells_cache[cell_id] = 'calculating_34#43';
	cells_cache[cell_id] = formula_eval(_formula);
	return cells_cache[cell_id];
	//return '[error]';
};

var cells_cache = {};

function evaluate_cells() {
	cells_cache = {};
	$('td.cell').each(function () {
		evaluate_cell(this.id.replace(/^CELL_/, ''));
	});
};

function evaluate_cells(elName) {
	cells_cache = {};
	$(elName + '.cell').each(function () {
		evaluate_cell(this.id.replace(/^CELL_/, ''));
	});
};

function build_cache(elName) {
	var val, cell_id;
	cells_cache = {};
	$(elName + '.cell').add(elName + '.numInput').each(function () {
		cell_id = this.id.replace(/^CELL_/, '');
		val = formula_single_cell_value(cell_id);
		cells_cache[cell_id] = val;
		return;
	});
}

// set_cell_value only sets new value for non-formula cells
function set_cell_value(cell_id, value) {
	var el = $('#CELL_' + cell_id);
	if (el != undefined &&
		typeof (el.attr('title')) == 'string')
		if (!el.attr('title').match(/^=/))
			el.attr('value', value).attr('title', value);
};
