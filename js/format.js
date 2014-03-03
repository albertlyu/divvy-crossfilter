// Various formatters.
var formatNumber = d3.format(",d"),
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

function getDayOfWeek(time) {
	var weekday = new Array();
	weekday[0] = "Sunday";
	weekday[1] = "Monday";
	weekday[2] = "Tuesday";
	weekday[3] = "Wednesday";
	weekday[4] = "Thursday";
	weekday[5] = "Friday";
	weekday[6] = "Saturday";
	dayOfWeek = weekday[time.getDay()];
	return dayOfWeek
}

function getMonthOfYear(time) {
	var month = new Array();
	month[0] = "January";
	month[1] = "February";
	month[2] = "March";
	month[3] = "April";
	month[4] = "May";
	month[5] = "June";
	month[6] = "July";
	month[7] = "August";
	month[8] = "September";
	month[9] = "October";
	month[10] = "November";
	month[11] = "December";
	monthOfYear = month[time.getMonth()];
	return monthOfYear
}
