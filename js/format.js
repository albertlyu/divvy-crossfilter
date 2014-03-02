// Various formatters.
var formatNumber = d3.format(",d"),
	formatChange = d3.format("+,d"),
	formatDate = d3.time.format("%B %d, %Y"),
	formatTime = d3.time.format("%I:%M %p");

function formatNumberToInt(number) {
	format = d3.format("0,000");
	newNumber = format(Math.round(number))
	return newNumber
}

function formatNumberToPct(number) {
	newNumber = (Math.round(number*1000)/10).toFixed(1)
	return newNumber + "%"
}

function formatNumberToAvg(number) {
	newNumber = (Math.round(number*1000)/10).toFixed(1)
	return newNumber
}

function formatDate(number) {
	format = d3.time.format("%m/%d/%y");
	newNumber = format(number);
	return newNumber
}